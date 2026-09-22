export type ChildAgeBracket = '6-7' | '8-9' | '10-12';

export interface ChildAgeConfig {
  id: ChildAgeBracket;
  label: string;
  sublabel: string;
  badge: string;
  icon: string;
  grades: string;
  color: string;
  bgClass: string;
  borderClass: string;
  description: string;
  defaultTopics: string[];
  defaultQuestions: Record<string, string[]>;
}

export interface StrokePoint {
  x: number;
  y: number;
  pressure?: number;
}

export type CanvasInteractionMode = 'pen' | 'erase' | 'pan';

export interface Stroke {
  id: string;
  type: 'pen' | 'erase';
  points: StrokePoint[];
  color: string;
  width: number;
}

export interface MistakeItem {
  text_snippet: string;
  issue: string;
  correction: string;
  explanation?: string;
}

export type StudentMasteryLevel = 'beginner' | 'developing' | 'proficient' | 'master';
export type TutorMode = 'auto_adaptive' | 'gentle_scaffolding' | 'standard_practice' | 'deep_challenge';
export type QuestionDifficulty = 'Foundational' | 'Standard' | 'Stretch' | 'Challenge';

export interface AdaptiveQuestionItem {
  id: string;
  question: string;
  difficulty: QuestionDifficulty;
  learningGoal?: string;
  scaffoldingHint?: string;
  adaptiveReason?: string;
}

export interface AdaptiveTutorInsights {
  student_level_assessed?: StudentMasteryLevel;
  mastery_growth?: string;
  scaffolding_advice?: string;
  next_difficulty_recommended?: string;
  tutor_note?: string;
  targeted_skills_to_reinforce?: string[];
}

export interface CorrectionStep {
  step_number: number;
  step_title: string;
  expression: string;
  explanation: string;
}

export interface CorrectSolution {
  final_correct_answer: string;
  step_by_step_process: CorrectionStep[];
  key_takeaway: string;
  chalkboard_summary?: string;
  pitfall_to_avoid?: string;
}

export interface FeedbackResult {
  overall_score: number;
  praise: string;
  mistakes: MistakeItem[];
  tips?: string[];
  transcribed_text?: string;
  topic?: string;
  question?: string;
  adaptive_insights?: AdaptiveTutorInsights;
  correct_solution?: CorrectSolution;
}

export interface FeedbackHistoryItem {
  id: string;
  topic: string;
  question?: string;
  score: number;
  date: number;
  mistakesCount: number;
  mistakes?: MistakeItem[];
  transcribed_text?: string;
  assessedLevel?: StudentMasteryLevel;
  difficulty?: QuestionDifficulty;
}

