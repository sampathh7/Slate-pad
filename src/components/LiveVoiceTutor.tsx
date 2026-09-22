import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Radio, 
  Share2, 
  AlertCircle, 
  Send,
  Camera,
  X,
  MessageSquare,
  HelpCircle,
  Pencil
} from 'lucide-react';

interface LiveVoiceTutorProps {
  isOpen: boolean;
  onClose: () => void;
  getCanvasImage: () => string | null;
  topic?: string;
  question?: string;
  onOpenAutoDraw?: (prompt?: string) => void;
}

// Convert Float32Array audio samples into 16-bit PCM Little-Endian Base64 string
function float32ToPCM16Base64(input: Float32Array): string {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Decode Base64 16-bit PCM into Float32Array
function pcm16Base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

export default function LiveVoiceTutor({
  isOpen,
  onClose,
  getCanvasImage,
  topic,
  question,
  onOpenAutoDraw,
}: LiveVoiceTutorProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isBoardShared, setIsBoardShared] = useState(false);
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const [textInput, setTextInput] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef(false);

  isMutedRef.current = isMuted;

  // Cleanup all audio and WebSocket connections
  const cleanup = () => {
    // Stop all active playing sources
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') {
      try {
        outputAudioCtxRef.current.close();
      } catch (e) {}
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    setStatus('idle');
    setInputVolume(0);
    setOutputVolume(0);
  };

  // Start live session
  const startLiveSession = async () => {
    cleanup();
    setStatus('connecting');
    setErrorMessage(null);

    try {
      // 1. Get user mic stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Setup Input Audio Context (16kHz for Gemini Live input)
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }

      // 3. Setup Output Audio Context (24kHz for Gemini Live output)
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      outputAudioCtxRef.current = outputCtx;
      if (outputCtx.state === 'suspended') {
        await outputCtx.resume();
      }

      // 4. Setup WebSocket to backend Live proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        // If there is context (topic or question), send introductory prompt
        if (topic || question) {
          const intro = `Hello tutor! I am practicing "${topic || 'General Practice'}". ${
            question ? `My current drill question is: "${question}".` : ''
          } Let's discuss it!`;
          ws.send(JSON.stringify({ text: intro }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setErrorMessage(data.error);
            setStatus('error');
            return;
          }

          if (data.interrupted) {
            // User spoke over tutor -> immediately stop ongoing audio playback
            activeSourcesRef.current.forEach((src) => {
              try {
                src.stop();
                src.disconnect();
              } catch (e) {}
            });
            activeSourcesRef.current = [];
            nextStartTimeRef.current = 0;
            setStatus('listening');
            setOutputVolume(0);
            return;
          }

          if (data.audio && outputAudioCtxRef.current) {
            setStatus('speaking');
            const outCtx = outputAudioCtxRef.current;
            const float32 = pcm16Base64ToFloat32(data.audio);

            // Compute visualizer output volume
            let sum = 0;
            for (let i = 0; i < float32.length; i += 10) {
              sum += Math.abs(float32[i]);
            }
            setOutputVolume(Math.min(100, Math.round((sum / (float32.length / 10)) * 400)));

            const audioBuffer = outCtx.createBuffer(1, float32.length, 24000);
            audioBuffer.getChannelData(0).set(float32);

            const source = outCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outCtx.destination);

            const currentTime = outCtx.currentTime;
            if (nextStartTimeRef.current < currentTime) {
              nextStartTimeRef.current = currentTime + 0.04;
            }

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;

            activeSourcesRef.current.push(source);
            source.onended = () => {
              activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
              if (activeSourcesRef.current.length === 0) {
                setStatus('listening');
                setOutputVolume(0);
              }
            };
          }
        } catch (err) {
          console.error('[Live Voice Client] Message parse error:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[Live Voice Client] WebSocket error:', err);
        setErrorMessage('Could not connect to Live Audio Service.');
        setStatus('error');
      };

      ws.onclose = () => {
        if (status !== 'error') {
          setStatus('idle');
        }
      };

      // 5. Connect Microphone to ScriptProcessor for 16kHz PCM streaming
      const sourceNode = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (e) => {
        if (isMutedRef.current) {
          setInputVolume(0);
          return;
        }

        const inputChannelData = e.inputBuffer.getChannelData(0);

        // Calculate input mic volume level for UI visualizer
        let sum = 0;
        for (let i = 0; i < inputChannelData.length; i += 8) {
          sum += Math.abs(inputChannelData[i]);
        }
        const avg = sum / (inputChannelData.length / 8);
        setInputVolume(Math.min(100, Math.round(avg * 400)));

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64Pcm = float32ToPCM16Base64(inputChannelData);
          wsRef.current.send(JSON.stringify({ audio: base64Pcm }));
        }
      };

      sourceNode.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);
    } catch (err: any) {
      console.error('[Live Voice Client] Init error:', err);
      setErrorMessage(err?.message || 'Microphone access denied or audio initialization failed.');
      setStatus('error');
    }
  };

  useEffect(() => {
    if (isOpen) {
      startLiveSession();
    } else {
      cleanup();
    }
    return () => {
      cleanup();
    };
  }, [isOpen]);

  // Send chalkboard image snapshot to the live tutor session
  const handleSendBoardSnapshot = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const canvasDataUrl = getCanvasImage();
    if (!canvasDataUrl) return;

    wsRef.current.send(
      JSON.stringify({
        image: canvasDataUrl,
        text: "Here is a snapshot of my handwritten slate chalkboard. What do you think?",
      })
    );
    setIsBoardShared(true);
    setTimeout(() => setIsBoardShared(false), 2500);
  };

  // Send quick text message to Live tutor
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ text: textInput.trim() }));
    setTextInput('');
  };

  if (!isOpen) return null;

  return (
    <div 
      id="liveVoiceTutorOverlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-[#182821] border border-[#E8C468]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#F5F1E6]/10 flex items-center justify-between bg-[#1C2B24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8C468]/20 border border-[#E8C468]/40 flex items-center justify-center text-[#E8C468] relative">
              <Radio className={`w-5 h-5 ${status === 'speaking' || status === 'listening' ? 'animate-pulse text-[#8FBF8A]' : ''}`} />
              {(status === 'speaking' || status === 'listening') && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#8FBF8A] rounded-full ring-2 ring-[#182821] animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-hand font-bold text-2xl text-[#E8C468] tracking-wide leading-none">
                  Slate Live Voice Tutor
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#E8C468]/15 text-[#E8C468] border border-[#E8C468]/30">
                  gemini-3.1-flash-live
                </span>
              </div>
              <p className="text-xs text-[#F5F1E6]/60 mt-0.5">
                Real-time bi-directional voice conversation & handwriting guidance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#F5F1E6]/50 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Audio Visualizer Body */}
        <div className="p-6 flex flex-col items-center justify-center gap-5">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#213A30] border border-[#F5F1E6]/10 text-xs font-medium">
            {status === 'connecting' && (
              <>
                <div className="w-2 h-2 rounded-full bg-[#E8C468] animate-ping" />
                <span className="text-[#E8C468]">Connecting to Gemini Live API…</span>
              </>
            )}
            {status === 'connected' && (
              <>
                <div className="w-2 h-2 rounded-full bg-[#8FBF8A]" />
                <span className="text-[#8FBF8A]">Connected • Start speaking anytime</span>
              </>
            )}
            {status === 'speaking' && (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#8FBF8A] animate-bounce" />
                <span className="text-[#8FBF8A] font-semibold">Tutor is speaking…</span>
              </>
            )}
            {status === 'listening' && (
              <>
                <Mic className="w-3.5 h-3.5 text-[#E8C468] animate-pulse" />
                <span className="text-[#F5F1E6]">Listening to your voice…</span>
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-[#E2725B]" />
                <span className="text-[#E2725B]">Connection Error</span>
              </>
            )}
            {status === 'idle' && (
              <>
                <div className="w-2 h-2 rounded-full bg-[#F5F1E6]/40" />
                <span className="text-[#F5F1E6]/60">Call ended</span>
              </>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="w-full bg-[#E2725B]/15 border border-[#E2725B]/30 text-[#E2725B] p-3 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Live Session Error</p>
                <p className="opacity-90">{errorMessage}</p>
                <button
                  onClick={startLiveSession}
                  className="mt-2 px-3 py-1 bg-[#E2725B] text-white rounded-lg text-[11px] font-medium hover:opacity-90"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}

          {/* Central Animated Audio Orb */}
          <div className="relative flex items-center justify-center my-2">
            {/* Outer pulsating wave rings */}
            <div 
              className={`absolute w-36 h-36 rounded-full border border-[#E8C468]/20 transition-all duration-200 ${
                status === 'speaking' || status === 'listening' ? 'scale-125 opacity-60' : 'scale-100 opacity-20'
              }`}
              style={{
                transform: `scale(${1 + Math.max(inputVolume, outputVolume) / 150})`,
                borderColor: status === 'speaking' ? '#8FBF8A' : '#E8C468'
              }}
            />
            <div 
              className={`absolute w-28 h-28 rounded-full border border-[#8FBF8A]/30 transition-all duration-150 ${
                status === 'speaking' ? 'scale-110 opacity-75' : 'scale-95 opacity-25'
              }`}
            />

            {/* Core Orb */}
            <div 
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 ${
                status === 'speaking'
                  ? 'bg-gradient-to-tr from-[#254B3B] to-[#3C735B] ring-4 ring-[#8FBF8A]/40 text-[#8FBF8A]'
                  : status === 'listening'
                  ? 'bg-gradient-to-tr from-[#3D3418] to-[#5C4D22] ring-4 ring-[#E8C468]/40 text-[#E8C468]'
                  : 'bg-[#213A30] text-[#F5F1E6]/40'
              }`}
            >
              {status === 'speaking' ? (
                <Volume2 className="w-10 h-10 animate-pulse" />
              ) : isMuted ? (
                <MicOff className="w-10 h-10 text-[#E2725B]" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </div>
          </div>

          {/* Real-time Waveform Bars */}
          <div className="flex items-center gap-1.5 h-8 px-4 py-1 bg-[#14201A] rounded-full border border-[#F5F1E6]/10">
            {[12, 24, 40, 65, 85, 95, 80, 55, 35, 18, 45, 75, 30].map((baseHeight, i) => {
              const activeLevel = status === 'speaking' ? outputVolume : inputVolume;
              const dynamicHeight = Math.max(
                4,
                Math.min(28, (baseHeight / 100) * (activeLevel > 5 ? activeLevel * 0.35 : 6))
              );
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    status === 'speaking'
                      ? 'bg-[#8FBF8A]'
                      : activeLevel > 10
                      ? 'bg-[#E8C468]'
                      : 'bg-[#F5F1E6]/20'
                  }`}
                  style={{ height: `${dynamicHeight}px` }}
                />
              );
            })}
          </div>

          {/* Active Context Banner */}
          {(topic || question) && (
            <div className="w-full bg-[#213A30] border border-[#F5F1E6]/10 rounded-2xl p-3 text-xs text-[#F5F1E6]/80 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] text-[#E8C468] font-medium">
                <span>Active Board Context</span>
                {topic && <span className="font-mono">{topic}</span>}
              </div>
              {question && (
                <p className="text-[#F5F1E6] font-medium line-clamp-2">
                  "{question}"
                </p>
              )}
            </div>
          )}

          {/* Quick Prompts */}
          <div className="w-full flex items-center gap-2 overflow-x-auto pb-1">
            {[
              "Can you check what I'm writing?",
              "Explain the next step simply",
              "Why is this formula used?",
              "Give me a hint"
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ text: prompt }));
                  }
                }}
                disabled={status !== 'connected' && status !== 'speaking' && status !== 'listening'}
                className="px-3 py-1.5 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6]/75 hover:text-[#F5F1E6] border border-[#F5F1E6]/10 text-[11px] whitespace-nowrap shrink-0 transition-colors disabled:opacity-40"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Text Message Fallback */}
          <form onSubmit={handleSendText} className="w-full flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type a question to speak about…"
              disabled={status !== 'connected' && status !== 'speaking' && status !== 'listening'}
              className="flex-1 bg-[#14201A] border border-[#F5F1E6]/15 rounded-xl px-3.5 py-2 text-xs text-[#F5F1E6] placeholder-[#F5F1E6]/40 focus:outline-none focus:border-[#E8C468]"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || (status !== 'connected' && status !== 'speaking' && status !== 'listening')}
              className="p-2 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#E8C468] border border-[#F5F1E6]/15 disabled:opacity-40"
              title="Send text"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Action Toolbar Footer */}
        <div className="p-4 bg-[#1C2B24] border-t border-[#F5F1E6]/10 flex items-center justify-between gap-3">
          {/* Share Slate Board & Auto Draw Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="shareSlateToLiveBtn"
              onClick={handleSendBoardSnapshot}
              disabled={status !== 'connected' && status !== 'speaking' && status !== 'listening'}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
                isBoardShared
                  ? 'bg-[#8FBF8A] text-[#14201A] border-[#8FBF8A]'
                  : 'bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6] border-[#F5F1E6]/15 hover:border-[#E8C468]/40'
              } disabled:opacity-40`}
              title="Send current chalkboard drawing to Live voice tutor"
            >
              <Camera className="w-4 h-4 text-[#E8C468]" />
              <span>{isBoardShared ? 'Slate Shared!' : 'Share Slate Frame'}</span>
            </button>

            {onOpenAutoDraw && (
              <button
                id="liveAutoDrawBtn"
                onClick={() => {
                  const drawPrompt = question 
                    ? `Draw diagram explaining: ${question}` 
                    : `Draw diagram explaining ${topic || 'current concept'}`;
                  onOpenAutoDraw(drawPrompt);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border bg-[#213A30] hover:bg-[#2A473B] text-[#81D4FA] border-[#81D4FA]/30 hover:border-[#81D4FA]/60 transition-all"
                title="Order AI to draw on slate"
              >
                <Pencil className="w-4 h-4 text-[#81D4FA]" />
                <span className="hidden sm:inline">Draw on Slate</span>
              </button>
            )}
          </div>

          {/* Center Mic Mute Toggle */}
          <div className="flex items-center gap-2">
            <button
              id="muteLiveMicBtn"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl border transition-all ${
                isMuted
                  ? 'bg-[#E2725B]/20 text-[#E2725B] border-[#E2725B]/40 hover:bg-[#E2725B]/30'
                  : 'bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6] border-[#F5F1E6]/15'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              id="endLiveVoiceCallBtn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-[#E2725B] hover:bg-[#D15F47] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#E2725B]/20 transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
