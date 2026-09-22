import { Stroke, AutoDrawResult, AutoDrawStroke } from '../types';
import { chalkAudio } from './chalkAudio';

export interface AiDrawingState {
  isDrawing: boolean;
  isPaused: boolean;
  currentStrokeIndex: number;
  totalStrokes: number;
  currentStepDescription: string;
  activeCoordinates: { x: number; y: number } | null;
  activeColor: string;
  title: string;
  educationalInsight?: string;
}

export class AiDrawingRunner {
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private cancelRequested: boolean = false;
  private skipToEndRequested: boolean = false;
  private currentSpeed: number = 2.5;

  private onStateChangeCallback?: (state: AiDrawingState) => void;
  private onStrokesUpdatedCallback?: (strokes: Stroke[]) => void;
  private onCompletedCallback?: (result: AutoDrawResult) => void;

  public setCallbacks(
    onStateChange: (state: AiDrawingState) => void,
    onStrokesUpdated: (strokes: Stroke[]) => void,
    onCompleted: (result: AutoDrawResult) => void
  ) {
    this.onStateChangeCallback = onStateChange;
    this.onStrokesUpdatedCallback = onStrokesUpdated;
    this.onCompletedCallback = onCompleted;
  }

  public setSpeed(speed: number) {
    this.currentSpeed = Math.max(0.5, speed);
  }

  public pause() {
    this.isPaused = true;
    chalkAudio.stopStrokeSound();
  }

  public resume() {
    this.isPaused = false;
  }

  public cancel() {
    this.cancelRequested = true;
    this.isRunning = false;
    chalkAudio.stopStrokeSound();
  }

  public skipToEnd() {
    this.skipToEndRequested = true;
  }

  // Convert 0..1000 normalized points into actual container coordinates with preserved aspect ratio.
  // With vertical unlimited canvas scrolling, content extends downward naturally without squashing!
  private scalePoints(
    points: { x: number; y: number }[],
    canvasWidth: number,
    _canvasHeight: number
  ): { points: { x: number; y: number; pressure: number }[]; scale: number } {
    const virtualW = 1000;
    const padX = Math.max(20, canvasWidth * 0.04);
    const availableW = Math.max(300, canvasWidth - padX * 2);

    // Compute uniform proportional scale based on available chalkboard width
    const scale = Math.min(1.15, Math.max(0.68, availableW / virtualW));
    const finalW = virtualW * scale;
    const offsetX = padX + Math.max(0, (availableW - finalW) / 2);
    const offsetY = 45;

    const scaled = points.map((p, idx) => {
      const x = offsetX + (p.x / virtualW) * finalW;
      const y = offsetY + p.y * scale;
      // Natural pressure variation along the stroke
      const progress = points.length > 1 ? idx / (points.length - 1) : 0.5;
      const pressure = 0.5 + Math.sin(progress * Math.PI) * 0.35 + (Math.random() * 0.1 - 0.05);
      return { x, y, pressure };
    });

    return { points: scaled, scale };
  }

