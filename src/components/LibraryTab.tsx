import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { NeumorphicCard } from "./NeumorphicCard";
import { GlassPanel } from "./GlassPanel";
import { 
  ChevronLeft, Search, Edit2, Play, CheckCircle, HelpCircle, 
  Trash2, Brain, Sparkles, BookOpen, Volume2, Check, AlertCircle,
  Clock, Award, ListChecks, GraduationCap, Target, Pause, RotateCcw, 
  ArrowRight, Eye, FastForward, CheckSquare, Square, Save, Smile, X,
  MessageSquare
} from "lucide-react";
import { StudyNote, QuizQuestion, Flashcard } from "../types";

export const LibraryTab: React.FC = () => {
  const { 
    notes, 
    activeNote, 
    setActiveNote, 
    deleteNote, 
    updateNote,
    updateQuizAnswers, 
    toggleFlashcardMemorized,
    toggleConceptTicked,
    markAudioListened,
    incrementStudyMinutes,
    lastDeletedNote,
    undoDeleteNote,
    clearLastDeletedNote
  } = useApp();

  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeStudyTab, setActiveStudyTab] = useState<"notes" | "summary" | "flashcards" | "quiz" | "tutor">("notes");
  
  // Flashcards Indexing
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Single-Question Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScores, setQuizScores] = useState<Record<string, string>>({}); // quiz-id -> selected option
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [selectedOptionThisQuestion, setSelectedOptionThisQuestion] = useState<string | null>(null);

  // Audio Player State
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioMode, setAudioMode] = useState<"summary" | "glossary" | "transcript">("summary");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [visualizerHeight, setVisualizerHeight] = useState<number[]>([15, 30, 20, 45, 12, 28, 40, 20, 35]);

  // Editing Raw Text State
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [editedTextContent, setEditedTextContent] = useState("");

  // Smart Vocabulary State & Handlers
  const [selectedVocab, setSelectedVocab] = useState<{
    term: string;
    pronunciation: string;
    definition: string;
    simpleExplanation: string;
    examples: string[];
  } | null>(null);
  const [isSearchingVocab, setIsSearchingVocab] = useState(false);
  const [vocabSearchInput, setVocabSearchInput] = useState("");

  const handleVocabLookup = async (term: string, preDefinedDefinition?: string) => {
    if (!term.trim() || !activeNote) return;
    setIsSearchingVocab(true);

    try {
      const systemInstruction = `
        You are an elite dictionary, linguist, and clear academic tutor.
        The student is studying ${activeNote.category} / ${activeNote.title}.
        Provide a phonetic pronunciation guide, a standard definition, a simple intuitive explanation or analogy, and 2 helpful practical examples.
        You must output EXACTLY a single JSON object with this schema:
        {
          "term": "the term",
          "pronunciation": "approximate phonetic guide, e.g. [ foh-toh-sin-thuh-sis ]",
          "definition": "academic definition",
          "simpleExplanation": "intuitive explanation or analogy",
          "examples": ["example 1", "example 2"]
        }
      `;

      const prompt = `
        Explain the term "${term}". 
        ${preDefinedDefinition ? `The known standard definition is: "${preDefinedDefinition}". Incorporate this into the "definition" field.` : ""}
      `;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              term: { type: "STRING" },
              pronunciation: { type: "STRING" },
              definition: { type: "STRING" },
              simpleExplanation: { type: "STRING" },
              examples: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["term", "pronunciation", "definition", "simpleExplanation", "examples"]
          }
        })
      });

      if (!response.ok) {
        throw new Error("Could not fetch dictionary data");
      }

      const resData = await response.json();
      const parsed = JSON.parse(resData.text);
      setSelectedVocab(parsed);
      incrementStudyMinutes(1); // reward active curiosity
    } catch (err) {
      console.error("Vocabulary lookup error:", err);
      setSelectedVocab({
        term: term,
        pronunciation: `[ ${term.toLowerCase()} ]`,
        definition: preDefinedDefinition || "The precise definition was not found, but you can ask our interactive AI Tutor in the Ask AI tab for more info!",
        simpleExplanation: "A key concept related to the current study materials.",
        examples: ["Consult the lesson text and Ask AI tutor for deep examples!"]
      });
    } finally {
      setIsSearchingVocab(false);
    }
  };

  // AI Tutor States & Handlers
  const [chatInput, setChatInput] = useState("");
  const [isTutorTyping, setIsTutorTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleClearChat = async () => {
    if (!activeNote) return;
    const updated = {
      ...activeNote,
      chatHistory: []
    };
    await updateNote(updated);
  };

  const handleSendQuestion = async (question: string) => {
    if (!activeNote || isTutorTyping || !question.trim()) return;
    
    const previousHistory = activeNote.chatHistory || [];
    const newHistory = [...previousHistory, { role: "user" as const, text: question }];
    
    const noteWithUserMsg = {
      ...activeNote,
      chatHistory: newHistory
    };
    await updateNote(noteWithUserMsg);
    
    setIsTutorTyping(true);
    
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const systemInstruction = `
        You are an expert academic tutor and StudyPal AI companion. 
        The student is studying the attached lesson material. 
        Your goal is to answer their follow-up questions, provide simpler explanations, translate difficult terms, or give custom examples as requested.
        Keep your tone encouraging, professional, and clear. Use markdown/formatting where helpful. Keep responses highly focused, clear, and display-friendly for a mobile screen.
      `;

      const prompt = `
Lesson Title: ${activeNote.title}
Lesson Subject: ${activeNote.category}
Lesson Material Context:
"""
${activeNote.textContent}
"""

Here is the conversation history so far:
${newHistory.slice(0, -1).map(m => `${m.role === "user" ? "Student" : "StudyPal AI"}: ${m.text}`).join("\n")}

Student: ${question}
StudyPal AI:
      `;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction,
        })
      });

      if (!response.ok) {
        throw new Error("AI Tutor is currently busy. Please try again.");
      }

      const resData = await response.json();
      const answerText = resData.text || "I apologize, I didn't get a response. Could you try asking again?";
      
      const finalHistory = [...newHistory, { role: "model" as const, text: answerText }];
      
      const finalNote = {
        ...activeNote,
        chatHistory: finalHistory
      };
      await updateNote(finalNote);
      incrementStudyMinutes(2); // reward for active chat tutor focus
      
    } catch (err) {
      console.error("AI Tutor Chat error:", err);
      const finalHistory = [...newHistory, { role: "model" as const, text: "I'm having trouble connecting to my knowledge base right now. Please verify your internet connection or Gemini API key and try again." }];
      const finalNote = {
        ...activeNote,
        chatHistory: finalHistory
      };
      await updateNote(finalNote);
    } finally {
      setIsTutorTyping(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Auto-scroll inside Tutor chat
  useEffect(() => {
    if (activeStudyTab === "tutor") {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    }
  }, [activeStudyTab, activeNote?.chatHistory, isTutorTyping]);

  // List categories dynamically
  const categories = ["All", ...Array.from(new Set(notes.map((n) => n.category)))];

  // Simulated visualizer animations when audio is playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (audioPlaying) {
      interval = setInterval(() => {
        setVisualizerHeight(prev => prev.map(() => Math.floor(Math.random() * 40) + 10));
      }, 150);
    } else {
      setVisualizerHeight([15, 20, 15, 25, 12, 18, 20, 15, 12]);
    }
    return () => clearInterval(interval);
  }, [audioPlaying]);

  // Cleanup audio synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Filtering
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenNote = (note: StudyNote) => {
    setActiveNote(note);
    setActiveStudyTab("notes");
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    setQuizScores({});
    setQuizSubmitted(false);
    setCurrentQuizIndex(0);
    setSelectedOptionThisQuestion(null);
    setIsEditingRaw(false);
    setEditedTextContent(note.textContent);
    
    // Stop any ongoing audio
    window.speechSynthesis.cancel();
    setAudioPlaying(false);
  };

  const handleBack = () => {
    window.speechSynthesis.cancel();
    setAudioPlaying(false);
    setActiveNote(null);
  };

  // Safe SpeechSynthesis triggers
  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed;
    
    utterance.onend = () => {
      setAudioPlaying(false);
      if (activeNote) {
        markAudioListened(activeNote.id);
        incrementStudyMinutes(5); // Reward 5 minutes of study
      }
    };
    utterance.onerror = () => {
      setAudioPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setAudioPlaying(true);
  };

  const togglePlayback = () => {
    if (!activeNote) return;

    if (audioPlaying) {
      window.speechSynthesis.pause();
      setAudioPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setAudioPlaying(true);
      } else {
        let textToSpeak = "";
        if (audioMode === "summary") {
          textToSpeak = `Summary of ${activeNote.title}. ${activeNote.summary || ""}`;
        } else if (audioMode === "glossary") {
          textToSpeak = `Glossary terms for ${activeNote.title}. ` + (activeNote.importantDefinitions?.map(d => `${d.term}. Definition: ${d.definition}`).join(". ") || "No definition terms generated.");
        } else {
          textToSpeak = `Full Lecture Transcript. ${activeNote.textContent || ""}`;
        }
        speakText(textToSpeak);
      }
    }
  };

  const changeAudioMode = (mode: "summary" | "glossary" | "transcript") => {
    setAudioMode(mode);
    window.speechSynthesis.cancel();
    setAudioPlaying(false);
  };

  const handleQuizAnswer = (questionId: string, option: string) => {
    if (quizSubmitted) return;
    setSelectedOptionThisQuestion(option);
    setQuizScores({ ...quizScores, [questionId]: option });
  };

  const handleNextQuizQuestion = () => {
    if (!activeNote) return;
    setSelectedOptionThisQuestion(null);
    
    if (currentQuizIndex < activeNote.quiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Last question completed, submit quiz
      setQuizSubmitted(true);
      const updatedQuiz = activeNote.quiz.map((q) => ({
        ...q,
        selectedAnswer: quizScores[q.id],
      }));
      updateQuizAnswers(activeNote.id, updatedQuiz);
      incrementStudyMinutes(8); // Reward minutes
    }
  };

  const handleSaveRawEdit = async () => {
    if (!activeNote) return;
    const updated = {
      ...activeNote,
      textContent: editedTextContent
    };
    await updateNote(updated);
    setIsEditingRaw(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteCandidateId(id);
  };

  const renderOverlays = () => (
    <>
      {/* Deletion Confirmation Modal Overlay */}
      {deleteCandidateId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="w-full max-w-[280px] bg-white rounded-3xl p-5 shadow-2xl border border-powder/20 space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="font-display text-sm font-bold text-royal">Delete Study Pack?</h3>
              <p className="text-[10px] text-royal/60 leading-relaxed">
                This will permanently delete your study progress, memorized cards, and quiz scores from this local device.
              </p>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#A9C0E0]/30 text-royal font-bold text-[10px] hover:bg-powder/5"
              >
                Keep Pack
              </button>
              <button
                onClick={() => {
                  if (deleteCandidateId) {
                    deleteNote(deleteCandidateId);
                    setDeleteCandidateId(null);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-[10px] hover:bg-red-600 shadow-md shadow-red-100"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Undo Banner Toast */}
      {lastDeletedNote && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 text-white rounded-2xl py-3 px-4 shadow-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-red-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-left">
              <p className="text-[11px] font-bold text-white leading-none">Lesson Deleted</p>
              <p className="text-[9px] text-zinc-400 font-semibold line-clamp-1 max-w-[150px]">
                {lastDeletedNote.title}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={undoDeleteNote}
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              Undo
            </button>
            <button
              onClick={clearLastDeletedNote}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-400 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Smart Vocabulary detail overlay bottom-sheet/modal */}
      {selectedVocab && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center sm:items-center p-0 sm:p-6">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedVocab(null)} />
          
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-powder/20 space-y-4 animate-slideUp relative z-10 text-left pb-10 sm:pb-5">
            <div className="flex items-center justify-between border-b border-[#A9C0E0]/20 pb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                Active Smart Vocab
              </span>
              <button 
                onClick={() => setSelectedVocab(null)}
                className="text-powder hover:text-royal p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-black text-royal">{selectedVocab.term}</h3>
                <button
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(selectedVocab.term);
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="w-7 h-7 rounded-full bg-purple-50 hover:bg-purple-100 flex items-center justify-center text-purple-500 transition-colors"
                  title="Listen Pronunciation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] font-mono text-purple-500 font-bold">{selectedVocab.pronunciation}</p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <h4 className="text-[9px] font-mono uppercase tracking-wider text-powder font-bold">Academic Definition</h4>
                <p className="text-xs text-royal/90 leading-relaxed font-semibold bg-[#F4FEFF] p-3 rounded-2xl border border-purple-100/40">
                  {selectedVocab.definition}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-[9px] font-mono uppercase tracking-wider text-powder font-bold flex items-center gap-1 text-amber-600">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Intuitive Explanation
                </h4>
                <p className="text-xs text-royal/80 leading-relaxed font-medium pl-1">
                  {selectedVocab.simpleExplanation}
                </p>
              </div>

              {selectedVocab.examples && selectedVocab.examples.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-mono uppercase tracking-wider text-powder font-bold">Academic Examples</h4>
                  <div className="space-y-1 pl-1">
                    {selectedVocab.examples.map((ex, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-royal/75 leading-normal">
                        <span className="text-purple-500 font-black mt-0.5">•</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedVocab(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-100 mt-2"
            >
              Back to Lesson
            </button>
          </div>
        </div>
      )}
    </>
  );

  // Render detail view if a note is selected
  if (activeNote) {
    const currentFlashcard: Flashcard | undefined = activeNote.flashcards[currentFlashcardIndex];
    const currentQuizQuestion: QuizQuestion | undefined = activeNote.quiz[currentQuizIndex];
    
    // Core Learning Journey milestones
    const journeySteps = [
      { 
        id: "notes" as const, 
        label: "Check Concepts", 
        done: (activeNote.tickedConcepts?.length || 0) > 0, 
        detail: `${activeNote.tickedConcepts?.length || 0}/${activeNote.keyConcepts?.length || 0} Core Concepts` 
      },
      { 
        id: "summary" as const, 
        label: "Natural Listen", 
        done: !!activeNote.audioListened, 
        detail: activeNote.audioListened ? "Audio Completed" : "Listen Audio" 
      },
      { 
        id: "flashcards" as const, 
        label: "Flashcards", 
        done: activeNote.flashcards.length > 0 && activeNote.flashcards.every(f => f.memorized), 
        detail: `${activeNote.flashcards.filter(f => f.memorized).length}/${activeNote.flashcards.length} Memorized` 
      },
      { 
        id: "quiz" as const, 
        label: "Challenge Quiz", 
        done: (activeNote.quizHighScore || 0) >= 80, 
        detail: activeNote.quizHighScore ? `Best Score: ${activeNote.quizHighScore}%` : "No Attempts" 
      },
    ];

    return (
      <div className="space-y-5 pb-28 text-left">
        {/* Navigation back and title */}
        <div className="flex items-center justify-between pb-1">
          <button 
            onClick={handleBack}
            className="w-10 h-10 rounded-full neumorphic-card flex items-center justify-center text-royal hover:text-blue-600"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          
          <h2 className="font-display text-md font-bold text-royal max-w-[60%] truncate">
            {activeNote.title}
          </h2>

          <button 
            onClick={(e) => {
              handleBack();
              handleDelete(activeNote.id, e);
            }}
            className="w-10 h-10 rounded-full neumorphic-card flex items-center justify-center text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* LEARNING JOURNEY INTERACTIVE PROGRESS TIMELINE */}
        <NeumorphicCard className="p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/5 to-royal/0 rounded-full pointer-events-none" />
          
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#A9C0E0]/20">
            <span className="text-[10px] font-mono uppercase tracking-widest text-powder font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-royal stroke-[2.2]" />
              Learning Journey Timeline
            </span>
            <span className="text-[10px] font-bold text-royal bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {activeNote.studyProgress}% Mastered
            </span>
          </div>

          {/* Connected timeline stepper */}
          <div className="relative flex justify-between items-start pt-1">
            {/* Timeline track line */}
            <div className="absolute top-4 left-4 right-4 h-[2px] bg-powder/15 -z-0" />
            
            {journeySteps.map((step, idx) => {
              const isSelected = activeStudyTab === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStudyTab(step.id);
                    setIsFlipped(false);
                  }}
                  className="relative z-10 flex flex-col items-center flex-1 group"
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${step.done
                      ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-100"
                      : isSelected
                        ? "bg-royal border-royal text-white scale-110 shadow-md shadow-blue-100"
                        : "bg-white border-[#A9C0E0]/30 text-powder hover:border-royal/50"
                    }
                  `}>
                    {step.done ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <span className="text-[10px] font-black">{idx + 1}</span>
                    )}
                  </div>
                  
                  <span className={`text-[9px] font-black mt-2 leading-tight transition-colors duration-200 ${isSelected ? "text-royal" : "text-powder group-hover:text-royal"}`}>
                    {step.label}
                  </span>
                  
                  <span className="text-[8px] text-royal/60 font-medium tracking-tight mt-0.5 text-center px-1 line-clamp-1">
                    {step.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </NeumorphicCard>

        {/* Detailed Study Segment Switcher */}
        <div className="liquid-glass p-1 rounded-full flex justify-between gap-1 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: "notes", label: "OCR notes", icon: BookOpen },
            { id: "summary", label: "Listen Guide", icon: Sparkles },
            { id: "flashcards", label: "Cards", icon: Brain },
            { id: "quiz", label: "Quiz Test", icon: HelpCircle },
            { id: "tutor", label: "Ask AI", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeStudyTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveStudyTab(tab.id as any);
                  setIsFlipped(false);
                }}
                className={`
                  flex-1 py-2 px-1.5 rounded-full text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all duration-300
                  ${isTabActive 
                    ? "bg-gradient-to-tr from-royal to-blue-600 text-white shadow-md soft-glow-blue" 
                    : "text-royal/80 hover:text-royal hover:bg-[#A9C0E0]/10"}
                `}
              >
                <Icon className={`w-4 h-4 ${isTabActive ? "text-white" : "text-[#A9C0E0]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* STUDY TAB VIEWS */}
        
        {/* Tab 1: Notes (Extracted OCR Content) */}
        {activeStudyTab === "notes" && (
          <div className="space-y-4">
            <NeumorphicCard>
              <div className="flex items-center justify-between pb-3 border-b border-[#A9C0E0]/20">
                <span className="text-[10px] font-mono uppercase tracking-wider text-powder font-bold">
                  Raw Text Content (OCR)
                </span>
                <button
                  onClick={() => {
                    if (isEditingRaw) {
                      handleSaveRawEdit();
                    } else {
                      setEditedTextContent(activeNote.textContent);
                      setIsEditingRaw(true);
                    }
                  }}
                  className="text-[10px] font-bold text-royal bg-ice px-2.5 py-1 rounded-md border border-[#A9C0E0]/20 flex items-center gap-1 hover:bg-blue-50 transition-colors"
                >
                  {isEditingRaw ? (
                    <>
                      <Save className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Save Edit</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Notes</span>
                    </>
                  )}
                </button>
              </div>

              {isEditingRaw ? (
                <textarea
                  value={editedTextContent}
                  onChange={(e) => setEditedTextContent(e.target.value)}
                  className="w-full h-48 mt-3 p-3 text-xs text-royal/90 leading-relaxed font-sans border border-blue-100 rounded-xl bg-[#F4FEFF] focus:outline-none focus:border-royal/40"
                />
              ) : (
                <p className="text-xs text-royal/90 leading-relaxed font-sans whitespace-pre-line mt-3">
                  {activeNote.textContent}
                </p>
              )}
            </NeumorphicCard>

            {/* Smart Vocabulary List */}
            <NeumorphicCard className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-400/5 to-royal/0 rounded-full pointer-events-none" />
              <div className="flex items-center justify-between pb-3 border-b border-[#A9C0E0]/20">
                <span className="text-[10px] font-mono uppercase tracking-wider text-powder font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  Smart Vocabulary (Tappable)
                </span>
                <span className="text-[8px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100 font-bold">
                  Instant Lookups
                </span>
              </div>
              <p className="text-[10px] text-royal/75 mt-2 mb-3 leading-relaxed">
                Tap any core term below for pronunciation, simplified analogies, and real-world examples. Or search any custom word!
              </p>

              {/* Lookup Search bar */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder={isSearchingVocab ? "Analyzing word..." : "Type any word to define..."}
                  value={vocabSearchInput}
                  onChange={(e) => setVocabSearchInput(e.target.value)}
                  disabled={isSearchingVocab}
                  className="flex-1 px-3 py-1.5 bg-[#F4FEFF] border border-[#A9C0E0]/20 rounded-xl text-[11px] font-semibold text-royal focus:outline-none focus:border-purple-300 disabled:opacity-60"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && vocabSearchInput.trim() && !isSearchingVocab) {
                      handleVocabLookup(vocabSearchInput.trim());
                      setVocabSearchInput("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (vocabSearchInput.trim() && !isSearchingVocab) {
                      handleVocabLookup(vocabSearchInput.trim());
                      setVocabSearchInput("");
                    }
                  }}
                  disabled={isSearchingVocab || !vocabSearchInput.trim()}
                  className="px-3 py-1.5 bg-gradient-to-tr from-purple-500 to-indigo-600 text-white rounded-xl text-[10px] font-black shadow-md hover:scale-102 active:scale-98 transition-transform disabled:opacity-40"
                >
                  {isSearchingVocab ? "Analyzing..." : "Look Up"}
                </button>
              </div>

              {/* Display dynamic tappable pills of definitions */}
              <div className="flex flex-wrap gap-1.5">
                {activeNote.importantDefinitions && activeNote.importantDefinitions.length > 0 ? (
                  activeNote.importantDefinitions.map((item) => (
                    <button
                      key={item.term}
                      onClick={() => handleVocabLookup(item.term, item.definition)}
                      className="px-2.5 py-1.5 bg-purple-50/70 hover:bg-purple-50 text-royal text-[10px] font-black rounded-xl border border-purple-100/60 hover:border-purple-300 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{item.term}</span>
                      <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                    </button>
                  ))
                ) : (
                  <p className="text-[9px] text-royal/60">No glossary terms found. Use the lookup bar above to define any concept!</p>
                )}
              </div>
            </NeumorphicCard>

            {/* Checkable Concepts */}
            {activeNote.keyConcepts && activeNote.keyConcepts.length > 0 && (
              <NeumorphicCard>
                <div className="flex items-center space-x-2 pb-3 border-b border-[#A9C0E0]/20">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#0E2F76]/70 font-black">
                    Interactive Concept Checklists
                  </span>
                </div>
                <p className="text-[10px] text-royal/75 mt-2 mb-3 leading-relaxed">
                  Read and check off these core concepts to solidify your comprehension and boost your Mastery progress meter!
                </p>
                <div className="space-y-2">
                  {activeNote.keyConcepts.map((concept, idx) => {
                    const isTicked = activeNote.tickedConcepts?.includes(concept);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleConceptTicked(activeNote.id, concept)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-start space-x-3 transition-all duration-300 ${
                          isTicked 
                            ? "bg-green-500/5 border-green-500/20 text-royal"
                            : "bg-[#F4FEFF] border-[#A9C0E0]/25 text-royal hover:border-[#A9C0E0]/50"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isTicked ? (
                            <CheckSquare className="w-4 h-4 text-green-500" />
                          ) : (
                            <Square className="w-4 h-4 text-powder" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-xs font-bold ${isTicked ? "line-through text-royal/60" : "text-royal"}`}>
                            {concept}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </NeumorphicCard>
            )}
          </div>
        )}

        {/* Tab 2: Premium Natural Listen & Summary */}
        {activeStudyTab === "summary" && (
          <div className="space-y-5">
            {/* AUDIO CONTROLLER WIDGET */}
            <NeumorphicCard className="p-5 text-center relative overflow-hidden bg-gradient-to-b from-[#F4FEFF] to-white">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/5 to-royal/0 rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-[#A9C0E0]/20 text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-powder font-bold flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-500 fill-amber-500/10 stroke-[2.2]" />
                  Natural Voice Reader
                </span>
                <span className="text-[10px] font-mono font-bold text-royal bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                  TTS Premium
                </span>
              </div>

              {/* Read Mode Segment Controls */}
              <div className="grid grid-cols-3 gap-1 bg-powder/10 p-1 rounded-full mb-5">
                {[
                  { id: "summary" as const, label: "Summary" },
                  { id: "glossary" as const, label: "Glossary" },
                  { id: "transcript" as const, label: "Full Text" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => changeAudioMode(m.id)}
                    className={`py-1.5 rounded-full text-[10px] font-black transition-all duration-300 ${
                      audioMode === m.id
                        ? "bg-white text-royal shadow-sm"
                        : "text-powder hover:text-royal"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Live Audio Visualizer */}
              <div className="flex items-end justify-center space-x-1.5 h-12 mb-5">
                {visualizerHeight.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      audioPlaying 
                        ? "bg-gradient-to-t from-royal to-blue-500 animate-pulse" 
                        : "bg-powder/35"
                    }`}
                  />
                ))}
              </div>

              {/* Player Main Controls Row */}
              <div className="flex items-center justify-center space-x-6 mb-4">
                {/* Speed indicator toggle */}
                <button
                  onClick={() => {
                    const speeds = [0.8, 1.0, 1.25, 1.5];
                    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                    setPlaybackSpeed(speeds[nextIdx]);
                    // Re-speak with new speed if playing
                    if (audioPlaying) {
                      window.speechSynthesis.cancel();
                      setAudioPlaying(false);
                    }
                  }}
                  className="w-10 h-10 rounded-full border border-[#A9C0E0]/20 flex flex-col items-center justify-center text-[10px] font-black text-royal/80 hover:bg-powder/10"
                  title="Speech Speed"
                >
                  <span>Speed</span>
                  <span className="text-[9px] text-blue-500 font-mono">{playbackSpeed}x</span>
                </button>

                {/* Big Play/Pause Button */}
                <button
                  onClick={togglePlayback}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-royal to-blue-600 text-white flex items-center justify-center shadow-lg soft-glow-blue hover:scale-105 transition-transform"
                >
                  {audioPlaying ? (
                    <Pause className="w-6 h-6 fill-white" />
                  ) : (
                    <Play className="w-6 h-6 fill-white stroke-none ml-1" />
                  )}
                </button>

                {/* Reset Audio button */}
                <button
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setAudioPlaying(false);
                  }}
                  className="w-10 h-10 rounded-full border border-[#A9C0E0]/20 flex items-center justify-center text-royal/80 hover:bg-powder/10"
                  title="Stop Playback"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <span className="text-[10px] text-powder leading-relaxed font-sans max-w-xs mx-auto block">
                {audioPlaying 
                  ? `Reading the lesson ${audioMode} out loud...` 
                  : "Listen to natural audio speech to learn passively. Completing the lecture grants study progress!"
                }
              </span>
            </NeumorphicCard>

            {/* Metadata Badge Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-[#F4FEFF] border border-[#A9C0E0]/20 flex items-center space-x-2 shadow-sm">
                <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-[8px] font-mono text-powder uppercase font-bold leading-none">Topic</p>
                  <p className="text-[10px] font-bold text-royal truncate mt-0.5">{activeNote.topic || "General"}</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#F4FEFF] border border-[#A9C0E0]/20 flex items-center space-x-2 shadow-sm">
                <Award className="w-4 h-4 text-purple-500 shrink-0" />
                <div className="text-left">
                  <p className="text-[8px] font-mono text-powder uppercase font-bold leading-none">Level</p>
                  <p className="text-[10px] font-bold text-royal mt-0.5">{activeNote.difficultyLevel || "Intermediate"}</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#F4FEFF] border border-[#A9C0E0]/20 flex items-center space-x-2 shadow-sm">
                <Clock className="w-4 h-4 text-green-500 shrink-0" />
                <div className="text-left">
                  <p className="text-[8px] font-mono text-powder uppercase font-bold leading-none">Read Time</p>
                  <p className="text-[10px] font-bold text-royal mt-0.5">{activeNote.estimatedReadingTime || 4} mins</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#F4FEFF] border border-[#A9C0E0]/20 flex items-center space-x-2 shadow-sm">
                <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="text-left">
                  <p className="text-[8px] font-mono text-powder uppercase font-bold leading-none">Listen Time</p>
                  <p className="text-[10px] font-bold text-royal mt-0.5">{activeNote.estimatedListeningTime || 6} mins</p>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <NeumorphicCard className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/10 to-royal/0 rounded-full pointer-events-none" />
              <div className="flex items-center space-x-2 pb-3 border-b border-[#A9C0E0]/20 text-left">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-powder font-bold">
                  Executive Summary
                </span>
              </div>
              <p className="text-xs text-royal/90 leading-relaxed font-sans text-left mt-3">
                {activeNote.summary || "No summary available for this lesson."}
              </p>
            </NeumorphicCard>

            {/* Keywords Pills */}
            {activeNote.keywords && activeNote.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 py-1 text-left">
                {activeNote.keywords.map((word) => (
                  <span key={word} className="px-2.5 py-1 bg-blue-50 text-royal text-[9px] font-bold rounded-full border border-blue-100/60 uppercase tracking-wide">
                    #{word}
                  </span>
                ))}
              </div>
            )}

            {/* Detailed Summary Block */}
            {activeNote.detailedSummary && (
              <NeumorphicCard className="text-left">
                <div className="flex items-center space-x-2 pb-3 border-b border-[#A9C0E0]/20">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-powder font-bold">
                    Comprehensive Lesson Guide
                  </span>
                </div>
                <div className="prose max-w-none text-xs text-royal/90 leading-relaxed font-sans whitespace-pre-line mt-3 space-y-2">
                  {activeNote.detailedSummary}
                </div>
              </NeumorphicCard>
            )}

            {/* Important Definitions / Glossary */}
            {activeNote.importantDefinitions && activeNote.importantDefinitions.length > 0 && (
              <NeumorphicCard className="text-left">
                <div className="flex items-center space-x-2 pb-3 border-b border-[#A9C0E0]/20">
                  <GraduationCap className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-powder font-bold">
                    Academic Glossary & Definitions
                  </span>
                </div>
                <div className="space-y-2 mt-3">
                  {activeNote.importantDefinitions.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-2xl bg-[#F4FEFF] border border-[#A9C0E0]/25 shadow-sm space-y-1">
                      <span className="text-[11px] font-bold text-royal underline decoration-blue-200 decoration-2">
                        {item.term}
                      </span>
                      <p className="text-[10px] text-royal/80 leading-normal">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </NeumorphicCard>
            )}

            {/* Revision & Exam Prep Double Bento */}
            {((activeNote.revisionTips && activeNote.revisionTips.length > 0) || 
              (activeNote.examTips && activeNote.examTips.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {activeNote.revisionTips && activeNote.revisionTips.length > 0 && (
                  <NeumorphicCard>
                    <div className="flex items-center space-x-2 pb-2.5 border-b border-[#A9C0E0]/20">
                      <ListChecks className="w-4 h-4 text-green-500" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-powder font-bold">
                        Revision Checklists
                      </span>
                    </div>
                    <ul className="space-y-2 mt-3 list-disc pl-4 text-[11px] text-royal/85">
                      {activeNote.revisionTips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </NeumorphicCard>
                )}

                {activeNote.examTips && activeNote.examTips.length > 0 && (
                  <NeumorphicCard>
                    <div className="flex items-center space-x-2 pb-2.5 border-b border-[#A9C0E0]/20">
                      <Target className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-powder font-bold">
                        Exam Prep Predictions
                      </span>
                    </div>
                    <ul className="space-y-2 mt-3 list-disc pl-4 text-[11px] text-royal/85">
                      {activeNote.examTips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </NeumorphicCard>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Interactive Flashcards */}
        {activeStudyTab === "flashcards" && (
          <div className="space-y-5">
            {/* PROGRESS BAR FOR CARDS */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono text-powder font-bold uppercase tracking-wider">
                Cards Memorized Progress
              </span>
              <span className="text-[10px] font-mono font-bold text-royal bg-blue-50 px-2 py-0.5 rounded-full">
                {activeNote.flashcards.filter(f => f.memorized).length} / {activeNote.flashcards.length} Cards
              </span>
            </div>
            <div className="w-full bg-powder/15 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 to-green-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(activeNote.flashcards.filter(f => f.memorized).length / activeNote.flashcards.length) * 100}%` }}
              />
            </div>

            {currentFlashcard ? (
              <div className="space-y-4">
                {/* 3D Flip Card */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full h-52 cursor-pointer perspective"
                >
                  <div className={`relative w-full h-full transition-transform duration-500 transform-style preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}>
                    {/* Front side */}
                    <div className="absolute inset-0 backface-hidden neumorphic-card rounded-3xl p-6 flex flex-col justify-between border border-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-powder font-bold">CARD {currentFlashcardIndex + 1} OF {activeNote.flashcards.length}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 font-bold border border-blue-100">Tap to Flip</span>
                      </div>
                      <div className="text-center my-auto">
                        <p className="font-display text-sm font-bold text-royal leading-relaxed px-2">
                          {currentFlashcard.question}
                        </p>
                      </div>
                      <div className="text-center text-[10px] text-powder flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Tap Card to Reveal Answer</span>
                      </div>
                    </div>
                    {/* Back side */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 neumorphic-card rounded-3xl p-6 flex flex-col justify-between border-2 border-royal/10 bg-blue-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-[#0E2F76]/70 font-bold">ANSWER REVEALED</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-bold border border-green-100">Verified Answer</span>
                      </div>
                      <div className="text-center my-auto">
                        <p className="text-xs text-royal font-semibold leading-relaxed px-2">
                          {currentFlashcard.answer}
                        </p>
                      </div>
                      <div className="text-center text-[10px] text-green-600 font-bold flex items-center justify-center gap-1 animate-bounce">
                        <Smile className="w-3.5 h-3.5" />
                        <span>Got this right? Check below!</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card controls */}
                <div className="flex items-center justify-between gap-4 px-1">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={currentFlashcardIndex === 0}
                    className="flex-1 py-2.5 rounded-full neumorphic-card text-xs font-bold text-royal disabled:opacity-40"
                  >
                    Previous
                  </button>
                  
                  {/* Mark as Memorized */}
                  <button
                    onClick={() => {
                      toggleFlashcardMemorized(activeNote.id, currentFlashcard.id);
                      incrementStudyMinutes(1); // Increment minutes for active action
                    }}
                    className={`
                      flex-2 py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                      ${currentFlashcard.memorized
                        ? "bg-green-500 text-white shadow-md shadow-green-200 border-none scale-105"
                        : "neumorphic-card text-royal hover:text-green-600"}
                    `}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{currentFlashcard.memorized ? "Memorized!" : "Mark Memorized"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentFlashcardIndex((prev) => Math.min(activeNote.flashcards.length - 1, prev + 1));
                    }}
                    disabled={currentFlashcardIndex === activeNote.flashcards.length - 1}
                    className="flex-1 py-2.5 rounded-full neumorphic-card text-xs font-bold text-royal disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>

                {/* Celebration State if all memorized */}
                {activeNote.flashcards.every(f => f.memorized) && (
                  <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center space-x-3 text-left animate-pulse">
                    <Award className="w-6 h-6 text-green-500 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-green-800">Master Level Reached!</p>
                      <p className="text-[10px] text-green-700">You've memorized every flashcard in this stack! Outstanding performance.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-powder text-xs font-medium">
                No flashcards available for this note.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Interactive Gamified Quiz Questions */}
        {activeStudyTab === "quiz" && (
          <div className="space-y-5">
            {activeNote.quiz.length > 0 ? (
              <div>
                {!quizSubmitted ? (
                  /* SINGLE QUESTION AT A TIME INTERACTIVE VIEW */
                  currentQuizQuestion ? (
                    <div className="space-y-4">
                      {/* Interactive Header Progress */}
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-mono text-powder font-bold uppercase tracking-wider">
                          QUIZ CHALLENGE
                        </span>
                        <span className="text-[10px] font-mono font-bold text-royal bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                          Question {currentQuizIndex + 1} of {activeNote.quiz.length}
                        </span>
                      </div>
                      
                      <div className="w-full bg-powder/15 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-royal to-blue-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuizIndex + 1) / activeNote.quiz.length) * 100}%` }}
                        />
                      </div>

                      {/* Question Card */}
                      <NeumorphicCard className="p-5 space-y-4">
                        <h3 className="font-display text-sm font-black text-royal leading-relaxed">
                          {currentQuizQuestion.question}
                        </h3>

                        {/* Interactive Large Touch-target Option Cards */}
                        <div className="space-y-2.5 pt-1">
                          {currentQuizQuestion.options.map((option) => {
                            const isSelected = selectedOptionThisQuestion === option || quizScores[currentQuizQuestion.id] === option;
                            const isAnsweringThis = selectedOptionThisQuestion !== null;
                            const isCorrectChoice = option === currentQuizQuestion.correctAnswer;
                            const showAsCorrect = isAnsweringThis && isCorrectChoice;
                            const showAsIncorrect = isAnsweringThis && isSelected && !isCorrectChoice;

                            return (
                              <button
                                key={option}
                                onClick={() => handleQuizAnswer(currentQuizQuestion.id, option)}
                                disabled={isAnsweringThis}
                                className={`
                                  w-full text-left p-4 rounded-2xl text-xs font-bold transition-all duration-300 border flex items-center justify-between gap-2
                                  ${isSelected && !isAnsweringThis
                                    ? "bg-royal text-white border-royal shadow-sm"
                                    : "bg-[#F4FEFF] text-royal border-[#A9C0E0]/20 hover:border-[#A9C0E0]/30 hover:bg-blue-50/20"
                                  }
                                  ${showAsCorrect ? "bg-green-500 text-white border-green-500 shadow-md scale-102" : ""}
                                  ${showAsIncorrect ? "bg-red-500 text-white border-red-500 shadow-md" : ""}
                                `}
                              >
                                <span>{option}</span>
                                {showAsCorrect && <Check className="w-4 h-4 stroke-[2.5]" />}
                                {showAsIncorrect && <AlertCircle className="w-4 h-4 text-white" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Instant Explanation Banner revealed immediately after tapping an answer */}
                        {selectedOptionThisQuestion && (
                          <div className={`p-4 rounded-2xl border text-[11px] leading-relaxed animate-fade-in ${
                            selectedOptionThisQuestion === currentQuizQuestion.correctAnswer
                              ? "bg-green-50 border-green-100 text-royal"
                              : "bg-red-50/70 border-red-100 text-royal"
                          }`}>
                            <div className="flex items-center space-x-2 font-black mb-1">
                              {selectedOptionThisQuestion === currentQuizQuestion.correctAnswer ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className={selectedOptionThisQuestion === currentQuizQuestion.correctAnswer ? "text-green-800" : "text-red-700"}>
                                {selectedOptionThisQuestion === currentQuizQuestion.correctAnswer ? "Brilliant! Correct" : "Incorrect, but great effort!"}
                              </span>
                            </div>
                            <p className="text-royal/80">{currentQuizQuestion.explanation}</p>
                          </div>
                        )}
                      </NeumorphicCard>

                      {/* Controls to progress to next question */}
                      {selectedOptionThisQuestion && (
                        <button
                          onClick={handleNextQuizQuestion}
                          className="w-full py-4 rounded-full bg-gradient-to-tr from-royal to-blue-600 text-white text-xs font-black shadow-lg soft-glow-blue flex items-center justify-center gap-1.5 hover:from-blue-600 hover:to-royal transition-all duration-300"
                        >
                          <span>
                            {currentQuizIndex === activeNote.quiz.length - 1 ? "Complete Quiz & View Score" : "Next Question"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : null
                ) : (
                  /* HIGH QUALITY SCORECARD AFTER COMPLETING QUIZ */
                  <div className="space-y-5 animate-fade-in">
                    <NeumorphicCard className="p-6 text-center space-y-4">
                      <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-royal">
                        <Award className="w-10 h-10 text-royal stroke-[2.2]" />
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                          {(activeNote.quizHighScore || 0) >= 80 ? "Master Scholar Level" : "Keep Practicing"}
                        </span>
                        <h3 className="font-display text-lg font-black text-royal mt-3">
                          Quiz Completed!
                        </h3>
                      </div>

                      {/* Best Score display */}
                      <div className="p-4 bg-powder/5 border border-[#A9C0E0]/20 rounded-2xl flex items-center justify-around">
                        <div className="text-center">
                          <p className="text-[9px] font-mono text-powder uppercase font-bold">Accuracy</p>
                          <p className="text-xl font-black text-royal">{activeNote.quizHighScore}%</p>
                        </div>
                        <div className="h-8 w-[1px] bg-powder/25" />
                        <div className="text-center">
                          <p className="text-[9px] font-mono text-powder uppercase font-bold">Status</p>
                          <p className="text-xs font-bold text-royal mt-1">
                            {(activeNote.quizHighScore || 0) === 100 
                              ? "A+ Perfect Genius" 
                              : (activeNote.quizHighScore || 0) >= 80 
                                ? "Outstanding A" 
                                : "Excellent Attempt"
                            }
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-royal/75 leading-relaxed">
                        Completing active study assessments boosts memory retention by over 150%! Ready to try again and aim for a perfect score?
                      </p>

                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          onClick={() => {
                            setQuizScores({});
                            setQuizSubmitted(false);
                            setCurrentQuizIndex(0);
                            setSelectedOptionThisQuestion(null);
                          }}
                          className="w-full py-3.5 rounded-full bg-gradient-to-tr from-royal to-blue-600 text-white font-bold text-xs shadow-md soft-glow-blue"
                        >
                          Retake Quiz Challenge
                        </button>
                        
                        <button
                          onClick={() => {
                            setActiveStudyTab("summary");
                          }}
                          className="w-full py-3.5 rounded-full neumorphic-card text-xs font-bold text-royal"
                        >
                          Review Lesson Summary
                        </button>
                      </div>
                    </NeumorphicCard>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-powder text-xs font-medium">
                No quiz questions generated for this note.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: AI Tutor Chat */}
        {activeStudyTab === "tutor" && (
          <div className="space-y-4 flex flex-col h-[500px]">
            {/* Header / Info bar */}
            <div className="flex items-center justify-between pb-2 border-b border-[#A9C0E0]/20 text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-powder font-bold flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-500 fill-purple-500/10 stroke-[2.2]" />
                Interactive AI Tutor
              </span>
              <button 
                onClick={handleClearChat}
                className="text-[9px] font-mono font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100/50 px-2.5 py-0.5 rounded-full"
              >
                Reset Chat
              </button>
            </div>

            {/* Chat message bubbles list */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 neumorphic-inset rounded-2xl max-h-[360px] min-h-[300px] flex flex-col no-scrollbar">
              {(!activeNote.chatHistory || activeNote.chatHistory.length === 0) ? (
                <div className="my-auto text-center space-y-3 px-4 py-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-400 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-royal">Ask StudyPal AI Tutor</h4>
                    <p className="text-[10px] text-royal/60 leading-relaxed max-w-xs mx-auto">
                      Need a simpler explanation, academic examples, or have follow-up questions? Just ask! Your chat is saved automatically.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                    {[
                      "Explain this like I'm 10",
                      "Give me real-life examples",
                      "Summarize main takeaways",
                    ].map((suggestedPrompt) => (
                      <button
                        key={suggestedPrompt}
                        onClick={() => handleSendQuestion(suggestedPrompt)}
                        className="text-[9px] font-bold text-royal/80 bg-white/75 hover:bg-white border border-[#A9C0E0]/15 hover:border-royal/30 px-3 py-1.5 rounded-full transition-all"
                      >
                        {suggestedPrompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  {activeNote.chatHistory.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    return (
                      <div 
                        key={idx} 
                        className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}
                      >
                        {!isUser && (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-400 to-indigo-500 text-white flex items-center justify-center shadow-sm text-[10px] shrink-0 font-extrabold">
                            AI
                          </div>
                        )}
                        <div className={`
                          max-w-[80%] rounded-2xl px-3.5 py-2 text-xs font-medium leading-relaxed shadow-sm border
                          ${isUser 
                            ? "bg-royal text-white border-royal/20 rounded-tr-none" 
                            : "bg-[#F4FEFF] text-royal border-[#A9C0E0]/15 rounded-tl-none"
                          }
                        `}>
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  {isTutorTyping && (
                    <div className="flex justify-start items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-400 to-indigo-500 text-white flex items-center justify-center shadow-sm text-[10px] shrink-0 font-extrabold animate-pulse">
                        AI
                      </div>
                      <div className="bg-[#F4FEFF] text-royal border border-[#A9C0E0]/15 rounded-2xl rounded-tl-none px-3.5 py-3 shadow-sm text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-royal animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-royal animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-royal animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
              )}
            </div>

            {/* Chat Input form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (chatInput.trim()) {
                  handleSendQuestion(chatInput.trim());
                  setChatInput("");
                }
              }}
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask follow-up, get examples, simplify..."
                disabled={isTutorTyping}
                className="flex-1 bg-white border border-[#A9C0E0]/25 rounded-full px-4 py-3 text-xs font-semibold text-royal focus:outline-none focus:border-royal/40 shadow-sm disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTutorTyping}
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-royal to-blue-600 text-white flex items-center justify-center shadow-md soft-glow-blue disabled:opacity-40 hover:scale-105 active:scale-95 transition-transform shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
        {renderOverlays()}
      </div>
    );
  }

  // Otherwise, render full notes lists (The Library list of study packs)
  return (
    <div className="space-y-5 pb-24 text-left">
      {/* Search Header */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-powder" />
        <input
          type="text"
          placeholder="Search lessons, topics, keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#F4FEFF] border border-[#A9C0E0]/20 rounded-full text-xs font-medium text-royal neumorphic-inset focus:outline-none focus:border-royal/30"
        />
      </div>

      {/* Category selector pill tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-300 border
              ${selectedCategory === category
                ? "bg-royal text-white border-royal shadow-sm"
                : "bg-ice text-[#A9C0E0] border-[#A9C0E0]/20 hover:text-royal hover:border-royal/30"}
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid of All Notes */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => handleOpenNote(note)}
            className="neumorphic-card rounded-2xl p-4 flex items-center justify-between hover:translate-y-[-2px] transition-all duration-300 cursor-pointer border border-white"
          >
            <div className="space-y-1 max-w-[80%]">
              <span className="text-[9px] uppercase font-mono tracking-wider text-powder font-bold">
                {note.category}
              </span>
              <h3 className="text-xs font-bold text-royal truncate">
                {note.title}
              </h3>
              <p className="text-[10px] text-royal/60 line-clamp-1">
                {note.textContent}
              </p>
              {/* Progress percentage */}
              <div className="flex items-center space-x-2 w-32 pt-1">
                <div className="flex-1 bg-powder/20 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-royal h-full rounded-full"
                    style={{ width: `${note.studyProgress}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-royal/80">{note.studyProgress}%</span>
              </div>
            </div>

            <button className="w-8 h-8 rounded-full neumorphic-card flex items-center justify-center text-royal bg-ice">
              <Play className="w-3.5 h-3.5 fill-royal stroke-none ml-0.5" />
            </button>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="text-center py-12 text-powder text-xs font-medium">
            No study materials matched your filters.
          </div>
        )}
      </div>
      {renderOverlays()}
    </div>
  );
};
export default LibraryTab;
