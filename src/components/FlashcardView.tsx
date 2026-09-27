import React, { useState, useEffect, useCallback } from 'react';
import { ThaiWord, StudyDirection, WordMastery } from '../types/vocab';
import { speakThai } from '../utils/audio';
import {
  Volume2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Keyboard as KeyboardIcon,
  Heart,
} from 'lucide-react';

interface FlashcardViewProps {
  words: ThaiWord[];
  direction: StudyDirection;
  onToggleDirection: () => void;
  masteryMap: Record<string, WordMastery>;
  favorites: string[];
  onUpdateMastery: (wordId: string, status: WordMastery) => void;
  onToggleFavorite: (wordId: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: readonly string[];
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  words,
  direction,
  onToggleDirection,
  masteryMap,
  favorites,
  onUpdateMastery,
  onToggleFavorite,
  selectedCategory,
  onSelectCategory,
  categories,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.75); // Slow rate (0.75x) is default for hearing tones
  const [showPhonetic, setShowPhonetic] = useState(true);
  const [showExample, setShowExample] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlearned' | 'review' | 'mastered' | 'favorite'>('all');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Filter words according to category and status
  const filteredWords = words.filter((w) => {
    // Category filter
    if (selectedCategory !== 'Toutes les catégories' && w.category !== selectedCategory) {
      return false;
    }
    // Status filter
    const status = masteryMap[w.id] || 'new';
    if (filterStatus === 'unlearned' && (status === 'mastered' || status === 'review')) return false;
    if (filterStatus === 'review' && status !== 'review') return false;
    if (filterStatus === 'mastered' && status !== 'mastered') return false;
    if (filterStatus === 'favorite' && !favorites.includes(w.id)) return false;
    return true;
  });

