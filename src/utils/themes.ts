import { BoardThemeOption, ChalkColorOption, BoardThemeId } from '../types';

export const BOARD_THEMES: BoardThemeOption[] = [
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Classic schoolroom emerald green slate',
    preview: '#213A30',
    gradient: ['#1c3229', '#213A30', '#182b24'],
    dustAlpha: 0.015,
    ruledLineColor: 'rgba(245, 241, 230, 0.08)',
    gridLineColor: 'rgba(245, 241, 230, 0.045)',
    gridMajorColor: 'rgba(245, 241, 230, 0.12)',
    marginColor: 'rgba(226, 114, 91, 0.28)',
    appBackground: '#182821',
    panelBackground: '#213A30',
    accentColor: '#E8C468',
  },
  {
    id: 'slate',
    name: 'Mineral Slate',
    description: 'Modern cool graphite chalkboard',
    preview: '#222831',
    gradient: ['#1C2027', '#252B35', '#191D24'],
    dustAlpha: 0.018,
    ruledLineColor: 'rgba(235, 240, 245, 0.07)',
    gridLineColor: 'rgba(235, 240, 245, 0.04)',
    gridMajorColor: 'rgba(235, 240, 245, 0.11)',
    marginColor: 'rgba(235, 110, 100, 0.3)',
    appBackground: '#171B20',
    panelBackground: '#232932',
    accentColor: '#64B5F6',
  },
  {
    id: 'black',
    name: 'Blackboard',
    description: 'Deep pitch-black matte blackboard',
    preview: '#141619',
    gradient: ['#101214', '#16191D', '#0D0E10'],
    dustAlpha: 0.025,
    ruledLineColor: 'rgba(255, 255, 255, 0.08)',
    gridLineColor: 'rgba(255, 255, 255, 0.05)',
    gridMajorColor: 'rgba(255, 255, 255, 0.14)',
    marginColor: 'rgba(255, 105, 97, 0.32)',
    appBackground: '#0F1012',
    panelBackground: '#181B1F',
    accentColor: '#FFD166',
  },
  {
    id: 'navy',
    name: 'Academic Navy',
    description: 'Deep midnight blue lecture hall board',
    preview: '#182338',
    gradient: ['#121A2B', '#1B273E', '#101726'],
    dustAlpha: 0.016,
    ruledLineColor: 'rgba(230, 240, 255, 0.07)',
    gridLineColor: 'rgba(230, 240, 255, 0.04)',
    gridMajorColor: 'rgba(230, 240, 255, 0.12)',
    marginColor: 'rgba(255, 120, 110, 0.28)',
    appBackground: '#111824',
    panelBackground: '#1C293E',
    accentColor: '#80DEEA',
  },
  {
    id: 'vintage',
    name: 'Vintage Olive',
    description: 'Warm antique bronze chalkboard',
    preview: '#2B281E',
    gradient: ['#242118', '#2E2B20', '#1F1C14'],
    dustAlpha: 0.02,
    ruledLineColor: 'rgba(250, 245, 230, 0.07)',
    gridLineColor: 'rgba(250, 245, 230, 0.045)',
    gridMajorColor: 'rgba(250, 245, 230, 0.11)',
    marginColor: 'rgba(230, 120, 90, 0.3)',
    appBackground: '#1D1A13',
    panelBackground: '#2A261C',
    accentColor: '#E6C265',
  },
  {
    id: 'eyesafe',
    name: 'Eye-Care Amber Sage',
    description: 'Optometrist-friendly warm amber-sage slate with zero harsh blue spectrum',
    preview: '#262D22',
    gradient: ['#1F251C', '#283024', '#1B2017'],
    dustAlpha: 0.012,
    ruledLineColor: 'rgba(255, 235, 200, 0.08)',
    gridLineColor: 'rgba(255, 235, 200, 0.04)',
    gridMajorColor: 'rgba(255, 235, 200, 0.12)',
    marginColor: 'rgba(230, 140, 80, 0.28)',
    appBackground: '#191E16',
    panelBackground: '#242B20',
    accentColor: '#FFC870',
  },
];

export const CHALK_COLORS: ChalkColorOption[] = [
  { id: 'white', name: 'Chalk White', hex: '#F5F1E6', label: 'Classic' },
  { id: 'yellow', name: 'Canary Yellow', hex: '#E8C468', label: 'Highlight' },
  { id: 'coral', name: 'Pastel Coral', hex: '#E2725B', label: 'Attention' },
  { id: 'mint', name: 'Mint Green', hex: '#8FBF8A', label: 'Fresh' },
  { id: 'sky', name: 'Sky Cyan', hex: '#81D4FA', label: 'Cool' },
  { id: 'violet', name: 'Chalk Violet', hex: '#CE93D8', label: 'Soft' },
  { id: 'peach', name: 'Soft Peach', hex: '#FFB74D', label: 'Warm' },
  { id: 'lime', name: 'Neon Lime', hex: '#CCFF90', label: 'Vivid' },
];

export function getStoredBoardTheme(): BoardThemeOption {
  try {
    const savedId = localStorage.getItem('slate_board_theme_id');
    if (savedId) {
      const found = BOARD_THEMES.find((t) => t.id === savedId);
      if (found) return found;
    }
  } catch {}
  return BOARD_THEMES[0]; // default 'forest'
}

export function saveBoardTheme(themeId: BoardThemeId): void {
  try {
    localStorage.setItem('slate_board_theme_id', themeId);
  } catch {}
}

export function getStoredChalkColor(): string {
  try {
    const saved = localStorage.getItem('slate_primary_chalk_color');
    if (saved) return saved;
  } catch {}
  return CHALK_COLORS[0].hex;
}

export function saveChalkColor(hex: string): void {
  try {
    localStorage.setItem('slate_primary_chalk_color', hex);
  } catch {}
}
