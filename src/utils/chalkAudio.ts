// Web Audio API Synthesizer for tactile Chalk and Eraser sound effects on Slate

class ChalkAudioEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private noiseBuffer: AudioBuffer | null = null;
  private activeNoiseSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private highpassNode: BiquadFilterNode | null = null;
  private isPlayingStroke: boolean = false;
  private lastPoint: { x: number; y: number; time: number } | null = null;
  private stopTimeout: any = null;

  constructor() {
    // Check localStorage preference
    try {
      const saved = localStorage.getItem('slate_chalk_sound_enabled');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      }
    } catch {
      this.isEnabled = true;
    }
  }

  public getSoundEnabled(): boolean {
    return this.isEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('slate_chalk_sound_enabled', String(enabled));
    } catch {}
    if (!enabled) {
      this.stopStrokeSound();
    }
  }

  public toggleSound(): boolean {
    this.setSoundEnabled(!this.isEnabled);
    return this.isEnabled;
  }

  private initContext(): boolean {
    if (!this.isEnabled) return false;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (!this.noiseBuffer && this.ctx) {
        // Generate 2 seconds of textured chalk friction noise buffer
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          // Combination of white noise, Brownian drift, and micro-crackle spikes
          const white = Math.random() * 2 - 1;
          const brown = (lastOut + 0.02 * white) / 1.02;
          lastOut = brown;

          // Occasional chalk grain friction micro-spike
          const crackle = Math.random() < 0.03 ? (Math.random() * 2 - 1) * 0.4 : 0;
          output[i] = white * 0.6 + brown * 0.3 + crackle;
        }
        this.noiseBuffer = buffer;
      }
      return true;
    } catch (err) {
      console.warn('[ChalkAudio] AudioContext init failed:', err);
      return false;
    }
  }

  // Quick tactile chalk tap sound when chalk first touches the slate board
  public playChalkTap(mode: 'pen' | 'erase'): void {
    if (!this.isEnabled) return;
    if (!this.initContext() || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const isChalk = mode === 'pen';

      // Tap oscillator for click body
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = isChalk ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isChalk ? 480 : 220, now);
      osc.frequency.exponentialRampToValueAtTime(isChalk ? 120 : 60, now + 0.04);

      oscGain.gain.setValueAtTime(isChalk ? 0.08 : 0.04, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

      // Micro noise burst for the friction contact snap
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        const noiseGain = this.ctx.createGain();

        noiseFilter.type = isChalk ? 'bandpass' : 'lowpass';
        noiseFilter.frequency.setValueAtTime(isChalk ? 2600 : 800, now);
        noiseFilter.Q.setValueAtTime(1.8, now);

        noiseGain.gain.setValueAtTime(isChalk ? 0.12 : 0.06, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.04);
      }
    } catch {}
  }

  public playEraserSound(): void {
    this.playChalkTap('erase');
  }

  public playChalkStroke(isErase: boolean = false, color?: string): void {
    if (!this.isEnabled) return;
    this.playChalkTap(isErase ? 'erase' : 'pen');
  }

  // Start continuous friction loop while drawing
  public startStrokeSound(mode: 'pen' | 'erase', startX: number, startY: number): void {
    if (!this.isEnabled) return;
    if (!this.initContext() || !this.ctx || !this.noiseBuffer) return;

    this.lastPoint = { x: startX, y: startY, time: performance.now() };
    this.playChalkTap(mode);

    if (this.isPlayingStroke) return;

    try {
      const now = this.ctx.currentTime;
      const isChalk = mode === 'pen';

      // 1. Continuous Loop Source
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;
      source.loop = true;
      this.activeNoiseSource = source;

      // 2. Highpass Filter (removes mud)
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(isChalk ? 1100 : 300, now);
      this.highpassNode = hp;

      // 3. Bandpass/Lowpass Filter (chalk texture resonance)
      const filter = this.ctx.createBiquadFilter();
      filter.type = isChalk ? 'bandpass' : 'lowpass';
      filter.frequency.setValueAtTime(isChalk ? 2400 : 700, now);
      filter.Q.setValueAtTime(isChalk ? 2.0 : 1.0, now);
      this.filterNode = filter;

      // 4. Dynamic Master Gain
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(isChalk ? 0.08 : 0.05, now + 0.03);
      this.gainNode = gain;

      // Connect pipeline: Noise -> HP -> Filter -> Gain -> Output
      source.connect(hp);
      hp.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      source.start(now);
      this.isPlayingStroke = true;
    } catch (err) {
      console.warn('[ChalkAudio] Start stroke sound error:', err);
    }
  }

  // Update friction sound characteristics based on draw speed and pressure
  public updateStrokeSound(x: number, y: number, pressure: number = 0.5, mode: 'pen' | 'erase' = 'pen'): void {
    if (!this.isEnabled || !this.isPlayingStroke || !this.ctx || !this.gainNode) return;

    const now = performance.now();
    let speed = 1.0;

    if (this.lastPoint) {
      const dx = x - this.lastPoint.x;
      const dy = y - this.lastPoint.y;
      const dt = Math.max(1, now - this.lastPoint.time);
      const dist = Math.sqrt(dx * dx + dy * dy);
      speed = dist / dt; // pixels per ms
    }
    this.lastPoint = { x, y, time: now };

    try {
      const audioNow = this.ctx.currentTime;
      const isChalk = mode === 'pen';

      // Velocity mapping: speed ranges ~ 0.1 to 3.5 px/ms
      const normalizedSpeed = Math.min(1.0, Math.max(0.08, speed / 2.5));
      const effectivePressure = Math.min(1.0, Math.max(0.3, pressure || 0.5));

      // Calculate subtle, comfortable volume
      const baseMaxGain = isChalk ? 0.16 : 0.1;
      const targetGain = Math.max(0.015, normalizedSpeed * effectivePressure * baseMaxGain);

      // Smooth gain transition
      this.gainNode.gain.cancelScheduledValues(audioNow);
      this.gainNode.gain.linearRampToValueAtTime(targetGain, audioNow + 0.04);

      // Frequency shift with drawing speed
      if (this.filterNode) {
        const baseFreq = isChalk ? 2300 : 650;
        const targetFreq = baseFreq + normalizedSpeed * (isChalk ? 800 : 250);
        this.filterNode.frequency.cancelScheduledValues(audioNow);
        this.filterNode.frequency.linearRampToValueAtTime(targetFreq, audioNow + 0.04);
      }

      // If pointer becomes stationary, ramp down softly after 120ms
      if (this.stopTimeout) clearTimeout(this.stopTimeout);
      this.stopTimeout = setTimeout(() => {
        if (this.gainNode && this.ctx) {
          try {
            const curTime = this.ctx.currentTime;
            this.gainNode.gain.cancelScheduledValues(curTime);
            this.gainNode.gain.linearRampToValueAtTime(0.0001, curTime + 0.06);
          } catch {}
        }
      }, 120);
    } catch {}
  }

  // Smoothly fade out and stop stroke audio on pointer lift
  public stopStrokeSound(): void {
    if (this.stopTimeout) clearTimeout(this.stopTimeout);
    this.lastPoint = null;

    if (!this.isPlayingStroke || !this.ctx || !this.gainNode) {
      this.isPlayingStroke = false;
      return;
    }

    try {
      const audioNow = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(audioNow);
      this.gainNode.gain.linearRampToValueAtTime(0.0001, audioNow + 0.05);

      const sourceToStop = this.activeNoiseSource;
      setTimeout(() => {
        try {
          if (sourceToStop) {
            sourceToStop.stop();
            sourceToStop.disconnect();
          }
        } catch {}
      }, 60);

      this.activeNoiseSource = null;
      this.isPlayingStroke = false;
    } catch {
      this.isPlayingStroke = false;
    }
  }

  // Cartoon Encouragement Sounds & Mascot Jingles
  public playCelebrationFanfare(): void {
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Cheerful major arpeggio fanfare (C5, E5, G5, C6, E6)
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
      });
    } catch {}
  }

  public playEncouragementCheer(): void {
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Uplifting two-tone positive chime (F5 -> A5 -> C6)
      const notes = [698.46, 880.0, 1046.5];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        gain.gain.setValueAtTime(0.001, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.1, now + i * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.35);
      });
    } catch {}
  }

  public playMascotPop(): void {
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // Quick pitch rise for cartoon pop
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  public playMascotGiggle(): void {
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [600, 750, 680, 850].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.08, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.1);
      });
    } catch {}
  }

  // Spider-Man Web Thwip Sound
  public playWebThwip(): void {
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.14);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Doraemon Bamboo-Copter / Gadget Bell Sound
  public playDoraemonGadget(): void {
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Cheerful bell sparkle triad (Doraemon secret gadget sound)
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
      freqs.forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.07);

        gain.gain.setValueAtTime(0.001, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.45);
      });
    } catch {}
  }

  // Shin-chan Cheeky Boing / Wiggle Dance Sound
  public playShinchanBoing(): void {
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Boing vibrato pitch slide
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(540, now + 0.12);
      osc.frequency.linearRampToValueAtTime(320, now + 0.22);
      osc.frequency.linearRampToValueAtTime(680, now + 0.32);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  // Pikachu Electric Thunder Spark Sound
  public playPikachuSpark(): void {
    if (!this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [800, 1200, 1600, 2400].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.08, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.08);
      });
    } catch {}
  }
}

export const chalkAudio = new ChalkAudioEngine();
