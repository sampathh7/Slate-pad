// High-Performance Chalkboard Writing Animation & Particle System
// Simulates authentic chalk dust physics, magic sparkles, neon glows, and rainbow bursts

import { WritingAnimationEffect } from '../types';

export interface WritingEffectConfig {
  id: WritingAnimationEffect;
  name: string;
  tagline: string;
  iconName: string;
  badgeColor: string;
}

export const WRITING_EFFECT_OPTIONS: WritingEffectConfig[] = [
  {
    id: 'chalk_dust',
    name: 'Chalk Dust',
    tagline: 'Realistic blackboard chalk powder & eraser puffs',
    iconName: 'Wind',
    badgeColor: '#F5F1E6',
  },
  {
    id: 'sparkles',
    name: 'Magic Stars',
    tagline: 'Twinkling magic stars & glitter dust trail',
    iconName: 'Sparkles',
    badgeColor: '#E8C468',
  },
  {
    id: 'neon_glow',
    name: 'Neon Luminous',
    tagline: 'Radiant glowing embers & energy rings',
    iconName: 'Zap',
    badgeColor: '#81D4FA',
  },
  {
    id: 'rainbow_stars',
    name: 'Rainbow Fun',
    tagline: 'Colorful rainbow stars & floating pastel bubbles',
    iconName: 'Palette',
    badgeColor: '#CE93D8',
  },
  {
    id: 'none',
    name: 'Standard (Clean)',
    tagline: 'Pure chalk stroke with zero particle animations',
    iconName: 'Pen',
    badgeColor: '#8FBF8A',
  },
];

export function getStoredWritingEffect(): WritingAnimationEffect {
  try {
    const saved = localStorage.getItem('slate_writing_animation_effect');
    if (saved && WRITING_EFFECT_OPTIONS.some((o) => o.id === saved)) {
      return saved as WritingAnimationEffect;
    }
  } catch {
    // fallback
  }
  return 'chalk_dust';
}

export function saveWritingEffect(effect: WritingAnimationEffect): void {
  try {
    localStorage.setItem('slate_writing_animation_effect', effect);
  } catch {
    // ignore
  }
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  life: number; // 1.0 down to 0
  decay: number;
  color: string;
  alpha: number;
  rotation: number;
  rotSpeed: number;
  type: 'dust' | 'sparkle' | 'star' | 'ring' | 'bubble' | 'puff' | 'cloud_puff' | 'chalk_crumb' | 'wisp' | 'chalk_mist';
  gravity: number;
  drag: number;
  aspect?: number;
}

const RAINBOW_PALETTE = ['#FF8A80', '#FFD180', '#FFFF8D', '#CCFF90', '#A7FFEB', '#80D8FF', '#82B1FF', '#B388FF', '#EA80FC'];

// Authentic chalk dust color variations for volumetric clouds
const CHALK_DUST_PALETTES = [
  'rgba(248, 245, 238, 0.55)',
  'rgba(242, 238, 226, 0.50)',
  'rgba(235, 230, 218, 0.45)',
  'rgba(252, 250, 242, 0.60)',
];

export class WritingEffectsEngine {
  private particles: Particle[] = [];
  private maxParticles: number = 420;
  private rainbowIndex: number = 0;
  private activeEffect: WritingAnimationEffect = 'chalk_dust';

  constructor(initialEffect: WritingAnimationEffect = 'chalk_dust') {
    this.activeEffect = initialEffect;
  }

  public setEffect(effect: WritingAnimationEffect) {
    this.activeEffect = effect;
  }

  public getEffect(): WritingAnimationEffect {
    return this.activeEffect;
  }

