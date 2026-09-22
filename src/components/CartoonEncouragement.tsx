import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Smile, 
  Award, 
  Heart, 
  Zap, 
  Lightbulb, 
  RotateCcw,
  Star,
  CheckCircle2,
  PartyPopper
} from 'lucide-react';
import { chalkAudio } from '../utils/chalkAudio';

export type MascotId = 'doraemon' | 'shinchan' | 'spiderman' | 'pikachu' | 'chalky' | 'hooty' | 'sparky';

interface CartoonEncouragementProps {
  score: number;
  praise: string;
  mistakesCount: number;
  topic?: string;
  question?: string;
  transcribedText?: string;
  onSelectMascot?: (mascotId: MascotId) => void;
  compact?: boolean;
}

interface MascotConfig {
  id: MascotId;
  name: string;
  title: string;
  description: string;
  avatarColor: string;
  accentColor: string;
}

const MASCOTS: MascotConfig[] = [
  {
    id: 'doraemon',
    name: 'Doraemon',
    title: 'Robotic Cat & Gadget Wizard',
    description: 'Flies in with Bamboo-Copter and pulls out Memory Bread for math!',
    avatarColor: '#00A0E9',
    accentColor: '#00A0E9',
  },
  {
    id: 'shinchan',
    name: 'Shin-chan',
    title: 'Action Kamen Champion',
    description: 'Cheeky hip-wiggle dancer and high-energy encouragement buddy!',
    avatarColor: '#FF3B30',
    accentColor: '#FF9500',
  },
  {
    id: 'spiderman',
    name: 'Spider-Man',
    title: 'Friendly Neighborhood Hero',
    description: 'Swings in on a web line and stamps your chalkboard with hero mastery!',
    avatarColor: '#E23636',
    accentColor: '#518CCA',
  },
  {
    id: 'pikachu',
    name: 'Pikachu',
    title: 'Electric Math Champion',
    description: 'Lightning speed sparks and high-voltage brain power cheers!',
    avatarColor: '#FFD700',
    accentColor: '#FFCA28',
  },
  {
    id: 'chalky',
    name: 'Chalky',
    title: 'The Slate Stick',
    description: 'Energetic chalkboard chalk full of dust and determination!',
    avatarColor: '#FFFDD0',
    accentColor: '#E8C468',
  },
  {
    id: 'hooty',
    name: 'Prof. Hooty',
    title: 'The Wise Owl',
    description: 'Patient teacher who loves deep thinking and neat proofs.',
    avatarColor: '#C4A482',
    accentColor: '#81D4FA',
  },
  {
    id: 'sparky',
    name: 'Sparky',
    title: 'The Super Star',
    description: 'Always cheering you on with golden sparkles and high-fives!',
    avatarColor: '#FFD700',
    accentColor: '#FFCA28',
  },
];

