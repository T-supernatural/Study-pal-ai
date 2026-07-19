import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { NeumorphicCard } from "./NeumorphicCard";
import { GlassPanel } from "./GlassPanel";
import { 
  ChevronLeft, Search, Edit2, Play, CheckCircle, HelpCircle, 
  Trash2, Brain, Sparkles, BookOpen, Volume2, Check, AlertCircle 
} from "lucide-react";
import { StudyNote, QuizQuestion, Flashcard } from "../types";

export const LibraryTab: React.FC = () => {
  const { notes, activeNote, setActiveNote, deleteNote, updateQuizAnswers, toggleFlashcardMemorized } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeStudyTab, setActiveStudyTab] = useState<"notes" | "summary" | "flashcards" | "quiz">("notes");
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizScores, setQuizScores] = useState<Record<string, string>>({}); // quiz-id -> selected option
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // List categories dynamically
  const categories = ["All", ...Array.from(new Set(notes.map((n) => n.category)))];

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
  };

  const handleBack = () => {
    setActiveNote(null);
  };

  const handleQuizAnswer = (questionId: string, option: string) => {
    if (quizSubmitted) return;
    setQuizScores({ ...quizScores, [questionId]: option });
  };

  const handleSubmitQuiz = () => {
    if (!activeNote) return;
    setQuizSubmitted(true);

    const updatedQuiz = activeNote.quiz.map((q) => ({
      ...q,
      selectedAnswer: quizScores[q.id],
    }));

    updateQuizAnswers(activeNote.id, updatedQuiz);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this study pal note?")) {
      deleteNote(id);
    }
  };

  // Render detail view if a note is selected
  if (activeNote) {
    const currentFlashcard: Flashcard | undefined = activeNote.flashcards[currentFlashcardIndex];
    
    return (
      <div class="space-y-5 pb-28">
        {/* Navigation back and title */}
        <div class="flex items-center justify-between pb-1">
          <button 
            onClick={handleBack}
            class="w-10 h-10 rounded-full neumorphic-card flex items-center justify-center text-royal hover:text-blue-600"
          >
            <ChevronLeft class="w-5 h-5 stroke-[2.5]" />
          </button>
          
          <h2 class="font-display text-md font-bold text-royal max-w-[60%] truncate">
            {activeNote.title}
          </h2>

          <button 
            onClick={(e) => {
              handleBack();
              handleDelete(activeNote.id, e);
            }}
            class="w-10 h-10 rounded-full neumorphic-card flex items-center justify-center text-red-500 hover:bg-red-50"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        {/* Detailed Study Segment Switcher */}
        <div class="liquid-glass p-1 rounded-full flex justify-between gap-1 shadow-sm">
          {[
            { id: "notes", label: "Notes", icon: BookOpen },
            { id: "summary", label: "AI Summary", icon: Sparkles },
            { id: "flashcards", label: "Cards", icon: Brain },
            { id: "quiz", label: "Quiz", icon: HelpCircle },
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
                class={`
                  flex-1 py-2 px-1.5 rounded-full text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all duration-300
                  ${isTabActive 
                    ? "bg-gradient-to-tr from-royal to-blue-600 text-white shadow-md soft-glow-blue" 
                    : "text-royal/80 hover:text-royal hover:bg-[#A9C0E0]/10"}
                `}
              >
                <Icon class={`w-4 h-4 ${isTabActive ? "text-white" : "text-[#A9C0E0]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* STUDY TAB VIEWS */}
        
        {/* Tab 1: Notes (Extracted OCR Content) */}
        {activeStudyTab === "notes" && (
          <div class="space-y-4">
            <NeumorphicCard>
              <div class="flex items-center justify-between pb-3 border-b border-[#A9C0E0]/20">
                <span class="text-[10px] font-mono uppercase tracking-wider text-powder font-bold">
                  Extracted Raw Text (OCR)
                </span>
                <span class="text-[10px] font-bold text-royal bg-ice px-2 py-1 rounded-md border border-[#A9C0E0]/20 flex items-center gap-1">
                  <Edit2 class="w-3 h-3" />
                  <span>Editable</span>
                </span>
              </div>
              <p class="text-xs text-royal/90 leading-relaxed font-sans whitespace-pre-line mt-3">
                {activeNote.textContent}
              </p>
            </NeumorphicCard>
          </div>
        )}

        {/* Tab 2: AI Generated Summary */}
        {activeStudyTab === "summary" && (
          <div class="space-y-4">
            <NeumorphicCard class="relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/10 to-royal/0 rounded-full pointer-events-none" />
              <div class="flex items-center space-x-2 pb-3 border-b border-[#A9C0E0]/20">
                <Sparkles class="w-4 h-4 text-amber-500 fill-amber-500/20 animate-pulse" />
                <span class="text-[10px] font-mono uppercase tracking-wider text-powder font-bold">
                  AI Summary & Key Takeaways
                </span>
              </div>
              <p class="text-xs text-royal/90 leading-relaxed font-sans mt-3">
                {activeNote.summary || "No AI summary has been generated for this note yet. Try triggering summary generation!"}
              </p>
            </NeumorphicCard>
          </div>
        )}

        {/* Tab 3: Interactive Flashcards */}
        {activeStudyTab === "flashcards" && (
          <div class="space-y-5">
            {currentFlashcard ? (
              <div class="space-y-4">
                {/* 3D Flip Card */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  class="w-full h-52 cursor-pointer perspective"
                >
                  <div class={`relative w-full h-full transition-transform duration-500 transform-style preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}>
                    {/* Front side */}
                    <div class="absolute inset-0 backface-hidden neumorphic-card rounded-3xl p-6 flex flex-col justify-between border border-white">
                      <div class="flex items-center justify-between">
                        <span class="text-[9px] font-mono text-powder font-bold">CARD {currentFlashcardIndex + 1} OF {activeNote.flashcards.length}</span>
                        <span class="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 font-bold border border-blue-100">Tap to Flip</span>
                      </div>
                      <div class="text-center my-auto">
                        <p class="font-display text-sm font-bold text-royal leading-relaxed px-2">
                          {currentFlashcard.question}
                        </p>
                      </div>
                      <div class="text-center text-[10px] text-powder">Front</div>
                    </div>
                    {/* Back side */}
                    <div class="absolute inset-0 backface-hidden rotate-y-180 neumorphic-card rounded-3xl p-6 flex flex-col justify-between border-2 border-royal/10 bg-blue-50/50">
                      <div class="flex items-center justify-between">
                        <span class="text-[9px] font-mono text-[#0E2F76]/70 font-bold">ANSWER</span>
                        <span class="text-[9px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-bold border border-green-100">Verified Answer</span>
                      </div>
                      <div class="text-center my-auto">
                        <p class="text-xs text-royal font-semibold leading-relaxed px-2">
                          {currentFlashcard.answer}
                        </p>
                      </div>
                      <div class="text-center text-[10px] text-powder">Back</div>
                    </div>
                  </div>
                </div>

                {/* Card controls */}
                <div class="flex items-center justify-between gap-4 px-1">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentFlashcardIndex((prev) => Math.max(0, prev - 1));
                    }}
                    disabled={currentFlashcardIndex === 0}
                    class="flex-1 py-2.5 rounded-full neumorphic-card text-xs font-bold text-royal disabled:opacity-40"
                  >
                    Previous
                  </button>
                  
                  {/* Mark as Memorized */}
                  <button
                    onClick={() => toggleFlashcardMemorized(activeNote.id, currentFlashcard.id)}
                    class={`
                      flex-2 py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all
                      ${currentFlashcard.memorized
                        ? "bg-green-500 text-white shadow-md shadow-green-200 border-none"
                        : "neumorphic-card text-royal hover:text-green-600"}
                    `}
                  >
                    <Check class="w-4 h-4 stroke-[2.5]" />
                    <span>{currentFlashcard.memorized ? "Memorized!" : "Mark Memorized"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentFlashcardIndex((prev) => Math.min(activeNote.flashcards.length - 1, prev + 1));
                    }}
                    disabled={currentFlashcardIndex === activeNote.flashcards.length - 1}
                    class="flex-1 py-2.5 rounded-full neumorphic-card text-xs font-bold text-royal disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div class="text-center py-8 text-powder text-xs font-medium">
                No flashcards available for this note.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Interactive Quiz Questions */}
        {activeStudyTab === "quiz" && (
          <div class="space-y-5">
            {activeNote.quiz.length > 0 ? (
              <div class="space-y-4">
                {activeNote.quiz.map((q, idx) => {
                  const isCorrect = q.selectedAnswer === q.correctAnswer;
                  const hasSelected = !!quizScores[q.id];
                  
                  return (
                    <NeumorphicCard key={q.id} class="space-y-3">
                      <div class="flex items-start justify-between gap-2">
                        <span class="text-[10px] font-mono text-powder font-bold">
                          QUESTION {idx + 1}
                        </span>
                        {quizSubmitted && (
                          <span class={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}>
                            {isCorrect ? <CheckCircle class="w-3 h-3" /> : <AlertCircle class="w-3 h-3" />}
                            <span>{isCorrect ? "Correct" : "Incorrect"}</span>
                          </span>
                        )}
                      </div>
                      <p class="text-xs font-bold text-royal leading-relaxed">
                        {q.question}
                      </p>
                      
                      {/* Options List */}
                      <div class="space-y-2 pt-1">
                        {q.options.map((option) => {
                          const isSelected = quizScores[q.id] === option;
                          const showAsCorrect = quizSubmitted && option === q.correctAnswer;
                          const showAsIncorrect = quizSubmitted && isSelected && !isCorrect;

                          return (
                            <button
                              key={option}
                              onClick={() => handleQuizAnswer(q.id, option)}
                              disabled={quizSubmitted}
                              class={`
                                w-full text-left p-3 rounded-2xl text-xs font-medium transition-all duration-300 border flex items-center justify-between
                                ${isSelected && !quizSubmitted
                                  ? "bg-royal text-white border-royal shadow-sm"
                                  : "bg-[#F4FEFF] text-royal border-[#A9C0E0]/20 hover:border-royal/30"}
                                ${showAsCorrect ? "bg-green-500 text-white border-green-500 shadow-sm" : ""}
                                ${showAsIncorrect ? "bg-red-500 text-white border-red-500 shadow-sm" : ""}
                              `}
                            >
                              <span>{option}</span>
                              {showAsCorrect && <Check class="w-4 h-4 stroke-[2.5]" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {quizSubmitted && q.explanation && (
                        <div class="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] text-royal/80 leading-relaxed mt-2">
                          <span class="font-bold block text-royal mb-0.5">Explanation:</span>
                          {q.explanation}
                        </div>
                      )}
                    </NeumorphicCard>
                  );
                })}

                {/* Submit button */}
                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizScores).length < activeNote.quiz.length}
                    class="w-full py-3 rounded-full bg-gradient-to-r from-royal to-blue-600 text-white text-xs font-bold shadow-md soft-glow-blue hover:from-blue-600 hover:to-royal disabled:opacity-50"
                  >
                    Submit Quiz Answers
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizScores({});
                      setQuizSubmitted(false);
                    }}
                    class="w-full py-3 rounded-full neumorphic-card text-xs font-bold text-royal"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            ) : (
              <div class="text-center py-8 text-powder text-xs font-medium">
                No quiz question has been generated for this note.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Otherwise, render full notes lists
  return (
    <div class="space-y-5 pb-24">
      {/* Search Header */}
      <div class="relative">
        <Search class="absolute left-4 top-3.5 w-5 h-5 text-powder" />
        <input
          type="text"
          placeholder="Search lessons, topics, keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          class="w-full pl-11 pr-4 py-3 bg-[#F4FEFF] border border-[#A9C0E0]/20 rounded-full text-xs font-medium text-royal neumorphic-inset focus:outline-none focus:border-royal/30"
        />
      </div>

      {/* Category selector pill tabs */}
      <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            class={`
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
      <div class="space-y-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => handleOpenNote(note)}
            class="neumorphic-card rounded-2xl p-4 flex items-center justify-between hover:translate-y-[-2px] transition-all duration-300 cursor-pointer border border-white"
          >
            <div class="space-y-1 max-w-[80%]">
              <span class="text-[9px] uppercase font-mono tracking-wider text-powder font-bold">
                {note.category}
              </span>
              <h3 class="text-xs font-bold text-royal truncate">
                {note.title}
              </h3>
              <p class="text-[10px] text-royal/60 line-clamp-1">
                {note.textContent}
              </p>
              {/* Progress percentage */}
              <div class="flex items-center space-x-2 w-32 pt-1">
                <div class="flex-1 bg-powder/20 h-1 rounded-full overflow-hidden">
                  <div 
                    class="bg-gradient-to-r from-blue-400 to-royal h-full rounded-full"
                    style={{ width: `${note.studyProgress}%` }}
                  />
                </div>
                <span class="text-[9px] font-mono font-bold text-royal/80">{note.studyProgress}%</span>
              </div>
            </div>

            <button class="w-8 h-8 rounded-full neumorphic-card flex items-center justify-center text-royal bg-ice">
              <Play class="w-3.5 h-3.5 fill-royal stroke-none ml-0.5" />
            </button>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div class="text-center py-12 text-powder text-xs font-medium">
            No study materials matched your filters.
          </div>
        )}
      </div>
    </div>
  );
};
export default LibraryTab;
