import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  BookOpen, 
  HelpCircle, 
  ListPlus,
  Compass,
  Radio,
  Palette,
  Pencil,
  Lightbulb,
  ChevronDown,
  Info,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Star,
  CheckCircle2,
  X,
  ShieldCheck,
  ScanLine,
  Bookmark,
  Flame,
  AlertTriangle
} from 'lucide-react';
import ProgressTracker from './ProgressTracker';
import { 
  FeedbackHistoryItem, 
  BoardThemeOption, 
  AdaptiveStudentProfile,
  AdaptiveQuestionItem,
  ChildAgeBracket,
  EyeCareSettings,
  DailyProgressStats
} from '../types';
import { CHILD_AGE_CONFIGS } from '../utils/agePresets';
import { getDifficultyBadgeColor } from '../utils/adaptiveTutor';
import QuickGuideModal from './QuickGuideModal';

interface HeaderToolbarProps {
  topic: string;
  setTopic: (t: string) => void;
  questions: string[];
  adaptiveQuestions?: AdaptiveQuestionItem[];
  activeQuestion: string;
  setActiveQuestion: (q: string) => void;
  onGenerateQuestions: () => void;
  isGeneratingQuestions: boolean;
  isFeedbackOpen: boolean;
  setIsFeedbackOpen: (open: boolean) => void;
  hasFeedback: boolean;
  history: FeedbackHistoryItem[];
  onClearHistory: () => void;
  onOpenLiveVoice: () => void;
  onOpenColorSettings?: () => void;
  onOpenAutoDraw?: () => void;
  onOpenMathSolver?: () => void;
  onOpenCurriculumGoal?: () => void;
  boardTheme?: BoardThemeOption;
  studentProfile?: AdaptiveStudentProfile;
  onOpenAdaptiveTutor?: () => void;
  onSelectSampleTopic?: (topic: string, question: string) => void;
  ageBracket?: ChildAgeBracket;
  onSelectAgeBracket?: (age: ChildAgeBracket) => void;
  onStampQuestionToSlate?: (questionText: string) => void;
  eyeCareSettings?: EyeCareSettings;
  onOpenEyeCareModal?: () => void;
  onToggleEyeCare?: () => void;
  onOpenHandwritingIdentifier?: () => void;
  dailyStats?: DailyProgressStats;
  pendingMistakesCount?: number;
  onOpenSavedSessions?: () => void;
  onOpenMistakeBank?: () => void;
  onOpenAskClarify?: () => void;
  onOpenAnimatedExplanation?: (problem?: string) => void;
  onNextQuestion?: () => void;
  onCheckWork?: () => void;
  isChecking?: boolean;
  hasStrokes?: boolean;
}