  /**
   * Emit dynamic chalkboard dust cloud when the eraser tool is active and cleaning.
   * Simulates realistic billowing chalk powder clouds, turbulent air vortices, and falling chalk crumbs.
   */
  public emitEraserDustCloud(
    x: number,
    y: number,
    dx: number,
    dy: number,
    eraserWidth: number = 32,
    isImpact: boolean = false
  ): void {
    const speed = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI / 2;

    // 1. Initial Felt Thump / Impact Contact Burst
    if (isImpact) {
      const ringCount = 10 + Math.floor(Math.random() * 6);
      for (let i = 0; i < ringCount; i++) {
        if (this.particles.length >= this.maxParticles) this.particles.shift();
        const burstAngle = (i / ringCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const burstSpeed = 0.8 + Math.random() * 2.6;
        const puffSize = eraserWidth * 0.4 + Math.random() * 10;
        this.particles.push({
          x: x + Math.cos(burstAngle) * (eraserWidth * 0.3),
          y: y + Math.sin(burstAngle) * (eraserWidth * 0.3),
          vx: Math.cos(burstAngle) * burstSpeed,
          vy: Math.sin(burstAngle) * burstSpeed - 0.25,
          size: puffSize,
          maxSize: puffSize * (2.0 + Math.random() * 1.2),
          life: 1.0,
          decay: 0.016 + Math.random() * 0.012,
          color: CHALK_DUST_PALETTES[i % CHALK_DUST_PALETTES.length],
          alpha: 0.45 + Math.random() * 0.25,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          type: 'cloud_puff',
          gravity: -0.015,
          drag: 0.93,
        });
      }

      // Add falling chalk crumbs from the felt impact
      for (let j = 0; j < 8; j++) {
        if (this.particles.length >= this.maxParticles) this.particles.shift();
        const crumbAngle = Math.random() * Math.PI * 2;
        const crumbSpeed = 0.5 + Math.random() * 2.0;
        this.particles.push({
          x: x + (Math.random() - 0.5) * eraserWidth * 0.8,
          y: y + (Math.random() - 0.5) * eraserWidth * 0.8,
          vx: Math.cos(crumbAngle) * crumbSpeed,
          vy: Math.sin(crumbAngle) * crumbSpeed * 0.5,
          size: 1.0 + Math.random() * 2.2,
          maxSize: 3.0,
          life: 1.0,
          decay: 0.018 + Math.random() * 0.015,
          color: '#F5F1E6',
          alpha: 0.85,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.15,
          type: 'chalk_crumb',
          gravity: 0.16 + Math.random() * 0.12,
          drag: 0.96,
        });
      }
      return;
    }

    // 2. Active Wiping Motion Dust Clouds
    // Number of billowing cloud puffs scales with stroke speed and wiper width
    const speedBoost = Math.min(speed / 8, 3.0);
    const puffCount = Math.max(3, Math.floor(4 + speedBoost * 3 + Math.random() * 2));

    for (let i = 0; i < puffCount; i++) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();

      // Distribute puffs across the sweeping felt eraser edge
      const offsetAlongFelt = (Math.random() - 0.5) * eraserWidth * 1.1;
      const spawnX = x + Math.cos(perpAngle) * offsetAlongFelt;
      const spawnY = y + Math.sin(perpAngle) * offsetAlongFelt;

      // Billow backward behind the wiper movement with gentle turbulent curl
      const curl = (Math.random() - 0.5) * (0.8 + speedBoost * 0.6);
      const backwardPush = speed > 0.5 ? -0.16 : 0;
      const puffSize = eraserWidth * (0.35 + Math.random() * 0.45);

      this.particles.push({
        x: spawnX + (Math.random() - 0.5) * 6,
        y: spawnY + (Math.random() - 0.5) * 6,
        vx: dx * backwardPush + Math.cos(perpAngle) * curl,
        vy: dy * backwardPush - 0.35 + (Math.random() - 0.5) * 0.6, // thermal buoyant updraft
        size: puffSize,
        maxSize: puffSize * (2.4 + Math.random() * 1.4),
        life: 1.0,
        decay: 0.016 + Math.random() * 0.014, // lasts ~0.9s of smooth billowing
        color: CHALK_DUST_PALETTES[(i + Math.floor(Math.random() * 4)) % CHALK_DUST_PALETTES.length],
        alpha: 0.40 + Math.random() * 0.25,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.035,
        type: 'cloud_puff',
        gravity: -0.012, // floats softly like chalk powder
        drag: 0.94,
      });
    }

    // 3. Swirling Vortex Wisps rolling off felt tips
    const wispCount = 2 + Math.floor(Math.random() * 2);
    for (let w = 0; w < wispCount; w++) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();
      const side = w % 2 === 0 ? 1 : -1;
      const tipX = x + Math.cos(perpAngle) * (eraserWidth * 0.5 * side);
      const tipY = y + Math.sin(perpAngle) * (eraserWidth * 0.5 * side);
      const wispSize = eraserWidth * (0.4 + Math.random() * 0.3);

      this.particles.push({
        x: tipX,
        y: tipY,
        vx: -dx * 0.12 + Math.cos(perpAngle) * side * (0.6 + Math.random() * 1.2),
        vy: -dy * 0.12 - 0.4 + (Math.random() - 0.5) * 0.5,
        size: wispSize,
        maxSize: wispSize * (2.1 + Math.random() * 0.8),
        life: 1.0,
        decay: 0.022 + Math.random() * 0.015,
        color: 'rgba(240, 236, 224, 0.35)',
        alpha: 0.35,
        rotation: angle + (Math.random() - 0.5) * 0.5,
        rotSpeed: side * (0.04 + Math.random() * 0.04),
        type: 'wisp',
        gravity: -0.008,
        drag: 0.93,
        aspect: 1.4 + Math.random() * 0.5,
      });
    }

