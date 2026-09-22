import React from 'react';
import { Palette, Check, X, Sparkles, RefreshCw } from 'lucide-react';
import { BoardThemeOption, ChalkColorOption, BoardThemeId } from '../types';
import { BOARD_THEMES, CHALK_COLORS } from '../utils/themes';

interface ColorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBoardTheme: BoardThemeOption;
  onSelectBoardTheme: (theme: BoardThemeOption) => void;
  activeChalkColor: string;
  onSelectChalkColor: (hex: string) => void;
}

export default function ColorSettingsModal({
  isOpen,
  onClose,
  currentBoardTheme,
  onSelectBoardTheme,
  activeChalkColor,
  onSelectChalkColor,
}: ColorSettingsModalProps) {
  if (!isOpen) return null;

  const handleResetDefaults = () => {
    onSelectBoardTheme(BOARD_THEMES[0]);
    onSelectChalkColor(CHALK_COLORS[0].hex);
  };

  const activeChalkObj = CHALK_COLORS.find((c) => c.hex.toLowerCase() === activeChalkColor.toLowerCase()) || CHALK_COLORS[0];

  return (
    <div
      id="colorSettingsBackdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="colorSettingsDialog"
        className="bg-[#1C242A] border border-[#F5F1E6]/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-[#F5F1E6] relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E8C468]/20 border border-[#E8C468]/40 flex items-center justify-center text-[#E8C468]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-hand font-bold text-2xl text-[#E8C468] leading-tight">
                Color & Board Settings
              </h2>
              <p className="text-xs text-[#F5F1E6]/60">
                Customize chalkboard surface atmosphere & primary chalk color
              </p>
            </div>
          </div>

          <button
            id="closeColorSettingsBtn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#F5F1E6]/60 hover:text-[#F5F1E6] hover:bg-[#2A343D] transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Chalkboard Surface Background */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E8C468]" />
              Chalkboard Background
            </label>
            <span className="text-[11px] text-[#F5F1E6]/50">
              Active: <strong className="text-[#F5F1E6]">{currentBoardTheme.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BOARD_THEMES.map((theme) => {
              const isSelected = currentBoardTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  id={`boardTheme-${theme.id}`}
                  onClick={() => onSelectBoardTheme(theme)}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex items-center gap-3 group ${
                    isSelected
                      ? 'border-[#E8C468] bg-[#2A3540] shadow-lg shadow-black/40 scale-[1.01]'
                      : 'border-[#F5F1E6]/10 bg-[#161C22]/80 hover:bg-[#202830] hover:border-[#F5F1E6]/25'
                  }`}
                >
                  {/* Visual Board Swatch */}
                  <div
                    className="w-12 h-12 rounded-xl shadow-inner border border-white/10 shrink-0 relative overflow-hidden flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]}, ${theme.gradient[2]})`,
                    }}
                  >
                    {/* Simulated ruled lines */}
                    <div className="absolute inset-0 flex flex-col justify-around opacity-30 py-1">
                      <div className="h-px bg-white" />
                      <div className="h-px bg-white" />
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#E8C468] text-[#182821] flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#F5F1E6] truncate flex items-center gap-1.5">
                      {theme.name}
                    </div>
                    <div className="text-[11px] text-[#F5F1E6]/55 truncate">
                      {theme.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Primary Chalk Color */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E8C468]" />
              Primary Chalk Color
            </label>
            <span className="text-[11px] text-[#F5F1E6]/50">
              Selected: <strong className="text-[#F5F1E6]" style={{ color: activeChalkColor }}>{activeChalkObj.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {CHALK_COLORS.map((color) => {
              const isSelected = activeChalkColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.id}
                  id={`chalkColor-${color.id}`}
                  onClick={() => onSelectChalkColor(color.hex)}
                  className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-[#E8C468] bg-[#2A3540] shadow-md scale-105'
                      : 'border-[#F5F1E6]/10 bg-[#161C22]/80 hover:bg-[#202830] hover:border-[#F5F1E6]/25'
                  }`}
                  title={`${color.name} (${color.label})`}
                >
                  <div
                    className="w-7 h-7 rounded-full shadow-md flex items-center justify-center border border-white/20 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <Check
                        className="w-4 h-4 stroke-[3]"
                        style={{ color: ['#F5F1E6', '#E8C468', '#CCFF90', '#FFB74D'].includes(color.hex) ? '#182821' : '#FFFFFF' }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-[#F5F1E6]/70 truncate max-w-full font-medium">
                    {color.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Preview Sample Box */}
        <div
          className="p-4 rounded-2xl border border-[#F5F1E6]/15 shadow-inner flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${currentBoardTheme.gradient[0]}, ${currentBoardTheme.gradient[1]}, ${currentBoardTheme.gradient[2]})`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded-full shadow"
              style={{ backgroundColor: activeChalkColor }}
            />
            <span
              className="font-hand text-xl font-bold tracking-wide"
              style={{ color: activeChalkColor }}
            >
              f(x) = x² + 2x + 1 = 0
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#F5F1E6]/40">
            Live Preview
          </span>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F5F1E6]/10">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl text-xs text-[#F5F1E6]/60 hover:text-[#F5F1E6] hover:bg-[#2A343D] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            id="doneColorSettingsBtn"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            Apply & Practice
          </button>
        </div>
      </div>
    </div>
  );
}
