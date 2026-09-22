import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Pencil, 
  Mic, 
  MicOff, 
  ArrowRight, 
  HelpCircle, 
  Lightbulb, 
  AlertTriangle, 
  Layers, 
  BookOpen, 
  Copy, 
  Check, 
  RefreshCw,
  Zap,
  Play
} from 'lucide-react';
import { MathProblemSolution, AutoDrawResult, AdaptiveStudentProfile } from '../types';

interface MathSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoDrawSolution?: (result: AutoDrawResult) => void;
  onSetPracticeQuestion?: (topic: string, question: string) => void;
  activeQuestion?: string;
  topic?: string;
  getCanvasSnapshot?: () => string | null;
  studentProfile?: AdaptiveStudentProfile;
  initialProblem?: string;
}

const SAMPLE_MATH_PROBLEMS = [
  { label: 'Quadratic Equation', text: 'Solve for x: 2x² - 8x + 6 = 0' },
  { label: 'Calculus Derivative', text: 'Find the derivative of f(x) = x³ · sin(2x)' },
  { label: 'Definite Integral', text: 'Evaluate the integral: ∫ from 0 to 2 of (3x² + 2x) dx' },
  { label: 'Trig Identity', text: 'Simplify: (sin(x) / cos(x)) + (cos(x) / sin(x))' },
  { label: 'System of Equations', text: 'Solve the system: 3x + 2y = 16 and 2x - y = 6' },
  { label: 'Word Problem', text: 'A rectangle has a perimeter of 40 cm. The length is 4 cm longer than twice the width. Find its dimensions.' },
];

