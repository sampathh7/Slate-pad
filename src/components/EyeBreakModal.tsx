import React, { useState, useEffect } from 'react';
import { Eye, Sparkles, X, Check, Wind, Heart, Mountain } from 'lucide-react';

interface EyeBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function EyeBreakModal({
  isOpen,
  onClose,
  onComplete,
}: EyeBreakModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(20);
      return;
    }

    const timer = setInterval(() => {
      if (!isPaused) {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, onComplete]);

  if (!isOpen) return null;

  const progress = ((20 - secondsRemaining) / 20) * 100;

  return (
    <div
      id="eyeBreakBackdrop"
      className="fixed inset-0 z-50 bg-[#121A15]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 select-none text-[#F5F1E6]"
    >
      <div className="max-w-md w-full text-center space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-xl bg-[#202E25] text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#2A3C31] transition-colors"
          title="Dismiss Eye Break"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Mascot Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#8FBF8A]/20 border-2 border-[#8FBF8A]/40 text-[#8FBF8A] shadow-2xl relative">
          <Eye className="w-10 h-10 animate-bounce" style={{ animationDuration: '2.5s' }} />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FFC870] text-[#182821] flex items-center justify-center text-xs font-bold shadow">
            ✨
          </div>
        </div>

        {/* Headline & 20-20-20 Rule Instructions */}
        <div className="space-y-2">
          <h2 className="font-hand font-bold text-3xl sm:text-4xl text-[#FFC870] tracking-wide">
            20-Second Eye Break! 🌿
          </h2>
          <p className="text-sm text-[#F5F1E6]/80 max-w-sm mx-auto leading-relaxed">
            Look away from the screen and gaze at the furthest thing you can see — out the window or across the room!
          </p>
        </div>

        {/* Pulsing Breathing Eye Relaxation Visual Circle */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          {/* Animated pulsing outer rings */}
          <div 
            className="absolute inset-0 rounded-full bg-[#8FBF8A]/10 border-2 border-[#8FBF8A]/30 animate-ping opacity-30" 
            style={{ animationDuration: '3s' }} 
          />
          <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-[#253A2E] to-[#1E2D24] border-2 border-[#FFC870]/40 shadow-inner flex items-center justify-center">
            <div className="flex flex-col items-center">
              <span className="font-mono font-bold text-5xl text-[#FFC870] tracking-tight">
                {secondsRemaining}s
              </span>
              <span className="text-[11px] font-bold text-[#8FBF8A] uppercase tracking-widest mt-1">
                Relax & Blink
              </span>
            </div>
          </div>
        </div>

        {/* Cheerful Pediatric Advice */}
        <div className="p-3.5 rounded-2xl bg-[#1A261F] border border-[#8FBF8A]/20 text-xs text-[#F5F1E6]/70 flex items-center justify-center gap-2">
          <Mountain className="w-4 h-4 text-[#8FBF8A] shrink-0" />
          <span>Look at something at least 20 feet (6 meters) away</span>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#2A3C31] hover:bg-[#344B3D] text-[#F5F1E6] font-bold text-xs transition-all border border-[#F5F1E6]/15"
          >
            {secondsRemaining === 0 ? 'Back to Chalkboard' : 'Skip Break'}
          </button>

          {secondsRemaining === 0 && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#FFC870] hover:bg-[#ffd68a] text-[#182821] font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Eyes Rested! Ready to Learn</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
