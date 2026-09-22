import React, { useState, useEffect, useRef, useMemo } from 'react';
import ChalkCanvas, { CHALK_COLORS } from './components/ChalkCanvas';
import FeedbackPanel from './components/FeedbackPanel';
import HeaderToolbar from './components/HeaderToolbar';
import LiveVoiceTutor from './components/LiveVoiceTutor';
import ColorSettingsModal from './components/ColorSettingsModal';
import AutoDrawModal from './components/AutoDrawModal';
import MascotBuddy from './components/MascotBuddy';
import AdaptiveTutorModal from './components/AdaptiveTutorModal';
import MathSolverModal from './components/MathSolverModal';
import CurriculumGoalModal from './components/CurriculumGoalModal';
import EyeCareModal from './components/EyeCareModal';
import EyeBreakModal from './components/EyeBreakModal';
import HandwritingIdentifierModal from './components/HandwritingIdentifierModal';
import SavedSessionsModal from './components/SavedSessionsModal';
import MistakeBankModal from './components/MistakeBankModal';
import AskClarifyModal from './components/AskClarifyModal';
import AnimatedExplanationPlayer from './components/AnimatedExplanationPlayer';
import AnimatedExplanationModal from './components/AnimatedExplanationModal';
import { StepExplanationItem } from './components/ChalkboardStepExplainerCard';
import { generatePerfectChalkboardSolution } from './utils/chalkStrokeFont';
import { 
  Stroke, 
  FeedbackResult, 
  FeedbackHistoryItem, 
  BoardThemeOption, 
  AutoDrawResult,
  AutoDrawStroke,
  AdaptiveStudentProfile,
  AdaptiveQuestionItem,
  TutorMode,
  ChildAgeBracket,
  EyeCareSettings,
  HandwritingIdentificationResult,
  RecognitionMode,
  StudentSessionDraft,
  DailyProgressStats,
  StudentMistakeRecord,
  MistakeItem,
  AnimatedProblemExplanation,
  AnimatedExplanationStep,
  CanvasInteractionMode
} from './types';
import { 
  AnimatedExplanationRunner, 
  AnimatedExplanationPlayerState 
} from './utils/animatedExplanationRunner';
import { 
  saveActiveSessionDraft, 
  getStoredActiveSessionDraft, 
  getSavedSessionsList, 
  saveCheckpointSession, 
  deleteSavedSession, 
  getDailyProgressStats, 
  recordDailyActivity, 
  getMistakeBankRecords, 
  addMistakesToBank, 
  markMistakeAsFixed, 
  autoResolveMatchingMistakes, 
  deleteMistakeRecord 
} from './utils/studentProgress';
import { AiDrawingRunner, AiDrawingState } from './utils/aiDrawingRunner';
import { 
  computeStudentProfile, 
  getStoredTutorMode, 
  saveTutorMode 
} from './utils/adaptiveTutor';
import { 
  CHILD_AGE_CONFIGS, 
  getStoredAgeBracket, 
  saveAgeBracket 
} from './utils/agePresets';
import { 
  getStoredBoardTheme, 
  saveBoardTheme, 
  getStoredChalkColor, 
  saveChalkColor,
  BOARD_THEMES 
} from './utils/themes';
import { 
  getStoredEyeCareSettings, 
  saveEyeCareSettings, 
  getEyeCareOverlayColor 
} from './utils/eyeCare';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [mode, setMode] = useState<CanvasInteractionMode>('pen');
  const [boardTheme, setBoardTheme] = useState<BoardThemeOption>(() => getStoredBoardTheme());
  const [activeColor, setActiveColorState] = useState<string>(() => getStoredChalkColor());
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isColorSettingsOpen, setIsColorSettingsOpen] = useState(false);

  // Child Eye-Care Shield (Warmth filter, 20-20-20 break reminders, softened chalk)
  const [eyeCareSettings, setEyeCareSettings] = useState<EyeCareSettings>(() => getStoredEyeCareSettings());
  const [isEyeCareModalOpen, setIsEyeCareModalOpen] = useState(false);
  const [isEyeBreakModalOpen, setIsEyeBreakModalOpen] = useState(false);

  // Child Age Bracket (Ages 6-12)
  const [ageBracket, setAgeBracketState] = useState<ChildAgeBracket>(() => getStoredAgeBracket());

  // AI Auto-Draw & Autonomous Drawing State
  const [isAutoDrawOpen, setIsAutoDrawOpen] = useState(false);
  const [autoDrawInitialPrompt, setAutoDrawInitialPrompt] = useState<string>('');
  const [aiDrawingState, setAiDrawingState] = useState<AiDrawingState | undefined>(undefined);
  const [aiDrawingSpeed, setAiDrawingSpeed] = useState<number>(2.5);
  const [isAiProcessingCommand, setIsAiProcessingCommand] = useState(false);
  const aiDrawingRunnerRef = useRef<AiDrawingRunner>(new AiDrawingRunner());

  // Adaptive Learning Tutor State
  const [isAdaptiveTutorOpen, setIsAdaptiveTutorOpen] = useState(false);
  const [tutorMode, setTutorModeState] = useState<TutorMode>(() => getStoredTutorMode());
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<AdaptiveQuestionItem[]>([]);

  // AI Math Solver & Curriculum Goal Modals
  const [isMathSolverOpen, setIsMathSolverOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [mathSolverInitialProblem, setMathSolverInitialProblem] = useState<string>('');

  // Handwriting Identifier OCR & Penmanship State
  const [isHandwritingModalOpen, setIsHandwritingModalOpen] = useState(false);
  const [handwritingResult, setHandwritingResult] = useState<HandwritingIdentificationResult | null>(null);
  const [isScanningHandwriting, setIsScanningHandwriting] = useState(false);
  const [handwritingSnapshotUrl, setHandwritingSnapshotUrl] = useState<string | null>(null);

  // Multi-day Saved Sessions & Continuous Progress Drafts
  const [isSavedSessionsOpen, setIsSavedSessionsOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<StudentSessionDraft[]>(() => getSavedSessionsList());
  const [activeDraft, setActiveDraft] = useState<StudentSessionDraft | null>(() => getStoredActiveSessionDraft());

  // Error Notebook & Correction State
  const [isMistakeBankOpen, setIsMistakeBankOpen] = useState(false);
  const [mistakeBank, setMistakeBank] = useState<StudentMistakeRecord[]>(() => getMistakeBankRecords());

  // Ask Professor Chalk Accurate Clarification Desk
  const [isAskClarifyOpen, setIsAskClarifyOpen] = useState(false);
  const [clarifyInitialQuery, setClarifyInitialQuery] = useState<string>('');
  const [clarifyInitialMistake, setClarifyInitialMistake] = useState<StudentMistakeRecord | MistakeItem | null>(null);

  // Daily Streak & Activity Tracking
  const [dailyStats, setDailyStats] = useState<DailyProgressStats>(() => getDailyProgressStats());

  // AI Animated Blackboard Explanation (100% pedagogical and mathematical accuracy)
  const [isAnimatedExplanationModalOpen, setIsAnimatedExplanationModalOpen] = useState(false);
  const [isGeneratingAnimatedExplanation, setIsGeneratingAnimatedExplanation] = useState(false);
  const [animatedExplanationState, setAnimatedExplanationState] = useState<AnimatedExplanationPlayerState | null>(null);
  const [animatedProblemPrompt, setAnimatedProblemPrompt] = useState<string>('');
  const animatedExplanationRunnerRef = useRef<AnimatedExplanationRunner>(new AnimatedExplanationRunner());

  // On-Chalkboard Step-by-Step Perfection Explainer Card
  const [chalkboardExplainer, setChalkboardExplainer] = useState<{
    problem: string;
    domain?: string;
    finalAnswer?: string;
    steps: StepExplanationItem[];
    activeStepIndex: number;
  } | null>(null);

  // 20-20-20 Eye Break Reminder Timer
  useEffect(() => {
    if (!eyeCareSettings.enabled || !eyeCareSettings.breakReminder202020) return;
    const intervalMs = (eyeCareSettings.breakIntervalMinutes || 20) * 60 * 1000;
    const timer = setInterval(() => {
      setIsEyeBreakModalOpen(true);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [eyeCareSettings.enabled, eyeCareSettings.breakReminder202020, eyeCareSettings.breakIntervalMinutes]);

  const handleUpdateEyeCareSettings = (updated: EyeCareSettings) => {
    setEyeCareSettings(updated);
    saveEyeCareSettings(updated);
    if (updated.enabled) {
      showToast(`Eye-Care Shield active (${updated.warmthPercent}% Warmth) 🛡️`, 'info', 2500);
    } else {
      showToast('Eye-Care Shield turned OFF', 'info', 2000);
    }
  };

  // Practice score history state persisted in localStorage
  const [history, setHistory] = useState<FeedbackHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('slate_practice_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Calculate live dynamic student profile from history logs & active tutor mode
  const studentProfile: AdaptiveStudentProfile = useMemo(() => {
    return computeStudentProfile(history, tutorMode);
  }, [history, tutorMode]);

  const handleTutorModeChange = (newMode: TutorMode) => {
    setTutorModeState(newMode);
    saveTutorMode(newMode);
    showToast(`AI Tutor style set to: ${newMode.replace('_', ' ')}`, 'info', 2500);
  };

  // Setup AI drawing runner callbacks
  useEffect(() => {
    const runner = aiDrawingRunnerRef.current;
    runner.setCallbacks(
      (state) => {
        setAiDrawingState({ ...state });
      },
      (updatedStrokes) => {
        setStrokes(updatedStrokes);
      },
      (result) => {
        showToast(`AI finished drawing: "${result.title}"`, 'success', 3500);
      }
    );

    // Initialize Animated Blackboard Explanation Runner
    const animRunner = animatedExplanationRunnerRef.current;
    animRunner.init({
      onStateChange: (state) => {
        setAnimatedExplanationState({ ...state });
      },
      onStrokesUpdate: (updatedStrokes) => {
        setStrokes(updatedStrokes);
      },
    });
  }, []);

  const handleOpenAnimatedExplanationModal = (problemToAnimate?: string) => {
    setAnimatedProblemPrompt(problemToAnimate || activeQuestion || '');
    setIsAnimatedExplanationModalOpen(true);
  };

  const handleStartAnimatedExplanation = async (problemText: string, customAge?: ChildAgeBracket) => {
    try {
      setIsGeneratingAnimatedExplanation(true);
      showToast('Synthesizing 100% verified chalkboard animation… 📐', 'info', 4000);

      let snapshotBase64: string | undefined = undefined;
      if (getCanvasSnapshotRef.current) {
        const snap = getCanvasSnapshotRef.current();
        if (snap) snapshotBase64 = snap;
      }

      const response = await fetch('/api/animate-problem-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: problemText,
          topic,
          studentProfile,
          ageBracket: customAge || ageBracket,
          imageBase64: snapshotBase64,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate explanation');
      }

      const data: AnimatedProblemExplanation = await response.json();

      animatedExplanationRunnerRef.current.start(data, {
        canvasWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
        canvasHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
        speed: 1.2,
        speechEnabled: true,
      });

      showToast(`🎬 Professor Chalk is animating: "${data.problem}"`, 'success', 4000);
    } catch (error: any) {
      console.error('Error starting animated explanation:', error);
      showToast(error.message || 'Could not generate chalkboard animation', 'error', 4500);
    } finally {
      setIsGeneratingAnimatedExplanation(false);
    }
  };

  const handleOpenAutoDraw = (initialPrompt?: string) => {
    setAutoDrawInitialPrompt(initialPrompt || '');
    setIsAutoDrawOpen(true);
  };

  const handleOpenMathSolver = (initialProblem?: string) => {
    setMathSolverInitialProblem(initialProblem || activeQuestion || '');
    setIsMathSolverOpen(true);
  };

  const handleOpenHandwritingIdentifier = (customMode: RecognitionMode = 'all') => {
    const snapshot = getCanvasSnapshotRef.current ? getCanvasSnapshotRef.current() : null;
    setHandwritingSnapshotUrl(snapshot);
    setIsHandwritingModalOpen(true);
    if (snapshot && strokes.length > 0) {
      handleScanHandwriting(customMode, snapshot);
    }
  };

  const handleScanHandwriting = async (mode: RecognitionMode = 'all', overrideSnapshot?: string) => {
    const snapshot = overrideSnapshot || (getCanvasSnapshotRef.current ? getCanvasSnapshotRef.current() : null);
    if (!snapshot) {
      showToast('Please write something on the chalkboard to identify.', 'info', 3000);
      return;
    }
    setHandwritingSnapshotUrl(snapshot);
    setIsScanningHandwriting(true);
    try {
      const res = await fetch('/api/identify-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: snapshot,
          mode,
          ageBracket,
          customHint: activeQuestion || topic,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to identify handwriting');
      }

      const data: HandwritingIdentificationResult = await res.json();
      setHandwritingResult(data);
      showToast(`Identified handwriting (${data.legibilityScore}% clarity)! ✨`, 'success', 3500);
    } catch (error: any) {
      console.error('Error scanning handwriting:', error);
      showToast(error.message || 'Could not scan handwriting. Try again.', 'error');
    } finally {
      setIsScanningHandwriting(false);
    }
  };

  const handleNeatenHandwritingOnSlate = (strokes: AutoDrawStroke[]) => {
    if (!strokes || strokes.length === 0) return;
    const neatResult: AutoDrawResult = {
      title: 'Neat Handwriting',
      description: 'Aligned chalk handwriting',
      category: 'Penmanship',
      educationalInsight: 'Neat stroke formation makes ideas easy to read and understand!',
      stepNotes: ['Guide lines', 'Forming letters & symbols', 'Completed transcription'],
      strokes,
    };
    handleStartAutoDraw(neatResult, {
      animated: true,
      speed: 2,
      clearBoard: true,
    });
    showToast('Neatening handwriting on the slate! ✨✍️', 'success', 3500);
  };

  const handleSolveHandwrittenMath = (mathExpression: string) => {
    handleOpenMathSolver(mathExpression);
  };

  const handleApplyCurriculum = (
    topicTitle: string, 
    overview: string, 
    newAdaptiveQuestions: AdaptiveQuestionItem[],
    keyConcepts?: string[]
  ) => {
    setTopic(topicTitle);
    const questionTexts = newAdaptiveQuestions.map((q) => q.question);
    setQuestions(questionTexts);
    setAdaptiveQuestions(newAdaptiveQuestions);
    if (questionTexts.length > 0) {
      setActiveQuestion(questionTexts[0]);
    }
    showToast(`📚 Loaded custom curriculum: "${topicTitle}" (${newAdaptiveQuestions.length} drills)`, 'success', 3500);
  };

  const handleAutoDrawSolution = (autoDrawResult: AutoDrawResult) => {
    handleStartAutoDraw(autoDrawResult, {
      animated: true,
      speed: 1.5,
      clearBoard: true,
    });

    if (autoDrawResult.stepNotes && autoDrawResult.stepNotes.length > 0) {
      const explainerSteps: StepExplanationItem[] = autoDrawResult.stepNotes.map((note, idx) => {
        const stepNumMatch = note.match(/Step\s*(\d+)/i);
        const stepNum = stepNumMatch ? parseInt(stepNumMatch[1], 10) : idx + 1;
        const parts = note.replace(/^Step\s*\d+:\s*/i, '').split('(');
        const title = parts[0]?.trim() || `Step ${stepNum}`;
        const expr = parts.length > 1 ? parts[1].replace(/\)$/, '').trim() : undefined;
        return {
          stepNumber: stepNum,
          title,
          expression: expr,
          explanation: note,
          stage: (idx === 0 ? 'setup' : idx === autoDrawResult.stepNotes!.length - 1 ? 'verification' : 'derivation') as any,
        };
      });

      setChalkboardExplainer({
        problem: autoDrawResult.title.replace(/^Solution:\s*/, ''),
        domain: autoDrawResult.category || topic || 'Mathematics',
        finalAnswer: autoDrawResult.educationalInsight?.replace(/^Final (Verified )?Answer:\s*/i, ''),
        steps: explainerSteps,
        activeStepIndex: 0,
      });
    }

    showToast('AI is drawing mathematical solution on the slate! ✍️', 'success', 3500);
  };

  const handleDrawCorrectProcessOnSlate = async (currentFeedback: FeedbackResult) => {
    if (!currentFeedback) return;
    showToast('AI is synthesizing chalkboard strokes for the step-by-step solution… ✍️', 'info', 3000);
    try {
      const problemText = currentFeedback.question || activeQuestion || topic || "Mathematics Problem";
      const finalAns = currentFeedback.correct_solution?.final_correct_answer || 
        (currentFeedback.mistakes && currentFeedback.mistakes.length > 0 ? currentFeedback.mistakes[0].correction : 'Verified Solution');
      
      const rawSteps = currentFeedback.correct_solution?.step_by_step_process || [];
      
      let formattedSteps: StepExplanationItem[] = rawSteps.map((s, idx) => ({
        stepNumber: s.step_number || idx + 1,
        title: s.step_title || `Step ${idx + 1}`,
        expression: s.expression || '',
        explanation: s.explanation || 'Apply inverse operation and simplify.',
        stage: (idx === 0 ? 'setup' : idx === rawSteps.length - 1 ? 'verification' : 'derivation') as any,
        intuitionRule: currentFeedback.correct_solution?.key_takeaway || 'Balance both sides of the equation.',
      }));

      if (formattedSteps.length === 0 && currentFeedback.mistakes && currentFeedback.mistakes.length > 0) {
        formattedSteps = currentFeedback.mistakes.map((m, idx) => ({
          stepNumber: idx + 1,
          title: m.issue || `Correction Step ${idx + 1}`,
          expression: m.correction || '',
          explanation: m.explanation || `Correct: ${m.correction}`,
          stage: 'derivation' as any,
          intuitionRule: 'Carefully check every sign and operation.',
        }));
      }

      if (formattedSteps.length === 0) {
        formattedSteps = [
          {
            stepNumber: 1,
            title: 'Identify Given & Strategy',
            expression: problemText,
            explanation: 'Break down problem into clear steps.',
            stage: 'setup',
          },
          {
            stepNumber: 2,
            title: 'Compute Verified Answer',
            expression: finalAns,
            explanation: 'Work with precision to obtain final answer.',
            stage: 'verification',
          },
        ];
      }

      // Generate accurate chalk strokes with vector chalk font
      const solutionResult = generatePerfectChalkboardSolution({
        problem: problemText,
        domain: topic || 'Mathematics',
        finalAnswer: finalAns,
        steps: formattedSteps,
      });

      const drawResult: AutoDrawResult = {
        title: `Solution: ${problemText.slice(0, 30)}`,
        description: `Step-by-step chalk solution for ${problemText}`,
        category: topic || 'Mathematics',
        educationalInsight: `Final Answer: ${finalAns}`,
        stepNotes: formattedSteps.map(s => `Step ${s.stepNumber}: ${s.title} (${s.expression || ''})`),
        strokes: solutionResult.allStrokes,
      };

      handleStartAutoDraw(drawResult, {
        animated: true,
        speed: Math.max(2.5, aiDrawingSpeed),
        clearBoard: true,
      });

      // Show interactive Step Explainer Card right on the chalkboard!
      setChalkboardExplainer({
        problem: problemText,
        domain: topic || 'Mathematics',
        finalAnswer: finalAns,
        steps: formattedSteps,
        activeStepIndex: 0,
      });

      showToast('AI is chalking the step-by-step solution on the slate! ✍️', 'success', 3500);
    } catch (error: any) {
      console.error('Error drawing solution on slate:', error);
      showToast(error.message || 'Could not draw solution on board.', 'error');
    }
  };

  const handleReplayExplainerStep = (stepIndex: number) => {
    if (!chalkboardExplainer) return;
    const currentStep = chalkboardExplainer.steps[stepIndex];
    if (!currentStep) return;

    const singleStepResult = generatePerfectChalkboardSolution({
      problem: chalkboardExplainer.problem,
      domain: chalkboardExplainer.domain,
      finalAnswer: chalkboardExplainer.finalAnswer,
      steps: [currentStep],
    });

    handleStartAutoDraw({
      title: `Step ${currentStep.stepNumber}: ${currentStep.title}`,
      description: currentStep.explanation,
      category: chalkboardExplainer.domain || 'Mathematics',
      educationalInsight: currentStep.intuitionRule || currentStep.explanation,
      stepNotes: [currentStep.explanation],
      strokes: singleStepResult.allStrokes,
    }, {
      animated: true,
      speed: Math.max(2.5, aiDrawingSpeed),
      clearBoard: false,
    });
  };

  const handleStampQuestionToSlate = async (questionText: string) => {
    if (!questionText) return;
    showToast('Chalking question onto chalkboard canvas… ✍️', 'info', 2500);
    try {
      const res = await fetch('/api/auto-draw-slate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Draw this math/science question at the top of the slate in neat chalk handwriting with a decorative chalk box: "${questionText}"`,
          topic,
          question: questionText,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate chalk strokes');
      }

      const drawResult: AutoDrawResult = await res.json();
      handleStartAutoDraw(drawResult, {
        animated: true,
        speed: 2.0,
        clearBoard: false,
      });
      showToast('Question chalked onto chalkboard canvas! 📝', 'success', 3000);
    } catch (error: any) {
      console.error('Error drawing question on slate:', error);
      showToast(error.message || 'Could not chalk question on board.', 'error');
    }
  };

  // AI Autonomous Voice & Order Execution (Speaks and writes by orders given by student)
  const handleExecuteStudentCommand = async (commandText: string) => {
    if (!commandText) return;
    setIsAiProcessingCommand(true);
    showToast(`Professor Chalk is processing: "${commandText}"… 🎙️`, 'info', 3000);

    try {
      const snapshot = getCanvasSnapshotRef.current ? getCanvasSnapshotRef.current() : null;
      const res = await fetch('/api/student-voice-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: commandText,
          topic,
          activeQuestion,
          imageBase64: snapshot || undefined,
          ageBracket,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to process student command');
      }

      const data = await res.json();

      // 1. AI Automatically SPEAKS out loud to the student!
      if (data.spokenResponse && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.spokenResponse);
        utterance.rate = 0.95;
        utterance.pitch = 1.08; // Friendly warm teacher tone
        window.speechSynthesis.speak(utterance);
      }

      // 2. Update Question / Topic if new question was requested or created
      if (data.questionText) {
        setActiveQuestion(data.questionText);
        setQuestions((prev) => (prev.includes(data.questionText) ? prev : [data.questionText, ...prev]));
      }
      if (data.topic && data.topic !== topic) {
        setTopic(data.topic);
      }

      // 3. AI Automatically WRITES / DRAWS on the chalkboard canvas!
      if (data.strokes && data.strokes.length > 0) {
        const drawResult: AutoDrawResult = {
          title: data.title || commandText,
          description: data.spokenResponse || `Drawn for: ${commandText}`,
          category: data.actionType || 'General',
          educationalInsight: data.educationalInsight,
          stepNotes: data.stepNotes,
          strokes: data.strokes,
        };

        handleStartAutoDraw(drawResult, {
          animated: true,
          speed: Math.max(2.5, aiDrawingSpeed),
          clearBoard: Boolean(data.clearBoardFirst),
        });
      }

      showToast(`Professor Chalk: ${data.spokenResponse?.slice(0, 60) || 'Order complete!'}… ✍️`, 'success', 4000);
    } catch (error: any) {
      console.error('Error executing student voice order:', error);
      showToast(error.message || 'Could not execute order.', 'error');
    } finally {
      setIsAiProcessingCommand(false);
    }
  };

  const handleStartAutoDraw = (
    result: AutoDrawResult, 
    options: { animated: boolean; speed: number; clearBoard: boolean }
  ) => {
    const canvasWidth = window.innerWidth > 0 ? window.innerWidth : 1200;
    const canvasHeight = window.innerHeight > 0 ? window.innerHeight : 800;

    aiDrawingRunnerRef.current.startDrawing(result, {
      ...options,
      canvasWidth,
      canvasHeight,
      existingStrokes: strokes,
    });
  };

  const setActiveColor = (color: string) => {
    setActiveColorState(color);
    saveChalkColor(color);
  };

  const handleSelectBoardTheme = (theme: BoardThemeOption) => {
    setBoardTheme(theme);
    saveBoardTheme(theme.id);
    showToast(`Chalkboard theme changed to ${theme.name}`, 'info', 2000);
  };

  const [topic, setTopic] = useState<string>('Pizza Fractions');
  const [questions, setQuestions] = useState<string[]>([
    'Draw a pizza divided into 4 equal slices and shade 3/4.',
    'If you have 8 slices and eat 3, what fraction is left on the chalkboard?',
    'Show that 2/4 is equal to 1/2 using a chalk diagram.'
  ]);
  const [activeQuestion, setActiveQuestion] = useState<string>('Draw a pizza divided into 4 equal slices and shade 3/4.');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);

  const getCanvasSnapshotRef = useRef<(() => string | null) | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);

  const showToast = (text: string, type: 'info' | 'error' | 'success' = 'info', duration = 3500) => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, duration);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('slate_practice_history');
    } catch {
      // ignore
    }
    showToast('Progress history reset.', 'info');
  };

  // Initial restoration of saved active draft if available
  const hasRestoredInitialDraftRef = useRef(false);
  useEffect(() => {
    if (hasRestoredInitialDraftRef.current) return;
    hasRestoredInitialDraftRef.current = true;

    // Check if active session draft exists from previous visit
    const storedDraft = getStoredActiveSessionDraft();
    if (storedDraft && storedDraft.strokes && storedDraft.strokes.length > 0) {
      setStrokes(storedDraft.strokes);
      if (storedDraft.topic) setTopic(storedDraft.topic);
      if (storedDraft.questions && storedDraft.questions.length > 0) setQuestions(storedDraft.questions);
      if (storedDraft.activeQuestion) setActiveQuestion(storedDraft.activeQuestion);
      if (storedDraft.adaptiveQuestions && storedDraft.adaptiveQuestions.length > 0) setAdaptiveQuestions(storedDraft.adaptiveQuestions);
      if (storedDraft.feedback) setFeedback(storedDraft.feedback);
      if (storedDraft.ageBracket) setAgeBracketState(storedDraft.ageBracket);
      if (storedDraft.boardThemeId) {
        const themeObj = BOARD_THEMES.find((t) => t.id === storedDraft.boardThemeId);
        if (themeObj) setBoardTheme(themeObj);
      }
      if (storedDraft.activeColor) setActiveColorState(storedDraft.activeColor);
      if (storedDraft.strokeWidth) setStrokeWidth(storedDraft.strokeWidth);
      showToast(`Welcome back! Resumed your "${storedDraft.name}" session 📋`, 'info', 4000);
    }

    // Refresh daily stats on load (streak calculation)
    const currentStats = recordDailyActivity();
    setDailyStats(currentStats);
  }, []);

  // Debounced auto-save of current active session draft
  useEffect(() => {
    if (strokes.length === 0 && !feedback) return;
    const timer = setTimeout(() => {
      const draft = saveActiveSessionDraft({
        strokes,
        topic,
        questions,
        activeQuestion,
        adaptiveQuestions,
        ageBracket,
        boardThemeId: boardTheme.id,
        activeColor,
        strokeWidth,
        feedback,
      });
      setActiveDraft(draft);
    }, 700);
    return () => clearTimeout(timer);
  }, [strokes, topic, questions, activeQuestion, adaptiveQuestions, ageBracket, boardTheme.id, activeColor, strokeWidth, feedback]);

  const handleResumeSession = (draft: StudentSessionDraft) => {
    setStrokes(draft.strokes || []);
    if (draft.topic) setTopic(draft.topic);
    if (draft.questions && draft.questions.length > 0) setQuestions(draft.questions);
    if (draft.activeQuestion) setActiveQuestion(draft.activeQuestion);
    if (draft.adaptiveQuestions && draft.adaptiveQuestions.length > 0) setAdaptiveQuestions(draft.adaptiveQuestions);
    if (draft.ageBracket) setAgeBracketState(draft.ageBracket);
    if (draft.boardThemeId) {
      const themeObj = BOARD_THEMES.find((t) => t.id === draft.boardThemeId);
      if (themeObj) setBoardTheme(themeObj);
    }
    if (draft.activeColor) setActiveColorState(draft.activeColor);
    if (draft.strokeWidth) setStrokeWidth(draft.strokeWidth);
    setFeedback(draft.feedback || null);
    setIsSavedSessionsOpen(false);
    showToast(`Resumed "${draft.name}" with ${draft.strokes.length} chalk strokes! ✨`, 'success', 3500);
  };

  const handleSaveCurrentCheckpoint = (customName?: string) => {
    const draft = saveCheckpointSession({
      name: customName || `${topic} Practice`,
      strokes,
      topic,
      questions,
      activeQuestion,
      adaptiveQuestions,
      ageBracket,
      boardThemeId: boardTheme.id,
      activeColor,
      strokeWidth,
      feedback,
    });
    setSavedSessions(getSavedSessionsList());
    showToast(`Checkpoint "${draft.name}" saved! You can resume any day. 💾`, 'success', 3500);
  };

  const handleDeleteSavedSession = (sessionId: string) => {
    const updated = deleteSavedSession(sessionId);
    setSavedSessions(updated);
    showToast('Saved session removed.', 'info', 2000);
  };

  const handleFixMistakeOnSlate = (mistake: StudentMistakeRecord) => {
    setTopic(mistake.topic);
    setActiveQuestion(mistake.question);
    if (!questions.includes(mistake.question)) {
      setQuestions((prev) => [mistake.question, ...prev]);
    }
    setIsMistakeBankOpen(false);
    showToast(`🎯 Error Correction Mode: "${mistake.mistakeText}" — Solve it correctly on the slate!`, 'info', 4500);
  };

  const handleClarifyMistake = (mistake: StudentMistakeRecord | MistakeItem) => {
    setClarifyInitialMistake(mistake);
    const snippet = 'mistakeText' in mistake ? mistake.mistakeText : mistake.text_snippet;
    const topicStr = 'topic' in mistake ? mistake.topic : topic;
    setClarifyInitialQuery(`Why was "${snippet}" marked as an error in ${topicStr}, and what is the exact rule?`);
    setIsAskClarifyOpen(true);
  };

  const handleDrawClarificationOnSlate = (drawResult: AutoDrawResult) => {
    setIsAskClarifyOpen(false);
    handleStartAutoDraw(drawResult, {
      animated: true,
      speed: 1.5,
      clearBoard: false,
    });
    showToast(`Professor Chalk is drawing clarification on the blackboard! ✍️`, 'success', 3500);
  };

  const handleMarkMistakeFixed = (errorId: string) => {
    const updated = markMistakeAsFixed(errorId);
    setMistakeBank(updated);
    showToast('Mistake marked as fixed & mastered! 🌟', 'success', 2500);
  };

  const handleDeleteMistake = (errorId: string) => {
    const updated = deleteMistakeRecord(errorId);
    setMistakeBank(updated);
    showToast('Mistake record removed.', 'info', 2000);
  };

  // Generate drill questions adapted to the student's mastery profile & age bracket
  const handleGenerateQuestions = async (targetTopic?: string) => {
    const practiceTopic = (targetTopic || topic).trim();
    if (!practiceTopic || isGeneratingQuestions) return;

    setIsGeneratingQuestions(true);
    showToast(
      `AI Tutor tailoring drills for ${studentProfile.levelTitle} (${studentProfile.suggestedDifficulty})…`, 
      'info', 
      3000
    );

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: practiceTopic,
          studentProfile,
          ageBracket,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate questions');
      }

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        if (data.adaptiveQuestions && Array.isArray(data.adaptiveQuestions)) {
          setAdaptiveQuestions(data.adaptiveQuestions);
        } else {
          setAdaptiveQuestions(
            data.questions.map((q: string, idx: number) => ({
              id: `q-${idx}`,
              question: q,
              difficulty: studentProfile.suggestedDifficulty,
            }))
          );
        }
        setActiveQuestion(data.questions[0]);
        showToast(`🎯 Loaded ${data.questions.length} chalk questions!`, 'success', 3500);
      } else {
        showToast('No questions returned. Try another topic.', 'error');
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Error generating questions.', 'error');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Submit canvas image for vision review with adaptive learning context
  const handleSubmitWork = async (canvasImageBase64: string) => {
    if (strokes.length === 0) {
      showToast('Please write your solution on the chalkboard first.', 'info');
      return;
    }

    setIsChecking(true);
    showToast('AI Tutor inspecting your handwriting & analyzing mastery…', 'info', 4000);

    try {
      const res = await fetch('/api/check-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: canvasImageBase64,
          topic: topic.trim(),
          question: activeQuestion,
          studentProfile,
          ageBracket,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to analyze handwriting.');
      }

      const result: FeedbackResult = await res.json();
      setFeedback(result);
      setIsFeedbackOpen(true);

      // Record to history for progress tracking
      const newHistoryItem: FeedbackHistoryItem = {
        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        topic: topic.trim() || 'General Practice',
        question: activeQuestion || undefined,
        score: result.overall_score,
        date: Date.now(),
        mistakesCount: (result.mistakes || []).length,
      };

      setHistory((prev) => {
        const updated = [...prev, newHistoryItem];
        try {
          localStorage.setItem('slate_practice_history', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      // 1. Record mistakes to student's error revision notebook
      if (result.mistakes && result.mistakes.length > 0) {
        const updatedMistakes = addMistakesToBank({
          topic: topic.trim(),
          question: activeQuestion,
          mistakes: result.mistakes,
          score: result.overall_score,
          ageBracket,
          feedback: result,
        });
        setMistakeBank(updatedMistakes);
      }

      // 2. Auto-resolve any previous pending mistakes if student mastered the drill
      if (result.overall_score >= 80) {
        const resolved = autoResolveMatchingMistakes(activeQuestion, topic.trim(), result.overall_score);
        setMistakeBank(resolved);
      }

      // 3. Record daily activity progress, solve counts & multi-day streak
      const updatedStats = recordDailyActivity({
        problemSolved: result.overall_score >= 70,
        errorRecorded: (result.mistakes || []).length > 0,
      });
      setDailyStats(updatedStats);

      if (result.mistakes.length === 0) {
        showToast(`Flawless! Scored ${result.overall_score}/100 🎯`, 'success');
      } else {
        showToast(`Feedback ready: ${result.mistakes.length} error(s) identified with tutor guidance.`, 'info');
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to check work. Check API configuration.', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSelectAgeBracket = (newAge: ChildAgeBracket) => {
    setAgeBracketState(newAge);
    saveAgeBracket(newAge);
    const cfg = CHILD_AGE_CONFIGS[newAge];
    const firstTopic = cfg.defaultTopics[0];
    const firstQuestions = cfg.defaultQuestions[firstTopic] || [];
    setTopic(firstTopic);
    setQuestions(firstQuestions);
    if (firstQuestions.length > 0) {
      setActiveQuestion(firstQuestions[0]);
    }
    setAdaptiveQuestions(
      firstQuestions.map((q, idx) => ({
        id: `age-q-${idx}`,
        question: q,
        difficulty: idx === 0 ? 'Foundational' : idx === 1 ? 'Standard' : 'Stretch',
        learningGoal: `Master ${firstTopic} for ${cfg.label}`,
      }))
    );
    showToast(`Switched to ${cfg.label} (${cfg.grades})! 🎯`, 'success', 3000);
  };

  const handleSelectSampleTopic = (sampleTopic: string, sampleQuestion: string) => {
    setTopic(sampleTopic);
    setQuestions([sampleQuestion]);
    setAdaptiveQuestions([{
      id: 'sample-1',
      question: sampleQuestion,
      difficulty: studentProfile.suggestedDifficulty,
      learningGoal: `Practice key concepts in ${sampleTopic}`,
      scaffoldingHint: 'Start by writing out the given values and formula clearly on the chalkboard.',
    }]);
    setActiveQuestion(sampleQuestion);
    showToast(`Loaded drill: "${sampleTopic}"`, 'success', 2500);
  };

  const handleNextQuestion = () => {
    // Clear feedback and reset canvas strokes for a clean slate
    setFeedback(null);
    setIsFeedbackOpen(false);
    setStrokes([]);

    // Find next question in current list
    const currentIndex = questions.findIndex((q) => q === activeQuestion);
    if (currentIndex >= 0 && currentIndex < questions.length - 1) {
      const nextQ = questions[currentIndex + 1];
      setActiveQuestion(nextQ);
      showToast(`🌟 Question ${currentIndex + 2} of ${questions.length}: Ready to draw!`, 'info', 2500);
    } else {
      // Rotate to next fun topic or generate new drills
      const cfg = CHILD_AGE_CONFIGS[ageBracket];
      const availableTopics = cfg.defaultTopics;
      const currentIdx = availableTopics.indexOf(topic);
      const nextTopicIndex = (currentIdx + 1) % availableTopics.length;
      const nextTopic = availableTopics[nextTopicIndex] || availableTopics[0];
      const nextQuestions = cfg.defaultQuestions[nextTopic] || [];

      if (nextQuestions.length > 0) {
        setTopic(nextTopic);
        setQuestions(nextQuestions);
        setActiveQuestion(nextQuestions[0]);
        setAdaptiveQuestions(
          nextQuestions.map((q, idx) => ({
            id: `age-q-${idx}`,
            question: q,
            difficulty: idx === 0 ? 'Foundational' : idx === 1 ? 'Standard' : 'Stretch',
            learningGoal: `Master ${nextTopic} for ${cfg.label}`,
          }))
        );
        showToast(`🎉 Great job! Moving to ${nextTopic}! ⭐`, 'success', 3000);
      } else {
        handleGenerateQuestions();
      }
    }
  };

  return (
    <div 
      className="flex flex-col h-screen w-screen text-[#F5F1E6] overflow-hidden font-sans transition-colors duration-300"
      style={{ backgroundColor: boardTheme.appBackground }}
    >
      {/* Top Header Bar */}
      <HeaderToolbar
        topic={topic}
        setTopic={setTopic}
        questions={questions}
        adaptiveQuestions={adaptiveQuestions}
        activeQuestion={activeQuestion}
        setActiveQuestion={setActiveQuestion}
        onGenerateQuestions={() => handleGenerateQuestions()}
        isGeneratingQuestions={isGeneratingQuestions}
        isFeedbackOpen={isFeedbackOpen}
        setIsFeedbackOpen={setIsFeedbackOpen}
        hasFeedback={Boolean(feedback)}
        history={history}
        onClearHistory={handleClearHistory}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        onOpenColorSettings={() => setIsColorSettingsOpen(true)}
        onOpenAutoDraw={() => handleOpenAutoDraw()}
        onOpenMathSolver={() => handleOpenMathSolver()}
        onOpenCurriculumGoal={() => setIsCurriculumModalOpen(true)}
        boardTheme={boardTheme}
        studentProfile={studentProfile}
        onOpenAdaptiveTutor={() => setIsAdaptiveTutorOpen(true)}
        onSelectSampleTopic={handleSelectSampleTopic}
        ageBracket={ageBracket}
        onSelectAgeBracket={handleSelectAgeBracket}
        onStampQuestionToSlate={handleStampQuestionToSlate}
        eyeCareSettings={eyeCareSettings}
        onOpenEyeCareModal={() => setIsEyeCareModalOpen(true)}
        onToggleEyeCare={() => handleUpdateEyeCareSettings({ ...eyeCareSettings, enabled: !eyeCareSettings.enabled })}
        onOpenHandwritingIdentifier={() => handleOpenHandwritingIdentifier()}
        onOpenSavedSessions={() => setIsSavedSessionsOpen(true)}
        onOpenMistakeBank={() => setIsMistakeBankOpen(true)}
        onOpenAskClarify={() => {
          setClarifyInitialQuery('');
          setClarifyInitialMistake(null);
          setIsAskClarifyOpen(true);
        }}
        onOpenAnimatedExplanation={handleOpenAnimatedExplanationModal}
        pendingMistakesCount={mistakeBank.filter((m) => m.status === 'pending_fix').length}
        dailyStats={dailyStats}
        onNextQuestion={handleNextQuestion}
      />

      {/* Main Board & Feedback Panel */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Chalkboard Drawing Workspace */}
        <ChalkCanvas
          strokes={strokes}
          setStrokes={setStrokes}
          onSubmitWork={handleSubmitWork}
          isChecking={isChecking}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          mode={mode}
          setMode={setMode}
          boardTheme={boardTheme}
          topic={topic}
          activeQuestion={activeQuestion}
          questions={questions}
          adaptiveQuestions={adaptiveQuestions}
          setActiveQuestion={setActiveQuestion}
          feedback={feedback}
          onClearFeedback={() => setFeedback(null)}
          onDrawCorrectProcessOnSlate={handleDrawCorrectProcessOnSlate}
          onStampQuestionToSlate={handleStampQuestionToSlate}
          onOpenCurriculumGoal={() => setIsCurriculumModalOpen(true)}
          onGenerateQuestions={() => handleGenerateQuestions()}
          isGeneratingQuestions={isGeneratingQuestions}
          onOpenColorSettings={() => setIsColorSettingsOpen(true)}
          onOpenAutoDraw={() => handleOpenAutoDraw()}
          onExecuteStudentCommand={handleExecuteStudentCommand}
          isAiProcessingCommand={isAiProcessingCommand}
          aiDrawingState={aiDrawingState}
          aiDrawingSpeed={aiDrawingSpeed}
          onSetAiDrawingSpeed={(spd) => {
            setAiDrawingSpeed(spd);
            aiDrawingRunnerRef.current.setSpeed(spd);
          }}
          onPauseAiDrawing={() => aiDrawingRunnerRef.current.pause()}
          onResumeAiDrawing={() => aiDrawingRunnerRef.current.resume()}
          onSkipAiDrawing={() => aiDrawingRunnerRef.current.skipToEnd()}
          onCancelAiDrawing={() => {
            aiDrawingRunnerRef.current.cancel();
            setAiDrawingState(undefined);
          }}
          getCanvasSnapshotRef={getCanvasSnapshotRef}
          onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
          onSelectSampleDrill={handleSelectSampleTopic}
          ageBracket={ageBracket}
          eyeCareSettings={eyeCareSettings}
          onOpenEyeCareModal={() => setIsEyeCareModalOpen(true)}
          onOpenHandwritingIdentifier={() => handleOpenHandwritingIdentifier()}
          onOpenAnimatedExplanation={handleOpenAnimatedExplanationModal}
          chalkboardExplainer={chalkboardExplainer}
          onChangeExplainerStepIndex={(idx) => setChalkboardExplainer((prev) => prev ? { ...prev, activeStepIndex: idx } : null)}
          onCloseExplainer={() => setChalkboardExplainer(null)}
          onReplayExplainerStep={handleReplayExplainerStep}
          onReopenExplainer={() => {
            if (chalkboardExplainer) return;
            if (feedback?.correct_solution) {
              handleDrawCorrectProcessOnSlate(feedback);
            }
          }}
          onNextQuestion={handleNextQuestion}
        />

        {/* Feedback Side Panel */}
        <FeedbackPanel
          feedback={feedback}
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          topic={topic}
          activeQuestion={activeQuestion}
          onOpenAutoDraw={(prompt) => handleOpenAutoDraw(prompt)}
          onDrawCorrectProcessOnSlate={handleDrawCorrectProcessOnSlate}
          onClarifyMistake={handleClarifyMistake}
          onOpenMistakeBank={() => setIsMistakeBankOpen(true)}
          onOpenAnimatedExplanation={handleOpenAnimatedExplanationModal}
          onNextQuestion={handleNextQuestion}
        />

        {/* Real-time Voice Tutor Live Session Modal */}
        <LiveVoiceTutor
          isOpen={isLiveVoiceOpen}
          onClose={() => setIsLiveVoiceOpen(false)}
          getCanvasImage={() => (getCanvasSnapshotRef.current ? getCanvasSnapshotRef.current() : null)}
          topic={topic}
          question={activeQuestion}
          onOpenAutoDraw={(prompt) => handleOpenAutoDraw(prompt)}
        />

        {/* Board & Chalk Color Settings Modal */}
        <ColorSettingsModal
          isOpen={isColorSettingsOpen}
          onClose={() => setIsColorSettingsOpen(false)}
          currentBoardTheme={boardTheme}
          onSelectBoardTheme={handleSelectBoardTheme}
          activeChalkColor={activeColor}
          onSelectChalkColor={setActiveColor}
        />

        {/* Child Eye-Care Shield Settings Modal */}
        <EyeCareModal
          isOpen={isEyeCareModalOpen}
          onClose={() => setIsEyeCareModalOpen(false)}
          settings={eyeCareSettings}
          onUpdateSettings={handleUpdateEyeCareSettings}
          onTriggerEyeBreak={() => {
            setIsEyeCareModalOpen(false);
            setIsEyeBreakModalOpen(true);
          }}
        />

        {/* 20-20-20 Eye Break Exercise Modal */}
        <EyeBreakModal
          isOpen={isEyeBreakModalOpen}
          onClose={() => setIsEyeBreakModalOpen(false)}
        />

        {/* AI Auto-Draw on Slate Modal */}
        <AutoDrawModal
          isOpen={isAutoDrawOpen}
          onClose={() => setIsAutoDrawOpen(false)}
          onStartDrawing={handleStartAutoDraw}
          topic={topic}
          question={activeQuestion}
          initialPrompt={autoDrawInitialPrompt}
          hasExistingStrokes={strokes.length > 0}
        />

        {/* Adaptive AI Tutor Diagnostic Center Modal */}
        <AdaptiveTutorModal
          isOpen={isAdaptiveTutorOpen}
          onClose={() => setIsAdaptiveTutorOpen(false)}
          studentProfile={studentProfile}
          history={history}
          topic={topic}
          onChangeTutorMode={handleTutorModeChange}
          onGenerateAdaptiveQuestions={() => {
            setIsAdaptiveTutorOpen(false);
            handleGenerateQuestions();
          }}
          onClearHistory={handleClearHistory}
        />

        {/* AI Math Problem Solver Modal */}
        <MathSolverModal
          isOpen={isMathSolverOpen}
          onClose={() => setIsMathSolverOpen(false)}
          onAutoDrawSolution={handleAutoDrawSolution}
          onSetPracticeQuestion={(newTopic, question) => {
            setTopic(newTopic);
            setQuestions([question]);
            setAdaptiveQuestions([{
              id: `pq-${Date.now()}`,
              question,
              difficulty: 'Standard',
              learningGoal: `Master concepts related to ${newTopic}`,
              scaffoldingHint: 'Recall the formulas and step-by-step techniques reviewed in the solver.',
            }]);
            setActiveQuestion(question);
            showToast(`Loaded practice problem for ${newTopic}! 🎯`, 'success', 3000);
          }}
          activeQuestion={activeQuestion}
          topic={topic}
          getCanvasSnapshot={() => (getCanvasSnapshotRef.current ? getCanvasSnapshotRef.current() : null)}
          studentProfile={studentProfile}
          initialProblem={mathSolverInitialProblem}
        />

        {/* What Do You Want to Learn? Curriculum & Topic Explorer Modal */}
        <CurriculumGoalModal
          isOpen={isCurriculumModalOpen}
          onClose={() => setIsCurriculumModalOpen(false)}
          onApplyCurriculum={handleApplyCurriculum}
          studentProfile={studentProfile}
          currentTopic={topic}
        />

        {/* Floating Cartoon Mascot Companion on Chalkboard */}
        <MascotBuddy
          score={feedback?.overall_score}
          praise={feedback?.praise}
          topic={topic}
          question={activeQuestion}
          hasFeedback={Boolean(feedback)}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />

        {/* Global Floating Toast Banner */}
        {toastMessage && (
          <div
            id="statusBanner"
            className={`absolute left-1/2 -translate-x-1/2 bottom-6 z-40 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium shadow-2xl flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              toastMessage.type === 'error'
                ? 'bg-[#E2725B] text-[#182821] border-[#E2725B]'
                : toastMessage.type === 'success'
                ? 'bg-[#8FBF8A] text-[#182821] border-[#8FBF8A]'
                : 'bg-[#213A30] text-[#F5F1E6] border-[#F5F1E6]/20'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#E8C468] shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* AI Handwriting Identifier OCR & Penmanship Modal */}
        <HandwritingIdentifierModal
          isOpen={isHandwritingModalOpen}
          onClose={() => setIsHandwritingModalOpen(false)}
          result={handwritingResult}
          isScanning={isScanningHandwriting}
          canvasSnapshotUrl={handwritingSnapshotUrl}
          onRescan={(mode) => handleScanHandwriting(mode)}
          onNeatenOnSlate={handleNeatenHandwritingOnSlate}
          onSolveMathProblem={handleSolveHandwrittenMath}
          ageBracket={ageBracket}
        />

        {/* Multi-day Saved Sessions & Work Resumption Modal */}
        <SavedSessionsModal
          isOpen={isSavedSessionsOpen}
          onClose={() => setIsSavedSessionsOpen(false)}
          activeDraft={activeDraft}
          savedSessions={savedSessions}
          dailyStats={dailyStats}
          onResumeSession={handleResumeSession}
          onSaveCurrentCheckpoint={handleSaveCurrentCheckpoint}
          onDeleteSession={handleDeleteSavedSession}
          currentTopic={topic}
          currentQuestion={activeQuestion}
          strokesCount={strokes.length}
        />

        {/* Mistake Bank & Error Correction Notebook Modal */}
        <MistakeBankModal
          isOpen={isMistakeBankOpen}
          onClose={() => setIsMistakeBankOpen(false)}
          mistakes={mistakeBank}
          onFixOnSlate={handleFixMistakeOnSlate}
          onClarifyMistake={(m) => handleClarifyMistake(m)}
          onAnimateSolution={handleStartAnimatedExplanation}
          onMarkFixed={handleMarkMistakeFixed}
          onDeleteMistake={handleDeleteMistake}
        />

        {/* Student Clarification Desk & Concept Deep-Dive Modal */}
        <AskClarifyModal
          isOpen={isAskClarifyOpen}
          onClose={() => setIsAskClarifyOpen(false)}
          topic={topic}
          activeQuestion={activeQuestion}
          studentProfile={studentProfile}
          ageBracket={ageBracket}
          initialQuery={clarifyInitialQuery}
          initialMistake={clarifyInitialMistake}
          onDrawClarificationOnSlate={handleDrawClarificationOnSlate}
        />

        {/* AI Animated Problem Explanation Launcher Modal */}
        <AnimatedExplanationModal
          isOpen={isAnimatedExplanationModalOpen}
          onClose={() => setIsAnimatedExplanationModalOpen(false)}
          activeQuestion={animatedProblemPrompt || activeQuestion}
          topic={topic}
          ageBracket={ageBracket}
          onSelectAgeBracket={handleSelectAgeBracket}
          mistakes={mistakeBank.map((m) => ({ id: m.id, question: m.question, mistakeSnippet: m.mistakeSnippet }))}
          onStartAnimatedExplanation={handleStartAnimatedExplanation}
          isLoading={isGeneratingAnimatedExplanation}
        />

        {/* AI Animated Problem Explanation Overlay Deck */}
        {animatedExplanationState?.isActive && (
          <AnimatedExplanationPlayer
            playerState={animatedExplanationState}
            onPlay={() => animatedExplanationRunnerRef.current.resume()}
            onPause={() => animatedExplanationRunnerRef.current.pause()}
            onReplay={() => animatedExplanationRunnerRef.current.replay()}
            onNextStep={() => animatedExplanationRunnerRef.current.nextStep()}
            onPrevStep={() => animatedExplanationRunnerRef.current.prevStep()}
            onJumpToStep={(stepIdx) => animatedExplanationRunnerRef.current.jumpToStep(stepIdx)}
            onSkipToEnd={() => animatedExplanationRunnerRef.current.skipToEnd()}
            onSetSpeed={(speed) => animatedExplanationRunnerRef.current.setSpeed(speed)}
            onToggleSpeech={() => animatedExplanationRunnerRef.current.toggleSpeech()}
            onClose={() => {
              animatedExplanationRunnerRef.current.cancel();
              setAnimatedExplanationState(null);
            }}
            onAskClarificationAboutStep={(step, problem) => {
              setClarifyInitialQuery(`Can you explain why in "${problem}", the step "${step.title}" works? (${step.spokenNarration})`);
              setIsAskClarifyOpen(true);
            }}
          />
        )}

        {/* Child Eye-Care Blue-Light Ambient Protection Shield */}
        {eyeCareSettings.enabled && (
          <div
            id="childEyeCareAmbientOverlay"
            className="fixed inset-0 pointer-events-none z-30 transition-all duration-500"
            style={{
              backgroundColor: getEyeCareOverlayColor(eyeCareSettings.warmthPercent),
              mixBlendMode: 'multiply',
            }}
          />
        )}
      </main>
    </div>
  );
}
