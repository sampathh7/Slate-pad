import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  RotateCcw, 
  Zap, 
  Award, 
  Heart, 
  PartyPopper,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { chalkAudio } from '../utils/chalkAudio';
import { FeedbackResult } from '../types';

export type CartoonHeroId = 'doraemon' | 'shinchan' | 'spiderman' | 'pikachu' | 'chalky';

interface SlateCartoonHeroFeedbackProps {
  feedback: FeedbackResult | null;
  topic?: string;
  question?: string;
  isVisible: boolean;
  onClose: () => void;
  onOpenDetailedCorrections?: () => void;
  preferredHero?: CartoonHeroId;
}

interface HeroConfig {
  id: CartoonHeroId;
  name: string;
  tagline: string;
  badge: string;
  themeColor: string;
  accentBg: string;
  borderGlow: string;
}

export const CARTOON_HEROES: HeroConfig[] = [
  {
    id: 'doraemon',
    name: 'Doraemon',
    tagline: '22nd Century Robotic Cat & Secret Gadgets',
    badge: '4D Memory Bread A+',
    themeColor: '#00A0E9',
    accentBg: 'rgba(0, 160, 233, 0.15)',
    borderGlow: '#00A0E9',
  },
  {
    id: 'shinchan',
    name: 'Shin-chan',
    tagline: 'Action Kamen Champion & Cheeky Dancer',
    badge: 'Action Kamen Gold Star',
    themeColor: '#FF3B30',
    accentBg: 'rgba(255, 59, 48, 0.15)',
    borderGlow: '#FF9500',
  },
  {
    id: 'spiderman',
    name: 'Spider-Man',
    tagline: 'Your Friendly Neighborhood Math Hero',
    badge: 'Web of Pure Mastery',
    themeColor: '#E23636',
    accentBg: 'rgba(226, 54, 54, 0.15)',
    borderGlow: '#518CCA',
  },
  {
    id: 'pikachu',
    name: 'Pikachu',
    tagline: 'Electric Math Spark & Brain Power',
    badge: 'Thunderbolt 100%',
    themeColor: '#FFD700',
    accentBg: 'rgba(255, 215, 0, 0.15)',
    borderGlow: '#FF9900',
  },
  {
    id: 'chalky',
    name: 'Chalky Slate',
    tagline: 'Master Chalk Tutor',
    badge: 'Slate Perfection Stamp',
    themeColor: '#E8C468',
    accentBg: 'rgba(232, 196, 104, 0.15)',
    borderGlow: '#E8C468',
  },
];