export default function MathSolverModal({
  isOpen,
  onClose,
  onAutoDrawSolution,
  onSetPracticeQuestion,
  activeQuestion,
  topic,
  getCanvasSnapshot,
  studentProfile,
  initialProblem = '',
}: MathSolverModalProps) {
  const [problemInput, setProblemInput] = useState(initialProblem || activeQuestion || '');
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<MathProblemSolution | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMicListening, setIsMicListening] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<'steps' | 'formulas' | 'alternative'>('steps');

  if (!isOpen) return null;

  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isMicListening) {
      setIsMicListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsMicListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setProblemInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => setIsMicListening(false);
    recognition.onend = () => setIsMicListening(false);

    recognition.start();
  };

  const handleSolve = async (useCanvas = false, problemOverride?: string) => {
    const textToSolve = problemOverride !== undefined ? problemOverride : problemInput;
    
    let canvasBase64: string | undefined;
    if (useCanvas && getCanvasSnapshot) {
      const snapshot = getCanvasSnapshot();
      if (snapshot) {
        canvasBase64 = snapshot;
      }
    }

    if (!textToSolve.trim() && !canvasBase64) {
      setErrorMsg('Please enter a math problem or use the chalkboard drawing.');
      return;
    }

    setIsSolving(true);
    setErrorMsg(null);
    setSolution(null);

    try {
      const res = await fetch('/api/solve-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: textToSolve.trim(),
          imageBase64: canvasBase64,
          topic: topic || 'Mathematics',
          studentProfile,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to solve math problem.');
      }

      const data: MathProblemSolution = await res.json();
      setSolution(data);
      if (data.problem && !problemInput) {
        setProblemInput(data.problem);
      }
    } catch (err: any) {
      console.error('Error solving math problem:', err);
      setErrorMsg(err.message || 'Could not solve the problem. Please check your internet or try another problem.');
    } finally {
      setIsSolving(false);
    }
  };

  const handleDrawOnChalkboard = () => {
    if (!solution || !onAutoDrawSolution) return;

    const autoDrawObj: AutoDrawResult = {
      title: `Solution: ${solution.problem.slice(0, 32)}…`,
      description: solution.summary || `Step-by-step solution to ${solution.problem}`,
      category: solution.domain || 'Mathematics',
      educationalInsight: `Final Verified Answer: ${solution.finalAnswer}`,
      stepNotes: solution.steps.map((s) => `Step ${s.stepNumber}: ${s.title} (${s.mathExpression})`),
      strokes: solution.chalkboardStrokes || [],
    };

    onAutoDrawSolution(autoDrawObj);
    onClose();
  };

  const handlePracticeSimilar = () => {
    if (!solution?.similarPracticeQuestion || !onSetPracticeQuestion) return;
    onSetPracticeQuestion(solution.domain || topic || 'Mathematics', solution.similarPracticeQuestion);
    onClose();
  };

  const handleCopyAnswer = () => {
    if (!solution?.finalAnswer) return;
    navigator.clipboard.writeText(solution.finalAnswer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        id="mathSolverModalContainer"
        className="bg-[#182821] border border-[#F5F1E6]/20 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F5F1E6]/10 flex items-center justify-between bg-[#1C2B24] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8C468]/20 border border-[#E8C468]/40 flex items-center justify-center text-[#E8C468] shadow-inner">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-hand text-2xl text-[#E8C468] font-bold">
                  AI Math Problem Solver
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#81D4FA]/20 text-[#81D4FA] font-mono font-bold uppercase tracking-wider">
                  Step-by-Step
                </span>
              </div>
              <p className="text-xs text-[#F5F1E6]/60">
                Type, speak, or select chalkboard math to see complete derivations and draw them onto the slate
              </p>
            </div>
          </div>

          <button
            id="closeMathSolverBtn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#F5F1E6]/50 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
            title="Close Math Solver"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Problem Input Section */}
          <div className="bg-[#1C2B24] border border-[#F5F1E6]/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="mathProblemInput" className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" />
                <span>Enter Math Problem or Equation:</span>
              </label>

              {getCanvasSnapshot && (
                <button
                  id="solveFromBoardBtn"
                  onClick={() => handleSolve(true)}
                  disabled={isSolving}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#81D4FA]/15 hover:bg-[#81D4FA]/25 text-[#81D4FA] border border-[#81D4FA]/30 flex items-center gap-1.5 transition-all"
                  title="Read handwritten math currently drawn on the slate"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Solve From Blackboard</span>
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                id="mathProblemInput"
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSolve(false);
                  }
                }}
                placeholder="e.g. Solve for x: 3x² - 5x + 2 = 0, or Find derivative of f(x) = cos(2x)/x..."
                rows={3}
                className="w-full bg-[#14231C] border border-[#F5F1E6]/15 rounded-xl p-3 pr-10 text-sm text-[#F5F1E6] placeholder-[#F5F1E6]/40 focus:outline-none focus:border-[#E8C468] transition-colors resize-none font-mono"
              />
              <button
                id="mathVoiceMicBtn"
                onClick={toggleMic}
                className={`absolute right-2.5 top-2.5 p-2 rounded-lg transition-all ${
                  isMicListening
                    ? 'bg-[#E2725B] text-white animate-pulse'
                    : 'text-[#F5F1E6]/50 hover:text-[#F5F1E6] hover:bg-[#213A30]'
                }`}
                title={isMicListening ? 'Listening...' : 'Voice Dictate Math Problem'}
              >
                {isMicListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick Samples Pills */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-[#F5F1E6]/50">Or try a sample problem:</div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_MATH_PROBLEMS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setProblemInput(sample.text);
                      handleSolve(false, sample.text);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6]/80 hover:text-[#E8C468] border border-[#F5F1E6]/10 text-xs transition-colors flex items-center gap-1"
                  >
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#F5F1E6]/40">
                Press Ctrl+Enter to solve
              </span>
              <button
                id="submitSolveMathBtn"
                onClick={() => handleSolve(false)}
                disabled={isSolving || !problemInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] font-bold text-xs sm:text-sm shadow-lg shadow-[#E8C468]/20 flex items-center gap-2 transition-all disabled:opacity-40"
              >
                <Sparkles className={`w-4 h-4 ${isSolving ? 'animate-spin' : ''}`} />
                <span>{isSolving ? 'Solving with AI…' : 'Solve Step-by-Step'}</span>
              </button>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="bg-[#E2725B]/15 border border-[#E2725B]/40 p-4 rounded-2xl text-xs text-[#E2725B] flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Loading Indicator */}
          {isSolving && (
            <div className="bg-[#1C2B24] border border-[#E8C468]/20 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-[#E8C468]/20 flex items-center justify-center text-[#E8C468] animate-bounce">
                <Calculator className="w-6 h-6" />
              </div>
              <div className="font-hand text-2xl text-[#E8C468] font-bold">Deriving Mathematical Steps…</div>
              <p className="text-xs text-[#F5F1E6]/70 max-w-sm">
                Gemini is verifying formulas, calculating exact step derivations, and generating chalkboard strokes.
              </p>
            </div>
          )}

          {/* Solution Display */}
          {solution && !isSolving && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Highlighted Final Answer Banner */}
              <div className="bg-gradient-to-r from-[#2A473B] via-[#213A30] to-[#1C2B24] border-2 border-[#E8C468]/50 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E8C468] text-[#182821] px-2 py-0.5 rounded font-mono">
                      {solution.domain} Verified
                    </span>
                    <span className="text-xs text-[#F5F1E6]/60">Final Verified Result:</span>
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#E8C468] tracking-wide break-all">
                    {solution.finalAnswer}
                  </div>
                  <p className="text-xs text-[#F5F1E6]/80 leading-relaxed pt-1">
                    {solution.summary}
                  </p>
                </div>

                <div className="flex sm:flex-col items-stretch gap-2 shrink-0">
                  <button
                    onClick={handleCopyAnswer}
                    className="px-3.5 py-2 rounded-xl bg-[#182821] hover:bg-[#253D32] text-[#F5F1E6] border border-[#F5F1E6]/15 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    title="Copy final answer text"
                  >
                    {copiedAnswer ? <Check className="w-3.5 h-3.5 text-[#8FBF8A]" /> : <Copy className="w-3.5 h-3.5 text-[#E8C468]" />}
                    <span>{copiedAnswer ? 'Copied!' : 'Copy Answer'}</span>
                  </button>

                  {onAutoDrawSolution && solution.chalkboardStrokes && solution.chalkboardStrokes.length > 0 && (
                    <button
                      id="drawSolutionOnSlateBtn"
                      onClick={handleDrawOnChalkboard}
                      className="px-3.5 py-2 rounded-xl bg-[#81D4FA] hover:bg-[#9ee0fd] text-[#121F19] text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#81D4FA]/20 transition-all hover:scale-[1.02]"
                      title="Animate AI writing this complete step-by-step solution onto the chalkboard"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Draw On Slate</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-[#F5F1E6]/10 pb-2">
                <button
                  onClick={() => setActiveTab('steps')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'steps'
                      ? 'bg-[#E8C468] text-[#182821] shadow-md'
                      : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Step-by-Step Derivation ({solution.steps.length})</span>
                </button>

                {(solution.keyFormulas && solution.keyFormulas.length > 0) && (
                  <button
                    onClick={() => setActiveTab('formulas')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      activeTab === 'formulas'
                        ? 'bg-[#E8C468] text-[#182821] shadow-md'
                        : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Key Formulas & Pitfalls</span>
                  </button>
                )}

                {solution.alternativeMethod && (
                  <button
                    onClick={() => setActiveTab('alternative')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      activeTab === 'alternative'
                        ? 'bg-[#E8C468] text-[#182821] shadow-md'
                        : 'text-[#F5F1E6]/70 hover:text-[#F5F1E6] hover:bg-[#213A30]'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Alternative Method</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Step-by-Step Cards */}
              {activeTab === 'steps' && (
                <div className="space-y-3">
                  {solution.steps.map((step) => (
                    <div 
                      key={step.stepNumber}
                      className="bg-[#1C2B24] border border-[#F5F1E6]/10 rounded-2xl p-4 space-y-2 hover:border-[#E8C468]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#E8C468]/20 text-[#E8C468] font-bold text-xs flex items-center justify-center">
                            {step.stepNumber}
                          </span>
                          <h4 className="font-bold text-sm text-[#F5F1E6]">
                            {step.title}
                          </h4>
                        </div>
                      </div>

                      {/* Math Expression Box */}
                      <div className="bg-[#14231C] border border-[#F5F1E6]/10 rounded-xl p-3 font-mono text-sm sm:text-base text-[#81D4FA] overflow-x-auto">
                        {step.mathExpression}
                      </div>

                      {/* Step Explanation */}
                      <p className="text-xs sm:text-sm text-[#F5F1E6]/80 leading-relaxed">
                        {step.explanation}
                      </p>

                      {/* Step Tip */}
                      {step.tip && (
                        <div className="bg-[#213A30]/60 border-l-2 border-[#8FBF8A] pl-3 py-1 text-[11px] text-[#8FBF8A] flex items-center gap-1.5">
                          <Lightbulb className="w-3 h-3 shrink-0" />
                          <span><strong>Pro Tip:</strong> {step.tip}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Key Formulas & Pitfalls */}
              {activeTab === 'formulas' && (
                <div className="space-y-4">
                  {solution.keyFormulas && solution.keyFormulas.length > 0 && (
                    <div className="bg-[#1C2B24] border border-[#F5F1E6]/10 rounded-2xl p-4 space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>Essential Formulas & Theorems:</span>
                      </div>
                      <div className="space-y-2">
                        {solution.keyFormulas.map((formula, idx) => (
                          <div key={idx} className="bg-[#14231C] p-3 rounded-xl border border-[#F5F1E6]/10 font-mono text-xs text-[#81D4FA]">
                            {formula}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {solution.commonPitfalls && solution.commonPitfalls.length > 0 && (
                    <div className="bg-[#1C2B24] border border-[#F5F1E6]/10 rounded-2xl p-4 space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#E2725B] flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Common Mistakes & Traps to Avoid:</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#F5F1E6]/80 list-disc list-inside">
                        {solution.commonPitfalls.map((pitfall, idx) => (
                          <li key={idx} className="leading-relaxed">{pitfall}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Alternative Method */}
              {activeTab === 'alternative' && solution.alternativeMethod && (
                <div className="bg-[#1C2B24] border border-[#F5F1E6]/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#8FBF8A]/20 text-[#8FBF8A] px-2 py-0.5 rounded font-mono">
                      Alternative Approach
                    </span>
                    <h4 className="font-bold text-sm text-[#F5F1E6]">
                      {solution.alternativeMethod.name}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#F5F1E6]/80 leading-relaxed">
                    {solution.alternativeMethod.explanation}
                  </p>
                  <div className="bg-[#14231C] p-3 rounded-xl border border-[#F5F1E6]/10 font-mono text-xs text-[#E8C468]">
                    <strong>Result:</strong> {solution.alternativeMethod.finalAnswer}
                  </div>
                </div>
              )}

              {/* Similar Practice Problem Suggestion */}
              {solution.similarPracticeQuestion && (
                <div className="bg-[#14231C] border border-[#E8C468]/30 p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>Ready to test your understanding?</span>
                    </div>
                    <p className="text-xs text-[#F5F1E6] font-medium">
                      "{solution.similarPracticeQuestion}"
                    </p>
                  </div>
                  {onSetPracticeQuestion && (
                    <button
                      onClick={handlePracticeSimilar}
                      className="px-3 py-1.5 rounded-xl bg-[#E8C468] hover:bg-[#f0d182] text-[#182821] text-xs font-bold shrink-0 transition-all shadow-md"
                    >
                      Practice on Slate
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#F5F1E6]/10 bg-[#1C2B24] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#F5F1E6]/50">
            Powered by Gemini Multi-step Mathematical Reasoning
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6] text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
