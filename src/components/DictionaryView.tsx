import React, { useState, useMemo } from 'react';
import { ThaiWord, WordMastery } from '../types/vocab';
import { speakThai } from '../utils/audio';
import {
  Search,
  Volume2,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DictionaryViewProps {
  words: ThaiWord[];
  masteryMap: Record<string, WordMastery>;
  favorites: string[];
  onToggleFavorite: (wordId: string) => void;
  onUpdateMastery: (wordId: string, status: WordMastery) => void;
  categories: readonly string[];
}

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  words,
  masteryMap,
  favorites,
  onToggleFavorite,
  onUpdateMastery,
  categories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes les catégories');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      // Category check
      if (selectedCategory !== 'Toutes les catégories' && w.category !== selectedCategory) {
        return false;
      }
      // Status check
      const status = masteryMap[w.id] || 'new';
      if (filterStatus === 'review' && status !== 'review') return false;
      if (filterStatus === 'mastered' && status !== 'mastered') return false;
      if (filterStatus === 'favorite' && !favorites.includes(w.id)) return false;

      // Search query check (search in Thai script, phonetic, or French)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        w.french.toLowerCase().includes(q) ||
        w.thai.toLowerCase().includes(q) ||
        w.phonetic.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
      );
    });
  }, [words, searchQuery, selectedCategory, filterStatus, masteryMap, favorites]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header and Search */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-title">
              Lexique Amoureux ({words.length} phrases)
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Consultez, écoutez et apprenez la prononciation du thaïlandais parlé dans le couple.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un mot doux, un son..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-rose-100">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Catégorie :
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({words.length})
            </button>
            <button
              onClick={() => setFilterStatus('review')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === 'review'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              À revoir
            </button>
            <button
              onClick={() => setFilterStatus('mastered')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === 'mastered'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Maîtrisés
            </button>
            <button
              onClick={() => setFilterStatus('favorite')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === 'favorite'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Favoris
            </button>
          </div>
        </div>
      </div>

      {/* Vocabulary List */}
      {filteredWords.length === 0 ? (
        <div className="bg-white rounded-xl border border-rose-100 p-12 text-center text-slate-500">
          <p className="text-sm">Aucune phrase ne correspond à votre recherche « {searchQuery} ».</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {filteredWords.map((word) => {
            const status = masteryMap[word.id] || 'new';
            const isFav = favorites.includes(word.id);
            const isExpanded = expandedWordId === word.id;

            return (
              <div
                key={word.id}
                className="p-4 hover:bg-rose-50/10 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Word title & Phonetic */}
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onToggleFavorite(word.id)}
                      className={`p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer ${
                        isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                      }`}
                      title="Ajouter aux favoris"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => speakThai(word.thai, 0.75)}
                      className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
                      title="Écouter la prononciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <div className="truncate">
                      <div className="flex items-baseline gap-2">
                        {/* Huge Phonetic is presented first to highlight ORAL focus */}
                        <span className="text-base sm:text-lg font-bold text-slate-900">
                          {word.phonetic}
                        </span>
                        {/* Thai Script is smaller and secondary */}
                        <span className="text-xs font-serif-title text-slate-400">
                          ({word.thai})
                        </span>
                      </div>
                      {/* Zero-Pill Metadata separation */}
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                        <span>{word.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>Ton : <span className="font-semibold text-rose-600">{word.tone}</span></span>
                        <span aria-hidden="true">·</span>
                        <span>Dit par :{' '}
                          <span className={`font-semibold ${
                            word.speaker === 'homme'
                              ? 'text-sky-600'
                              : word.speaker === 'femme'
                              ? 'text-pink-600'
                              : 'text-slate-600'
                          }`}>
                            {word.speaker === 'homme' ? 'Lui' : word.speaker === 'femme' ? 'Elle' : 'Les deux'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* French Translation & Status */}
                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {word.french}
                      </div>
                      <div className="text-xs text-slate-400">
                        {status === 'mastered' && (
                          <span className="text-emerald-600 font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Maîtrisé
                          </span>
                        )}
                        {status === 'review' && (
                          <span className="text-rose-600 font-medium flex items-center justify-end gap-1">
                            <AlertCircle className="w-3 h-3" /> À revoir
                          </span>
                        )}
                        {status === 'learning' && (
                          <span className="text-amber-600 font-medium flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" /> En cours
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedWordId(isExpanded ? null : word.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                      title="Détails"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Example sentence & notes */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-rose-100/50 text-xs text-slate-600 space-y-2 bg-rose-50/20 p-3 rounded-lg">
                    {word.exampleThai && (
                      <div>
                        <div className="font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-rose-500" />
                          <span>Exemple Oral :</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-950 text-sm">{word.examplePhonetic}</p>
                          <span className="text-slate-400 text-xs font-serif-title">({word.exampleThai})</span>
                          <button
                            onClick={() => speakThai(word.exampleThai, 0.75)}
                            className="p-1 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Écouter l'exemple"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5">{word.exampleFr}</p>
                      </div>
                    )}
                    {word.notes && (
                      <p className="text-rose-700 bg-rose-50/80 p-2 rounded border border-rose-100 text-2xs leading-relaxed">
                        💡 {word.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-slate-400">Marquer comme :</span>
                      <button
                        onClick={() => onUpdateMastery(word.id, 'review')}
                        className="px-2 py-0.5 rounded text-2xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                      >
                        À revoir
                      </button>
                      <button
                        onClick={() => onUpdateMastery(word.id, 'learning')}
                        className="px-2 py-0.5 rounded text-2xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"
                      >
                        En cours
                      </button>
                      <button
                        onClick={() => onUpdateMastery(word.id, 'mastered')}
                        className="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                      >
                        Maîtrisé
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
