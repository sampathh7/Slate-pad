import React, { useState } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  Minimize2, 
  Maximize2,
  BookOpen,
  HelpCircle
} from 'lucide-react';

export interface StepExplanationItem {
  stepNumber: number;
  title: string;
  expression?: string;
  explanation: string;
  intuitionRule?: string;
  stage?: 'setup' | 'concept_diagram' | 'derivation' | 'verification';
}

interface ChalkboardStepExplainerCardProps {
  problem: string;
  domain?: string;
  finalAnswer?: string;
  steps: StepExplanationItem[];
  activeStepIndex: number;
  onChangeStepIndex: (index: number) => void;
  onReplayStep?: (index: number) => void;
  onClose: () => void;
}

const STAGE_THEMES: Record<string, { label: string; color: string; icon: string }> = {
  setup: { label: '1. Problem Setup', color: '#81D4FA', icon: '📝' },
  concept_diagram: { label: '2. Visual Intuition', color: '#E8C468', icon: '📐' },
  derivation: { label: '3. Math Derivation', color: '#FFB74D', icon: '⚙️' },
  verification: { label: '4. Verified Answer', color: '#8FBF8A', icon: '✅' },
};

export default function ChalkboardStepExplainerCard({
  problem,
  domain = 'Mathematics',
  finalAnswer,
  steps,
  activeStepIndex,
  onChangeStepIndex,
  onReplayStep,
  onClose,
}: ChalkboardStepExplainerCardProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!steps || steps.length === 0) return null;

  const currentStep = steps[activeStepIndex] || steps[0];
  const stageInfo = currentStep.stage ? STAGE_THEMES[currentStep.stage] || { label: currentStep.title, color: '#E8C468', icon: '💡' } : { label: `Step ${currentStep.stepNumber}`, color: '#E8C468', icon: '💡' };

  const handleSpeakCurrentStep = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const narrationText = `Step ${currentStep.stepNumber}: ${currentStep.title}. ${
      currentStep.expression ? `Equation: ${currentStep.expression}.` : ''
    } Simple explanation: ${currentStep.explanation}. ${
      currentStep.intuitionRule ? `Key rule to understand: ${currentStep.intuitionRule}` : ''
    }`;

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Minimized Floating Pill on the Chalkboard
  if (isMinimized) {
    return (
      <div 
        id="minimizedChalkExplainerPill"
        className="absolute bottom-20 left-4 z-30 pointer-events-auto animate-in fade-in zoom-in-95"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="px-3.5 py-2 rounded-2xl bg-[#14231C]/95 backdrop-blur-md border-2 border-[#E8C468] text-[#F5F1E6] shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          title="Open Step-by-Step Chalkboard Guide"
        >
          <span className="text-base">{stageInfo.icon}</span>
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold text-[#E8C468]">Step {activeStepIndex + 1} of {steps.length}</div>
            <div className="text-xs font-bold truncate max-w-[160px]">{currentStep.title}</div>
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-[#E8C468] ml-1 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div 
      id="chalkboardStepExplainerCard"
      className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[95vw] max-w-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div 
        className="bg-[#122019]/96 backdrop-blur-xl border-2 border-[#E8C468]/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#F5F1E6]"
        style={{
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.8), 0 0 25px rgba(232, 196, 104, 0.2)',
        }}
      >
        {/* Card Header Bar */}
        <div className="px-4 py-2.5 bg-[#182821] border-b border-[#F5F1E6]/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-[#E8C468]/20 border border-[#E8C468]/40 flex items-center justify-center text-sm shrink-0">
              {stageInfo.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8C468]">
                  Chalkboard Step Explainer
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#81D4FA]/20 text-[#81D4FA] font-mono">
                  {domain}
                </span>
              </div>
              <p className="text-xs font-hand font-bold text-[#F5F1E6] truncate max-w-md">
                {problem}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Read Aloud Button */}
            <button
              onClick={handleSpeakCurrentStep}
              className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                isSpeaking 
                  ? 'bg-[#81D4FA] text-[#121F19] animate-pulse shadow-md' 
                  : 'bg-[#213A30] text-[#81D4FA] hover:bg-[#2B4A3D]'
              }`}
              title="Listen to this step explained in plain words"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[11px]">Explain</span>
            </button>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-xl bg-[#213A30] hover:bg-[#2B4A3D] text-[#F5F1E6]/70 hover:text-[#F5F1E6] transition-colors"
              title="Minimize to floating pill"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#F5F1E6]/50 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
              title="Dismiss explainer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Progression Tabs */}
        <div className="px-3 pt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {steps.map((step, idx) => {
            const isSelected = idx === activeStepIndex;
            return (
              <button
                key={step.stepNumber || idx}
                onClick={() => onChangeStepIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                  isSelected
                    ? 'bg-[#E8C468] text-[#14231C] border-[#E8C468] shadow-md scale-102'
                    : 'bg-[#182821]/80 text-[#F5F1E6]/70 border-[#F5F1E6]/10 hover:bg-[#213A30] hover:text-[#F5F1E6]'
                }`}
              >
                <span>Step {idx + 1}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#14231C] animate-ping" />}
              </button>
            );
          })}

          {finalAnswer && (
            <div className="ml-auto shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#8FBF8A] bg-[#8FBF8A]/15 px-2.5 py-1 rounded-xl border border-[#8FBF8A]/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-mono">{finalAnswer}</span>
            </div>
          )}
        </div>

        {/* Step Body Content */}
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* Step Title Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span 
                className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-md border"
                style={{ 
                  backgroundColor: `${stageInfo.color}20`,
                  color: stageInfo.color,
                  borderColor: `${stageInfo.color}40`
                }}
              >
                {stageInfo.label}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-[#F5F1E6]">
                {currentStep.title}
              </h4>
            </div>

            {onReplayStep && (
              <button
                onClick={() => onReplayStep(activeStepIndex)}
                className="text-[11px] text-[#E8C468] hover:text-[#f0d182] font-semibold flex items-center gap-1"
                title="Replay drawing this step on blackboard"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-draw</span>
              </button>
            )}
          </div>

          {/* Mathematical Expression Banner */}
          {currentStep.expression && (
            <div className="bg-[#0E1713] border border-[#E8C468]/40 rounded-2xl p-3 flex items-center justify-between shadow-inner">
              <div className="font-hand text-xl sm:text-2xl font-bold text-[#E8C468] tracking-wide">
                {currentStep.expression}
              </div>
              <span className="text-[10px] font-mono text-[#81D4FA] bg-[#81D4FA]/15 px-2 py-1 rounded-lg border border-[#81D4FA]/25">
                Exact Math
              </span>
            </div>
          )}

          {/* Plain-English Easy Explanation */}
          <div className="bg-[#182821] border border-[#F5F1E6]/10 rounded-2xl p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#81D4FA] uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-[#81D4FA]" />
              <span>Easy to Understand Explanation:</span>
            </div>
            <p className="text-xs sm:text-sm text-[#F5F1E6]/95 leading-relaxed">
              {currentStep.explanation}
            </p>

            {currentStep.intuitionRule && (
              <div className="pt-2 border-t border-[#F5F1E6]/10 flex items-start gap-2 text-xs text-[#8FBF8A]">
                <Lightbulb className="w-4 h-4 text-[#8FBF8A] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#8FBF8A]">Why this works: </strong>
                  <span>{currentStep.intuitionRule}</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls Bottom Bar */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F5F1E6]/10">
            <button
              onClick={() => onChangeStepIndex(Math.max(0, activeStepIndex - 1))}
              disabled={activeStepIndex === 0}
              className="px-3 py-1.5 rounded-xl bg-[#213A30] hover:bg-[#2B4A3D] text-[#F5F1E6] text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <span className="text-xs font-bold text-[#E8C468]">
              Step {activeStepIndex + 1} of {steps.length}
            </span>

            <button
              onClick={() => onChangeStepIndex(Math.min(steps.length - 1, activeStepIndex + 1))}
              disabled={activeStepIndex === steps.length - 1}
              className="px-3 py-1.5 rounded-xl bg-[#E8C468] hover:bg-[#f0d182] text-[#122019] text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
