import React, { useState } from 'react';
import { THAI_ORAL_GUIDE, GuideTopic } from '../data/thaiGuide';
import { speakThai } from '../utils/audio';
import { Volume2, Heart, Sparkles, AlertCircle } from 'lucide-react';

export const AlphabetView: React.FC = () => {
  const [activeTopicIndex, setActiveTopicIndex] = useState<number>(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlaySound = (text: string, id: string) => {
    setPlayingId(id);
    speakThai(text, 0.75, () => {
      setPlayingId(null);
    });
  };

  const currentTopic = THAI_ORAL_GUIDE[activeTopicIndex];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-rose-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-title flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-current" />
            <span>Guide de Prononciation & Langage du Couple</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Pour parler un thaïlandais doux, respectueux et parfaitement prononcé à l'oral avec votre compagne.
          </p>
        </div>

        {/* Dynamic segmented tab selection */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-max self-start md:self-auto">
          {THAI_ORAL_GUIDE.map((topic, index) => (
            <button
              key={index}
              onClick={() => setActiveTopicIndex(index)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                activeTopicIndex === index
                  ? 'bg-white text-rose-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              {topic.title.split('. ')[1] || topic.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Guide Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Topic Introduction */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-rose-100/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-rose-500 text-2xs font-bold uppercase tracking-wider mb-2 block">Thème Actuel</span>
            <h3 className="text-lg font-bold text-slate-900 mb-3 font-serif-title">
              {currentTopic.title}
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {currentTopic.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-50 bg-rose-50/30 rounded-xl p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-2xs text-slate-500 leading-normal">
              <strong>Conseil Oral :</strong> Répétez à haute voix en essayant de chanter l'intonation comme les boutons audio !
            </div>
          </div>
        </div>

        {/* Right column: Interactive Term Cards */}
        <div className="lg:col-span-2 space-y-3">
          {currentTopic.details.map((item, idx) => {
            const itemId = `${activeTopicIndex}-${idx}`;
            const isPlaying = playingId === itemId;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border bg-white transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-2xs ${
                  isPlaying
                    ? 'border-rose-300 bg-rose-50/20 ring-2 ring-rose-100'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-rose-600 font-serif-title">
                      {item.label}
                    </span>
                    {item.audioText && (
                      <span className="text-xs text-slate-400 font-mono italic">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

                {item.audioText && (
                  <button
                    type="button"
                    onClick={() => handlePlaySound(item.audioText!, itemId)}
                    className={`p-2.5 rounded-full shrink-0 flex items-center justify-center transition-all ${
                      isPlaying
                        ? 'bg-rose-500 text-white scale-105'
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    }`}
                    title="Écouter la prononciation"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Pronunciation Rule Callout */}
      <div className="mt-8 bg-white rounded-2xl border border-rose-100 p-5 sm:p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-rose-900 mb-3 flex items-center gap-1.5 font-serif-title">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>Pourquoi ce guide est-il oral ?</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div>
            <h4 className="font-semibold text-rose-700 mb-1">Pas d'Écrit Thaï Complexe</h4>
            <p className="leading-relaxed">
              L'écriture thaïlandaise comporte 44 consonnes et 32 voyelles sans espaces entre les mots. En vous concentrant uniquement sur l'oral, vous apprenez à parler 5x plus vite.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-rose-700 mb-1">Mélodie et Sentiments</h4>
            <p className="leading-relaxed">
              La tendresse en thaï passe énormément par le ton et l'adoucissement de la voix. Une mauvaise prononciation peut changer "aimer" en "saleté", soyez vigilant !
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-rose-700 mb-1">Les Mots du Cœur</h4>
            <p className="leading-relaxed">
              Dire "khrap" (homme) et "kha" (femme) à la fin des mots, ou s'appeler "Teerak" (mon amour) exprime instantanément un attachement sincère apprécié en Thaïlande.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
