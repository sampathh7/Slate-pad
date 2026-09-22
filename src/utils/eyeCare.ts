import { EyeCareSettings, EyeCareFilterLevel } from '../types';

export const DEFAULT_EYE_CARE_SETTINGS: EyeCareSettings = {
  enabled: false,
  warmthPercent: 35,
  filterLevel: 'gentle',
  softenChalkGlance: true,
  antiGlareMatte: true,
  breakReminder202020: true,
  breakIntervalMinutes: 20,
};

export interface EyeCarePresetOption {
  level: EyeCareFilterLevel;
  label: string;
  badge: string;
  icon: string;
  warmth: number;
  description: string;
  recommendedFor: string;
}

export const EYE_CARE_PRESETS: EyeCarePresetOption[] = [
  {
    level: 'gentle',
    label: 'Gentle Day Shield',
    badge: '25% Warmth',
    icon: '🌱',
    warmth: 25,
    description: 'Soft amber filter that cuts digital glare without muting colors.',
    recommendedFor: 'Morning & daytime classroom homework (Ages 6–12)',
  },
  {
    level: 'balanced',
    label: 'Balanced Comfort',
    badge: '45% Warmth',
    icon: '☀️',
    warmth: 45,
    description: 'Optimal pediatric eye-strain reduction for active solving & drawing.',
    recommendedFor: 'Afternoon study & 30+ minute chalkboard practice',
  },
  {
    level: 'night',
    label: 'Sleep-Safe Bedtime',
    badge: '70% Warmth',
    icon: '🌙',
    warmth: 70,
    description: 'Deep amber-spectrum filter blocking harmful blue wavelengths (<455nm) to protect melatonin & sleep.',
    recommendedFor: 'Evening review before bed & low-light rooms',
  },
];

const STORAGE_KEY = 'slate_eye_care_settings_v1';

export function getStoredEyeCareSettings(): EyeCareSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_EYE_CARE_SETTINGS,
        ...parsed,
      };
    }
  } catch {}
  return DEFAULT_EYE_CARE_SETTINGS;
}

export function saveEyeCareSettings(settings: EyeCareSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

/**
 * Returns optical color transforms to soften stark chalk colors into warm, non-glare eye-safe shades.
 */
export function getEyeSafeChalkColor(originalHex: string, settings: EyeCareSettings): string {
  if (!settings.enabled || !settings.softenChalkGlance) return originalHex;

  const hexLower = originalHex.toLowerCase();
  // Soften harsh stark white chalk to soothing warm parchment cream
  if (hexLower === '#f5f1e6' || hexLower === '#ffffff' || hexLower === '#fafafa') {
    if (settings.warmthPercent > 50) return '#FFE9C7';
    return '#FFF2D9';
  }
  // Soften bright harsh cyan/sky chalk
  if (hexLower === '#81d4fa' || hexLower === '#64b5f6') {
    return '#A2E3D8'; // Softer aqua-sage
  }
  // Soften harsh neon yellow
  if (hexLower === '#e8c468' || hexLower === '#ffd166') {
    return '#E6BE72';
  }

  return originalHex;
}

/**
 * Calculate the amber filter overlay color based on warmth percentage.
 */
export function getEyeCareOverlayColor(warmthPercent: number): string {
  // Pure warm amber spectrum: rgba(255, 170, 50, alpha)
  // Low warmth: subtle 0.08 alpha -> High warmth: rich 0.38 alpha
  const alpha = 0.05 + (warmthPercent / 100) * 0.28;
  return `rgba(255, 160, 40, ${alpha.toFixed(3)})`;
}
