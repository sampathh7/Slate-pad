import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  BookOpen, 
  Calculator, 
  Lightbulb, 
  AlertTriangle, 
  Layers, 
  Zap, 
  HelpCircle 
} from 'lucide-react';
import { ChildAgeBracket } from '../types';
import { CHILD_AGE_CONFIGS } from '../utils/agePresets';

interface AnimatedExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeQuestion?: string;
  topic?: string;
  ageBracket: ChildAgeBracket;
  onSelectAgeBracket: (bracket: ChildAgeBracket) => void;
  mistakes?: Array<{ id: string; question: string; mistakeSnippet?: string }>;
  onStartAnimatedExplanation: (problem: string, customAge?: ChildAgeBracket) => Promise<void>;
  isLoading: boolean;
}

const SAMPLE_ANIMATED_PROBLEMS: Record<ChildAgeBracket, string[]> = {
  '6-7': [
    'Draw 8 stars. Cross out 3. How many stars are left?',
    'There are 4 apples in a basket and 3 on the table. How many apples in total?',
    'Divide a chalk pizza into 2 equal halves and color one half.',
  ],
  '8-9': [
    'Draw a pizza divided into 4 equal slices and shade 3/4.',
    'Solve: 24 divided by 4 using a visual grouping diagram.',
    'A rectangle has length 6 units and width 3 units. Find its perimeter and area.',
  ],
  '10-12': [
    'Solve for x: 3x + 7 = 22 using a balance scale model.',
    'Calculate 2/3 + 1/4 using common denominators and a fraction bar.',
    'A triangle has a base of 8 cm and height of 5 cm. Calculate its area.',
  ],
};

