import React from 'react';
import { UserProgress } from '../types/vocab';
import {
  X,
  Trophy,
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  RotateCcw,
  Heart,
} from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  totalWords: number;
  onResetProgress: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  progress,
  totalWords,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const masteryValues = Object.values(progress.mastery);
  const masteredCount = masteryValues.filter((v) => v === 'mastered').length;
  const reviewCount = masteryValues.filter((v) => v === 'review').length;
  const learningCount = masteryValues.filter((v) => v === 'learning').length;
  const newCount = totalWords - (masteredCount + reviewCount + learningCount);

  const masteredPercentage = Math.round((masteredCount / totalWords) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-rose-100 shadow-xl max-w-lg w-full p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif-title">
              Tableau de Progression Amoureuse
            </h3>
            <p className="text-xs text-slate-500">
              Statistiques d'écoute et de prononciation de vos {totalWords} phrases de couple.
            </p>
          </div>
        </div>

        {/* Big percentage & streak */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-rose-50/20 border border-rose-100/60 text-center">
            <div className="text-3xl font-extrabold text-rose-600 font-mono mb-1">
              {masteredPercentage}%
            </div>
            <div className="text-xs font-semibold text-slate-600">
              Complicité maîtrisée
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/20 border border-rose-100/60 text-center">
            <div className="text-3xl font-extrabold text-amber-500 font-mono mb-1 flex items-center justify-center gap-1">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
              <span>{progress.history.streakDays}</span>
            </div>
            <div className="text-xs font-semibold text-slate-600">
              Jours consécutifs
            </div>
          </div>
        </div>

        {/* Word mastery status breakdown */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Phrases maîtrisées à l'oral</span>
            </div>
            <span className="font-mono font-bold">{masteredCount}</span>
          </div>

          <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-50 text-amber-800 font-medium">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>En cours de mémorisation</span>
            </div>
            <span className="font-mono font-bold">{learningCount}</span>
          </div>

          <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-rose-50 text-rose-800 font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Expressions à réécouter d'urgence</span>
            </div>
            <span className="font-mono font-bold">{reviewCount}</span>
          </div>

          <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 text-slate-700 font-medium">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Mots doux restant à découvrir</span>
            </div>
            <span className="font-mono font-bold">{newCount}</span>
          </div>
        </div>

        {/* Action footer */}
        <div className="flex items-center justify-between pt-4 border-t border-rose-50 text-xs">
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment réinitialiser vos statistiques de complicité ?')) {
                onResetProgress();
              }
            }}
            className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser la progression</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