export default function CartoonEncouragement({
  score,
  praise,
  mistakesCount,
  topic,
  question,
  compact = false,
}: CartoonEncouragementProps) {
  const [selectedMascot, setSelectedMascot] = useState<MascotId>(() => {
    try {
      const saved = localStorage.getItem('slate_preferred_mascot');
      if (saved && ['chalky', 'hooty', 'sparky', 'robo', 'pip'].includes(saved)) {
        return saved as MascotId;
      }
    } catch {}
    return 'chalky';
  });

  const [isPokeActive, setIsPokeActive] = useState(false);
  const [pokeMessage, setPokeMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(score >= 85);
  const [bounceCount, setBounceCount] = useState(0);

  // Play entry sound effect when cartoon mounts or score arrives
  useEffect(() => {
    if (score >= 90) {
      chalkAudio.playCelebrationFanfare();
      setShowConfetti(true);
    } else if (score >= 70) {
      chalkAudio.playEncouragementCheer();
    } else {
      chalkAudio.playMascotPop();
    }
  }, [score]);

  const handleSelectMascot = (id: MascotId) => {
    setSelectedMascot(id);
    chalkAudio.playMascotPop();
    try {
      localStorage.setItem('slate_preferred_mascot', id);
    } catch {}
  };

  // Determine emotional tier based on score
  const tier = useMemo(() => {
    if (score >= 90) return 'celebration'; // 90-100
    if (score >= 75) return 'proficient';  // 75-89
    if (score >= 55) return 'growth';      // 55-74
    return 'encouragement';                // < 55
  }, [score]);

  // Dynamic dialogue generator customized per mascot and score tier
  const mascotSpeech = useMemo(() => {
    if (pokeMessage) return pokeMessage;

    const mascot = MASCOTS.find((m) => m.id === selectedMascot)?.name || 'Chalky';

    switch (tier) {
      case 'celebration':
        if (selectedMascot === 'hooty') {
          return `Hoo-ray! An absolute masterpiece of mathematical logic! Your reasoning is crisp and accurate!`;
        }
        if (selectedMascot === 'sparky') {
          return `SHINING BRILLIANT! You scored ${score}/100 with ZERO flaws! You are unstoppable today!`;
        }
        if (selectedMascot === 'robo') {
          return `BEEP BOOP! Perfection index calculated at 100%! All solution steps are fully verified!`;
        }
        if (selectedMascot === 'pip') {
          return `YIPPEE! Jump for joy! That was quick, clever, and 100% correct! You're a superstar!`;
        }
        return `WOOHOO! ${praise || 'Flawless chalkboard execution! You crushed this problem!'}`;

      case 'proficient':
        if (selectedMascot === 'hooty') {
          return `Very sharp work! You've grasped the core theorems nicely. Just a tiny detail to polish!`;
        }
        if (selectedMascot === 'sparky') {
          return `Look at you glow! Scored ${score}/100! Almost at the pinnacle—keep this fire burning!`;
        }
        if (selectedMascot === 'robo') {
          return `Efficiency rating high: ${score}%. Minor syntax variation detected, but logic is solid!`;
        }
        if (selectedMascot === 'pip') {
          return `High five! You solved almost the whole thing! Check the small tip to make it 100%!`;
        }
        return `Awesome effort! ${praise || 'Great progress! You are super close to total mastery!'}`;

      case 'growth':
        if (selectedMascot === 'hooty') {
          return `A splendid thinking attempt! Learning happens when we analyze our stepping stones.`;
        }
        if (selectedMascot === 'sparky') {
          return `Good spark! You've got great instincts. Take a peek at the step corrections below!`;
        }
        if (selectedMascot === 'robo') {
          return `Algorithm initialized. Analyzing ${mistakesCount} correction point(s). You can solve this!`;
        }
        if (selectedMascot === 'pip') {
          return `You're on the right track! Don't give up—let's look at where the math turned tricky!`;
        }
        return `Good thinking! ${praise || 'You have the right intuition. Check the step breakdown to fix the slip!'}`;

      default:
        if (selectedMascot === 'hooty') {
          return `Do not be discouraged. Even the greatest scholars learned by trying and refining!`;
        }
        if (selectedMascot === 'sparky') {
          return `Every star starts as a tiny spark! Let's clear the slate and master this step by step!`;
        }
        if (selectedMascot === 'robo') {
          return `Error recovery protocol: Activated! We will analyze the method together and improve!`;
        }
        if (selectedMascot === 'pip') {
          return `Warm hug! Mistakes make our brain muscles bigger! Let's conquer this together!`;
        }
        return `Mistakes are proof that you are learning! Review the corrections below and try again!`;
    }
  }, [selectedMascot, tier, score, mistakesCount, praise, pokeMessage]);

  // Handle Mascot Poke / High-Five Interaction
  const handlePoke = () => {
    setIsPokeActive(true);
    setBounceCount((c) => c + 1);
    chalkAudio.playMascotGiggle();

    const funnyPokes = [
      "Hehe! That tickles! 😄 Ready to write more math?",
      "HIGH FIVE! ✋ Keep up the tremendous energy!",
      "Boing! 🌟 Your brain power is charging up!",
      "Chalk dust flying! ✨ You're going to ace the next one!",
      "Wooo! 🚀 Focus mode energized!",
    ];
    const picked = funnyPokes[Math.floor(Math.random() * funnyPokes.length)];
    setPokeMessage(picked);

    setTimeout(() => {
      setIsPokeActive(false);
    }, 1200);

    setTimeout(() => {
      setPokeMessage(null);
    }, 4500);
  };

  // Text-To-Speech for Cartoon Mascot
  const speakMascotDialogue = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(mascotSpeech);
    // Give cute cartoon pitch depending on mascot
    if (selectedMascot === 'sparky' || selectedMascot === 'pip') {
      utterance.pitch = 1.35;
      utterance.rate = 1.05;
    } else if (selectedMascot === 'hooty') {
      utterance.pitch = 0.85;
      utterance.rate = 0.95;
    } else if (selectedMascot === 'robo') {
      utterance.pitch = 1.1;
      utterance.rate = 1.1;
    } else {
      utterance.pitch = 1.2;
      utterance.rate = 1.0;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Mascot SVG Cartoon Character Renderer
  const renderMascotArt = () => {
    const isDancing = tier === 'celebration' || isPokeActive;
    const isWaving = tier === 'proficient';

    switch (selectedMascot) {
      case 'doraemon':
        return (
          <div className="relative w-28 h-32 flex items-center justify-center select-none">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
              <div className="w-14 h-2 bg-[#FFD700] rounded-full border border-[#FFA000] animate-spin origin-center shadow" />
              <div className="w-1.5 h-3 bg-[#FFA000]" />
              <div className="w-3.5 h-1 bg-[#FF6F00] rounded-full" />
            </div>
            <svg viewBox="0 0 120 140" className={`w-full h-full drop-shadow-xl transition-transform duration-300 ${isDancing ? 'animate-bounce' : 'animate-pulse'}`}>
              <ellipse cx="60" cy="52" rx="42" ry="38" fill="#00A0E9" stroke="#0077B6" strokeWidth="2.5" />
              <ellipse cx="60" cy="58" rx="34" ry="28" fill="#FFFFFF" />
              <ellipse cx="50" cy="36" rx="10" ry="14" fill="#FFFFFF" stroke="#0077B6" strokeWidth="1.8" />
              <ellipse cx="70" cy="36" rx="10" ry="14" fill="#FFFFFF" stroke="#0077B6" strokeWidth="1.8" />
              <ellipse cx="53" cy="37" rx="4" ry="6" fill="#111111" />
              <ellipse cx="67" cy="37" rx="4" ry="6" fill="#111111" />
              <circle cx="54" cy="35" r="1.8" fill="#FFFFFF" />
              <circle cx="68" cy="35" r="1.8" fill="#FFFFFF" />
              <circle cx="60" cy="48" r="6" fill="#EE1C25" stroke="#B30006" strokeWidth="1.5" />
              <g stroke="#111111" strokeWidth="1.8" strokeLinecap="round">
                <line x1="60" y1="54" x2="60" y2="76" />
                <line x1="52" y1="55" x2="30" y2="50" />
                <line x1="52" y1="62" x2="28" y2="62" />
                <line x1="52" y1="69" x2="32" y2="74" />
                <line x1="68" y1="55" x2="90" y2="50" />
                <line x1="68" y1="62" x2="92" y2="62" />
                <line x1="68" y1="69" x2="88" y2="74" />
              </g>
              <path d="M42 66 Q60 90 78 66 Z" fill="#EE1C25" stroke="#900C12" strokeWidth="1.5" />
              <ellipse cx="60" cy="74" rx="10" ry="5" fill="#FFA07A" />
              <rect x="36" y="84" width="48" height="7" rx="3.5" fill="#EE1C25" stroke="#B30006" strokeWidth="1.5" />
              <circle cx="60" cy="94" r="7" fill="#FFD700" stroke="#FFA000" strokeWidth="1.5" />
              <circle cx="24" cy="94" r="10" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2" />
              <circle cx="96" cy="94" r="10" fill="#FFFFFF" stroke="#0077B6" strokeWidth="2" />
            </svg>
          </div>
        );

      case 'shinchan':
        return (
          <div className="relative w-28 h-32 flex items-center justify-center select-none">
            <svg viewBox="0 0 120 140" className={`w-full h-full drop-shadow-xl transition-transform duration-300 ${isDancing ? 'animate-bounce' : 'animate-pulse'}`}>
              <path d="M38 32 C26 32, 20 48, 20 62 C20 78, 32 86, 52 86 C76 86, 96 74, 96 56 C96 38, 76 32, 54 32 Z" fill="#FFDCB6" stroke="#D4A373" strokeWidth="2.5" />
              <path d="M26 44 Q38 36 50 44" stroke="#111111" strokeWidth="7" strokeLinecap="round" fill="none" />
              <path d="M58 44 Q70 36 82 44" stroke="#111111" strokeWidth="7" strokeLinecap="round" fill="none" />
              <ellipse cx="42" cy="56" rx="8" ry="11" fill="#111111" />
              <ellipse cx="72" cy="56" rx="8" ry="11" fill="#111111" />
              <circle cx="44" cy="54" r="3" fill="#FFFFFF" />
              <circle cx="74" cy="54" r="3" fill="#FFFFFF" />
              <ellipse cx="26" cy="68" rx="6" ry="4" fill="#FF6B6B" opacity="0.8" />
              <ellipse cx="88" cy="64" rx="6" ry="4" fill="#FF6B6B" opacity="0.8" />
              <path d="M48 68 Q58 80 68 68" fill="#E63946" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
              <path d="M30 84 L90 84 L96 116 L24 116 Z" fill="#E63946" stroke="#900C12" strokeWidth="2.5" />
              <rect x="32" y="114" width="56" height="16" rx="4" fill="#FFD166" stroke="#D4A373" strokeWidth="2" />
              <circle cx="18" cy="98" r="7" fill="#FFDCB6" stroke="#D4A373" strokeWidth="2" />
              <circle cx="102" cy="98" r="7" fill="#FFDCB6" stroke="#D4A373" strokeWidth="2" />
            </svg>
          </div>
        );

      case 'spiderman':
        return (
          <div className="relative w-28 h-32 flex items-center justify-center select-none">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-white/80 shadow-[0_0_6px_#FFF]" />
            <svg viewBox="0 0 120 140" className={`w-full h-full drop-shadow-xl transition-transform duration-300 ${isDancing ? 'animate-bounce' : 'animate-pulse'}`}>
              <ellipse cx="60" cy="52" rx="34" ry="38" fill="#E23636" stroke="#111111" strokeWidth="2.5" />
              <g stroke="#111111" strokeWidth="1.2" opacity="0.65" fill="none">
                <line x1="60" y1="14" x2="60" y2="90" />
                <line x1="26" y1="52" x2="94" y2="52" />
                <circle cx="60" cy="52" r="14" />
                <circle cx="60" cy="52" r="26" />
              </g>
              <polygon points="34,44 54,48 48,64 32,54" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />
              <polygon points="86,44 66,48 72,64 88,54" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />
              <path d="M36 86 L84 86 L94 122 L26 122 Z" fill="#E23636" stroke="#111111" strokeWidth="2.5" />
              <circle cx="20" cy="106" r="7" fill="#E23636" stroke="#111111" strokeWidth="2" />
              <circle cx="100" cy="106" r="7" fill="#E23636" stroke="#111111" strokeWidth="2" />
            </svg>
          </div>
        );

      case 'pikachu':
        return (
          <div className="relative w-28 h-32 flex items-center justify-center select-none">
            <svg viewBox="0 0 120 140" className={`w-full h-full drop-shadow-xl transition-transform duration-300 ${isDancing ? 'animate-bounce' : 'animate-pulse'}`}>
              <polygon points="26,45 8,10 40,32" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
              <polygon points="12,18 8,10 22,14" fill="#111111" />
              <polygon points="94,45 112,10 80,32" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
              <polygon points="108,18 112,10 98,14" fill="#111111" />
              <ellipse cx="60" cy="56" rx="36" ry="32" fill="#FFD700" stroke="#E6B800" strokeWidth="2.5" />
              <circle cx="44" cy="52" r="7" fill="#111111" />
              <circle cx="76" cy="52" r="7" fill="#111111" />
              <circle cx="46" cy="50" r="2.5" fill="#FFFFFF" />
              <circle cx="78" cy="50" r="2.5" fill="#FFFFFF" />
              <circle cx="32" cy="65" r="7" fill="#EE1C25" />
              <circle cx="88" cy="65" r="7" fill="#EE1C25" />
              <path d="M52 68 Q60 80 68 68" fill="#D32F2F" stroke="#111111" strokeWidth="1.8" />
              <ellipse cx="60" cy="100" rx="30" ry="24" fill="#FFD700" stroke="#E6B800" strokeWidth="2.5" />
              <polygon points="86,85 106,70 98,88 116,80 102,112 86,96" fill="#FFD700" stroke="#E6B800" strokeWidth="2" />
            </svg>
          </div>
        );

      case 'chalky':
        return (
          <div className="relative w-28 h-32 flex items-center justify-center select-none">
            {/* Floating Chalk Dust Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-1 left-2 text-[#FFFDD0]/70 text-xs animate-ping">✦</span>
              <span className="absolute top-6 right-1 text-[#E8C468] text-sm animate-bounce">★</span>
              <span className="absolute bottom-2 left-3 text-[#81D4FA] text-xs animate-pulse">✦</span>
              {tier === 'celebration' && (
                <span className="absolute -top-3 right-4 text-lg animate-bounce">👑</span>
              )}
            </div>

            <svg 
              viewBox="0 0 100 130" 
              className={`w-full h-full drop-shadow-lg transition-transform duration-300 ${
                isDancing ? 'animate-bounce' : 'animate-pulse'
              }`}
            >
              {/* Chalk Body */}
              <defs>
                <linearGradient id="chalkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F9F6EE" />
                  <stop offset="60%" stopColor="#FFFDD0" />
                  <stop offset="100%" stopColor="#E6DFCE" />
                </linearGradient>
                <linearGradient id="chalkCap" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFD54F" />
                  <stop offset="100%" stopColor="#FFA000" />
                </linearGradient>
              </defs>

              {/* Shadow Base */}
              <ellipse cx="50" cy="122" rx="28" ry="6" fill="#000000" opacity="0.25" />

              {/* Chalk Stick Cylinder */}
              <rect x="30" y="24" width="40" height="88" rx="8" fill="url(#chalkGrad)" stroke="#D7CEB2" strokeWidth="2.5" />

              {/* Beveled Chalk Tip */}
              <path d="M30 26 C30 16, 70 16, 70 26 Z" fill="#FFF" stroke="#D7CEB2" strokeWidth="2" />

              {/* Bowtie / Necktie */}
              <path d="M42 98 L50 94 L58 98 L50 102 Z" fill="#E2725B" />
              <circle cx="50" cy="98" r="3" fill="#B33925" />

              {/* Cartoon Eyes */}
              {tier === 'celebration' ? (
                // Starry / joyful closed eye curves
                <g stroke="#2C3E35" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <path d="M38 46 Q43 38 48 46" />
                  <path d="M52 46 Q57 38 62 46" />
                </g>
              ) : (
                // Big expressive cartoon eyes with highlights
                <g>
                  <circle cx="43" cy="46" r="6.5" fill="#FFFFFF" stroke="#2C3E35" strokeWidth="1.5" />
                  <circle cx="57" cy="46" r="6.5" fill="#FFFFFF" stroke="#2C3E35" strokeWidth="1.5" />
                  <circle cx="44" cy="46" r="3.5" fill="#1B2821" />
                  <circle cx="58" cy="46" r="3.5" fill="#1B2821" />
                  {/* Eye sparkle dots */}
                  <circle cx="45.5" cy="44.5" r="1.5" fill="#FFFFFF" />
                  <circle cx="59.5" cy="44.5" r="1.5" fill="#FFFFFF" />
                </g>
              )}

              {/* Rosy Cheeks */}
              <ellipse cx="36" cy="54" rx="4" ry="2.5" fill="#FF8A80" opacity="0.6" />
              <ellipse cx="64" cy="54" rx="4" ry="2.5" fill="#FF8A80" opacity="0.6" />

              {/* Cartoon Smile */}
              {tier === 'celebration' ? (
                <path d="M40 56 Q50 68 60 56 Z" fill="#E2725B" stroke="#2C3E35" strokeWidth="1.5" />
              ) : tier === 'growth' ? (
                <path d="M44 58 Q50 64 56 58" fill="none" stroke="#2C3E35" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <path d="M42 56 Q50 65 58 56" fill="none" stroke="#2C3E35" strokeWidth="2.5" strokeLinecap="round" />
              )}

              {/* Animated Cartoon Hands */}
              {isDancing ? (
                // Hands raised in celebration!
                <g stroke="#FFFDD0" strokeWidth="4.5" strokeLinecap="round" fill="none">
                  <path d="M30 60 Q15 40 22 25" stroke="#E6DFCE" strokeWidth="5.5" />
                  <path d="M30 60 Q15 40 22 25" />
                  <circle cx="22" cy="25" r="4.5" fill="#FFFDD0" />

                  <path d="M70 60 Q85 40 78 25" stroke="#E6DFCE" strokeWidth="5.5" />
                  <path d="M70 60 Q85 40 78 25" />
                  <circle cx="78" cy="25" r="4.5" fill="#FFFDD0" />
                </g>
              ) : isWaving ? (
                // One hand waving high-five, one on hip
                <g stroke="#FFFDD0" strokeWidth="4.5" strokeLinecap="round" fill="none">
                  <path d="M30 65 Q20 75 22 85" stroke="#E6DFCE" strokeWidth="5.5" />
                  <path d="M30 65 Q20 75 22 85" />
                  <path d="M70 65 Q86 45 82 35" stroke="#E6DFCE" strokeWidth="5.5" />
                  <path d="M70 65 Q86 45 82 35" />
                  <circle cx="82" cy="35" r="4" fill="#FFFDD0" />
                </g>
              ) : (
                // Holding a mini chalk piece or pointing
                <g stroke="#FFFDD0" strokeWidth="4" strokeLinecap="round" fill="none">
                  <path d="M30 68 Q18 78 24 88" />
                  <path d="M70 68 Q82 78 76 88" />
                </g>
              )}
            </svg>
          </div>
        );

      case 'hooty':
        return (
          <div className="relative w-28 h-32 flex items-center justify-center select-none">
            <svg 
              viewBox="0 0 100 120" 
              className={`w-full h-full drop-shadow-lg transition-transform duration-300 ${
                isDancing ? 'animate-bounce' : 'animate-pulse'
              }`}
            >
              {/* Shadow Base */}
              <ellipse cx="50" cy="112" rx="26" ry="5" fill="#000000" opacity="0.25" />

              {/* Graduation Cap */}
              <polygon points="50,12 85,24 50,36 15,24" fill="#1C2B24" stroke="#E8C468" strokeWidth="1.5" />
              <rect x="38" y="28" width="24" height="10" rx="3" fill="#182821" />
              <path d="M78 26 L86 42" stroke="#E8C468" strokeWidth="2" strokeLinecap="round" />
              <circle cx="86" cy="43" r="2.5" fill="#E8C468" />

              {/* Owl Body */}
              <ellipse cx="50" cy="70" rx="32" ry="36" fill="#8D6E63" stroke="#5D4037" strokeWidth="2" />
              <ellipse cx="50" cy="74" rx="22" ry="26" fill="#D7CCC8" />

              {/* Big Round Glasses */}
              <circle cx="38" cy="58" r="13" fill="#FFF" stroke="#E8C468" strokeWidth="2.5" />
              <circle cx="62" cy="58" r="13" fill="#FFF" stroke="#E8C468" strokeWidth="2.5" />
              <line x1="51" y1="58" x2="49" y2="58" stroke="#E8C468" strokeWidth="2.5" />

              {/* Owl Eyes */}
              <circle cx="39" cy="58" r="6" fill="#2E1C14" />
              <circle cx="61" cy="58" r="6" fill="#2E1C14" />
              <circle cx="41" cy="56" r="2" fill="#FFF" />
              <circle cx="63" cy="56" r="2" fill="#FFF" />

              {/* Cute Owl Beak */}
              <polygon points="50,65 45,72 55,72" fill="#FFA000" />

              {/* Wings */}
              {isDancing ? (
                <g fill="#6D4C41">
                  <path d="M18 55 Q5 35 15 25 Q28 45 22 70 Z" />
                  <path d="M82 55 Q95 35 85 25 Q72 45 78 70 Z" />
                </g>
              ) : (
                <g fill="#6D4C41">
                  <ellipse cx="20" cy="75" rx="7" ry="18" transform="rotate(-15 20 75)" />
                  <ellipse cx="80" cy="75" rx="7" ry="18" transform="rotate(15 80 75)" />
                </g>
              )}

              {/* Feet Claws */}
              <circle cx="42" cy="106" r="4" fill="#FFA000" />
              <circle cx="58" cy="106" r="4" fill="#FFA000" />
            </svg>
          </div>
        );

      case 'sparky':
        return (
          <div className="relative w-28 h-32 flex items-center justify-center select-none">
            <svg 
              viewBox="0 0 120 120" 
              className={`w-full h-full drop-shadow-xl transition-transform duration-300 ${
                isDancing ? 'animate-bounce' : 'animate-pulse'
              }`}
            >
              {/* Star Glow */}
              <circle cx="60" cy="60" r="45" fill="#FFD54F" opacity="0.2" className="animate-ping" />

              {/* 5-Pointed Cartoon Star Body */}
              <polygon
                points="60,10 75,45 112,48 83,72 92,110 60,88 28,110 37,72 8,48 45,45"
                fill="#FFCA28"
                stroke="#FF8F00"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Sunglasses for High Score or Cheerful Eyes */}
              {tier === 'celebration' ? (
                <g>
                  {/* Cool Dark Sunglasses */}
                  <polygon points="34,52 54,50 52,65 36,65" fill="#212121" />
                  <polygon points="66,50 86,52 84,65 68,65" fill="#212121" />
                  <line x1="54" y1="52" x2="66" y2="52" stroke="#212121" strokeWidth="2.5" />
                  {/* Glare Stripe on shades */}
                  <line x1="38" y1="54" x2="48" y2="62" stroke="#FFF" strokeWidth="1.5" opacity="0.7" />
                  <line x1="70" y1="54" x2="80" y2="62" stroke="#FFF" strokeWidth="1.5" opacity="0.7" />
                  {/* Smug Smile */}
                  <path d="M48 72 Q60 82 72 72" fill="none" stroke="#212121" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              ) : (
                <g>
                  {/* Happy Big Eyes */}
                  <circle cx="46" cy="55" r="6" fill="#212121" />
                  <circle cx="74" cy="55" r="6" fill="#212121" />
                  <circle cx="48" cy="53" r="2" fill="#FFF" />
                  <circle cx="76" cy="53" r="2" fill="#FFF" />
                  {/* Rosy Sparkle Cheeks */}
                  <circle cx="38" cy="62" r="4" fill="#FF8A80" opacity="0.7" />
                  <circle cx="82" cy="62" r="4" fill="#FF8A80" opacity="0.7" />
                  {/* Open Smile */}
                  <path d="M50 66 Q60 78 70 66 Z" fill="#D32F2F" stroke="#212121" strokeWidth="1.5" />
                </g>
              )}
            </svg>
          </div>
        );

      case 'robo':
        return (
          <div className="relative w-28 h-32 flex items-center justify-center select-none">
            <svg 
              viewBox="0 0 100 120" 
              className={`w-full h-full drop-shadow-lg transition-transform duration-300 ${
                isDancing ? 'animate-bounce' : 'animate-pulse'
              }`}
            >
              {/* Antenna */}
              <line x1="50" y1="26" x2="50" y2="12" stroke="#4DD0E1" strokeWidth="3" />
              <circle cx="50" cy="10" r="5" fill="#FFEB3B" className="animate-ping" />
              <circle cx="50" cy="10" r="5" fill="#FFC107" />

              {/* Robot Head */}
              <rect x="22" y="26" width="56" height="42" rx="10" fill="#37474F" stroke="#4DD0E1" strokeWidth="2.5" />

              {/* Ear Bolts */}
              <rect x="14" y="38" width="8" height="16" rx="2" fill="#78909C" />
              <rect x="78" y="38" width="8" height="16" rx="2" fill="#78909C" />

              {/* Digital LED Screen Eyes */}
              <rect x="30" y="34" width="40" height="24" rx="5" fill="#102027" />
              {tier === 'celebration' ? (
                // Heart or Star LED Eyes
                <g fill="#00E676">
                  <path d="M37 42 L41 38 L45 42 L41 46 Z" />
                  <path d="M55 42 L59 38 L63 42 L59 46 Z" />
                </g>
              ) : (
                <g fill="#00E5FF">
                  <circle cx="40" cy="44" r="3.5" />
                  <circle cx="60" cy="44" r="3.5" />
                </g>
              )}

              {/* Robot Mouth Grid */}
              <line x1="42" y1="52" x2="58" y2="52" stroke="#00E5FF" strokeWidth="2" strokeDasharray="2 2" />

              {/* Robot Body */}
              <rect x="28" y="72" width="44" height="38" rx="6" fill="#455A64" stroke="#4DD0E1" strokeWidth="2" />
              {/* Gauge Meter on Chest */}
              <circle cx="50" cy="88" r="10" fill="#102027" stroke="#00E5FF" strokeWidth="1.5" />
              <line x1="50" y1="88" x2="55" y2="82" stroke="#FF5252" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'pip':
      default:
        return (
          <div className="relative w-28 h-32 flex items-center justify-center select-none">
            <svg 
              viewBox="0 0 100 120" 
              className={`w-full h-full drop-shadow-lg transition-transform duration-300 ${
                isDancing ? 'animate-bounce' : 'animate-pulse'
              }`}
            >
              {/* Shadow */}
              <ellipse cx="50" cy="112" rx="24" ry="5" fill="#000000" opacity="0.25" />

              {/* Fox Ears */}
              <polygon points="26,45 16,14 42,32" fill="#E65100" />
              <polygon points="28,40 22,22 38,32" fill="#FFF" />
              <polygon points="74,45 84,14 58,32" fill="#E65100" />
              <polygon points="72,40 78,22 62,32" fill="#FFF" />

              {/* Fox Head & Cheeks */}
              <ellipse cx="50" cy="55" rx="30" ry="24" fill="#FF7043" />
              <path d="M22 62 Q50 82 78 62 Q50 68 22 62 Z" fill="#FFF" />

              {/* Eyes */}
              <ellipse cx="38" cy="50" rx="3.5" ry="5" fill="#212121" />
              <ellipse cx="62" cy="50" rx="3.5" ry="5" fill="#212121" />
              <circle cx="39" cy="48" r="1.5" fill="#FFF" />
              <circle cx="63" cy="48" r="1.5" fill="#FFF" />

              {/* Nose */}
              <circle cx="50" cy="62" r="3.5" fill="#212121" />

              {/* Fox Body */}
              <ellipse cx="50" cy="88" rx="22" ry="20" fill="#FF7043" />
              <ellipse cx="50" cy="90" rx="12" ry="14" fill="#FFF" />

              {/* Fluffy Tail */}
              <path d="M70 85 Q92 70 86 50 Q75 65 65 78 Z" fill="#E65100" />
              <path d="M86 50 Q80 58 75 65 Z" fill="#FFF" />
            </svg>
          </div>
        );
    }
  };

  // Badge / Reward title
  const rewardBadge = useMemo(() => {
    if (score >= 95) return { title: 'Mathematical Genius', icon: '🏆', color: 'text-[#FFD700] border-[#FFD700]/40 bg-[#FFD700]/10' };
    if (score >= 85) return { title: 'Slate Master', icon: '🌟', color: 'text-[#81D4FA] border-[#81D4FA]/40 bg-[#81D4FA]/10' };
    if (score >= 70) return { title: 'Skill Builder', icon: '⚡', color: 'text-[#8FBF8A] border-[#8FBF8A]/40 bg-[#8FBF8A]/10' };
    return { title: 'Growth Mindset', icon: '🌱', color: 'text-[#E8C468] border-[#E8C468]/40 bg-[#E8C468]/10' };
  }, [score]);

  return (
    <div 
      id="cartoonEncouragementBox"
      className="relative p-4 rounded-2xl bg-gradient-to-br from-[#162720] via-[#1C2E26] to-[#121F19] border border-[#E8C468]/30 shadow-xl overflow-hidden"
    >
      {/* Background Chalk Dust Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#E8C468]/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#81D4FA]/10 blur-xl pointer-events-none" />

      {/* Confetti Sparkles Overlay when celebration */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-2 left-1/4 text-sm animate-bounce">🎉</div>
          <div className="absolute top-4 right-1/4 text-sm animate-ping">✨</div>
          <div className="absolute bottom-2 right-8 text-xs animate-pulse">🎊</div>
          <div className="absolute top-8 left-6 text-xs animate-bounce">⭐</div>
        </div>
      )}

      {/* Mascot Selector Bar */}
      <div className="flex items-center justify-between gap-1 mb-3 pb-2 border-b border-[#F5F1E6]/10">
        <div className="flex items-center gap-1.5 text-xs text-[#E8C468] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Study Mascot Companion</span>
        </div>

        {/* Mascot Switching Pills */}
        <div className="flex items-center gap-1">
          {MASCOTS.map((m) => (
            <button
              key={m.id}
              id={`selectMascotBtn_${m.id}`}
              onClick={() => handleSelectMascot(m.id)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                selectedMascot === m.id
                  ? 'bg-[#E8C468] text-[#121F19] shadow-md scale-105'
                  : 'bg-[#213A30]/80 text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#2A473B]'
              }`}
              title={`${m.name} (${m.title})`}
            >
              {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Mascot & Speech Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Animated Cartoon Mascot Visual */}
        <div 
          onClick={handlePoke}
          className="relative group cursor-pointer shrink-0 transition-transform active:scale-95 hover:scale-105"
          title="Click to High-Five or Tickle!"
        >
          {renderMascotArt()}

          {/* Interactive Tap Hint Pill */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#121F19]/90 border border-[#E8C468]/40 text-[9px] text-[#E8C468] font-semibold tracking-wide whitespace-nowrap shadow-sm opacity-90 group-hover:opacity-100 group-hover:bg-[#E8C468] group-hover:text-[#121F19] transition-all">
            👋 Tap Mascot!
          </div>
        </div>

        {/* Speech Bubble & Feedback Message */}
        <div className="flex-1 w-full flex flex-col justify-between">
          <div className="relative p-3 rounded-2xl bg-[#213A30] border border-[#F5F1E6]/15 shadow-inner">
            {/* Speech Bubble Pointer Arrow */}
            <div className="hidden sm:block absolute top-6 -left-2.5 w-3 h-3 bg-[#213A30] border-l border-b border-[#F5F1E6]/15 transform rotate-45" />

            {/* Mascot Name Badge & Voice Button */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-hand font-bold text-base text-[#E8C468]">
                  {MASCOTS.find((m) => m.id === selectedMascot)?.name}
                </span>
                <span className="text-[10px] text-[#F5F1E6]/50">
                  says:
                </span>
              </div>

              {/* Speak Mascot Voice Button */}
              <button
                id="speakMascotBtn"
                onClick={speakMascotDialogue}
                className={`p-1.5 rounded-lg border transition-all ${
                  isSpeaking
                    ? 'bg-[#E8C468] text-[#121F19] border-[#E8C468] animate-pulse'
                    : 'bg-[#182821] text-[#F5F1E6]/80 border-[#F5F1E6]/10 hover:text-[#E8C468] hover:border-[#E8C468]/30'
                }`}
                title={isSpeaking ? 'Stop Mascot Voice' : 'Listen to Mascot Encouragement'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Spoken Encouragement Quote */}
            <p className="font-hand text-base text-[#F5F1E6] leading-snug">
              "{mascotSpeech}"
            </p>
          </div>

          {/* Reward Badge / Streak Tag */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 ${rewardBadge.color}`}>
              <span>{rewardBadge.icon}</span>
              <span>{rewardBadge.title}</span>
            </div>

            {/* Quick Celebrate Trigger */}
            <button
              id="mascotCheerBtn"
              onClick={() => {
                chalkAudio.playCelebrationFanfare();
                setShowConfetti(true);
                setBounceCount((c) => c + 1);
                setTimeout(() => setShowConfetti(false), 5000);
              }}
              className="px-2.5 py-1 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#E8C468] border border-[#E8C468]/30 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
              title="Cheer with Confetti!"
            >
              <PartyPopper className="w-3 h-3 text-[#E8C468]" />
              <span>Cheer!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