export default function AnimatedExplanationModal({
  isOpen,
  onClose,
  activeQuestion = '',
  topic = '',
  ageBracket,
  onSelectAgeBracket,
  mistakes = [],
  onStartAnimatedExplanation,
  isLoading,
}: AnimatedExplanationModalProps) {
  const [selectedProblem, setSelectedProblem] = useState<string>(activeQuestion || '');
  const [customProblemInput, setCustomProblemInput] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<ChildAgeBracket>(ageBracket);

  useEffect(() => {
    if (activeQuestion) {
      setSelectedProblem(activeQuestion);
    }
  }, [activeQuestion]);

  useEffect(() => {
    setSelectedAge(ageBracket);
  }, [ageBracket]);

  if (!isOpen) return null;

  const currentAgeConfig = CHILD_AGE_CONFIGS[selectedAge] || CHILD_AGE_CONFIGS['8-9'];
  const sampleProblems = SAMPLE_ANIMATED_PROBLEMS[selectedAge] || SAMPLE_ANIMATED_PROBLEMS['8-9'];

  const handleLaunch = async () => {
    const finalProblem = (customProblemInput.trim() || selectedProblem).trim();
    if (!finalProblem) return;

    onSelectAgeBracket(selectedAge);
    await onStartAnimatedExplanation(finalProblem, selectedAge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-[#14231C] border border-[#E8C468]/30 rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(232, 196, 104, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F5F1E6]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E8C468]/20 border border-[#E8C468]/40 flex items-center justify-center text-[#E8C468]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-hand text-2xl sm:text-3xl font-bold text-[#F5F1E6]">
                AI Animated Blackboard Explanation
              </h2>
              <p className="text-xs text-[#E8C468]/80 font-medium">
                100% pedagogical accuracy • Real-time chalk animation • Synchronized teacher narration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6]/70 hover:text-[#F5F1E6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Age Level Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Student Age & Rigor Level</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['6-7', '8-9', '10-12'] as ChildAgeBracket[]).map((bracket) => {
              const cfg = CHILD_AGE_CONFIGS[bracket];
              const isSelected = selectedAge === bracket;
              return (
                <button
                  key={bracket}
                  type="button"
                  onClick={() => setSelectedAge(bracket)}
                  className={`p-2 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-[#2A473B] border-[#8FBF8A] text-[#F5F1E6] ring-1 ring-[#8FBF8A]/50 shadow-md'
                      : 'bg-[#182821] border-[#F5F1E6]/10 text-[#F5F1E6]/60 hover:bg-[#213A30]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{cfg.label}</span>
                    <span className="text-[10px] text-[#8FBF8A]">{cfg.grades}</span>
                  </div>
                  <p className="text-[10px] opacity-70 line-clamp-1 mt-0.5">
                    {cfg.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Problem / Question Choice */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#81D4FA] flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            <span>Choose Problem to Animate</span>
          </label>

          {activeQuestion && (
            <button
              type="button"
              onClick={() => {
                setSelectedProblem(activeQuestion);
                setCustomProblemInput('');
              }}
              className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-2.5 ${
                selectedProblem === activeQuestion && !customProblemInput
                  ? 'bg-[#213A30] border-[#E8C468] text-[#F5F1E6] ring-1 ring-[#E8C468]/40'
                  : 'bg-[#182821] border-[#F5F1E6]/10 text-[#F5F1E6]/70 hover:bg-[#213A30]'
              }`}
            >
              <div className="p-1 rounded-lg bg-[#E8C468]/20 text-[#E8C468] shrink-0 mt-0.5">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E8C468]/20 text-[#E8C468]">
                    Active Drill
                  </span>
                  {topic && (
                    <span className="text-[10px] text-[#F5F1E6]/50">
                      Topic: {topic}
                    </span>
                  )}
                </div>
                <p className="font-hand text-base font-bold text-[#F5F1E6] mt-0.5">
                  {activeQuestion}
                </p>
              </div>
            </button>
          )}

          {/* Sample Problems for Current Age */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#F5F1E6]/60">
              Or pick an accurate curriculum sample for {currentAgeConfig.label}:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {sampleProblems.map((prob) => {
                const isPicked = selectedProblem === prob && !customProblemInput;
                return (
                  <button
                    key={prob}
                    type="button"
                    onClick={() => {
                      setSelectedProblem(prob);
                      setCustomProblemInput('');
                    }}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                      isPicked
                        ? 'bg-[#213A30] border-[#81D4FA] text-[#81D4FA] font-bold'
                        : 'bg-[#182821] border-[#F5F1E6]/10 text-[#F5F1E6]/80 hover:bg-[#213A30]'
                    }`}
                  >
                    <span className="truncate pr-2">{prob}</span>
                    {isPicked && <CheckCircle2 className="w-3.5 h-3.5 text-[#81D4FA] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mistakes from Error Bank if available */}
          {mistakes.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-[#E2725B] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Or fix a mistake from your error notebook:</span>
              </span>
              <div className="grid grid-cols-1 gap-1.5 max-h-28 overflow-y-auto">
                {mistakes.slice(0, 3).map((m) => {
                  const isPicked = selectedProblem === m.question && !customProblemInput;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedProblem(m.question);
                        setCustomProblemInput('');
                      }}
                      className={`w-full p-2 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                        isPicked
                          ? 'bg-[#213A30] border-[#E2725B] text-[#E2725B] font-bold'
                          : 'bg-[#182821] border-[#F5F1E6]/10 text-[#F5F1E6]/80 hover:bg-[#213A30]'
                      }`}
                    >
                      <span className="truncate">{m.question}</span>
                      {isPicked && <CheckCircle2 className="w-3.5 h-3.5 text-[#E2725B] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Question Input */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-semibold text-[#F5F1E6]/60">
              Or type any custom problem:
            </span>
            <input
              type="text"
              value={customProblemInput}
              onChange={(e) => setCustomProblemInput(e.target.value)}
              placeholder="e.g. Solve 4x - 8 = 20 or Divide 15 by 3 with circles"
              className="w-full bg-[#182821] border border-[#F5F1E6]/20 rounded-xl px-3 py-2 text-xs text-[#F5F1E6] placeholder-[#F5F1E6]/40 focus:outline-none focus:border-[#E8C468] transition-colors"
            />
          </div>
        </div>

        {/* 4 Stages Preview Box */}
        <div className="bg-[#182821] border border-[#F5F1E6]/10 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8FBF8A]">
            <Layers className="w-3.5 h-3.5" />
            <span>AI Animation Workflow (4 Stages)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[#213A30]/60 border border-[#F5F1E6]/10">
              <span className="text-base">📝</span>
              <p className="text-[11px] font-bold text-[#F5F1E6] mt-1">1. Setup & Given</p>
              <p className="text-[9px] text-[#F5F1E6]/50">Boxed facts & unknown</p>
            </div>
            <div className="p-2 rounded-xl bg-[#213A30]/60 border border-[#F5F1E6]/10">
              <span className="text-base">📐</span>
              <p className="text-[11px] font-bold text-[#81D4FA] mt-1">2. Visual Model</p>
              <p className="text-[9px] text-[#F5F1E6]/50">Diagram & core law</p>
            </div>
            <div className="p-2 rounded-xl bg-[#213A30]/60 border border-[#F5F1E6]/10">
              <span className="text-base">⚙️</span>
              <p className="text-[11px] font-bold text-[#F5F1E6] mt-1">3. Derivation</p>
              <p className="text-[9px] text-[#F5F1E6]/50">Step-by-step algebra</p>
            </div>
            <div className="p-2 rounded-xl bg-[#213A30]/60 border border-[#F5F1E6]/10">
              <span className="text-base">✅</span>
              <p className="text-[11px] font-bold text-[#8FBF8A] mt-1">4. Verification</p>
              <p className="text-[9px] text-[#F5F1E6]/50">Proof check & answer</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6] text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            id="startAnimatedExplanationBtn"
            type="button"
            onClick={handleLaunch}
            disabled={(!selectedProblem && !customProblemInput.trim()) || isLoading}
            className="px-5 py-2.5 rounded-xl bg-[#E8C468] text-[#182821] hover:bg-[#f0d182] font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-40 shadow-lg shadow-[#E8C468]/20"
          >
            <Zap className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing Animation…' : '🚀 Start Blackboard Animation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
