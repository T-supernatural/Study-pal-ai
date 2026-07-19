import React, { createContext, useContext, useState, useEffect } from "react";
import { StudyNote, LearningStats, ActiveTab, ThemeMode, QuizQuestion } from "../types";
import { loadStudyNotesDB, saveStudyNotesDB, loadLearningStatsDB, saveLearningStatsDB } from "../lib/indexedDb";

interface AppContextProps {
  notes: StudyNote[];
  stats: LearningStats;
  activeTab: ActiveTab;
  themeMode: ThemeMode;
  isLoading: boolean;
  activeNote: StudyNote | null;
  recentlyUnlockedBadge: string | null;
  clearRecentBadge: () => void;
  addNote: (note: StudyNote) => void;
  updateNote: (note: StudyNote) => void;
  deleteNote: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setThemeMode: (theme: ThemeMode) => void;
  setActiveNote: (note: StudyNote | null) => void;
  incrementStudyMinutes: (mins: number) => void;
  completeLesson: () => void;
  updateQuizAnswers: (noteId: string, questions: QuizQuestion[]) => void;
  toggleFlashcardMemorized: (noteId: string, cardId: string) => void;
  toggleConceptTicked: (noteId: string, concept: string) => void;
  markAudioListened: (noteId: string) => void;
  updateQuizHighScore: (noteId: string, scoreOutOf100: number) => void;
}

