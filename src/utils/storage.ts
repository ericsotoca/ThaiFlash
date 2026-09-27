import { UserProgress, WordMastery } from '../types/vocab';

const STORAGE_KEY = 'russoflash_user_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
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

export const loadUserProgress = (): UserProgress => {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);

    // Update streak if needed
    const today = new Date().toISOString().slice(0, 10);
    const lastActive = parsed.history?.lastActiveDate || today;

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (lastActive === yesterdayStr) {
        parsed.history.streakDays = (parsed.history.streakDays || 1) + 1;
      } else {
        parsed.history.streakDays = 1;
      }
      parsed.history.lastActiveDate = today;
    }

    return {
      mastery: parsed.mastery || {},
      favorites: parsed.favorites || [],
      history: {
        cardsStudied: parsed.history?.cardsStudied || 0,
        quizCompleted: parsed.history?.quizCompleted || 0,
        correctAnswers: parsed.history?.correctAnswers || 0,
        streakDays: parsed.history?.streakDays || 1,
        lastActiveDate: today,
      },
    };
  } catch (e) {
    console.error('Failed to load user progress:', e);
    return DEFAULT_PROGRESS;
  }
};

export const saveUserProgress = (progress: UserProgress): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save user progress:', e);
  }
};
