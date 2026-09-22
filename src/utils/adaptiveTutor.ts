import { 
  FeedbackHistoryItem, 
  AdaptiveStudentProfile, 
  StudentMasteryLevel, 
  TutorMode, 
  QuestionDifficulty,
  MistakeItem
} from '../types';

const TUTOR_MODE_KEY = 'slate_adaptive_tutor_mode';

export function getStoredTutorMode(): TutorMode {
  try {
    const saved = localStorage.getItem(TUTOR_MODE_KEY);
    if (saved && ['auto_adaptive', 'gentle_scaffolding', 'standard_practice', 'deep_challenge'].includes(saved)) {
      return saved as TutorMode;
    }
  } catch {
    // ignore
  }
  return 'auto_adaptive';
}

export function saveTutorMode(mode: TutorMode) {
  try {
    localStorage.setItem(TUTOR_MODE_KEY, mode);
  } catch {
    // ignore
  }
}

export function getLevelBadgeInfo(level: StudentMasteryLevel) {
  switch (level) {
    case 'beginner':
      return {
        title: 'Foundational Explorer',
        shortTitle: 'Foundational',
        color: '#E2725B',
        bg: 'bg-[#E2725B]/15 border-[#E2725B]/30 text-[#E2725B]',
        glow: 'shadow-[0_0_12px_rgba(226,114,91,0.25)]',
        desc: 'Focusing on core concepts, structured step-by-step guidance, and confidence building.',
      };
    case 'developing':
      return {
        title: 'Developing Scholar',
        shortTitle: 'Developing',
        color: '#E8C468',
        bg: 'bg-[#E8C468]/15 border-[#E8C468]/30 text-[#E8C468]',
        glow: 'shadow-[0_0_12px_rgba(232,196,104,0.25)]',
        desc: 'Strengthening application, reducing calculation slips, and tackling standard problems.',
      };
    case 'proficient':
      return {
        title: 'Proficient Master',
        shortTitle: 'Proficient',
        color: '#8FBF8A',
        bg: 'bg-[#8FBF8A]/15 border-[#8FBF8A]/30 text-[#8FBF8A]',
        glow: 'shadow-[0_0_12px_rgba(143,191,138,0.25)]',
        desc: 'High conceptual accuracy, solving complex multi-step problems with fluid reasoning.',
      };
    case 'master':
      return {
        title: 'Grandmaster Scholar',
        shortTitle: 'Mastery',
        color: '#81D4FA',
        bg: 'bg-[#81D4FA]/15 border-[#81D4FA]/30 text-[#81D4FA]',
        glow: 'shadow-[0_0_12px_rgba(129,212,250,0.3)]',
        desc: 'Advanced problem solver ready for olympiad twists, theoretical proofs, and creative puzzles.',
      };
  }
}

export function getDifficultyBadgeColor(difficulty: QuestionDifficulty | string) {
  switch (difficulty) {
    case 'Foundational':
      return {
        text: 'text-[#81D4FA]',
        bg: 'bg-[#81D4FA]/15',
        border: 'border-[#81D4FA]/30',
        label: 'Step 1 • Foundational',
      };
    case 'Standard':
      return {
        text: 'text-[#8FBF8A]',
        bg: 'bg-[#8FBF8A]/15',
        border: 'border-[#8FBF8A]/30',
        label: 'Step 2 • Standard Drill',
      };
    case 'Stretch':
      return {
        text: 'text-[#E8C468]',
        bg: 'bg-[#E8C468]/15',
        border: 'border-[#E8C468]/30',
        label: 'Step 3 • Stretch Problem',
      };
    case 'Challenge':
    default:
      return {
        text: 'text-[#FF8A80]',
        bg: 'bg-[#FF8A80]/15',
        border: 'border-[#FF8A80]/30',
        label: 'Step 4 • Master Challenge',
      };
  }
}

