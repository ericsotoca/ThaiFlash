export interface GuideTopic {
  title: string;
  description: string;
  details: {
    label: string;
    sublabel: string;
    audioText?: string;
    explanation: string;
  }[];
}

export const THAI_ORAL_GUIDE: GuideTopic[] = [
  {
    title: "1. Les Pronoms & Mots Doux du Couple",
    description: "En couple, les Thaïlandais utilisent des pronoms très spécifiques et affectueux qui renforcent la complicité. Ne faites pas l'erreur d'utiliser des termes trop formels !",
    details: [
      {
        label: "ผม (phǒm)",
        sublabel: "Prononciation : 'p-hom' (ton montant)",
        audioText: "ผม",
        explanation: "Pronom 'Je' pour l'homme français. À utiliser dans toutes vos phrases pour être poli et charmant."
      },
      {
        label: "หนู (nǔu)",
        sublabel: "Prononciation : 'nouu' (ton montant)",
        audioText: "หนู",
        explanation: "Pronom adoré utilisé par la femme thaïlandaise pour dire 'Je' (signifie littéralement 'petite souris'). L'homme peut aussi l'utiliser comme un doux 'Tu' ('ma puce') pour s'adresser à elle."
      },
      {
        label: "พี่ (phîi)",
        sublabel: "Prononciation : 'pii' (ton descendant)",
        audioText: "พี่",
        explanation: "Signifie à l'origine 'frère/sœur aîné(e)'. Très souvent utilisé par la femme pour dire 'Tu/Mon chéri' si son partenaire français est un peu plus âgé qu'elle, marquant un respect affectueux."
      },
      {
        label: "น้อง (nɔ́ɔnɡ)",
        sublabel: "Prononciation : 'nɔɔng' (ton haut)",
        audioText: "น้อง",
        explanation: "Signifie 'cadet(te)'. Utilisé par l'homme pour dire 'Tu/Ma chérie' si sa compagne est plus jeune."
      },
      {
        label: "ที่รัก (thîi-rák)",
        sublabel: "Prononciation : 'tii-rak'",
        audioText: "ที่รัก",
        explanation: "L'équivalent direct de 'Chéri(e)' ou 'Mon amour'. Universel et très romantique."
      }
    ]
  },
  {
    title: "2. Les Particules de Politesse",
    description: "Ajouter une particule de politesse à la fin de vos phrases thaïes montre du respect et rend votre voix douce et mélodieuse. Elle dépend exclusivement du genre de la personne qui parle !",
    details: [
      {
        label: "ครับ (khráp)",
        sublabel: "Pour l'homme (Français)",
        audioText: "ครับ",
        explanation: "Particule de fin pour l'homme. Ex: 'Sawatdee khráp' (Bonjour). Rend votre discours respectueux et viril. En couple, cela montre une douce attention."
      },
      {
        label: "ค่ะ / คะ (khâ / khá)",
        sublabel: "Pour la femme (Thaïlandaise)",
        audioText: "ค่ะ",
        explanation: "ค่ะ (khâ - ton descendant) s'utilise pour affirmer et répondre. คะ (khá - ton haut) s'utilise pour poser une question. Ex: 'Rak pii khâ' (Je t'aime, mon chéri)."
      }
    ]
  },
  {
    title: "3. La Magie des 5 Tons à l'Oral",
    description: "Le thaï est une langue tonale. Un même mot prononcé avec un ton différent aura une signification totalement différente ! Pratiquez l'écoute attentive de ces 5 variations :",
    details: [
      {
        label: "Ton Plat / Neutre (Mid tone)",
        sublabel: "Ex: ดี (dii - bien)",
        audioText: "ดี",
        explanation: "Votre voix reste plate, stable, comme lorsque vous chantez une note de musique continue, sans monter ni descendre."
      },
      {
        label: "Ton Bas (Low tone)",
        sublabel: "Ex: กอด (kòot - câlin)",
        audioText: "กอด",
        explanation: "Prononcé dans le registre bas de votre voix, de façon grave et contenue, sans intonation descendante."
      },
      {
        label: "Ton Descendant (Falling tone)",
        sublabel: "Ex: พี่ (phîi - grand frère)",
        audioText: "พี่",
        explanation: "Partez d'une note haute et descendez brusquement, un peu comme si vous soupiriez avec insistance."
      },
      {
        label: "Ton Haut (High tone)",
        sublabel: "Ex: รัก (rák - aimer)",
        audioText: "รัก",
        explanation: "Prononcé de manière aiguë et tendue, en montant légèrement au sommet de votre registre de voix normale."
      },
      {
        label: "Ton Montant (Rising tone)",
        sublabel: "Ex: ผม (phǒm - je / cheveux)",
        audioText: "ผม",
        explanation: "Partez d'une note basse et remontez vers le haut, comme si vous posiez une question surprise en français ('Hein ?')."
      }
    ]
  }
];
