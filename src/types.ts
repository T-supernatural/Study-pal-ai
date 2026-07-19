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
  topic?: string;
  originalImage?: string; // base64 representation of a single image
  originalImages?: string[]; // support multiple images
  pdfName?: string; // support PDF source
  pdfPageCount?: number;
  textContent: string; // extracted text (OCR)
  cleanNotes?: string; // AI cleaned/restructured notes
  summary?: string; // AI generated short summary (100-150 words)
  detailedSummary?: string; // AI generated detailed summary
  keyConcepts?: string[]; // array of key concepts
  importantDefinitions?: { term: string; definition: string }[]; // definitions
  keywords?: string[]; // keywords list
  revisionTips?: string[]; // revision tips
  examTips?: string[]; // exam tips
  practiceQuestions?: string[]; // open-ended practice questions
  estimatedReadingTime?: number; // reading time in minutes
  estimatedListeningTime?: number; // listening time in minutes
  difficultyLevel?: "Beginner" | "Intermediate" | "Advanced";
  createdAt: string;
  studyProgress: number; // percentage completed (0 to 100)
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  audioUrl?: string; // Cache local audio file or link
  tickedConcepts?: string[]; // track which core concepts have been checked off
  audioListened?: boolean; // track if the student listened to the audio
  quizHighScore?: number; // highest score on the quiz (out of 100)
  chatHistory?: { role: "user" | "model"; text: string }[];
}

export interface LearningStats {
  streakDays: number;
  lastStudyDate?: string;
  dailyGoalLessons: number;
  completedLessonsToday: number;
  totalStudyMinutes: number;
  lessonsHistoryCount: number; // Number of items processed
  unlockedBadges?: string[]; // track unlocked achievement badges
}

export interface StudentIdentity {
  name: string;
  preferredClass: string;
  favoriteSubject: string;
  dailyGoal: number; // daily lesson count goal
  avatarId: string; // e.g. "student-1" to "student-6"
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "streak" | "lesson" | "quiz" | "flashcard" | "achievement" | "goal" | "system";
  createdAt: string;
  read: boolean;
}

export type ActiveTab = "home" | "library" | "upload" | "audio" | "profile";
export type ThemeMode = "light" | "glass" | "neumorphic";