    // 4. Chalk Residue Micro-Crumbs falling under gravity toward tray
    const crumbCount = 3 + Math.floor(Math.random() * 3);
    for (let c = 0; c < crumbCount; c++) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();
      this.particles.push({
        x: x + (Math.random() - 0.5) * eraserWidth,
        y: y + (Math.random() - 0.5) * eraserWidth * 0.6,
        vx: (Math.random() - 0.5) * 1.8 + dx * 0.05,
        vy: Math.random() * 0.8,
        size: 1.0 + Math.random() * 2.2,
        maxSize: 3.2,
        life: 1.0,
        decay: 0.020 + Math.random() * 0.018,
        color: '#F5F1E6',
        alpha: 0.80,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.12,
        type: 'chalk_crumb',
        gravity: 0.15 + Math.random() * 0.12,
        drag: 0.96,
      });
    }

    // 5. Lingering Chalk Mist in wiped path
    if (Math.random() > 0.4) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: -dx * 0.05,
        vy: -0.15,
        size: eraserWidth * 0.7,
        maxSize: eraserWidth * 1.6,
        life: 1.0,
        decay: 0.012,
        color: 'rgba(235, 230, 216, 0.2)',
        alpha: 0.22,
        rotation: 0,
        rotSpeed: 0,
        type: 'chalk_mist',
        gravity: -0.005,
        drag: 0.98,
      });
    }
  }

  /**
   * Release gentle puff when eraser lifts from the board
   */
  public emitEraserLift(x: number, y: number, eraserWidth: number = 32): void {
    const puffCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < puffCount; i++) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.5;
      const size = eraserWidth * 0.35 + Math.random() * 8;
      this.particles.push({
        x: x + (Math.random() - 0.5) * eraserWidth * 0.5,
        y: y + (Math.random() - 0.5) * eraserWidth * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3,
        size,
        maxSize: size * 2.2,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.015,
        color: CHALK_DUST_PALETTES[i % CHALK_DUST_PALETTES.length],
        alpha: 0.35,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        type: 'cloud_puff',
        gravity: -0.01,
        drag: 0.94,
      });
    }
  }

  /**
   * Emit sweeping wave of dynamic dust clouds across the board for complete board clean
   */
  public emitBoardWipeCloud(width: number, height: number): void {
    const count = 45;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 30 + Math.random() * 50;
      this.particles.push({
        x,
        y,
        vx: 1.5 + Math.random() * 3.5, // sweeping left-to-right
        vy: -0.4 + (Math.random() - 0.5) * 1.5,
        size,
        maxSize: size * (1.8 + Math.random() * 1.0),
        life: 1.0,
        decay: 0.012 + Math.random() * 0.010,
        color: CHALK_DUST_PALETTES[i % CHALK_DUST_PALETTES.length],
        alpha: 0.35 + Math.random() * 0.25,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        type: 'cloud_puff',
        gravity: -0.008,
        drag: 0.96,
      });
    }

    // Add falling chalk flecks
    for (let j = 0; j < 30; j++) {
      if (this.particles.length >= this.maxParticles) this.particles.shift();
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.8),
        vx: (Math.random() - 0.5) * 2.0,
        vy: 0.5 + Math.random() * 1.5,
        size: 1.2 + Math.random() * 2.5,
        maxSize: 3.5,
        life: 1.0,
        decay: 0.014 + Math.random() * 0.014,
        color: '#F5F1E6',
        alpha: 0.85,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        type: 'chalk_crumb',
        gravity: 0.18 + Math.random() * 0.12,
        drag: 0.96,
      });
    }
  }

  /**
   * Emit particles while writing or erasing at (x, y)
   * dx, dy is movement velocity vector
   */
  public emitStrokeParticles(
    x: number,
    y: number,
    dx: number,
    dy: number,
    strokeColor: string,
    mode: 'pen' | 'erase',
    strokeWidth: number = 4
  ): void {
    // Eraser always emits authentic dynamic dust-cloud effect for realistic board cleaning
    if (mode === 'erase') {
      this.emitEraserDustCloud(x, y, dx, dy, strokeWidth, false);
      return;
    }

    if (this.activeEffect === 'none') return;

    // Pen Mode Writing Animations
    switch (this.activeEffect) {
      case 'chalk_dust': {
        // Authentic chalk micro-flecks and dust powder
        const count = 2 + Math.floor(Math.random() * 3);
        const normalAngle = Math.atan2(dy, dx) + Math.PI / 2;

        for (let i = 0; i < count; i++) {
          if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
          }
          // Emit perpendicular to writing stroke with some dispersion
          const side = Math.random() > 0.5 ? 1 : -1;
          const jitter = (Math.random() - 0.5) * 0.8;
          const emitAngle = normalAngle * side + jitter;
          const speed = 0.4 + Math.random() * 1.8;

          this.particles.push({
            x: x + (Math.random() - 0.5) * 4,
            y: y + (Math.random() - 0.5) * 4,
            vx: Math.cos(emitAngle) * speed * 0.7 - dx * 0.15,
            vy: Math.sin(emitAngle) * speed * 0.7 - dy * 0.15 + (Math.random() * 0.4),
            size: 1 + Math.random() * 2.5,
            maxSize: 2 + Math.random() * 4,
            life: 1.0,
            decay: 0.03 + Math.random() * 0.035, // lasts ~0.6s
            color: strokeColor,
            alpha: 0.75 + Math.random() * 0.25,
            rotation: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.1,
            type: 'dust',
            gravity: 0.07, // settles gently downward
            drag: 0.93,
          });
        }
        break;
      }

      case 'sparkles': {
        // Magic glittering 4-point stars and diamond flecks
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
          }
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.5 + Math.random() * 2.2;

          this.particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.3,
            size: 3 + Math.random() * 4,
            maxSize: 5 + Math.random() * 6,
            life: 1.0,
            decay: 0.03 + Math.random() * 0.025,
            color: Math.random() > 0.4 ? strokeColor : '#FFF8E1',
            alpha: 0.9,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2,
            type: Math.random() > 0.3 ? 'star' : 'sparkle',
            gravity: -0.02, // float upwards slightly
            drag: 0.92,
          });
        }
        break;
      }

      case 'neon_glow': {
        // Radiant glowing expanding energy rings and ember pulses
        if (Math.random() > 0.45) {
          if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
          }
          this.particles.push({
            x,
            y,
            vx: 0,
            vy: 0,
            size: 2,
            maxSize: 18 + Math.random() * 12,
            life: 1.0,
            decay: 0.05,
            color: strokeColor,
            alpha: 0.8,
            rotation: 0,
            rotSpeed: 0,
            type: 'ring',
            gravity: 0,
            drag: 1,
          });
        }

        // Add 2 glowing ember sparks
        for (let i = 0; i < 2; i++) {
          if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
          }
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.8 + Math.random() * 2.5;
          this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2.5,
            maxSize: 4.5,
            life: 1.0,
            decay: 0.04,
            color: strokeColor,
            alpha: 0.9,
            rotation: 0,
            rotSpeed: 0,
            type: 'sparkle',
            gravity: 0.01,
            drag: 0.91,
          });
        }
        break;
      }

      case 'rainbow_stars': {
        // Joyful colorful pastel stars, mini bubbles & hearts
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
          }
          this.rainbowIndex = (this.rainbowIndex + 1) % RAINBOW_PALETTE.length;
          const color = RAINBOW_PALETTE[this.rainbowIndex];
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.6 + Math.random() * 2.0;

          this.particles.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.4,
            size: 3 + Math.random() * 3,
            maxSize: 6 + Math.random() * 5,
            life: 1.0,
            decay: 0.028 + Math.random() * 0.02,
            color,
            alpha: 0.95,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.15,
            type: Math.random() > 0.4 ? 'star' : 'bubble',
            gravity: -0.03, // bubbles & stars float up playfully
            drag: 0.93,
          });
        }
        break;
      }
    }
  }

  /**
   * Update particle physics and draw them onto the 2D canvas context
   */
  public updateAndRender(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.clearRect(0, 0, width, height);

    if (this.particles.length === 0) return;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update physics
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const currentAlpha = Math.max(0, p.alpha * p.life);

      ctx.save();
      ctx.globalAlpha = currentAlpha;

      switch (p.type) {
        case 'dust': {
          // Chalk micro-fleck: textured tiny circle with chalk glow
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size * (0.6 + 0.4 * p.life)), 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'cloud_puff':
        case 'puff': {
          // Volumetric billowing chalk dust cloud with feathered multi-stop radial gradient
          const progress = 1 - p.life;
          const expansionEase = 1 - Math.pow(1 - progress, 2.2);
          const currentSize = Math.max(1, p.size + (p.maxSize - p.size) * expansionEase);
          
          // Natural sinusoidal alpha envelope (fade-in quickly, then soft dissipation)
          const envelope = Math.sin(Math.min(1, (1 - p.life) * 4) * Math.PI * 0.5) * Math.pow(p.life, 0.8);
          const alphaFactor = p.alpha * envelope;
          
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
          grad.addColorStop(0, `rgba(252, 249, 240, ${0.55 * alphaFactor})`);
          grad.addColorStop(0.28, `rgba(245, 240, 228, ${0.36 * alphaFactor})`);
          grad.addColorStop(0.65, `rgba(235, 230, 216, ${0.15 * alphaFactor})`);
          grad.addColorStop(1, 'rgba(235, 230, 216, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'wisp': {
          // Swirling vortex filament of chalk powder
          const progress = 1 - p.life;
          const currentSize = Math.max(1, p.size + (p.maxSize - p.size) * progress);
          const baseAlpha = p.alpha * Math.sin(p.life * Math.PI);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.aspect || 1.5, 0.65);

          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize);
          grad.addColorStop(0, `rgba(248, 244, 235, ${0.40 * baseAlpha})`);
          grad.addColorStop(0.55, `rgba(238, 233, 220, ${0.16 * baseAlpha})`);
          grad.addColorStop(1, 'rgba(238, 233, 220, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case 'chalk_crumb': {
          // Micro chalk grain tumbling down toward tray under gravity
          ctx.fillStyle = p.color || '#F5F1E6';
          ctx.shadowColor = 'rgba(245, 241, 230, 0.4)';
          ctx.shadowBlur = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.6, p.size * (0.6 + 0.4 * p.life)), 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'chalk_mist': {
          // Soft ambient chalk haze that lingers across wiped board areas
          const currentSize = Math.max(1, p.size + (p.maxSize - p.size) * (1 - p.life));
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
          grad.addColorStop(0, `rgba(240, 236, 224, ${0.18 * p.life})`);
          grad.addColorStop(0.7, `rgba(235, 230, 218, ${0.06 * p.life})`);
          grad.addColorStop(1, 'rgba(235, 230, 218, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'sparkle': {
          // Glowing diamond sparkle
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          const rad = Math.max(1, p.size * p.life);
          ctx.beginPath();
          ctx.moveTo(0, -rad);
          ctx.lineTo(rad * 0.4, 0);
          ctx.lineTo(0, rad);
          ctx.lineTo(-rad * 0.4, 0);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'star': {
          // 4-point magical twinkling star
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          const outerR = Math.max(1.5, p.size * (0.7 + 0.3 * Math.sin(p.life * Math.PI)));
          const innerR = outerR * 0.28;
          ctx.beginPath();
          for (let s = 0; s < 4; s++) {
            const rot = (s * Math.PI) / 2;
            ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
            ctx.lineTo(Math.cos(rot + Math.PI / 4) * innerR, Math.sin(rot + Math.PI / 4) * innerR);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'ring': {
          // Expanding energy wave ring
          const progress = 1 - p.life;
          const currentR = p.size + (p.maxSize - p.size) * progress;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(0.8, 2.5 * p.life);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case 'bubble': {
          // Translucent floating rainbow chalk bubble
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.fillStyle = `${p.color}33`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size * p.life), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Bubble sheen glint
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.restore();
    }
  }

  public clear(): void {
    this.particles = [];
  }
}
