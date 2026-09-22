import React, { useState } from 'react';
import { FeedbackHistoryItem, AdaptiveStudentProfile } from '../types';
import { getLevelBadgeInfo } from '../utils/adaptiveTutor';
import { 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Trash2, 
  X, 
  BarChart3,
  ChevronDown,
  Brain,
  Sparkles,
  GraduationCap
} from 'lucide-react';

interface ProgressTrackerProps {
  history: FeedbackHistoryItem[];
  onClearHistory: () => void;
  studentProfile?: AdaptiveStudentProfile;
  onOpenAdaptiveTutor?: () => void;
}

export default function ProgressTracker({ 
  history, 
  onClearHistory, 
  studentProfile,
  onOpenAdaptiveTutor 
}: ProgressTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalDrills = history.length;
  const averageScore = studentProfile 
    ? studentProfile.overallMasteryScore 
    : totalDrills > 0
    ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / totalDrills)
    : 0;

  const highestScore = totalDrills > 0
    ? Math.max(...history.map((item) => item.score))
    : 0;

  const badge = studentProfile ? getLevelBadgeInfo(studentProfile.level) : null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#8FBF8A]';
    if (score >= 60) return 'text-[#E8C468]';
    return 'text-[#E2725B]';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-[#8FBF8A]/15 border-[#8FBF8A]/30 text-[#8FBF8A]';
    if (score >= 60) return 'bg-[#E8C468]/15 border-[#E8C468]/30 text-[#E8C468]';
    return 'bg-[#E2725B]/15 border-[#E2725B]/30 text-[#E2725B]';
  };

  return (
    <div className="relative flex items-center gap-1.5">
      {/* Quick Adaptive Level Pill */}
      {studentProfile && onOpenAdaptiveTutor && (
        <button
          id="adaptiveMasteryPillBtn"
          onClick={onOpenAdaptiveTutor}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] shadow-sm ${
            badge ? badge.bg : 'bg-[#213A30] border-[#F5F1E6]/15 text-[#E8C468]'
          }`}
          title="Open Adaptive AI Tutor Diagnostic Center"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{badge ? badge.shortTitle : 'Adaptive'}:</span>
          <span>{averageScore}%</span>
        </button>
      )}

      {/* Trigger Button / Score Badge in Toolbar */}
      <button
        id="progressTrackerBtn"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6] border border-[#F5F1E6]/15 text-xs font-medium flex items-center gap-2 transition-all hover:border-[#E8C468]/40"
        title="View Overall Practice Progress & History Logs"
      >
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#E8C468]" />
          <span className="text-[#F5F1E6]/70 hidden md:inline">History:</span>
          <span className={`font-mono-code font-bold ${totalDrills > 0 ? getScoreColor(averageScore) : 'text-[#F5F1E6]/40'}`}>
            {totalDrills > 0 ? `${totalDrills} ${totalDrills === 1 ? 'drill' : 'drills'}` : '0 drills'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#F5F1E6]/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            id="progressTrackerPopup"
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#1C2B24] border border-[#F5F1E6]/15 rounded-2xl shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F5F1E6]/10 pb-2.5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#E8C468]" />
                <h3 className="font-hand text-xl font-bold text-[#E8C468] tracking-wide">
                  Practice Progress & Learning Curve
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#F5F1E6]/50 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Adaptive Tutor Center Shortcut Banner */}
            {onOpenAdaptiveTutor && studentProfile && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdaptiveTutor();
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all hover:scale-[1.01] ${
                  badge ? badge.bg : 'bg-[#213A30] border-[#E8C468]/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-current shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold opacity-75">
                      Adaptive Tutor Level
                    </div>
                    <div className="text-xs font-bold">
                      {studentProfile.levelTitle} ({studentProfile.overallMasteryScore}%)
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold underline shrink-0">
                  Open Learning Center →
                </span>
              </button>
            )}

            {/* Score Overview Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#213A30] p-2.5 rounded-xl border border-[#F5F1E6]/10">
                <div className="text-[10px] font-medium uppercase tracking-wider text-[#F5F1E6]/50">
                  Mastery Avg
                </div>
                <div className={`text-xl font-bold font-mono-code mt-0.5 ${totalDrills > 0 ? getScoreColor(averageScore) : 'text-[#F5F1E6]/40'}`}>
                  {totalDrills > 0 ? `${averageScore}%` : '—'}
                </div>
              </div>

              <div className="bg-[#213A30] p-2.5 rounded-xl border border-[#F5F1E6]/10">
                <div className="text-[10px] font-medium uppercase tracking-wider text-[#F5F1E6]/50">
                  Completed
                </div>
                <div className="text-xl font-bold font-mono-code text-[#F5F1E6] mt-0.5">
                  {totalDrills}
                </div>
              </div>

              <div className="bg-[#213A30] p-2.5 rounded-xl border border-[#F5F1E6]/10">
                <div className="text-[10px] font-medium uppercase tracking-wider text-[#F5F1E6]/50">
                  Best Score
                </div>
                <div className={`text-xl font-bold font-mono-code mt-0.5 ${totalDrills > 0 ? getScoreColor(highestScore) : 'text-[#F5F1E6]/40'}`}>
                  {totalDrills > 0 ? `${highestScore}%` : '—'}
                </div>
              </div>
            </div>

            {/* History List */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-[#F5F1E6]/50 mb-2">
                <span>Recent Drill Results</span>
                {totalDrills > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="flex items-center gap-1 text-[#E2725B]/70 hover:text-[#E2725B] transition-colors"
                    title="Clear history logs"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {totalDrills === 0 ? (
                <div className="py-6 text-center text-xs text-[#F5F1E6]/50 bg-[#182821] rounded-xl border border-[#F5F1E6]/10">
                  No feedback results recorded yet.
                  <div className="text-[11px] text-[#F5F1E6]/40 mt-1">
                    Write on the slate and tap "Check My Work" to start tracking.
                  </div>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {history.slice().reverse().map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#213A30] p-2.5 rounded-xl border border-[#F5F1E6]/10 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-[#F5F1E6] truncate">
                          {item.topic || 'Practice Drill'}
                        </div>
                        {item.question && (
                          <div className="text-[11px] text-[#F5F1E6]/50 truncate">
                            {item.question}
                          </div>
                        )}
                        <div className="text-[10px] text-[#F5F1E6]/40 mt-0.5">
                          {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.mistakesCount === 0 ? '0 mistakes' : `${item.mistakesCount} error(s)`}
                        </div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono-code shrink-0 ${getScoreBg(item.score)}`}>
                        {item.score}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
