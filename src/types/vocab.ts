export type WordMastery = 'new' | 'learning' | 'review' | 'mastered';

export interface ThaiWord {
  id: string;
  thai: string;
  french: string;
  phonetic: string;
  tone: 'mid' | 'low' | 'falling' | 'high' | 'rising' | 'mélangé';
  speaker: 'homme' | 'femme' | 'les deux';
  category: string;
  exampleThai: string;
  examplePhonetic: string;
  exampleFr: string;
  notes?: string;
}

export type StudyDirection = 'fr-to-th' | 'th-to-fr';

export type AppTab = 'flashcards' | 'quiz' | 'dialogues' | 'matching' | 'dictionary' | 'guide' | 'games';

export interface UserProgress {
  mastery: Record<string, WordMastery>;
  favorites: string[];
  history: {
    cardsStudied: number;
    quizCompleted: number;
    correctAnswers: number;
    streakDays: number;
    lastActiveDate: string;
  };
}
