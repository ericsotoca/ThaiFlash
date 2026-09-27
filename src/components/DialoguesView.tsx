import React, { useState } from 'react';
import { speakThai } from '../utils/audio';
import { Volume2, Heart, MessageSquare, ArrowRight, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';

interface DialogueLine {
  id: number;
  speaker: 'lui' | 'elle';
  thai: string;
  phonetic: string;
  french: string;
  notes?: string;
}

interface DialogueScenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  lines: DialogueLine[];
  userChoices: {
    lineIndex: number; // after which line index does the user have to make a choice
    options: {
      text: string;
      thai: string;
      phonetic: string;
      isCorrect: boolean;
      feedback: string;
    }[];
  }[];
}

const DIALOGUES_DATA: DialogueScenario[] = [
  {
    id: 'sc-1',
    title: 'Scene 1 : Les Retrouvailles & Compliments',
    description: 'Vous vous retrouvez enfin après une longue journée. Vous lui faites des compliments et lui demandez si elle va bien.',
    icon: '✈️',
    lines: [
      {
        id: 1,
        speaker: 'elle',
        thai: 'พี่คะ คิดถึงจังเลยค่ะ',
        phonetic: 'phîi khá, khít-thǔenɡ caŋ loie khâ',
        french: 'Mon chéri, tu m\'as tellement manqué !',
        notes: 'Elle commence en vous appelant "phîi" (mon chéri) et utilise la particule de politesse féminine "khâ".'
      },
      // USER TURN HERE
      {
        id: 2,
        speaker: 'lui',
        thai: 'คิดถึงเหมือนกันครับตัวเล็ก วันนี้คุณสวยมากครับ',
        phonetic: 'khít-thǔenɡ mʉ̌an-kan khráp tua-lék, wan-nii khun sǔay mâak khráp',
        french: 'Tu m\'as manqué aussi, ma puce. Tu es magnifique aujourd\'hui.',
      },
      {
        id: 3,
        speaker: 'elle',
        thai: 'จริงเหรอคะ ปากหวานจัง',
        phonetic: 'ciŋ rʉ̌ʉ khá, pàak wǎan caŋ',
        french: 'C\'est vrai ? Tu es un vrai séducteur (litt. tu as la bouche sucrée) !',
      },
      {
        id: 4,
        speaker: 'lui',
        thai: 'พูดจริงครับ ผมรักคุณที่สุดเลย',
        phonetic: 'phûut ciŋ khráp, phǒm rák khun thîi-sùt loie',
        french: 'Je suis très sérieux. Je t\'aime plus que tout.',
      }
    ],
    userChoices: [
      {
        lineIndex: 0, // After Line 1, User has to choose Line 2
        options: [
          {
            text: 'Tu m\'as manqué aussi, ma puce. Tu es magnifique aujourd\'hui.',
            thai: 'คิดถึงเหมือนกันครับตัวเล็ก วันนี้คุณสวยมากครับ',
            phonetic: 'khít-thǔenɡ mʉ̌an-kan khráp tua-lék, wan-nii khun sǔay mâak khráp',
            isCorrect: true,
            feedback: 'Parfait ! Vous utilisez "khráp" (polite masculin) et le surnom mignon "tua-lék" (ma puce) !'
          },
          {
            text: 'Je n\'ai pas faim, merci.',
            thai: 'ไม่หิวข้าวครับ ขอบคุณ',
            phonetic: 'mâi hǐu khâaw khráp, khɔ̀ɔp-khun',
            isCorrect: false,
            feedback: 'Oups, ce n\'est pas très romantique de répondre qu\'on n\'a pas faim à un câlin !'
          },
          {
            text: 'Je t\'aime, mon grand frère (féminin).',
            thai: 'รักพี่ที่สุดเลยค่ะ',
            phonetic: 'rák phîi thîi-sùt loie khâ',
            isCorrect: false,
            feedback: 'Erreur de genre ! Vous utilisez "khâ" (particule féminine) et "phîi" (qui est ce qu\'elle utilise pour VOUS appeler) !'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-2',
    title: 'Scene 2 : Le Dîner en Amoureux',
    description: 'Elle vous a préparé un délicieux repas thaï fait maison. Vous la remerciez et la complimentez.',
    icon: '🍛',
    lines: [
      {
        id: 1,
        speaker: 'elle',
        thai: 'พี่คะ กินข้าวหรือยังคะ หนูทำแกงเขียวหวานให้ค่ะ',
        phonetic: 'phîi khá, kin khâaw rʉ̌ʉ-yaŋ khá? nǔu tham kɛɛŋ-khǐaw-wǎan hâi khâ',
        french: 'Mon chéri, as-tu mangé ? Je t\'ai préparé un curry vert.',
        notes: 'Elle se désigne par "nǔu" (petite souris/Je) ce qui est extrêmement affectueux.'
      },
      // USER TURN HERE
      {
        id: 2,
        speaker: 'lui',
        thai: 'ยังครับ หิวมากเลย ฝีมือคุณอร่อยที่สุดในโลกครับ',
        phonetic: 'yaŋ khráp, hǐu mâak loie. fǐi-mʉʉ khun a-ròi thîi-sùt nai lôok khráp',
        french: 'Pas encore, j\'ai très faim ! Ta cuisine est la meilleure du monde.',
      },
      {
        id: 3,
        speaker: 'elle',
        thai: 'ดีใจที่ชอบนะ ทานเยอะๆนะคะที่รัก',
        phonetic: 'dii-cay thîi chôop ná. thāan yə́-yə́ ná khá thîi-rák',
        french: 'Je suis ravie que ça te plaise. Mange beaucoup, mon amour !',
      }
    ],
    userChoices: [
      {
        lineIndex: 0,
        options: [
          {
            text: 'Pas encore, j\'ai très faim ! Ta cuisine est la meilleure du monde.',
            thai: 'ยังครับ หิวมากเลย ฝีมือคุณอร่อยที่สุดในโลกครับ',
            phonetic: 'yaŋ khráp, hǐu mâak loie. fǐi-mʉʉ khun a-ròi thîi-sùt nai lôok khráp',
            isCorrect: true,
            feedback: 'Excellent ! Complimenter son art de cuisiner ("fǐi-mʉʉ khun") touche directement le cœur d\'une femme thaïe.'
          },
          {
            text: 'Je suis désolé, je dors.',
            thai: 'ขอโทษครับ นอนแล้ว',
            phonetic: 'khɔ̌ɔ-thôot khráp, nɔɔn lǽw',
            isCorrect: false,
            feedback: 'Inapproprié : elle vient de cuisiner un bon petit plat pour vous !'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-3',
    title: 'Scene 3 : Faire la Paix après une Dispute',
    description: 'Elle boude ("ngon") dans son coin suite à une petite dispute. Vous venez apaiser les tensions avec douceur.',
    icon: '💖',
    lines: [
      {
        id: 1,
        speaker: 'elle',
        thai: 'ไม่ต้องมาคุยเลยค่ะ หนูโกรธแล้ว',
        phonetic: 'mâi tôonɡ maa khuy loie khâ. nǔu kròot lǽw',
        french: 'Ne viens même pas me parler. Je suis fâchée !',
        notes: 'Le verbe bouder/être fâché mignonnement en thaï se dit "ngon" ou "kroot".'
      },
      // USER TURN HERE
      {
        id: 2,
        speaker: 'lui',
        thai: 'ที่รัก ผมขอโทษครับ หายงอนนะ เดี๋ยวพาไปกินของอร่อยครับ',
        phonetic: 'thîi-rák, phǒm khɔ̌ɔ-thôot khráp. hǎay nɔɔn ná khráp, dǐaw phaa pai kin khɔ̌ɔnɡ a-ròi khráp',
        french: 'Mon amour, je suis désolé. Ne boude plus, je t\'emmène manger quelque chose de bon.',
      },
      {
        id: 3,
        speaker: 'elle',
        thai: 'จะเลี้ยงจริงเหรอคะ... งั้นยกโทษให้กก็ได้ค่ะ',
        phonetic: 'cà líaŋ ciŋ rʉ̌ʉ khá... ŋán yók-thôot hâi kɔ̂ɔ dâai khâ',
        french: 'Tu m\'invites vraiment ? ... Bon, d\'accord, je te pardonne alors !',
      },
      {
        id: 4,
        speaker: 'lui',
        thai: 'ขอบคุณครับ ดีกันนะที่รัก รักคุณคนเดียวครับ',
        phonetic: 'khɔ̀ɔp-khun khráp. dii kan ná thîi-rák, rák khun khon diaw khráp',
        french: 'Merci. On fait la paix mon amour ? Je n\'aime que toi.',
      }
    ],
    userChoices: [
      {
        lineIndex: 0,
        options: [
          {
            text: 'Mon amour, je suis désolé. Ne boude plus, je t\'emmène manger...',
            thai: 'ที่รัก ผมขอโทษครับ หายงอนนะ เดี๋ยวพาไปกินของอร่อยครับ',
            phonetic: 'thîi-rák, phǒm khɔ̌ɔ-thôot khráp. hǎay nɔɔn ná khráp, dǐaw phaa pai kin khɔ̌ɔnɡ a-ròi khráp',
            isCorrect: true,
            feedback: 'Magnifique ! "Hǎay nɔɔn" (arrêter de bouder) combiné à l\'offre de nourriture délicieuse est l\'arme absolue pour faire la paix.'
          },
          {
            text: 'C\'est de ta faute !',
            thai: 'คุณผิดเองนะ',
            phonetic: 'khun phìt eeŋ ná',
            isCorrect: false,
            feedback: 'Mauvaise idée ! Jeter la faute sur elle ne fera que prolonger la dispute.'
          }
        ]
      }
    ]
  }
];

export const DialoguesView: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userFeedback, setUserFeedback] = useState<string | null>(null);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [isScenarioFinished, setIsScenarioFinished] = useState(false);

  const activeScenario = DIALOGUES_DATA.find((s) => s.id === selectedScenarioId);

  const startScenario = (id: string) => {
    setSelectedScenarioId(id);
    setCurrentLineIndex(0);
    setUserFeedback(null);
    setSelectedChoiceIndex(null);
    setIsScenarioFinished(false);

    // Auto play first line if it is by her
    const sc = DIALOGUES_DATA.find((s) => s.id === id);
    if (sc && sc.lines[0]) {
      setTimeout(() => {
        speakThai(sc.lines[0].thai, 0.8);
      }, 300);
    }
  };

  const handlePlayLine = (text: string) => {
    speakThai(text, 0.8);
  };

  const handleNextLine = () => {
    if (!activeScenario) return;
    setUserFeedback(null);
    setSelectedChoiceIndex(null);

    const nextIndex = currentLineIndex + 1;
    if (nextIndex < activeScenario.lines.length) {
      setCurrentLineIndex(nextIndex);
      // Auto play if it is her turn
      if (activeScenario.lines[nextIndex].speaker === 'elle') {
        speakThai(activeScenario.lines[nextIndex].thai, 0.8);
      }
    } else {
      setIsScenarioFinished(true);
    }
  };

  const handleSelectOption = (optIndex: number, isCorrect: boolean, feedback: string) => {
    if (!activeScenario) return;
    setSelectedChoiceIndex(optIndex);
    setUserFeedback(feedback);

    if (isCorrect) {
      // Play the correct Thai audio so user can hear their own line spoken perfectly
      const currentChoice = activeScenario.userChoices.find((c) => c.lineIndex === currentLineIndex);
      if (currentChoice) {
        speakThai(currentChoice.options[optIndex].thai, 0.75);
      }
    }
  };

  const isUserTurn = activeScenario
    ? activeScenario.userChoices.some((choice) => choice.lineIndex === currentLineIndex) && selectedChoiceIndex === null
    : false;

  const currentChoice = activeScenario
    ? activeScenario.userChoices.find((choice) => choice.lineIndex === currentLineIndex)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-6 py-2 sm:py-6">
      {!selectedScenarioId ? (
        // Scenario Selection Screen
        <div>
          <div className="mb-4 sm:mb-8 text-center">
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900 font-serif-title flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-current animate-pulse" />
              <span>Simulateur de Conversations Réelles</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto mt-1 sm:mt-2">
              Entraînez-vous à répondre oralement dans des situations concrètes de la vie de couple franco-thaïlandaise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:grid-cols-3">
            {DIALOGUES_DATA.map((sc) => (
              <div
                key={sc.id}
                className="bg-white rounded-2xl border border-rose-100 p-4 sm:p-6 flex flex-col justify-between hover:shadow-xs transition-shadow duration-150"
              >
                <div>
                  <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">{sc.icon}</div>
                  <h3 className="text-sm sm:text-lg font-bold text-slate-950 font-serif-title mb-1 sm:mb-2">
                    {sc.title}
                  </h3>
                  <p className="text-slate-600 text-3xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                    {sc.description}
                  </p>
                </div>

                <button
                  onClick={() => startScenario(sc.id)}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-3xs sm:text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Lancer la simulation</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Active Scenario Simulation Screen
        activeScenario && (
          <div className="max-w-2xl mx-auto">
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-100">
              <button
                onClick={() => setSelectedScenarioId(null)}
                className="text-3xs sm:text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                ← Retour aux scénarios
              </button>
              <span className="text-4xs sm:text-2xs text-slate-400 font-mono">
                {activeScenario.title}
              </span>
            </div>

            {isScenarioFinished ? (
              // Scenario Finished Screen
              <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-8 text-center shadow-xs">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2 font-serif-title">
                  Dialogue complété avec succès !
                </h3>
                <p className="text-slate-600 text-3xs sm:text-sm mb-4 sm:mb-6 max-w-md mx-auto">
                  Félicitations, vous avez su trouver les bons mots pour communiquer avec douceur et politesse en thaïlandais !
                </p>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <button
                    onClick={() => startScenario(activeScenario.id)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-3xs sm:text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Recommencer</span>
                  </button>
                  <button
                    onClick={() => setSelectedScenarioId(null)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-3xs sm:text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    Choisir un autre thème
                  </button>
                </div>
              </div>
            ) : (
              // Active Conversation Screen
              <div className="space-y-4">
                {/* Chat Log container */}
                <div className="bg-slate-50/50 rounded-2xl border border-rose-100/50 p-2.5 sm:p-4 min-h-[180px] space-y-3 shadow-inner overflow-y-auto">
                  {activeScenario.lines.slice(0, currentLineIndex + 1).map((line, idx) => {
                    const isUser = line.speaker === 'lui';
                    return (
                      <div
                        key={line.id}
                        className={`flex gap-2.5 max-w-[90%] sm:max-w-[85%] ${
                          isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-full shrink-0 flex items-center justify-center text-4xs sm:text-xs font-bold shadow-2xs select-none ${
                            isUser ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {isUser ? 'Lui' : 'Elle'}
                        </div>

                        {/* Bubble */}
                        <div className="space-y-1">
                          <div
                            className={`p-2.5 sm:p-3.5 rounded-2xl text-xs shadow-2xs ${
                              isUser
                                ? 'bg-sky-600 text-white rounded-tr-none'
                                : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-none'
                            }`}
                          >
                            <p className="font-bold text-xs sm:text-base leading-snug">
                              {line.phonetic}
                            </p>
                            <p className={`text-3xs mt-0.5 ${isUser ? 'text-sky-100' : 'text-slate-400 font-serif-title'}`}>
                              ({line.thai})
                            </p>
                            <p className={`text-2xs sm:text-xs mt-1 border-t pt-1 font-medium ${isUser ? 'border-sky-500/50 text-sky-100' : 'border-slate-100 text-slate-600'}`}>
                              {line.french}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handlePlayLine(line.thai)}
                              className="text-4xs sm:text-3xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-0.5 px-0.5"
                            >
                              <Volume2 className="w-2.5 h-2.5" /> Écouter
                            </button>
                            {line.notes && (
                              <span className="text-4xs sm:text-3xs text-slate-400 italic">
                                💡 {line.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Question choice or Next Line button */}
                <div className="bg-white rounded-2xl border border-rose-100 p-3 sm:p-5 shadow-2xs">
                  {isUserTurn && currentChoice ? (
                    // User choice options
                    <div>
                      <h4 className="text-3xs sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-rose-500" />
                        <span>À votre tour : Choisissez votre réponse (Lui)</span>
                      </h4>

                      <div className="space-y-2">
                        {currentChoice.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(idx, opt.isCorrect, opt.feedback)}
                            className="w-full text-left p-2.5 sm:p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/10 transition-all text-xs font-semibold text-slate-800 flex items-start gap-2 sm:gap-3 cursor-pointer"
                          >
                            <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-3xs sm:text-2xs shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-slate-900 font-medium text-xs sm:text-sm">{opt.text}</p>
                              <p className="text-slate-500 text-3xs italic font-normal mt-0.5">
                                « {opt.phonetic} »
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Next block / Feedback screen
                    <div>
                      {userFeedback && (
                        <div className="mb-3 p-2.5 bg-rose-50/50 rounded-xl border border-rose-100 flex items-start gap-1.5 animate-fadeIn">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="text-3xs sm:text-xs text-rose-950 leading-normal">
                            <strong>Retour :</strong> {userFeedback}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-1">
                        <p className="text-4xs sm:text-2xs text-slate-400">
                          {userFeedback ? "Entraînez-vous à prononcer à haute voix puis continuez" : "Écoutez la phrase puis continuez"}
                        </p>
                        <button
                          onClick={handleNextLine}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-3xs sm:text-xs font-semibold shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>Continuer</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
