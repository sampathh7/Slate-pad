import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Heart, 
  PartyPopper, 
  HelpCircle, 
  RefreshCw,
  Smile,
  Zap,
  Star
} from 'lucide-react';
import { chalkAudio } from '../utils/chalkAudio';
import { MascotId } from './CartoonEncouragement';

interface MascotBuddyProps {
  score?: number | null;
  praise?: string | null;
  topic?: string;
  question?: string;
  hasFeedback?: boolean;
  onOpenFeedback?: () => void;
}

const MASCOT_QUOTES = [
  "You've got this! Step by step, equation by equation!",
  "Mistakes are just proof that you're tackling big ideas!",
  "Write cleanly and let your chalk flow smoothly!",
  "Take your time to double-check positive and negative signs!",
  "Great mathematicians practice daily—just like you!",
  "Every line of math you write strengthens your logic muscles!",
  "Stay curious! Math is the language of the universe! 🌌",
];

export default function MascotBuddy({
  score,
  praise,
  topic,
  question,
  hasFeedback,
  onOpenFeedback,
}: MascotBuddyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mascotId, setMascotId] = useState<MascotId>(() => {
    try {
      const saved = localStorage.getItem('slate_preferred_mascot');
      if (saved && ['chalky', 'hooty', 'sparky', 'robo', 'pip'].includes(saved)) {
        return saved as MascotId;
      }
    } catch {}
    return 'chalky';
  });

  // Listen to mascot changes from localStorage
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('slate_preferred_mascot');
        if (saved && ['chalky', 'hooty', 'sparky', 'robo', 'pip'].includes(saved)) {
          setMascotId(saved as MascotId);
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const currentQuote = MASCOT_QUOTES[quoteIndex % MASCOT_QUOTES.length];

  const handleNextQuote = () => {
    chalkAudio.playMascotPop();
    setIsWiggling(true);
    setQuoteIndex((prev) => (prev + 1) % MASCOT_QUOTES.length);
    setTimeout(() => setIsWiggling(false), 500);
  };

  const handleToggle = () => {
    if (!isOpen) {
      chalkAudio.playMascotPop();
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 600);
    }
    setIsOpen(!isOpen);
  };

  const speakQuote = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const text = praise ? `${praise} Keep up the wonderful work!` : currentQuote;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = mascotId === 'hooty' ? 0.9 : 1.25;
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Mini Mascot Animated Avatars
  const renderMiniAvatar = () => {
    switch (mascotId) {
      case 'doraemon':
        return (
          <div className="w-9 h-9 relative flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow">
              <circle cx="20" cy="18" r="14" fill="#00A0E9" stroke="#0077B6" strokeWidth="1" />
              <ellipse cx="20" cy="20" rx="10" ry="8" fill="#FFFFFF" />
              <circle cx="17" cy="13" r="3" fill="#FFF" stroke="#0077B6" strokeWidth="0.8" />
              <circle cx="23" cy="13" r="3" fill="#FFF" stroke="#0077B6" strokeWidth="0.8" />
              <circle cx="18" cy="13" r="1.2" fill="#111" />
              <circle cx="22" cy="13" r="1.2" fill="#111" />
              <circle cx="20" cy="17" r="2" fill="#EE1C25" />
              <path d="M16 21 Q20 25 24 21" fill="none" stroke="#111" strokeWidth="1" />
              <rect x="12" y="27" width="16" height="3" rx="1.5" fill="#EE1C25" />
              <circle cx="20" cy="30" r="2.5" fill="#FFD700" />
            </svg>
          </div>
        );
      case 'shinchan':
        return (
          <div className="w-9 h-9 relative flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow">
              <path d="M12 10 C8 10 6 15 6 20 C6 25 10 27 16 27 C24 27 30 23 30 18 C30 12 24 10 18 10 Z" fill="#FFDCB6" stroke="#D4A373" strokeWidth="1" />
              <path d="M9 14 Q13 11 17 14" stroke="#111" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M19 14 Q23 11 27 14" stroke="#111" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="14" cy="18" r="2" fill="#111" />
              <circle cx="23" cy="18" r="2" fill="#111" />
              <ellipse cx="8" cy="22" rx="2" ry="1.5" fill="#FF6B6B" opacity="0.8" />
              <path d="M15 22 Q18 26 21 22" fill="#E63946" stroke="#111" strokeWidth="0.8" />
              <rect x="10" y="27" width="20" height="9" rx="2" fill="#E63946" />
            </svg>
          </div>
        );
      case 'spiderman':
        return (
          <div className="w-9 h-9 relative flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow">
              <ellipse cx="20" cy="18" rx="12" ry="13" fill="#E23636" stroke="#111" strokeWidth="1" />
              <polygon points="11,15 17,17 15,22 10,18" fill="#FFF" stroke="#111" strokeWidth="1.2" />
              <polygon points="29,15 23,17 25,22 30,18" fill="#FFF" stroke="#111" strokeWidth="1.2" />
              <rect x="12" y="29" width="16" height="8" rx="2" fill="#E23636" stroke="#111" strokeWidth="1" />
              <rect x="15" y="29" width="10" height="8" fill="#0047AB" />
            </svg>
          </div>
        );
      case 'pikachu':
        return (
          <div className="w-9 h-9 relative flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow">
              <polygon points="10,16 4,4 14,10" fill="#FFD700" stroke="#E6B800" strokeWidth="0.8" />
              <polygon points="6,6 4,4 9,5" fill="#111" />
              <polygon points="30,16 36,4 26,10" fill="#FFD700" stroke="#E6B800" strokeWidth="0.8" />
              <polygon points="34,6 36,4 31,5" fill="#111" />
              <ellipse cx="20" cy="20" rx="12" ry="10" fill="#FFD700" stroke="#E6B800" strokeWidth="1" />
              <circle cx="15" cy="18" r="2" fill="#111" />
              <circle cx="25" cy="18" r="2" fill="#111" />
              <circle cx="11" cy="22" r="2.2" fill="#EE1C25" />
              <circle cx="29" cy="22" r="2.2" fill="#EE1C25" />
              <path d="M17 23 Q20 26 23 23" fill="#D32F2F" stroke="#111" strokeWidth="0.7" />
            </svg>
          </div>
        );
      case 'hooty':
        return (
          <div className="w-9 h-9 relative flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow">
              <polygon points="20,4 34,9 20,14 6,9" fill="#1C2B24" stroke="#E8C468" strokeWidth="1" />
              <ellipse cx="20" cy="24" rx="14" ry="14" fill="#8D6E63" />
              <ellipse cx="20" cy="26" rx="9" ry="10" fill="#D7CCC8" />
              <circle cx="15" cy="20" r="5" fill="#FFF" stroke="#E8C468" strokeWidth="1.2" />
              <circle cx="25" cy="20" r="5" fill="#FFF" stroke="#E8C468" strokeWidth="1.2" />
              <circle cx="15" cy="20" r="2.5" fill="#2E1C14" />
              <circle cx="25" cy="20" r="2.5" fill="#2E1C14" />
              <polygon points="20,23 18,26 22,26" fill="#FFA000" />
            </svg>
          </div>
        );
      case 'sparky':
        return (
          <div className="w-9 h-9 relative flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow">
              <polygon
                points="20,3 25,14 37,16 28,24 31,36 20,29 9,36 12,24 3,16 15,14"
                fill="#FFCA28"
                stroke="#FF8F00"
                strokeWidth="1.5"
              />
              <circle cx="16" cy="18" r="2" fill="#212121" />
              <circle cx="24" cy="18" r="2" fill="#212121" />
              <path d="M17 22 Q20 25 23 22" fill="none" stroke="#212121" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        );
      case 'chalky':
      default:
        return (
          <div className="w-9 h-9 relative flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow">
              <rect x="13" y="7" width="14" height="28" rx="3.5" fill="#FFFDD0" stroke="#D7CEB2" strokeWidth="1.2" />
              <path d="M13 8 C13 4, 27 4, 27 8 Z" fill="#FFF" />
              <circle cx="17" cy="15" r="2" fill="#1B2821" />
              <circle cx="23" cy="15" r="2" fill="#1B2821" />
              <circle cx="17.5" cy="14.5" r="0.7" fill="#FFF" />
              <circle cx="23.5" cy="14.5" r="0.7" fill="#FFF" />
              <path d="M17 19 Q20 23 23 19" fill="none" stroke="#1B2821" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M17 30 L20 28 L23 30 Z" fill="#E2725B" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed bottom-20 left-6 z-30 select-none">
      {/* Expanded Mascot Encouragement Bubble */}
      {isOpen && (
        <div 
          id="mascotBuddyDialog"
          className="mb-3 w-72 sm:w-80 p-3.5 rounded-2xl bg-gradient-to-br from-[#162720]/95 via-[#1C2E26]/95 to-[#121F19]/95 border-2 border-[#E8C468]/40 shadow-2xl backdrop-blur-md text-[#F5F1E6] animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#F5F1E6]/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E8C468]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chalkboard Mascot Cheer</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={speakQuote}
                className="p-1 rounded-lg hover:bg-[#213A30] text-[#F5F1E6]/70 hover:text-[#E8C468] transition-all"
                title="Hear Mascot Voice"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-[#E8C468] animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-[#213A30] text-[#F5F1E6]/50 hover:text-[#F5F1E6] transition-all"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mascot Speech Bubble Quote */}
          <div className="p-3 rounded-xl bg-[#213A30] border border-[#F5F1E6]/10 mb-3">
            <p className="font-hand text-base text-[#F5F1E6] leading-snug">
              "{currentQuote}"
            </p>
          </div>

          {/* Mascot Quick Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleNextQuote}
              className="px-2.5 py-1.5 rounded-xl bg-[#182821] hover:bg-[#213A30] text-[#E8C468] text-xs font-semibold flex items-center gap-1.5 border border-[#E8C468]/20 transition-all active:scale-95"
              title="Get another encouraging thought"
            >
              <RefreshCw className="w-3 h-3" />
              <span>New Cheer</span>
            </button>

            {hasFeedback && onOpenFeedback && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFeedback();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#E8C468] hover:bg-[#f0d182] text-[#121F19] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Sparkles className="w-3 h-3" />
                <span>View Feedback</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Animated Mascot Button */}
      <button
        id="mascotBuddyTriggerBtn"
        onClick={handleToggle}
        className={`relative group p-2 rounded-2xl bg-gradient-to-br from-[#1C2B24] via-[#213A30] to-[#162720] border-2 border-[#E8C468]/50 shadow-xl backdrop-blur-md flex items-center gap-2 hover:border-[#E8C468] hover:scale-105 active:scale-95 transition-all duration-200 ${
          isWiggling ? 'animate-bounce' : 'animate-pulse'
        }`}
        title="Click your Study Mascot for cheer & tips!"
      >
        {renderMiniAvatar()}

        <div className="hidden sm:flex flex-col text-left pr-1.5">
          <span className="text-[11px] font-bold text-[#E8C468] leading-tight flex items-center gap-1">
            <span>Mascot Cheer</span>
            <Sparkles className="w-3 h-3 text-[#E8C468] animate-spin" />
          </span>
          <span className="text-[9px] text-[#F5F1E6]/70 leading-tight">
            Encouragement & Tips
          </span>
        </div>

        {/* Floating Notification Dot if score is available */}
        {score !== null && score !== undefined && (
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[#E8C468] text-[#121F19] font-mono text-[9px] font-bold shadow-md border border-[#121F19]">
            {score}
          </span>
        )}
      </button>
    </div>
  );
}