export default function SlateCartoonHeroFeedback({
  feedback,
  topic,
  question,
  isVisible,
  onClose,
  onOpenDetailedCorrections,
  preferredHero,
}: SlateCartoonHeroFeedbackProps) {
  const [activeHero, setActiveHero] = useState<CartoonHeroId>(() => {
    if (preferredHero) return preferredHero;
    try {
      const saved = localStorage.getItem('slate_preferred_cartoon_hero');
      if (saved && ['doraemon', 'shinchan', 'spiderman', 'pikachu', 'chalky'].includes(saved)) {
        return saved as CartoonHeroId;
      }
    } catch {}
    return 'doraemon';
  });

  const [transitionKey, setTransitionKey] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const [customPokeQuote, setCustomPokeQuote] = useState<string | null>(null);

  const score = feedback ? feedback.overall_score : 100;
  const mistakesCount = feedback ? feedback.mistakes.length : 0;
  const praise = feedback ? feedback.praise : 'Magnificent blackboard calculation!';

  // Play hero entrance sound and animation whenever hero appears or changes
  useEffect(() => {
    if (!isVisible) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setTransitionKey((k) => k + 1);
    setShowConfetti(score >= 80);

    // Play hero specific entrance sound
    if (activeHero === 'spiderman') {
      chalkAudio.playWebThwip();
      setTimeout(() => chalkAudio.playCelebrationFanfare(), 250);
    } else if (activeHero === 'doraemon') {
      chalkAudio.playDoraemonGadget();
    } else if (activeHero === 'shinchan') {
      chalkAudio.playShinchanBoing();
      setTimeout(() => chalkAudio.playMascotGiggle(), 300);
    } else if (activeHero === 'pikachu') {
      chalkAudio.playPikachuSpark();
      setTimeout(() => chalkAudio.playEncouragementCheer(), 200);
    } else {
      if (score >= 90) chalkAudio.playCelebrationFanfare();
      else chalkAudio.playEncouragementCheer();
    }
  }, [isVisible, activeHero, score]);

  const handleHeroSelect = (heroId: CartoonHeroId) => {
    setActiveHero(heroId);
    setCustomPokeQuote(null);
    try {
      localStorage.setItem('slate_preferred_cartoon_hero', heroId);
    } catch {}
  };

  const handleReplayEntrance = () => {
    setTransitionKey((k) => k + 1);
    setCustomPokeQuote(null);
    if (activeHero === 'spiderman') chalkAudio.playWebThwip();
    else if (activeHero === 'doraemon') chalkAudio.playDoraemonGadget();
    else if (activeHero === 'shinchan') chalkAudio.playShinchanBoing();
    else if (activeHero === 'pikachu') chalkAudio.playPikachuSpark();
    else chalkAudio.playMascotPop();
  };

  // Hero Dialogue Generator
  const heroDialogue = useMemo(() => {
    if (customPokeQuote) return customPokeQuote;

    const isHigh = score >= 85;
    const isMid = score >= 60;

    switch (activeHero) {
      case 'doraemon':
        if (isHigh) {
          return `✨ BOKU DORAEMON! 🎉 Fantastic job! I used the Memory Bread (暗記パン) and your math steps scored a huge ${score}/100! Even Nobita would study with you!`;
        } else if (isMid) {
          return `🌟 Boku Doraemon! Great thinking on this slate! You got ${score}/100. Let's pull out the Time Cloth to fix those minor calculation slips!`;
        } else {
          return `💙 Don't worry! Doraemon is here with you! Every mistake is just a chance to invent a better solution! Let's review the steps together!`;
        }

      case 'shinchan':
        if (isHigh) {
          return `🕺 *Wiggle wiggle!* Ohoho! Look at that brilliant brain! ${score}/100 points! Action Kamen says you are the ultimate chalkboard warrior!`;
        } else if (isMid) {
          return `😄 Hehe! That was so close! Scored ${score}/100! Give me a high-five and let's conquer the remaining tricky step together! *boing*`;
        } else {
          return `🦸 Action Beam! ✨ Don't give up! Even Action Kamen trains hard! Let's do the victory wiggle and try the next question!`;
        }

      case 'spiderman':
        if (isHigh) {
          return `🕷️ THWIP! 🕸️ My Spider-Sense is tingling with pure perfection! Score: ${score}/100! Your math reflexes are truly extraordinary!`;
        } else if (isMid) {
          return `🕸️ Good save! Scored ${score}/100! You've got the hero instincts down. Check the web lines below to tighten up the last equation!`;
        } else {
          return `🛡️ With great problems come great solutions! We fall so we can learn to swing higher! Let's analyze the mistake and nail it!`;
        }

      case 'pikachu':
        if (isHigh) {
          return `⚡ PIKA-PIKACHU! 🌟 Super Effective! 100% Brain Power Unleashed! Your chalkboard calculation was lightning fast and accurate!`;
        } else if (isMid) {
          return `⚡ Pika-pi! Scored ${score}/100! Electricity charging up! You're almost at maximum thunder power—review the step notes!`;
        } else {
          return `⚡ Pika! Every Pokémon master practices daily! Keep your spark bright and let's try another drill!`;
        }

      case 'chalky':
      default:
        if (isHigh) {
          return `🎯 Flawless chalkboard mastery! ${praise || `Scored ${score}/100 with pristine handwriting and crisp logic!`}`;
        } else if (isMid) {
          return `✏️ Splendid progress! ${praise || `Scored ${score}/100! A tiny refinement will make your proof unshakeable!`}`;
        } else {
          return `🌱 Great practice session! Mistakes on the chalkboard wipe away easily! Let's learn from the corrections below!`;
        }
    }
  }, [activeHero, score, customPokeQuote, praise]);

  // Voice Narration
  const speakHero = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(heroDialogue);
    if (activeHero === 'shinchan') {
      utterance.pitch = 1.45;
      utterance.rate = 1.1;
    } else if (activeHero === 'doraemon') {
      utterance.pitch = 1.3;
      utterance.rate = 1.0;
    } else if (activeHero === 'spiderman') {
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
    } else if (activeHero === 'pikachu') {
      utterance.pitch = 1.5;
      utterance.rate = 1.15;
    } else {
      utterance.pitch = 1.2;
      utterance.rate = 1.0;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Handle Poke interaction on cartoon character
  const handlePokeCharacter = () => {
    setPokeCount((c) => c + 1);
    if (activeHero === 'spiderman') chalkAudio.playWebThwip();
    else if (activeHero === 'doraemon') chalkAudio.playDoraemonGadget();
    else if (activeHero === 'shinchan') chalkAudio.playShinchanBoing();
    else if (activeHero === 'pikachu') chalkAudio.playPikachuSpark();
    else chalkAudio.playMascotGiggle();

    const quotes: Record<CartoonHeroId, string[]> = {
      doraemon: [
        "Dorayaki power activated! 🥞 Let's solve more equations!",
        "Take-copter flying high! 🚁 You're reaching the stars!",
        "Anywhere Door opened to Math Wonderland! 🚪✨",
      ],
      shinchan: [
        "Hehe! Tickle tickle! Ohohoho! 🍑✨",
        "Action Kamen Punch! 🥊 Ready for another round!",
        "Wiggle wiggle! You're making me so proud, genius!",
      ],
      spiderman: [
        "Web-slinging through algebra! 🕸️ Always here for you!",
        "Spider-reflexes on point! 🕷️ Give me a high-five!",
        "Even Peter Parker double-checks his physics homework!",
      ],
      pikachu: [
        "Pika-pi! High-voltage celebration! ⚡💛",
        "Sparkling thunder score! 🌟 Pika-chuuu!",
        "Electric friendship power maxed out! ⚡✨",
      ],
      chalky: [
        "Chalk dust confetti! ✨ You're a true slate artist!",
        "Tapping the board with joy! ✏️ Keep rolling!",
      ],
    };

    const list = quotes[activeHero] || quotes.doraemon;
    const picked = list[Math.floor(Math.random() * list.length)];
    setCustomPokeQuote(picked);
    setTimeout(() => setCustomPokeQuote(null), 4000);
  };

  if (!isVisible) return null;

  const currentHeroConfig = CARTOON_HEROES.find((h) => h.id === activeHero) || CARTOON_HEROES[0];

  return (
    <div 
      id="slateCartoonHeroOverlay"
      className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6 select-none pointer-events-none backdrop-blur-[2px] bg-[#121F19]/40 animate-fadeIn"
    >
      {/* Confetti & Particle Overlay */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-6 left-12 text-2xl animate-bounce">🎉</div>
          <div className="absolute top-12 right-20 text-xl animate-ping">✨</div>
          <div className="absolute bottom-16 left-24 text-2xl animate-pulse">🎊</div>
          <div className="absolute top-20 left-1/3 text-lg animate-bounce">⭐</div>
          <div className="absolute bottom-24 right-1/3 text-xl animate-ping">🌟</div>
        </div>
      )}

      {/* Main Hero Slate Feedback Dialog Box */}
      <div 
        key={transitionKey}
        className="relative w-full max-w-2xl bg-gradient-to-br from-[#162720]/95 via-[#1C2E26]/95 to-[#121F19]/95 border-2 rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-auto transition-all duration-300 transform scale-100"
        style={{ borderColor: currentHeroConfig.borderGlow }}
      >
        {/* Top Header: Hero Picker & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#F5F1E6]/15">
          {/* Hero Selection Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <span className="text-[11px] font-bold text-[#E8C468] mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cartoon Hero:</span>
            </span>
            {CARTOON_HEROES.map((h) => (
              <button
                key={h.id}
                id={`heroTab_${h.id}`}
                onClick={() => handleHeroSelect(h.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 ${
                  activeHero === h.id
                    ? 'bg-gradient-to-r text-white shadow-lg scale-105'
                    : 'bg-[#213A30]/90 text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#2A473B]'
                }`}
                style={{
                  backgroundColor: activeHero === h.id ? h.themeColor : undefined,
                }}
              >
                <span>{h.id === 'doraemon' ? '🐱' : h.id === 'shinchan' ? '🕺' : h.id === 'spiderman' ? '🕷️' : h.id === 'pikachu' ? '⚡' : '✏️'}</span>
                <span>{h.name}</span>
              </button>
            ))}
          </div>

          {/* Close & Replay Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={handleReplayEntrance}
              className="p-1.5 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#E8C468] border border-[#E8C468]/30 transition-all hover:scale-105 active:scale-95"
              title="Replay Hero Entrance Transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#213A30] hover:bg-[#A93226] text-[#F5F1E6]/70 hover:text-white border border-[#F5F1E6]/20 transition-all hover:scale-105 active:scale-95"
              title="Close to Slate"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Character & Comic Speech Row */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          {/* Animated Hero Character Container */}
          <div 
            onClick={handlePokeCharacter}
            className="relative cursor-pointer shrink-0 transition-transform active:scale-95 hover:scale-105 group"
            title="Click Hero to High-Five or Play SFX!"
          >
            {/* Render Specific Hero Animation */}
            {renderHeroAnimation(activeHero, score)}

            {/* Tap Hint Badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#121F19]/95 border border-[#E8C468]/60 text-[10px] text-[#E8C468] font-bold tracking-wide whitespace-nowrap shadow-md group-hover:scale-110 transition-transform">
              👋 Tap Hero!
            </div>
          </div>

          {/* Comic Chalkboard Speech & Feedback Card */}
          <div className="flex-1 w-full flex flex-col justify-between">
            {/* Comic Speech Bubble */}
            <div className="relative p-4 rounded-2xl bg-[#213A30] border-2 border-[#F5F1E6]/20 shadow-inner">
              {/* Pointer Arrow */}
              <div className="hidden sm:block absolute top-8 -left-3 w-4 h-4 bg-[#213A30] border-l-2 border-b-2 border-[#F5F1E6]/20 transform rotate-45" />

              {/* Character Header + Voice Button */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-hand font-bold text-lg text-[#E8C468]">
                    {currentHeroConfig.name}
                  </span>
                  <span className="text-xs text-[#F5F1E6]/60">
                    {currentHeroConfig.tagline}
                  </span>
                </div>

                <button
                  id="heroVoiceBtn"
                  onClick={speakHero}
                  className={`p-1.5 rounded-xl border transition-all ${
                    isSpeaking
                      ? 'bg-[#E8C468] text-[#121F19] border-[#E8C468] animate-pulse'
                      : 'bg-[#182821] text-[#F5F1E6]/80 border-[#F5F1E6]/20 hover:text-[#E8C468] hover:border-[#E8C468]/40'
                  }`}
                  title={isSpeaking ? 'Mute' : 'Hear Hero Voice'}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Dialogue Quote */}
              <p className="font-hand text-lg sm:text-xl text-[#F5F1E6] leading-relaxed">
                "{heroDialogue}"
              </p>
            </div>

            {/* Score Badge & Action Controls */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {/* Reward Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#182821] border border-[#E8C468]/30">
                <span className="text-base">
                  {score >= 90 ? '🏆' : score >= 75 ? '⭐' : score >= 60 ? '⚡' : '🌱'}
                </span>
                <span className="text-xs font-bold text-[#E8C468]">
                  {currentHeroConfig.badge}
                </span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-[#213A30] text-[#FFFDD0]">
                  {score}/100
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {onOpenDetailedCorrections && mistakesCount > 0 && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDetailedCorrections();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#E8C468] hover:bg-[#F2D78E] text-[#121F19] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <span>View {mistakesCount} Correction(s)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6] text-xs font-semibold border border-[#F5F1E6]/20 transition-all active:scale-95"
                >
                  Continue Writing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Specialized Cartoon Character SVG & CSS Animation Components
// -------------------------------------------------------------

function renderHeroAnimation(hero: CartoonHeroId, score: number) {
  const isGreat = score >= 80;

  switch (hero) {
    case 'doraemon':
      return (
        <div className="relative w-36 h-40 flex items-center justify-center">
          {/* Flying Bamboo-Copter Doraemon */}
          <div className="relative w-full h-full animate-bounce duration-1000">
            {/* Spinning Bamboo-Copter (Take-copter) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
              {/* Spinning Propeller */}
              <div className="w-16 h-2 bg-[#FFD700] rounded-full border border-[#FFA000] animate-spin origin-center shadow-md" />
              {/* Stem Stick */}
              <div className="w-1.5 h-4 bg-[#FFA000] rounded-sm" />
              {/* Suction Cap */}
              <div className="w-4 h-1.5 bg-[#FF6F00] rounded-full" />
            </div>

            <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-2xl">
              {/* Blue Cat Body & Head */}
              <ellipse cx="60" cy="52" rx="42" ry="38" fill="#00A0E9" stroke="#0077B6" strokeWidth="2.5" />
              {/* White Face Oval */}
              <ellipse cx="60" cy="58" rx="34" ry="28" fill="#FFFFFF" />

              {/* Big Expressive Eyes */}
              <ellipse cx="50" cy="36" rx="10" ry="14" fill="#FFFFFF" stroke="#0077B6" strokeWidth="1.8" />
              <ellipse cx="70" cy="36" rx="10" ry="14" fill="#FFFFFF" stroke="#0077B6" strokeWidth="1.8" />
              {/* Eye Pupils */}
              <ellipse cx="53" cy="37" rx="4" ry="6" fill="#111111" />
              <ellipse cx="67" cy="37" rx="4" ry="6" fill="#111111" />
              <circle cx="54" cy="35" r="1.8" fill="#FFFFFF" />
              <circle cx="68" cy="35" r="1.8" fill="#FFFFFF" />

              {/* Red Nose & Nose Highlight */}
              <circle cx="60" cy="48" r="6" fill="#EE1C25" stroke="#B30006" strokeWidth="1.5" />
              <circle cx="58.5" cy="46" r="1.8" fill="#FFFFFF" />

              {/* Whiskers */}
              <g stroke="#111111" strokeWidth="1.8" strokeLinecap="round">
                <line x1="60" y1="54" x2="60" y2="76" />
                {/* Left Whiskers */}
                <line x1="52" y1="55" x2="30" y2="50" />
                <line x1="52" y1="62" x2="28" y2="62" />
                <line x1="52" y1="69" x2="32" y2="74" />
                {/* Right Whiskers */}
                <line x1="68" y1="55" x2="90" y2="50" />
                <line x1="68" y1="62" x2="92" y2="62" />
                <line x1="68" y1="69" x2="88" y2="74" />
              </g>

              {/* Joyful Open Mouth */}
              <path d="M42 66 Q60 90 78 66 Z" fill="#EE1C25" stroke="#900C12" strokeWidth="1.5" />
              <ellipse cx="60" cy="74" rx="10" ry="5" fill="#FFA07A" />

              {/* Red Collar & Golden Bell */}
              <rect x="36" y="84" width="48" height="7" rx="3.5" fill="#EE1C25" stroke="#B30006" strokeWidth="1.5" />
              <circle cx="60" cy="94" r="7" fill="#FFD700" stroke="#FFA000" strokeWidth="1.5" />
              <line x1="53" y1="92" x2="67" y2="92" stroke="#9E6B00" strokeWidth="1.5" />
              <circle cx="60" cy="95" r="2" fill="#5D4037" />

              {/* Body & 4D White Pocket */}
              <ellipse cx="60" cy="112" rx="36" ry="24" fill="#00A0E9" stroke="#0077B6" strokeWidth="2.5" />
              <ellipse cx="60" cy="112" rx="26" ry="18" fill="#FFFFFF" />
              {/* Pocket Semicircle */}
              <path d="M42 108 C42 122, 78 122, 78 108 Z" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2" />

              {/* Cute Round White Hands */}
              <circle cx="24" cy="94" r="10" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2" />
              <circle cx="96" cy="94" r="10" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2" />

              {/* Feet */}
              <ellipse cx="46" cy="132" rx="14" ry="7" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2" />
              <ellipse cx="74" cy="132" rx="14" ry="7" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      );

    case 'shinchan':
      return (
        <div className="relative w-36 h-40 flex items-center justify-center">
          {/* Crayon Shin-chan cheeky hip wiggle animation */}
          <div className="relative w-full h-full animate-pulse duration-700">
            <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-2xl">
              {/* Shin-chan Head Shape (Bulging cheek) */}
              <path
                d="M38 32 C26 32, 20 48, 20 62 C20 78, 32 86, 52 86 C76 86, 96 74, 96 56 C96 38, 76 32, 54 32 Z"
                fill="#FFDCB6"
                stroke="#D4A373"
                strokeWidth="2.5"
              />

              {/* Signature Thick Black Eyebrows */}
              <path d="M26 44 Q38 36 50 44" stroke="#111111" strokeWidth="7" strokeLinecap="round" fill="none" />
              <path d="M58 44 Q70 36 82 44" stroke="#111111" strokeWidth="7" strokeLinecap="round" fill="none" />

              {/* Big Expressive Cartoon Eyes */}
              <ellipse cx="42" cy="56" rx="8" ry="11" fill="#111111" />
              <ellipse cx="72" cy="56" rx="8" ry="11" fill="#111111" />
              <circle cx="44" cy="54" r="3" fill="#FFFFFF" />
              <circle cx="74" cy="54" r="3" fill="#FFFFFF" />

              {/* Rosy Cheeks */}
              <ellipse cx="26" cy="68" rx="6" ry="4" fill="#FF6B6B" opacity="0.8" />
              <ellipse cx="88" cy="64" rx="6" ry="4" fill="#FF6B6B" opacity="0.8" />

              {/* Cheeky Open Smile */}
              <path d="M48 68 Q58 80 68 68" fill="#E63946" stroke="#111111" strokeWidth="2" strokeLinecap="round" />

              {/* Shin-chan Red T-Shirt */}
              <path d="M30 84 L90 84 L96 116 L24 116 Z" fill="#E63946" stroke="#900C12" strokeWidth="2.5" />

              {/* Yellow Shorts */}
              <rect x="32" y="114" width="56" height="16" rx="4" fill="#FFD166" stroke="#D4A373" strokeWidth="2" />

              {/* Hands in action pose */}
              <circle cx="18" cy="98" r="7" fill="#FFDCB6" stroke="#D4A373" strokeWidth="2" />
              <circle cx="102" cy="98" r="7" fill="#FFDCB6" stroke="#D4A373" strokeWidth="2" />

              {/* White Shoes */}
              <ellipse cx="42" cy="132" rx="10" ry="6" fill="#FFFFFF" stroke="#D4A373" strokeWidth="2" />
              <ellipse cx="78" cy="132" rx="10" ry="6" fill="#FFFFFF" stroke="#D4A373" strokeWidth="2" />
            </svg>
          </div>
        </div>
      );

    case 'spiderman':
      return (
        <div className="relative w-36 h-40 flex items-center justify-center">
          {/* Spider-Man Web Swinging / Hero Landing pose */}
          <div className="relative w-full h-full animate-bounce duration-1000">
            {/* Hanging Web Strand from top */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-white/80 shadow-[0_0_8px_#FFFFFF]" />

            <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-2xl">
              {/* Spider Mask / Head */}
              <ellipse cx="60" cy="52" rx="34" ry="38" fill="#E23636" stroke="#111111" strokeWidth="2.5" />

              {/* Web Lines on Mask */}
              <g stroke="#111111" strokeWidth="1.2" opacity="0.65" fill="none">
                <line x1="60" y1="14" x2="60" y2="90" />
                <line x1="26" y1="52" x2="94" y2="52" />
                <line x1="36" y1="26" x2="84" y2="78" />
                <line x1="36" y1="78" x2="84" y2="26" />
                <circle cx="60" cy="52" r="14" />
                <circle cx="60" cy="52" r="26" />
              </g>

              {/* Iconic Angled Spider Eyes */}
              {/* Left Eye */}
              <polygon points="34,44 54,48 48,64 32,54" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />
              {/* Right Eye */}
              <polygon points="86,44 66,48 72,64 88,54" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />

              {/* Hero Red & Blue Suit Body */}
              <path d="M36 86 L84 86 L94 122 L26 122 Z" fill="#E23636" stroke="#111111" strokeWidth="2.5" />
              {/* Blue Side Panels */}
              <path d="M26 94 L38 94 L34 122 L26 122 Z" fill="#0047AB" />
              <path d="M94 94 L82 94 L86 122 L94 122 Z" fill="#0047AB" />

              {/* Spider Emblem on Chest */}
              <ellipse cx="60" cy="100" rx="3" ry="5" fill="#111111" />
              <g stroke="#111111" strokeWidth="1.5" strokeLinecap="round">
                <path d="M60 98 Q52 90 48 94" />
                <path d="M60 102 Q52 106 48 112" />
                <path d="M60 98 Q68 90 72 94" />
                <path d="M60 102 Q68 106 72 112" />
              </g>

              {/* Web Shooter Hands Thwip Pose */}
              <circle cx="20" cy="106" r="7" fill="#E23636" stroke="#111111" strokeWidth="2" />
              <circle cx="100" cy="106" r="7" fill="#E23636" stroke="#111111" strokeWidth="2" />
              {/* Glowing Web Spark */}
              <circle cx="106" cy="104" r="3" fill="#FFFFFF" className="animate-ping" />
            </svg>
          </div>
        </div>
      );

    case 'pikachu':
      return (
        <div className="relative w-36 h-40 flex items-center justify-center">
          {/* Pikachu Thunder Jump */}
          <div className="relative w-full h-full animate-bounce duration-700">
            <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-2xl">
              {/* Pikachu Long Ears */}
              <g>
                {/* Left Ear */}
                <polygon points="26,45 8,10 40,32" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
                <polygon points="12,18 8,10 22,14" fill="#111111" />
                {/* Right Ear */}
                <polygon points="94,45 112,10 80,32" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
                <polygon points="108,18 112,10 98,14" fill="#111111" />
              </g>

              {/* Head */}
              <ellipse cx="60" cy="56" rx="36" ry="32" fill="#FFD700" stroke="#E6B800" strokeWidth="2.5" />

              {/* Big Anime Eyes */}
              <circle cx="44" cy="52" r="7" fill="#111111" />
              <circle cx="76" cy="52" r="7" fill="#111111" />
              <circle cx="46" cy="50" r="2.5" fill="#FFFFFF" />
              <circle cx="78" cy="50" r="2.5" fill="#FFFFFF" />

              {/* Tiny Nose */}
              <polygon points="60,60 58,62 62,62" fill="#111111" />

              {/* Rosy Electric Cheeks */}
              <circle cx="32" cy="65" r="7" fill="#EE1C25" />
              <circle cx="88" cy="65" r="7" fill="#EE1C25" />

              {/* Cheerful Open Mouth */}
              <path d="M52 68 Q60 80 68 68" fill="#D32F2F" stroke="#111111" strokeWidth="1.8" />

              {/* Body */}
              <ellipse cx="60" cy="100" rx="30" ry="24" fill="#FFD700" stroke="#E6B800" strokeWidth="2.5" />

              {/* Lightning Bolt Tail */}
              <polygon points="86,85 106,70 98,88 116,80 102,112 86,96" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />

              {/* Little Paws */}
              <ellipse cx="44" cy="94" rx="6" ry="8" fill="#FFD700" stroke="#E6B800" strokeWidth="1.8" />
              <ellipse cx="76" cy="94" rx="6" ry="8" fill="#FFD700" stroke="#E6B800" strokeWidth="1.8" />

              {/* Feet */}
              <ellipse cx="46" cy="124" rx="10" ry="6" fill="#FFD700" stroke="#E6B800" strokeWidth="1.8" />
              <ellipse cx="74" cy="124" rx="10" ry="6" fill="#FFD700" stroke="#E6B800" strokeWidth="1.8" />
            </svg>
          </div>
        </div>
      );

    case 'chalky':
    default:
      return (
        <div className="relative w-36 h-40 flex items-center justify-center">
          <div className="relative w-full h-full animate-bounce duration-1000">
            <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-2xl">
              <defs>
                <linearGradient id="chalkHeroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F9F6EE" />
                  <stop offset="60%" stopColor="#FFFDD0" />
                  <stop offset="100%" stopColor="#E6DFCE" />
                </linearGradient>
              </defs>
              <ellipse cx="50" cy="122" rx="28" ry="6" fill="#000000" opacity="0.3" />
              <rect x="30" y="24" width="40" height="88" rx="8" fill="url(#chalkHeroGrad)" stroke="#D7CEB2" strokeWidth="2.5" />
              <path d="M30 26 C30 16, 70 16, 70 26 Z" fill="#FFF" stroke="#D7CEB2" strokeWidth="2" />
              <path d="M42 98 L50 94 L58 98 L50 102 Z" fill="#E2725B" />
              <circle cx="43" cy="46" r="6.5" fill="#FFFFFF" stroke="#2C3E35" strokeWidth="1.5" />
              <circle cx="57" cy="46" r="6.5" fill="#FFFFFF" stroke="#2C3E35" strokeWidth="1.5" />
              <circle cx="44" cy="46" r="3.5" fill="#1B2821" />
              <circle cx="58" cy="46" r="3.5" fill="#1B2821" />
              <circle cx="45.5" cy="44.5" r="1.5" fill="#FFFFFF" />
              <circle cx="59.5" cy="44.5" r="1.5" fill="#FFFFFF" />
              <ellipse cx="36" cy="54" rx="4" ry="2.5" fill="#FF8A80" opacity="0.6" />
              <ellipse cx="64" cy="54" rx="4" ry="2.5" fill="#FF8A80" opacity="0.6" />
              <path d="M40 56 Q50 68 60 56 Z" fill="#E2725B" stroke="#2C3E35" strokeWidth="1.5" />
              <g stroke="#FFFDD0" strokeWidth="4.5" strokeLinecap="round" fill="none">
                <path d="M30 60 Q15 40 22 25" />
                <circle cx="22" cy="25" r="4.5" fill="#FFFDD0" />
                <path d="M70 60 Q85 40 78 25" />
                <circle cx="78" cy="25" r="4.5" fill="#FFFDD0" />
              </g>
            </svg>
          </div>
        </div>
      );
  }
}
