import React, { useState } from 'react';
import { 
  X, 
  ScanLine, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Calculator, 
  Wand2, 
  Sparkles, 
  SpellCheck, 
  RotateCw, 
  Shapes, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Lightbulb,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  HandwritingIdentificationResult, 
  RecognitionMode, 
  ChildAgeBracket,
  AutoDrawStroke 
} from '../types';

interface HandwritingIdentifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: HandwritingIdentificationResult | null;
  isScanning: boolean;
  canvasSnapshotUrl: string | null;
  onRescan: (mode: RecognitionMode) => void;
  onNeatenOnSlate: (strokes: AutoDrawStroke[]) => void;
  onSolveMathProblem: (expression: string) => void;
  ageBracket?: ChildAgeBracket;
}

export default function HandwritingIdentifierModal({
  isOpen,
  onClose,
  result,
  isScanning,
  canvasSnapshotUrl,
  onRescan,
  onNeatenOnSlate,
  onSolveMathProblem,
  ageBracket = '8-9',
}: HandwritingIdentifierModalProps) {
  const [activeTab, setActiveTab] = useState<'transcription' | 'math' | 'penmanship' | 'spelling'>('transcription');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [viewFormatted, setViewFormatted] = useState(true);
  const [selectedScanMode, setSelectedScanMode] = useState<RecognitionMode>('all');

  if (!isOpen) return null;

  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getLegibilityColor = (score: number) => {
    if (score >= 85) return 'text-[#8FBF8A] border-[#8FBF8A]/40 bg-[#8FBF8A]/10';
    if (score >= 70) return 'text-[#E8C468] border-[#E8C468]/40 bg-[#E8C468]/10';
    return 'text-[#FF8A80] border-[#FF8A80]/40 bg-[#FF8A80]/10';
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'math_equation':
        return { label: 'Math & Equations', color: 'text-[#81D4FA] bg-[#81D4FA]/15 border-[#81D4FA]/30' };
      case 'text_notes':
        return { label: 'Text & Notes', color: 'text-[#E8C468] bg-[#E8C468]/15 border-[#E8C468]/30' };
      case 'spelling_words':
        return { label: 'Spelling & Vocab', color: 'text-[#8FBF8A] bg-[#8FBF8A]/15 border-[#8FBF8A]/30' };
      case 'diagram_sketch':
        return { label: 'Diagram / Shapes', color: 'text-[#CE93D8] bg-[#CE93D8]/15 border-[#CE93D8]/30' };
      default:
        return { label: 'Handwriting Mix', color: 'text-[#F5F1E6] bg-[#F5F1E6]/15 border-[#F5F1E6]/30' };
    }
  };

  const displayedText = result 
    ? (viewFormatted ? (result.formattedText || result.transcription) : result.transcription)
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="handwritingIdentifierModal"
        className="bg-[#182821] border border-[#F5F1E6]/15 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#F5F1E6]/10 flex items-center justify-between bg-[#14231C]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#81D4FA]/15 border border-[#81D4FA]/30 flex items-center justify-center text-[#81D4FA] shadow-md">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-hand text-[#F5F1E6] tracking-wide">
                  Handwriting Identifier
                </h2>
                {result && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(result.category).color}`}>
                    {getCategoryBadge(result.category).label}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#F5F1E6]/60">
                AI Vision OCR • Math Formula Extraction • Penmanship & Legibility Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRescan(selectedScanMode)}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#E8C468] border border-[#E8C468]/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Rescan current chalkboard writing"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isScanning ? 'Scanning…' : 'Re-Scan Slate'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#F5F1E6]/60 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scan Mode Filter Selector */}
        <div className="px-4 py-2 bg-[#121E18] border-b border-[#F5F1E6]/10 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#F5F1E6]/60 shrink-0">
            <span>Recognition Focus:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all' as RecognitionMode, label: 'Everything' },
              { id: 'math' as RecognitionMode, label: 'Math Only' },
              { id: 'text' as RecognitionMode, label: 'Words & Notes' },
              { id: 'shapes' as RecognitionMode, label: 'Shapes & Sketches' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedScanMode(m.id);
                  onRescan(m.id);
                }}
                disabled={isScanning}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedScanMode === m.id
                    ? 'bg-[#E8C468] text-[#182821] font-bold shadow-sm'
                    : 'text-[#F5F1E6]/70 hover:bg-[#213A30] hover:text-[#F5F1E6]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {isScanning ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#81D4FA]/20 border-t-[#81D4FA] animate-spin" />
                <ScanLine className="w-7 h-7 text-[#81D4FA] absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-hand text-2xl text-[#F5F1E6] font-bold">Scanning Chalkboard Strokes…</h3>
                <p className="text-xs text-[#F5F1E6]/60 max-w-sm">
                  Gemini AI Vision is inspecting character strokes, extracting math expressions, and assessing handwriting legibility.
                </p>
              </div>
            </div>
          ) : !result ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#213A30] border border-[#F5F1E6]/10 flex items-center justify-center text-[#E8C468] mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-hand text-2xl text-[#F5F1E6] font-bold">No Handwriting Scanned Yet</h3>
              <p className="text-xs text-[#F5F1E6]/60 max-w-sm mx-auto">
                Write notes, calculations, or sentences on the chalkboard, then click "Identify Handwriting" to analyze your penmanship and convert it to clean text.
              </p>
              <button
                onClick={() => onRescan(selectedScanMode)}
                className="px-4 py-2 rounded-xl bg-[#E8C468] text-[#182821] font-bold text-xs shadow-lg hover:bg-[#f0d182] transition-colors"
              >
                Scan Slate Now
              </button>
            </div>
          ) : (
            <>
              {/* Top Overview Badges & Snapshot Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Legibility Score */}
                <div className="bg-[#1C2B24] border border-[#F5F1E6]/10 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${getLegibilityColor(result.legibilityScore)}`}>
                    <span className="text-base font-bold font-mono leading-none">{result.legibilityScore}</span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">Score</span>
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5F1E6]/50">Penmanship</span>
                    <p className="text-xs font-semibold text-[#F5F1E6] truncate" title={result.legibilitySummary}>
                      {result.legibilityScore >= 85 ? '🌟 Excellent Clarity' : result.legibilityScore >= 70 ? '👍 Clear Handwriting' : '✏️ Developing Penmanship'}
                    </p>
                    <span className="text-[10px] text-[#8FBF8A] font-medium">Confidence: {result.confidenceScore}%</span>
                  </div>
                </div>

                {/* Detected Category & Elements */}
                <div className="bg-[#1C2B24] border border-[#F5F1E6]/10 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#81D4FA]/10 border border-[#81D4FA]/30 flex items-center justify-center text-[#81D4FA] shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5F1E6]/50">Detected Elements</span>
                    <p className="text-xs font-semibold text-[#F5F1E6]">
                      {result.detectedElements?.length || 1} distinct item{result.detectedElements?.length === 1 ? '' : 's'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#F5F1E6]/60">
                      {result.mathFormulas?.length > 0 && <span>{result.mathFormulas.length} Math Eq</span>}
                      {result.spellingGrammarIssues?.length > 0 && <span>• {result.spellingGrammarIssues.length} Spell Check</span>}
                    </div>
                  </div>
                </div>

                {/* Slate Snapshot Thumbnail */}
                <div className="bg-[#1C2B24] border border-[#F5F1E6]/10 p-3.5 rounded-2xl flex items-center gap-3">
                  {canvasSnapshotUrl ? (
                    <img 
                      src={canvasSnapshotUrl} 
                      alt="Chalkboard Snapshot" 
                      className="w-12 h-12 rounded-xl object-cover border border-[#F5F1E6]/20 bg-[#121F19] shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#14231C] border border-[#F5F1E6]/10 flex items-center justify-center text-[#E8C468] shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5F1E6]/50">Source Canvas</span>
                    <p className="text-xs font-semibold text-[#F5F1E6]">Slate Chalkboard</p>
                    <span className="text-[10px] text-[#E8C468]">
                      Age: {ageBracket} yr
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-[#F5F1E6]/10 pb-2">
                <button
                  onClick={() => setActiveTab('transcription')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'transcription'
                      ? 'bg-[#E8C468] text-[#182821] shadow-sm'
                      : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Transcribed Text</span>
                </button>

                {result.mathFormulas && result.mathFormulas.length > 0 && (
                  <button
                    onClick={() => setActiveTab('math')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'math'
                        ? 'bg-[#81D4FA] text-[#121F19] shadow-sm'
                        : 'text-[#81D4FA] hover:bg-[#213A30]'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Math ({result.mathFormulas.length})</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('penmanship')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'penmanship'
                      ? 'bg-[#8FBF8A] text-[#182821] shadow-sm'
                      : 'text-[#8FBF8A] hover:bg-[#213A30]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Penmanship Guide</span>
                </button>

                {result.spellingGrammarIssues && result.spellingGrammarIssues.length > 0 && (
                  <button
                    onClick={() => setActiveTab('spelling')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'spelling'
                        ? 'bg-[#FF8A80] text-[#182821] shadow-sm'
                        : 'text-[#FF8A80] hover:bg-[#213A30]'
                    }`}
                  >
                    <SpellCheck className="w-3.5 h-3.5" />
                    <span>Spelling ({result.spellingGrammarIssues.length})</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Primary Transcribed Text */}
              {activeTab === 'transcription' && (
                <div className="space-y-4">
                  {/* Clean Transcribed Chalkboard Card */}
                  <div className="bg-[#14231C] border border-[#F5F1E6]/15 rounded-2xl p-4 sm:p-5 relative shadow-inner space-y-3">
                    <div className="flex items-center justify-between border-b border-[#F5F1E6]/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#E8C468]">
                          {viewFormatted ? 'Clean Formatted Text' : 'Raw Exact Transcription'}
                        </span>
                        <button
                          onClick={() => setViewFormatted(!viewFormatted)}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#213A30] text-[#F5F1E6]/70 hover:text-[#F5F1E6] transition-colors"
                        >
                          Switch to {viewFormatted ? 'Raw' : 'Clean'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpeak(displayedText)}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            isSpeaking
                              ? 'bg-[#8FBF8A] text-[#182821]'
                              : 'bg-[#213A30] text-[#F5F1E6]/80 hover:text-[#F5F1E6]'
                          }`}
                          title="Read handwriting aloud with text-to-speech"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
                        </button>

                        <button
                          onClick={() => handleCopyText(displayedText)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#213A30] text-[#F5F1E6]/80 hover:text-[#F5F1E6] text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Copy transcribed text"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-[#8FBF8A]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* The Recognized Chalk Text */}
                    <div className="p-4 rounded-xl bg-[#1C2B24] border border-[#F5F1E6]/10 min-h-[100px] flex items-center">
                      <p className="font-mono text-sm sm:text-base text-[#F5F1E6] leading-relaxed whitespace-pre-wrap select-all">
                        {displayedText || 'No text detected in chalkboard image.'}
                      </p>
                    </div>

                    {/* Action Bar: Neaten on Slate & Math Bridge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <p className="text-[11px] text-[#F5F1E6]/50 italic">
                        {result.legibilitySummary}
                      </p>

                      <div className="flex items-center gap-2">
                        {result.chalkboardStrokes && result.chalkboardStrokes.length > 0 && (
                          <button
                            onClick={() => {
                              onNeatenOnSlate(result.chalkboardStrokes!);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#8FBF8A] hover:bg-[#a0cca0] text-[#182821] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                            title="Redraw this handwriting neatly aligned on the chalkboard"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Neaten on Slate</span>
                          </button>
                        )}

                        {result.mathFormulas && result.mathFormulas.length > 0 && (
                          <button
                            onClick={() => {
                              onSolveMathProblem(result.mathFormulas[0].expression);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#81D4FA] hover:bg-[#9ee0ff] text-[#121F19] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                            title="Solve this mathematical equation step-by-step"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Solve with AI</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detected Tokens & Categorized Elements */}
                  {result.detectedElements && result.detectedElements.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#F5F1E6]/60">
                        Identified Tokens & Elements
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.detectedElements.map((el, idx) => (
                          <div
                            key={idx}
                            className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border ${
                              el.type === 'equation'
                                ? 'bg-[#81D4FA]/10 text-[#81D4FA] border-[#81D4FA]/30'
                                : el.type === 'number'
                                ? 'bg-[#E8C468]/10 text-[#E8C468] border-[#E8C468]/30'
                                : el.type === 'shape'
                                ? 'bg-[#CE93D8]/10 text-[#CE93D8] border-[#CE93D8]/30'
                                : 'bg-[#1C2B24] text-[#F5F1E6] border-[#F5F1E6]/10'
                            }`}
                          >
                            <span className="text-[10px] font-mono uppercase opacity-60">
                              {el.type}
                            </span>
                            <span className="font-semibold">{el.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recognized Shapes (if geometry sketch) */}
                  {result.recognizedShapes && result.recognizedShapes.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#1C2B24] border border-[#CE93D8]/20 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#CE93D8]/15 border border-[#CE93D8]/30 flex items-center justify-center text-[#CE93D8] shrink-0">
                        <Shapes className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#CE93D8]">
                          Geometric Figures Identified
                        </span>
                        <p className="text-xs text-[#F5F1E6]">
                          {result.recognizedShapes.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Math & Formulas */}
              {activeTab === 'math' && result.mathFormulas && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#81D4FA]">
                      Identified Mathematical Expressions ({result.mathFormulas.length})
                    </span>
                    <span className="text-[11px] text-[#F5F1E6]/60">
                      Formatted for computation & LaTeX
                    </span>
                  </div>

                  <div className="space-y-3">
                    {result.mathFormulas.map((formula, idx) => (
                      <div
                        key={idx}
                        className="bg-[#14231C] border border-[#81D4FA]/30 rounded-2xl p-4 space-y-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#81D4FA]">
                              Formula {idx + 1}
                            </span>
                            <div className="font-mono text-base sm:text-lg font-bold text-[#F5F1E6] bg-[#1C2B24] px-3 py-2 rounded-xl border border-[#F5F1E6]/10 inline-block">
                              {formula.expression}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onSolveMathProblem(formula.expression);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#81D4FA] hover:bg-[#9ee0ff] text-[#121F19] text-xs font-bold flex items-center gap-1 shadow transition-colors"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                              <span>Solve Step-by-Step</span>
                            </button>
                          </div>
                        </div>

                        {formula.latex && (
                          <div className="flex items-center gap-2 text-xs text-[#F5F1E6]/70 bg-[#1C2B24] p-2 rounded-xl border border-[#F5F1E6]/5">
                            <span className="text-[10px] font-mono text-[#81D4FA] font-bold uppercase">LaTeX:</span>
                            <code className="font-mono text-xs text-[#E8C468] select-all">{formula.latex}</code>
                            <button
                              onClick={() => handleCopyText(formula.latex!)}
                              className="ml-auto text-[10px] font-semibold text-[#81D4FA] hover:underline"
                            >
                              Copy LaTeX
                            </button>
                          </div>
                        )}

                        {formula.calculatedResult && (
                          <div className="p-2.5 rounded-xl bg-[#8FBF8A]/10 border border-[#8FBF8A]/30 flex items-center gap-2 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-[#8FBF8A] shrink-0" />
                            <span className="font-semibold text-[#8FBF8A]">Calculated Result:</span>
                            <span className="font-mono font-bold text-[#F5F1E6]">{formula.calculatedResult}</span>
                          </div>
                        )}

                        {formula.explanation && (
                          <p className="text-xs text-[#F5F1E6]/70 italic">
                            💡 {formula.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Penmanship & Legibility Guide */}
              {activeTab === 'penmanship' && (
                <div className="space-y-4">
                  <div className="bg-[#14231C] border border-[#F5F1E6]/15 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F5F1E6]/10 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#F5F1E6] flex items-center gap-2">
                          <span>Penmanship Assessment for Age {ageBracket}</span>
                        </h4>
                        <p className="text-xs text-[#F5F1E6]/60">
                          {result.legibilitySummary}
                        </p>
                      </div>

                      <div className={`px-3 py-1 rounded-full border text-xs font-bold font-mono ${getLegibilityColor(result.legibilityScore)}`}>
                        {result.legibilityScore}/100 Clarity
                      </div>
                    </div>

                    {/* Visual Meter Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-[#F5F1E6]/70">
                        <span>Chalk Stroke Legibility</span>
                        <span className="font-mono font-bold">{result.legibilityScore}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#1C2B24] rounded-full overflow-hidden border border-[#F5F1E6]/10">
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${
                            result.legibilityScore >= 85
                              ? 'bg-[#8FBF8A]'
                              : result.legibilityScore >= 70
                              ? 'bg-[#E8C468]'
                              : 'bg-[#FF8A80]'
                          }`}
                          style={{ width: `${result.legibilityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Handwriting Tips */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Tips to Make Your Handwriting Shine</span>
                      </span>

                      {result.tipsForPenmanship && result.tipsForPenmanship.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {result.tipsForPenmanship.map((tip, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-[#1C2B24] border border-[#F5F1E6]/10 flex items-start gap-2.5 text-xs text-[#F5F1E6]/90"
                            >
                              <span className="w-5 h-5 rounded-full bg-[#E8C468]/20 text-[#E8C468] font-bold flex items-center justify-center shrink-0 text-[11px]">
                                {idx + 1}
                              </span>
                              <p className="pt-0.5 leading-relaxed">{tip}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#F5F1E6]/60">
                          Great job! Your stroke alignment and letter sizing are well-proportioned.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Spelling & Vocabulary */}
              {activeTab === 'spelling' && result.spellingGrammarIssues && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF8A80]">
                      Spelling & Grammar Observations ({result.spellingGrammarIssues.length})
                    </span>
                    <span className="text-[11px] text-[#F5F1E6]/60">
                      Helpful corrections for young writers
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {result.spellingGrammarIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="bg-[#14231C] border border-[#FF8A80]/30 rounded-2xl p-3.5 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="line-through text-xs font-mono text-[#FF8A80] bg-[#FF8A80]/15 px-2 py-0.5 rounded">
                              {issue.original}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#F5F1E6]/40" />
                            <span className="text-xs font-mono font-bold text-[#8FBF8A] bg-[#8FBF8A]/15 px-2 py-0.5 rounded">
                              {issue.suggested}
                            </span>
                          </div>

                          {issue.ruleOrContext && (
                            <p className="text-xs text-[#F5F1E6]/70 italic pt-0.5">
                              {issue.ruleOrContext}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleSpeak(issue.suggested)}
                          className="p-1.5 rounded-lg bg-[#213A30] text-[#8FBF8A] hover:bg-[#2C4C3F] transition-colors"
                          title="Listen to correct pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-[#F5F1E6]/10 bg-[#14231C]/90 flex items-center justify-between text-xs text-[#F5F1E6]/60">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#8FBF8A]" />
            <span>Gemini Vision OCR Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#213A30] text-[#F5F1E6] hover:bg-[#2A473B] font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
