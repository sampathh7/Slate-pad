import React, { useState, useEffect, useRef } from 'react';
import { 
  StudentClarificationResult, 
  ChildAgeBracket, 
  AdaptiveStudentProfile,
  AutoDrawResult,
  StudentMistakeRecord
} from '../types';
import { 
  HelpCircle, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Pencil, 
  Lightbulb, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface AskClarifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  activeQuestion?: string;
  ageBracket: ChildAgeBracket;
  studentProfile?: AdaptiveStudentProfile;
  initialQuery?: string;
  initialMistake?: StudentMistakeRecord | null;
  onDrawClarificationOnSlate?: (autoDrawResult: AutoDrawResult) => void;
}

export default function AskClarifyModal({
  isOpen,
  onClose,
  topic,
  activeQuestion,
  ageBracket,
  studentProfile,
  initialQuery = '',
  initialMistake = null,
  onDrawClarificationOnSlate,
}: AskClarifyModalProps) {
  const [queryInput, setQueryInput] = useState('');
  const [isClarifying, setIsClarifying] = useState(false);
  const [clarificationResult, setClarificationResult] = useState<StudentClarificationResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedQuickCheckOption, setSelectedQuickCheckOption] = useState<string | null>(null);
  const [quickCheckFeedback, setQuickCheckFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const recognitionRef = useRef<any>(null);

  // Set initial query when modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      if (initialMistake) {
        setQueryInput(`Why was "${initialMistake.mistakeText}" wrong in: ${initialMistake.question}?`);
      } else if (initialQuery) {
        setQueryInput(initialQuery);
      }
      setSelectedQuickCheckOption(null);
      setQuickCheckFeedback(null);
    }
  }, [isOpen, initialQuery, initialMistake]);

  // Clean up audio & speech recognition on unmount or close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const handleAskClarification = async (customQuery?: string) => {
    const textToAsk = (customQuery || queryInput).trim();
    if (!textToAsk || isClarifying) return;

    setIsClarifying(true);
    setSelectedQuickCheckOption(null);
    setQuickCheckFeedback(null);

    try {
      const res = await fetch('/api/clarify-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToAsk,
          topic,
          activeQuestion,
          mistakeContext: initialMistake || undefined,
          ageBracket,
          studentProfile,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to clarify concept');
      }

      const data: StudentClarificationResult = await res.json();
      setClarificationResult(data);

      // Auto-read aloud initial direct clarification
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.directClarification);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error: any) {
      console.error('Error clarifying query:', error);
      alert(error.message || 'Could not clarify your question. Please try again.');
    } finally {
      setIsClarifying(false);
    }
  };

  // Toggle Text-to-Speech
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window) || !clarificationResult) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${clarificationResult.directClarification} Remember: ${clarificationResult.keyRuleToRemember}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice Input (Speech-to-Text)
  const handleToggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQueryInput(transcript);
        setIsListening(false);
        handleAskClarification(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleQuickOptionClick = (option: string) => {
    if (!clarificationResult?.quickCheck) return;
    setSelectedQuickCheckOption(option);

    const isCorrect = option.trim().toLowerCase() === clarificationResult.quickCheck.correctAnswer.trim().toLowerCase();
    setQuickCheckFeedback({
      isCorrect,
      message: isCorrect
        ? 'Spot on! You nailed the concept! 🎉'
        : `Not quite. Tip: ${clarificationResult.quickCheck.hint}`,
    });
  };

  const handleDrawOnSlate = () => {
    if (!clarificationResult || !onDrawClarificationOnSlate) return;

    const strokes = clarificationResult.chalkboardStrokes || [];
    const drawResult: AutoDrawResult = {
      title: `Clarification: ${clarificationResult.query.slice(0, 35)}`,
      description: clarificationResult.visualAnalogy || clarificationResult.directClarification,
      category: 'Clarification',
      educationalInsight: clarificationResult.keyRuleToRemember,
      stepNotes: clarificationResult.stepByStepBreakdown.map((s) => s.title),
      strokes: strokes.length > 0 ? strokes : [
        {
          color: '#E8C468',
          width: 4,
          label: 'Rule Header',
          points: [{ x: 150, y: 200 }, { x: 850, y: 200 }],
        }
      ],
    };

    onDrawClarificationOnSlate(drawResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="askClarifyModal"
        className="w-full max-w-3xl bg-[#1C2B24] border-2 border-[#81D4FA]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F5F1E6]/10 flex items-center justify-between bg-[#15231D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#81D4FA]/20 border border-[#81D4FA]/30 flex items-center justify-center text-[#81D4FA]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-hand text-2xl font-bold text-[#81D4FA] leading-tight">
                  Student Clarification Desk
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8FBF8A]/20 text-[#8FBF8A] border border-[#8FBF8A]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  100% Accurate
                </span>
              </div>
              <p className="text-xs text-[#F5F1E6]/70">
                Ask any question, formula doubt, or mistake — get instant step-by-step clarity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#F5F1E6]/60 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#182821] border-b border-[#F5F1E6]/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskClarification();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask anything (e.g. 'Why is 2/4 = 1/2?', 'Explain carrying in subtraction', 'Why was my step wrong?')"
              className="flex-1 px-4 py-3 rounded-2xl bg-[#213A30] border border-[#F5F1E6]/20 text-[#F5F1E6] text-xs sm:text-sm placeholder-[#F5F1E6]/40 focus:outline-none focus:border-[#81D4FA] transition-all"
            />

            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`p-3 rounded-2xl border transition-all ${
                isListening
                  ? 'bg-[#E2725B] text-[#182821] border-[#E2725B] animate-pulse'
                  : 'bg-[#213A30] text-[#F5F1E6]/80 border-[#F5F1E6]/20 hover:text-[#F5F1E6]'
              }`}
              title={isListening ? 'Stop Listening' : 'Ask with Microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={isClarifying || !queryInput.trim()}
              className="px-4 py-3 rounded-2xl bg-[#81D4FA] hover:bg-[#a0e0fd] text-[#121F19] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0"
            >
              {isClarifying ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Clarifying…</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Clarify</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Concept Questions */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
            <span className="text-[10px] text-[#F5F1E6]/40 uppercase tracking-wider shrink-0">
              Quick Asks:
            </span>
            {[
              `Explain ${topic || 'fractions'} simply`,
              activeQuestion ? `Clarify board problem` : 'Why does 2/4 = 1/2?',
              'Why is negative × negative positive?',
              'How to avoid calculation mistakes?',
            ].map((suggested, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const q = suggested === 'Clarify board problem' && activeQuestion
                    ? `Please clarify step-by-step how to solve: ${activeQuestion}`
                    : suggested;
                  setQueryInput(q);
                  handleAskClarification(q);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#213A30] hover:bg-[#2c4e40] text-[#F5F1E6]/70 hover:text-[#F5F1E6] text-[11px] whitespace-nowrap transition-all border border-[#F5F1E6]/10"
              >
                {suggested}
              </button>
            ))}
          </div>
        </div>

        {/* Clarification Output Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {isClarifying ? (
            <div className="p-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-[#81D4FA] animate-spin mx-auto" />
              <div className="font-hand text-2xl font-bold text-[#81D4FA]">
                Crafting Crystal-Clear Clarification…
              </div>
              <p className="text-xs text-[#F5F1E6]/60 max-w-sm mx-auto">
                Verifying formulas, breaking down steps, and generating chalk visual analogies for {ageBracket} year olds.
              </p>
            </div>
          ) : clarificationResult ? (
            <div className="space-y-5">
              {/* Question Header & Speech Controls */}
              <div className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-[#182821] border border-[#81D4FA]/30">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#81D4FA]">
                    Clarification For:
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#F5F1E6]">
                    "{clarificationResult.query}"
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleToggleSpeech}
                    className={`p-2 rounded-xl border transition-all ${
                      isPlayingAudio
                        ? 'bg-[#81D4FA] text-[#121F19] border-[#81D4FA] animate-pulse'
                        : 'bg-[#213A30] text-[#F5F1E6]/80 border-[#F5F1E6]/20 hover:text-[#F5F1E6]'
                    }`}
                    title={isPlayingAudio ? 'Stop Speech' : 'Listen to Explanation'}
                  >
                    {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {onDrawClarificationOnSlate && (
                    <button
                      onClick={handleDrawOnSlate}
                      className="px-3 py-2 rounded-xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
                      title="Draw this clarification on the chalkboard"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Draw on Slate</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Direct Clarification */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E2E26] to-[#16251E] border-2 border-[#81D4FA]/40 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#81D4FA] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#81D4FA]" />
                  <span>The Direct, Accurate Answer:</span>
                </div>
                <div className="text-sm sm:text-base text-[#F5F1E6] leading-relaxed whitespace-pre-line font-medium">
                  {clarificationResult.directClarification}
                </div>
              </div>

              {/* Step-by-Step Breakdown */}
              {clarificationResult.stepByStepBreakdown?.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Step-by-Step Process (Why & How):</span>
                  </div>

                  <div className="space-y-2">
                    {clarificationResult.stepByStepBreakdown.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#182821] border border-[#F5F1E6]/10 flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#E8C468]/20 border border-[#E8C468]/30 text-[#E8C468] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {step.stepNumber}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="font-bold text-xs sm:text-sm text-[#F5F1E6]">
                            {step.title}
                          </div>
                          <p className="text-xs text-[#F5F1E6]/80 leading-relaxed">
                            {step.explanation}
                          </p>
                          {step.example && (
                            <div className="text-[11px] text-[#81D4FA] bg-[#81D4FA]/10 p-2 rounded-lg font-mono-code">
                              💡 Example: {step.example}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Analogy & Mental Model */}
              {clarificationResult.visualAnalogy && (
                <div className="p-4 rounded-2xl bg-[#15231D] border border-[#8FBF8A]/30 space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8FBF8A] flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-[#8FBF8A]" />
                    <span>Chalkboard Mental Model & Analogy:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#F5F1E6]/90 leading-relaxed font-medium">
                    {clarificationResult.visualAnalogy}
                  </p>
                </div>
              )}

              {/* Golden Rule & Common Pitfall Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#E8C468]/10 border border-[#E8C468]/30 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#E8C468]">
                    ⭐ Key Rule to Remember:
                  </div>
                  <div className="font-hand text-base font-bold text-[#F5F1E6]">
                    {clarificationResult.keyRuleToRemember}
                  </div>
                </div>

                {clarificationResult.commonPitfall && (
                  <div className="p-3.5 rounded-2xl bg-[#E2725B]/10 border border-[#E2725B]/30 space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#E2725B]">
                      ⚠️ Common Trap to Avoid:
                    </div>
                    <p className="text-xs text-[#F5F1E6]/80 leading-relaxed">
                      {clarificationResult.commonPitfall}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Check Question */}
              {clarificationResult.quickCheck && (
                <div className="p-4 rounded-2xl bg-[#182821] border border-[#CE93D8]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#CE93D8] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>Quick Check: Did this clarify it?</span>
                    </div>
                    <span className="text-[10px] text-[#F5F1E6]/50">Select your answer</span>
                  </div>

                  <div className="text-xs sm:text-sm font-medium text-[#F5F1E6]">
                    {clarificationResult.quickCheck.question}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(clarificationResult.quickCheck.options || []).map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickOptionClick(opt)}
                        className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-all flex items-center justify-between ${
                          selectedQuickCheckOption === opt
                            ? opt.trim().toLowerCase() === clarificationResult.quickCheck?.correctAnswer.trim().toLowerCase()
                              ? 'bg-[#8FBF8A]/20 border-[#8FBF8A] text-[#8FBF8A]'
                              : 'bg-[#E2725B]/20 border-[#E2725B] text-[#E2725B]'
                            : 'bg-[#213A30] border-[#F5F1E6]/10 text-[#F5F1E6]/80 hover:text-[#F5F1E6] hover:bg-[#2c4e40]'
                        }`}
                      >
                        <span>{opt}</span>
                        {selectedQuickCheckOption === opt && (
                          opt.trim().toLowerCase() === clarificationResult.quickCheck?.correctAnswer.trim().toLowerCase() ? (
                            <Check className="w-4 h-4 text-[#8FBF8A]" />
                          ) : (
                            <X className="w-4 h-4 text-[#E2725B]" />
                          )
                        )}
                      </button>
                    ))}
                  </div>

                  {quickCheckFeedback && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        quickCheckFeedback.isCorrect
                          ? 'bg-[#8FBF8A]/15 text-[#8FBF8A] border border-[#8FBF8A]/30'
                          : 'bg-[#E2725B]/15 text-[#E2725B] border border-[#E2725B]/30'
                      }`}
                    >
                      {quickCheckFeedback.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{quickCheckFeedback.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center space-y-3 bg-[#15231D] rounded-2xl border border-[#F5F1E6]/10">
              <HelpCircle className="w-12 h-12 text-[#81D4FA]/60 mx-auto" />
              <div className="font-hand text-2xl font-bold text-[#81D4FA]">
                Everything You Ask is Clarified Accurately
              </div>
              <p className="text-xs text-[#F5F1E6]/70 max-w-md mx-auto leading-relaxed">
                Type or speak any math concept, equation doubt, homework question, or mistake snippet. Professor Chalk will break it down into easy, fun, and mathematically verified steps!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F5F1E6]/10 bg-[#15231D] flex items-center justify-between text-xs text-[#F5F1E6]/60">
          <span>Targeting curriculum for age {ageBracket} years.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#213A30] hover:bg-[#2c4e40] text-[#F5F1E6] font-medium transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
