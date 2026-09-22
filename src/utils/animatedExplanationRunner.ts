import { AnimatedProblemExplanation, AnimatedExplanationStep, Stroke } from '../types';
import { chalkAudio } from './chalkAudio';

export interface AnimatedExplanationPlayerState {
  isActive: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: AnimatedExplanationStep | null;
  explanation: AnimatedProblemExplanation | null;
  speedMultiplier: number;
  isSpeechEnabled: boolean;
  isSpeaking: boolean;
  activeCoordinates: { x: number; y: number } | null;
  activeColor: string;
  progressPercent: number;
}

export type ExplanationStateChangeCallback = (state: AnimatedExplanationPlayerState) => void;
export type ExplanationStrokesUpdateCallback = (strokes: Stroke[]) => void;

export class AnimatedExplanationRunner {
  private explanation: AnimatedProblemExplanation | null = null;
  private currentStepIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private isCompleted: boolean = false;
  private speedMultiplier: number = 1.2;
  private isSpeechEnabled: boolean = true;
  private isSpeaking: boolean = false;

  private canvasWidth: number = 1200;
  private canvasHeight: number = 800;

  private activeStrokeIndex: number = 0;
  private activePointIndex: number = 0;
  private animFrameId: number | null = null;
  private lastTimestamp: number = 0;

  // Rendered strokes up to current step and points
  private completedStepStrokes: Stroke[] = [];
  private currentStepStrokes: Stroke[] = [];
  private inProgressStroke: Stroke | null = null;

  private onStateChange: ExplanationStateChangeCallback = () => {};
  private onStrokesUpdate: ExplanationStrokesUpdateCallback = () => {};

  public init(callbacks: {
    onStateChange: ExplanationStateChangeCallback;
    onStrokesUpdate: ExplanationStrokesUpdateCallback;
  }) {
    this.onStateChange = callbacks.onStateChange;
    this.onStrokesUpdate = callbacks.onStrokesUpdate;
  }

  public start(
    explanation: AnimatedProblemExplanation,
    options: {
      canvasWidth?: number;
      canvasHeight?: number;
      speed?: number;
      speechEnabled?: boolean;
    } = {}
  ) {
    this.cancel();

    this.explanation = explanation;
    this.canvasWidth = options.canvasWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
    this.canvasHeight = options.canvasHeight || (typeof window !== 'undefined' ? window.innerHeight : 800);
    this.speedMultiplier = options.speed ?? 1.2;
    this.isSpeechEnabled = options.speechEnabled ?? true;

    this.currentStepIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;
    this.isCompleted = false;
    this.completedStepStrokes = [];

    this.startStep(0);
  }

  private startStep(stepIdx: number) {
    if (!this.explanation || stepIdx >= this.explanation.steps.length) {
      this.finishAll();
      return;
    }

    this.currentStepIndex = stepIdx;
    this.activeStrokeIndex = 0;
    this.activePointIndex = 0;
    this.currentStepStrokes = [];
    this.inProgressStroke = null;
    this.lastTimestamp = performance.now();

    const currentStep = this.explanation.steps[stepIdx];

    // Speak teacher narration for this step
    if (this.isSpeechEnabled && currentStep.spokenNarration) {
      this.speakNarration(currentStep.spokenNarration);
    }

    this.notifyState();
    this.scheduleNextFrame();
  }

  private speakNarration(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.96;
      utterance.pitch = 1.08; // friendly and warm teacher pitch
      utterance.onstart = () => {
        this.isSpeaking = true;
        this.notifyState();
      };
      utterance.onend = () => {
        this.isSpeaking = false;
        this.notifyState();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        this.notifyState();
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
    }
  }

