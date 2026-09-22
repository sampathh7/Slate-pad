import React from 'react';
import { 
  BookOpen, 
  X, 
  Sparkles, 
  PenTool, 
  Radio, 
  Pencil, 
  Brain, 
  CheckCircle2, 
  ArrowRight,
  Lightbulb,
  Palette
} from 'lucide-react';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSampleTopic?: (topic: string, question: string) => void;
}

export default function QuickGuideModal({
  isOpen,
  onClose,
  onSelectSampleTopic,
}: QuickGuideModalProps) {
  if (!isOpen) return null;

  const sampleDrills = [
    {
      topic: 'Quadratic Equations',
      question: 'Solve 2x² + 5x - 3 = 0 using factoring or quadratic formula',
      category: 'Mathematics',
      color: 'border-[#E8C468]/30 bg-[#E8C468]/10 text-[#E8C468]',
    },
    {
      topic: 'Physics Optics',
      question: 'Sketch a convex lens ray diagram showing real inverted image',
      category: 'Physics',
      color: 'border-[#81D4FA]/30 bg-[#81D4FA]/10 text-[#81D4FA]',
    },
    {
      topic: 'Organic Chemistry',
      question: 'Draw the Lewis structure and molecular geometry of Methane (CH4)',
      category: 'Chemistry',
      color: 'border-[#8FBF8A]/30 bg-[#8FBF8A]/10 text-[#8FBF8A]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1C2B24] border border-[#F5F1E6]/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F5F1E6]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8C468]/20 border border-[#E8C468]/40 flex items-center justify-center text-[#E8C468]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-hand text-2xl sm:text-3xl text-[#E8C468] font-bold tracking-wide">
                How Slate Practice Pad Works
              </h2>
              <p className="text-xs text-[#F5F1E6]/60">
                A simple 3-step guide to practicing, learning, and mastering any subject
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#F5F1E6]/50 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Step Visual Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-[#213A30] border border-[#F5F1E6]/10 p-4 rounded-2xl space-y-2 relative">
            <div className="w-7 h-7 rounded-full bg-[#E8C468] text-[#182821] font-bold text-xs flex items-center justify-center">
              1
            </div>
            <div className="font-semibold text-sm text-[#F5F1E6] flex items-center gap-1.5">
              <span>Pick Your Topic</span>
            </div>
            <p className="text-xs text-[#F5F1E6]/70 leading-relaxed">
              Type or speak any subject (Math, Science, Languages) and click <strong>Adaptive Drills</strong> for custom problems.
            </p>
          </div>

          <div className="bg-[#213A30] border border-[#F5F1E6]/10 p-4 rounded-2xl space-y-2 relative">
            <div className="w-7 h-7 rounded-full bg-[#81D4FA] text-[#182821] font-bold text-xs flex items-center justify-center">
              2
            </div>
            <div className="font-semibold text-sm text-[#F5F1E6] flex items-center gap-1.5">
              <span>Write on Slate</span>
            </div>
            <p className="text-xs text-[#F5F1E6]/70 leading-relaxed">
              Use mouse, touch, or stylus with chalk colors, erasers, and alignment grids to work through your solution step-by-step.
            </p>
          </div>

          <div className="bg-[#213A30] border border-[#F5F1E6]/10 p-4 rounded-2xl space-y-2 relative">
            <div className="w-7 h-7 rounded-full bg-[#8FBF8A] text-[#182821] font-bold text-xs flex items-center justify-center">
              3
            </div>
            <div className="font-semibold text-sm text-[#F5F1E6] flex items-center gap-1.5">
              <span>Check My Work</span>
            </div>
            <p className="text-xs text-[#F5F1E6]/70 leading-relaxed">
              Tap <strong>Check My Work</strong> for instant AI handwriting inspection, mistake diagnosis, grade scoring, and adaptive guidance.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="bg-[#182821] p-4 rounded-2xl border border-[#F5F1E6]/10 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Learning Superpowers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#F5F1E6]/80">
            <div className="flex items-start gap-2">
              <Radio className="w-4 h-4 text-[#8FBF8A] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#F5F1E6]">Live Voice Tutor: </span>
                <span>Speak aloud with your AI tutor to brainstorm solutions in real-time.</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Pencil className="w-4 h-4 text-[#81D4FA] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#F5F1E6]">AI Auto-Draw: </span>
                <span>Order AI to illustrate math curves, geometry, chemistry, and diagrams right on the slate.</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-[#E8C468] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#F5F1E6]">Adaptive Skill Profiler: </span>
                <span>Tracks your mastery levels and suggests appropriate problem difficulty.</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Palette className="w-4 h-4 text-[#E2725B] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#F5F1E6]">Chalk Themes & Colors: </span>
                <span>Choose classroom blackboards, vintage green, midnight navy, and crisp chalk tones.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Drill Samples */}
        {onSelectSampleTopic && (
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#F5F1E6]/60">
              Quick Start Practice Problems:
            </div>
            <div className="grid grid-cols-1 gap-2">
              {sampleDrills.map((drill, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectSampleTopic(drill.topic, drill.question);
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl bg-[#213A30] hover:bg-[#2A473B] border border-[#F5F1E6]/10 text-left flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${drill.color}`}>
                        {drill.category}
                      </span>
                      <span className="text-xs font-semibold text-[#F5F1E6] truncate">
                        {drill.topic}
                      </span>
                    </div>
                    <p className="text-xs text-[#F5F1E6]/70 truncate">
                      {drill.question}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#E8C468] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] font-bold text-sm shadow-xl shadow-[#E8C468]/20 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Start Practicing on Slate!</span>
        </button>
      </div>
    </div>
  );
}
