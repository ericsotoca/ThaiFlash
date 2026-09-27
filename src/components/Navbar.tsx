import React from 'react';
import { AppTab, StudyDirection } from '../types/vocab';
import { BookOpen, HelpCircle, MessageCircleHeart, Layers, Search, Flame, BarChart2, ArrowRightLeft, Heart } from 'lucide-react';

interface NavbarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  direction: StudyDirection;
  onToggleDirection: () => void;
  streakDays: number;
  masteredCount: number;
  totalCount: number;
  onOpenStats: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  direction,
  onToggleDirection,
  streakDays,
  masteredCount,
  totalCount,
  onOpenStats,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand title, one line */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('flashcards')}
              className="text-xl font-bold tracking-tight text-slate-900 hover:text-rose-600 transition-colors flex items-center gap-2 text-left"
            >
              <span className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-base shadow-xs animate-pulse">
                <Heart className="w-4 h-4 fill-current" />
              </span>
              <span className="font-serif-title text-xl text-rose-700">RussoFlash</span>
              <span className="text-xs text-rose-400 font-sans font-medium hidden lg:inline">· Thai Amoureux (Oral)</span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links, single-line */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange('flashcards')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'flashcards'
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/40'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Cartes Mémoire</span>
            </button>

            <button
              onClick={() => onTabChange('quiz')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'quiz'
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/40'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Quiz Oral</span>
            </button>

            <button
              onClick={() => onTabChange('dialogues')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'dialogues'
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/40'
              }`}
            >
              <MessageCircleHeart className="w-4 h-4" />
              <span>Dialogues</span>
            </button>

            <button
              onClick={() => onTabChange('matching')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'matching'
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/40'
              }`}
            >
              <Layers className="w-4 h-4 rotate-90" />
              <span>Association</span>
            </button>

            <button
              onClick={() => onTabChange('dictionary')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'dictionary'
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/40'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Lexique ({totalCount})</span>
            </button>

            <button
              onClick={() => onTabChange('guide')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'guide'
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/40'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Guide Oral</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direction toggle button */}
            <button
              onClick={onToggleDirection}
              title={`Inverser le sens d'apprentissage (Actuel: ${
                direction === 'fr-to-th' ? 'Français vers Thaï' : 'Thaï vers Français'
              })`}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-rose-100 bg-white hover:bg-rose-50 text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Sens:</span>
              <span className="font-mono text-rose-600 font-bold text-xs">
                {direction === 'fr-to-th' ? 'FR → TH' : 'TH → FR'}
              </span>
            </button>

            {/* Streak & Stats button */}
            <button
              onClick={onOpenStats}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            >
              <span className="flex items-center gap-1 text-amber-200">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span className="font-mono text-xs">{streakDays}j</span>
              </span>
              <span className="text-rose-400">|</span>
              <span className="flex items-center gap-1 font-mono text-white text-xs">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{masteredCount}/{totalCount}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation scroll row */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-rose-50 no-scrollbar bg-rose-50/20">
        <button
          onClick={() => onTabChange('flashcards')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'flashcards' ? 'bg-rose-500 text-white' : 'text-slate-600 bg-white border border-rose-100'
          }`}
        >
          Cartes
        </button>
        <button
          onClick={() => onTabChange('quiz')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'quiz' ? 'bg-rose-500 text-white' : 'text-slate-600 bg-white border border-rose-100'
          }`}
        >
          Quiz
        </button>
        <button
          onClick={() => onTabChange('dialogues')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'dialogues' ? 'bg-rose-500 text-white' : 'text-slate-600 bg-white border border-rose-100'
          }`}
        >
          Dialogues
        </button>
        <button
          onClick={() => onTabChange('matching')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'matching' ? 'bg-rose-500 text-white' : 'text-slate-600 bg-white border border-rose-100'
          }`}
        >
          Paires
        </button>
        <button
          onClick={() => onTabChange('dictionary')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'dictionary' ? 'bg-rose-500 text-white' : 'text-slate-600 bg-white border border-rose-100'
          }`}
        >
          Lexique
        </button>
        <button
          onClick={() => onTabChange('guide')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
            currentTab === 'guide' ? 'bg-rose-500 text-white' : 'text-slate-600 bg-white border border-rose-100'
          }`}
        >
          Guide Oral
        </button>
      </div>
    </header>
  );
};
