import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stroke, StrokePoint, ChalkColorOption, BoardThemeOption, FeedbackResult, AdaptiveQuestionItem, ChildAgeBracket, EyeCareSettings, WritingAnimationEffect, CanvasInteractionMode } from '../types';
import { AiDrawingState } from '../utils/aiDrawingRunner';
import { getEyeSafeChalkColor, getEyeCareOverlayColor } from '../utils/eyeCare';
import { WritingEffectsEngine, WRITING_EFFECT_OPTIONS, getStoredWritingEffect, saveWritingEffect } from '../utils/writingEffects';
import SlateCorrectionBoard from './SlateCorrectionBoard';
import StudentAiOrderBar from './StudentAiOrderBar';
import { 
  Pen, 
  Eraser, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Download, 
  Sparkles, 
  Grid, 
  Volume2, 
  VolumeX, 
  Pencil, 
  Pause, 
  Play, 
  FastForward, 
  XCircle, 
  CheckCircle2,
  Sliders,
  Mic,
  MessageSquare,
  ShieldCheck,
  ScanLine,
  Wand2,
  Wind,
  Zap,
  Check,
  Lightbulb,
  BookOpen,
  Hand,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  ArrowUp,
  MoreHorizontal
} from 'lucide-react';
import ChalkboardStepExplainerCard, { StepExplanationItem } from './ChalkboardStepExplainerCard';
import { chalkAudio } from '../utils/chalkAudio';
import { BOARD_THEMES, CHALK_COLORS } from '../utils/themes';

export { CHALK_COLORS };

interface ChalkCanvasProps {
  strokes: Stroke[];
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
  onSubmitWork: (canvasImageBase64: string) => void;
  isChecking: boolean;
  activeColor: string;
  setActiveColor: (hex: string) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  mode: CanvasInteractionMode;
  setMode: (m: CanvasInteractionMode) => void;
  boardTheme?: BoardThemeOption;
  topic?: string;
  activeQuestion?: string;
  questions?: string[];
  adaptiveQuestions?: AdaptiveQuestionItem[];
  setActiveQuestion?: (q: string) => void;
  feedback?: FeedbackResult | null;
  onClearFeedback?: () => void;
  onDrawCorrectProcessOnSlate?: (feedback: FeedbackResult) => void;
  onStampQuestionToSlate?: (questionText: string) => void;
  onOpenCurriculumGoal?: () => void;
  onGenerateQuestions?: () => void;
  isGeneratingQuestions?: boolean;
  onOpenColorSettings?: () => void;
  onOpenAutoDraw?: () => void;
  onExecuteStudentCommand?: (commandText: string) => Promise<void>;
  isAiProcessingCommand?: boolean;
  aiDrawingState?: AiDrawingState;
  onPauseAiDrawing?: () => void;
  onResumeAiDrawing?: () => void;
  onSkipAiDrawing?: () => void;
  onCancelAiDrawing?: () => void;
  getCanvasSnapshotRef?: React.MutableRefObject<(() => string | null) | null>;
  onOpenLiveVoice?: () => void;
  onSelectSampleDrill?: (topic: string, question: string) => void;
  ageBracket?: ChildAgeBracket;
  eyeCareSettings?: EyeCareSettings;
  onOpenEyeCareModal?: () => void;
  onOpenHandwritingIdentifier?: () => void;
  onOpenAnimatedExplanation?: (problem?: string) => void;
  aiDrawingSpeed?: number;
  onSetAiDrawingSpeed?: (speed: number) => void;
  chalkboardExplainer?: {
    problem: string;
    domain?: string;
    finalAnswer?: string;
    steps: StepExplanationItem[];
    activeStepIndex: number;
  } | null;
  onChangeExplainerStepIndex?: (index: number) => void;
  onCloseExplainer?: () => void;
  onReplayExplainerStep?: (index: number) => void;
  onReopenExplainer?: () => void;
  onNextQuestion?: () => void;
}

// 5 Most Popular Chalk Colors for quick-tap bar
const QUICK_CHALK_SWATCHES = [
  { name: 'White', hex: '#F5F1E6' },
  { name: 'Gold', hex: '#E8C468' },
  { name: 'Mint', hex: '#8FBF8A' },
  { name: 'Sky', hex: '#81D4FA' },
  { name: 'Coral', hex: '#E2725B' },
];

