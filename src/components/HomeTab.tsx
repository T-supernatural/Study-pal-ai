import React from "react";
import { useApp } from "../context/AppContext";
import { NeumorphicCard } from "./NeumorphicCard";
import { StatRing } from "./StatRing";
import { Bell, Upload, BookOpen, Sparkles, HelpCircle, ChevronRight, Play, Award, Zap } from "lucide-react";
import { ActiveTab, StudyNote } from "../types";

export const HomeTab: React.FC = () => {
  const { notes, stats, setActiveTab, setActiveNote } = useApp();

  const handleNoteClick = (note: StudyNote) => {
    setActiveNote(note);
    setActiveTab("library");
  };

  const handleQuickAction = (action: string) => {
    if (action === "upload") setActiveTab("upload" as ActiveTab);
    else if (action === "library") setActiveTab("library" as ActiveTab);
    else if (action === "quiz") {
      if (notes.length > 0) {
        setActiveNote(notes[0]);
        setActiveTab("library" as ActiveTab);
      } else {
        setActiveTab("upload" as ActiveTab);
      }
    } else if (action === "ai") {
      setActiveTab("library" as ActiveTab);
    }
  };

  const currentPercentage = Math.round((stats.completedLessonsToday / stats.dailyGoalLessons) * 100);

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header user bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full border-2 border-[#A9C0E0] overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
              alt="User profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-xs text-powder font-mono uppercase tracking-wider flex items-center gap-1">
              <span>Good Morning</span>
              <span className="animate-bounce">👋</span>
            </div>
            <h1 className="font-display text-lg font-bold text-royal">John Doe</h1>
          </div>
        </div>
        
        {/* Notification bell button */}
        <button className="w-10 h-10 rounded-full neumorphic-card flex items-center justify-center text-royal hover:text-blue-600">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Streak / Goal ring block */}
      <NeumorphicCard className="relative overflow-hidden border border-white/40">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2 max-w-[60%]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold font-mono uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-orange-500 stroke-none" />
              <span>{stats.streakDays} Day Streak!</span>
            </div>
            <h2 className="font-display text-md font-bold text-royal leading-snug">
              Keep going, you&apos;re doing great!
            </h2>
            <p className="text-xs text-royal/70">
              Today&apos;s Goal: <span className="font-bold text-royal">{stats.completedLessonsToday} / {stats.dailyGoalLessons}</span> Lessons
            </p>
            {/* Horizontal progress bar */}
            <div className="w-full bg-[#A9C0E0]/30 h-2 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-gradient-to-r from-blue-500 to-royal h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${currentPercentage}%` }}
              />
            </div>
          </div>

          <div>
            <StatRing 
              percentage={currentPercentage} 
              size={100} 
              strokeWidth={8}
              label={`${currentPercentage}%`}
              sublabel="goal"
            />
          </div>
        </div>
      </NeumorphicCard>

      {/* 3. Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-royal uppercase tracking-wider pl-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { id: "upload", label: "Upload Notes", icon: Upload, color: "text-blue-500" },
            { id: "library", label: "My Library", icon: BookOpen, color: "text-purple-500" },
            { id: "ai", label: "AI Assistant", icon: Sparkles, color: "text-yellow-500" },
            { id: "quiz", label: "Practice Quiz", icon: HelpCircle, color: "text-green-500" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className="neumorphic-card rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 active:scale-95 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-ice flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-[10px] font-bold text-royal/90 leading-tight">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Lessons (All scanned notes) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pl-1">
          <h3 className="font-display text-sm font-bold text-royal uppercase tracking-wider">
            Recent Lessons
          </h3>
          <button 
            onClick={() => setActiveTab("library")} 
            className="text-xs font-bold text-royal hover:text-blue-600 transition-colors flex items-center gap-0.5"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {notes.slice(0, 3).map((note) => (
            <div
              key={note.id}
              onClick={() => handleNoteClick(note)}
              className="neumorphic-card rounded-2xl p-4 flex items-center justify-between hover:translate-x-1 hover:border-royal/20 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center space-x-3.5 max-w-[80%]">
                {/* Subject avatar thumb */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#A9C0E0]/30 to-royal/10 flex items-center justify-center shadow-inner text-royal font-display font-black text-sm">
                  {note.category.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-royal group-hover:text-blue-700 transition-colors truncate">
                    {note.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-[10px] text-powder font-medium">
                    <span>{note.category}</span>
                    <span>•</span>
                    <span>
                      {new Date(note.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {/* Progress Line */}
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
              </div>

              {/* Action arrow or play btn */}
              <div className="w-8 h-8 rounded-full neumorphic-card flex items-center justify-center text-royal bg-ice group-hover:scale-110 transition-transform duration-300">
                <Play className="w-3.5 h-3.5 fill-royal stroke-none ml-0.5" />
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="text-center py-6 text-powder text-xs font-medium">
              No notes uploaded yet. Head to the Upload tab to start scanning!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default HomeTab;
