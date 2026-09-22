import React, { useState } from 'react';
import { FeedbackResult } from '../types';
import { 
  CheckCircle2, 
  Sparkles, 
  Pencil, 
  RotateCcw, 
  X, 
  Maximize2, 
  Minimize2, 
  Lightbulb, 
  ArrowRight, 
  Star,
  Volume2,
  VolumeX,
  Smile,
  Zap,
  Check
} from 'lucide-react';

interface SlateCorrectionBoardProps {
  feedback: FeedbackResult | null;
  activeQuestion?: string;
  topic?: string;
  onDrawCorrectProcessOnSlate: (feedback: FeedbackResult) => void;
  onClearSlateAndRetry: () => void;
  onClose: () => void;
  onNextQuestion?: () => void;
  isAiDrawing?: boolean;
}

export default function SlateCorrectionBoard({
  feedback,
  activeQuestion,
  topic,
  onDrawCorrectProcessOnSlate,
  onClearSlateAndRetry,
  onClose,
  onNextQuestion,
  isAiDrawing = false,
}: SlateCorrectionBoardProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDrawingLoading, setIsDrawingLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingStepIndex, setSpeakingStepIndex] = useState<number | null>(null);

  const handleSpeakSingleStep = (step: any, index: number) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingStepIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingStepIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const text = `Step ${step.step_number || index + 1}: ${step.step_title}. ${step.expression ? 'Formula: ' + step.expression + '. ' : ''}${step.explanation}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeakingStepIndex(null);
    utterance.onerror = () => setSpeakingStepIndex(null);
    setSpeakingStepIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  if (!feedback) return null;

  const score = feedback.overall_score || 0;
  const isGreat = score >= 85;
  const mistakes = feedback.mistakes || [];
  const hasMistakes = mistakes.length > 0 || !isGreat;
  const correctSolution = feedback.correct_solution;
  const steps = correctSolution?.step_by_step_process || [];
  const finalAnswer = correctSolution?.final_correct_answer || (mistakes.length > 0 ? mistakes[0].correction : 'Correct Solution');
  const keyTakeaway = correctSolution?.key_takeaway || feedback.tips?.[0] || 'Carefully check every step and math sign!';

  // Calculate 1 to 5 Stars
  const starCount = Math.max(1, Math.min(5, Math.round(score / 20)));

  const handleReadFeedback = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const mistakeText = mistakes.map((m) => `Watch out for ${m.issue}: ${m.correction}`).join('. ');
    const stepText = steps.map((s) => `Step ${s.step_number}: ${s.step_title}. ${s.explanation}`).join('. ');
    const fullText = `${feedback.praise || ''}. Final Answer: ${finalAnswer}. ${mistakeText} ${stepText}`;
    
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.93;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleTriggerAutoDraw = async () => {
    setIsDrawingLoading(true);
    try {
      await onDrawCorrectProcessOnSlate(feedback);
    } finally {
      setIsDrawingLoading(false);
    }
  };

  // Minimized Sticky Note Mode (floating on chalkboard corner)
  if (isMinimized) {
    return (
      <div 
        id="minimizedSlateCorrectionSticky"
        className="absolute top-24 left-4 z-30 pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="bg-[#14231C]/96 backdrop-blur-md border-2 border-[#E8C468] p-3 rounded-2xl shadow-2xl max-w-xs space-y-2">
          <div className="flex items-center justify-between gap-2 border-b border-[#F5F1E6]/10 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                isGreat ? 'bg-[#8FBF8A] text-[#182821]' : 'bg-[#E2725B] text-white'
              }`}>
                {isGreat ? '⭐ Great Job!' : '🐾 Helpful Clues'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 rounded-lg bg-[#213A30] text-[#F5F1E6] hover:bg-[#2C4C3F] transition-colors"
                title="Expand Full Steps"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[#F5F1E6]/50 hover:text-[#F5F1E6]"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-[11px] font-bold text-[#E8C468]">⭐ Verified Answer:</div>
            <div className="font-hand text-base font-bold text-[#F5F1E6] bg-[#182821] px-2.5 py-1 rounded-xl border border-[#E8C468]/30">
              {finalAnswer}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleTriggerAutoDraw}
              disabled={isAiDrawing || isDrawingLoading}
              className="flex-1 py-1.5 px-2 rounded-xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-50"
            >
              <Pencil className="w-3 h-3" />
              <span>Draw</span>
            </button>

            {onNextQuestion && (
              <button
                onClick={() => {
                  onClose();
                  onNextQuestion();
                }}
                className="py-1.5 px-2 rounded-xl bg-[#8FBF8A] hover:bg-[#a0d49b] text-[#182821] text-xs font-bold flex items-center justify-center gap-1 shadow transition-all active:scale-95"
                title="Move to Next Question"
              >
                <Sparkles className="w-3 h-3" />
                <span>Next ➡️</span>
              </button>
            )}

            <button
              onClick={() => setIsMinimized(false)}
              className="py-1.5 px-2 rounded-xl bg-[#213A30] hover:bg-[#2C4C3F] text-[#F5F1E6] text-xs font-bold transition-colors"
            >
              Steps
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full Kid-Friendly On-Slate Correction Board
  return (
    <div 
      id="onSlateCorrectionBoard"
      className="absolute top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-3 sm:px-4 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-200"
    >
      <div className="bg-[#122019]/98 backdrop-blur-xl border-3 border-[#E8C468]/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[78vh]">
        {/* Playful Header Banner */}
        <div className="px-4 py-3 bg-[#182821] border-b border-[#F5F1E6]/15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              isGreat ? 'bg-[#8FBF8A]/20 border-2 border-[#8FBF8A]/40' : 'bg-[#E8C468]/20 border-2 border-[#E8C468]/40'
            }`}>
              {isGreat ? '🌟' : '🐾'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                {/* 5-Star Visual Score */}
                <div className="flex items-center gap-0.5 text-[#E8C468]">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < starCount ? 'fill-[#E8C468] text-[#E8C468]' : 'text-white/20'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#E8C468] bg-[#E8C468]/15 px-2 py-0.5 rounded-md border border-[#E8C468]/30">
                  {score}/100 Points
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#F5F1E6] mt-0.5">
                {isGreat ? '🎉 Awesome Job on the Chalkboard!' : '💡 Let\'s Solve It Together Step-by-Step!'}
              </h3>
            </div>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Read Aloud Button */}
            <button
              onClick={handleReadFeedback}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                isSpeaking 
                  ? 'bg-[#81D4FA] text-[#121F19] shadow-lg animate-pulse' 
                  : 'bg-[#213A30] text-[#81D4FA] hover:bg-[#2C4C3F]'
              }`}
              title="Listen to the feedback and explanation"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              id="minimizeCorrectionBoardBtn"
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-xl bg-[#213A30] text-[#F5F1E6]/80 hover:text-[#F5F1E6] hover:bg-[#2C4C3F] transition-colors"
              title="Minimize to Floating Sticky Note"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#F5F1E6]/50 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Correction Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Praise & Encouragement Banner */}
          {feedback.praise && (
            <div className="p-3 rounded-2xl bg-[#1A2E24] border border-[#8FBF8A]/30 flex items-start gap-2.5 text-xs text-[#F5F1E6]/95">
              <span className="text-base">✨</span>
              <p className="leading-relaxed">
                {feedback.praise}
              </p>
            </div>
          )}

          {/* Verified Correct Answer Highlight Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1C2F25] to-[#122019] border-2 border-[#E8C468] space-y-2 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E8C468]" />
                <span>Verified Correct Answer</span>
              </span>
              <span className="text-[11px] text-[#8FBF8A] font-bold">✨ Master Solution</span>
            </div>

            <div className="font-hand text-2xl sm:text-3xl font-bold text-[#E8C468] tracking-wide py-1">
              {finalAnswer}
            </div>

            {keyTakeaway && (
              <div className="pt-2 border-t border-[#F5F1E6]/10 flex items-start gap-2 text-xs text-[#F5F1E6]/90">
                <Lightbulb className="w-4 h-4 text-[#E8C468] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#E8C468]">Key Rule to Remember: </strong>
                  <span>{keyTakeaway}</span>
                </div>
              </div>
            )}
          </div>

          {/* Gentle Mistakes Breakdown */}
          {mistakes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E2725B]">
                <span>🔍</span>
                <span>Things to Watch Out For ({mistakes.length})</span>
              </div>

              <div className="grid gap-2">
                {mistakes.map((m, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-[#1C2B24] border border-[#E2725B]/30 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-hand text-sm text-[#FF8A80] line-through bg-black/30 px-2.5 py-0.5 rounded-lg border border-[#FF8A80]/20">
                        {m.text_snippet || 'Written step'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#E8C468]" />
                      <span className="font-hand text-sm font-bold text-[#8FBF8A] bg-[#8FBF8A]/15 px-2.5 py-0.5 rounded-lg border border-[#8FBF8A]/30">
                        {m.correction}
                      </span>
                    </div>

                    <p className="text-xs text-[#F5F1E6]/85 leading-relaxed">
                      <strong className="text-[#E8C468]">{m.issue}:</strong> {m.explanation || 'Apply correct step rule.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Solution Breakdown */}
          {steps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#81D4FA]">
                <span>🐾</span>
                <span>Step-by-Step Guide ({steps.length} Steps)</span>
              </div>

              <div className="space-y-2.5">
                {steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#182821] border border-[#81D4FA]/30 space-y-2 relative group hover:border-[#81D4FA]/60 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-xl bg-[#81D4FA]/20 text-[#81D4FA] font-bold text-xs flex items-center justify-center border border-[#81D4FA]/30 shadow-sm">
                          {step.step_number || idx + 1}
                        </span>
                        <span className="font-bold text-[#F5F1E6] text-xs sm:text-sm">
                          {step.step_title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSpeakSingleStep(step, idx)}
                        className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                          speakingStepIndex === idx
                            ? 'bg-[#81D4FA] text-[#121F19] border-[#81D4FA] font-bold shadow-md animate-pulse'
                            : 'bg-[#213A30]/60 text-[#81D4FA] border-[#81D4FA]/30 hover:bg-[#81D4FA]/20'
                        }`}
                        title="Listen to this step explained"
                      >
                        {speakingStepIndex === idx ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px] hidden sm:inline">
                          {speakingStepIndex === idx ? 'Stop' : 'Listen'}
                        </span>
                      </button>
                    </div>

                    {step.expression && (
                      <div className="font-hand text-lg sm:text-xl font-bold text-[#E8C468] bg-[#121F19] px-3.5 py-2 rounded-2xl border border-[#F5F1E6]/10 shadow-inner flex items-center justify-between">
                        <span>{step.expression}</span>
                        <span className="text-[10px] font-sans font-normal text-[#81D4FA]/80 bg-[#81D4FA]/10 px-2 py-0.5 rounded-md border border-[#81D4FA]/20">
                          Chalk Expression
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-[#F5F1E6]/90 leading-relaxed bg-[#14231C]/60 p-2.5 rounded-xl border border-[#F5F1E6]/5">
                      <span className="font-semibold text-[#81D4FA] mr-1.5">💡 How it works:</span>
                      {step.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="px-4 py-3.5 bg-[#182821] border-t border-[#F5F1E6]/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClearSlateAndRetry}
              className="px-3.5 py-2.5 rounded-2xl bg-[#213A30] hover:bg-[#2C4C3F] text-[#F5F1E6] text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Clear current marks on slate and re-attempt problem"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#E8C468]" />
              <span>🔄 Clean & Retry on Slate</span>
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="px-3 py-2.5 rounded-2xl text-xs font-bold text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
              title="Minimize to corner sticky note while writing"
            >
              📌 Dock Note
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onNextQuestion && (
              <button
                id="slateCorrectionNextQuestionBtn"
                onClick={() => {
                  onClose();
                  onNextQuestion();
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#8FBF8A] hover:bg-[#a0d49b] text-[#182821] font-bold text-xs sm:text-sm shadow-xl shadow-[#8FBF8A]/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                title="Advance to next question drill"
              >
                <Sparkles className="w-4 h-4 text-[#182821]" />
                <span>🌟 Next Question ➡️</span>
              </button>
            )}

            <button
              id="chalkCorrectSolutionOnSlateBtn"
              onClick={handleTriggerAutoDraw}
              disabled={isAiDrawing || isDrawingLoading}
              className="px-5 py-2.5 rounded-2xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] font-bold text-xs sm:text-sm shadow-xl shadow-[#E8C468]/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Have AI chalk the complete correct step-by-step solution onto your blackboard"
            >
              <Pencil className={`w-4 h-4 ${isDrawingLoading ? 'animate-bounce' : ''}`} />
              <span>{isDrawingLoading ? 'Preparing Chalk...' : '✍️ Chalk Solution on Slate'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
