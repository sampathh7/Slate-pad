import React, { useState, useEffect } from 'react';
import { 
  Pencil, 
  Sparkles, 
  X, 
  Play, 
  FastForward, 
  Zap, 
  Layers, 
  Mic, 
  MicOff, 
  HelpCircle, 
  Compass, 
  Atom, 
  TrendingUp, 
  Smile, 
  BookOpen,
  CheckCircle2,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';
import { AutoDrawResult } from '../types';

interface AutoDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDrawing: (result: AutoDrawResult, options: { animated: boolean; speed: number; clearBoard: boolean }) => void;
  topic?: string;
  question?: string;
  initialPrompt?: string;
  hasExistingStrokes?: boolean;
}

const PRESET_PROMPTS = [
  {
    category: 'Mathematics',
    icon: TrendingUp,
    color: '#81D4FA',
    items: [
      'Parabola y = x² - 4 with vertex and axis',
      'Right triangle with Pythagorean theorem labels (a² + b² = c²)',
      'Unit circle with 30°, 45°, 60° angle coordinates',
      'Bell curve normal distribution graph with standard deviations',
      'Step-by-step algebra proof solving 2x + 6 = 18'
    ]
  },
  {
    category: 'Science',
    icon: Atom,
    color: '#E8C468',
    items: [
      'Bohr atom model with nucleus and 3 electron orbits',
      'Water cycle diagram with sun, clouds, rain, and ocean',
      'Plant cell structure with nucleus, vacuole, and cell wall',
      'Convex lens light ray diagram with focal point F',
      'Earth layers: crust, mantle, outer core, inner core'
    ]
  },
  {
    category: 'Creative & Diagrams',
    icon: Smile,
    color: '#8FBF8A',
    items: [
      'Cute cartoon cat face with whiskers and ears',
      'Space rocket flying past moon and stars',
      'Cozy mountain cabin with pine trees and sun',
      'Medieval castle fortress with flags and towers',
      'Treasure map island with compass rose and X mark'
    ]
  }
];