  // Clamp index if filtered list changes
  useEffect(() => {
    if (currentIndex >= filteredWords.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [filteredWords.length, selectedCategory, filterStatus, currentIndex]);

  const currentWord = filteredWords[currentIndex];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredWords.length || 1));
  }, [filteredWords.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredWords.length) % (filteredWords.length || 1));
  }, [filteredWords.length]);

  const handleShuffle = () => {
    setIsFlipped(false);
    if (filteredWords.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * filteredWords.length);
    if (nextIdx === currentIndex) {
      nextIdx = (nextIdx + 1) % filteredWords.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handlePlayAudio = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (!currentWord) return;
      setIsPlayingAudio(true);
      speakThai(currentWord.thai, speechRate, () => {
        setIsPlayingAudio(false);
      });
    },
    [currentWord, speechRate]
  );

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handlePlayAudio();
      } else if (e.key === '1' && currentWord) {
        onUpdateMastery(currentWord.id, 'review');
      } else if (e.key === '2' && currentWord) {
        onUpdateMastery(currentWord.id, 'learning');
      } else if (e.key === '3' && currentWord) {
        onUpdateMastery(currentWord.id, 'mastered');
      } else if (e.key === 'f' || e.key === 'F') {
        if (currentWord) onToggleFavorite(currentWord.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord, handleFlip, handleNext, handlePrev, handlePlayAudio, onUpdateMastery, onToggleFavorite]);

  if (!currentWord || filteredWords.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Aucune carte trouvée</h2>
        <p className="text-sm text-slate-600 mb-6">
          Aucune phrase ne correspond aux filtres actuels ({selectedCategory} · statut: {filterStatus}).
        </p>
        <button
          onClick={() => {
            onSelectCategory('Toutes les catégories');
            setFilterStatus('all');
          }}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
        >
          Réinitialiser tous les filtres
        </button>
      </div>
    );
  }

  const currentStatus = masteryMap[currentWord.id] || 'new';
  const isFav = favorites.includes(currentWord.id);

  const frontLanguage = direction === 'fr-to-th' ? 'Français' : 'Thaï';
  const backLanguage = direction === 'fr-to-th' ? 'Thaï' : 'Français';
  const frontMain = direction === 'fr-to-th' ? currentWord.french : currentWord.phonetic;
  const backMain = direction === 'fr-to-th' ? currentWord.phonetic : currentWord.french;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Filter and settings bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100">
        {/* Category selector */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            Catégorie :
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-2xs"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Filter buttons - segmented control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({words.length})
          </button>
          <button
            onClick={() => setFilterStatus('review')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              filterStatus === 'review'
                ? 'bg-white text-rose-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-3 h-3 text-rose-500" />
            <span>À revoir</span>
          </button>
          <button
            onClick={() => setFilterStatus('mastered')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              filterStatus === 'mastered'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Maîtrisés</span>
          </button>
          <button
            onClick={() => setFilterStatus('favorite')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              filterStatus === 'favorite'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Favoris ({favorites.length})</span>
          </button>
        </div>
      </div>

      {/* Progress & counter bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">
            Carte <span className="font-mono tabular-nums">{currentIndex + 1}</span> sur{' '}
            <span className="font-mono tabular-nums">{filteredWords.length}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>{currentWord.category}</span>
          <span aria-hidden="true">·</span>
          <span>Dit par :{' '}
            <span className={`font-semibold ${
              currentWord.speaker === 'homme'
                ? 'text-sky-600'
                : currentWord.speaker === 'femme'
                ? 'text-pink-600'
                : 'text-slate-600'
            }`}>
              {currentWord.speaker === 'homme' ? 'Lui' : currentWord.speaker === 'femme' ? 'Elle' : 'Les deux'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio speed selector */}
          <button
            onClick={() => setSpeechRate((r) => (r === 0.75 ? 0.9 : 0.75))}
            className="text-xs font-mono text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
            title="Vitesse de prononciation"
          >
            Vitesse: <span className="font-bold">{speechRate}x</span>
          </button>
          <span aria-hidden="true">·</span>
          {/* Direction toggle indicator */}
          <button
            onClick={onToggleDirection}
            className="text-rose-600 hover:text-rose-800 font-medium transition-colors cursor-pointer"
          >
            Sens : {frontLanguage} ➔ {backLanguage}
          </button>
        </div>
      </div>

      {/* Progress bar visual line */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-rose-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / filteredWords.length) * 100}%` }}
        />
      </div>

      {/* 3D Flashcard Interactive Arena */}
      <div className="perspective-1000 w-full min-h-[360px] sm:min-h-[420px] mb-6">
        <div
          onClick={handleFlip}
          className={`relative w-full h-full min-h-[360px] sm:min-h-[420px] rounded-2xl cursor-pointer transition-transform duration-500 transform-style-3d shadow-sm hover:shadow-md border border-rose-100 select-none ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= RECTO (FRONT) ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
            {/* Top metadata strip */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase tracking-wider text-rose-500">
                  Face 1 · {frontLanguage}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentWord.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(currentWord.id);
                  }}
                  className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ${
                    isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                  }`}
                  title="Ajouter aux favoris"
                >
                  <Star className={`w-5 h-5 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Center Content */}
            <div className="my-auto text-center py-6">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2 block">
                {direction === 'fr-to-th' ? 'Comment dit-on à l\'oral :' : 'Que signifie en français :'}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4 font-serif-title leading-snug">
                {frontMain}
              </h2>

              {/* If front is Thai (or th-to-fr), show thai script smaller below phonetic */}
              {direction === 'th-to-fr' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 font-serif-title">
                    Écrit : {currentWord.thai}
                  </p>
                  <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">
                    Ton : {currentWord.tone}
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handlePlayAudio}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-rose-600' : ''}`} />
                      <span>Écouter le son</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Flip Call to Action */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-rose-50">
              <span className="flex items-center gap-1.5 text-slate-500">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Cliquer pour retourner la carte</span>
              </span>
              <span className="hidden sm:inline text-slate-400">
                Raccourci: <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">Espace</kbd>
              </span>
            </div>
          </div>

          {/* ================= VERSO (BACK) ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-b from-rose-50/20 via-white to-white rounded-2xl p-6 sm:p-10 flex flex-col justify-between overflow-y-auto">
            {/* Top metadata strip */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase tracking-wider text-emerald-600">
                  Face 2 · {backLanguage}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500 font-medium">Ton : {currentWord.tone}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(currentWord.id);
                  }}
                  className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ${
                    isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                  }`}
                  title="Ajouter aux favoris"
                >
                  <Star className={`w-5 h-5 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Back Center Content */}
            <div className="my-auto text-center py-4">
              {/* Thai word representation with Audio play */}
              <div className="flex flex-col items-center justify-center gap-3 mb-2">
                {/* Large Phonetic is primary because of ORAL focus */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 font-serif-title">
                  {direction === 'fr-to-th' ? currentWord.phonetic : currentWord.french}
                </h2>
                
                {/* Thai script representation smaller */}
                {direction === 'fr-to-th' && (
                  <p className="text-sm font-semibold text-slate-400">
                    ({currentWord.thai})
                  </p>
                )}

                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className={`p-2.5 rounded-full transition-all shadow-2xs cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-500 text-white scale-110 ring-4 ring-rose-100'
                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:scale-105'
                  }`}
                  title="Écouter la prononciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* French translation or Phonetic */}
              <div className="text-base sm:text-lg font-semibold text-slate-600 mb-4">
                {direction === 'fr-to-th' ? currentWord.french : `Phonétique : [${currentWord.phonetic}]`}
              </div>

              {/* Example sentence */}
              {showExample && currentWord.exampleThai && (
                <div className="max-w-xl mx-auto p-3.5 bg-rose-50/10 rounded-xl border border-rose-100/50 text-left my-2">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Phrase exemple à l'oral :</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-900 leading-normal">{currentWord.examplePhonetic}</p>
                    <button
                      type="button"
                      onClick={() => speakThai(currentWord.exampleThai, speechRate)}
                      className="p-1 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">{currentWord.exampleFr}</p>
                  {currentWord.notes && (
                    <p className="mt-2 text-2xs text-rose-700 bg-rose-50/50 p-1.5 rounded border border-rose-100/40">
                      💡 {currentWord.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Controls on back: Flip back */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-rose-50">
              <span className="flex items-center gap-1.5 text-slate-500">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Cliquer pour retourner</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExample((ex) => !ex);
                  }}
                  className="hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {showExample ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showExample ? 'Masquer exemple' : 'Afficher exemple'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card rating & Mastery buttons (SRS-style) */}
      <div className="bg-white rounded-xl border border-rose-100 p-4 mb-6 shadow-2xs">
        <div className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Évaluez votre aisance orale sur cette phrase :
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
          <button
            onClick={() => {
              onUpdateMastery(currentWord.id, 'review');
              handleNext();
            }}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold border transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              currentStatus === 'review'
                ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-200 font-bold'
                : 'border-slate-200 hover:bg-rose-50/60 hover:text-rose-700 text-slate-700'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>À revoir</span>
            <span className="hidden sm:inline text-2xs text-slate-400 font-mono">(1)</span>
          </button>

          <button
            onClick={() => {
              onUpdateMastery(currentWord.id, 'learning');
              handleNext();
            }}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold border transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              currentStatus === 'learning'
                ? 'bg-amber-50 border-amber-400 text-amber-700 ring-2 ring-amber-200 font-bold'
                : 'border-slate-200 hover:bg-amber-50/60 hover:text-amber-700 text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>En cours</span>
            <span className="hidden sm:inline text-2xs text-slate-400 font-mono">(2)</span>
          </button>

          <button
            onClick={() => {
              onUpdateMastery(currentWord.id, 'mastered');
              handleNext();
            }}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold border transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              currentStatus === 'mastered'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-700 ring-2 ring-emerald-200 font-bold'
                : 'border-slate-200 hover:bg-emerald-50/60 hover:text-emerald-700 text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Maîtrisé</span>
            <span className="hidden sm:inline text-2xs text-slate-400 font-mono">(3)</span>
          </button>
        </div>
      </div>

      {/* Main navigation controls: Prev, Flip, Next, Shuffle */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Précédent</span>
        </button>

        <button
          onClick={handleFlip}
          className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>{isFlipped ? 'Voir la question' : 'Révéler la réponse'}</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
        >
          <span>Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleShuffle}
          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          title="Mélanger les cartes"
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard shortcuts helper */}
      <div className="mt-8 pt-4 border-t border-rose-50 text-center">
        <button
          onClick={() => setShowShortcuts((s) => !s)}
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <KeyboardIcon className="w-3.5 h-3.5" />
          <span>{showShortcuts ? 'Masquer les raccourcis' : 'Raccourcis clavier (Espace, Flèches, 1, 2, 3)'}</span>
        </button>

        {showShortcuts && (
          <div className="mt-3 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left max-w-xl mx-auto">
            <div>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-slate-900">Espace</kbd>{' '}
              : Retourner
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-slate-900">←</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-slate-900">→</kbd> : Naviguer
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-slate-900">P</kbd>{' '}
              : Prononciation
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-slate-900">1/2/3</kbd>{' '}
              : Évaluer
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
