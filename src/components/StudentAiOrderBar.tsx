import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  Square, 
  X,
  Volume2
} from 'lucide-react';
import { ChildAgeBracket } from '../types';

interface StudentAiOrderBarProps {
  topic: string;
  activeQuestion?: string;
  isDrawing: boolean;
  onExecuteCommand: (commandText: string) => Promise<void>;
  onStopDrawing?: () => void;
  isProcessing?: boolean;
  onClose?: () => void;
  ageBracket?: ChildAgeBracket;
}

const AGE_QUICK_ORDERS: Record<ChildAgeBracket, Array<{ icon: string; label: string; prompt: string }>> = {
  '6-7': [
    { icon: '⭐', label: 'Draw 5 Shiny Stars', prompt: 'Draw 5 bright yellow stars on the chalkboard and count them aloud' },
    { icon: '🍕', label: 'Draw Pizza Halves', prompt: 'Draw a round pizza and cut it into 2 equal halves on the chalkboard' },
    { icon: '🍎', label: 'Draw 4 Apples', prompt: 'Draw 4 apples on the slate and write 2 + 2 = 4' },
    { icon: '🔺', label: 'Draw Triangle & Square', prompt: 'Draw a neat triangle and square with labels on the chalkboard' },
    { icon: '🪄', label: 'Help Me Solve with Chalk', prompt: 'Solve this question step by step with cheerful chalk drawings' },
  ],
  '8-9': [
    { icon: '🍕', label: 'Draw 3/4 Pizza', prompt: 'Draw a pizza divided into 4 slices with 3/4 shaded in chalk' },
    { icon: '✖️', label: 'Times Table Array', prompt: 'Draw a 4 by 6 dot array on the slate to demonstrate 4 × 6 = 24' },
    { icon: '📐', label: 'Draw Rectangle Perimeter', prompt: 'Draw a rectangle labeled length 6, width 4 and calculate perimeter' },
    { icon: '🪄', label: 'Solve Step-by-Step', prompt: 'Solve this problem step by step on the chalkboard with chalk notes' },
    { icon: '💡', label: 'Explain Step 1', prompt: 'Explain the first step to solve this question with chalk notes' },
  ],
  '10-12': [
    { icon: '⚖️', label: 'Pre-Algebra Balance', prompt: 'Show the algebraic balance method step-by-step on the chalkboard' },
    { icon: '🧮', label: 'Fraction Addition Steps', prompt: 'Solve fraction addition with common denominator on the chalkboard' },
    { icon: '📐', label: 'Right Triangle & Hypotenuse', prompt: 'Draw a right-angle triangle with legs 3 and 4 and solve for hypotenuse' },
    { icon: '🪄', label: 'Complete Chalk Derivation', prompt: 'Write the complete step-by-step mathematical proof and explanation on the chalkboard' },
    { icon: '💡', label: 'Key Formula & Pitfalls', prompt: 'Write the key formula and common mistake pitfalls to watch out for' },
  ],
};

export default function StudentAiOrderBar({
  topic,
  activeQuestion,
  isDrawing,
  onExecuteCommand,
  onStopDrawing,
  isProcessing = false,
  onClose,
  ageBracket = '8-9',
}: StudentAiOrderBarProps) {
  const [commandInput, setCommandInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const quickOrders = AGE_QUICK_ORDERS[ageBracket] || AGE_QUICK_ORDERS['8-9'];

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setCommandInput(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoice = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. You can type your order below!');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (commandInput.trim()) {
        handleSubmitOrder(commandInput);
      }
    } else {
      setCommandInput('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  const handleSubmitOrder = async (textToSubmit?: string) => {
    const text = (textToSubmit || commandInput).trim();
    if (!text || isProcessing || isDrawing) return;

    setCommandInput('');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    await onExecuteCommand(text);
  };

  return (
    <div 
      id="studentAiOrderController"
      className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-2 transition-all animate-in fade-in slide-in-from-top-2"
    >
      <div className="bg-[#122019]/98 backdrop-blur-xl border-2 border-[#81D4FA]/50 rounded-2xl p-3 sm:p-4 shadow-2xl transition-all">
        {/* Top Header with title, Stop button, and Close button */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#81D4FA]">
            <div className="w-5 h-5 rounded-md bg-[#81D4FA]/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <span>AI Voice & Chalk Assistant (Professor Chalk)</span>
          </div>

          <div className="flex items-center gap-2">
            {isDrawing && onStopDrawing && (
              <button
                onClick={onStopDrawing}
                className="px-2.5 py-1 rounded-lg bg-[#E2725B]/20 hover:bg-[#E2725B]/30 text-[#FF8A80] border border-[#E2725B]/40 text-xs font-bold flex items-center gap-1 transition-all animate-pulse"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop AI Writing</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[#F5F1E6]/60 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Voice & Text Command Input Box */}
        <div className="flex items-center gap-2">
          {/* Big Chunky Microphone Button for Kids */}
          <button
            id="studentVoiceMicBtn"
            type="button"
            onClick={handleToggleVoice}
            disabled={isProcessing || isDrawing}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shrink-0 ${
              isListening
                ? 'bg-[#E2725B] text-white shadow-lg shadow-[#E2725B]/40 animate-pulse scale-105'
                : 'bg-gradient-to-r from-[#81D4FA] to-[#8FBF8A] text-[#121F19] hover:from-[#a0e0fd] hover:to-[#a9d8a5] shadow-md shadow-[#81D4FA]/20 hover:scale-105 active:scale-95'
            } disabled:opacity-40`}
            title={isListening ? 'Listening… click to send' : 'Speak to AI Chalkboard Teacher'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Listening…</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>🎙️ Speak</span>
              </>
            )}
          </button>

          {/* Quick Input Bar */}
          <div className="relative flex-1">
            <input
              id="studentCommandInput"
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitOrder();
              }}
              disabled={isProcessing || isDrawing}
              placeholder={
                isListening
                  ? 'Listening to your voice…'
                  : 'Ask AI: "Solve step by step", "Draw pizza slices", "Explain step 1"…'
              }
              className="w-full bg-[#182821] border border-[#81D4FA]/30 focus:border-[#81D4FA] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F5F1E6] placeholder-[#F5F1E6]/40 focus:outline-none transition-colors"
            />
          </div>

          {/* Send Order Button */}
          <button
            id="sendStudentOrderBtn"
            type="button"
            onClick={() => handleSubmitOrder()}
            disabled={!commandInput.trim() || isProcessing || isDrawing}
            className="px-3.5 py-2 bg-[#81D4FA] hover:bg-[#a0e0fd] text-[#121F19] rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95 shrink-0"
            title="Send to AI"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isProcessing ? 'Thinking…' : 'Ask AI'}</span>
          </button>
        </div>

        {/* Quick Order Chips for Instant One-Tap Orders */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#81D4FA]/70 shrink-0">
            Quick Asks:
          </span>
          {quickOrders.map((order, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSubmitOrder(order.prompt)}
              disabled={isProcessing || isDrawing}
              className="shrink-0 px-2.5 py-1 rounded-xl bg-[#182821] hover:bg-[#22382E] text-[#F5F1E6]/90 hover:text-[#81D4FA] border border-[#81D4FA]/20 hover:border-[#81D4FA]/50 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 shadow-sm"
            >
              <span>{order.icon}</span>
              <span>{order.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