const defaultStats: LearningStats = {
  streakDays: 4, // Initial mockup values for high quality layout
  dailyGoalLessons: 6,
  completedLessonsToday: 4,
  totalStudyMinutes: 120,
  lessonsHistoryCount: 3,
  unlockedBadges: ["streak-master"],
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [stats, setStats] = useState<LearningStats>(defaultStats);
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeNote, setActiveNote] = useState<StudyNote | null>(null);
  const [recentlyUnlockedBadge, setRecentlyUnlockedBadge] = useState<string | null>(null);

  const clearRecentBadge = () => setRecentlyUnlockedBadge(null);

  const calculateMasteryProgress = (note: StudyNote): number => {
    const conceptWeight = 25;
    const audioWeight = 25;
    const flashcardWeight = 25;
    const quizWeight = 25;

    let conceptProgress = 0;
    if (note.keyConcepts && note.keyConcepts.length > 0) {
      const tickedCount = note.tickedConcepts?.length || 0;
      conceptProgress = (tickedCount / note.keyConcepts.length) * conceptWeight;
    } else {
      conceptProgress = (note.tickedConcepts && note.tickedConcepts.length > 0) ? conceptWeight : 0;
    }

    const audioProgress = note.audioListened ? audioWeight : 0;

    let flashcardProgress = 0;
    if (note.flashcards && note.flashcards.length > 0) {
      const memorizedCount = note.flashcards.filter((fc) => fc.memorized).length;
      flashcardProgress = (memorizedCount / note.flashcards.length) * flashcardWeight;
    } else {
      flashcardProgress = flashcardWeight;
    }

    const quizProgress = ((note.quizHighScore || 0) / 100) * quizWeight;

    const total = Math.round(conceptProgress + audioProgress + flashcardProgress + quizProgress);
    return Math.min(100, Math.max(0, total));
  };

  const handleBadgeCheck = async (updatedStats: LearningStats, recentQuizScore?: number): Promise<LearningStats> => {
    const currentUnlocked = updatedStats.unlockedBadges || [];
    const newUnlocked = [...currentUnlocked];
    let newlyUnlockedId: string | null = null;

    // Badge 1: Paladin of Focus (totalStudyMinutes >= 150)
    if (updatedStats.totalStudyMinutes >= 150 && !newUnlocked.includes("paladin-focus")) {
      newUnlocked.push("paladin-focus");
      newlyUnlockedId = "paladin-focus";
    }

    // Badge 2: Perfect 10 (completed quiz with 100)
    if (recentQuizScore === 100 && !newUnlocked.includes("perfect-10")) {
      newUnlocked.push("perfect-10");
      newlyUnlockedId = "perfect-10";
    }

    // Badge 3: Curator of Wisdom (lessonsHistoryCount >= 4)
    if (updatedStats.lessonsHistoryCount >= 4 && !newUnlocked.includes("curator-wisdom")) {
      newUnlocked.push("curator-wisdom");
      newlyUnlockedId = "curator-wisdom";
    }

    // Badge 4: Consistency Champ (streakDays >= 5)
    if (updatedStats.streakDays >= 5 && !newUnlocked.includes("consistency-champ")) {
      newUnlocked.push("consistency-champ");
      newlyUnlockedId = "consistency-champ";
    }

    if (newlyUnlockedId) {
      setRecentlyUnlockedBadge(newlyUnlockedId);
      const finalStats = { ...updatedStats, unlockedBadges: newUnlocked };
      return finalStats;
    }
    return updatedStats;
  };

  // 1. Initial Load from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        const cachedNotes = await loadStudyNotesDB();
        const cachedStats = await loadLearningStatsDB();
        
        // Seed some starter high-quality dummy notes only if database is completely empty
        if (cachedNotes.length === 0) {
          const starterNotes: StudyNote[] = [
            {
              id: "note-1",
              title: "Photosynthesis Notes",
              category: "Biology",
              createdAt: "2026-05-12T08:45:00Z",
              studyProgress: 50,
              textContent: "Photosynthesis is the process used by plants, algae, and some bacteria to convert light energy into chemical energy. It occurs in the chloroplasts of plant cells and involves two main stages: the light-dependent reactions and the Calvin cycle.",
              summary: "Photosynthesis is the key process transforming light energy to chemical energy within chloroplasts. It is divided into: 1. Light-dependent reactions (capturing light inside thylakoids) and 2. The Calvin cycle (synthesizing sugars in the stroma).",
              keyConcepts: [
                "Chloroplast anatomy (Thylakoid and Stroma)",
                "Light-dependent reactions capture solar photons",
                "Calvin cycle fixes Carbon Dioxide into glucose",
                "Chlorophyll pigment absorption spectra"
              ],
              tickedConcepts: ["Chloroplast anatomy (Thylakoid and Stroma)"],
              audioListened: false,
              quizHighScore: 50,
              flashcards: [
                { id: "fc-1-1", question: "Where does photosynthesis occur in plant cells?", answer: "In the chloroplasts.", memorized: true },
                { id: "fc-1-2", question: "What are the two main stages of photosynthesis?", answer: "Light-dependent reactions and the Calvin cycle.", memorized: false },
                { id: "fc-1-3", question: "Which molecule captures light energy?", answer: "Chlorophyll.", memorized: false },
              ],
              quiz: [
                {
                  id: "qz-1-1",
                  question: "Which organelle is responsible for hosting photosynthesis?",
                  options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
                  correctAnswer: "Chloroplast",
                  explanation: "Photosynthesis takes place specifically within the chloroplasts of plants, which contain the chlorophyll pigment."
                },
                {
                  id: "qz-1-2",
                  question: "What light-absorbing pigment gives plants their green color?",
                  options: ["Carotenoid", "Chlorophyll", "Melanin", "Anthocyanin"],
                  correctAnswer: "Chlorophyll",
                  explanation: "Chlorophyll is the green pigment in chloroplasts that absorbs sunlight for photosynthesis."
                }
              ]
            },
            {
              id: "note-2",
              title: "Quadratic Equations",
              category: "Mathematics",
              createdAt: "2026-05-11T12:30:00Z",
              studyProgress: 100,
              textContent: "A quadratic equation is a second-degree polynomial equation of the form ax^2 + bx + c = 0. Its roots can be solved using the quadratic formula: x = (-b ± √(b^2 - 4ac)) / 2a. The discriminant (b^2 - 4ac) determines the nature of the roots.",
              summary: "Quadratic equations are second-degree equations (ax² + bx + c = 0) solvable by factoring, completing the square, or using the Quadratic Formula. The discriminant determines real vs. complex roots.",
              keyConcepts: [
                "Standard Form (ax^2 + bx + c = 0)",
                "The Quadratic Formula application",
                "Role of Discriminant (b^2 - 4ac)"
              ],
              tickedConcepts: ["Standard Form (ax^2 + bx + c = 0)", "The Quadratic Formula application", "Role of Discriminant (b^2 - 4ac)"],
              audioListened: true,
              quizHighScore: 100,
              flashcards: [
                { id: "fc-2-1", question: "What is the standard form of a quadratic equation?", answer: "ax² + bx + c = 0", memorized: true },
                { id: "fc-2-2", question: "What is the formula for the discriminant?", answer: "D = b² - 4ac", memorized: true },
              ],
              quiz: [
                {
                  id: "qz-2-1",
                  question: "If the discriminant (b² - 4ac) is negative, what is the nature of the roots?",
                  options: ["Two real unequal roots", "One real repeated root", "Two complex conjugate roots", "No roots exist"],
                  correctAnswer: "Two complex conjugate roots",
                  explanation: "A negative discriminant results in taking the square root of a negative number, producing complex conjugate roots."
                }
              ]
            },
            {
              id: "note-3",
              title: "The Legislative Branch",
              category: "Civic Education",
              createdAt: "2026-05-10T14:15:00Z",
              studyProgress: 38,
              textContent: "The legislative branch is responsible for making laws. In the United States, it is represented by Congress, a bicameral legislature consisting of the Senate and the House of Representatives. Each state has two Senators, while House representatives are based on population.",
              summary: "The legislative branch drafts, debates, and passes laws. In the US system, Congress is bicameral, dividing authority between the Senate (equal state representation) and House of Representatives (proportional representation).",
              keyConcepts: [
                "Law-making responsibility",
                "Bicameral structure (Senate vs. House)",
                "Proportional vs. Equal representation"
              ],
              tickedConcepts: ["Law-making responsibility"],
              audioListened: false,
              quizHighScore: 0,
              flashcards: [
                { id: "fc-3-1", question: "What body makes up the US legislative branch?", answer: "Congress (Senate and House of Representatives).", memorized: false },
                { id: "fc-3-2", question: "How many Senators does each state have?", answer: "Two.", memorized: true },
              ],
              quiz: [
                {
                  id: "qz-3-1",
                  question: "Which house of Congress has representation based on a state's population?",
                  options: ["The Senate", "The House of Representatives", "The Supreme Court", "The Cabinet"],
                  correctAnswer: "The House of Representatives",
                  explanation: "The House of Representatives allocates seats proportional to state population, whereas the Senate grants exactly two seats per state."
                }
              ]
            }
          ];
          setNotes(starterNotes);
          await saveStudyNotesDB(starterNotes);
        } else {
          setNotes(cachedNotes);
        }

        if (cachedStats) {
          setStats(cachedStats);
        } else {
          await saveLearningStatsDB(defaultStats);
        }
      } catch (err) {
        console.error("Failed to load IndexedDB offline state:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. State persistence auto-triggers on modification
  const addNote = async (note: StudyNote) => {
    const updated = [note, ...notes];
    setNotes(updated);
    await saveStudyNotesDB(updated);

    const updatedStats = {
      ...stats,
      lessonsHistoryCount: stats.lessonsHistoryCount + 1,
    };
    const finalStats = await handleBadgeCheck(updatedStats);
    setStats(finalStats);
    await saveLearningStatsDB(finalStats);
  };

  const updateNote = async (note: StudyNote) => {
    const updated = notes.map((n) => (n.id === note.id ? note : n));
    setNotes(updated);
    await saveStudyNotesDB(updated);
    if (activeNote && activeNote.id === note.id) {
      setActiveNote(note);
    }
  };

  const deleteNote = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    await saveStudyNotesDB(updated);
    if (activeNote && activeNote.id === id) {
      setActiveNote(null);
    }
  };

  const incrementStudyMinutes = async (mins: number) => {
    const updatedStats = {
      ...stats,
      totalStudyMinutes: stats.totalStudyMinutes + mins,
    };
    const finalStats = await handleBadgeCheck(updatedStats);
    setStats(finalStats);
    await saveLearningStatsDB(finalStats);
  };

  const completeLesson = async () => {
    const updatedStats = {
      ...stats,
      completedLessonsToday: stats.completedLessonsToday + 1,
    };
    const finalStats = await handleBadgeCheck(updatedStats);
    setStats(finalStats);
    await saveLearningStatsDB(finalStats);
  };

  const updateQuizAnswers = async (noteId: string, questions: QuizQuestion[]) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    // Calculate score
    const correctCount = questions.filter((q) => q.selectedAnswer === q.correctAnswer).length;
    const scorePct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const newHighScore = Math.max(note.quizHighScore || 0, scorePct);

    const intermediateNote: StudyNote = {
      ...note,
      quiz: questions,
      quizHighScore: newHighScore,
    };

    const finalProgress = calculateMasteryProgress(intermediateNote);
    const updatedNote: StudyNote = {
      ...intermediateNote,
      studyProgress: finalProgress,
    };

    await updateNote(updatedNote);

    // If perfect score, trigger check for Badge Perfect 10
    if (scorePct === 100) {
      const updatedStats = await handleBadgeCheck(stats, 100);
      setStats(updatedStats);
      await saveLearningStatsDB(updatedStats);
    }
  };

  const toggleFlashcardMemorized = async (noteId: string, cardId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const updatedCards = note.flashcards.map((fc) =>
      fc.id === cardId ? { ...fc, memorized: !fc.memorized } : fc
    );

    const intermediateNote: StudyNote = {
      ...note,
      flashcards: updatedCards,
    };

    const finalProgress = calculateMasteryProgress(intermediateNote);
    const updatedNote: StudyNote = {
      ...intermediateNote,
      studyProgress: finalProgress,
    };

    await updateNote(updatedNote);
  };

  const toggleConceptTicked = async (noteId: string, concept: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const currentTicked = note.tickedConcepts || [];
    const updatedTicked = currentTicked.includes(concept)
      ? currentTicked.filter((c) => c !== concept)
      : [...currentTicked, concept];

    const intermediateNote: StudyNote = {
      ...note,
      tickedConcepts: updatedTicked,
    };

    const finalProgress = calculateMasteryProgress(intermediateNote);
    const updatedNote: StudyNote = {
      ...intermediateNote,
      studyProgress: finalProgress,
    };

    await updateNote(updatedNote);
  };

  const markAudioListened = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const intermediateNote: StudyNote = {
      ...note,
      audioListened: true,
    };

    const finalProgress = calculateMasteryProgress(intermediateNote);
    const updatedNote: StudyNote = {
      ...intermediateNote,
      studyProgress: finalProgress,
    };

    await updateNote(updatedNote);
  };

  const updateQuizHighScore = async (noteId: string, scoreOutOf100: number) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const currentHigh = note.quizHighScore || 0;
    const newHighScore = Math.max(currentHigh, scoreOutOf100);

    const intermediateNote: StudyNote = {
      ...note,
      quizHighScore: newHighScore,
    };

    const finalProgress = calculateMasteryProgress(intermediateNote);
    const updatedNote: StudyNote = {
      ...intermediateNote,
      studyProgress: finalProgress,
    };

    await updateNote(updatedNote);

    if (scoreOutOf100 === 100) {
      const updatedStats = await handleBadgeCheck(stats, 100);
      setStats(updatedStats);
      await saveLearningStatsDB(updatedStats);
    }
  };

  return (
    <AppContext.Provider
      value={{
        notes,
        stats,
        activeTab,
        themeMode,
        isLoading,
        activeNote,
        recentlyUnlockedBadge,
        clearRecentBadge,
        addNote,
        updateNote,
        deleteNote,
        setActiveTab,
        setThemeMode,
        setActiveNote,
        incrementStudyMinutes,
        completeLesson,
        updateQuizAnswers,
        toggleFlashcardMemorized,
        toggleConceptTicked,
        markAudioListened,
        updateQuizHighScore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
