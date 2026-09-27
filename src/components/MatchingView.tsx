import React, { useState, useEffect } from 'react';
import { ThaiWord } from '../types/vocab';
import { speakThai } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Clock, Heart } from 'lucide-react';

interface MatchingViewProps {
  words: ThaiWord[];
}

interface Tile {
  id: string; // unique tile id
  wordId: string;
  type: 'thai' | 'french';
  text: string;
  phonetic: string;
  isMatched: boolean;
  word: ThaiWord;
}

export const MatchingView: React.FC<MatchingViewProps> = ({ words }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongMatch, setWrongMatch] = useState<[string, string] | null>(null);

  const startNewGame = () => {
    if (words.length < 6) return;
    const shuffledPool = [...words].sort(() => 0.5 - Math.random()).slice(0, 6);

    const generatedTiles: Tile[] = [];
    shuffledPool.forEach((w) => {
      generatedTiles.push({
        id: `th-${w.id}`,
        wordId: w.id,
        type: 'thai',
        text: w.thai,
        phonetic: w.phonetic,
        isMatched: false,
        word: w,
      });
      generatedTiles.push({
        id: `fr-${w.id}`,
        wordId: w.id,
        type: 'french',
        text: w.french,
        phonetic: '',
        isMatched: false,
        word: w,
      });
    });

    setTiles(generatedTiles.sort(() => 0.5 - Math.random()));
    setSelectedTileId(null);
    setMatchedCount(0);
    setTimer(0);
    setIsRunning(true);
    setIsCompleted(false);
    setWrongMatch(null);
  };

  useEffect(() => {
    startNewGame();
  }, [words]);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isCompleted]);

  const handleTileClick = (tile: Tile) => {
    if (tile.isMatched || isCompleted || wrongMatch) return;

    if (!selectedTileId) {
      setSelectedTileId(tile.id);
      if (tile.type === 'thai') {
        speakThai(tile.word.thai, 0.8);
      }
      return;
    }

    if (selectedTileId === tile.id) {
      setSelectedTileId(null);
      return;
    }

    const firstTile = tiles.find((t) => t.id === selectedTileId);
    if (!firstTile) return;

    // Check if matching pair (different type and same wordId)
    if (firstTile.wordId === tile.wordId && firstTile.type !== tile.type) {
      // Correct match!
      speakThai(tile.word.thai, 0.8);
      setTiles((prev) =>
        prev.map((t) =>
          t.wordId === tile.wordId ? { ...t, isMatched: true } : t
        )
      );
      setSelectedTileId(null);

      const nextMatched = matchedCount + 1;
      setMatchedCount(nextMatched);

      if (nextMatched === 6) {
        setIsCompleted(true);
        setIsRunning(false);
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    } else {
      // Wrong match
      setWrongMatch([firstTile.id, tile.id]);
      setTimeout(() => {
        setWrongMatch(null);
        setSelectedTileId(null);
      }, 700);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-6 py-2 sm:py-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between text-3xs sm:text-xs text-slate-500 mb-4 pb-2 border-b border-rose-100 gap-2">
        <div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 font-serif-title flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />
            <span>Association des Mots Doux</span>
          </h2>
          <p className="text-slate-500 text-3xs">
            Associez le son de la phrase thaïlandaise à sa traduction française amoureuse.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-rose-700 font-semibold bg-rose-50 px-2 py-1 rounded-lg text-3xs">
            <Clock className="w-3 h-3 text-rose-400" />
            <span>{timer}s</span>
          </div>

          <button
            onClick={startNewGame}
            className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer"
            title="Recommencer une partie"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isCompleted ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-8 text-center shadow-xs">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2 font-serif-title">
            Félicitations, vous assurez grave !
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm mb-4 sm:mb-6">
            Vous avez assemblé ces 6 paires de couple en{' '}
            <strong className="font-mono text-rose-600">{timer} secondes</strong>.
          </p>
          <button
            onClick={startNewGame}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recommencer un jeu</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {tiles.map((tile) => {
            const isSelected = selectedTileId === tile.id;
            const isWrong = wrongMatch && wrongMatch.includes(tile.id);

            let style = 'bg-white border-slate-200 text-slate-800 hover:border-rose-300 hover:shadow-xs';

            if (tile.isMatched) {
              style = 'bg-emerald-50/70 border-emerald-200 text-emerald-800 opacity-60 pointer-events-none scale-95';
            } else if (isSelected) {
              style = 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-100 shadow-sm';
            } else if (isWrong) {
              style = 'bg-rose-50/80 border-rose-500 text-rose-950 ring-2 ring-rose-200 animate-shake';
            }

            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                disabled={tile.isMatched}
                className={`min-h-[85px] sm:min-h-[100px] p-2.5 sm:p-4 rounded-xl border text-center font-semibold text-xs sm:text-base transition-all duration-200 flex flex-col items-center justify-center relative select-none cursor-pointer ${style}`}
              >
                <span className="text-4xs sm:text-2xs uppercase tracking-wider text-slate-400 font-normal mb-0.5 sm:mb-1">
                  {tile.type === 'thai' ? 'Thaï (Oral)' : 'Français'}
                </span>
                
                {tile.type === 'thai' ? (
                  <div className="space-y-0.5">
                    {/* Big phonetic primary */}
                    <span className="font-bold text-xs sm:text-base text-slate-900 block leading-tight">
                      {tile.phonetic}
                    </span>
                    {/* Small Thai script secondary */}
                    <span className="text-4xs sm:text-3xs text-slate-400 font-serif-title block">
                      ({tile.text})
                    </span>
                  </div>
                ) : (
                  <span className="text-2xs sm:text-sm text-slate-800 leading-snug">
                    {tile.text}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
