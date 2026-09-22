import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  FastForward, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  HelpCircle, 
  X, 
  CheckCircle, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  BookOpen, 
  Lightbulb, 
  ShieldCheck, 
  Radio
} from 'lucide-react';
import { AnimatedExplanationPlayerState } from '../utils/animatedExplanationRunner';
import { AnimatedExplanationStep } from '../types';

interface AnimatedExplanationPlayerProps {
  playerState: AnimatedExplanationPlayerState;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onJumpToStep: (stepIdx: number) => void;
  onSkipToEnd: () => void;
  onSetSpeed: (speed: number) => void;
  onToggleSpeech: () => void;
  onClose: () => void;
  onAskClarificationAboutStep?: (step: AnimatedExplanationStep, problem: string) => void;
}

const STAGE_LABELS: Record<string, { label: string; icon: string }> = {
  setup: { label: '1. Setup & Given', icon: '📝' },
  concept_diagram: { label: '2. Visual Model', icon: '📐' },
  derivation: { label: '3. Math Derivation', icon: '⚙️' },
  verification: { label: '4. Verified Check', icon: '✅' },
};

const SPEED_OPTIONS = [0.75, 1.0, 1.5, 2.0];

export default function AnimatedExplanationPlayer({
  playerState,
  onPlay,
  onPause,
  onReplay,
  onNextStep,
  onPrevStep,
  onJumpToStep,
  onSkipToEnd,
  onSetSpeed,
  onToggleSpeech,
  onClose,
  onAskClarificationAboutStep,
}: AnimatedExplanationPlayerProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!playerState.isActive || !playerState.explanation) {
    return null;
  }

  const { explanation, currentStep, currentStepIndex, totalSteps, isPlaying, isPaused, isCompleted, speedMultiplier, isSpeechEnabled, isSpeaking, progressPercent } = playerState;

  const currentStageInfo = currentStep?.stage ? STAGE_LABELS[currentStep.stage] || { label: currentStep.stage, icon: '✏️' } : { label: 'Step', icon: '✏️' };

  return (
    <div 
      id="animatedExplanationPlayerDeck"
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[96vw] max-w-3xl bg-[#14231C]/95 backdrop-blur-md border border-[#E8C468]/30 rounded-3xl shadow-2xl p-3 sm:p-4 text-[#F5F1E6] transition-all animate-in fade-in slide-in-from-bottom-3"
      style={{
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(232, 196, 104, 0.15)',
      }}
    >
      {/* Top Banner Strip */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F5F1E6]/10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#E8C468]/20 border border-[#E8C468]/40 flex items-center justify-center text-[#E8C468] shrink-0">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8C468]">
                Chalkboard AI Animation
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#8FBF8A]/20 text-[#8FBF8A] border border-[#8FBF8A]/30 font-semibold">
                100% Verified Rigor
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#81D4FA]/20 text-[#81D4FA] border border-[#81D4FA]/30 font-semibold">
                Ages {explanation.ageBracket}
              </span>
            </div>
            <p className="font-hand text-sm sm:text-base font-bold text-[#F5F1E6] truncate">
              {explanation.problem}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6]/70 hover:text-[#F5F1E6] transition-colors"
            title={isMinimized ? 'Expand controls' : 'Minimize controls'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#213A30] hover:bg-[#E2725B]/20 text-[#F5F1E6]/70 hover:text-[#E2725B] transition-colors"
            title="Close animation & keep chalk drawing on board"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="pt-2.5 space-y-3">
          {/* Stage Progress Pills (Clickable navigation) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {explanation.steps.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPast = idx < currentStepIndex || isCompleted;
              const info = STAGE_LABELS[step.stage] || { label: step.title, icon: '✏️' };

              return (
                <button
                  key={step.stepNumber}
                  type="button"
                  onClick={() => onJumpToStep(idx)}
                  className={`px-2 py-1.5 rounded-xl text-left transition-all flex items-center justify-between border ${
                    isCurrent
                      ? 'bg-[#E8C468]/20 border-[#E8C468] text-[#E8C468] shadow-md ring-1 ring-[#E8C468]/40'
                      : isPast
                      ? 'bg-[#213A30]/80 border-[#8FBF8A]/30 text-[#8FBF8A] hover:bg-[#2A473B]'
                      : 'bg-[#1C2B24]/60 border-[#F5F1E6]/10 text-[#F5F1E6]/50 hover:bg-[#213A30]'
                  }`}
                  title={`Jump to ${info.label}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs shrink-0">{info.icon}</span>
                    <span className="text-[11px] font-bold truncate">
                      {info.label.replace(/^\d+\.\s*/, '')}
                    </span>
                  </div>
                  {isPast && !isCurrent && (
                    <Check className="w-3 h-3 text-[#8FBF8A] shrink-0" />
                  )}
                  {isCurrent && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E8C468] animate-ping shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Step Focus Card: Spoken Narration + Math Formula */}
          {currentStep && (
            <div className="bg-[#182821] border border-[#F5F1E6]/15 rounded-2xl p-3 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#E8C468] flex items-center gap-1">
                    <span>{currentStageInfo.icon}</span>
                    <span>Step {currentStepIndex + 1} of {totalSteps}:</span>
                  </span>
                  <span className="text-xs font-semibold text-[#F5F1E6]">
                    {currentStep.title}
                  </span>
                </div>

                {currentStep.keyRule && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#81D4FA]/15 text-[#81D4FA] border border-[#81D4FA]/30 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{currentStep.keyRule}</span>
                  </span>
                )}
              </div>

              {/* Math Expression snippet if present */}
              {currentStep.mathExpression && (
                <div className="font-mono text-sm bg-[#0E1713] border border-[#81D4FA]/20 px-3 py-1.5 rounded-xl text-[#81D4FA] font-bold flex items-center justify-between">
                  <span>{currentStep.mathExpression}</span>
                  {currentStep.stage === 'verification' && (
                    <span className="text-[11px] text-[#8FBF8A] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified L.H.S = R.H.S</span>
                    </span>
                  )}
                </div>
              )}

              {/* Teacher Spoken Voice Transcript */}
              <div className="flex items-start gap-2 text-xs text-[#F5F1E6]/85 bg-[#213A30]/50 p-2 rounded-xl border border-[#F5F1E6]/10">
                <div className="p-1 rounded-lg bg-[#E8C468]/20 text-[#E8C468] shrink-0 mt-0.5">
                  <Radio className={`w-3 h-3 ${isSpeaking ? 'animate-pulse text-[#8FBF8A]' : ''}`} />
                </div>
                <div className="flex-1">
                  <p className="italic leading-relaxed">
                    "{currentStep.spokenNarration}"
                  </p>
                  {isSpeaking && (
                    <span className="text-[10px] text-[#8FBF8A] font-semibold mt-0.5 inline-block animate-pulse">
                      ● Professor Chalk is speaking…
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Player Controls Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap pt-1">
            {/* Left: Step navigation & Play/Pause */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onReplay}
                className="p-2 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6]/80 hover:text-[#F5F1E6] transition-colors"
                title="Replay from Step 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onPrevStep}
                disabled={currentStepIndex === 0}
                className="p-2 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6]/80 hover:text-[#F5F1E6] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                title="Previous step"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {isCompleted ? (
                <button
                  type="button"
                  onClick={onReplay}
                  className="px-3.5 py-2 rounded-xl bg-[#8FBF8A] text-[#121F19] font-bold text-xs flex items-center gap-1.5 hover:bg-[#a6d8a2] transition-colors shadow-md"
                  title="Replay entire explanation"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay</span>
                </button>
              ) : isPaused || !isPlaying ? (
                <button
                  type="button"
                  onClick={onPlay}
                  className="px-3.5 py-2 rounded-xl bg-[#E8C468] text-[#182821] font-bold text-xs flex items-center gap-1.5 hover:bg-[#f0d182] transition-colors shadow-md"
                  title="Resume drawing animation"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  className="px-3.5 py-2 rounded-xl bg-[#213A30] text-[#E8C468] border border-[#E8C468]/40 font-bold text-xs flex items-center gap-1.5 hover:bg-[#2A473B] transition-colors shadow-md"
                  title="Pause drawing animation"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={onNextStep}
                disabled={currentStepIndex >= totalSteps - 1 && isCompleted}
                className="p-2 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6]/80 hover:text-[#F5F1E6] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                title="Next step"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onSkipToEnd}
                disabled={isCompleted}
                className="p-2 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#81D4FA] hover:text-[#a0e4ff] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                title="Skip animation and show complete solution on board"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            {/* Middle: Speed Selector */}
            <div className="flex items-center gap-1 bg-[#1C2B24] p-1 rounded-xl border border-[#F5F1E6]/10">
              <span className="text-[10px] text-[#F5F1E6]/50 px-1.5 font-bold uppercase">Speed:</span>
              {SPEED_OPTIONS.map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onSetSpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                    speedMultiplier === spd
                      ? 'bg-[#E8C468] text-[#182821] shadow-sm'
                      : 'text-[#F5F1E6]/60 hover:text-[#F5F1E6] hover:bg-[#213A30]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Right: Audio Narration & Clarification */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleSpeech}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                  isSpeechEnabled
                    ? 'bg-[#8FBF8A]/20 text-[#8FBF8A] border-[#8FBF8A]/40'
                    : 'bg-[#213A30] text-[#F5F1E6]/50 border-[#F5F1E6]/10 hover:text-[#F5F1E6]'
                }`}
                title={isSpeechEnabled ? 'Teacher Voice Narration: ON' : 'Teacher Voice Narration: MUTED'}
              >
                {isSpeechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Voice {isSpeechEnabled ? 'On' : 'Off'}</span>
              </button>

              {onAskClarificationAboutStep && currentStep && (
                <button
                  type="button"
                  onClick={() => onAskClarificationAboutStep(currentStep, explanation.problem)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#81D4FA] border border-[#81D4FA]/30 text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Ask a question about this step"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#81D4FA]" />
                  <span className="hidden sm:inline">Ask About Step</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
