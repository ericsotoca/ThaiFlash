import React, { useState } from 'react';
import { speakThai } from '../utils/audio';
import { Volume2, HelpCircle, AlertTriangle, Check, Play, VolumeX, Smartphone } from 'lucide-react';

export const AudioTroubleshooter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  const handleTestSound = () => {
    setIsPlayingTest(true);
    // Let's speak a cheerful welcome in Thai
    const success = speakThai('สวัสดีค่ะที่รัก', 0.8, () => {
      setIsPlayingTest(false);
    });
    setTestSuccess(success);
  };

  return (
    <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
            <Volume2 className="w-3.5 h-3.5 text-white" />
          </span>
          <p className="font-medium text-center sm:text-left">
            <strong>Problème de son ?</strong> Si vous n'entendez rien, lisez nos instructions rapides ci-dessous.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTestSound}
            disabled={isPlayingTest}
            className="px-3 py-1.5 bg-white text-rose-700 font-bold rounded-lg hover:bg-rose-50 transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
          >
            {isPlayingTest ? (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span>{isPlayingTest ? 'Lecture...' : 'Tester le son'}</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-2.5 py-1.5 bg-rose-700/60 hover:bg-rose-700 text-white font-semibold rounded-lg border border-white/20 transition-all cursor-pointer shrink-0"
          >
            {isOpen ? 'Masquer l\'aide' : 'Aide Audio / iPhone 📱'}
          </button>
        </div>
      </div>

      {/* Expanded troubleshooter guidelines */}
      {isOpen && (
        <div className="bg-white text-slate-800 border-t border-rose-100 p-4 sm:p-6 transition-all animate-fadeIn">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
            {/* Column 1: iPhone/iOS critical notice */}
            <div className="space-y-2 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
              <h4 className="font-bold text-rose-700 flex items-center gap-1.5 text-sm">
                <Smartphone className="w-4 h-4 text-rose-600" />
                <span>IMPORTANT pour iPhone / iPad</span>
              </h4>
              <p className="text-slate-600">
                Sur les appareils Apple (iPhone, iPad), le <strong>bouton physique Silencieux</strong> (le petit levier sur le côté gauche au-dessus des touches de volume) bloque le son du navigateur Internet.
              </p>
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg font-medium flex items-start gap-1.5 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Poussez le commutateur latéral vers le haut pour <strong>désactiver le mode vibreur/silencieux</strong> (il ne doit pas laisser apparaître de couleur orange).</span>
              </div>
            </div>

            {/* Column 2: Volume & systems */}
            <div className="space-y-2 p-1">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <VolumeX className="w-4 h-4 text-slate-600" />
                <span>Volume & Sortie Audio</span>
              </h4>
              <p className="text-slate-600">
                Vérifiez que le volume multimédia de votre téléphone ou de votre ordinateur est monté au maximum.
              </p>
              <p className="text-slate-600">
                Si vous apprenez dans un lieu public ou que le commutateur latéral de votre iPhone est bloqué, <strong>branchez des écouteurs ou un casque audio</strong>. Cela force la lecture sonore même en mode silencieux !
              </p>
            </div>

            {/* Column 3: Browser fallback & testing */}
            <div className="space-y-2 p-1">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Vérification Technique</span>
              </h4>
              <p className="text-slate-600">
                Notre application intègre un <strong>système de double flux</strong>. Si le synthétiseur de votre navigateur fait défaut, nous chargeons instantanément les enregistrements audio officiels de Google Traduction.
              </p>
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={handleTestSound}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tester avec « Sawatdee khâ »</span>
                </button>
                {testSuccess !== null && (
                  <p className="text-center text-3xs font-semibold text-emerald-600">
                    {testSuccess ? "✓ Commande audio envoyée avec succès !" : "⚠️ Échec de la commande de test."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
