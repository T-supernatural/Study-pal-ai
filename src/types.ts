export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  memorized: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  selectedAnswer?: string;
}

export interface StudyNote {
  id: string;
  title: string;
  category: string;
  originalImage?: string; // base64 representation or file pointer
  textContent: string; // extracted text (OCR)
  summary?: string; // AI generated summary
  createdAt: string;
  studyProgress: number; // percentage completed (0 to 100)
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  audioUrl?: string; // Cache local audio file or link
}

export interface LearningStats {
  streakDays: number;
  lastStudyDate?: string;
  dailyGoalLessons: number;
  completedLessonsToday: number;
  totalStudyMinutes: number;
  lessonsHistoryCount: number; // Number of items processed
}

export type ActiveTab = "home" | "library" | "upload" | "audio" | "profile";
export type ThemeMode = "light" | "glass" | "neumorphic";
