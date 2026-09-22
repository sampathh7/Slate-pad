import React, { useState } from 'react';
import { 
  StudentMistakeRecord, 
  ChildAgeBracket, 
  FeedbackResult 
} from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Pencil, 
  Lightbulb, 
  Trash2, 
  X, 
  Sparkles, 
  RotateCcw, 
  BookOpen, 
  ArrowRight,
  Award,
  Filter
} from 'lucide-react';
import { formatFriendlyDate } from '../utils/studentProgress';

interface MistakeBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: StudentMistakeRecord[];
  onFixOnSlate: (mistake: StudentMistakeRecord) => void;
  onClarifyMistake: (mistake: StudentMistakeRecord) => void;
  onDrawCorrectProcess?: (mistake: StudentMistakeRecord) => void;
  onAnimateSolution?: (problem: string) => void;
  onMarkFixed: (errorId: string) => void;
  onDeleteMistake: (errorId: string) => void;
}

export default function MistakeBankModal({
  isOpen,
  onClose,
  mistakes,
  onFixOnSlate,
  onClarifyMistake,
  onDrawCorrectProcess,
  onAnimateSolution,
  onMarkFixed,
  onDeleteMistake,
}: MistakeBankModalProps) {
  const [filter, setFilter] = useState<'pending' | 'fixed' | 'all'>('pending');

  if (!isOpen) return null;

  const pendingMistakes = mistakes.filter((m) => m.status === 'pending_fix');
  const fixedMistakes = mistakes.filter((m) => m.status === 'fixed_and_mastered');

  const displayedList = 
    filter === 'pending' 
      ? pendingMistakes 
      : filter === 'fixed' 
      ? fixedMistakes 
      : mistakes;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="mistakeBankModal"
        className="w-full max-w-2xl bg-[#1C2B24] border-2 border-[#E2725B]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F5F1E6]/10 flex items-center justify-between bg-[#15231D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2725B]/20 border border-[#E2725B]/30 flex items-center justify-center text-[#E2725B]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-hand text-2xl font-bold text-[#E2725B] leading-tight">
                Fix Any Errors — Mistake Revision Notebook
              </h2>
              <p className="text-xs text-[#F5F1E6]/70">
                Turn mistakes into mastery by practicing corrections on the chalkboard
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

        {/* Tab Filter & Counts */}
        <div className="bg-[#182821] px-5 py-3 border-b border-[#F5F1E6]/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'pending'
                  ? 'bg-[#E2725B] text-[#121F19] shadow-md'
                  : 'bg-[#213A30] text-[#F5F1E6]/70 hover:text-[#F5F1E6]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Needs Fix ({pendingMistakes.length})</span>
            </button>

            <button
              onClick={() => setFilter('fixed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === 'fixed'
                  ? 'bg-[#8FBF8A] text-[#121F19] shadow-md'
                  : 'bg-[#213A30] text-[#F5F1E6]/70 hover:text-[#F5F1E6]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mastered & Fixed ({fixedMistakes.length})</span>
            </button>

            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#F5F1E6]/20 text-[#F5F1E6] font-bold'
                  : 'text-[#F5F1E6]/50 hover:text-[#F5F1E6]'
              }`}
            >
              All ({mistakes.length})
            </button>
          </div>

          <div className="text-[11px] text-[#F5F1E6]/60 hidden sm:block">
            {pendingMistakes.length === 0 ? 'All errors resolved! 🎉' : 'Select an error to fix on slate'}
          </div>
        </div>

        {/* Scrollable Mistake Cards */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 custom-scrollbar">
          {displayedList.length === 0 ? (
            <div className="p-10 text-center bg-[#15231D] rounded-2xl border border-[#F5F1E6]/10 text-xs space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#8FBF8A] mb-1" />
              <div className="font-hand text-xl font-bold text-[#8FBF8A]">
                {filter === 'pending' ? 'No Pending Errors!' : 'No Records in this Tab'}
              </div>
              <p className="text-[#F5F1E6]/60 text-xs max-w-sm mx-auto">
                {filter === 'pending'
                  ? 'Great job! You have fixed all recorded mistakes. Keep practicing on the slate to challenge yourself!'
                  : 'Practice on the slate and any errors identified will be saved here so you can review and fix them anytime.'}
              </p>
            </div>
          ) : (
            displayedList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  item.status === 'fixed_and_mastered'
                    ? 'bg-[#182821]/80 border-[#8FBF8A]/30 opacity-90'
                    : 'bg-[#1E2E26] border-[#E2725B]/40 shadow-lg hover:border-[#E2725B]'
                }`}
              >
                {/* Top Row: Topic & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#E8C468] px-2.5 py-0.5 rounded-md bg-[#E8C468]/10 border border-[#E8C468]/20">
                      {item.topic}
                    </span>
                    <span className="text-[11px] text-[#F5F1E6]/50">
                      {formatFriendlyDate(item.recordedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.status === 'fixed_and_mastered' ? (
                      <span className="text-[11px] font-bold text-[#8FBF8A] flex items-center gap-1 bg-[#8FBF8A]/10 px-2.5 py-0.5 rounded-full border border-[#8FBF8A]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Fixed & Mastered
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#E2725B] flex items-center gap-1 bg-[#E2725B]/10 px-2.5 py-0.5 rounded-full border border-[#E2725B]/30">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Needs Correction
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F1E6]/50">
                    Question / Problem:
                  </div>
                  <div className="text-sm font-medium text-[#F5F1E6] bg-[#15231D] p-2.5 rounded-xl border border-[#F5F1E6]/10">
                    {item.question}
                  </div>
                </div>

                {/* Error Snippet & Correction */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#E2725B]/10 border border-[#E2725B]/20 p-2.5 rounded-xl space-y-1">
                    <div className="font-bold text-[#E2725B] flex items-center gap-1">
                      <span>Mistake:</span>
                      <code className="bg-[#E2725B]/20 px-1.5 py-0.5 rounded font-mono text-[11px]">
                        "{item.mistakeText}"
                      </code>
                    </div>
                    <p className="text-[#F5F1E6]/80 text-[11px] leading-relaxed">
                      {item.issue}
                    </p>
                  </div>

                  <div className="bg-[#8FBF8A]/10 border border-[#8FBF8A]/20 p-2.5 rounded-xl space-y-1">
                    <div className="font-bold text-[#8FBF8A] flex items-center gap-1">
                      <span>Suggested Fix:</span>
                      <span className="font-hand text-base font-bold text-[#8FBF8A]">
                        {item.correction}
                      </span>
                    </div>
                    {item.explanation && (
                      <p className="text-[#F5F1E6]/80 text-[11px] leading-relaxed">
                        {item.explanation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-[#F5F1E6]/10">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Fix On Slate Button */}
                    <button
                      onClick={() => {
                        onFixOnSlate(item);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                      title="Load problem onto chalkboard to fix"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Practice & Fix on Slate</span>
                    </button>

                    {/* Animate Blackboard Solution */}
                    {onAnimateSolution && (
                      <button
                        onClick={() => {
                          onAnimateSolution(item.question);
                          onClose();
                        }}
                        className="px-3 py-2 rounded-xl bg-[#E8C468]/20 hover:bg-[#E8C468]/30 text-[#E8C468] border border-[#E8C468]/40 font-bold text-xs flex items-center gap-1.5 transition-all"
                        title="Watch step-by-step blackboard animation explaining how to solve this"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#E8C468]" />
                        <span>Animate on Slate</span>
                      </button>
                    )}

                    {/* Ask Clarify Button */}
                    <button
                      onClick={() => {
                        onClarifyMistake(item);
                        onClose();
                      }}
                      className="px-3 py-2 rounded-xl bg-[#81D4FA]/15 hover:bg-[#81D4FA]/25 text-[#81D4FA] border border-[#81D4FA]/30 font-bold text-xs flex items-center gap-1.5 transition-all"
                      title="Get instant accurate clarification on why this error happened"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Clarify Why</span>
                    </button>

                    {/* Draw Correct Steps If Available */}
                    {onDrawCorrectProcess && (
                      <button
                        onClick={() => {
                          onDrawCorrectProcess(item);
                          onClose();
                        }}
                        className="px-2.5 py-2 rounded-xl bg-[#213A30] hover:bg-[#2c4e40] text-[#F5F1E6]/80 hover:text-[#F5F1E6] font-medium text-xs flex items-center gap-1 transition-all"
                        title="Watch AI chalk-draw verified solution on the slate"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E8C468]" />
                        <span>Draw Correct Solution</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== 'fixed_and_mastered' && (
                      <button
                        onClick={() => onMarkFixed(item.id)}
                        className="p-2 rounded-xl bg-[#8FBF8A]/10 hover:bg-[#8FBF8A]/20 text-[#8FBF8A] border border-[#8FBF8A]/30 text-xs font-bold flex items-center gap-1 transition-all"
                        title="Mark as Mastered"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Mastered</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteMistake(item.id)}
                      className="p-2 rounded-xl text-[#F5F1E6]/30 hover:text-[#E2725B] hover:bg-[#E2725B]/10 transition-all"
                      title="Remove from notebook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#F5F1E6]/10 bg-[#15231D] flex items-center justify-between text-xs text-[#F5F1E6]/60">
          <span>Solving errors correctly on the slate automatically marks them as mastered.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#213A30] hover:bg-[#2c4e40] text-[#F5F1E6] font-medium transition-all"
          >
            Close Notebook
          </button>
        </div>
      </div>
    </div>
  );
}
