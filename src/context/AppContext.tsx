import React, { createContext, useContext, useState, useEffect } from "react";
import { StudyNote, LearningStats, ActiveTab, ThemeMode, QuizQuestion, StudentIdentity, NotificationItem } from "../types";
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
  
  // Student Identity & Onboarding
  studentIdentity: StudentIdentity | null;
  isOnboarded: boolean;
  saveOnboardingIdentity: (identity: StudentIdentity) => void;
  updateIdentity: (identity: Partial<StudentIdentity>) => void;
  
  // Undo deletion support
  lastDeletedNote: StudyNote | null;
  undoDeleteNote: () => void;
  clearLastDeletedNote: () => void;

  // Notification center
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, type: NotificationItem["type"]) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const defaultStats: LearningStats = {
  streakDays: 4, // Initial mockup values for high quality layout
  dailyGoalLessons: 3,
  completedLessonsToday: 2,
  totalStudyMinutes: 120,
  lessonsHistoryCount: 3,
  unlockedBadges: [
    "consistency-1", "consistency-2",
    "focus-1", "focus-2",
    "curator-1", "curator-2",
    "quiz-1"
  ],
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

  // Undo support state
  const [lastDeletedNote, setLastDeletedNote] = useState<StudyNote | null>(null);

  // Onboarding & Identity state
  const [studentIdentity, setStudentIdentity] = useState<StudentIdentity | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  // Notification Center state
  const [notifications, setNotificationsState] = useState<NotificationItem[]>([]);

  const clearRecentBadge = () => setRecentlyUnlockedBadge(null);

  // Fetch local identity and notifications on load
  useEffect(() => {
    // 1. Identity
    const savedIdentity = localStorage.getItem("studypal_identity");
    const onboardedFlag = localStorage.getItem("studypal_onboarded");
    if (savedIdentity && onboardedFlag === "true") {
      setStudentIdentity(JSON.parse(savedIdentity));
      setIsOnboarded(true);
    } else {
      setIsOnboarded(false);
    }

    // 2. Notifications
    const savedNotifications = localStorage.getItem("studypal_notifications");
    if (savedNotifications) {
      setNotificationsState(JSON.parse(savedNotifications));
    } else {
      // Seed starter high quality notifications
      const starterNotifications: NotificationItem[] = [
        {
          id: "welcome-notif",
          title: "Welcome to StudyPal AI! 🌟",
          message: "We're thrilled to have you here. Ready to supercharge your study routine? Try uploading notes or a PDF to create your first dynamic Study Pack!",
          type: "system",
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10m ago
          read: false,
        },
        {
          id: "streak-notif",
          title: "4-Day Study Streak Active 🔥",
          message: "You have maintained an awesome 4-day study streak! Keep completing study packs to unlock the elite Consistency Champ badge.",
          type: "streak",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
          read: false,
        }
      ];
      setNotificationsState(starterNotifications);
      localStorage.setItem("studypal_notifications", JSON.stringify(starterNotifications));
    }
  }, []);

  // Sync notifications to localStorage
  const saveNotificationsToStorage = (updatedNotifs: NotificationItem[]) => {
    setNotificationsState(updatedNotifs);
    localStorage.setItem("studypal_notifications", JSON.stringify(updatedNotifs));
  };

  // Helper to add local notification
  const addNotification = (title: string, message: string, type: NotificationItem["type"]) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false,
    };
    saveNotificationsToStorage([newNotif, ...notifications]);
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotificationsToStorage(updated);
  };

  const clearAllNotifications = () => {
    saveNotificationsToStorage([]);
  };

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

    // Define Progressive Thresholds
    const thresholds = {
      focus: { name: "Focus Paladin", levels: [15, 60, 150, 300, 600] },
      consistency: { name: "Consistency Champ", levels: [1, 3, 5, 10, 21] },
      curator: { name: "Curator of Wisdom", levels: [1, 3, 5, 10, 20] },
      quiz: { name: "Quiz Master", levels: [1, 2, 4, 7, 12] },
    };

    const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

    // Focus Paladin
    for (let l = 1; l <= 5; l++) {
      const val = thresholds.focus.levels[l - 1];
      const badgeCode = `focus-${l}`;
      if (updatedStats.totalStudyMinutes >= val && !newUnlocked.includes(badgeCode)) {
        newUnlocked.push(badgeCode);
        newlyUnlockedId = badgeCode;
      }
    }

    // Consistency Champ
    for (let l = 1; l <= 5; l++) {
      const val = thresholds.consistency.levels[l - 1];
      const badgeCode = `consistency-${l}`;
      if (updatedStats.streakDays >= val && !newUnlocked.includes(badgeCode)) {
        newUnlocked.push(badgeCode);
        newlyUnlockedId = badgeCode;
      }
    }

    // Curator of Wisdom
    for (let l = 1; l <= 5; l++) {
      const val = thresholds.curator.levels[l - 1];
      const badgeCode = `curator-${l}`;
      if (updatedStats.lessonsHistoryCount >= val && !newUnlocked.includes(badgeCode)) {
        newUnlocked.push(badgeCode);
        newlyUnlockedId = badgeCode;
      }
    }

    // Quiz Master
    let perfectQuizCount = notes.filter((n) => n.quizHighScore === 100).length;
    if (recentQuizScore === 100) {
      perfectQuizCount = Math.max(perfectQuizCount, 1);
    }
    for (let l = 1; l <= 5; l++) {
      const val = thresholds.quiz.levels[l - 1];
      const badgeCode = `quiz-${l}`;
      if (perfectQuizCount >= val && !newUnlocked.includes(badgeCode)) {
        newUnlocked.push(badgeCode);
        newlyUnlockedId = badgeCode;
      }
    }

    if (newlyUnlockedId) {
      setRecentlyUnlockedBadge(newlyUnlockedId);
      
      const parts = newlyUnlockedId.split("-");
      const trackId = parts[0];
      const levelNum = parseInt(parts[1]) || 1;
      const tierName = tiers[levelNum - 1] || "Bronze";
      const trackName = (thresholds as any)[trackId]?.name || "Milestone Master";

      addNotification(
        `Achievement Unlocked: ${trackName} (${tierName})! 🏆`,
        `Sensational! You have unlocked the ${tierName} level of your ${trackName} badge. Keep up the amazing work!`,
        "achievement"
      );

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
                  options: ["Two distinct real roots", "One real repeated root", "Two complex conjugate roots", "No roots exist at all"],
                  correctAnswer: "Two complex conjugate roots",
                  explanation: "A negative discriminant means the square root part in the quadratic formula yields an imaginary number, giving two complex roots."
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

  // Onboarding action
  const saveOnboardingIdentity = (identity: StudentIdentity) => {
    setStudentIdentity(identity);
    setIsOnboarded(true);
    localStorage.setItem("studypal_identity", JSON.stringify(identity));
    localStorage.setItem("studypal_onboarded", "true");

    // Initialize fresh statistics adapted to their daily goal
    const freshStats: LearningStats = {
      streakDays: 1,
      completedLessonsToday: 0,
      dailyGoalLessons: identity.dailyGoal || 3,
      lessonsHistoryCount: notes.length,
      totalStudyMinutes: 0,
      unlockedBadges: ["streak-master"], // default badge unlocked to encourage
    };
    setStats(freshStats);
    saveLearningStatsDB(freshStats);

    addNotification(
      `Welcome ${identity.name}! 👋`,
      `Your study profile is successfully set up for ${identity.favoriteSubject || "your subjects"}. Let's work together to reach your goal of ${identity.dailyGoal} lessons today!`,
      "system"
    );
  };

  const updateIdentity = (identity: Partial<StudentIdentity>) => {
    if (!studentIdentity) return;
    const updated = { ...studentIdentity, ...identity };
    setStudentIdentity(updated);
    localStorage.setItem("studypal_identity", JSON.stringify(updated));

    // If dailyGoal changed, update stats as well
    if (identity.dailyGoal !== undefined) {
      const updatedStats = { ...stats, dailyGoalLessons: identity.dailyGoal };
      setStats(updatedStats);
      saveLearningStatsDB(updatedStats);
    }

    addNotification(
      "Profile Updated ⚙️",
      "Your learning preferences and avatar have been saved successfully.",
      "system"
    );
  };

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

    addNotification(
      "Study Pack Created 📚",
      `Successfully processed "${note.title}". Key summaries, ${note.flashcards.length} flashcards, and a practice quiz are ready!`,
      "lesson"
    );
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
    const noteToDelete = notes.find(n => n.id === id);
    if (!noteToDelete) return;

    // Cache the deleted note for potential undo
    setLastDeletedNote(noteToDelete);

    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    await saveStudyNotesDB(updated);

    const updatedStats = {
      ...stats,
      lessonsHistoryCount: Math.max(0, stats.lessonsHistoryCount - 1),
    };
    setStats(updatedStats);
    await saveLearningStatsDB(updatedStats);

    if (activeNote && activeNote.id === id) {
      setActiveNote(null);
    }

    addNotification(
      "Lesson Deleted 🗑️",
      `The study pack "${noteToDelete.title}" was removed. You can undo this action from the Library view.`,
      "system"
    );
  };

  const undoDeleteNote = async () => {
    if (!lastDeletedNote) return;

    const updated = [lastDeletedNote, ...notes];
    setNotes(updated);
    await saveStudyNotesDB(updated);

    const updatedStats = {
      ...stats,
      lessonsHistoryCount: stats.lessonsHistoryCount + 1,
    };
    setStats(updatedStats);
    await saveLearningStatsDB(updatedStats);

    addNotification(
      "Deletion Undone ↩️",
      `"${lastDeletedNote.title}" has been restored to your library.`,
      "system"
    );

    setLastDeletedNote(null);
  };

  const clearLastDeletedNote = () => {
    setLastDeletedNote(null);
  };

  const incrementStudyMinutes = async (mins: number) => {
    const updatedStats = {
      ...stats,
      totalStudyMinutes: stats.totalStudyMinutes + mins,
    };
    const finalStats = await handleBadgeCheck(updatedStats);
    setStats(finalStats);
    await saveLearningStatsDB(finalStats);

    // If milestone minutes reached, post a study reminder/milestone
    if (finalStats.totalStudyMinutes % 60 === 0 || mins >= 10) {
      addNotification(
        "Study Effort Logged ⏱️",
        `You just logged ${mins} minutes of focus! Your total active learning time is now ${finalStats.totalStudyMinutes} minutes. Keep up the high level work!`,
        "streak"
      );
    }
  };

  const completeLesson = async () => {
    const nextCompleted = stats.completedLessonsToday + 1;
    const updatedStats = {
      ...stats,
      completedLessonsToday: nextCompleted,
    };
    const finalStats = await handleBadgeCheck(updatedStats);
    setStats(finalStats);
    await saveLearningStatsDB(finalStats);

    addNotification(
      "Study Pack Mastered! 🌟",
      `Great progress! You checked off all requirements for a study pack.`,
      "lesson"
    );

    // Check if daily goals reached
    if (nextCompleted === stats.dailyGoalLessons) {
      addNotification(
        "Daily Study Goal Met! 🎉",
        `Phenomenal dedication! You successfully completed your daily goal of ${stats.dailyGoalLessons} study packs. Streaks increased!`,
        "goal"
      );
    }
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

    addNotification(
      `Practice Quiz Completed 📝`,
      `You scored ${scorePct}% (${correctCount}/${questions.length} correct) on the "${note.title}" quiz.`,
      "quiz"
    );

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

    const card = note.flashcards.find(c => c.id === cardId);
    const wasMemorized = card ? card.memorized : false;

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

    // If memorized, count progress and push notifications on complete set memorization
    if (!wasMemorized) {
      const allMemorized = updatedCards.every(c => c.memorized);
      if (allMemorized) {
        addNotification(
          "Flashcards Mastered! 🧠",
          `Amazing! You have memorized all ${updatedCards.length} flashcards inside "${note.title}".`,
          "flashcard"
        );
      }
    }
  };

  const toggleConceptTicked = async (noteId: string, concept: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const currentTicked = note.tickedConcepts || [];
    const isTicked = currentTicked.includes(concept);
    const updatedTicked = isTicked
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

    if (!isTicked) {
      // Concept checked notification
      addNotification(
        "Concept Learned Check! ✔️",
        `You checked off: "${concept}" as understood! Keep checking to reach 100% mastery.`,
        "lesson"
      );
    }
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

    addNotification(
      "Audio Lecture Finished 🎧",
      `You listened to the full synthesized study lecture for "${note.title}".`,
      "lesson"
    );
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
        
        // Student Identity & Onboarding
        studentIdentity,
        isOnboarded,
        saveOnboardingIdentity,
        updateIdentity,

        // Undo deletion
        lastDeletedNote,
        undoDeleteNote,
        clearLastDeletedNote,

        // Notification Center
        notifications,
        addNotification,
        markNotificationRead,
        clearAllNotifications,
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
