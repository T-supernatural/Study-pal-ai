import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { NeumorphicCard } from "./NeumorphicCard";
import { StatRing } from "./StatRing";
import { StudentAvatar } from "./StudentAvatar";
import { 
  Bell, Upload, BookOpen, Sparkles, HelpCircle, ChevronRight, 
  Play, Award, Zap, X, Check, Target, Info, Trash2
} from "lucide-react";
import { ActiveTab, StudyNote, NotificationItem } from "../types";

export const HomeTab: React.FC = () => {
  const { 
    notes, 
    stats, 
    setActiveTab, 
    setActiveNote, 
    studentIdentity, 
    notifications, 
    markNotificationRead, 
    clearAllNotifications 
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "streak": return <Zap className="w-4 h-4 text-orange-500 fill-orange-500/10" />;
      case "goal": return <Target className="w-4 h-4 text-green-500" />;
      case "lesson": return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "quiz": return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case "flashcard": return <Sparkles className="w-4 h-4 text-pink-500" />;
      case "achievement": return <Award className="w-4 h-4 text-yellow-500 fill-yellow-500/10" />;
      default: return <Info className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans text-left">
      {/* 1. Header user bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full border-2 border-royal overflow-hidden shadow-md">
            <StudentAvatar avatarId={studentIdentity?.avatarId || "avatar-1"} className="w-full h-full" />
          </div>
          <div>
            <div className="text-[10px] text-powder font-mono uppercase tracking-wider flex items-center gap-1">
              <span>Good Study Session</span>
              <span className="animate-bounce">👋</span>
            </div>
            <h1 className="font-display text-base font-black text-royal">
              {studentIdentity?.name || "Alex"}
            </h1>
          </div>
        </div>
        
        {/* Notification bell button with unread counts */}
        <button 
          onClick={() => setIsNotificationsOpen(true)}
          className="relative w-10 h-10 rounded-full neumorphic-card border border-white flex items-center justify-center text-royal hover:text-blue-600 transition-all active:scale-95"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black border-2 border-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Streak / Goal ring block */}
      <NeumorphicCard className="relative overflow-hidden border border-white/40">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2 max-w-[60%]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 text-[9px] font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-orange-500 stroke-none" />
              <span>{stats.streakDays} Day Streak!</span>
            </div>
            <h2 className="font-display text-sm font-bold text-royal leading-snug">
              Keep going, you&apos;re doing great!
            </h2>
            <p className="text-xs text-royal/70">
              Today&apos;s Goal: <span className="font-bold text-royal">{stats.completedLessonsToday} / {stats.dailyGoalLessons}</span> Lessons
            </p>
            {/* Horizontal progress bar */}
            <div className="w-full bg-[#A9C0E0]/30 h-2 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-gradient-to-r from-blue-500 to-royal h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, currentPercentage)}%` }}
              />
            </div>
          </div>

          <div>
            <StatRing 
              percentage={currentPercentage} 
              size={90} 
              strokeWidth={8}
              label={`${Math.min(100, currentPercentage)}%`}
              sublabel="goal"
            />
          </div>
        </div>
      </NeumorphicCard>

      {/* 3. Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="font-display text-xs font-bold text-royal uppercase tracking-wider pl-1">
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
                className="neumorphic-card rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 active:scale-95 transition-all duration-300 group border border-white"
              >
                <div className="w-10 h-10 rounded-xl bg-ice flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`w-4.5 h-4.5 ${action.color}`} />
                </div>
                <span className="text-[10px] font-bold text-royal/90 leading-tight">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Lessons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pl-1">
          <h3 className="font-display text-xs font-bold text-royal uppercase tracking-wider">
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
              className="neumorphic-card rounded-2xl p-4 flex items-center justify-between hover:translate-x-1 hover:border-royal/20 transition-all duration-300 cursor-pointer group border border-white"
            >
              <div className="flex items-center space-x-3.5 max-w-[80%]">
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

      {/* 5. Notifications Drawer Modal Overlay */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-t-[32px] p-6 shadow-2xl border-t border-[#A9C0E0]/20 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar animate-slideUp">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#A9C0E0]/15 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-royal" />
                <h3 className="font-display text-sm font-black text-royal">Activity & Milestones</h3>
              </div>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 text-[10px] font-bold flex items-center gap-1"
                    title="Clear All"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1.5 rounded-full bg-powder/10 text-royal hover:bg-powder/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications scroll list */}
            <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-all text-left flex items-start space-x-3.5 relative ${
                    notif.read
                      ? "bg-powder/5 border-[#A9C0E0]/10 opacity-70"
                      : "bg-[#F0F6F8]/40 border-blue-100 hover:border-blue-200 cursor-pointer"
                  }`}
                >
                  {/* Category icon indicator */}
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#A9C0E0]/15 flex items-center justify-center shadow-inner mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body text content */}
                  <div className="space-y-0.5 flex-1 pr-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-royal leading-tight">
                        {notif.title}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-powder">
                        {new Date(notif.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[10px] text-royal/80 leading-normal">
                      {notif.message}
                    </p>
                  </div>

                  {/* Unread circle dot */}
                  {!notif.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-royal flex items-center justify-center mx-auto shadow-inner">
                    <Bell className="w-5 h-5 text-powder" />
                  </div>
                  <h4 className="text-xs font-bold text-royal">Zero Unread Alerts</h4>
                  <p className="text-[10px] text-powder leading-relaxed max-w-[200px] mx-auto">
                    Excellent! All notifications checked. Complete lessons and quizzes to earn more milestone badges.
                  </p>
                </div>
              )}
            </div>

            {/* Privacy note */}
            <div className="text-[9px] font-mono text-center text-powder uppercase tracking-wider">
              🔔 Locally tracked system achievements
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default HomeTab;