export default function AutoDrawModal({
  isOpen,
  onClose,
  onStartDrawing,
  topic,
  question,
  initialPrompt,
  hasExistingStrokes = false,
}: AutoDrawModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<'animated' | 'instant'>('animated');
  const [speed, setSpeed] = useState<number>(2); // 1x, 2x, 4x
  const [clearBoard, setClearBoard] = useState<boolean>(!hasExistingStrokes);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (initialPrompt) {
        setPrompt(initialPrompt);
      } else if (question && !prompt) {
        setPrompt(`Draw diagram solving: ${question}`);
      } else if (topic && topic !== 'Quadratic Equations' && !prompt) {
        setPrompt(`Draw a diagram explaining ${topic}`);
      }
    }
  }, [isOpen, initialPrompt, question, topic]);

  if (!isOpen) return null;

  // Speech recognition for dictating drawing orders
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setPrompt(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleOrderDrawing = async (customPrompt?: string) => {
    const targetPrompt = (customPrompt || prompt).trim();
    if (!targetPrompt) {
      setErrorMessage('Please type or choose what you want the AI to draw on the slate.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auto-draw-slate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetPrompt,
          topic: topic || '',
          question: question || '',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data: AutoDrawResult = await res.json();
      if (!data.strokes || data.strokes.length === 0) {
        throw new Error('AI could not generate strokes for this order. Please try a different prompt.');
      }

      onStartDrawing(data, {
        animated: drawMode === 'animated',
        speed,
        clearBoard,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to order drawing:', err);
      setErrorMessage(err.message || 'Failed to order AI drawing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="autoDrawModalOverlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        id="autoDrawModalContent"
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#182821] to-[#121F19] border-2 border-[#E8C468]/30 shadow-2xl shadow-black/80 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E8C468]/15 flex items-center justify-between bg-[#15231D]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E8C468] to-[#E2725B] flex items-center justify-center text-[#182821] shadow-lg shadow-[#E8C468]/20 font-bold">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-hand font-bold text-[#F5F1E6] tracking-wide flex items-center gap-2">
                Order AI to Draw on Slate
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8C468]/20 text-[#E8C468] font-sans font-semibold uppercase tracking-wider">
                  Chalk Robot
                </span>
              </h2>
              <p className="text-xs text-[#F5F1E6]/70">
                Ask Gemini to sketch diagrams, math curves, scientific models, or doodles directly on the chalkboard
              </p>
            </div>
          </div>

          <button
            id="closeAutoDrawModalBtn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#213A30] hover:bg-[#2C4C3F] text-[#F5F1E6]/80 flex items-center justify-center transition-all hover:scale-105"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Prompt Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#E8C468] flex items-center justify-between">
              <span>What should the AI draw on your chalkboard?</span>
              <span className="text-[11px] text-[#F5F1E6]/50">Math, Science, Diagrams, Art</span>
            </label>

            <div className="relative flex items-center">
              <input
                id="autoDrawPromptInput"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleOrderDrawing();
                  }
                }}
                placeholder="e.g., Draw an atom model with orbits, Parabola graph, Cute cat..."
                className="w-full px-4 py-3.5 pr-24 rounded-2xl bg-[#0F1B15] border border-[#E8C468]/30 text-[#F5F1E6] placeholder-[#F5F1E6]/40 focus:outline-none focus:border-[#E8C468] focus:ring-2 focus:ring-[#E8C468]/20 text-sm shadow-inner transition-all"
                disabled={isLoading}
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2 rounded-xl border transition-all ${
                    isListening
                      ? 'bg-red-500 text-white border-red-400 animate-pulse'
                      : 'bg-[#213A30] text-[#E8C468] border-[#E8C468]/30 hover:bg-[#2C4C3F]'
                  }`}
                  title="Dictate drawing order"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  id="submitAutoDrawBtn"
                  onClick={() => handleOrderDrawing()}
                  disabled={isLoading || !prompt.trim()}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#E8C468] to-[#E2725B] text-[#182821] font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#182821]" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draw</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#0F1B15]/60 border border-[#E8C468]/20">
            {/* Draw Mode */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#F5F1E6]/70 uppercase tracking-wider block">
                Drawing Style
              </label>
              <div className="flex rounded-xl bg-[#1C2E26] p-1 border border-[#E8C468]/20">
                <button
                  type="button"
                  onClick={() => setDrawMode('animated')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    drawMode === 'animated'
                      ? 'bg-[#E8C468] text-[#182821] shadow-sm font-bold'
                      : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6]'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>Watch AI Draw</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawMode('instant')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    drawMode === 'instant'
                      ? 'bg-[#E8C468] text-[#182821] shadow-sm font-bold'
                      : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6]'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Instant</span>
                </button>
              </div>
            </div>

            {/* Animation Speed (if animated) */}
            <div className={`space-y-1.5 ${drawMode === 'instant' ? 'opacity-40 pointer-events-none' : ''}`}>
              <label className="text-[11px] font-semibold text-[#F5F1E6]/70 uppercase tracking-wider block">
                Chalk Speed
              </label>
              <div className="flex rounded-xl bg-[#1C2E26] p-1 border border-[#E8C468]/20">
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      speed === s
                        ? 'bg-[#81D4FA] text-[#0F1B15] shadow-sm'
                        : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6]'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Board Canvas Action */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#F5F1E6]/70 uppercase tracking-wider block">
                Board Placement
              </label>
              <div className="flex rounded-xl bg-[#1C2E26] p-1 border border-[#E8C468]/20">
                <button
                  type="button"
                  onClick={() => setClearBoard(true)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    clearBoard
                      ? 'bg-[#E2725B] text-white shadow-sm font-bold'
                      : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6]'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clean Slate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClearBoard(false)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    !clearBoard
                      ? 'bg-[#8FBF8A] text-[#0F1B15] shadow-sm font-bold'
                      : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6]'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>Append</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {errorMessage}
            </div>
          )}

          {/* One-Click Example Suggestions */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Popular Chalkboard Templates (Click to Draw)</span>
            </h3>

            <div className="space-y-3">
              {PRESET_PROMPTS.map((group) => {
                const IconComponent = group.icon;
                return (
                  <div key={group.category} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: group.color }}>
                      <IconComponent className="w-3.5 h-3.5" />
                      <span>{group.category}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setPrompt(item);
                            handleOrderDrawing(item);
                          }}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-xl bg-[#1C2E26] hover:bg-[#253E33] border border-[#E8C468]/20 hover:border-[#E8C468]/50 text-xs text-[#F5F1E6]/90 transition-all text-left flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 disabled:opacity-40"
                        >
                          <Pencil className="w-3 h-3 opacity-60 shrink-0" style={{ color: group.color }} />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8C468]/15 bg-[#15231D]/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#F5F1E6]/60">
            <Sparkles className="w-4 h-4 text-[#E8C468]" />
            <span>AI generates chalk strokes with authentic blackboard physics & sound</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleOrderDrawing()}
              disabled={isLoading || !prompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C468] to-[#E2725B] text-[#182821] font-bold text-xs shadow-lg shadow-[#E8C468]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Planning Chalk Strokes...</span>
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  <span>Draw on Slate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
