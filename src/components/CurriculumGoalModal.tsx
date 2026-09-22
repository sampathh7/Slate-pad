import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  X, 
  BookOpen, 
  Check, 
  GraduationCap, 
  Target, 
  Mic, 
  MicOff, 
  ArrowRight,
  Layers,
  Award,
  Zap,
  HelpCircle
} from 'lucide-react';
import { 
  GradeLevel, 
  LearningFocusType, 
  AdaptiveQuestionItem, 
  AdaptiveStudentProfile 
} from '../types';

interface CurriculumGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCurriculum: (
    topicTitle: string, 
    overview: string, 
    adaptiveQuestions: AdaptiveQuestionItem[], 
    keyConcepts?: string[]
  ) => void;
  studentProfile?: AdaptiveStudentProfile;
  currentTopic?: string;
}

interface SubjectPreset {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: { name: string; desc: string; sampleGoal: string }[];
}

const SUBJECT_PRESETS: SubjectPreset[] = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: '📐',
    color: '#E8C468',
    topics: [
      { name: 'Elementary Arithmetic & Fractions', desc: 'Fractions, decimals, long division, mental math', sampleGoal: 'Master adding & multiplying fractions with unlike denominators' },
      { name: 'Algebra 1 & 2', desc: 'Linear equations, quadratics, polynomials, factoring', sampleGoal: 'Solve quadratic equations by factoring and using the quadratic formula' },
      { name: 'Geometry & Angles', desc: 'Triangles, circles, area/volume proofs, trigonometry basics', sampleGoal: 'Understand Pythagorean theorem, circle theorems, and polygon angles' },
      { name: 'Trigonometry & Pre-Calculus', desc: 'Unit circle, trig identities, logarithmic functions', sampleGoal: 'Evaluate unit circle values and verify trigonometric identities' },
      { name: 'Calculus (Derivatives & Integrals)', desc: 'Limits, chain rule, integration techniques, optimization', sampleGoal: 'Practice product rule, chain rule, and u-substitution integrals' },
      { name: 'Linear Algebra & Matrices', desc: 'Matrix multiplication, determinants, eigenvalues, vectors', sampleGoal: 'Calculate matrix inverses and determinants of 2x2 and 3x3 matrices' },
      { name: 'Probability & Statistics', desc: 'Combinatorics, normal distributions, standard deviation', sampleGoal: 'Calculate permutations, combinations, and conditional probability' },
    ],
  },
  {
    id: 'science',
    name: 'Science & STEM',
    icon: '🔬',
    color: '#81D4FA',
    topics: [
      { name: 'Physics Mechanics & Motion', desc: 'Kinematics, Newton\'s laws, conservation of energy, friction', sampleGoal: 'Solve kinematic equations for free fall and projectile motion' },
      { name: 'Physics Electricity & Magnetism', desc: 'Circuits, Ohm\'s law, magnetic fields, Coulomb\'s law', sampleGoal: 'Calculate equivalent resistance and current in series/parallel circuits' },
      { name: 'General Chemistry', desc: 'Stoichiometry, balancing chemical equations, periodic trends, pH', sampleGoal: 'Balance redox reactions and calculate molar mass stoichiometry' },
      { name: 'Organic Chemistry', desc: 'Nomenclature, functional groups, reaction mechanisms', sampleGoal: 'Identify functional groups and draw Lewis structures' },
      { name: 'Biology & Genetics', desc: 'Cellular respiration, Punnett squares, DNA replication', sampleGoal: 'Solve Mendelian genetics crosses and pedigree charts' },
    ],
  },
  {
    id: 'test_prep',
    name: 'Test Prep & Contests',
    icon: '🎯',
    color: '#FF8A80',
    topics: [
      { name: 'SAT Math Mastery', desc: 'Heart of algebra, passport to advanced math, problem solving', sampleGoal: 'Target top-frequency SAT algebra and data analysis questions' },
      { name: 'ACT Math Review', desc: 'Rapid 60-question drill pacing, geometry, trigonometry', sampleGoal: 'Sharpen time management and formula recall for ACT math' },
      { name: 'AMC & Math Competition', desc: 'Number theory, geometric symmetry, clever algebra tricks', sampleGoal: 'Practice contest-level problem solving with novel angles' },
      { name: 'AP Calculus / Physics Exam', desc: 'Free response questions, multi-part conceptual synthesis', sampleGoal: 'Practice AP free-response style multi-step questions' },
    ],
  },
  {
    id: 'languages',
    name: 'Languages & Writing',
    icon: '🌍',
    color: '#8FBF8A',
    topics: [
      { name: 'Spanish Grammar & Verbs', desc: 'Preterite vs Imperfect, Subjunctive, Por vs Para', sampleGoal: 'Master conjugating regular & irregular verbs in the past tense' },
      { name: 'French Verbs & Conjugation', desc: 'Passé composé, Imparfait, agreement of past participles', sampleGoal: 'Practice French verb conjugations and direct object agreements' },
      { name: 'English Grammar & Syntax', desc: 'Sentence clauses, punctuation, vocabulary, active voice', sampleGoal: 'Identify grammatical clauses and fix misplaced modifiers' },
    ],
  },
];