export function computeStudentProfile(
  history: FeedbackHistoryItem[],
  currentTopic?: string,
  forcedMode?: TutorMode
): AdaptiveStudentProfile {
  const tutorMode = forcedMode || getStoredTutorMode();

  if (!history || history.length === 0) {
    // Default initial profile for new student
    return {
      level: 'developing',
      levelTitle: 'Developing Scholar',
      overallMasteryScore: 75,
      recentScoreAvg: 75,
      recentTrend: 'steady',
      streakCount: 0,
      totalDrillsCompleted: 0,
      identifiedWeaknesses: ['Awaiting initial chalkboard practice attempt'],
      identifiedStrengths: ['Ready to begin chalkboard drills'],
      tutorRecommendation: 'Start with introductory questions to establish baseline mastery.',
      suggestedDifficulty: 'Standard',
      scaffoldingLevel: 2,
      tutorMode,
    };
  }

  // 1. Calculate overall and weighted recent scores
  const total = history.length;
  const recentItems = history.slice(-5); // Last 5 items
  const recentTotal = recentItems.length;

  const rawAverage = history.reduce((sum, h) => sum + h.score, 0) / total;

  // Weighted recent score: more recent items get higher weight (1, 1.2, 1.4, 1.6, 1.8)
  let weightedSum = 0;
  let weightSum = 0;
  recentItems.forEach((item, idx) => {
    const weight = 1 + idx * 0.25;
    weightedSum += item.score * weight;
    weightSum += weight;
  });
  const recentScoreAvg = Math.round(weightedSum / weightSum);
  const overallMasteryScore = Math.round(rawAverage * 0.4 + recentScoreAvg * 0.6);

  // 2. Trend analysis (compare first half of recent with second half)
  let recentTrend: 'improving' | 'steady' | 'needs_support' = 'steady';
  if (recentItems.length >= 3) {
    const olderScores = recentItems.slice(0, Math.floor(recentItems.length / 2));
    const newerScores = recentItems.slice(Math.floor(recentItems.length / 2));
    const olderAvg = olderScores.reduce((s, i) => s + i.score, 0) / olderScores.length;
    const newerAvg = newerScores.reduce((s, i) => s + i.score, 0) / newerScores.length;

    if (newerAvg - olderAvg >= 8) {
      recentTrend = 'improving';
    } else if (olderAvg - newerAvg >= 10) {
      recentTrend = 'needs_support';
    }
  }

  // 3. Streak of high performance (>=80%)
  let streakCount = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].score >= 80) {
      streakCount++;
    } else {
      break;
    }
  }

  // 4. Extract recurring mistake patterns
  const mistakeFrequency: Record<string, number> = {};
  const allMistakes: MistakeItem[] = [];
  history.forEach((h) => {
    if (h.mistakes && Array.isArray(h.mistakes)) {
      h.mistakes.forEach((m) => {
        allMistakes.push(m);
        const issue = (m.issue || '').toLowerCase();
        if (issue.includes('sign') || issue.includes('negative') || issue.includes('positive')) {
          mistakeFrequency['Sign / Arithmetic Rules'] = (mistakeFrequency['Sign / Arithmetic Rules'] || 0) + 1;
        } else if (issue.includes('formula') || issue.includes('equation') || issue.includes('theorem')) {
          mistakeFrequency['Formula Structure'] = (mistakeFrequency['Formula Structure'] || 0) + 1;
        } else if (issue.includes('spelling') || issue.includes('grammar') || issue.includes('conjugat') || issue.includes('tense')) {
          mistakeFrequency['Grammar / Spelling Accuracy'] = (mistakeFrequency['Grammar / Spelling Accuracy'] || 0) + 1;
        } else if (issue.includes('unit') || issue.includes('dimension') || issue.includes('conversion')) {
          mistakeFrequency['Units & Conversions'] = (mistakeFrequency['Units & Conversions'] || 0) + 1;
        } else if (issue.includes('step') || issue.includes('order') || issue.includes('simplif')) {
          mistakeFrequency['Step Simplification Order'] = (mistakeFrequency['Step Simplification Order'] || 0) + 1;
        } else {
          mistakeFrequency['Conceptual Application'] = (mistakeFrequency['Conceptual Application'] || 0) + 1;
        }
      });
    }
  });

  const identifiedWeaknesses = Object.entries(mistakeFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, count]) => `${category} (${count} recent ${count === 1 ? 'correction' : 'corrections'})`);

  if (identifiedWeaknesses.length === 0) {
    identifiedWeaknesses.push('No critical misconceptions identified — high accuracy!');
  }

  // 5. Strengths
  const identifiedStrengths: string[] = [];
  const highScoringTopics = history.filter((h) => h.score >= 85).map((h) => h.topic);
  const uniqueTopics = Array.from(new Set(highScoringTopics)).slice(0, 3);
  if (uniqueTopics.length > 0) {
    identifiedStrengths.push(`Strong mastery in ${uniqueTopics.join(', ')}`);
  }
  if (streakCount >= 2) {
    identifiedStrengths.push(`Active high-accuracy streak: ${streakCount} consecutive drills`);
  }
  if (overallMasteryScore >= 85) {
    identifiedStrengths.push('Clean step-by-step chalkboard derivations');
  }
  if (identifiedStrengths.length === 0) {
    identifiedStrengths.push('Consistent effort and willingness to practice');
  }

  // 6. Determine Level & Scaffolding
  let level: StudentMasteryLevel = 'developing';
  let suggestedDifficulty: QuestionDifficulty = 'Standard';
  let scaffoldingLevel = 2;

  // Custom mode overrides or Auto-Adaptive
  if (tutorMode === 'gentle_scaffolding') {
    level = 'beginner';
    suggestedDifficulty = 'Foundational';
    scaffoldingLevel = 1;
  } else if (tutorMode === 'deep_challenge') {
    level = 'master';
    suggestedDifficulty = 'Challenge';
    scaffoldingLevel = 4;
  } else if (tutorMode === 'standard_practice') {
    level = 'developing';
    suggestedDifficulty = 'Standard';
    scaffoldingLevel = 2;
  } else {
    // Auto-Adaptive based on empirical mastery scores
    if (overallMasteryScore < 60 || (recentScoreAvg < 60 && recentTrend === 'needs_support')) {
      level = 'beginner';
      suggestedDifficulty = 'Foundational';
      scaffoldingLevel = 1;
    } else if (overallMasteryScore >= 92 && streakCount >= 2) {
      level = 'master';
      suggestedDifficulty = 'Challenge';
      scaffoldingLevel = 4;
    } else if (overallMasteryScore >= 80 || (recentScoreAvg >= 85 && recentTrend === 'improving')) {
      level = 'proficient';
      suggestedDifficulty = 'Stretch';
      scaffoldingLevel = 3;
    } else {
      level = 'developing';
      suggestedDifficulty = 'Standard';
      scaffoldingLevel = 2;
    }
  }

  const badge = getLevelBadgeInfo(level);

  // 7. Tutor Recommendation
  let tutorRecommendation = '';
  if (level === 'beginner') {
    tutorRecommendation = 'AI is offering gentle scaffolding: shorter equations, intuitive integer numbers, and clear step-by-step guidance.';
  } else if (level === 'developing') {
    tutorRecommendation = 'AI is providing balanced standard drills to reinforce core rules and eliminate sign/calculation slips.';
  } else if (level === 'proficient') {
    tutorRecommendation = 'AI is advancing drill difficulty with multi-step reasoning, real-world context, and subtle edge cases.';
  } else {
    tutorRecommendation = 'AI is presenting Olympiad-tier challenges, theoretical proofs, and multi-variable explorations for mastery.';
  }

  return {
    level,
    levelTitle: badge.title,
    overallMasteryScore,
    recentScoreAvg,
    recentTrend,
    streakCount,
    totalDrillsCompleted: total,
    identifiedWeaknesses,
    identifiedStrengths,
    tutorRecommendation,
    suggestedDifficulty,
    scaffoldingLevel,
    tutorMode,
  };
}