export interface AdaptiveStudentProfile {
  level: StudentMasteryLevel;
  levelTitle: string;
  overallMasteryScore: number;
  recentScoreAvg: number;
  recentTrend: 'improving' | 'steady' | 'needs_support';
  streakCount: number;
  totalDrillsCompleted: number;
  identifiedWeaknesses: string[];
  identifiedStrengths: string[];
  tutorRecommendation: string;
  suggestedDifficulty: QuestionDifficulty;
  scaffoldingLevel: number; // 1 (High/Gentle) to 4 (Challenging/Mastery)
  tutorMode: TutorMode;
  targetTopicMastery?: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface ChalkColorOption {
  id: string;
  name: string;
  hex: string;
  label: string;
}

export type BoardThemeId = 'forest' | 'slate' | 'black' | 'navy' | 'vintage' | 'eyesafe';

export type EyeCareFilterLevel = 'gentle' | 'balanced' | 'night' | 'custom';

export interface EyeCareSettings {
  enabled: boolean;
  warmthPercent: number; // 0 to 85% (warm amber blue-light block)
  filterLevel: EyeCareFilterLevel;
  softenChalkGlance: boolean; // softens stark white to soothing warm cream
  antiGlareMatte: boolean; // soothing matte surface
  breakReminder202020: boolean; // Optometrist 20-20-20 rule timer
  breakIntervalMinutes: number; // default 20
  lastBreakTime?: number;
}

export interface BoardThemeOption {
  id: BoardThemeId;
  name: string;
  description: string;
  preview: string;
  gradient: [string, string, string];
  dustAlpha: number;
  ruledLineColor: string;
  gridLineColor: string;
  gridMajorColor: string;
  marginColor: string;
  appBackground: string;
  panelBackground: string;
  accentColor: string;
}

export type DrawingImageStyle = 
  | 'realistic' 
  | 'illustration' 
  | 'watercolor' 
  | '3d-render' 
  | 'anime' 
  | 'chalk-masterpiece';

export interface GeneratedDrawingImage {
  id: string;
  imageUrl: string;
  originalCanvasSnapshot?: string;
  subject: string;
  detailedDescription: string;
  imagePrompt: string;
  style: DrawingImageStyle;
  educationalFact?: string;
  category?: string;
  timestamp: number;
}

export interface AutoDrawStroke {
  color: string;
  width: number;
  points: { x: number; y: number }[];
  label?: string;
  type?: 'pen' | 'erase';
}

export interface AutoDrawResult {
  title: string;
  description: string;
  category: string;
  strokes: AutoDrawStroke[];
  educationalInsight?: string;
  stepNotes?: string[];
}

export interface MathSolutionStep {
  stepNumber: number;
  title: string;
  mathExpression: string;
  explanation: string;
  tip?: string;
}

export interface MathProblemSolution {
  id: string;
  problem: string;
  domain: string;
  finalAnswer: string;
  summary: string;
  steps: MathSolutionStep[];
  keyFormulas?: string[];
  commonPitfalls?: string[];
  alternativeMethod?: {
    name: string;
    explanation: string;
    finalAnswer: string;
  };
  similarPracticeQuestion?: string;
  chalkboardStrokes?: AutoDrawStroke[];
  timestamp: number;
}

export type ExplanationStage = 'setup' | 'concept_diagram' | 'derivation' | 'verification';

export interface AnimatedExplanationStep {
  stepNumber: number;
  stage: ExplanationStage;
  title: string;
  mathExpression?: string;
  spokenNarration: string;
  chalkboardAnnotation?: string;
  keyRule?: string;
  strokes: AutoDrawStroke[];
}

export interface AnimatedProblemExplanation {
  id: string;
  problem: string;
  topic: string;
  domain: string;
  ageBracket: ChildAgeBracket;
  difficulty?: string;
  verifiedFinalAnswer: string;
  verificationProof: string;
  keyTheoremsUsed?: string[];
  commonTrapToAvoid?: string;
  steps: AnimatedExplanationStep[];
  allStrokes: AutoDrawStroke[];
  timestamp: number;
}

export type GradeLevel = 'elementary' | 'middle_school' | 'high_school' | 'college_advanced';
export type LearningFocusType = 'foundations' | 'step_by_step' | 'exam_prep' | 'word_problems' | 'challenge';

export interface LearningCurriculumSelection {
  subject: string;
  category: string;
  topic: string;
  customGoal?: string;
  gradeLevel: GradeLevel;
  focusType: LearningFocusType;
  questionCount: number;
}

export type HandwritingCategory = 'math_equation' | 'text_notes' | 'spelling_words' | 'mixed' | 'diagram_sketch';
export type RecognitionMode = 'all' | 'math' | 'text' | 'shapes';

export interface HandwritingMathFormula {
  expression: string;
  latex?: string;
  calculatedResult?: string;
  explanation?: string;
  isCorrect?: boolean;
}

export interface HandwritingSpellingIssue {
  original: string;
  suggested: string;
  ruleOrContext?: string;
}

export interface DetectedElementItem {
  type: 'word' | 'number' | 'equation' | 'symbol' | 'shape';
  content: string;
  confidence?: number;
}

export interface HandwritingIdentificationResult {
  id: string;
  transcription: string;
  formattedText: string;
  category: HandwritingCategory;
  confidenceScore: number; // 0 - 100
  legibilityScore: number; // 0 - 100
  legibilitySummary: string;
  mathFormulas: HandwritingMathFormula[];
  detectedElements: DetectedElementItem[];
  spellingGrammarIssues: HandwritingSpellingIssue[];
  recognizedShapes?: string[];
  tipsForPenmanship: string[];
  chalkboardStrokes?: AutoDrawStroke[];
  timestamp: number;
}

export type WritingAnimationEffect = 'chalk_dust' | 'sparkles' | 'neon_glow' | 'rainbow_stars' | 'none';

// Student Multi-Day Progress & Saved Practice Sessions
export interface StudentSessionDraft {
  id: string;
  name: string;
  timestamp: number;
  updatedAt: number;
  dateFormatted: string;
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
}

export interface DailyProgressStats {
  currentStreakDays: number;
  lastActiveDayKey: string; // "YYYY-MM-DD"
  totalDaysPracticed: number;
  totalProblemsSolved: number;
  totalErrorsRecorded: number;
  totalErrorsFixed: number;
  historyDates: string[];
}

// Mistake Bank & Error Revision Records
export interface StudentMistakeRecord {
  id: string;
  topic: string;
  question: string;
  mistakeText: string;
  issue: string;
  correction: string;
  explanation?: string;
  originalScore: number;
  status: 'pending_fix' | 'fixed_and_mastered';
  recordedAt: number;
  fixedAt?: number;
  fixedScore?: number;
  correctSolution?: CorrectSolution;
  ageBracket: ChildAgeBracket;
}

// Accurate Student Clarification Engine
export interface StudentClarificationStep {
  stepNumber: number;
  title: string;
  explanation: string;
  example?: string;
  chalkFormula?: string;
}

export interface ClarifyQuickCheck {
  question: string;
  options?: string[];
  correctAnswer: string;
  hint: string;
}

export interface StudentClarificationResult {
  id: string;
  query: string;
  topic: string;
  activeQuestion?: string;
  directClarification: string;
  stepByStepBreakdown: StudentClarificationStep[];
  visualAnalogy: string;
  keyRuleToRemember: string;
  commonPitfall?: string;
  quickCheck?: ClarifyQuickCheck;
  chalkboardStrokes?: AutoDrawStroke[];
  ageBracket: ChildAgeBracket;
  timestamp: number;
}

