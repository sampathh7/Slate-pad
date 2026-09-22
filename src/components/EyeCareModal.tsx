import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Sun, 
  Moon, 
  Sparkles, 
  Clock, 
  X, 
  Check, 
  Sliders, 
  Heart,
  Timer,
  Info,
  Layers
} from 'lucide-react';
import { EyeCareSettings, EyeCareFilterLevel } from '../types';
import { EYE_CARE_PRESETS, getEyeCareOverlayColor } from '../utils/eyeCare';

interface EyeCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EyeCareSettings;
  onUpdateSettings: (newSettings: EyeCareSettings) => void;
  onTriggerEyeBreak: () => void;
}

export default function EyeCareModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTriggerEyeBreak,
}: EyeCareModalProps) {
  if (!isOpen) return null;

  const handleToggleEnabled = () => {
    onUpdateSettings({
      ...settings,
      enabled: !settings.enabled,
    });
  };

  const handleSelectPreset = (level: EyeCareFilterLevel, warmth: number) => {
    onUpdateSettings({
      ...settings,
      enabled: true,
      filterLevel: level,
      warmthPercent: warmth,
    });
  };

  const handleWarmthSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onUpdateSettings({
      ...settings,
      enabled: true,
      warmthPercent: val,
      filterLevel: 'custom',
    });
  };

  const currentOverlay = getEyeCareOverlayColor(settings.warmthPercent);

  return (
    <div
      id="eyeCareBackdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="eyeCareDialog"
        className="bg-[#1C251F] border-2 border-[#FFC870]/40 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-5 text-[#F5F1E6] relative overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              settings.enabled 
                ? 'bg-[#FFC870] text-[#182821] shadow-lg shadow-[#FFC870]/30 scale-105' 
                : 'bg-[#24332A] text-[#FFC870]/60 border border-[#FFC870]/20'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-hand font-bold text-2xl text-[#FFC870] leading-tight">
                  Child Eye-Care Shield
                </h2>
                {settings.enabled && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FFC870]/20 text-[#FFC870] border border-[#FFC870]/40 text-[10px] font-bold uppercase tracking-wider">
                    Shield Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#F5F1E6]/70">
                Gentle warm spectrum & blue-light filter to protect growing eyes from strain
              </p>
            </div>
          </div>

          <button
            id="closeEyeCareModalBtn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#F5F1E6]/60 hover:text-[#F5F1E6] hover:bg-[#24332A] transition-colors"
            title="Close Eye Care Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Power Card */}
        <div className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
          settings.enabled
            ? 'bg-gradient-to-r from-[#2A3B30] to-[#233329] border-[#FFC870] shadow-md shadow-[#FFC870]/10'
            : 'bg-[#151D18] border-[#F5F1E6]/10'
        }`}>
          <div className="space-y-0.5">
            <div className="font-bold text-sm sm:text-base flex items-center gap-2 text-[#F5F1E6]">
              <span>{settings.enabled ? '🛡️ Eye Protection is ON' : '💤 Eye Protection is OFF'}</span>
            </div>
            <p className="text-xs text-[#F5F1E6]/60">
              {settings.enabled 
                ? 'Softening harsh blue rays, reducing glare, and applying warm optical protection.'
                : 'Turn on to shield your child from harsh screen glare and fatigue.'}
            </p>
          </div>

          <button
            id="masterEyeCareToggleBtn"
            type="button"
            onClick={handleToggleEnabled}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 shrink-0 ${
              settings.enabled
                ? 'bg-[#FFC870] text-[#182821] hover:bg-[#ffd68a]'
                : 'bg-[#2A3C31] text-[#F5F1E6] hover:bg-[#344b3d] border border-[#F5F1E6]/20'
            }`}
          >
            {settings.enabled ? 'Turn OFF' : 'Turn ON Shield'}
          </button>
        </div>

        {/* Preset Modes */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#FFC870] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Protection Warmth Presets
            </span>
            <span className="text-[11px] font-normal text-[#F5F1E6]/50">
              Current: <strong className="text-[#FFC870]">{settings.warmthPercent}% Warmth</strong>
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {EYE_CARE_PRESETS.map((preset) => {
              const isSelected = settings.enabled && settings.filterLevel === preset.level;
              return (
                <button
                  key={preset.level}
                  id={`eyeCarePreset-${preset.level}`}
                  type="button"
                  onClick={() => handleSelectPreset(preset.level, preset.warmth)}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between group ${
                    isSelected
                      ? 'border-[#FFC870] bg-[#2D3E32] shadow-lg shadow-black/30 scale-[1.02]'
                      : 'border-[#F5F1E6]/10 bg-[#17201A] hover:bg-[#202C24] hover:border-[#F5F1E6]/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#F5F1E6]">
                      <span className="text-base">{preset.icon}</span>
                      <span>{preset.label}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111713] text-[#FFC870] border border-[#FFC870]/20 font-bold">
                      {preset.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#F5F1E6]/65 leading-tight mb-2">
                    {preset.description}
                  </p>

                  <div className="text-[9px] text-[#8FBF8A] font-semibold border-t border-[#F5F1E6]/10 pt-1.5">
                    {preset.recommendedFor}
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#FFC870] text-[#182821] flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Warmth Intensity Slider */}
        <div className="bg-[#162019] p-3.5 rounded-2xl border border-[#F5F1E6]/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#F5F1E6] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#FFC870]" />
              <span>Blue-Light Filter Warmth</span>
            </label>
            <span className="text-xs font-mono font-bold text-[#FFC870]">
              {settings.warmthPercent}% Amber Warmth
            </span>
          </div>

          <input
            id="eyeCareWarmthSlider"
            type="range"
            min="10"
            max="80"
            step="5"
            value={settings.warmthPercent}
            onChange={handleWarmthSliderChange}
            className="w-full accent-[#FFC870] cursor-pointer h-2 bg-[#25352A] rounded-lg"
          />

          <div className="flex items-center justify-between text-[10px] text-[#F5F1E6]/40 font-mono">
            <span>10% (Subtle Day Tint)</span>
            <span>45% (Balanced Eye Comfort)</span>
            <span>80% (Cozy Bedtime Shield)</span>
          </div>
        </div>

        {/* Pediatric Optical Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Soften Stark White Chalk */}
          <div 
            onClick={() => onUpdateSettings({ ...settings, softenChalkGlance: !settings.softenChalkGlance })}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
              settings.softenChalkGlance 
                ? 'bg-[#223328] border-[#FFC870]/60' 
                : 'bg-[#151D18] border-[#F5F1E6]/10 opacity-70'
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
              settings.softenChalkGlance ? 'bg-[#FFC870] text-[#182821]' : 'border border-[#F5F1E6]/30'
            }`}>
              {settings.softenChalkGlance && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div>
              <div className="text-xs font-bold text-[#F5F1E6]">Soften Stark White Chalk</div>
              <p className="text-[10px] text-[#F5F1E6]/60 leading-tight mt-0.5">
                Converts blinding white chalk into gentle milk-cream tone to prevent glare.
              </p>
            </div>
          </div>

          {/* 20-20-20 Rule Timer */}
          <div 
            onClick={() => onUpdateSettings({ ...settings, breakReminder202020: !settings.breakReminder202020 })}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
              settings.breakReminder202020 
                ? 'bg-[#223328] border-[#FFC870]/60' 
                : 'bg-[#151D18] border-[#F5F1E6]/10 opacity-70'
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
              settings.breakReminder202020 ? 'bg-[#FFC870] text-[#182821]' : 'border border-[#F5F1E6]/30'
            }`}>
              {settings.breakReminder202020 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div>
              <div className="text-xs font-bold text-[#F5F1E6]">20-20-20 Eye Break Alerts</div>
              <p className="text-[10px] text-[#F5F1E6]/60 leading-tight mt-0.5">
                Optometrist rule: Every 20 mins, look 20 feet away for 20 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Instant 20-Second Eye Break Button */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1D2B22] to-[#25382D] border border-[#8FBF8A]/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#8FBF8A]/20 text-[#8FBF8A] flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#8FBF8A]">Quick Eye Relax Break</div>
              <p className="text-[10px] text-[#F5F1E6]/60 truncate">
                Rest growing eyes with a 20-second distant gaze animation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onTriggerEyeBreak();
            }}
            className="px-3.5 py-2 rounded-xl bg-[#8FBF8A] hover:bg-[#a2d49d] text-[#182821] font-bold text-xs shrink-0 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Rest Eyes (20s)</span>
          </button>
        </div>

        {/* Optometry Tips for Parents */}
        <div className="text-[11px] text-[#F5F1E6]/50 bg-[#121814] p-3 rounded-xl border border-[#F5F1E6]/5 space-y-1">
          <div className="font-bold text-[#FFC870]/80 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Optometrist Guidelines for Screen Study</span>
          </div>
          <p>
            Keep screen 40–50 cm away from eyes, use soft ambient room lighting (avoid dark rooms), and encourage regular blinking.
          </p>
        </div>

        {/* Bottom Done Action */}
        <div className="flex items-center justify-end pt-2 border-t border-[#F5F1E6]/10">
          <button
            id="doneEyeCareSettingsBtn"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#FFC870] hover:bg-[#ffd68a] text-[#182821] font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            Apply Eye Protection
          </button>
        </div>
      </div>
    </div>
  );
}
