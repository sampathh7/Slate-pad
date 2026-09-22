import React, { useState, useEffect } from 'react';
import { AdaptiveQuestionItem, QuestionDifficulty } from '../types';
import { 
  Lightbulb, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Pencil, 
  X,
  Volume2,
  VolumeX,
  Star,
  Compass
} from 'lucide-react';

interface SlateQuestionHeaderProps {
  topic: string;
  activeQuestion: string;
  adaptiveQuestions: AdaptiveQuestionItem[];
  questions: string[];
  onSelectQuestion: (question: string) => void;
  onStampQuestionToSlate?: (questionText: string) => void;
  onOpenCurriculumGoal?: () => void;
  onGenerateQuestions?: () => void;
  isGeneratingQuestions?: boolean;
}

export default function SlateQuestionHeader({
  topic,
  activeQuestion,
  adaptiveQuestions,
  questions,
  onSelectQuestion,
  onStampQuestionToSlate,
  onOpenCurriculumGoal,
  onGenerateQuestions,
  isGeneratingQuestions = false,
}: SlateQuestionHeaderProps) {
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Find active question object metadata
  const activeQuestionObj = adaptiveQuestions.find((aq) => aq.question === activeQuestion);
  const currentIndex = questions.findIndex((q) => q === activeQuestion);
  const totalCount = questions.length;

  const currentDisplayQuestion = activeQuestion || (topic ? `Topic: ${topic}` : "Let's draw & solve math on the chalkboard!");

  // Text-To-Speech for Kids
  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${activeQuestion || topic}. ${activeQuestionObj?.scaffoldingHint ? 'Hint: ' + activeQuestionObj.scaffoldingHint : ''}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.92;
    utterance.pitch = 1.1;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeQuestion]);

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      onSelectQuestion(questions[currentIndex - 1]);
      setShowHint(false);
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalCount - 1) {
      onSelectQuestion(questions[currentIndex + 1]);
      setShowHint(false);
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  };

  // If no question is loaded yet, show a minimal chalk invitation line
  if (!activeQuestion && questions.length === 0) {
    return (
      <div 
        id="slateEmptyChalkPrompt"
        className="w-full flex items-center justify-between px-3 py-1.5 bg-[#14231C]/80 border-b border-[#F5F1E6]/10 rounded-t-xl"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🖍️</span>
          <span className="font-hand text-lg sm:text-xl text-[#F5F1E6] tracking-wide">
            {topic ? `Topic: ${topic} — Write or draw your solution below!` : "Write with chalk below or tell AI what to draw!"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onGenerateQuestions && (
            <button
              onClick={onGenerateQuestions}
              disabled={isGeneratingQuestions}
              className="px-2.5 py-1 rounded-lg bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingQuestions ? 'animate-spin' : ''}`} />
              <span>{isGeneratingQuestions ? 'Loading…' : 'Load Questions'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      id="slateChalkQuestionStrip"
      className="w-full bg-[#122019]/90 border-b-2 border-[#E8C468]/30 px-3 sm:px-4 py-1.5 rounded-t-xl transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        {/* Authentic Chalk Handwritten Question Line */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {totalCount > 1 && (
            <span className="text-xs font-bold text-[#E8C468] bg-[#E8C468]/15 px-2 py-0.5 rounded-md border border-[#E8C468]/30 shrink-0">
              Q{currentIndex + 1}/{totalCount}
            </span>
          )}

          <h2 
            id="chalkQuestionText"
            className="font-hand text-xl sm:text-2xl lg:text-3xl text-[#F5F1E6] font-bold tracking-wide leading-tight truncate flex-1"
            style={{
              textShadow: '0 0 2px rgba(245, 241, 230, 0.7), 0 0 8px rgba(232, 196, 104, 0.25)',
              letterSpacing: '0.02em',
            }}
            title={currentDisplayQuestion}
          >
            {currentDisplayQuestion}
          </h2>
        </div>

        {/* Compact Action Buttons (Read aloud, Next, Clue, Chalk onto slate) */}
        <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
          {/* Read Aloud */}
          <button
            onClick={handleReadAloud}
            className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              isSpeaking 
                ? 'bg-[#81D4FA] text-[#121F19] shadow-md animate-pulse' 
                : 'bg-[#81D4FA]/15 hover:bg-[#81D4FA]/25 text-[#81D4FA] border border-[#81D4FA]/30'
            }`}
            title="Read question aloud"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Read'}</span>
          </button>

          {/* Previous / Next Switcher */}
          {totalCount > 1 && (
            <div className="flex items-center gap-0.5 bg-[#182821] p-0.5 rounded-lg border border-[#F5F1E6]/10">
              <button
                onClick={handlePrevQuestion}
                disabled={currentIndex <= 0}
                className="p-1 text-[#F5F1E6]/80 hover:text-[#F5F1E6] disabled:opacity-20"
                title="Previous question"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentIndex >= totalCount - 1}
                className="p-1 text-[#F5F1E6]/80 hover:text-[#F5F1E6] disabled:opacity-20"
                title="Next question"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Clue Toggle */}
          {activeQuestionObj?.scaffoldingHint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                showHint
                  ? 'bg-[#E8C468] text-[#182821]'
                  : 'bg-[#E8C468]/15 hover:bg-[#E8C468]/25 text-[#E8C468] border border-[#E8C468]/30'
              }`}
              title="Show teacher clue"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clue</span>
            </button>
          )}

          {/* Chalk on Board Button */}
          {onStampQuestionToSlate && (
            <button
              onClick={() => onStampQuestionToSlate(activeQuestion)}
              className="px-2 py-1 rounded-lg bg-[#8FBF8A]/15 hover:bg-[#8FBF8A]/25 text-[#8FBF8A] border border-[#8FBF8A]/30 text-xs font-bold flex items-center gap-1 transition-all"
              title="Draw question text directly with chalk on canvas"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chalk on Slate</span>
            </button>
          )}
        </div>
      </div>

      {/* Clue popdown if requested */}
      {showHint && activeQuestionObj?.scaffoldingHint && (
        <div className="mt-1.5 p-2 bg-[#182821] border border-[#E8C468]/40 rounded-lg text-xs text-[#F5F1E6] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🦉</span>
            <span className="text-[#E8C468] font-bold">Hint:</span>
            <span>{activeQuestionObj.scaffoldingHint}</span>
          </div>
          <button onClick={() => setShowHint(false)} className="text-[#F5F1E6]/50 hover:text-[#F5F1E6]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
