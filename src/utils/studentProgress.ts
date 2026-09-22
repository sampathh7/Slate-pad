import { 
  StudentSessionDraft, 
  DailyProgressStats, 
  StudentMistakeRecord, 
  FeedbackResult,
  Stroke,
  ChildAgeBracket,
  BoardThemeId,
  AdaptiveQuestionItem,
  MistakeItem
} from '../types';

const STORAGE_KEYS = {
  ACTIVE_DRAFT: 'slate_active_session_draft',
  SAVED_SESSIONS: 'slate_saved_sessions_list',
  DAILY_STATS: 'slate_daily_progress_stats',
  MISTAKE_BANK: 'slate_student_mistake_bank',
};

// Format standard date key YYYY-MM-DD in local time
export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(timestamp: number): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recent';
  }
}

// ==========================================
// 1. ACTIVE SESSION DRAFT AUTO-PERSISTENCE
// ==========================================

export function saveActiveSessionDraft(draft: {
  strokes: Stroke[];
  topic: string;
  questions: string[];
  activeQuestion: string;
  adaptiveQuestions?: AdaptiveQuestionItem[];
  ageBracket: ChildAgeBracket;
  boardThemeId: BoardThemeId;
  activeColor: string;
  strokeWidth: number;
  feedback?: FeedbackResult | null;
  customName?: string;
}): StudentSessionDraft {
  const now = Date.now();
  const existing = getStoredActiveSessionDraft();
  const session: StudentSessionDraft = {
    id: existing?.id || `session-${now}`,
    name: draft.customName || existing?.name || `${draft.topic || 'Practice'} Slate`,
    timestamp: existing?.timestamp || now,
    updatedAt: now,
    dateFormatted: formatFriendlyDate(now),
    strokes: draft.strokes,
    topic: draft.topic,
    questions: draft.questions,
    activeQuestion: draft.activeQuestion,
    adaptiveQuestions: draft.adaptiveQuestions,
    ageBracket: draft.ageBracket,
    boardThemeId: draft.boardThemeId,
    activeColor: draft.activeColor,
    strokeWidth: draft.strokeWidth,
    feedback: draft.feedback,
  };
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(session));
  } catch (err) {
    console.warn('[studentProgress] Failed to save active session draft:', err);
  }
  return session;
}

export function getStoredActiveSessionDraft(): StudentSessionDraft | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('[studentProgress] Failed to read active session draft:', err);
  }
  return null;
}

export function clearActiveSessionDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_DRAFT);
  } catch (err) {
    console.warn('[studentProgress] Failed to clear active draft:', err);
  }
}

// ==========================================
// 2. NAMED SAVED SESSIONS (Checkpoints)
// ==========================================

export function getSavedSessionsList(): StudentSessionDraft[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_SESSIONS);
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.warn('[studentProgress] Failed to load saved sessions list:', err);
  }
  return [];
}

export function saveCheckpointSession(draft: {
  strokes: Stroke[];
  topic: string;
  questions: string[];
  activeQuestion: string;
  adaptiveQuestions?: AdaptiveQuestionItem[];
  ageBracket: ChildAgeBracket;
  boardThemeId: BoardThemeId;
  activeColor: string;
  strokeWidth: number;
  feedback?: FeedbackResult | null;
  name?: string;
  id?: string;
}): StudentSessionDraft {
  const now = Date.now();
  const session: StudentSessionDraft = {
    id: draft.id || `session-${now}-${Math.random().toString(36).slice(2, 6)}`,
    name: draft.name || `${draft.topic || 'Practice'} Slate`,
    timestamp: now,
    updatedAt: now,
    dateFormatted: formatFriendlyDate(now),
    strokes: draft.strokes,
    topic: draft.topic,
    questions: draft.questions,
    activeQuestion: draft.activeQuestion,
    adaptiveQuestions: draft.adaptiveQuestions,
    ageBracket: draft.ageBracket,
    boardThemeId: draft.boardThemeId,
    activeColor: draft.activeColor,
    strokeWidth: draft.strokeWidth,
    feedback: draft.feedback,
  };
  try {
    const current = getSavedSessionsList();
    const updated = [session, ...current.filter((s) => s.id !== session.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.SAVED_SESSIONS, JSON.stringify(updated));
  } catch (err) {
    console.warn('[studentProgress] Failed to save checkpoint session:', err);
  }
  return session;
}

export function deleteSavedSession(sessionId: string): StudentSessionDraft[] {
  try {
    const current = getSavedSessionsList();
    const updated = current.filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.SAVED_SESSIONS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('[studentProgress] Failed to delete session:', err);
    return [];
  }
}

// ==========================================
// 3. MULTI-DAY STREAK & DAILY STATS
// ==========================================

export function getDailyProgressStats(): DailyProgressStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[studentProgress] Failed to load daily stats:', err);
  }

  return {
    currentStreakDays: 1,
    lastActiveDayKey: getTodayDateKey(),
    totalDaysPracticed: 1,
    totalProblemsSolved: 0,
    totalErrorsRecorded: 0,
    totalErrorsFixed: 0,
    historyDates: [getTodayDateKey()],
  };
}

