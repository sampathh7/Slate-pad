import React, { useState } from 'react';
import { 
  AdaptiveStudentProfile, 
  FeedbackHistoryItem, 
  TutorMode, 
  StudentMasteryLevel 
} from '../types';
import { 
  getLevelBadgeInfo, 
  saveTutorMode 
} from '../utils/adaptiveTutor';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Award, 
  Zap, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  RotateCcw, 
  X, 
  Sliders, 
  GraduationCap, 
  Flame,
  ArrowRight
} from 'lucide-react';

interface AdaptiveTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: AdaptiveStudentProfile;
  history: FeedbackHistoryItem[];
  topic: string;
  onGenerateAdaptiveQuestions: () => void;
  onChangeTutorMode: (mode: TutorMode) => void;
  onClearHistory: () => void;
}

export default function AdaptiveTutorModal({
  isOpen,
  onClose,
  studentProfile,
  history,
  topic,
  onGenerateAdaptiveQuestions,
  onChangeTutorMode,
  onClearHistory,
}: AdaptiveTutorModalProps) {
  const [selectedMode, setSelectedMode] = useState<TutorMode>(studentProfile.tutorMode || 'auto_adaptive');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const badge = getLevelBadgeInfo(studentProfile.level);

  const handleModeChange = (mode: TutorMode) => {
    setSelectedMode(mode);
    onChangeTutorMode(mode);
    saveTutorMode(mode);
  };

  const getTrendIcon = () => {
    if (studentProfile.recentTrend === 'improving') {
      return <TrendingUp className="w-4 h-4 text-[#8FBF8A]" />;
    }
    if (studentProfile.recentTrend === 'needs_support') {
      return <TrendingDown className="w-4 h-4 text-[#E2725B]" />;
    }
    return <Minus className="w-4 h-4 text-[#E8C468]" />;
  };

  const getTrendLabel = () => {
    if (studentProfile.recentTrend === 'improving') {
      return 'Accelerating (Scores rising steadily)';
    }
    if (studentProfile.recentTrend === 'needs_support') {
      return 'Support Scaffolding Active (Calibrating steps)';
    }
    return 'Steady Practice (Solid baseline)';
  };

  return (
    <div 
      id="adaptiveTutorModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-[#1C2B24] border border-[#F5F1E6]/15 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-[#F5F1E6] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F5F1E6]/10 flex items-center justify-between bg-[#182821]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8C468]/20 border border-[#E8C468]/40 flex items-center justify-center text-[#E8C468] shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-hand text-2xl sm:text-3xl font-bold text-[#E8C468] tracking-wide leading-none">
                Adaptive AI Tutor Center
              </h2>
              <p className="text-xs text-[#F5F1E6]/60 mt-1">
                Real-world pedagogical adaptation based on handwriting mastery & error tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#F5F1E6]/50 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Main Mastery Level Banner */}
          <div className={`p-4 rounded-2xl border ${badge.bg} relative overflow-hidden`}>
            <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest font-bold opacity-80">
                    Current Assessed Mastery
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-hand text-[#F5F1E6]">
                  {studentProfile.levelTitle}
                </h3>
                <p className="text-xs opacity-90 leading-relaxed max-w-md">
                  {badge.desc}
                </p>
              </div>

              {/* Score Gauge */}
              <div className="bg-[#182821]/80 px-4 py-3 rounded-2xl border border-[#F5F1E6]/10 text-center shrink-0 min-w-[120px]">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                  Mastery Index
                </div>
                <div className="text-3xl font-mono-code font-bold mt-0.5">
                  {studentProfile.overallMasteryScore}<span className="text-sm font-normal opacity-60">/100</span>
                </div>
                <div className="text-[10px] mt-0.5 opacity-80 flex items-center justify-center gap-1">
                  {studentProfile.streakCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[#FFB74D] font-bold">
                      <Flame className="w-3 h-3 fill-current" /> {studentProfile.streakCount} streak
                    </span>
                  )}
                  {studentProfile.streakCount === 0 && 'Calibrated'}
                </div>
              </div>
            </div>

            {/* Mastery Progress Bar */}
            <div className="mt-4 pt-3 border-t border-current/20 space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold opacity-90">
                <span>Learning Curve Progression</span>
                <span>{studentProfile.overallMasteryScore}% Mastery</span>
              </div>
              <div className="w-full bg-[#182821]/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="h-full rounded-full transition-all duration-700 bg-current"
                  style={{ width: `${Math.max(6, Math.min(100, studentProfile.overallMasteryScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] uppercase tracking-wider opacity-60 px-1">
                <span>Foundational (0-59)</span>
                <span>Developing (60-79)</span>
                <span>Proficient (80-91)</span>
                <span>Master (92+)</span>
              </div>
            </div>
          </div>

          {/* Real-World Tutor Pedagogical Diagnostic Card */}
          <div className="bg-[#213A30] border border-[#F5F1E6]/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E8C468]" />
                <h4 className="font-hand text-xl font-bold text-[#E8C468]">
                  AI Tutor Real-World Diagnosis
                </h4>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#182821] text-xs font-medium border border-[#F5F1E6]/10">
                {getTrendIcon()}
                <span className="text-[11px]">{getTrendLabel()}</span>
              </div>
            </div>

            <p className="text-xs text-[#F5F1E6]/80 leading-relaxed bg-[#182821]/60 p-3 rounded-xl border border-[#F5F1E6]/5">
              "{studentProfile.tutorRecommendation}"
            </p>

            {/* Strengths & Targeted Friction Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Strengths */}
              <div className="bg-[#182821]/40 border border-[#8FBF8A]/20 p-3 rounded-xl space-y-1.5">
                <div className="text-[11px] font-bold text-[#8FBF8A] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Identified Strengths
                </div>
                <ul className="text-xs text-[#F5F1E6]/80 space-y-1">
                  {studentProfile.identifiedStrengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#8FBF8A] text-sm leading-none">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses / Friction points to scaffold */}
              <div className="bg-[#182821]/40 border border-[#E8C468]/20 p-3 rounded-xl space-y-1.5">
                <div className="text-[11px] font-bold text-[#E8C468] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Target Focus Areas
                </div>
                <ul className="text-xs text-[#F5F1E6]/80 space-y-1">
                  {studentProfile.identifiedWeaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#E8C468] text-sm leading-none">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Tutor Pacing & Scaffolding Mode Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#E8C468]" />
              <h4 className="font-hand text-xl font-bold text-[#E8C468]">
                Tutor Scaffolding & Pacing Mode
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Auto-Adaptive */}
              <button
                id="modeAutoAdaptiveBtn"
                onClick={() => handleModeChange('auto_adaptive')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedMode === 'auto_adaptive'
                    ? 'bg-[#E8C468]/15 border-[#E8C468] text-[#F5F1E6] ring-1 ring-[#E8C468]'
                    : 'bg-[#213A30] border-[#F5F1E6]/10 text-[#F5F1E6]/70 hover:border-[#F5F1E6]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-xs text-[#E8C468]">
                    <span>Auto-Adaptive Tutor</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#E8C468]/20">Recommended</span>
                  </div>
                  <p className="text-[11px] text-[#F5F1E6]/70 mt-1 leading-snug">
                    AI automatically analyzes every score and mistake to dial up or down the difficulty dynamically.
                  </p>
                </div>
              </button>

              {/* Option 2: Gentle Scaffolding */}
              <button
                id="modeGentleBtn"
                onClick={() => handleModeChange('gentle_scaffolding')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedMode === 'gentle_scaffolding'
                    ? 'bg-[#81D4FA]/15 border-[#81D4FA] text-[#F5F1E6] ring-1 ring-[#81D4FA]'
                    : 'bg-[#213A30] border-[#F5F1E6]/10 text-[#F5F1E6]/70 hover:border-[#F5F1E6]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-xs text-[#81D4FA]">
                    <span>Gentle Scaffolding</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#81D4FA]/20">Step Hints</span>
                  </div>
                  <p className="text-[11px] text-[#F5F1E6]/70 mt-1 leading-snug">
                    Forces introductory questions, intuitive numbers, and step hints to build foundational confidence.
                  </p>
                </div>
              </button>

              {/* Option 3: Standard Syllabus Practice */}
              <button
                id="modeStandardBtn"
                onClick={() => handleModeChange('standard_practice')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedMode === 'standard_practice'
                    ? 'bg-[#8FBF8A]/15 border-[#8FBF8A] text-[#F5F1E6] ring-1 ring-[#8FBF8A]'
                    : 'bg-[#213A30] border-[#F5F1E6]/10 text-[#F5F1E6]/70 hover:border-[#F5F1E6]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-xs text-[#8FBF8A]">
                    <span>Standard Practice</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#8FBF8A]/20">Regular</span>
                  </div>
                  <p className="text-[11px] text-[#F5F1E6]/70 mt-1 leading-snug">
                    Standard curriculum pace with balanced questions for regular homework and review drills.
                  </p>
                </div>
              </button>

              {/* Option 4: Deep Challenge / Olympiad */}
              <button
                id="modeChallengeBtn"
                onClick={() => handleModeChange('deep_challenge')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedMode === 'deep_challenge'
                    ? 'bg-[#FF8A80]/15 border-[#FF8A80] text-[#F5F1E6] ring-1 ring-[#FF8A80]'
                    : 'bg-[#213A30] border-[#F5F1E6]/10 text-[#F5F1E6]/70 hover:border-[#F5F1E6]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-xs text-[#FF8A80]">
                    <span>Olympiad / Challenge</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#FF8A80]/20">Advanced</span>
                  </div>
                  <p className="text-[11px] text-[#F5F1E6]/70 mt-1 leading-snug">
                    High complexity, multi-step problem solving, proof reasoning, and real-world mathematical twists.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick History Snapshot */}
          <div className="bg-[#182821] p-3.5 rounded-2xl border border-[#F5F1E6]/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F5F1E6]/70 uppercase tracking-wider">
                Recent Drill Scores ({history.length} completed)
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => setShowResetConfirm(!showResetConfirm)}
                  className="text-[11px] text-[#E2725B] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Curve
                </button>
              )}
            </div>

            {showResetConfirm && (
              <div className="bg-[#2A1818] border border-[#E2725B]/40 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2">
                <span className="text-[#F5F1E6]/90">Reset your practice history and learning profile?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClearHistory();
                      setShowResetConfirm(false);
                    }}
                    className="px-2.5 py-1 bg-[#E2725B] text-white rounded-lg font-bold text-[11px]"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 bg-[#213A30] text-[#F5F1E6]/70 rounded-lg text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {history.length === 0 ? (
              <p className="text-xs text-[#F5F1E6]/40 italic py-2 text-center">
                No chalkboard attempts yet. Write on the board and click "Check My Work" to start adapting!
              </p>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {history.slice(-8).map((h, i) => (
                  <div
                    key={h.id || i}
                    className="bg-[#213A30] border border-[#F5F1E6]/10 rounded-xl p-2 min-w-[70px] text-center shrink-0"
                    title={`${h.topic}: ${h.score}/100`}
                  >
                    <div className="text-[10px] text-[#F5F1E6]/50 truncate max-w-[60px] mx-auto">
                      {h.topic}
                    </div>
                    <div className={`font-mono-code font-bold text-sm mt-0.5 ${
                      h.score >= 85 ? 'text-[#8FBF8A]' : h.score >= 60 ? 'text-[#E8C468]' : 'text-[#E2725B]'
                    }`}>
                      {h.score}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#F5F1E6]/10 bg-[#182821] flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-[#F5F1E6]/60 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#E8C468]" />
            <span>Target Topic: <strong className="text-[#F5F1E6]">{topic || 'General Practice'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="closeAdaptiveModalBtn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6]/80 text-xs font-semibold border border-[#F5F1E6]/15 transition-colors"
            >
              Done
            </button>
            <button
              id="generateAdaptiveDrillsBtn"
              onClick={() => {
                onGenerateAdaptiveQuestions();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#E8C468] hover:bg-[#D4B054] text-[#182821] text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Generate Adaptive Drills
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