export default function ChalkCanvas({
  strokes,
  setStrokes,
  onSubmitWork,
  isChecking,
  activeColor,
  setActiveColor,
  strokeWidth,
  setStrokeWidth,
  mode,
  setMode,
  boardTheme = BOARD_THEMES[0],
  topic = '',
  activeQuestion = '',
  questions = [],
  adaptiveQuestions = [],
  setActiveQuestion,
  feedback = null,
  onClearFeedback,
  onDrawCorrectProcessOnSlate,
  onStampQuestionToSlate,
  onOpenCurriculumGoal,
  onGenerateQuestions,
  isGeneratingQuestions = false,
  onOpenColorSettings,
  onOpenAutoDraw,
  onExecuteStudentCommand,
  isAiProcessingCommand = false,
  aiDrawingState,
  onPauseAiDrawing,
  onResumeAiDrawing,
  onSkipAiDrawing,
  onCancelAiDrawing,
  getCanvasSnapshotRef,
  onOpenLiveVoice,
  onSelectSampleDrill,
  ageBracket = '8-9',
  eyeCareSettings,
  onOpenEyeCareModal,
  onOpenHandwritingIdentifier,
  onOpenAnimatedExplanation,
  aiDrawingSpeed = 2.5,
  onSetAiDrawingSpeed,
  chalkboardExplainer = null,
  onChangeExplainerStepIndex,
  onCloseExplainer,
  onReplayExplainerStep,
  onReopenExplainer,
  onNextQuestion,
}: ChalkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);

  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);
  const [showGrid, setShowGrid] = useState<boolean>(() => {
    try {
      return localStorage.getItem('slate_grid_pattern_enabled') === 'true';
    } catch {
      return false;
    }
  });
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showSlateCorrection, setShowSlateCorrection] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showOrderBar, setShowOrderBar] = useState<boolean>(true);
  const [showExplainerCard, setShowExplainerCard] = useState<boolean>(true);
  const [showMoreToolsMenu, setShowMoreToolsMenu] = useState<boolean>(false);
  const [isQuestionCollapsed, setIsQuestionCollapsed] = useState<boolean>(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);

  const activeQuestionObj = useMemo(() => {
    return adaptiveQuestions?.find((q) => q.question === activeQuestion);
  }, [adaptiveQuestions, activeQuestion]);

  const handleReadQuestionAloud = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }
    window.speechSynthesis.cancel();
    const text = `${activeQuestion || topic || 'Practice problem'}.${activeQuestionObj?.scaffoldingHint ? ' Hint: ' + activeQuestionObj.scaffoldingHint : ''}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = ageBracket === '6-7' ? 0.88 : 0.95;
    utterance.pitch = ageBracket === '6-7' ? 1.15 : 1.08;
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);
    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  }, [activeQuestion, topic, activeQuestionObj, ageBracket, isSpeakingQuestion]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingQuestion(false);
  }, [activeQuestion]);

  // Auto-display explainer card whenever new steps are loaded
  useEffect(() => {
    if (chalkboardExplainer) {
      setShowExplainerCard(true);
    }
  }, [chalkboardExplainer]);

  // Writing Animation Effects (Chalk Dust, Magic Stars, Neon Glow, Rainbow)
  const effectsEngineRef = useRef<WritingEffectsEngine>(new WritingEffectsEngine(getStoredWritingEffect()));
  const [writingEffect, setWritingEffectState] = useState<WritingAnimationEffect>(() => getStoredWritingEffect());
  const [showEffectsPicker, setShowEffectsPicker] = useState<boolean>(false);
  const [activePointerCoords, setActivePointerCoords] = useState<{ x: number; y: number } | null>(null);
  const [hoverPointerCoords, setHoverPointerCoords] = useState<{ x: number; y: number } | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

  // Unlimited Vertical Blackboard Scrolling & Swiping State
  const [scrollY, setScrollY] = useState<number>(0);
  const isPanningRef = useRef<boolean>(false);
  const panStartYRef = useRef<number>(0);
  const initialScrollYRef = useRef<number>(0);
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  // Compute maximum content height drawn on slate to inform navigator
  const maxContentHeight = useMemo(() => {
    let max = 900;
    for (const s of strokes) {
      for (const p of s.points) {
        if (p.y > max) max = p.y;
      }
    }
    return Math.max(max + 450, scrollY + 1200);
  }, [strokes, scrollY]);

  // Keyboard Shortcuts: Spacebar (hold to Pan/Swipe), PageUp/PageDown (Scroll), Home (Top)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
      if (e.code === 'PageDown' || (e.code === 'ArrowDown' && e.altKey)) {
        e.preventDefault();
        setScrollY((prev) => prev + 320);
      }
      if (e.code === 'PageUp' || (e.code === 'ArrowUp' && e.altKey)) {
        e.preventDefault();
        setScrollY((prev) => Math.max(0, prev - 320));
      }
      if (e.code === 'Home' && e.altKey) {
        e.preventDefault();
        setScrollY(0);
      }
      if (e.key === 'p' || e.key === 'P') {
        setMode('pen');
      }
      if (e.key === 'e' || e.key === 'E') {
        setMode('erase');
      }
      if (e.key === 'h' || e.key === 'H' || e.key === 'm' || e.key === 'M') {
        setMode('pan');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        isPanningRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setMode]);

  // Smooth Auto-Follow viewport while AI is drawing calculations downward
  useEffect(() => {
    if (!aiDrawingState?.isDrawing || !aiDrawingState.activeCoordinates) return;
    const activeY = aiDrawingState.activeCoordinates.y;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;

    // Follow active chalk tip with comfortable padding above bottom toolbar dock
    const thresholdBottom = scrollY + containerHeight - 180;
    const thresholdTop = scrollY + 80;

    if (activeY > thresholdBottom) {
      setScrollY(activeY - containerHeight + 240);
    } else if (activeY < thresholdTop && scrollY > 0) {
      setScrollY(Math.max(0, activeY - 100));
    }
  }, [aiDrawingState?.activeCoordinates, aiDrawingState?.isDrawing, scrollY]);

  // Reset scroll to top when board is freshly cleared for new AI drill
  useEffect(() => {
    if (aiDrawingState?.isDrawing && aiDrawingState.currentStrokeIndex === 0) {
      setScrollY(0);
    }
  }, [aiDrawingState?.isDrawing, aiDrawingState?.currentStrokeIndex]);

  const handleSelectWritingEffect = (eff: WritingAnimationEffect) => {
    setWritingEffectState(eff);
    saveWritingEffect(eff);
    effectsEngineRef.current.setEffect(eff);
  };

  // Continuous 60fps animation loop for writing particle effects
  useEffect(() => {
    let animId: number;
    const loop = () => {
      const fxCanvas = fxCanvasRef.current;
      if (fxCanvas) {
        const ctx = fxCanvas.getContext('2d');
        if (ctx) {
          effectsEngineRef.current.updateAndRender(ctx, fxCanvas.width, fxCanvas.height);
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Emit writing animation effects while AI is autonomously drawing on the slate
  useEffect(() => {
    if (!aiDrawingState?.isDrawing || !aiDrawingState.activeCoordinates) return;
    const { x, y } = aiDrawingState.activeCoordinates;
    const screenY = y - scrollY;
    const color = eyeCareSettings 
      ? getEyeSafeChalkColor(aiDrawingState.activeColor || '#F5F1E6', eyeCareSettings) 
      : (aiDrawingState.activeColor || '#F5F1E6');
    effectsEngineRef.current.emitStrokeParticles(x, screenY, 0.5, 0.5, color, 'pen', 4);
  }, [aiDrawingState?.activeCoordinates, aiDrawingState?.isDrawing, aiDrawingState?.activeColor, eyeCareSettings, scrollY]);

  // Expose snapshot capture function to parent via ref
  // Helper to render chalk strokes to any canvas context in world coordinates with vertical scroll offset
  const renderStrokesToCtx = useCallback((
    ctx: CanvasRenderingContext2D,
    allStrokes: Stroke[],
    offsetY: number = 0
  ) => {
    ctx.save();
    ctx.translate(0, -offsetY);

    for (const stroke of allStrokes) {
      if (stroke.points.length < 2) {
        if (stroke.points.length === 1) {
          const pt = stroke.points[0];
          ctx.save();
          if (stroke.type === 'erase') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, (stroke.width || 20) / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = stroke.color;
            ctx.shadowColor = stroke.color;
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, stroke.width / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
        continue;
      }

      ctx.save();
      if (stroke.type === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = stroke.width || 24;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      } else {
        const renderColor = eyeCareSettings ? getEyeSafeChalkColor(stroke.color, eyeCareSettings) : stroke.color;
        ctx.strokeStyle = renderColor;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = renderColor;
        ctx.shadowBlur = Math.min(stroke.width, 4);

        // Chalk texture rendering: smooth authentic chalk feel with complete endpoint connection
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        if (stroke.points.length === 2) {
          ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
        } else if (stroke.points.length === 3) {
          ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
          ctx.lineTo(stroke.points[2].x, stroke.points[2].y);
        } else {
          for (let i = 1; i < stroke.points.length - 1; i++) {
            const p1 = stroke.points[i];
            const p2 = stroke.points[i + 1];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
          }
          ctx.lineTo(stroke.points[stroke.points.length - 1].x, stroke.points[stroke.points.length - 1].y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }, [eyeCareSettings]);

  // Expose snapshot capture function to parent via ref (captures derivation, optimized for AI review or full download)
  const captureSnapshot = useCallback((options?: { forAiCheck?: boolean }): string | null => {
    if (!containerRef.current || !bgCanvasRef.current || !drawCanvasRef.current) return null;

    const width = bgCanvasRef.current.width;
    const viewportHeight = bgCanvasRef.current.height;

    // Find maximum vertical extent drawn on board so multi-step solutions are never truncated
    let maxStrokeY = viewportHeight;
    for (const s of strokes) {
      for (const p of s.points) {
        if (p.y + 70 > maxStrokeY) maxStrokeY = p.y + 70;
      }
    }
    const fullExportHeight = options?.forAiCheck 
      ? Math.min(1800, Math.max(viewportHeight, Math.round(maxStrokeY)))
      : Math.min(6000, Math.max(viewportHeight, Math.round(maxStrokeY)));

    const rawCanvas = document.createElement('canvas');
    rawCanvas.width = width;
    rawCanvas.height = fullExportHeight;
    const ctx = rawCanvas.getContext('2d');
    if (!ctx) return null;

    // Fill chalkboard slate background
    ctx.fillStyle = boardTheme.gradient?.[0] || '#182821';
    ctx.fillRect(0, 0, width, fullExportHeight);

    // Render grid across full height if enabled
    if (showGrid) {
      ctx.strokeStyle = boardTheme.gridLineColor || 'rgba(245, 241, 230, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;

      ctx.beginPath();
      for (let x = gridSize; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, fullExportHeight);
      }
      for (let y = gridSize; y < fullExportHeight; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }

    // Render all strokes in world coordinates (offsetY = 0 captures complete derivation)
    renderStrokesToCtx(ctx, strokes, 0);

    // If capturing for AI evaluation, scale down to max 960px and compress to JPEG for rapid upload & 1-second Gemini response
    if (options?.forAiCheck) {
      const maxDim = 960;
      const scale = Math.min(1, maxDim / Math.max(width, fullExportHeight));
      const targetW = Math.round(width * scale);
      const targetH = Math.round(fullExportHeight * scale);

      const aiCanvas = document.createElement('canvas');
      aiCanvas.width = targetW;
      aiCanvas.height = targetH;
      const aiCtx = aiCanvas.getContext('2d');
      if (aiCtx) {
        aiCtx.imageSmoothingEnabled = true;
        aiCtx.imageSmoothingQuality = 'high';
        aiCtx.drawImage(rawCanvas, 0, 0, targetW, targetH);
        return aiCanvas.toDataURL('image/jpeg', 0.85);
      }
    }

    return rawCanvas.toDataURL('image/png');
  }, [strokes, boardTheme, showGrid, renderStrokesToCtx]);

  useEffect(() => {
    if (getCanvasSnapshotRef) {
      getCanvasSnapshotRef.current = captureSnapshot;
    }
  }, [captureSnapshot, getCanvasSnapshotRef]);

  // Open correction board automatically if new feedback with errors is received
  useEffect(() => {
    if (feedback && (feedback.mistakes?.length > 0 || feedback.overall_score < 85 || feedback.correct_solution)) {
      setShowSlateCorrection(true);
    }
  }, [feedback]);

  // Render Background Canvas Texture & Dynamic Scrolling Grid
  const renderBackground = useCallback(() => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    const width = bgCanvas.width;
    const height = bgCanvas.height;

    // Fill with current board slate color
    ctx.fillStyle = boardTheme.gradient?.[0] || '#182821';
    ctx.fillRect(0, 0, width, height);

    // Realistic Blackboard Slate Grain / Noise Texture
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 14;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Optional Slate Dot/Square Grid that scrolls dynamically with the board
    if (showGrid) {
      ctx.strokeStyle = boardTheme.gridLineColor || 'rgba(245, 241, 230, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;

      ctx.beginPath();
      // Vertical grid lines
      for (let x = gridSize; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      // Horizontal grid lines smoothly translated by scroll offset
      const startGridY = (gridSize - (scrollY % gridSize)) % gridSize;
      for (let y = startGridY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }
  }, [boardTheme, showGrid, scrollY]);

  // Render Chalk Strokes on Drawing Canvas with scroll translation
  const renderStrokes = useCallback((allStrokes: Stroke[]) => {
    const drawCanvas = drawCanvasRef.current;
    if (!drawCanvas) return;
    const ctx = drawCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    renderStrokesToCtx(ctx, allStrokes, scrollY);
  }, [renderStrokesToCtx, scrollY]);

  // Handle Resize
  const handleResize = useCallback(() => {
    if (!containerRef.current || !bgCanvasRef.current || !drawCanvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width <= 0 || height <= 0) return;

    bgCanvasRef.current.width = width;
    bgCanvasRef.current.height = height;
    drawCanvasRef.current.width = width;
    drawCanvasRef.current.height = height;
    if (fxCanvasRef.current) {
      fxCanvasRef.current.width = width;
      fxCanvasRef.current.height = height;
    }

    renderBackground();
    renderStrokes(strokes);
  }, [renderBackground, renderStrokes, strokes]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    renderBackground();
  }, [renderBackground, scrollY]);

  useEffect(() => {
    renderStrokes(strokes);
  }, [strokes, renderStrokes, scrollY]);

  // Pointer Draw & Swipe Handlers with World Coordinates and Unlimited Scroll
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (aiDrawingState?.isDrawing) return; // Prevent conflicts while AI is drawing
    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    // Check if user is initiating a Pan / Swipe gesture
    if (mode === 'pan' || isSpacePressed || e.button === 1) {
      isPanningRef.current = true;
      panStartYRef.current = e.clientY;
      initialScrollYRef.current = scrollY;
      return;
    }

    if (e.button !== 0) return; // Only primary button for drawing

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldX = screenX;
    const worldY = screenY + scrollY;

    setActivePointerCoords({ x: screenX, y: screenY });
    setHoverPointerCoords({ x: screenX, y: screenY });
    lastPointerRef.current = { x: screenX, y: screenY };

    const eraserWidth = strokeWidth * 3.5;

    // Emit initial chalk contact burst or felt eraser thump dust cloud
    if (mode === 'erase') {
      effectsEngineRef.current.emitEraserDustCloud(screenX, screenY, 0, 0, eraserWidth, true);
    } else {
      const renderColor = eyeCareSettings ? getEyeSafeChalkColor(activeColor, eyeCareSettings) : activeColor;
      effectsEngineRef.current.emitStrokeParticles(screenX, screenY, 0, 0, renderColor, 'pen', strokeWidth);
    }

    const newStroke: Stroke = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: mode === 'erase' ? 'erase' : 'pen',
      color: activeColor,
      width: mode === 'erase' ? eraserWidth : strokeWidth,
      points: [{ x: worldX, y: worldY, pressure: e.pressure || 0.5 }],
    };

    setCurrentStroke(newStroke);
    chalkAudio.startStrokeSound(mode === 'erase' ? 'erase' : 'pen', screenX, screenY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // If active pan drag gesture is in progress:
    if (isPanningRef.current) {
      const dy = e.clientY - panStartYRef.current;
      setScrollY(Math.max(0, Math.round(initialScrollYRef.current - dy)));
      return;
    }

    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldX = screenX;
    const worldY = screenY + scrollY;

    // When hovering without dragging
    if (!currentStroke) {
      if (mode === 'erase') {
        setHoverPointerCoords({ x: screenX, y: screenY });
      }
      return;
    }

    setActivePointerCoords({ x: screenX, y: screenY });
    setHoverPointerCoords({ x: screenX, y: screenY });

    const last = lastPointerRef.current || { x: screenX, y: screenY };
    const dx = screenX - last.x;
    const dy = screenY - last.y;
    lastPointerRef.current = { x: screenX, y: screenY };

    // Emit dynamic dust-cloud effect when eraser is active, or writing animation effects
    if (mode === 'erase') {
      effectsEngineRef.current.emitEraserDustCloud(screenX, screenY, dx, dy, currentStroke.width, false);
    } else {
      const renderColor = eyeCareSettings ? getEyeSafeChalkColor(activeColor, eyeCareSettings) : activeColor;
      effectsEngineRef.current.emitStrokeParticles(screenX, screenY, dx, dy, renderColor, 'pen', currentStroke.width);
    }

    const updatedStroke: Stroke = {
      ...currentStroke,
      points: [...currentStroke.points, { x: worldX, y: worldY, pressure: e.pressure || 0.5 }],
    };

    setCurrentStroke(updatedStroke);
    renderStrokes([...strokes, updatedStroke]);
    chalkAudio.updateStrokeSound(screenX, screenY, e.pressure || 0.5, currentStroke.type);
  };

  const handlePointerUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }
    if (currentStroke?.type === 'erase' && lastPointerRef.current) {
      effectsEngineRef.current.emitEraserLift(lastPointerRef.current.x, lastPointerRef.current.y, currentStroke.width);
    }
    setActivePointerCoords(null);
    lastPointerRef.current = null;
    if (!currentStroke) return;
    setStrokes((prev) => [...prev, currentStroke]);
    setRedoStack([]); // Clear redo stack on new action
    setCurrentStroke(null);
    chalkAudio.stopStrokeSound();
  };

  // Two-Finger Touch Gestures for Smooth Board Swiping
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length >= 2) {
      isPanningRef.current = true;
      panStartYRef.current = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      initialScrollYRef.current = scrollY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length >= 2 && isPanningRef.current) {
      const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dy = currentY - panStartYRef.current;
      setScrollY(Math.max(0, Math.round(initialScrollYRef.current - dy)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length < 2 && isPanningRef.current && mode !== 'pan') {
      isPanningRef.current = false;
    }
  };

  // Mouse Wheel / Trackpad Vertical Scrolling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) return; // Allow pinch zoom gestures
    setScrollY((prev) => Math.max(0, prev + e.deltaY));
  };

  // Undo / Redo
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setRedoStack((prev) => [[last], ...prev]);
    setStrokes((prev) => prev.slice(0, -1));
    chalkAudio.playChalkTap('erase');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const [next, ...rest] = redoStack;
    setRedoStack(rest);
    setStrokes((prev) => [...prev, ...next]);
    chalkAudio.playChalkTap('pen');
  };

  // Check Work submission
  const handleCheckWork = () => {
    if (strokes.length === 0 || isChecking) return;
    const snapshot = captureSnapshot({ forAiCheck: true });
    if (snapshot) {
      onSubmitWork(snapshot);
    }
  };

  // Download Snapshot
  const handleDownloadSnapshot = () => {
    const snapshot = captureSnapshot();
    if (!snapshot) return;
    const a = document.createElement('a');
    a.href = snapshot;
    a.download = `slate-blackboard-${Date.now()}.png`;
    a.click();
  };

  const handleStampQuestionToSlate = (text?: string) => {
    const qText = text || activeQuestion;
    if (!qText) return;
    if (onStampQuestionToSlate) {
      onStampQuestionToSlate(qText);
      return;
    }
  };

  const [isDustingOff, setIsDustingOff] = useState<boolean>(false);

  const handleQuickClearDustOff = () => {
    if (isDustingOff || strokes.length === 0) return;
    setIsDustingOff(true);
    chalkAudio.playEraserSound();
    
    // Trigger dynamic board wipe dust cloud simulation on fxCanvas
    const canvas = drawCanvasRef.current;
    if (canvas) {
      effectsEngineRef.current.emitBoardWipeCloud(canvas.width, canvas.height);
    }

    // Consecutive tactile duster friction sounds
    setTimeout(() => {
      chalkAudio.playEraserSound();
    }, 240);

    setTimeout(() => {
      chalkAudio.playEraserSound();
    }, 480);

    // Reset canvas strokes at midpoint of wipe sweep
    setTimeout(() => {
      setStrokes([]);
      setRedoStack([]);
    }, 550);

    // Complete animation
    setTimeout(() => {
      setIsDustingOff(false);
    }, 850);
  };

  const handleClearSlateAndRetry = () => {
    handleQuickClearDustOff();
  };

  return (
    <div className="relative flex-1 h-full w-full bg-[#182821] overflow-hidden select-none flex flex-col">
      {/* Board Canvas Area - Completely open and unblocked */}
      <div 
        id="boardWrap" 
        ref={containerRef} 
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 w-full h-full ${
          mode === 'pan' || isSpacePressed
            ? isPanningRef.current
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : mode === 'erase'
            ? 'cursor-none'
            : 'cursor-crosshair'
        }`}
      >
        <canvas
          id="bgCanvas"
          ref={bgCanvasRef}
          className="absolute inset-0 pointer-events-none"
        />
        <canvas
          id="drawCanvas"
          ref={drawCanvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onPointerLeave={() => {
            setHoverPointerCoords(null);
            if (currentStroke) handlePointerUp();
          }}
          className="absolute inset-0 touch-none"
        />
        <canvas
          id="fxCanvas"
          ref={fxCanvasRef}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* 'Dust Off' Wipe Animation Overlay */}
        {isDustingOff && (
          <div
            id="chalkDustOffOverlay"
            className="absolute inset-0 pointer-events-none z-35 overflow-hidden"
            style={{ animation: 'chalkWipeHaze 0.85s ease-out forwards' }}
          >
            {/* Background wipe haze sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Sweeping Chalk Felt Duster */}
            <div
              className="absolute top-1/2 -translate-y-1/2 flex items-center gap-4 pointer-events-none"
              style={{
                animation: 'chalkWipeSweep 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards',
              }}
            >
              {/* Physical Wooden Chalk Felt Duster */}
              <div className="w-28 h-16 rounded-2xl bg-[#6D4C41] border-2 border-[#4E342E] shadow-2xl flex flex-col items-center justify-between p-2 rotate-[-10deg]">
                <div className="w-full h-3 rounded-lg bg-[#3E2723] flex items-center justify-center shadow-inner">
                  <span className="text-[8px] font-mono font-bold text-[#D7CCC8] tracking-wider">FELT DUSTER</span>
                </div>
                <div className="w-full h-7 rounded-lg bg-[#EFEBE9] border border-[#BCAAA4] flex items-center justify-center shadow-md">
                  <span className="text-[9px] font-bold text-[#5D4037] tracking-widest uppercase">DUST OFF</span>
                </div>
              </div>

              {/* Billowing Chalk Dust Cloud Flecks */}
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 rounded-full bg-white/40 blur-sm animate-ping" />
                <div className="w-6 h-6 rounded-full bg-[#E8C468]/30 blur-xs animate-bounce" />
                <div className="w-12 h-12 rounded-full bg-white/25 blur-md" />
              </div>
            </div>

            {/* Flying Chalk Dust Micro-particles across the screen */}
            <div className="absolute inset-0 flex items-center justify-around opacity-80 pointer-events-none">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-full bg-white/70 blur-[0.5px] animate-ping"
                  style={{
                    width: `${Math.max(3, (i % 4) * 2 + 3)}px`,
                    height: `${Math.max(3, (i % 4) * 2 + 3)}px`,
                    transform: `translate(${(i % 5) * 25 - 50}px, ${(i % 3) * 40 - 60}px)`,
                    animationDuration: `${0.35 + (i % 4) * 0.12}s`,
                  }}
                />
              ))}
            </div>

            {/* Quick clean banner indicator */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#182821]/90 border border-[#8FBF8A]/50 text-[#8FBF8A] font-bold text-xs flex items-center gap-1.5 shadow-xl animate-in fade-in zoom-in-95">
              <Sparkles className="w-3.5 h-3.5 text-[#E8C468] animate-spin" />
              <span>Chalkboard Dusted Clean!</span>
            </div>
          </div>
        )}

        {/* Dynamic Animated Chalk Stick or Realistic Wooden Felt Eraser Tip */}
        {((mode === 'erase' && (activePointerCoords || hoverPointerCoords)) || (mode === 'pen' && activePointerCoords)) && (
          <div
            id="studentChalkCursorTip"
            className="absolute pointer-events-none z-20 transition-transform duration-75 ease-out"
            style={{
              left: `${(activePointerCoords || hoverPointerCoords)!.x}px`,
              top: `${(activePointerCoords || hoverPointerCoords)!.y}px`,
              transform: mode === 'erase' ? 'translate(-50%, -50%)' : 'translate(-20%, -90%)',
            }}
          >
            {mode === 'pen' ? (
              <div className="relative flex flex-col items-center">
                {/* Chalk Stick angled realistic silhouette */}
                <div
                  className="w-3 h-8 rounded-t-sm shadow-xl flex items-end justify-center pb-0.5 rotate-[15deg] border border-white/20"
                  style={{
                    backgroundColor: eyeCareSettings ? getEyeSafeChalkColor(activeColor, eyeCareSettings) : activeColor,
                    boxShadow: `0 0 12px ${(eyeCareSettings ? getEyeSafeChalkColor(activeColor, eyeCareSettings) : activeColor)}99`,
                  }}
                >
                  <span className="text-[6px] font-mono font-bold rotate-90 opacity-60 text-black/70">CHALK</span>
                </div>
                {/* Contact glow ring */}
                <div
                  className="w-2.5 h-2.5 rounded-full -mt-0.5 animate-ping opacity-75"
                  style={{ backgroundColor: eyeCareSettings ? getEyeSafeChalkColor(activeColor, eyeCareSettings) : activeColor }}
                />
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                {/* Cleaning Footprint Ring showing exact wipe area */}
                <div
                  className={`absolute rounded-full border border-dashed transition-all pointer-events-none ${
                    currentStroke
                      ? 'border-white/60 bg-white/10 scale-105 shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                      : 'border-[#E2725B]/50 bg-[#E2725B]/10'
                  }`}
                  style={{
                    width: `${strokeWidth * 3.5}px`,
                    height: `${strokeWidth * 3.5}px`,
                  }}
                />

                {/* Wooden Felt Duster with wood grain and felt wiper pad */}
                <div 
                  className={`relative flex flex-col items-center justify-between rounded-lg transition-transform ${
                    currentStroke
                      ? 'scale-95 shadow-xl rotate-[-3deg]'
                      : 'shadow-2xl hover:scale-100 rotate-[-8deg]'
                  }`}
                  style={{
                    width: `${Math.max(46, Math.min(84, strokeWidth * 3.2))}px`,
                    height: `${Math.max(26, Math.min(48, strokeWidth * 1.8))}px`,
                  }}
                >
                  {/* Wood handle block */}
                  <div className="w-full h-3/5 rounded-t-md bg-[#6D4C41] border border-[#4E342E] shadow-inner flex items-center justify-center px-1">
                    <span className="text-[6px] font-mono font-bold text-[#D7CCC8]/90 tracking-widest uppercase truncate">
                      FELT DUSTER
                    </span>
                  </div>

                  {/* Compressed Felt Layer */}
                  <div className="w-full h-2/5 rounded-b-md bg-[#EFEBE9] border-t border-[#BCAAA4] border-b border-[#8D6E63] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex justify-around opacity-30">
                      <div className="w-px h-full bg-[#8D6E63]" />
                      <div className="w-px h-full bg-[#8D6E63]" />
                      <div className="w-px h-full bg-[#8D6E63]" />
                      <div className="w-px h-full bg-[#8D6E63]" />
                    </div>
                    <span className="text-[6px] font-bold text-[#5D4037] uppercase tracking-tighter z-10">
                      {currentStroke ? 'CLEANING' : 'ERASER'}
                    </span>
                  </div>

                  {/* Active Wiping Billowing Dust Halo when Erasing */}
                  {currentStroke && (
                    <>
                      <div className="absolute -inset-2 rounded-full bg-white/20 blur-sm animate-ping pointer-events-none" />
                      <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full bg-white/30 blur-xs animate-bounce pointer-events-none" />
                      <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-white/30 blur-xs animate-bounce pointer-events-none" />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top-Right Quick Action Hub */}
        <div id="topRightActions" className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-auto">
          {chalkboardExplainer && (
            <button
              id="reopenStepExplainerBtn"
              onClick={() => {
                setShowExplainerCard(true);
                onReopenExplainer?.();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#E8C468]/20 hover:bg-[#E8C468]/30 text-[#E8C468] border border-[#E8C468]/40 font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all"
              title="Open Step-by-Step Chalkboard Explainer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Step Guide</span>
            </button>
          )}

          {feedback && !showSlateCorrection && (feedback.mistakes?.length > 0 || feedback.overall_score < 85 || feedback.correct_solution) && (
            <button
              id="reopenSlateCorrectionBtn"
              onClick={() => setShowSlateCorrection(true)}
              className="px-3 py-1.5 rounded-xl bg-[#E2725B]/20 hover:bg-[#E2725B]/30 text-[#FF8A80] border border-[#E2725B]/40 font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all animate-pulse"
              title="View AI Step-by-Step Correction on Slate"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Review Correction</span>
            </button>
          )}

          {/* Toggle Voice & Order Bar Button (Desktop & Older Only) */}
          {ageBracket !== '6-7' && (
            <button
              onClick={() => setShowOrderBar(!showOrderBar)}
              className={`hidden xl:flex px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 transition-all shadow-md ${
                showOrderBar
                  ? 'bg-[#81D4FA] text-[#121F19]'
                  : 'bg-[#182821]/80 backdrop-blur-md text-[#81D4FA] border border-[#81D4FA]/40 hover:bg-[#81D4FA]/20'
              }`}
              title="Order AI Teacher to speak and write on board"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>AI Voice Orders</span>
            </button>
          )}

          {/* Identify Handwriting OCR Button (Desktop & Older Only) */}
          {ageBracket !== '6-7' && onOpenHandwritingIdentifier && (
            <button
              id="identifyHandwritingBtn"
              onClick={onOpenHandwritingIdentifier}
              disabled={strokes.length === 0 || isChecking || aiDrawingState?.isDrawing}
              className="hidden xl:flex px-3 py-1.5 rounded-xl bg-[#182821]/90 backdrop-blur-md text-[#81D4FA] border border-[#81D4FA]/40 hover:bg-[#81D4FA]/20 font-bold text-xs shadow-lg items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              title="Identify chalkboard handwriting (OCR, Math formulas, Spelling & Penmanship)"
            >
              <ScanLine className="w-3.5 h-3.5 text-[#81D4FA]" />
              <span>Identify</span>
            </button>
          )}

          {/* Primary "Check My Work" Button */}
          <button
            id="submitWorkBtn"
            onClick={handleCheckWork}
            disabled={strokes.length === 0 || isChecking || aiDrawingState?.isDrawing}
            className={`px-4 py-2 rounded-2xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] font-bold shadow-xl shadow-[#E8C468]/25 flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.03] active:scale-[0.98] ${
              ageBracket === '6-7' ? 'text-sm sm:text-base ring-2 ring-[#E8C468]/50' : 'text-xs sm:text-sm'
            }`}
            title="Submit handwritten work to Gemini AI for vision review, step-by-step correction & grading"
          >
            <Sparkles className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking…' : '⭐ Check Work'}</span>
          </button>

          {/* Instant Next Question Button on Slate */}
          {onNextQuestion && (
            <button
              id="canvasNextQuestionBtn"
              onClick={onNextQuestion}
              className={`px-4 py-2 rounded-2xl bg-[#8FBF8A] hover:bg-[#a0d49b] text-[#182821] font-bold shadow-xl shadow-[#8FBF8A]/25 flex items-center gap-1.5 transition-all hover:scale-[1.03] active:scale-[0.98] ${
                ageBracket === '6-7' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
              }`}
              title="Clean slate and get next exciting question"
            >
              <Sparkles className="w-4 h-4 text-[#182821]" />
              <span>Next ➡️</span>
            </button>
          )}
        </div>

        {/* Student Voice & Command Controller Floating Bar */}
        {showOrderBar && onExecuteStudentCommand && (
          <div className="absolute top-12 inset-x-0 z-20 pointer-events-auto">
            <StudentAiOrderBar
              topic={topic}
              activeQuestion={activeQuestion}
              isDrawing={Boolean(aiDrawingState?.isDrawing)}
              onExecuteCommand={onExecuteStudentCommand}
              onStopDrawing={onCancelAiDrawing}
              isProcessing={isAiProcessingCommand}
              onClose={() => setShowOrderBar(false)}
              ageBracket={ageBracket}
            />
          </div>
        )}

        {/* On-Slate AI Step-by-Step Correction Board */}
        {showSlateCorrection && feedback && (
          <SlateCorrectionBoard
            feedback={feedback}
            activeQuestion={activeQuestion}
            topic={topic}
            onDrawCorrectProcessOnSlate={(fb) => onDrawCorrectProcessOnSlate?.(fb)}
            onClearSlateAndRetry={handleClearSlateAndRetry}
            onClose={() => setShowSlateCorrection(false)}
            onNextQuestion={onNextQuestion}
            isAiDrawing={aiDrawingState?.isDrawing}
          />
        )}

        {/* AI Drawing in Progress Floating HUD */}
        {aiDrawingState?.isDrawing && (
          <div 
            id="aiDrawingHudBanner"
            className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-2xl bg-[#14231C]/96 border-2 border-[#81D4FA]/60 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in max-w-[94vw] sm:max-w-2xl"
          >
            <div className="w-8 h-8 rounded-xl bg-[#81D4FA]/20 border border-[#81D4FA]/40 flex items-center justify-center text-[#81D4FA] shrink-0">
              <Pencil className="w-4 h-4 animate-bounce" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#81D4FA] tracking-wide whitespace-nowrap">
                  Slate Explanation:
                </span>
                <span className="text-xs font-bold text-[#F5F1E6] truncate max-w-[180px] sm:max-w-xs">
                  {aiDrawingState.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#81D4FA]/20 text-[#81D4FA] font-mono">
                  {aiDrawingState.currentStrokeIndex}/{aiDrawingState.totalStrokes}
                </span>
              </div>
              <p className="text-[12px] font-medium text-[#F5F1E6]/90 line-clamp-2 mt-0.5 leading-snug">
                {aiDrawingState.currentStepDescription}
              </p>
            </div>

            {/* Drawing Controls & Step Explainer Toggle */}
            <div className="flex items-center gap-1.5 border-l border-[#F5F1E6]/15 pl-2 ml-1 shrink-0">
              {chalkboardExplainer && (
                <button
                  type="button"
                  onClick={() => setShowExplainerCard((prev) => !prev)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    showExplainerCard
                      ? 'bg-[#E8C468] text-[#182821] shadow-md'
                      : 'bg-[#213A30] text-[#E8C468] hover:bg-[#2C4C3F]'
                  }`}
                  title="Toggle clean step text card"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Clear Text</span>
                </button>
              )}

              {/* Fast Speed Pill Selector */}
              {onSetAiDrawingSpeed && (
                <div className="hidden sm:flex items-center gap-0.5 bg-[#121F19]/70 px-1 py-0.5 rounded-lg border border-[#F5F1E6]/15">
                  <span className="text-[10px] text-[#F5F1E6]/60 px-0.5 font-mono">Speed:</span>
                  {[
                    { label: '1x', val: 1.2 },
                    { label: '2.5x', val: 2.5 },
                    { label: '5x', val: 5.0 },
                  ].map((spd) => (
                    <button
                      key={spd.label}
                      type="button"
                      onClick={() => onSetAiDrawingSpeed(spd.val)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                        aiDrawingSpeed === spd.val
                          ? 'bg-[#E8C468] text-[#121F19]'
                          : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30]'
                      }`}
                      title={`Set speed to ${spd.label}`}
                    >
                      {spd.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={onSkipAiDrawing}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[#81D4FA] hover:bg-[#81D4FA]/20 transition-all flex items-center gap-0.5 ml-0.5"
                    title="Instant finish"
                  >
                    <span>⚡ Instant</span>
                  </button>
                </div>
              )}

              {aiDrawingState.isPaused ? (
                <button
                  type="button"
                  onClick={onResumeAiDrawing}
                  className="p-1.5 rounded-lg bg-[#81D4FA] text-[#121F19] hover:bg-[#a0e0fd] transition-all"
                  title="Resume drawing"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPauseAiDrawing}
                  className="p-1.5 rounded-lg bg-[#213A30] text-[#F5F1E6] hover:bg-[#2C4C3F] transition-all"
                  title="Pause drawing"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onSkipAiDrawing}
                className="p-1.5 rounded-lg bg-[#213A30] text-[#E8C468] hover:bg-[#2C4C3F] transition-all"
                title="Skip to finished diagram"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onCancelAiDrawing}
                className="p-1.5 rounded-lg bg-[#213A30] text-[#E2725B] hover:bg-[#2C4C3F] transition-all"
                title="Stop drawing"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Animated Chalk Cursor Tip during AI Drawing */}
        {aiDrawingState?.isDrawing && aiDrawingState.activeCoordinates && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
            style={{
              left: `${aiDrawingState.activeCoordinates.x}px`,
              top: `${aiDrawingState.activeCoordinates.y - scrollY}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="relative flex flex-col items-center">
              <div 
                className="w-3.5 h-8 rounded-t-sm shadow-xl flex items-end justify-center pb-1 text-[8px] font-bold text-black/60 rotate-12"
                style={{
                  backgroundColor: aiDrawingState.activeColor || '#F5F1E6',
                  boxShadow: `0 0 14px ${aiDrawingState.activeColor || '#F5F1E6'}88`,
                }}
              >
                <span className="font-mono text-[6px] rotate-90 opacity-70">CHALK</span>
              </div>
              <div 
                className="w-2 h-2 rounded-full -mt-1 animate-ping"
                style={{ backgroundColor: aiDrawingState.activeColor || '#F5F1E6' }}
              />
            </div>
          </div>
        )}

        {/* Floating Vertical Blackboard Navigator & Infinite Depth Controller */}
        {((ageBracket !== '6-7') || scrollY > 50) && (
          <div
            id="verticalBoardNavigator"
            className="hidden md:flex absolute right-3 top-24 z-20 flex-col items-center gap-1.5 p-1.5 bg-[#1C2B24]/90 backdrop-blur-md rounded-2xl border border-[#F5F1E6]/15 shadow-2xl pointer-events-auto"
          >
          {/* Scroll Up Button */}
          <button
            id="scrollUpBtn"
            type="button"
            onClick={() => setScrollY((prev) => Math.max(0, prev - 350))}
            disabled={scrollY <= 0}
            className={`p-2 rounded-xl transition-all ${
              scrollY > 0
                ? 'bg-[#213A30] text-[#F5F1E6] hover:bg-[#2C4C3F] hover:text-[#E8C468]'
                : 'text-[#F5F1E6]/20 cursor-not-allowed'
            }`}
            title="Scroll Board Up (Page Up)"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Depth meter indicator */}
          <div
            className="flex flex-col items-center justify-center px-1.5 py-1 rounded-lg bg-[#14231C] border border-[#F5F1E6]/10 text-center select-none"
            title={`Chalkboard Depth: ${Math.round(scrollY)}px downward`}
          >
            <span className="text-[8px] font-mono text-[#F5F1E6]/50 uppercase tracking-widest leading-none">
              DEPTH
            </span>
            <span className="text-[10px] font-mono font-bold text-[#E8C468] leading-tight">
              {scrollY === 0 ? 'TOP' : `+${Math.round(scrollY)}`}
            </span>
          </div>

          {/* Scroll Down Button */}
          <button
            id="scrollDownBtn"
            type="button"
            onClick={() => setScrollY((prev) => prev + 350)}
            className="p-2 rounded-xl bg-[#213A30] text-[#F5F1E6] hover:bg-[#2C4C3F] hover:text-[#81D4FA] transition-all"
            title="Scroll Board Downward (Page Down / Mouse Wheel / Swipe)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Quick Extend Slate Button */}
          <button
            id="extendSlateBtn"
            type="button"
            onClick={() => setScrollY((prev) => prev + 600)}
            className="p-2 rounded-xl bg-[#81D4FA]/15 text-[#81D4FA] hover:bg-[#81D4FA]/25 transition-all flex flex-col items-center gap-0.5"
            title="Extend Board Downward (+600px clean slate)"
          >
            <ChevronsDown className="w-4 h-4 animate-bounce" />
            <span className="text-[7px] font-bold uppercase tracking-wider">EXTEND</span>
          </button>
        </div>
        )}

        {/* Quick Floating 'Back to Top' Pill Button when deeply scrolled */}
        {scrollY > 150 && (
          <button
            id="backToTopSlateBtn"
            type="button"
            onClick={() => setScrollY(0)}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-25 px-3 py-1.5 rounded-full bg-[#1C2B24]/90 hover:bg-[#213A30] border border-[#81D4FA]/40 text-[#81D4FA] text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all animate-in fade-in zoom-in-95 pointer-events-auto"
            title="Jump back to the top of the slate"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Top of Slate</span>
            <span className="text-[10px] opacity-70 font-mono">({Math.round(scrollY)}px)</span>
          </button>
        )}

        {/* On-Chalkboard Step Explainer Card */}
        {chalkboardExplainer && showExplainerCard && (
          <ChalkboardStepExplainerCard
            problem={chalkboardExplainer.problem}
            domain={chalkboardExplainer.domain}
            finalAnswer={chalkboardExplainer.finalAnswer}
            steps={chalkboardExplainer.steps}
            activeStepIndex={chalkboardExplainer.activeStepIndex}
            onChangeStepIndex={onChangeExplainerStepIndex || (() => {})}
            onReplayStep={onReplayExplainerStep}
            onClose={() => {
              setShowExplainerCard(false);
              onCloseExplainer?.();
            }}
          />
        )}

        {/* Eye Care Safe Indicator badge on Slate */}
        {eyeCareSettings?.enabled && (
          <button
            id="eyeCareCanvasBadge"
            type="button"
            onClick={onOpenEyeCareModal}
            className="absolute bottom-4 left-4 z-10 px-2.5 py-1.5 rounded-xl bg-[#FFC870]/20 hover:bg-[#FFC870]/30 border border-[#FFC870]/40 text-[#FFC870] text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md pointer-events-auto"
            title={`Child Eye Shield Active: ${eyeCareSettings.warmthPercent}% Warmth filter`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFC870]" />
            <span className="hidden sm:inline">Eye Safe Shield</span>
            <span>{eyeCareSettings.warmthPercent}%</span>
          </button>
        )}

        {/* User-Friendly Bottom Floating Chalk Tray & Tool Dock */}
        <div 
          id="chalkFloatingDock"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 sm:p-2 bg-[#1C2B24]/95 backdrop-blur-md rounded-2xl border border-[#F5F1E6]/15 shadow-2xl transition-all"
        >
          {/* Pen / Eraser / Pan Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#14231C] p-1 rounded-xl border border-[#F5F1E6]/10">
            <button
              id="penToolBtn"
              onClick={() => setMode('pen')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                mode === 'pen'
                  ? 'bg-[#E8C468] text-[#182821] shadow-md shadow-[#E8C468]/20'
                  : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30]'
              }`}
              title="Chalk Pen (P)"
            >
              <Pen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chalk</span>
            </button>

            <button
              id="eraserToolBtn"
              onClick={() => setMode('erase')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                mode === 'erase'
                  ? 'bg-[#E2725B] text-[#182821] shadow-md shadow-[#E2725B]/20'
                  : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30]'
              }`}
              title="Chalk Duster Eraser (E)"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Eraser</span>
            </button>

            <button
              id="panToolBtn"
              onClick={() => setMode(mode === 'pan' ? 'pen' : 'pan')}
              className={`hidden md:flex px-3 py-1.5 rounded-lg items-center gap-1.5 text-xs font-semibold transition-all ${
                mode === 'pan'
                  ? 'bg-[#81D4FA] text-[#182821] shadow-md shadow-[#81D4FA]/20'
                  : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30]'
              }`}
              title="Swipe Board Downward (Hold Spacebar or Two Fingers)"
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Swipe</span>
            </button>
          </div>

          {/* Quick Color Swatches Bar */}
          <div className="flex items-center gap-1.5 px-1">
            {QUICK_CHALK_SWATCHES.map((swatch) => (
              <button
                key={swatch.hex}
                onClick={() => {
                  setActiveColor(swatch.hex);
                  setMode('pen');
                }}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  activeColor === swatch.hex && mode === 'pen'
                    ? 'ring-2 ring-white scale-110 border-black/40'
                    : 'border-white/20 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={`${swatch.name} Chalk`}
              />
            ))}

            {/* More Colors & Stroke Width Popover Trigger */}
            <div className="relative">
              <button
                id="moreColorsBtn"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`p-1.5 rounded-lg text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors ${
                  showColorPicker ? 'bg-[#213A30] text-[#E8C468]' : ''
                }`}
                title="More Chalk Colors & Width Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              {showColorPicker && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowColorPicker(false)} 
                  />
                  <div 
                    id="extendedColorPicker"
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1C2B24] border border-[#F5F1E6]/15 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 w-64 z-40 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {mode === 'erase' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E2725B]">
                            <Eraser className="w-3.5 h-3.5" />
                            <span>Eraser Duster</span>
                          </div>
                          <span className="text-[10px] text-[#F5F1E6]/50">
                            {Math.round(strokeWidth * 3.5)}px wipe
                          </span>
                        </div>

                        {/* Quick Preset Buttons for Eraser */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { label: 'Precision', width: 4, desc: '14px' },
                            { label: 'Standard', width: 8, desc: '28px' },
                            { label: 'Broad Felt', width: 14, desc: '49px' },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() => setStrokeWidth(preset.width)}
                              className={`py-1.5 px-1 rounded-lg text-center flex flex-col items-center justify-center border transition-all ${
                                strokeWidth === preset.width
                                  ? 'bg-[#E2725B]/20 border-[#E2725B] text-[#F5F1E6]'
                                  : 'bg-[#14231C] border-[#F5F1E6]/10 text-[#F5F1E6]/70 hover:bg-[#213A30]'
                              }`}
                            >
                              <span className="text-[10px] font-bold">{preset.label}</span>
                              <span className="text-[9px] text-[#F5F1E6]/40">{preset.desc}</span>
                            </button>
                          ))}
                        </div>

                        {/* Dynamic Dust Cloud Badge */}
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#14231C] border border-[#F5F1E6]/10 text-[10px] text-[#F5F1E6]/80">
                          <div className="w-2 h-2 rounded-full bg-[#E2725B] animate-pulse shrink-0" />
                          <span>Dynamic billowing dust-clouds & tumbling chalk crumbs active</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#E8C468]">
                            Chalk Palette & Size
                          </span>
                          <span className="text-[10px] text-[#F5F1E6]/50">
                            {strokeWidth}px width
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {CHALK_COLORS.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setActiveColor(c.hex);
                                setMode('pen');
                                setShowColorPicker(false);
                              }}
                              className={`h-7 w-full rounded-lg transition-transform hover:scale-110 ${
                                activeColor === c.hex && mode === 'pen'
                                  ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1C2B24]'
                                  : ''
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    <div className="space-y-1.5 pt-2 border-t border-[#F5F1E6]/10">
                      <div className="flex items-center justify-between text-xs text-[#F5F1E6]/70">
                        <span>{mode === 'erase' ? 'Eraser Diameter:' : 'Chalk Thickness:'}</span>
                        <span className="font-mono text-[11px] text-[#E8C468]">
                          {mode === 'erase' ? `${Math.round(strokeWidth * 3.5)}px` : `${strokeWidth}px`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={14}
                        step={1}
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="w-full accent-[#E8C468] cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="h-5 w-px bg-[#F5F1E6]/15 mx-0.5" />

          {/* Action Tools: Undo, Redo, Clear */}
          <div className="flex items-center gap-0.5">
            <button
              id="undoBtn"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-1.5 rounded-lg text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              id="redoBtn"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-lg text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              title="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              id="clearBoardBtn"
              onClick={() => {
                if (strokes.length > 0) setShowClearConfirm(true);
              }}
              disabled={strokes.length === 0}
              className="p-1.5 rounded-lg text-[#F5F1E6]/70 hover:text-[#E2725B] hover:bg-[#213A30] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              title="Erase Entire Board"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-[#F5F1E6]/15 mx-0.5" />

          {/* Canvas Utilities: Quick Desktop items + Clean Universal 'More' Popover */}
          <div className="flex items-center gap-0.5">
            {/* Direct Grid & Sound buttons on large screens */}
            <button
              id="toggleGridBtn"
              onClick={() => {
                setShowGrid((prev) => {
                  const next = !prev;
                  try {
                    localStorage.setItem('slate_grid_pattern_enabled', String(next));
                  } catch {}
                  return next;
                });
              }}
              className={`hidden xl:flex p-1.5 rounded-lg transition-colors ${
                showGrid
                  ? 'bg-[#E8C468]/20 text-[#E8C468] border border-[#E8C468]/30'
                  : 'text-[#F5F1E6]/50 hover:text-[#F5F1E6] hover:bg-[#213A30]'
              }`}
              title={showGrid ? 'Alignment Grid: ON' : 'Alignment Grid: OFF'}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            <button
              id="toggleChalkSoundBtn"
              onClick={() => {
                const newState = chalkAudio.toggleSound();
                setIsSoundOn(newState);
              }}
              className={`hidden xl:flex p-1.5 rounded-lg transition-colors ${
                isSoundOn
                  ? 'text-[#8FBF8A] hover:bg-[#213A30]'
                  : 'text-[#F5F1E6]/40 hover:text-[#F5F1E6] hover:bg-[#213A30]'
              }`}
              title={isSoundOn ? 'Chalk Sound: ON' : 'Chalk Sound: MUTED'}
            >
              {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Universal 'More Tools' Popover for Tablet & Compact Simplicity */}
            <div className="relative">
              <button
                id="moreToolsDockBtn"
                onClick={() => setShowMoreToolsMenu(!showMoreToolsMenu)}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  showMoreToolsMenu
                    ? 'bg-[#E8C468] text-[#182821] shadow-md'
                    : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30]'
                }`}
                title="More Chalkboard Tools (Grid, Sound, Effects, Save Image)"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">More</span>
              </button>

              {showMoreToolsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowMoreToolsMenu(false)}
                  />
                  <div
                    id="moreToolsDropdownMenu"
                    className="absolute bottom-full mb-3 right-0 bg-[#1C2B24] border border-[#F5F1E6]/15 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-56 z-40 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E8C468] border-b border-[#F5F1E6]/10 mb-1 flex items-center justify-between">
                      <span>Slate Extras</span>
                      <span className="text-[#F5F1E6]/40 font-normal">Settings</span>
                    </div>

                    {/* Guidelines Grid */}
                    <button
                      id="menuToggleGridBtn"
                      onClick={() => {
                        setShowGrid((prev) => {
                          const next = !prev;
                          try {
                            localStorage.setItem('slate_grid_pattern_enabled', String(next));
                          } catch {}
                          return next;
                        });
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                        showGrid
                          ? 'bg-[#2A473B] text-[#E8C468]'
                          : 'text-[#F5F1E6]/80 hover:bg-[#213A30]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Grid className="w-3.5 h-3.5" />
                        <span>Guidelines Grid</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-60">{showGrid ? 'ON' : 'OFF'}</span>
                    </button>

                    {/* Chalk Sound */}
                    <button
                      id="menuToggleSoundBtn"
                      onClick={() => {
                        const newState = chalkAudio.toggleSound();
                        setIsSoundOn(newState);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                        isSoundOn
                          ? 'bg-[#2A473B] text-[#8FBF8A]'
                          : 'text-[#F5F1E6]/80 hover:bg-[#213A30]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span>Chalk Sound</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-60">{isSoundOn ? 'ON' : 'MUTED'}</span>
                    </button>

                    {/* Writing Effects */}
                    <button
                      id="menuWritingEffectsBtn"
                      onClick={() => {
                        setShowMoreToolsMenu(false);
                        setShowEffectsPicker(true);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#F5F1E6]/80 hover:bg-[#213A30] flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-3.5 h-3.5 text-[#E8C468]" />
                        <span>Writing Effects</span>
                      </div>
                      <span className="text-[10px] text-[#E8C468] font-mono">
                        {WRITING_EFFECT_OPTIONS.find((o) => o.id === writingEffect)?.name || 'Chalk Dust'}
                      </span>
                    </button>

                    {/* Save Slate Drawing */}
                    <button
                      id="downloadSnapshotBtn"
                      onClick={() => {
                        setShowMoreToolsMenu(false);
                        handleDownloadSnapshot();
                      }}
                      disabled={strokes.length === 0 || aiDrawingState?.isDrawing}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#F5F1E6]/80 hover:bg-[#213A30] flex items-center gap-2 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save Slate Picture</span>
                    </button>

                    {/* Animated Solution */}
                    {onOpenAnimatedExplanation && (
                      <button
                        id="canvasAnimateSolutionBtn"
                        onClick={() => {
                          setShowMoreToolsMenu(false);
                          onOpenAnimatedExplanation(activeQuestion);
                        }}
                        className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium text-[#E8C468] hover:bg-[#213A30] flex items-center gap-2 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Animate Solution</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Writing Animation Effects Popover */}
            {showEffectsPicker && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowEffectsPicker(false)} 
                />
                <div
                  id="writingEffectsPickerDropdown"
                  className="absolute bottom-full mb-3 right-0 bg-[#1C2B24] border border-[#F5F1E6]/15 p-3 rounded-2xl shadow-2xl flex flex-col gap-1.5 w-64 z-40 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#F5F1E6]/10">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E8C468]">
                      <Wand2 className="w-3.5 h-3.5 text-[#E8C468]" />
                      <span>Writing Effects</span>
                    </div>
                    <span className="text-[10px] text-[#F5F1E6]/50">60 FPS FX</span>
                  </div>

                  <div className="flex flex-col gap-1 pt-1">
                    {WRITING_EFFECT_OPTIONS.map((opt) => {
                      const isSelected = writingEffect === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            handleSelectWritingEffect(opt.id);
                            setShowEffectsPicker(false);
                          }}
                          className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-[#2A473B] text-[#F5F1E6] border border-[#8FBF8A]/30'
                              : 'hover:bg-[#213A30] text-[#F5F1E6]/80'
                          }`}
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: opt.badgeColor }}
                              />
                              <span className="text-xs font-semibold">{opt.name}</span>
                            </div>
                            <span className="text-[10px] text-[#F5F1E6]/50 pl-4.5">
                              {opt.tagline}
                            </span>
                          </div>

                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#8FBF8A] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 'Quick Clear' Floating Action Button with 'Dust Off' Wipe Animation */}
        <button
          id="quickClearFabBtn"
          onClick={handleQuickClearDustOff}
          disabled={strokes.length === 0 || isDustingOff}
          className={`hidden xl:flex absolute bottom-4 right-4 z-20 px-3.5 py-2.5 rounded-2xl font-bold text-xs items-center gap-2 shadow-2xl transition-all active:scale-95 pointer-events-auto backdrop-blur-md border ${
            strokes.length > 0 && !isDustingOff
              ? 'bg-[#E2725B]/20 hover:bg-[#E2725B]/30 text-[#FF8A80] border-[#E2725B]/40 hover:border-[#FF8A80]/70 shadow-[#E2725B]/15 hover:scale-105'
              : 'bg-[#182821]/70 text-[#F5F1E6]/30 border-[#F5F1E6]/10 opacity-50 cursor-not-allowed'
          }`}
          title="Quick Clear: 'Dust off' wipe animation resets chalkboard canvas"
        >
          <div className="relative flex items-center justify-center">
            <Eraser className={`w-4 h-4 text-[#FF8A80] ${isDustingOff ? 'animate-spin' : ''}`} />
            <Wind className="w-2.5 h-2.5 text-[#E8C468] absolute -top-1 -right-1.5 opacity-90" />
          </div>
          <span className="hidden sm:inline font-sans">Quick Clear</span>
          {isDustingOff ? (
            <span className="text-[10px] text-[#E8C468] animate-pulse">Dusting…</span>
          ) : (
            <span className="text-[10px] text-[#FF8A80]/70 font-mono hidden md:inline">Dust Off</span>
          )}
        </button>

        {/* Clear Board Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#182821] border border-[#F5F1E6]/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E2725B]/20 border border-[#E2725B]/40 flex items-center justify-center text-[#E2725B] mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-hand text-2xl text-[#F5F1E6] font-bold">Wipe Chalkboard?</h3>
                <p className="text-xs text-[#F5F1E6]/70">
                  This will erase all your current chalk writing from the blackboard.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#213A30] text-[#F5F1E6] hover:bg-[#2A473B] font-semibold text-xs transition-colors"
                >
                  Keep Drawing
                </button>
                <button
                  id="confirmClearBoardBtn"
                  onClick={() => {
                    handleClearSlateAndRetry();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#E2725B] text-[#182821] hover:bg-[#f0856f] font-bold text-xs transition-colors shadow-lg shadow-[#E2725B]/20"
                >
                  Wipe Clean
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