const GRADE_LEVELS: { id: GradeLevel; title: string; subtitle: string; icon: string }[] = [
  { id: 'elementary', title: 'Elementary', subtitle: 'Grades 1–5 (Visual & Core Basics)', icon: '🌱' },
  { id: 'middle_school', title: 'Middle School', subtitle: 'Grades 6–8 (Pre-Algebra & Concepts)', icon: '🌿' },
  { id: 'high_school', title: 'High School / AP', subtitle: 'Grades 9–12 (Algebra 2, Calculus, Physics)', icon: '🌳' },
  { id: 'college_advanced', title: 'College / Advanced', subtitle: 'Higher Ed & Competition Level', icon: '🎓' },
];

const FOCUS_TYPES: { id: LearningFocusType; title: string; desc: string; icon: string }[] = [
  { id: 'foundations', title: 'Foundations & Intuition', desc: 'Clear core rules, definitions, and error-free basics', icon: '🧱' },
  { id: 'step_by_step', title: 'Step-by-Step Practice', desc: 'Progressive multi-step problem solving with guided hints', icon: '📝' },
  { id: 'exam_prep', title: 'Exam Speed & Drill', desc: 'Standardized test format, high-frequency questions', icon: '⏱️' },
  { id: 'word_problems', title: 'Word Problems & Real World', desc: 'Translate word scenarios into math/science equations', icon: '📖' },
  { id: 'challenge', title: 'Olympiad & Challenge', desc: 'Clever twists, deep boundary cases, and stretch thinking', icon: '🚀' },
];