  private scheduleNextFrame() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.animFrameId = requestAnimationFrame(this.renderLoop);
  }

  private renderLoop = (timestamp: number) => {
    if (!this.isPlaying || this.isPaused || !this.explanation) return;

    const currentStep = this.explanation.steps[this.currentStepIndex];
    if (!currentStep) {
      this.finishAll();
      return;
    }

    const strokesForStep = currentStep.strokes;
    if (!strokesForStep || strokesForStep.length === 0 || this.activeStrokeIndex >= strokesForStep.length) {
      // Step complete! Move to next step after a comfortable pause
      this.finishCurrentStep();
      return;
    }

    const targetStroke = strokesForStep[this.activeStrokeIndex];
    if (!targetStroke.points || targetStroke.points.length === 0) {
      this.activeStrokeIndex++;
      this.scheduleNextFrame();
      return;
    }

    const delta = timestamp - this.lastTimestamp;
    // Speed: points per frame based on speed multiplier
    const pointsToAdd = Math.max(1, Math.round(this.speedMultiplier * (delta > 32 ? 2 : 1)));
    this.lastTimestamp = timestamp;

    for (let p = 0; p < pointsToAdd; p++) {
      if (this.activePointIndex >= targetStroke.points.length) {
        // Finished current stroke in step
        if (this.inProgressStroke) {
          this.currentStepStrokes.push(this.inProgressStroke);
          this.inProgressStroke = null;
        }
        this.activeStrokeIndex++;
        this.activePointIndex = 0;
        break;
      }

      const rawPt = targetStroke.points[this.activePointIndex];
      const scaledX = (rawPt.x / 1000) * this.canvasWidth;
      const scaledY = (rawPt.y / 1000) * this.canvasHeight;

      if (!this.inProgressStroke) {
        this.inProgressStroke = {
          id: `step-${this.currentStepIndex}-str-${this.activeStrokeIndex}-${Date.now()}`,
          color: targetStroke.color || '#F5F1E6',
          width: targetStroke.width || 3.5,
          type: targetStroke.type === 'erase' ? 'erase' : 'pen',
          points: [{ x: scaledX, y: scaledY, pressure: 0.65 }],
        };
        // Play chalk sound
        chalkAudio.playChalkStroke(targetStroke.type === 'erase', targetStroke.color);
      } else {
        this.inProgressStroke.points.push({ x: scaledX, y: scaledY, pressure: 0.65 });
      }

      this.activePointIndex++;
    }

    // Publish combined strokes
    this.emitCombinedStrokes();
    this.notifyState();
    this.scheduleNextFrame();
  };

  private emitCombinedStrokes() {
    const combined: Stroke[] = [...this.completedStepStrokes, ...this.currentStepStrokes];
    if (this.inProgressStroke) {
      combined.push(this.inProgressStroke);
    }
    this.onStrokesUpdate(combined);
  }

  private finishCurrentStep() {
    if (!this.explanation) return;
    const currentStep = this.explanation.steps[this.currentStepIndex];

    // Ensure all strokes for this step are marked complete
    if (currentStep && currentStep.strokes) {
      const fullStepStrokes: Stroke[] = currentStep.strokes.map((s, idx) => ({
        id: `step-${this.currentStepIndex}-str-${idx}`,
        color: s.color || '#F5F1E6',
        width: s.width || 3.5,
        type: s.type === 'erase' ? 'erase' : 'pen',
        points: (s.points || []).map((p) => ({
          x: (p.x / 1000) * this.canvasWidth,
          y: (p.y / 1000) * this.canvasHeight,
          pressure: 0.7,
        })),
      }));
      this.completedStepStrokes = [...this.completedStepStrokes, ...fullStepStrokes];
      this.currentStepStrokes = [];
      this.inProgressStroke = null;
    }

    this.emitCombinedStrokes();

    // Check if more steps remain
    if (this.currentStepIndex + 1 < this.explanation.steps.length) {
      // Pause slightly between steps to let the student process and hear the teacher
      setTimeout(() => {
        if (this.isPlaying && !this.isPaused) {
          this.startStep(this.currentStepIndex + 1);
        }
      }, 700);
    } else {
      this.finishAll();
    }
  }

  private finishAll() {
    if (!this.explanation) return;
    this.isPlaying = false;
    this.isPaused = false;
    this.isCompleted = true;

    // Render all strokes cleanly
    const allStrokesConverted: Stroke[] = [];
    this.explanation.steps.forEach((step, sIdx) => {
      (step.strokes || []).forEach((s, idx) => {
        allStrokesConverted.push({
          id: `final-s${sIdx}-str-${idx}`,
          color: s.color || '#F5F1E6',
          width: s.width || 3.5,
          type: s.type === 'erase' ? 'erase' : 'pen',
          points: (s.points || []).map((p) => ({
            x: (p.x / 1000) * this.canvasWidth,
            y: (p.y / 1000) * this.canvasHeight,
            pressure: 0.7,
          })),
        });
      });
    });

    this.completedStepStrokes = allStrokesConverted;
    this.currentStepStrokes = [];
    this.inProgressStroke = null;
    this.emitCombinedStrokes();
    this.notifyState();
  }

  public pause() {
    this.isPaused = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    this.notifyState();
  }

  public resume() {
    if (!this.explanation) return;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    this.scheduleNextFrame();
    this.notifyState();
  }

  public nextStep() {
    if (!this.explanation) return;
    if (this.currentStepIndex + 1 < this.explanation.steps.length) {
      this.fastCompleteCurrentStep();
      this.startStep(this.currentStepIndex + 1);
    } else {
      this.skipToEnd();
    }
  }

  public prevStep() {
    if (!this.explanation) return;
    const targetIdx = Math.max(0, this.currentStepIndex - 1);
    this.rebuildCompletedUpTo(targetIdx);
    this.startStep(targetIdx);
  }

  public jumpToStep(stepIdx: number) {
    if (!this.explanation || stepIdx < 0 || stepIdx >= this.explanation.steps.length) return;
    this.rebuildCompletedUpTo(stepIdx);
    this.startStep(stepIdx);
  }

  private fastCompleteCurrentStep() {
    if (!this.explanation) return;
    const currentStep = this.explanation.steps[this.currentStepIndex];
    if (currentStep && currentStep.strokes) {
      const fullStepStrokes: Stroke[] = currentStep.strokes.map((s, idx) => ({
        id: `fast-s${this.currentStepIndex}-str-${idx}`,
        color: s.color || '#F5F1E6',
        width: s.width || 3.5,
        type: s.type === 'erase' ? 'erase' : 'pen',
        points: (s.points || []).map((p) => ({
          x: (p.x / 1000) * this.canvasWidth,
          y: (p.y / 1000) * this.canvasHeight,
          pressure: 0.7,
        })),
      }));
      this.completedStepStrokes = [...this.completedStepStrokes, ...fullStepStrokes];
      this.currentStepStrokes = [];
      this.inProgressStroke = null;
    }
  }

  private rebuildCompletedUpTo(targetStepIdx: number) {
    if (!this.explanation) return;
    const rebuilt: Stroke[] = [];
    for (let i = 0; i < targetStepIdx; i++) {
      const step = this.explanation.steps[i];
      if (step && step.strokes) {
        step.strokes.forEach((s, idx) => {
          rebuilt.push({
            id: `reb-s${i}-str-${idx}`,
            color: s.color || '#F5F1E6',
            width: s.width || 3.5,
            type: s.type === 'erase' ? 'erase' : 'pen',
            points: (s.points || []).map((p) => ({
              x: (p.x / 1000) * this.canvasWidth,
              y: (p.y / 1000) * this.canvasHeight,
              pressure: 0.7,
            })),
          });
        });
      }
    }
    this.completedStepStrokes = rebuilt;
    this.currentStepStrokes = [];
    this.inProgressStroke = null;
  }

  public skipToEnd() {
    if (!this.explanation) return;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentStepIndex = this.explanation.steps.length - 1;
    this.finishAll();
  }

  public replay() {
    if (!this.explanation) return;
    this.cancel();
    this.start(this.explanation, {
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      speed: this.speedMultiplier,
      speechEnabled: this.isSpeechEnabled,
    });
  }

  public setSpeed(speed: number) {
    this.speedMultiplier = Math.max(0.5, Math.min(3.0, speed));
    this.notifyState();
  }

  public toggleSpeech(enabled?: boolean) {
    this.isSpeechEnabled = enabled !== undefined ? enabled : !this.isSpeechEnabled;
    if (!this.isSpeechEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
    this.notifyState();
  }

  public cancel() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.isCompleted = false;
    this.isSpeaking = false;
    this.explanation = null;
    this.completedStepStrokes = [];
    this.currentStepStrokes = [];
    this.inProgressStroke = null;
    this.notifyState();
  }

  private notifyState() {
    const totalSteps = this.explanation?.steps.length || 0;
    const currentStep = this.explanation?.steps[this.currentStepIndex] || null;

    let activeCoords: { x: number; y: number } | null = null;
    let activeColor = '#F5F1E6';

    if (this.inProgressStroke && this.inProgressStroke.points.length > 0) {
      const lastPt = this.inProgressStroke.points[this.inProgressStroke.points.length - 1];
      activeCoords = { x: lastPt.x, y: lastPt.y };
      activeColor = this.inProgressStroke.color;
    }

    const progressPercent = totalSteps > 0 ? Math.round(((this.currentStepIndex + (this.isCompleted ? 1 : 0.5)) / totalSteps) * 100) : 0;

    this.onStateChange({
      isActive: Boolean(this.explanation),
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isCompleted: this.isCompleted,
      currentStepIndex: this.currentStepIndex,
      totalSteps,
      currentStep,
      explanation: this.explanation,
      speedMultiplier: this.speedMultiplier,
      isSpeechEnabled: this.isSpeechEnabled,
      isSpeaking: this.isSpeaking,
      activeCoordinates: activeCoords,
      activeColor,
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
    });
  }
}
