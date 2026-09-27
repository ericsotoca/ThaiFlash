import React, { useState, useEffect } from 'react';
import { VOCABULARY_DATA, THAI_CATEGORIES } from './data/thaiVocab';
import { AppTab, StudyDirection, WordMastery, UserProgress } from './types/vocab';
import { loadUserProgress, saveUserProgress } from './utils/storage';
import { Navbar } from './components/Navbar';
import { FlashcardView } from './components/FlashcardView';
import { QuizView } from './components/QuizView';
import { DialoguesView } from './components/DialoguesView';
import { MatchingView } from './components/MatchingView';
import { DictionaryView } from './components/DictionaryView';
import { AlphabetView } from './components/AlphabetView';
import { GamesView } from './components/GamesView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { StatsModal } from './components/StatsModal';
import { Heart } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('flashcards');
  // Default direction: 'fr-to-th' (Français vers Thaïlandais phonétique)
  const [direction, setDirection] = useState<StudyDirection>('fr-to-th');
  const [userProgress, setUserProgress] = useState<UserProgress>(loadUserProgress);
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes les catégories');
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveUserProgress(userProgress);
  }, [userProgress]);

  const handleUpdateMastery = (wordId: string, status: WordMastery) => {
    setUserProgress((prev) => {
      const nextMastery = { ...prev.mastery, [wordId]: status };
      const nextStudied = prev.history.cardsStudied + 1;
      return {
        ...prev,
        mastery: nextMastery,
        history: {
          ...prev.history,
          cardsStudied: nextStudied,
        },
      };
    });
  };

  const handleToggleFavorite = (wordId: string) => {
    setUserProgress((prev) => {
      const isFav = prev.favorites.includes(wordId);
      const nextFavorites = isFav
        ? prev.favorites.filter((id) => id !== wordId)
        : [...prev.favorites, wordId];
      return {
        ...prev,
        favorites: nextFavorites,
      };
    });
  };

  const handleToggleDirection = () => {
    setDirection((prev) => (prev === 'fr-to-th' ? 'th-to-fr' : 'fr-to-th'));
  };

  const handleIncrementQuizStats = (isCorrect: boolean) => {
    setUserProgress((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        quizCompleted: prev.history.quizCompleted + 1,
        correctAnswers: prev.history.correctAnswers + (isCorrect ? 1 : 0),
      },
    }));
  };

  const handleResetProgress = () => {
    const fresh: UserProgress = {
      mastery: {},
      favorites: [],
      history: {
        cardsStudied: 0,
        quizCompleted: 0,
        correctAnswers: 0,
        streakDays: 1,
        lastActiveDate: new Date().toISOString().slice(0, 10),
      },
    };
    setUserProgress(fresh);
    saveUserProgress(fresh);
  };

  const masteredCount = Object.values(userProgress.mastery).filter((v) => v === 'mastered').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract Compliant Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        direction={direction}
        onToggleDirection={handleToggleDirection}
        streakDays={userProgress.history.streakDays}
        masteredCount={masteredCount}
        totalCount={VOCABULARY_DATA.length}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      <PWAInstallButton />

      {/* Main Study Arena */}
      <main className="flex-1">
        {currentTab === 'flashcards' && (
          <FlashcardView
            words={VOCABULARY_DATA}
            direction={direction}
            onToggleDirection={handleToggleDirection}
            masteryMap={userProgress.mastery}
            favorites={userProgress.favorites}
            onUpdateMastery={handleUpdateMastery}
            onToggleFavorite={handleToggleFavorite}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categories={THAI_CATEGORIES}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizView
            words={VOCABULARY_DATA}
            direction={direction}
            onToggleDirection={handleToggleDirection}
            onUpdateMastery={handleUpdateMastery}
            onIncrementQuizStats={handleIncrementQuizStats}
          />
        )}

        {currentTab === 'dialogues' && (
          <DialoguesView />
        )}

        {currentTab === 'matching' && (
          <MatchingView words={VOCABULARY_DATA} />
        )}

        {currentTab === 'dictionary' && (
          <DictionaryView
            words={VOCABULARY_DATA}
            masteryMap={userProgress.mastery}
            favorites={userProgress.favorites}
            onToggleFavorite={handleToggleFavorite}
            onUpdateMastery={handleUpdateMastery}
            categories={THAI_CATEGORIES}
          />
        )}

        {currentTab === 'guide' && <AlphabetView />}

        {currentTab === 'games' && <GamesView words={VOCABULARY_DATA} />}
      </main>

      {/* Progress & Stats Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        progress={userProgress}
        totalWords={VOCABULARY_DATA.length}
        onResetProgress={handleResetProgress}
      />

      {/* Quiet, Anti-Slop Footer */}
      <footer className="border-t border-rose-100 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-rose-700 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current text-rose-500" />
              <span>ThaiFlash : Thaï Oral de Couple</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>36 phrases & expressions essentielles pour couple franco-thaïlandais</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Synthèse vocale Web Speech th-TH</span>
            <span aria-hidden="true">·</span>
            <span>Phonétique simplifiée avec marquage des tons</span>
          </div>
        </div>
      </footer>

      <OfflineIndicator />
    </div>
  );
}
