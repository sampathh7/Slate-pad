import React, { useState, useEffect, useRef } from 'react';
import { FeedbackResult, ChatMessage, MistakeItem } from '../types';
import CartoonEncouragement from './CartoonEncouragement';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Sparkles, 
  X, 
  ChevronRight,
  Bot,
  User,
  RotateCcw,
  Wand2,
  Image as ImageIcon,
  Pencil
} from 'lucide-react';

interface FeedbackPanelProps {
  feedback: FeedbackResult | null;
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  activeQuestion: string;
  onNextQuestion?: () => void;
  onOpenAutoDraw?: (customPrompt?: string) => void;
  onDrawCorrectProcessOnSlate?: (feedback: FeedbackResult) => void;
  onClarifyMistake?: (mistake: MistakeItem) => void;
  onOpenMistakeBank?: () => void;
  onOpenAnimatedExplanation?: (problem?: string) => void;
}

export default function FeedbackPanel({
  feedback,
  isOpen,
  onClose,
  topic,
  activeQuestion,
  onNextQuestion,
  onOpenAutoDraw,
  onDrawCorrectProcessOnSlate,
  onClarifyMistake,
  onOpenMistakeBank,
  onOpenAnimatedExplanation,
}: FeedbackPanelProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [askInput, setAskInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Reset chat when new feedback comes in
  useEffect(() => {
    if (feedback) {
      setChatMessages([]);
    }
  }, [feedback]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAsking]);

  // Clean up audio on unmount or close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech (TTS)
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window) || !feedback) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const mistakeCount = feedback.mistakes.length;
    const summaryText = `${feedback.praise}. You scored ${feedback.overall_score} out of 100, with ${
      mistakeCount === 0 ? 'zero errors' : `${mistakeCount} error${mistakeCount > 1 ? 's' : ''}`
    }. ${feedback.tips?.[0] ? `Tip: ${feedback.tips[0]}` : ''}`;

    const utterance = new SpeechSynthesisUtterance(summaryText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-To-Text (STT) for asking questions
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

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setAskInput(transcript);
        handleSendQuestion(transcript);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSendQuestion = async (overrideText?: string) => {
    const query = (overrideText || askInput).trim();
    if (!query || isAsking || !feedback) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setAskInput('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          context: {
            topic: feedback.topic || topic,
            question: feedback.question || activeQuestion,
            score: feedback.overall_score,
            mistakes: feedback.mistakes,
            transcribed_text: feedback.transcribed_text,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to ask tutor');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: data.answer || 'I am ready to help clarify any concept.',
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: 'Sorry, I had trouble answering. Please check your internet connection or try rephrasing.',
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#8FBF8A] border-[#8FBF8A]/30 bg-[#8FBF8A]/10';
    if (score >= 60) return 'text-[#E8C468] border-[#E8C468]/30 bg-[#E8C468]/10';
    return 'text-[#E2725B] border-[#E2725B]/30 bg-[#E2725B]/10';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent Work';
    if (score >= 75) return 'Proficient';
    if (score >= 60) return 'Needs Practice';
    return 'Revision Recommended';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay on mobile and tablet */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
        onClick={onClose}
      />
      <aside 
        id="feedbackDrawer"
        className="fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] lg:relative lg:w-[420px] h-full bg-[#1C2B24] border-l border-[#F5F1E6]/10 flex flex-col shadow-2xl overflow-hidden transition-all duration-300"
      >
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#F5F1E6]/10 flex items-center justify-between bg-[#182821]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E8C468]" />
          <h2 className="font-hand text-2xl font-bold text-[#E8C468] tracking-wide">
            Chalkboard Tutor
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {feedback && (
            <button
              id="voiceFeedbackBtn"
              onClick={toggleSpeech}
              className={`p-2 rounded-xl border transition-all ${
                isPlayingAudio
                  ? 'bg-[#E8C468] text-[#182821] border-[#E8C468] animate-pulse'
                  : 'bg-[#213A30] text-[#F5F1E6]/80 border-[#F5F1E6]/10 hover:text-[#F5F1E6]'
              }`}
              title={isPlayingAudio ? 'Stop Speech' : 'Listen to Feedback'}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#F5F1E6]/60 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {!feedback ? (
          <div className="py-16 px-4 text-center text-[#F5F1E6]/50">
            <Bot className="w-12 h-12 mx-auto mb-3 text-[#E8C468]/50 stroke-[1.5]" />
            <div className="font-hand text-2xl text-[#F5F1E6]/80 mb-2">Ready for review</div>
            <p className="text-xs max-w-xs mx-auto leading-relaxed">
              Write your solution on the chalkboard, then click <strong className="text-[#E8C468]">Check My Work</strong> to receive detailed grading and step corrections.
            </p>
          </div>
        ) : (
          <>
            {/* Cartoon Mascot Encouragement & Animated Feedback */}
            <CartoonEncouragement
              score={feedback.overall_score}
              praise={feedback.praise}
              mistakesCount={feedback.mistakes.length}
              topic={feedback.topic || topic}
              question={feedback.question || activeQuestion}
              transcribedText={feedback.transcribed_text}
            />

            {/* Score & Grade Overview Block */}
            <div className="bg-[#213A30] border border-[#F5F1E6]/10 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[#F5F1E6]/50">
                    Chalkboard Grade
                  </div>
                  <div className="text-xs text-[#F5F1E6]/80 font-medium mt-0.5">
                    {getScoreLabel(feedback.overall_score)}
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border text-xl font-bold font-mono-code ${getScoreColor(feedback.overall_score)}`}>
                  {feedback.overall_score}<span className="text-xs font-normal opacity-70">/100</span>
                </div>
              </div>

              {/* Praise Callout */}
              <div className="bg-[#E8C468]/15 border-l-4 border-[#E8C468] p-3 rounded-r-xl">
                <p className="font-hand text-lg text-[#F5F1E6] leading-snug">
                  "{feedback.praise}"
                </p>
              </div>

              {/* Instant Next Question Action */}
              {onNextQuestion && (
                <button
                  id="feedbackNextQuestionBtn"
                  onClick={onNextQuestion}
                  className="mt-3 w-full py-3 px-4 rounded-2xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] font-bold text-sm sm:text-base shadow-xl shadow-[#E8C468]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-5 h-5 text-[#182821]" />
                  <span>🌟 Next Question ➡️</span>
                </button>
              )}
            </div>

            {/* Adaptive Tutor Intelligence Insights */}
            {feedback.adaptive_insights && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1C2F27] to-[#15231D] border border-[#8FBF8A]/30 shadow-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8FBF8A]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8FBF8A]">
                      Adaptive Tutor Assessment
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8FBF8A]/20 text-[#8FBF8A] font-bold uppercase">
                    {feedback.adaptive_insights.student_level_assessed || 'Adaptive'}
                  </span>
                </div>

                {feedback.adaptive_insights.mastery_growth && (
                  <p className="text-xs text-[#F5F1E6]/90 leading-relaxed font-medium">
                    {feedback.adaptive_insights.mastery_growth}
                  </p>
                )}

                {feedback.adaptive_insights.scaffolding_advice && (
                  <div className="bg-[#182821] p-2.5 rounded-xl border border-[#F5F1E6]/10 text-xs text-[#F5F1E6]/80 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-[#E8C468] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#E8C468]">Next Step Guidance: </span>
                      <span>{feedback.adaptive_insights.scaffolding_advice}</span>
                    </div>
                  </div>
                )}

                {feedback.adaptive_insights.next_difficulty_recommended && (
                  <div className="text-[11px] text-[#81D4FA] font-medium bg-[#81D4FA]/10 p-2 rounded-lg border border-[#81D4FA]/20">
                    <span className="font-bold">Suggested Challenge: </span>
                    <span>{feedback.adaptive_insights.next_difficulty_recommended}</span>
                  </div>
                )}

                {feedback.adaptive_insights.tutor_note && (
                  <p className="text-[11px] text-[#F5F1E6]/70 italic">
                    💡 Tutor Note: {feedback.adaptive_insights.tutor_note}
                  </p>
                )}
              </div>
            )}

            {/* Recognized Handwriting Text */}
            {feedback.transcribed_text && (
              <div className="bg-[#182821] border border-[#F5F1E6]/10 p-3 rounded-xl">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F1E6]/50 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8FBF8A]" />
                  Transcribed Handwriting
                </div>
                <div className="font-mono-code text-xs text-[#F5F1E6]/80 bg-[#213A30]/50 p-2 rounded-lg break-words">
                  {feedback.transcribed_text}
                </div>
              </div>
            )}

            {/* AI Image Visualizer & Auto-Draw Action Cards */}
            <div className="space-y-2">
              {onOpenAutoDraw && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#162720] to-[#1F332A] border border-[#81D4FA]/30 shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#81D4FA]/20 border border-[#81D4FA]/30 flex items-center justify-center text-[#81D4FA] shrink-0">
                      <Pencil className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-hand font-bold text-base text-[#81D4FA] leading-tight">
                        Order AI to Draw on Slate
                      </h4>
                      <p className="text-[11px] text-[#F5F1E6]/70">
                        Watch AI sketch step-by-step diagram or formula on board
                      </p>
                    </div>
                  </div>

                  <button
                    id="panelAutoDrawBtn"
                    onClick={() => {
                      const solutionPrompt = activeQuestion 
                        ? `Draw step-by-step correct solution and diagram for: ${activeQuestion}`
                        : `Draw educational diagram and notes explaining ${topic}`;
                      onOpenAutoDraw(solutionPrompt);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#81D4FA] hover:bg-[#a0e0fd] text-[#121F19] font-bold text-xs shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1"
                  >
                    <span>Draw Solution</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Mistakes & Corrections */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E6]/60 mb-2 flex items-center justify-between">
                <span>Mistakes & Solutions</span>
                <div className="flex items-center gap-2">
                  {onOpenMistakeBank && feedback.mistakes.length > 0 && (
                    <button
                      onClick={onOpenMistakeBank}
                      className="text-[11px] font-bold text-[#E2725B] hover:text-[#f39c89] underline underline-offset-2 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Review in Notebook</span>
                    </button>
                  )}
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#182821] text-[#F5F1E6]/70">
                    {feedback.mistakes.length} {feedback.mistakes.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {feedback.mistakes.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#8FBF8A]/10 border border-[#8FBF8A]/30 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#8FBF8A] mb-1.5" />
                  <div className="font-hand text-xl text-[#8FBF8A]">Flawless Execution!</div>
                  <p className="text-xs text-[#F5F1E6]/70 mt-1">
                    No errors detected in your equations, reasoning, or spelling.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {feedback.mistakes.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-[#213A30] border-l-4 border-[#E2725B] p-3 rounded-r-2xl border-y border-r border-[#F5F1E6]/10 space-y-2"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#E2725B] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-mono-code text-xs font-semibold text-[#E2725B] bg-[#E2725B]/10 px-2 py-0.5 rounded inline-block">
                            "{m.text_snippet}"
                          </div>
                          <div className="text-xs text-[#F5F1E6]/80 mt-1 leading-relaxed">
                            {m.issue}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#182821] p-2.5 rounded-xl flex items-start gap-2 text-xs">
                        <span className="text-[#8FBF8A] font-bold text-sm">→</span>
                        <div className="flex-1">
                          <div className="font-hand text-base font-bold text-[#8FBF8A]">
                            {m.correction}
                          </div>
                          {m.explanation && (
                            <div className="text-[11px] text-[#F5F1E6]/60 mt-0.5">
                              {m.explanation}
                            </div>
                          )}
                        </div>
                      </div>

                      {onClarifyMistake && (
                        <div className="pt-1 flex items-center justify-end">
                          <button
                            onClick={() => onClarifyMistake(m)}
                            className="px-2.5 py-1 rounded-lg bg-[#81D4FA]/15 hover:bg-[#81D4FA]/25 text-[#81D4FA] border border-[#81D4FA]/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                            title="Get a clear, accurate explanation for why this error occurred"
                          >
                            <Lightbulb className="w-3 h-3" />
                            <span>Clarify Why This Is Wrong</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step-by-Step Correct Process & Verified Answer */}
            {feedback.correct_solution && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1C2F27] to-[#15231D] border-2 border-[#E8C468]/60 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E8C468]">
                    <Sparkles className="w-4 h-4 text-[#E8C468]" />
                    <span>Verified Correct Process</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onOpenAnimatedExplanation && (
                      <button
                        onClick={() => onOpenAnimatedExplanation(activeQuestion || topic)}
                        className="px-2.5 py-1 rounded-lg bg-[#E8C468]/20 hover:bg-[#E8C468]/30 text-[#E8C468] border border-[#E8C468]/40 text-[11px] font-bold flex items-center gap-1 shadow transition-all active:scale-95"
                        title="Watch full AI animated explanation step-by-step with voice on chalkboard"
                      >
                        <Sparkles className="w-3 h-3 text-[#E8C468]" />
                        <span>Animate on Slate</span>
                      </button>
                    )}
                    {onDrawCorrectProcessOnSlate && (
                      <button
                        onClick={() => onDrawCorrectProcessOnSlate(feedback)}
                        className="px-2.5 py-1 rounded-lg bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6] border border-[#F5F1E6]/20 text-[11px] font-bold flex items-center gap-1 shadow transition-all active:scale-95"
                        title="Draw static solution strokes on chalkboard"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Chalk</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Final Verified Answer Banner */}
                <div className="bg-[#182821] p-3 rounded-xl border border-[#E8C468]/40 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#E8C468]">
                    Verified Final Answer:
                  </div>
                  <div className="font-hand text-lg font-bold text-[#E8C468]">
                    {feedback.correct_solution.final_correct_answer}
                  </div>
                </div>

                {/* Step list */}
                {feedback.correct_solution.step_by_step_process && feedback.correct_solution.step_by_step_process.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-[#81D4FA] uppercase tracking-wider">
                      Solution Steps:
                    </div>
                    {feedback.correct_solution.step_by_step_process.map((step, idx) => (
                      <div key={idx} className="bg-[#213A30]/80 p-2.5 rounded-xl border border-[#F5F1E6]/10 text-xs space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-[#81D4FA]/20 text-[#81D4FA] font-bold text-[10px] flex items-center justify-center">
                            {step.step_number || idx + 1}
                          </span>
                          <span className="font-bold text-[#F5F1E6]">{step.step_title}</span>
                        </div>
                        {step.expression && (
                          <div className="font-hand text-sm text-[#E8C468] bg-[#182821] px-2 py-1 rounded border border-[#F5F1E6]/10">
                            {step.expression}
                          </div>
                        )}
                        <p className="text-[11px] text-[#F5F1E6]/75 leading-relaxed font-sans">
                          {step.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {feedback.correct_solution.key_takeaway && (
                  <div className="text-[11px] text-[#8FBF8A] bg-[#8FBF8A]/10 p-2.5 rounded-xl border border-[#8FBF8A]/20 flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#8FBF8A] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#8FBF8A]">Key Concept: </strong>
                      <span>{feedback.correct_solution.key_takeaway}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Practical Study Tips */}
            {feedback.tips && feedback.tips.length > 0 && (
              <div className="bg-[#213A30]/70 border border-[#F5F1E6]/10 p-3 rounded-2xl space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#E8C468]" />
                  Tutor Recommendations
                </div>
                <ul className="space-y-1 text-xs text-[#F5F1E6]/80 list-disc list-inside">
                  {feedback.tips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up Q&A Thread */}
            <div className="pt-2 border-t border-[#F5F1E6]/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E6]/60 mb-2">
                Ask Chalkboard Tutor
              </div>

              {chatMessages.length > 0 && (
                <div className="space-y-2 mb-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#182821] text-[#F5F1E6]/90 ml-4 border border-[#F5F1E6]/10'
                          : 'bg-[#E8C468]/15 text-[#F5F1E6] mr-4 border-l-2 border-[#E8C468]'
                      }`}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1">
                        {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-[#E8C468]" />}
                        {msg.role === 'user' ? 'You' : 'Tutor'}
                      </div>
                      <div className="whitespace-pre-line">{msg.text}</div>
                    </div>
                  ))}
                </div>
              )}

              {isAsking && (
                <div className="p-3 rounded-2xl bg-[#E8C468]/10 text-xs text-[#E8C468] flex items-center gap-2 animate-pulse mb-3">
                  <Bot className="w-4 h-4 animate-bounce" />
                  Thinking step-by-step…
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Tutor Input Footer */}
      {feedback && (
        <div className="p-3 border-t border-[#F5F1E6]/10 bg-[#182821]/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              placeholder="Ask why a step was wrong, or clarify…"
              className="flex-1 bg-[#213A30] border border-[#F5F1E6]/15 rounded-xl px-3 py-2 text-xs text-[#F5F1E6] placeholder-[#F5F1E6]/40 focus:outline-none focus:border-[#E8C468]"
            />
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-xl border transition-all ${
                isListening
                  ? 'bg-[#E2725B] text-white border-[#E2725B] animate-pulse'
                  : 'bg-[#213A30] text-[#F5F1E6]/70 border-[#F5F1E6]/10 hover:text-[#F5F1E6]'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={!askInput.trim() || isAsking}
              className="p-2 rounded-xl bg-[#E8C468] text-[#182821] hover:bg-[#f0d182] font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none"
              title="Send Question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </aside>
    </>
  );
}