export default function HeaderToolbar({
  topic,
  setTopic,
  questions,
  adaptiveQuestions = [],
  activeQuestion,
  setActiveQuestion,
  onGenerateQuestions,
  isGeneratingQuestions,
  isFeedbackOpen,
  setIsFeedbackOpen,
  hasFeedback,
  history,
  onClearHistory,
  onOpenLiveVoice,
  onOpenColorSettings,
  onOpenAutoDraw,
  onOpenMathSolver,
  onOpenCurriculumGoal,
  boardTheme,
  studentProfile,
  onOpenAdaptiveTutor,
  onSelectSampleTopic,
  ageBracket = '8-9',
  onSelectAgeBracket,
  onStampQuestionToSlate,
  eyeCareSettings,
  onOpenEyeCareModal,
  onToggleEyeCare,
  onOpenHandwritingIdentifier,
  dailyStats,
  pendingMistakesCount = 0,
  onOpenSavedSessions,
  onOpenMistakeBank,
  onOpenAskClarify,
  onOpenAnimatedExplanation,
  onNextQuestion,
  onCheckWork,
  isChecking = false,
  hasStrokes = false,
}: HeaderToolbarProps) {
  const [isMicActive, setIsMicActive] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  const [showFullQuestionModal, setShowFullQuestionModal] = useState(false);

  const currentAgeConfig = CHILD_AGE_CONFIGS[ageBracket] || CHILD_AGE_CONFIGS['8-9'];
  const activeQuestionObj = adaptiveQuestions.find((q) => q.question === activeQuestion);
  const currentIndex = questions.findIndex((q) => q === activeQuestion);
  const totalCount = questions.length;

  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isMicActive) {
      setIsMicActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsMicActive(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setTopic(transcript);
      }
    };
    recognition.onerror = () => setIsMicActive(false);
    recognition.onend = () => setIsMicActive(false);

    recognition.start();
  };

  // Text-To-Speech for Kids: Warm, friendly read-aloud
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
    utterance.rate = ageBracket === '6-7' ? 0.88 : 0.95;
    utterance.pitch = ageBracket === '6-7' ? 1.15 : 1.08;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNextQuestion = () => {
    if (totalCount === 0) return;
    const nextIdx = (currentIndex + 1) % totalCount;
    setActiveQuestion(questions[nextIdx]);
    setActiveHint(null);
  };

  const handlePrevQuestion = () => {
    if (totalCount === 0) return;
    const prevIdx = (currentIndex - 1 + totalCount) % totalCount;
    setActiveQuestion(questions[prevIdx]);
    setActiveHint(null);
  };

  const badgeInfo = activeQuestionObj?.difficulty 
    ? getDifficultyBadgeColor(activeQuestionObj.difficulty)
    : { text: 'text-[#E8C468]', bg: 'bg-[#E8C468]/15', border: 'border-[#E8C468]/30', label: 'Practice Question' };

  return (
    <header 
      id="mainHeader"
      className="border-b border-[#F5F1E6]/10 flex flex-col shrink-0 z-20 transition-colors duration-300 shadow-md"
      style={{ backgroundColor: boardTheme?.appBackground || '#182821' }}
    >
      {/* Single Unified Tablet Header Bar */}
      <div className="px-2 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2.5 min-h-[54px]">
        {/* Left: Brand & Age Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div 
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={() => setShowGuideModal(true)}
            title="Slate - AI Chalk Pad"
          >
            <div className="w-8 h-8 rounded-xl bg-[#E8C468]/20 border border-[#E8C468]/40 flex items-center justify-center text-[#E8C468] shadow-inner">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-hand font-bold text-xl sm:text-2xl text-[#E8C468] tracking-wide leading-none hidden sm:inline">
              Slate
            </span>
          </div>

          {/* Child Age Bracket Selector (Ages 6-12) */}
          <div className="relative">
            <button
              id="ageSelectorBtn"
              type="button"
              onClick={() => {
                setShowAgeDropdown(!showAgeDropdown);
                setShowTopicsDropdown(false);
                setShowToolsMenu(false);
              }}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-[#14231C] border border-[#F5F1E6]/15 hover:border-[#E8C468]/40 text-xs font-bold text-[#F5F1E6] flex items-center gap-1 transition-all shadow-sm"
              title="Select age bracket"
            >
              <span>{currentAgeConfig.icon}</span>
              <span className="hidden md:inline">{currentAgeConfig.label}</span>
              <span className="md:hidden">{ageBracket}</span>
              <ChevronDown className="w-3 h-3 text-[#F5F1E6]/60" />
            </button>

            {showAgeDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowAgeDropdown(false)} 
                />
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-[#14231C] border-2 border-[#E8C468]/40 rounded-2xl shadow-2xl p-2 z-40 animate-in fade-in flex flex-col gap-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E8C468]">
                    Select Age Bracket
                  </div>
                  {(['6-7', '8-9', '10-12'] as ChildAgeBracket[]).map((ageKey) => {
                    const cfg = CHILD_AGE_CONFIGS[ageKey];
                    const isSelected = ageBracket === ageKey;
                    return (
                      <button
                        key={ageKey}
                        type="button"
                        onClick={() => {
                          onSelectAgeBracket?.(ageKey);
                          setShowAgeDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#E8C468] text-[#182821]'
                            : 'text-[#F5F1E6] hover:bg-[#213A30]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cfg.icon}</span>
                          <div>
                            <div>{cfg.label} ({cfg.grades})</div>
                            <div className={`text-[10px] ${isSelected ? 'text-[#182821]/80' : 'text-[#F5F1E6]/50'}`}>
                              {cfg.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Topic Picker Dropdown */}
          <div className="relative">
            <button
              id="topicSelectorBtn"
              type="button"
              onClick={() => {
                setShowTopicsDropdown(!showTopicsDropdown);
                setShowAgeDropdown(false);
                setShowToolsMenu(false);
              }}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#E8C468] border border-[#8FBF8A]/30 text-xs font-bold flex items-center gap-1 transition-all max-w-[120px] sm:max-w-[160px] truncate shadow-sm"
              title="Change Learning Topic"
            >
              <span className="truncate">🎯 {topic || currentAgeConfig.defaultTopics[0]}</span>
              <ChevronDown className="w-3 h-3 text-[#8FBF8A] shrink-0" />
            </button>

            {showTopicsDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowTopicsDropdown(false)} 
                />
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#14231C] border-2 border-[#8FBF8A]/40 rounded-2xl shadow-2xl p-2.5 z-40 animate-in fade-in flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8FBF8A]">
                      {currentAgeConfig.label} Topics
                    </span>
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isMicActive
                          ? 'bg-[#E2725B] text-white animate-pulse'
                          : 'bg-[#213A30] text-[#81D4FA] hover:text-white'
                      }`}
                      title="Speak Topic"
                    >
                      {isMicActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">Voice</span>
                    </button>
                  </div>

                  {currentAgeConfig.defaultTopics.map((top) => (
                    <button
                      key={top}
                      type="button"
                      onClick={() => {
                        setTopic(top);
                        setShowTopicsDropdown(false);
                        if (onSelectSampleTopic) {
                          const qs = currentAgeConfig.defaultQuestions[top] || [];
                          onSelectSampleTopic(top, qs[0] || top);
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#F5F1E6] hover:bg-[#213A30] hover:text-[#E8C468] transition-colors flex items-center justify-between"
                    >
                      <span>{top}</span>
                      {topic === top && <span className="text-[#E8C468] font-bold">✓</span>}
                    </button>
                  ))}

                  {ageBracket !== '6-7' && (
                    <div className="pt-2 border-t border-[#F5F1E6]/10 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setShowTopicsDropdown(false);
                            onGenerateQuestions();
                          }
                        }}
                        placeholder="Custom topic…"
                        className="flex-1 bg-[#213A30] border border-[#F5F1E6]/15 rounded-lg px-2 py-1 text-xs text-[#F5F1E6] placeholder-[#F5F1E6]/40 focus:outline-none focus:border-[#E8C468]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowTopicsDropdown(false);
                          onGenerateQuestions();
                        }}
                        disabled={isGeneratingQuestions}
                        className="px-2 py-1 rounded-lg bg-[#E8C468] text-[#182821] text-xs font-bold hover:bg-[#f0d182]"
                      >
                        Go
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Active Question Display & Read to Me (Optimized for 6y Tablet View) */}
        <div className="flex-1 mx-1 sm:mx-3 flex items-center justify-center gap-1 sm:gap-2 min-w-0">
          {/* Read to Me Button */}
          <button
            id="readQuestionBtn"
            type="button"
            onClick={handleReadAloud}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border transition-all shrink-0 flex items-center gap-1 shadow-sm ${
              isSpeaking
                ? 'bg-[#81D4FA] text-[#121F19] border-[#81D4FA] animate-bounce'
                : 'bg-[#213A30] text-[#81D4FA] border-[#81D4FA]/30 hover:bg-[#81D4FA]/20'
            }`}
            title={isSpeaking ? 'Stop reading' : '🔊 Read question out loud to me'}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden xl:inline text-xs font-bold">{isSpeaking ? 'Stop' : 'Read'}</span>
          </button>

          {/* Difficulty Badge (Desktop/Tablet) */}
          <span className={`hidden md:inline text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-lg border shrink-0 ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}>
            {activeQuestionObj?.difficulty || 'Practice'}
          </span>

          {/* Question Text & Click to View Full Question */}
          <button
            type="button"
            onClick={() => setShowFullQuestionModal(true)}
            className="truncate text-center max-w-[180px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg group flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-xl hover:bg-[#213A30]/80 transition-all cursor-pointer"
            title="Click to view full question in detail"
          >
            <span className="font-hand font-bold text-sm sm:text-base md:text-lg text-[#F5F1E6] truncate tracking-wide group-hover:text-[#E8C468] transition-colors">
              {activeQuestion || (topic ? `Topic: ${topic}` : 'Draw or solve on the slate!')}
            </span>
            <span className="hidden lg:inline text-[10px] text-[#E8C468]/60 group-hover:text-[#E8C468] shrink-0 font-sans">
              (View 🔍)
            </span>
          </button>

          {/* Hint Lightbulb Button */}
          {activeQuestionObj?.scaffoldingHint && (
            <button
              type="button"
              onClick={() => setActiveHint(activeHint ? null : (activeQuestionObj.scaffoldingHint || null))}
              className={`p-1.5 sm:px-2 sm:py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors border shadow-sm ${
                activeHint
                  ? 'bg-[#E8C468] text-[#182821] border-[#E8C468]'
                  : 'bg-[#E8C468]/15 text-[#E8C468] border-[#E8C468]/30 hover:bg-[#E8C468]/25'
              }`}
              title="Show helpful hint"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{activeHint ? 'Hide' : 'Hint'}</span>
            </button>
          )}

          {/* Pager Indicator */}
          {totalCount > 1 && (
            <div className="hidden xl:flex items-center gap-0.5 bg-[#1C2B24] px-1.5 py-0.5 rounded-lg border border-[#F5F1E6]/10 text-xs text-[#F5F1E6]/70 shrink-0">
              <button
                type="button"
                onClick={handlePrevQuestion}
                className="hover:text-[#E8C468] p-0.5 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="font-mono text-[10px] font-bold text-[#E8C468]">
                {currentIndex >= 0 ? currentIndex + 1 : 1}/{totalCount}
              </span>
              <button
                type="button"
                onClick={handleNextQuestion}
                className="hover:text-[#E8C468] p-0.5 transition-colors"
                title="Next"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right Action Hub */}
        <div className="flex items-center gap-1.5 shrink-0 order-2 lg:order-3">
          {/* Progress Tracker & Stars */}
          <ProgressTracker 
            history={history} 
            onClearHistory={onClearHistory} 
            studentProfile={studentProfile}
            onOpenAdaptiveTutor={onOpenAdaptiveTutor}
          />

          {/* Live AI Voice Assistant Button */}
          {onOpenLiveVoice && (
            <button
              id="headerLiveVoiceTutorBtn"
              type="button"
              onClick={onOpenLiveVoice}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#81D4FA]/15 hover:bg-[#81D4FA]/25 text-[#81D4FA] border border-[#81D4FA]/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95"
              title="Talk live with AI Voice Tutor"
            >
              <Mic className="w-3.5 h-3.5 text-[#81D4FA] animate-pulse" />
              <span className="hidden sm:inline">Voice Assistant</span>
              <span className="sm:hidden">Voice</span>
            </button>
          )}

          {/* Instant Next Question Button in Header (Prominent for 6-7 year olds) */}
          {onNextQuestion && (
            <button
              id="headerTopNextQuestionBtn"
              type="button"
              onClick={onNextQuestion}
              className="px-3 py-1.5 rounded-xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] text-xs font-bold flex items-center gap-1 shadow-md shadow-[#E8C468]/20 transition-all hover:scale-105 active:scale-95"
              title="Next Question"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#182821]" />
              <span>Next ➡️</span>
            </button>
          )}



          {/* Unified Tools Menu (Parent Tools & Settings) */}
          <div className="relative">
            <button
              id="aiStudioToolsMenuBtn"
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6] border border-[#F5F1E6]/15 text-xs font-medium flex items-center gap-1 transition-all"
              title="Parent Tools & Themes"
            >
              <Palette className="w-3.5 h-3.5 text-[#E8C468]" />
              <span className="hidden md:inline">{ageBracket === '6-7' ? 'Parent & Tools' : 'Tools'}</span>
            </button>

            {showToolsMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowToolsMenu(false)} 
                />
                <div 
                  id="toolsMenuDropdown"
                  className="absolute right-0 top-full mt-2 w-56 bg-[#1C2B24] border border-[#F5F1E6]/15 rounded-2xl shadow-2xl p-2 z-40 animate-in fade-in flex flex-col gap-1"
                >
                  {onOpenLiveVoice && (
                    <button
                      id="toolsMenuLiveVoiceBtn"
                      onClick={() => {
                        setShowToolsMenu(false);
                        onOpenLiveVoice();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold text-[#81D4FA] bg-[#81D4FA]/10 hover:bg-[#81D4FA]/20 border border-[#81D4FA]/30 flex items-center gap-2 transition-colors"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#81D4FA] animate-pulse" />
                      <span>Live Voice Assistant</span>
                    </button>
                  )}

                  {onOpenHandwritingIdentifier && (
                    <button
                      onClick={() => {
                        setShowToolsMenu(false);
                        onOpenHandwritingIdentifier();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#81D4FA] hover:bg-[#213A30] flex items-center gap-2"
                    >
                      <ScanLine className="w-3.5 h-3.5 text-[#81D4FA]" />
                      <span>Handwriting Identifier</span>
                    </button>
                  )}

                  {onOpenSavedSessions && (
                    <button
                      onClick={() => {
                        setShowToolsMenu(false);
                        onOpenSavedSessions();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#8FBF8A] hover:bg-[#213A30] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-[#8FBF8A]" />
                        <span>Saved Sessions & Resume</span>
                      </div>
                      {dailyStats && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8C468]/20 text-[#E8C468]">
                          {dailyStats.currentStreakDays}d streak
                        </span>
                      )}
                    </button>
                  )}

                  {onOpenMistakeBank && (
                    <button
                      onClick={() => {
                        setShowToolsMenu(false);
                        onOpenMistakeBank();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#E2725B] hover:bg-[#213A30] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#E2725B]" />
                        <span>Fix Errors Notebook</span>
                      </div>
                      {pendingMistakesCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E2725B] text-[#121F19]">
                          {pendingMistakesCount}
                        </span>
                      )}
                    </button>
                  )}

                  {onOpenAnimatedExplanation && (
                    <button
                      onClick={() => {
                        setShowToolsMenu(false);
                        onOpenAnimatedExplanation(activeQuestion);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-[#E8C468] hover:bg-[#213A30] flex items-center gap-2 border border-[#E8C468]/20 bg-[#E8C468]/10"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E8C468] animate-spin" />
                      <span>AI Animated Solution on Board</span>
                    </button>
                  )}

                  {onOpenAskClarify && (
                    <button
                      onClick={() => {
                        setShowToolsMenu(false);
                        onOpenAskClarify();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#81D4FA] hover:bg-[#213A30] flex items-center gap-2"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-[#81D4FA]" />
                      <span>Clarify Questions Accurately</span>
                    </button>
                  )}

                  {onOpenEyeCareModal && (
                    <button
                      onClick={() => {
                        setShowToolsMenu(false);
                        onOpenEyeCareModal();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#FFC870] hover:bg-[#213A30] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FFC870]" />
                        <span>Child Eye-Care Shield</span>
                      </div>
                      {eyeCareSettings?.enabled && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFC870]/20 text-[#FFC870]">
                          ON
                        </span>
                      )}
                    </button>
                  )}

                  {onOpenMathSolver && (
                    <button
                      onClick={() => {
                        setShowToolsMenu(false);
                        onOpenMathSolver();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#F5F1E6] hover:bg-[#213A30] flex items-center gap-2"
                    >
                      <Calculator className="w-3.5 h-3.5 text-[#E8C468]" />
                      <span>Math Problem Solver</span>
                    </button>
                  )}

                  {onOpenColorSettings && (
                    <button
                      onClick={() => {
                        setShowToolsMenu(false);
                        onOpenColorSettings();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#F5F1E6] hover:bg-[#213A30] flex items-center gap-2"
                    >
                      <Palette className="w-3.5 h-3.5 text-[#8FBF8A]" />
                      <span>Board Themes & Colors</span>
                    </button>
                  )}

                  {onOpenCurriculumGoal && (
                    <button
                      onClick={() => {
                        setShowToolsMenu(false);
                        onOpenCurriculumGoal();
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#F5F1E6] hover:bg-[#213A30] flex items-center gap-2"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#81D4FA]" />
                      <span>Curriculum Explorer</span>
                    </button>
                  )}

                  <div className="h-px bg-[#F5F1E6]/10 my-1" />

                  <button
                    onClick={() => {
                      setShowToolsMenu(false);
                      setShowGuideModal(true);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#F5F1E6]/80 hover:bg-[#213A30] flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#E8C468]" />
                    <span>How to Use Slate</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tutor Feedback Drawer Toggle Button */}
          <button
            id="tutorFeedbackToggleBtn"
            onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isFeedbackOpen
                ? 'bg-[#E8C468] text-[#182821] shadow-md'
                : hasFeedback
                ? 'bg-[#213A30] text-[#E8C468] border border-[#E8C468]/40 shadow-sm animate-pulse'
                : 'bg-[#213A30] text-[#F5F1E6]/70 border border-[#F5F1E6]/10 hover:text-[#F5F1E6]'
            }`}
            title="Open Tutor Feedback & Grade Report"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Feedback</span>
            {hasFeedback && !isFeedbackOpen && (
              <span className="w-2 h-2 rounded-full bg-[#E8C468]" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Hint Popup Banner */}
      {activeHint && (
        <div className="px-4 py-2 bg-[#E8C468]/15 border-t border-[#E8C468]/30 flex items-center justify-between gap-3 text-xs text-[#E8C468] animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 shrink-0 animate-pulse" />
            <span className="font-medium">
              <strong>Tutor Hint:</strong> {activeHint}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveHint(null)}
            className="p-0.5 text-[#E8C468]/70 hover:text-[#E8C468]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Full Question Detail Modal */}
      {showFullQuestionModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowFullQuestionModal(false)}
        >
          <div 
            className="bg-[#182821] border-2 border-[#E8C468]/50 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 text-[#F5F1E6]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F1E6]/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E8C468] bg-[#E8C468]/15 px-2.5 py-1 rounded-xl border border-[#E8C468]/30">
                  🎯 {topic || 'Drill Problem'}
                </span>
                {activeQuestionObj?.difficulty && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}>
                    {activeQuestionObj.difficulty}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowFullQuestionModal(false)}
                className="p-1.5 rounded-xl text-[#F5F1E6]/60 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complete Question Text */}
            <div className="my-4 py-1">
              <div className="text-xs font-bold text-[#81D4FA] uppercase tracking-wider mb-1.5">Question Prompt:</div>
              <h3 className="font-hand text-xl sm:text-2xl font-bold text-[#F5F1E6] leading-relaxed">
                {activeQuestion || (topic ? `Topic: ${topic}` : 'Draw or solve on the slate!')}
              </h3>
            </div>

            {/* Hint if available */}
            {activeQuestionObj?.scaffoldingHint && (
              <div className="my-3 p-3 rounded-2xl bg-[#E8C468]/10 border border-[#E8C468]/25 flex items-start gap-2.5 text-xs text-[#E8C468]">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-[#E8C468]" />
                <div>
                  <div className="font-bold uppercase tracking-wider text-[10px] text-[#E8C468]/80 mb-0.5">Helpful Hint</div>
                  <div className="text-sm font-hand">{activeQuestionObj.scaffoldingHint}</div>
                </div>
              </div>
            )}

            {/* Actions: Read Aloud + Voice Assistant + Stamp */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[#F5F1E6]/10 mt-4">
              <button
                type="button"
                onClick={handleReadAloud}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isSpeaking
                    ? 'bg-[#81D4FA] text-[#121F19]'
                    : 'bg-[#213A30] hover:bg-[#81D4FA]/20 text-[#81D4FA] border border-[#81D4FA]/30'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'Stop Reading' : '🔊 Read Aloud'}</span>
              </button>

              <div className="flex items-center gap-2">
                {onOpenLiveVoice && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowFullQuestionModal(false);
                      onOpenLiveVoice();
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-[#81D4FA]/20 hover:bg-[#81D4FA]/30 text-[#81D4FA] border border-[#81D4FA]/40 flex items-center gap-1.5 transition-all"
                  >
                    <Mic className="w-4 h-4 text-[#81D4FA]" />
                    <span>Voice Assistant</span>
                  </button>
                )}
                {onStampQuestionToSlate && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowFullQuestionModal(false);
                      onStampQuestionToSlate(activeQuestion);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-[#E8C468] text-[#182821] hover:bg-[#f0d182] flex items-center gap-1.5 transition-all"
                  >
                    <span>✍️ Stamp on Board</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      <QuickGuideModal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)} 
        onSelectSampleTopic={onSelectSampleTopic}
      />
    </header>
  );
}
