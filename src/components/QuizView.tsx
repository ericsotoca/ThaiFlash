import React, { useState, useEffect } from 'react';
import { ThaiWord, StudyDirection, WordMastery } from '../types/vocab';
import { speakThai } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Sparkles,
  ArrowRightLeft,
  Flame,
  Heart,
} from 'lucide-react';

interface QuizViewProps {
  words: ThaiWord[];
  direction: StudyDirection;
  onToggleDirection: () => void;
  onUpdateMastery: (wordId: string, status: WordMastery) => void;
  onIncrementQuizStats: (isCorrect: boolean) => void;
}

interface Question {
  word: ThaiWord;
  options: {
    text: string;
    word: ThaiWord;
  }[];
  correctIndex: number;
}

export const QuizView: React.FC<QuizViewProps> = ({
  words,
  direction,
  onToggleDirection,
  onUpdateMastery,
  onIncrementQuizStats,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [incorrectWords, setIncorrectWords] = useState<ThaiWord[]>([]);

  // Generate 10 randomized quiz questions
  const generateQuiz = (customWords: ThaiWord[] = words, count: number = 10) => {
    if (customWords.length < 4) return;
    const shuffled = [...customWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    const newQuestions: Question[] = selected.map((targetWord) => {
      // Find 3 distractors
      const pool = words.filter((w) => w.id !== targetWord.id);
      const distractors = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
      const allChoices = [targetWord, ...distractors].sort(() => 0.5 - Math.random());
      const correctIdx = allChoices.findIndex((c) => c.id === targetWord.id);

      return {
        word: targetWord,
        correctIndex: correctIdx,
        options: allChoices.map((choice) => ({
          text: direction === 'fr-to-th' ? choice.phonetic : choice.french,
          word: choice,
        })),
      };
    });

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setIsQuizComplete(false);
    setIncorrectWords([]);
  };

  useEffect(() => {
    generateQuiz();
  }, [direction]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQ.correctIndex;
    onIncrementQuizStats(isCorrect);

    // Speak Thai word automatically to reinforce audio learning
    speakThai(currentQ.word.thai, 0.75);

    if (isCorrect) {
      setScore((s) => s + 1);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
      onUpdateMastery(currentQ.word.id, 'mastered');
    } else {
      setStreak(0);
      setIncorrectWords((prev) => [...prev, currentQ.word]);
      onUpdateMastery(currentQ.word.id, 'review');
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsQuizComplete(true);
      // Confetti celebration if 70%+ score
      if (score >= Math.ceil(questions.length * 0.7)) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    }
  };

  if (!currentQ && !isQuizComplete) {
    return (
      <div className="py-16 text-center text-slate-500">
        Chargement du quiz...
      </div>
    );
  }

  if (isQuizComplete) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
          <Trophy className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 font-serif-title">
          Session de Quiz Terminée !
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          Votre score de couple sur la prononciation et la compréhension orale :
        </p>

        {/* Score Box */}
        <div className="bg-white rounded-2xl border border-rose-100 p-6 mb-8 shadow-2xs">
          <div className="text-4xl sm:text-5xl font-extrabold text-rose-600 font-mono mb-2">
            {score} / {questions.length}
          </div>
          <div className="text-sm font-semibold text-slate-700 mb-4">
            Aisance à l'oral : <span className="font-mono text-emerald-600">{percentage}%</span>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 border-t border-rose-50 pt-4">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Série Max : <strong className="font-mono text-slate-800">{bestStreak}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Mots Justes : <strong className="font-mono text-slate-800">{score}</strong></span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => generateQuiz()}
            className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refaire un Quiz (10 phrases)</span>
          </button>

          {incorrectWords.length > 0 && (
            <button
              onClick={() => generateQuiz(incorrectWords, incorrectWords.length)}
              className="w-full sm:w-auto px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Travailler mes lacunes ({incorrectWords.length})</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz active view
  const questionPrompt = direction === 'fr-to-th' ? currentQ.word.french : currentQ.word.phonetic;

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-6 py-2 sm:py-6">
      {/* Quiz Top bar: Counter & Streak */}
      <div className="flex flex-wrap items-center justify-between text-3xs sm:text-xs text-slate-500 mb-2 gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-800">
            Question <span className="font-mono tabular-nums">{currentIndex + 1}</span> /{' '}
            <span className="font-mono tabular-nums">{questions.length}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>{currentQ.word.category}</span>
        </div>

        <div className="flex items-center gap-2">
          {streak > 1 && (
            <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-4xs animate-pulse">
              <Flame className="w-2.5 h-2.5 fill-amber-500" />
              <span>Série x{streak} !</span>
            </span>
          )}
          <button
            onClick={onToggleDirection}
            className="text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer text-3xs sm:text-xs"
          >
            <ArrowRightLeft className="w-2.5 h-2.5" />
            <span>{direction === 'fr-to-th' ? 'FR ➔ TH' : 'TH ➔ FR'}</span>
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mb-4 sm:mb-6">
        <div
          className="bg-rose-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-rose-100 p-4 sm:p-8 mb-4 sm:mb-6 shadow-2xs text-center relative overflow-hidden">
        {/* Heart backdrop watermark */}
        <Heart className="absolute -right-6 -bottom-6 w-16 h-16 sm:w-24 sm:h-24 text-rose-50/60 pointer-events-none fill-current" />

        <span className="text-3xs sm:text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1 block relative">
          {direction === 'fr-to-th'
            ? 'Traduisez cette expression pour votre couple :'
            : 'Quelle est la signification de ce mot doux ?'}
        </span>
        <div className="flex items-center justify-center gap-2 mb-1 relative">
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif-title leading-snug">
            {questionPrompt}
          </h2>
          {direction === 'th-to-fr' && (
            <button
              onClick={() => speakThai(currentQ.word.thai, 0.75)}
              className="p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Écouter le mot thaï"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {direction === 'fr-to-th' && (
          <p className="text-4xs sm:text-2xs text-slate-400 italic">
            Trouvez la prononciation correspondante
          </p>
        )}

        {direction === 'th-to-fr' && (
          <p className="text-3xs sm:text-xs font-mono text-rose-600 font-semibold">
            Ton : {currentQ.word.tone} · Parlé par : {currentQ.word.speaker === 'homme' ? 'Lui' : currentQ.word.speaker === 'femme' ? 'Elle' : 'Les deux'}
          </p>
        )}
      </div>

      {/* 4 Answer Choice Buttons */}
      <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {currentQ.options.map((opt, idx) => {
          let btnStyle = 'border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50/30 text-slate-800';

          if (isAnswered) {
            if (idx === currentQ.correctIndex) {
              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200';
            } else if (idx === selectedOption) {
              btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200';
            } else {
              btnStyle = 'border-slate-200 bg-white text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
              className={`w-full py-2.5 px-3.5 sm:py-4 sm:px-5 rounded-xl border text-left font-semibold text-xs sm:text-base transition-all flex items-center justify-between shadow-2xs cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-mono text-3xs sm:text-xs font-bold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt.text}</span>
              </div>

              {isAnswered && idx === currentQ.correctIndex && (
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              )}
              {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                <XCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer feedback reveal card */}
      {isAnswered && (
        <div className="bg-slate-50 rounded-xl border border-rose-100 p-3.5 mb-4 sm:mb-6 transition-all animate-fadeIn">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  {currentQ.word.phonetic}
                </span>
                <button
                  onClick={() => speakThai(currentQ.word.thai, 0.75)}
                  className="p-0.5 rounded-full text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                  title="Écouter la prononciation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-3xs font-serif-title text-slate-400">
                  ({currentQ.word.thai})
                </span>
              </div>
              <p className="text-3xs sm:text-xs text-slate-600 mb-1 leading-normal">
                Signification : <strong className="text-slate-800">{currentQ.word.french}</strong> · Ton <strong className="text-rose-600">{currentQ.word.tone}</strong>
              </p>
              <p className="text-4xs sm:text-2xs text-slate-500 italic bg-rose-50/40 p-1.5 rounded leading-normal border border-rose-100/30">
                💬 « {currentQ.word.examplePhonetic} » — {currentQ.word.exampleFr}
              </p>
            </div>

            <button
              onClick={handleNextQuestion}
              className="shrink-0 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-3xs sm:text-xs transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>{currentIndex + 1 < questions.length ? 'Suivant' : 'Résultats'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