export function recordDailyActivity(options?: {
  problemSolved?: boolean;
  errorRecorded?: boolean;
  errorFixed?: boolean;
}): DailyProgressStats {
  const current = getDailyProgressStats();
  const today = getTodayDateKey();
  const lastKey = current.lastActiveDayKey;

  let newStreak = current.currentStreakDays;
  let newTotalDays = current.totalDaysPracticed;
  const historyDates = current.historyDates || [];

  if (lastKey !== today) {
    // Check if yesterday was active
    const todayDate = new Date();
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (lastKey === yesterdayKey) {
      newStreak += 1;
    } else {
      // Missed more than 1 day
      newStreak = 1;
    }

    if (!historyDates.includes(today)) {
      historyDates.push(today);
      newTotalDays += 1;
    }
  }

  const updated: DailyProgressStats = {
    currentStreakDays: Math.max(1, newStreak),
    lastActiveDayKey: today,
    totalDaysPracticed: Math.max(1, newTotalDays),
    totalProblemsSolved: current.totalProblemsSolved + (options?.problemSolved ? 1 : 0),
    totalErrorsRecorded: current.totalErrorsRecorded + (options?.errorRecorded ? 1 : 0),
    totalErrorsFixed: current.totalErrorsFixed + (options?.errorFixed ? 1 : 0),
    historyDates,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(updated));
  } catch (err) {
    console.warn('[studentProgress] Failed to save daily stats:', err);
  }

  return updated;
}

// ==========================================
// 4. MISTAKE BANK & ERROR REVISION NOTEBOOK
// ==========================================

export function getMistakeBankRecords(): StudentMistakeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISTAKE_BANK);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[studentProgress] Failed to read mistake bank:', err);
  }
  return [];
}

export function addMistakesToBank(params: {
  topic: string;
  question: string;
  mistakes: MistakeItem[];
  score: number;
  ageBracket: ChildAgeBracket;
  feedback?: FeedbackResult;
}): StudentMistakeRecord[] {
  if (!params.mistakes || params.mistakes.length === 0) return getMistakeBankRecords();

  const current = getMistakeBankRecords();
  const now = Date.now();

  const newRecords: StudentMistakeRecord[] = params.mistakes.map((m, idx) => ({
    id: `err-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    topic: params.topic || 'General Practice',
    question: params.question || 'Chalkboard problem',
    mistakeText: m.text_snippet || 'Incorrect step',
    issue: m.issue || 'Calculation or reasoning slip',
    correction: m.correction || 'Check steps',
    explanation: m.explanation || '',
    originalScore: params.score,
    status: 'pending_fix',
    recordedAt: now,
    correctSolution: params.feedback?.correct_solution,
    ageBracket: params.ageBracket,
  }));

  const combined = [...newRecords, ...current].slice(0, 100);
  try {
    localStorage.setItem(STORAGE_KEYS.MISTAKE_BANK, JSON.stringify(combined));
    recordDailyActivity({ errorRecorded: true });
  } catch (err) {
    console.warn('[studentProgress] Failed to save mistakes:', err);
  }

  return combined;
}

export function markMistakeAsFixed(
  errorId: string, 
  newScore: number = 100
): StudentMistakeRecord[] {
  const current = getMistakeBankRecords();
  const updated = current.map((item) => {
    if (item.id === errorId) {
      return {
        ...item,
        status: 'fixed_and_mastered' as const,
        fixedAt: Date.now(),
        fixedScore: newScore,
      };
    }
    return item;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.MISTAKE_BANK, JSON.stringify(updated));
    recordDailyActivity({ errorFixed: true });
  } catch (err) {
    console.warn('[studentProgress] Failed to mark error as fixed:', err);
  }

  return updated;
}

export function autoResolveMatchingMistakes(
  questionText: string, 
  topic: string, 
  passingScore: number
): StudentMistakeRecord[] {
  if (passingScore < 80) return getMistakeBankRecords();

  const current = getMistakeBankRecords();
  let resolvedCount = 0;

  const updated = current.map((item) => {
    const matchQuestion = item.question && questionText && item.question.trim().toLowerCase() === questionText.trim().toLowerCase();
    const matchTopic = item.topic && topic && item.topic.trim().toLowerCase() === topic.trim().toLowerCase();

    if (item.status === 'pending_fix' && (matchQuestion || matchTopic)) {
      resolvedCount++;
      return {
        ...item,
        status: 'fixed_and_mastered' as const,
        fixedAt: Date.now(),
        fixedScore: passingScore,
      };
    }
    return item;
  });

  if (resolvedCount > 0) {
    try {
      localStorage.setItem(STORAGE_KEYS.MISTAKE_BANK, JSON.stringify(updated));
      for (let i = 0; i < resolvedCount; i++) {
        recordDailyActivity({ errorFixed: true });
      }
    } catch (err) {
      console.warn('[studentProgress] Failed to auto-resolve mistakes:', err);
    }
  }

  return updated;
}

export function deleteMistakeRecord(errorId: string): StudentMistakeRecord[] {
  const current = getMistakeBankRecords();
  const updated = current.filter((item) => item.id !== errorId);
  try {
    localStorage.setItem(STORAGE_KEYS.MISTAKE_BANK, JSON.stringify(updated));
  } catch (err) {
    console.warn('[studentProgress] Failed to delete mistake:', err);
  }
  return updated;
}
