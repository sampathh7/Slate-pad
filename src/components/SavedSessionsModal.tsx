import React, { useState } from 'react';
import { 
  StudentSessionDraft, 
  DailyProgressStats, 
  ChildAgeBracket,
  BoardThemeOption 
} from '../types';
import { 
  Calendar, 
  Clock, 
  Flame, 
  Bookmark, 
  Save, 
  Play, 
  Trash2, 
  X, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';

interface SavedSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDraft: StudentSessionDraft | null;
  savedSessions: StudentSessionDraft[];
  dailyStats: DailyProgressStats;
  onResumeSession: (session: StudentSessionDraft) => void;
  onSaveCurrentCheckpoint: (name: string) => void;
  onDeleteSession: (sessionId: string) => void;
  currentTopic: string;
  currentQuestion: string;
  strokesCount: number;
}

export default function SavedSessionsModal({
  isOpen,
  onClose,
  activeDraft,
  savedSessions,
  dailyStats,
  onResumeSession,
  onSaveCurrentCheckpoint,
  onDeleteSession,
  currentTopic,
  currentQuestion,
  strokesCount,
}: SavedSessionsModalProps) {
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = sessionNameInput.trim() || `${currentTopic || 'Practice'} Slate`;
    onSaveCurrentCheckpoint(name);
    setSessionNameInput('');
    setIsSaving(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="savedSessionsModal"
        className="w-full max-w-2xl bg-[#1C2B24] border-2 border-[#8FBF8A]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F5F1E6]/10 flex items-center justify-between bg-[#15231D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8FBF8A]/20 border border-[#8FBF8A]/30 flex items-center justify-center text-[#8FBF8A]">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-hand text-2xl font-bold text-[#8FBF8A] leading-tight">
                Student Progress & Saved Sessions
              </h2>
              <p className="text-xs text-[#F5F1E6]/70">
                Resume practice anytime on any day without losing your work
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

        {/* Multi-Day Progress & Streak Banner */}
        <div className="bg-gradient-to-r from-[#182821] via-[#1E3228] to-[#182821] p-4 border-b border-[#F5F1E6]/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#121F19]/80 border border-[#E8C468]/30 p-2.5 rounded-2xl flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E8C468]/20 flex items-center justify-center text-[#E8C468] shrink-0">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#E8C468]">
                  Day Streak
                </div>
                <div className="text-base font-bold text-[#F5F1E6]">
                  {dailyStats.currentStreakDays} {dailyStats.currentStreakDays === 1 ? 'Day' : 'Days'} 🔥
                </div>
              </div>
            </div>

            <div className="bg-[#121F19]/80 border border-[#8FBF8A]/30 p-2.5 rounded-2xl flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#8FBF8A]/20 flex items-center justify-center text-[#8FBF8A] shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#8FBF8A]">
                  Days Active
                </div>
                <div className="text-base font-bold text-[#F5F1E6]">
                  {dailyStats.totalDaysPracticed} Total
                </div>
              </div>
            </div>

            <div className="bg-[#121F19]/80 border border-[#81D4FA]/30 p-2.5 rounded-2xl flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#81D4FA]/20 flex items-center justify-center text-[#81D4FA] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#81D4FA]">
                  Questions
                </div>
                <div className="text-base font-bold text-[#F5F1E6]">
                  {dailyStats.totalProblemsSolved} Solved
                </div>
              </div>
            </div>

            <div className="bg-[#121F19]/80 border border-[#CE93D8]/30 p-2.5 rounded-2xl flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#CE93D8]/20 flex items-center justify-center text-[#CE93D8] shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#CE93D8]">
                  Errors Fixed
                </div>
                <div className="text-base font-bold text-[#F5F1E6]">
                  {dailyStats.totalErrorsFixed} Mastered
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Save Current Session Bar */}
          <div className="p-4 rounded-2xl bg-[#15231D] border border-[#F5F1E6]/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E8C468]">
                <Save className="w-4 h-4" />
                <span>Save Current Slate As Checkpoint</span>
              </div>
              <span className="text-[11px] text-[#F5F1E6]/60">
                {strokesCount} chalk strokes on board
              </span>
            </div>

            <form onSubmit={handleSaveCurrent} className="flex gap-2">
              <input
                type="text"
                value={sessionNameInput}
                onChange={(e) => setSessionNameInput(e.target.value)}
                placeholder={`Name this session (e.g. "${currentTopic || 'Math Practice'} Day 2")`}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#213A30] border border-[#F5F1E6]/20 text-[#F5F1E6] text-xs placeholder-[#F5F1E6]/40 focus:outline-none focus:border-[#8FBF8A]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#8FBF8A] hover:bg-[#a0d29b] text-[#121F19] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Checkpoint</span>
              </button>
            </form>
          </div>

          {/* Active Auto-Saved Draft */}
          {activeDraft && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8FBF8A] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last Active Auto-Saved Session</span>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1C2F27] to-[#16251E] border-2 border-[#8FBF8A] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-hand text-xl font-bold text-[#F5F1E6]">
                      {activeDraft.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8FBF8A]/20 text-[#8FBF8A] border border-[#8FBF8A]/30">
                      Auto-Saved
                    </span>
                  </div>
                  <p className="text-xs text-[#F5F1E6]/80 font-medium">
                    Topic: <span className="text-[#E8C468] font-bold">{activeDraft.topic}</span>
                  </p>
                  <p className="text-[11px] text-[#F5F1E6]/60 line-clamp-1">
                    Problem: {activeDraft.activeQuestion || 'Open chalkboard'}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-[#F5F1E6]/50 pt-1">
                    <span>🕒 {activeDraft.dateFormatted}</span>
                    <span>✍️ {activeDraft.strokes?.length || 0} strokes</span>
                    <span>Age: {activeDraft.ageBracket}y</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onResumeSession(activeDraft);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#8FBF8A] hover:bg-[#a0d29b] text-[#121F19] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0 self-end sm:self-center"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume On Slate</span>
                </button>
              </div>
            </div>
          )}

          {/* Saved Sessions Checkpoints List */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#F5F1E6]/60 flex items-center justify-between">
              <span>Saved Checkpoint Sessions ({savedSessions.length})</span>
              <span className="text-[11px] text-[#F5F1E6]/40">Permanent Local Archive</span>
            </div>

            {savedSessions.length === 0 ? (
              <div className="p-8 text-center bg-[#15231D] rounded-2xl border border-[#F5F1E6]/10 text-[#F5F1E6]/50 text-xs space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-[#8FBF8A]/50" />
                <p>No saved checkpoints yet.</p>
                <p className="text-[11px] text-[#F5F1E6]/40">
                  Save your chalkboard practice above to easily return and continue another day!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-2xl bg-[#17261F] border border-[#F5F1E6]/10 hover:border-[#8FBF8A]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F5F1E6]">
                          {session.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8C468]/15 text-[#E8C468] border border-[#E8C468]/30">
                          {session.topic}
                        </span>
                      </div>
                      <p className="text-xs text-[#F5F1E6]/70 line-clamp-1">
                        {session.activeQuestion || 'Open practice'}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-[#F5F1E6]/50">
                        <span>🕒 {session.dateFormatted}</span>
                        <span>✍️ {session.strokes?.length || 0} strokes</span>
                        <span>Theme: {session.boardThemeId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onResumeSession(session);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#8FBF8A] hover:bg-[#a0d29b] text-[#121F19] font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
                        title="Resume this session on slate"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Resume</span>
                      </button>

                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1.5 rounded-xl text-[#F5F1E6]/40 hover:text-[#E2725B] hover:bg-[#E2725B]/10 transition-all"
                        title="Delete this saved session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#F5F1E6]/10 bg-[#15231D] flex items-center justify-between text-xs text-[#F5F1E6]/60">
          <span>Your progress is stored securely in your browser session.</span>
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
