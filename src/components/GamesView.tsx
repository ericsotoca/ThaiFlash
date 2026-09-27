import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThaiWord } from '../types/vocab';
import { speakThai } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Heart,
  Trophy,
  RotateCcw,
  Gamepad2,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  Volume2,
  ChevronRight,
  Info,
} from 'lucide-react';

interface GamesViewProps {
  words: ThaiWord[];
}

type MiniGame = 'menu' | 'hangman' | 'scramble' | 'speedrun';

export const GamesView: React.FC<GamesViewProps> = ({ words }) => {
  const [activeGame, setActiveGame] = useState<MiniGame>('menu');

  // ==========================================
  // OFFLINE SOUND EFFECTS (Web Audio API Synthesizer)
  // ==========================================
  const playOfflineSound = (type: 'win' | 'fail' | 'click' | 'heartbreak') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'heartbreak') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        // Major chord arpeggio
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
          noteGain.gain.setValueAtTime(0.08, now + idx * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
          
          noteOsc.start(now + idx * 0.08);
          noteOsc.stop(now + idx * 0.08 + 0.3);
        });
      } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (err) {
      // AudioContext fails gracefully if user hasn't interacted, which is fine
    }
  };

  // =========================================================================
  // GAME 1: LE PENDU DE L'AMOUR (Romantic Heart Hangman / Word Guesser)
  // =========================================================================
  const [hangWord, setHangWord] = useState<ThaiWord | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [lives, setLives] = useState(6);
  const [isHangmanWon, setIsHangmanWon] = useState(false);
  const [isHangmanLost, setIsHangmanWonLost] = useState(false);

  const initHangman = useCallback(() => {
    if (words.length === 0) return;
    const selected = words[Math.floor(Math.random() * words.length)];
    setHangWord(selected);
    setGuessedLetters([]);
    setLives(6);
    setIsHangmanWon(false);
    setIsHangmanWonLost(false);
  }, [words]);

  const guessLetter = (char: string) => {
    if (lives <= 0 || isHangmanWon || isHangmanLost || !hangWord) return;
    const letter = char.toLowerCase();
    if (guessedLetters.includes(letter)) return;

    setGuessedLetters((prev) => [...prev, letter]);

    // Check if guess is correct
    // Clean phonetic to allow simple letters guess (e.g. without tone markers if user types standard keys, but we can also match standard characters)
    const cleanPhonetic = hangWord.phonetic.toLowerCase();
    const isCorrect = cleanPhonetic.includes(letter);

    if (isCorrect) {
      playOfflineSound('click');
      // Check if all letters are guessed (ignoring accents, hyphens, and punctuation)
      const allGuessed = cleanPhonetic
        .split('')
        .filter((c) => /[a-z]/.test(c))
        .every((c) => [...guessedLetters, letter].includes(c));

      if (allGuessed) {
        setIsHangmanWon(true);
        playOfflineSound('win');
        speakThai(hangWord.thai, 0.75);
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch (e) {}
      }
    } else {
      playOfflineSound('heartbreak');
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setIsHangmanWonLost(true);
        playOfflineSound('fail');
        speakThai(hangWord.thai, 0.75);
      }
    }
  };

  // =========================================================================
  // GAME 2: LA PHRASE ENCHEVÊTRÉE (Word / Syllable Scramble builder)
  // =========================================================================
  const [scrambleTarget, setScrambleTarget] = useState<ThaiWord | null>(null);
  const [scrambleSyllables, setScrambleSyllables] = useState<{ id: string; text: string }[]>([]);
  const [scrambleAnswer, setScrambleAnswer] = useState<{ id: string; text: string }[]>([]);
  const [isScrambleSuccess, setIsScrambleSuccess] = useState(false);
  const [scrambleErrorCount, setScrambleErrorCount] = useState(0);

  const initScramble = useCallback(() => {
    if (words.length === 0) return;
    const selected = words[Math.floor(Math.random() * words.length)];
    setScrambleTarget(selected);
    setScrambleAnswer([]);
    setIsScrambleSuccess(false);
    setScrambleErrorCount(0);

    // Split phonetic into words/syllables (usually separated by spaces or hyphens)
    // E.g. "khít-thǔenɡ caŋ" -> ["khít", "thǔenɡ", "caŋ"]
    const items = selected.phonetic
      .replace(/[,.?!]/g, '')
      .split(/[\s-]+/)
      .filter((s) => s.length > 0)
      .map((text, idx) => ({ id: `${idx}-${text}`, text }));

    // Shuffle items
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    setScrambleSyllables(shuffled);
  }, [words]);

  const tapSyllable = (item: { id: string; text: string }) => {
    if (isScrambleSuccess || !scrambleTarget) return;
    playOfflineSound('click');

    // Move from pool to answer
    setScrambleSyllables((prev) => prev.filter((p) => p.id !== item.id));
    const newAnswer = [...scrambleAnswer, item];
    setScrambleAnswer(newAnswer);

    // Get expected phonetic list
    const expected = scrambleTarget.phonetic
      .toLowerCase()
      .replace(/[,.?!]/g, '')
      .split(/[\s-]+/)
      .filter((s) => s.length > 0);

    // Check if the sequence built so far matches the start of the expected phonetic
    const isMatchingSoFar = newAnswer.every((val, idx) => {
      // Clean tone accents for simpler match if needed, but let's compare exact or lower case strings
      return val.text.toLowerCase() === expected[idx].toLowerCase();
    });

    if (!isMatchingSoFar) {
      // Fail sound, send back to pool
      playOfflineSound('heartbreak');
      setScrambleErrorCount((c) => c + 1);
      // Reset after a tiny delay to let user see
      setTimeout(() => {
        setScrambleSyllables((prev) => [...prev, item].sort(() => 0.5 - Math.random()));
        setScrambleAnswer((prev) => prev.filter((p) => p.id !== item.id));
      }, 350);
    } else {
      // If completed successfully
      if (newAnswer.length === expected.length) {
        setIsScrambleSuccess(true);
        playOfflineSound('win');
        speakThai(scrambleTarget.thai, 0.75);
        try {
          confetti({ particleCount: 60, spread: 80, origin: { y: 0.7 } });
        } catch (e) {}
      }
    }
  };

  // =========================================================================
  // GAME 3: LE QUIZ RAPIDE EXPRESS (Love speed-run True/False)
  // =========================================================================
  const [speedQuestion, setSpeedQuestion] = useState<{
    french: string;
    phonetic: string;
    thai: string;
    isCorrectMatch: boolean;
  } | null>(null);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedTimer, setSpeedTimer] = useState(30);
  const [isSpeedActive, setIsSpeedActive] = useState(false);
  const [isSpeedFinished, setIsSpeedFinished] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateSpeedQuestion = useCallback(() => {
    if (words.length < 2) return;
    const target = words[Math.floor(Math.random() * words.length)];
    const isCorrectMatch = Math.random() > 0.5;

    let showPhonetic = target.phonetic;
    let showThai = target.thai;

    if (!isCorrectMatch) {
      // Pick a random incorrect word's phonetic/Thai
      const wrongPool = words.filter((w) => w.id !== target.id);
      const wrongWord = wrongPool[Math.floor(Math.random() * wrongPool.length)];
      showPhonetic = wrongWord.phonetic;
      showThai = wrongWord.thai;
    }

    setSpeedQuestion({
      french: target.french,
      phonetic: showPhonetic,
      thai: showThai,
      isCorrectMatch,
    });
  }, [words]);

  const initSpeedRun = () => {
    setSpeedScore(0);
    setSpeedTimer(30);
    setIsSpeedFinished(false);
    setIsSpeedActive(true);
    generateSpeedQuestion();

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setSpeedTimer((t) => {
        if (t <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setIsSpeedActive(false);
          setIsSpeedFinished(true);
          playOfflineSound('win');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleSpeedAnswer = (userChoice: boolean) => {
    if (!speedQuestion || !isSpeedActive) return;

    if (userChoice === speedQuestion.isCorrectMatch) {
      setSpeedScore((s) => s + 1);
      playOfflineSound('win');
      try {
        confetti({ particleCount: 15, spread: 40, origin: { y: 0.85 } });
      } catch (e) {}
    } else {
      playOfflineSound('fail');
    }
    generateSpeedQuestion();
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-6 py-2 sm:py-6">
      {/* Back to main menu or header */}
      {activeGame !== 'menu' && (
        <button
          onClick={() => {
            setActiveGame('menu');
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setIsSpeedActive(false);
          }}
          className="text-3xs sm:text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer mb-3"
        >
          ← Quitter le jeu et revenir au salon de jeux
        </button>
      )}

      {/* =========================================================================
          MAIN SALON DE JEUX MENU
          ========================================================================= */}
      {activeGame === 'menu' && (
        <div className="text-center py-3">
          <div className="mb-4">
            <span className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg shadow-2xs mb-2">
              <Gamepad2 className="w-6 h-6" />
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-serif-title">
              Salon de Jeux Amoureux Offline
            </h2>
            <p className="text-slate-500 text-3xs sm:text-sm max-w-md mx-auto mt-1 leading-normal">
              Apprenez en couple avec des mini-jeux interactifs <strong>100% hors-ligne</strong> (sans connexion Internet).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-2xl mx-auto">
            {/* Game 1 Banner */}
            <div className="bg-white border border-rose-100 p-4 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div className="text-left">
                <div className="text-2xl mb-2">💖</div>
                <h3 className="font-serif-title font-bold text-slate-900 text-sm sm:text-base mb-1">Le Pendu de l'Amour</h3>
                <p className="text-slate-500 text-4xs sm:text-2xs leading-normal mb-3">
                  Devinez les lettres de la phrase romantique thaïlandaise avant d'épuiser vos 6 cœurs !
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveGame('hangman');
                  initHangman();
                }}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-3xs transition-colors cursor-pointer"
              >
                Jouer au Pendu
              </button>
            </div>

            {/* Game 2 Banner */}
            <div className="bg-white border border-rose-100 p-4 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div className="text-left">
                <div className="text-2xl mb-2">🧩</div>
                <h3 className="font-serif-title font-bold text-slate-900 text-sm sm:text-base mb-1">Mots Enchevêtrés</h3>
                <p className="text-slate-500 text-4xs sm:text-2xs leading-normal mb-3">
                  Réassemblez les syllabes phonétiques éparpillées dans le bon ordre pour reconstruire la phrase.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveGame('scramble');
                  initScramble();
                }}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-3xs transition-colors cursor-pointer"
              >
                Recomposer
              </button>
            </div>

            {/* Game 3 Banner */}
            <div className="bg-white border border-rose-100 p-4 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow">
              <div className="text-left">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-serif-title font-bold text-slate-900 text-sm sm:text-base mb-1">Vrai / Faux Express</h3>
                <p className="text-slate-500 text-4xs sm:text-2xs leading-normal mb-3">
                  Challengez votre partenaire ! Répondez correctement à un maximum d'associations en 30 secondes chrono.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveGame('speedrun');
                  initSpeedRun();
                }}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-3xs transition-colors cursor-pointer"
              >
                Lancer l'Express
              </button>
            </div>
          </div>

          <div className="max-w-md mx-auto mt-6 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50 flex items-start gap-1.5 text-left text-4xs sm:text-3xs text-slate-600">
            <Info className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <p>
              💡 **Astuce Couple :** Installez l'application sur vos téléphones pour pouvoir y jouer dans l'avion, le train ou à l'étranger sans connexion de données !
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          GAME 1: LE PENDU DE L'AMOUR VIEW
          ========================================================================= */}
      {activeGame === 'hangman' && hangWord && (
        <div className="bg-white border border-rose-100 rounded-2xl p-4 sm:p-6 shadow-2xs max-w-xl mx-auto text-center">
          <div className="flex items-center justify-between mb-4 border-b border-rose-50 pb-2">
            <span className="text-2xs font-bold text-rose-700">Le Pendu de l'Amour</span>
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-4.5 h-4.5 transition-all duration-300 ${
                    idx < lives
                      ? 'fill-rose-500 text-rose-500 scale-100'
                      : 'text-slate-200 scale-75'
                  }`}
                />
              ))}
            </div>
          </div>

          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
            Définition en Français :
          </span>
          <h3 className="text-base sm:text-lg font-serif-title text-slate-900 font-bold mb-4">
            « {hangWord.french} »
          </h3>

          {/* Hidden phonetic word display */}
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mb-6">
            {hangWord.phonetic.split('').map((char, idx) => {
              const lowerChar = char.toLowerCase();
              const isGuessed = guessedLetters.includes(lowerChar);
              const isNonAlpha = !/[a-z]/i.test(char);

              return (
                <span
                  key={idx}
                  className={`w-6.5 h-8 sm:w-8 sm:h-10 text-sm sm:text-lg font-bold border-b-2 flex items-center justify-center transition-all ${
                    isNonAlpha
                      ? 'border-transparent text-slate-400 w-3 sm:w-4'
                      : isGuessed
                      ? 'border-rose-400 text-slate-900 font-mono scale-100'
                      : 'border-slate-300 text-transparent'
                  }`}
                >
                  {isNonAlpha ? char : char}
                </span>
              );
            })}
          </div>

          {/* Result banners */}
          {isHangmanWon && (
            <div className="mb-4 bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-100 animate-fadeIn text-xs font-semibold">
              🎉 Bravo ! Vous avez deviné la prononciation correcte :
              <p className="text-sm font-bold mt-1 font-mono text-slate-900">
                {hangWord.phonetic} <span className="text-3xs text-slate-400">({hangWord.thai})</span>
              </p>
            </div>
          )}

          {isHangmanLost && (
            <div className="mb-4 bg-rose-50 text-rose-950 p-3 rounded-xl border border-rose-100 animate-fadeIn text-xs font-medium">
              💔 Oh, vous n'avez plus de cœurs ! La phrase correcte était :
              <p className="text-sm font-bold mt-1 font-mono text-rose-700">
                {hangWord.phonetic} <span className="text-3xs text-slate-400">({hangWord.thai})</span>
              </p>
            </div>
          )}

          {/* Virtual Keyboard */}
          <div className="mb-6 grid grid-cols-7 sm:grid-cols-9 gap-1.5 max-w-md mx-auto">
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'].map(
              (letter) => {
                const isGuessed = guessedLetters.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => guessLetter(letter)}
                    disabled={isGuessed || isHangmanWon || isHangmanLost}
                    className={`py-1 rounded-lg text-xs font-bold uppercase transition-all select-none cursor-pointer ${
                      isGuessed
                        ? 'bg-slate-100 text-slate-300 border border-slate-200 pointer-events-none'
                        : 'bg-white border border-slate-200 text-slate-800 hover:border-rose-400 hover:bg-rose-50/50'
                    }`}
                  >
                    {letter}
                  </button>
                );
              }
            )}
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => speakThai(hangWord.thai, 0.75)}
              className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-3xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Prononcer</span>
            </button>
            <button
              onClick={initHangman}
              className="py-1.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-3xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Phrase Suivante</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          GAME 2: LA PHRASE ENCHEVÊTRÉE VIEW
          ========================================================================= */}
      {activeGame === 'scramble' && scrambleTarget && (
        <div className="bg-white border border-rose-100 rounded-2xl p-4 sm:p-6 shadow-2xs max-w-xl mx-auto text-center">
          <div className="flex items-center justify-between mb-4 border-b border-rose-50 pb-2">
            <span className="text-2xs font-bold text-rose-700">Mots Enchevêtrés</span>
            <span className="text-3xs text-slate-400">
              Erreur : <strong className="text-rose-600">{scrambleErrorCount}</strong>
            </span>
          </div>

          <span className="text-3xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
            Phrase amoureuse en Français :
          </span>
          <h3 className="text-base sm:text-lg font-serif-title text-slate-900 font-bold mb-6">
            « {scrambleTarget.french} »
          </h3>

          {/* Constructed Answer row */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200/80 min-h-[60px] flex flex-wrap items-center justify-center gap-1.5">
            {scrambleAnswer.length === 0 ? (
              <span className="text-3xs text-slate-400 italic">
                Touchez les bulles ci-dessous dans le bon ordre...
              </span>
            ) : (
              scrambleAnswer.map((item) => (
                <span
                  key={item.id}
                  className="px-2.5 py-1 bg-sky-500 text-white font-semibold text-2xs sm:text-xs rounded-lg shadow-2xs animate-fadeIn"
                >
                  {item.text}
                </span>
              ))
            )}
          </div>

          {/* Syllables pool */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
            {scrambleSyllables.map((item) => (
              <button
                key={item.id}
                onClick={() => tapSyllable(item)}
                className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 hover:border-rose-300 font-bold text-2xs sm:text-xs rounded-xl shadow-3xs cursor-pointer active:scale-95 transition-transform"
              >
                {item.text}
              </button>
            ))}
          </div>

          {/* Success Banner */}
          {isScrambleSuccess && (
            <div className="mb-4 bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-100 animate-fadeIn text-xs font-semibold">
              🎉 Parfait ! Prononciation validée :
              <p className="text-sm font-bold mt-1 font-mono text-slate-900">
                {scrambleTarget.phonetic} <span className="text-3xs text-slate-400">({scrambleTarget.thai})</span>
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            {isScrambleSuccess && (
              <button
                onClick={() => speakThai(scrambleTarget.thai, 0.75)}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-3xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Réécouter</span>
              </button>
            )}
            <button
              onClick={initScramble}
              className="py-1.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-3xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Autre Phrase</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          GAME 3: LE QUIZ RAPIDE EXPRESS VIEW
          ========================================================================= */}
      {activeGame === 'speedrun' && (
        <div className="bg-white border border-rose-100 rounded-2xl p-4 sm:p-6 shadow-2xs max-w-xl mx-auto text-center">
          <div className="flex items-center justify-between mb-4 border-b border-rose-50 pb-2">
            <span className="text-2xs font-bold text-rose-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-current animate-pulse" />
              <span>Vrai / Faux Express (30s)</span>
            </span>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-mono text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded text-3xs">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>{speedTimer}s</span>
              </span>
              <span className="text-2xs text-slate-500 font-bold">
                Score : <span className="text-rose-600 font-mono text-xs">{speedScore}</span>
              </span>
            </div>
          </div>

          {!isSpeedActive && isSpeedFinished ? (
            // Finished screen
            <div className="py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 font-serif-title">
                Session Express Terminée !
              </h3>
              <p className="text-slate-600 text-2xs sm:text-xs mb-4">
                Vous avez validé <strong className="text-rose-600 font-mono text-sm">{speedScore}</strong> bonnes associations en 30 secondes.
              </p>
              <button
                onClick={initSpeedRun}
                className="py-2 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recommencer l'Express</span>
              </button>
            </div>
          ) : (
            // Question screen
            speedQuestion && (
              <div className="py-2">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/50 mb-4 text-center">
                  <span className="text-4xs uppercase tracking-widest text-slate-400 font-bold mb-1.5 block">
                    Phrase en Français :
                  </span>
                  <p className="font-serif-title font-bold text-slate-900 text-base sm:text-lg leading-normal mb-3">
                    « {speedQuestion.french} »
                  </p>
                  
                  <span className="text-4xs uppercase tracking-widest text-slate-400 font-bold mb-1.5 block">
                    Est-ce que la prononciation est :
                  </span>
                  <p className="font-sans font-bold text-rose-600 text-sm sm:text-base mb-1 font-mono">
                    [{speedQuestion.phonetic}]
                  </p>
                  <p className="text-4xs text-slate-400">
                    ({speedQuestion.thai})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-2">
                  <button
                    onClick={() => handleSpeedAnswer(true)}
                    className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <CheckCircle className="w-4.5 h-4.5" />
                    <span>C'EST VRAI</span>
                  </button>

                  <button
                    onClick={() => handleSpeedAnswer(false)}
                    className="py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <XCircle className="w-4.5 h-4.5" />
                    <span>C'EST FAUX</span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