export default function CurriculumGoalModal({
  isOpen,
  onClose,
  onApplyCurriculum,
  studentProfile,
  currentTopic = '',
}: CurriculumGoalModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');
  const [selectedTopicName, setSelectedTopicName] = useState<string>(
    SUBJECT_PRESETS[0].topics[1].name
  );
  const [customGoalText, setCustomGoalText] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('high_school');
  const [selectedFocus, setSelectedFocus] = useState<LearningFocusType>('step_by_step');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMicListening, setIsMicListening] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSubject = SUBJECT_PRESETS.find((s) => s.id === selectedSubjectId) || SUBJECT_PRESETS[0];

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
        setCustomGoalText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => setIsMicListening(false);
    recognition.onend = () => setIsMicListening(false);

    recognition.start();
  };

  const handleGenerateCurriculum = async () => {
    const finalTopic = customGoalText.trim() ? customGoalText.trim() : selectedTopicName;
    if (!finalTopic) {
      setErrorMsg('Please select a topic or enter a learning goal.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/custom-learning-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject.name,
          category: currentSubject.id,
          topic: selectedTopicName,
          customGoal: customGoalText.trim(),
          gradeLevel: selectedGrade,
          focusType: selectedFocus,
          questionCount,
          studentProfile,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate curriculum.');
      }

      const data = await res.json();
      onApplyCurriculum(
        data.topicTitle || finalTopic,
        data.overview || `Practice module for ${finalTopic}`,
        data.adaptiveQuestions || [],
        data.keyConcepts || []
      );
      onClose();
    } catch (err: any) {
      console.error('Error generating custom curriculum:', err);
      setErrorMsg(err.message || 'Could not generate curriculum. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        id="curriculumGoalModalContainer"
        className="bg-[#182821] border border-[#F5F1E6]/20 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F5F1E6]/10 flex items-center justify-between bg-[#1C2B24] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8FBF8A]/20 border border-[#8FBF8A]/40 flex items-center justify-center text-[#8FBF8A] shadow-inner">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-hand text-2xl text-[#8FBF8A] font-bold">
                  What Do You Want to Learn?
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8C468]/20 text-[#E8C468] font-mono font-bold uppercase tracking-wider">
                  Personalized Path
                </span>
              </div>
              <p className="text-xs text-[#F5F1E6]/60">
                Choose any subject, set your grade & focus goal, and the AI will construct a tailored practice sequence for your slate.
              </p>
            </div>
          </div>

          <button
            id="closeCurriculumModalBtn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#F5F1E6]/50 hover:text-[#F5F1E6] hover:bg-[#213A30] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Step 1: Subject Category Picker */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8FBF8A] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#8FBF8A]/20 text-[#8FBF8A] flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Select Learning Subject</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SUBJECT_PRESETS.map((subj) => (
                <button
                  key={subj.id}
                  onClick={() => {
                    setSelectedSubjectId(subj.id);
                    setSelectedTopicName(subj.topics[0].name);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    selectedSubjectId === subj.id
                      ? 'bg-[#253D32] border-[#8FBF8A] shadow-md shadow-[#8FBF8A]/10 scale-[1.02]'
                      : 'bg-[#1C2B24] border-[#F5F1E6]/10 hover:border-[#F5F1E6]/25 hover:bg-[#213A30]'
                  }`}
                >
                  <div className="text-2xl">{subj.icon}</div>
                  <div>
                    <div className={`font-bold text-xs sm:text-sm ${selectedSubjectId === subj.id ? 'text-[#8FBF8A]' : 'text-[#F5F1E6]'}`}>
                      {subj.name}
                    </div>
                    <div className="text-[10px] text-[#F5F1E6]/50 line-clamp-1">
                      {subj.topics.length} topics
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Topic Selection or Custom Goal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E8C468] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#E8C468]/20 text-[#E8C468] flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Choose Topic or Describe Your Specific Goal</span>
              </span>
            </div>

            {/* Topic Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentSubject.topics.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedTopicName(t.name);
                    setCustomGoalText('');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTopicName === t.name && !customGoalText
                      ? 'bg-[#2A473B] border-[#E8C468] shadow-sm'
                      : 'bg-[#1C2B24] border-[#F5F1E6]/10 hover:bg-[#213A30] hover:border-[#F5F1E6]/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-xs sm:text-sm text-[#F5F1E6]">
                      {t.name}
                    </div>
                    {selectedTopicName === t.name && !customGoalText && (
                      <Check className="w-4 h-4 text-[#E8C468] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#F5F1E6]/60 line-clamp-1 mt-0.5">
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Custom Learning Goal Free-text Input */}
            <div className="bg-[#14231C] border border-[#F5F1E6]/15 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="customGoalInput" className="text-xs font-semibold text-[#F5F1E6]/80 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#E8C468]" />
                  <span>Or type a custom learning request / upcoming exam topic:</span>
                </label>
                <button
                  onClick={toggleMic}
                  className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                    isMicListening
                      ? 'bg-[#E2725B] text-white animate-pulse'
                      : 'bg-[#213A30] text-[#F5F1E6]/70 hover:text-[#F5F1E6]'
                  }`}
                  title="Voice dictation"
                >
                  {isMicListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  <span>{isMicListening ? 'Listening…' : 'Voice Input'}</span>
                </button>
              </div>

              <input
                id="customGoalInput"
                type="text"
                value={customGoalText}
                onChange={(e) => setCustomGoalText(e.target.value)}
                placeholder={`e.g. "I want practice on finding limits with L'Hopital's rule" or "Quadratic factoring drills"`}
                className="w-full bg-[#1C2B24] border border-[#F5F1E6]/15 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#F5F1E6] placeholder-[#F5F1E6]/40 focus:outline-none focus:border-[#E8C468] transition-colors"
              />
            </div>
          </div>

          {/* Step 3: Grade Level & Pedagogical Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Grade Level Selector */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#81D4FA] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#81D4FA]/20 text-[#81D4FA] flex items-center justify-center text-[10px] font-bold">3</span>
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Grade / Experience Level</span>
              </span>

              <div className="space-y-1.5">
                {GRADE_LEVELS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrade(g.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedGrade === g.id
                        ? 'bg-[#1F3A4B] border-[#81D4FA] shadow-sm'
                        : 'bg-[#1C2B24] border-[#F5F1E6]/10 hover:bg-[#213A30]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{g.icon}</span>
                      <div>
                        <div className="font-bold text-xs text-[#F5F1E6]">{g.title}</div>
                        <div className="text-[10px] text-[#F5F1E6]/60">{g.subtitle}</div>
                      </div>
                    </div>
                    {selectedGrade === g.id && <Check className="w-4 h-4 text-[#81D4FA]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Pedagogical Focus Selector */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF8A80] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#FF8A80]/20 text-[#FF8A80] flex items-center justify-center text-[10px] font-bold">4</span>
                <Zap className="w-3.5 h-3.5" />
                <span>Practice Objective</span>
              </span>

              <div className="space-y-1.5">
                {FOCUS_TYPES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFocus(f.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedFocus === f.id
                        ? 'bg-[#3A242B] border-[#FF8A80] shadow-sm'
                        : 'bg-[#1C2B24] border-[#F5F1E6]/10 hover:bg-[#213A30]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{f.icon}</span>
                      <div>
                        <div className="font-bold text-xs text-[#F5F1E6]">{f.title}</div>
                        <div className="text-[10px] text-[#F5F1E6]/60">{f.desc}</div>
                      </div>
                    </div>
                    {selectedFocus === f.id && <Check className="w-4 h-4 text-[#FF8A80]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drill Count Options */}
          <div className="bg-[#1C2B24] border border-[#F5F1E6]/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#F5F1E6]">
                Target Questions in Session:
              </div>
              <div className="text-[11px] text-[#F5F1E6]/60">
                AI will calibrate each question's difficulty step-by-step
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[3, 4, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    questionCount === num
                      ? 'bg-[#E8C468] text-[#182821] border-[#E8C468] shadow-md'
                      : 'bg-[#14231C] text-[#F5F1E6]/70 border-[#F5F1E6]/15 hover:text-[#F5F1E6]'
                  }`}
                >
                  {num} Drills
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-[#E2725B]/15 border border-[#E2725B]/40 p-3.5 rounded-2xl text-xs text-[#E2725B] font-medium">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 border-t border-[#F5F1E6]/10 bg-[#1C2B24] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#213A30] hover:bg-[#2A473B] text-[#F5F1E6] text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            id="startCustomCurriculumBtn"
            onClick={handleGenerateCurriculum}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-[#8FBF8A] hover:bg-[#a0d19b] text-[#12231A] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#8FBF8A]/20 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Designing Custom Practice…' : 'Generate & Start Practice'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