  public async startDrawing(
    result: AutoDrawResult,
    options: {
      animated: boolean;
      speed: number;
      clearBoard: boolean;
      canvasWidth: number;
      canvasHeight: number;
      existingStrokes: Stroke[];
    }
  ): Promise<void> {
    this.isRunning = true;
    this.isPaused = false;
    this.cancelRequested = false;
    this.skipToEndRequested = false;

    const { animated, speed, clearBoard, canvasWidth, canvasHeight, existingStrokes } = options;

    let currentStrokes: Stroke[] = clearBoard ? [] : [...existingStrokes];
    const totalStrokes = result.strokes.length;

    // Instant mode
    if (!animated) {
      chalkAudio.playChalkTap('pen');
      result.strokes.forEach((autoStroke, idx) => {
        const { points: scaledPts, scale } = this.scalePoints(autoStroke.points, canvasWidth, canvasHeight);
        const strokeWidth = Math.max(1.8, Math.min(5.5, (autoStroke.width || 3.2) * Math.min(1.2, Math.max(0.75, scale))));
        currentStrokes.push({
          id: `ai_stroke_${Date.now()}_${idx}`,
          type: autoStroke.type || 'pen',
          color: autoStroke.color || '#F5F1E6',
          width: strokeWidth,
          points: scaledPts,
        });
      });

      this.onStrokesUpdatedCallback?.([...currentStrokes]);
      this.onStateChangeCallback?.({
        isDrawing: false,
        isPaused: false,
        currentStrokeIndex: totalStrokes,
        totalStrokes,
        currentStepDescription: 'Completed',
        activeCoordinates: null,
        activeColor: '#E8C468',
        title: result.title,
        educationalInsight: result.educationalInsight,
      });

      this.onCompletedCallback?.(result);
      this.isRunning = false;
      return;
    }

    // Animated mode: draw stroke by stroke briskly with realistic hand flow
    this.currentSpeed = Math.max(1, speed || 2.5);

    // Continuous chalk sound across contiguous strokes
    chalkAudio.startStrokeSound('pen', 500, 300);

    for (let sIdx = 0; sIdx < totalStrokes; sIdx++) {
      if (this.cancelRequested) break;

      const autoStroke = result.strokes[sIdx];
      const nextStroke = result.strokes[sIdx + 1];
      const { points: scaledPts, scale } = this.scalePoints(autoStroke.points, canvasWidth, canvasHeight);
      const strokeColor = autoStroke.color || '#F5F1E6';
      const strokeWidth = Math.max(1.8, Math.min(5.5, (autoStroke.width || 3.2) * Math.min(1.2, Math.max(0.75, scale))));
      const strokeType = autoStroke.type || 'pen';

      const strokeDescription =
        autoStroke.label ||
        (result.stepNotes && result.stepNotes[sIdx % result.stepNotes.length]) ||
        `Drawing stroke ${sIdx + 1} of ${totalStrokes}`;

      // Update state HUD periodically or on new step
      this.onStateChangeCallback?.({
        isDrawing: true,
        isPaused: this.isPaused,
        currentStrokeIndex: sIdx + 1,
        totalStrokes,
        currentStepDescription: strokeDescription,
        activeCoordinates: scaledPts[0] ? { x: scaledPts[0].x, y: scaledPts[0].y } : null,
        activeColor: strokeColor,
        title: result.title,
        educationalInsight: result.educationalInsight,
      });

      // If skip was requested, flush all remaining strokes at once
      if (this.skipToEndRequested) {
        for (let remIdx = sIdx; remIdx < totalStrokes; remIdx++) {
          const remStroke = result.strokes[remIdx];
          const { points: remScaledPts, scale: remScale } = this.scalePoints(remStroke.points, canvasWidth, canvasHeight);
          currentStrokes.push({
            id: `ai_stroke_${Date.now()}_${remIdx}`,
            type: remStroke.type || 'pen',
            color: remStroke.color || '#F5F1E6',
            width: Math.max(1.8, Math.min(5.5, (remStroke.width || 3.2) * Math.min(1.2, Math.max(0.75, remScale)))),
            points: remScaledPts,
          });
        }
        this.onStrokesUpdatedCallback?.([...currentStrokes]);
        break;
      }

      // Short strokes (<= 4 points, like stems, dashes, accents, dots):
      // Emit instantly to make text rendering lightning-fast!
      if (scaledPts.length <= 4) {
        currentStrokes.push({
          id: `ai_stroke_${Date.now()}_${sIdx}`,
          type: strokeType,
          color: strokeColor,
          width: strokeWidth,
          points: scaledPts,
        });
        this.onStrokesUpdatedCallback?.([...currentStrokes]);

        const lastPt = scaledPts[scaledPts.length - 1];
        if (lastPt) {
          chalkAudio.updateStrokeSound(lastPt.x, lastPt.y, lastPt.pressure, strokeType);
        }

        // Fast micro-tick delay
        const microDelay = this.currentSpeed >= 4 ? 0 : this.currentSpeed >= 2.5 ? 1 : 2;
        if (microDelay > 0) {
          await new Promise((r) => setTimeout(r, microDelay));
        }
      } else {
        // Longer strokes (curves, boxes, underlines, circles):
        // Stream points in brisk chunks
        const strokeId = `ai_stroke_${Date.now()}_${sIdx}`;
        const newStroke: Stroke = {
          id: strokeId,
          type: strokeType,
          color: strokeColor,
          width: strokeWidth,
          points: [scaledPts[0]],
        };
        currentStrokes.push(newStroke);
        this.onStrokesUpdatedCallback?.([...currentStrokes]);

        // Points stride scales with speed
        const stride = Math.max(2, Math.round(this.currentSpeed * 2));
        const tickDelay = Math.max(2, Math.floor(10 / this.currentSpeed));

        for (let pIdx = 1; pIdx < scaledPts.length; pIdx += stride) {
          if (this.cancelRequested) break;

          while (this.isPaused && !this.cancelRequested && !this.skipToEndRequested) {
            await new Promise((r) => setTimeout(r, 100));
          }

          if (this.skipToEndRequested) {
            newStroke.points = scaledPts;
            this.onStrokesUpdatedCallback?.([...currentStrokes]);
            break;
          }

          const targetSliceEnd = Math.min(scaledPts.length, pIdx + stride);
          for (let k = pIdx; k < targetSliceEnd; k++) {
            newStroke.points.push(scaledPts[k]);
          }
          this.onStrokesUpdatedCallback?.([...currentStrokes]);

          const currPt = scaledPts[targetSliceEnd - 1];
          if (currPt) {
            chalkAudio.updateStrokeSound(currPt.x, currPt.y, currPt.pressure, strokeType);
          }

          await new Promise((r) => setTimeout(r, tickDelay));
        }
      }

      // Check if pause between strokes is needed:
      // If next stroke is part of the same word/character, pause is near ZERO!
      if (!this.skipToEndRequested && nextStroke) {
        const isSameGroup = autoStroke.label && nextStroke.label && 
          autoStroke.label.split(' ')[0] === nextStroke.label.split(' ')[0];

        let interDelay = 0;
        if (!isSameGroup) {
          const isMajorSection = autoStroke.label?.includes('Border') || 
                                 autoStroke.label?.includes('Badge') || 
                                 autoStroke.label?.includes('Step') !== nextStroke.label?.includes('Step');
          interDelay = isMajorSection 
            ? Math.max(10, Math.floor(40 / this.currentSpeed))
            : Math.max(2, Math.floor(10 / this.currentSpeed));
        }

        if (interDelay > 0) {
          await new Promise((r) => setTimeout(r, interDelay));
        }
      }
    }

    chalkAudio.stopStrokeSound();

    if (!this.cancelRequested) {
      chalkAudio.playChalkTap('pen');
      this.onCompletedCallback?.(result);
    }

    this.onStateChangeCallback?.({
      isDrawing: false,
      isPaused: false,
      currentStrokeIndex: totalStrokes,
      totalStrokes,
      currentStepDescription: 'Finished chalkboard illustration!',
      activeCoordinates: null,
      activeColor: '#E8C468',
      title: result.title,
      educationalInsight: result.educationalInsight,
    });

    this.isRunning = false;
  }
}
