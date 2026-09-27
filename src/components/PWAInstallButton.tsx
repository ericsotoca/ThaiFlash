import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Smartphone, Download, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, don't show anything
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <div className="bg-rose-50 border-b border-rose-100 px-4 py-2 flex items-center justify-between text-xs animate-fadeIn">
        <div className="flex items-center gap-2 text-rose-800 font-medium">
          <Smartphone className="w-4 h-4 text-rose-500 animate-bounce" />
          <span>Installer <strong>ThaiFlash</strong> sur votre écran d'accueil pour y jouer hors-ligne !</span>
        </div>
        <button
          onClick={install}
          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Installer</span>
        </button>
      </div>
    );
  }

  // iOS Safari flow (no beforeinstallprompt supported by Apple)
  if (isIOS) {
    return (
      <>
        <div className="bg-rose-50 border-b border-rose-100 px-4 py-2 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-rose-800 font-medium">
            <Smartphone className="w-4 h-4 text-rose-500" />
            <span>Ajoutez <strong>ThaiFlash</strong> à votre écran d'accueil pour l'accès hors-ligne !</span>
          </div>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold rounded-lg shadow-3xs transition-colors cursor-pointer shrink-0"
          >
            <span>iPhone / iPad 📱</span>
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-rose-100">
              <div className="flex items-center justify-between mb-3 border-b border-rose-50 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-rose-500" />
                  <span>Installer sur iOS (Safari)</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-3xs sm:text-xs text-slate-600 leading-relaxed space-y-2">
                Pour utiliser l'application sans réseau Internet :
                <ol className="list-decimal list-inside space-y-1.5 mt-2 font-medium text-slate-700">
                  <li>Appuyez sur le bouton de <strong>Partage</strong> <span className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-600 text-4xs">⎋</span> de Safari (en bas de votre écran).</li>
                  <li>Faites défiler vers le bas et appuyez sur <strong>Sur l'écran d'accueil</strong>.</li>
                  <li>Cliquez sur <strong>Ajouter</strong> en haut à droite.</li>
                </ol>
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-rose-600 hover:bg-rose-700 py-2 text-xs font-bold text-white shadow-2xs cursor-pointer"
              >
                C'est compris !
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
