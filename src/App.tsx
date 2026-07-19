/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import HomeTab from "./components/HomeTab";
import LibraryTab from "./components/LibraryTab";
import UploadTab from "./components/UploadTab";
import AudioTab from "./components/AudioTab";
import ProfileTab from "./components/ProfileTab";
import BottomNav from "./components/BottomNav";
import { Onboarding } from "./components/Onboarding";
import { Sparkles, Moon, Sun, Layers, HelpCircle, Trophy, Award, Zap, BookOpen, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function AppContent() {
  const { activeTab, themeMode, setThemeMode, recentlyUnlockedBadge, clearRecentBadge, isOnboarded } = useApp();

  // Determine current active sub-component
  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />;
      case "library":
        return <LibraryTab />;
      case "upload":
        return <UploadTab />;
      case "audio":
        return <AudioTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  // Map theme class names
  const themeClass = {
    light: "bg-[#F4FEFF]",
    glass: "bg-gradient-to-br from-blue-50 via-teal-50/20 to-white backdrop-blur-md",
    neumorphic: "bg-[#F0F6F8]",
  }[themeMode];

  const getBadgeDetails = (badgeId: string) => {
    const parts = badgeId.split("-");
    const track = parts[0];
    const levelNum = parseInt(parts[1]) || 1;
    
    const tiers = [
      { tier: "Bronze", color: "from-amber-600 to-amber-800", icon: Trophy },
      { tier: "Silver", color: "from-slate-400 to-slate-500", icon: Trophy },
      { tier: "Gold", color: "from-yellow-400 to-amber-500", icon: Trophy },
      { tier: "Platinum", color: "from-teal-400 to-cyan-500", icon: Trophy },
      { tier: "Diamond", color: "from-blue-400 to-indigo-500 animate-pulse", icon: Trophy },
    ];
    
    const tierInfo = tiers[levelNum - 1] || tiers[0];
    
    const tracks: Record<string, { title: string; desc: string; icon: any }> = {
      focus: {
        title: `Focus Paladin (${tierInfo.tier})`,
        desc: `You have unlocked the ${tierInfo.tier} tier for active study time! Keep focused to reach higher milestones.`,
        icon: Clock,
      },
      consistency: {
        title: `Consistency Champ (${tierInfo.tier})`,
        desc: `You have unlocked the ${tierInfo.tier} tier for your study streak! Your dedication is inspiring.`,
        icon: Zap,
      },
      curator: {
        title: `Curator of Wisdom (${tierInfo.tier})`,
        desc: `You have unlocked the ${tierInfo.tier} tier for lesson packs created! You are archiving massive knowledge.`,
        icon: BookOpen,
      },
      quiz: {
        title: `Quiz Master (${tierInfo.tier})`,
        desc: `You have unlocked the ${tierInfo.tier} tier for scoring 100% on quizzes! True intellectual mastery!`,
        icon: Award,
      }
    };
    
    const trackInfo = tracks[track] || {
      title: "Milestone Unlocked!",
      desc: "Congratulations on your study achievements!",
      icon: Sparkles
    };
    
    return {
      title: trackInfo.title,
      desc: trackInfo.desc,
      color: tierInfo.color,
      icon: trackInfo.icon
    };
  };

  const badgeInfo = recentlyUnlockedBadge ? getBadgeDetails(recentlyUnlockedBadge) : null;
  const BadgeIcon = badgeInfo ? badgeInfo.icon : Sparkles;

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <div 
      id="app-shell"
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-500 ${themeClass}`}
    >
      {/* Premium Standalone Shell wrapper constrained to perfect mobile dimensions */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between bg-transparent shadow-xl relative overflow-hidden border-x border-[#A9C0E0]/15">
        
        {/* TOP STATUS BAR (Dynamic Branding & Theme Selectors) */}
        <header className="safe-top px-6 py-4 flex items-center justify-between border-b border-[#A9C0E0]/15 z-40 bg-transparent">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-royal to-blue-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 fill-white stroke-none" />
            </div>
            <span className="font-display font-extrabold text-sm tracking-tight text-royal">
              StudyPal <span className="text-blue-500">AI</span>
            </span>
          </div>

          {/* Real-time Theme Mode Switcher */}
          <div className="flex items-center space-x-1.5 p-1 bg-powder/15 rounded-full border border-powder/20">
            {[
              { id: "light", icon: Sun, tooltip: "Light Mode" },
              { id: "glass", icon: Layers, tooltip: "Glass Mode" },
              { id: "neumorphic", icon: Moon, tooltip: "Neumorphic Mode" },
            ].map((th) => {
              const Icon = th.icon;
              const isSelected = themeMode === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => setThemeMode(th.id as any)}
                  title={th.tooltip}
                  className={`
                    p-1.5 rounded-full transition-all duration-300
                    ${isSelected 
                      ? "bg-white text-royal shadow-sm scale-115" 
                      : "text-powder hover:text-royal"}
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </header>

        {/* MAIN VIEW CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto px-6 pt-5 pb-32 no-scrollbar relative">
          {renderActiveTab()}
        </main>

        {/* FLOATING BOTTOM NAV BAR */}
        <BottomNav />

        {/* CELEBRATORY BADGE UNLOCKED MODAL */}
        <AnimatePresence>
          {recentlyUnlockedBadge && badgeInfo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-[#0E2F76]/60 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="w-full bg-white rounded-3xl p-8 text-center shadow-2xl border border-white relative overflow-hidden"
              >
                {/* Radiant Background Rays */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-full blur-2xl opacity-75 pointer-events-none" />
                
                {/* Big Floating Icon */}
                <motion.div 
                  initial={{ rotate: -15, scale: 0.8 }}
                  animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr ${badgeInfo.color} flex items-center justify-center text-white shadow-lg relative z-10 mb-6`}
                >
                  <BadgeIcon className="w-10 h-10 stroke-[2.2]" />
                </motion.div>

                {/* Badge Title */}
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                  New Achievement Unlocked!
                </span>
                <h3 className="font-display text-lg font-black text-royal mt-4 mb-2">
                  {badgeInfo.title}
                </h3>
                <p className="text-xs text-royal/80 leading-relaxed max-w-xs mx-auto mb-6">
                  {badgeInfo.desc}
                </p>

                {/* Dismiss Action Button */}
                <button
                  onClick={clearRecentBadge}
                  className="w-full py-3.5 rounded-full bg-gradient-to-tr from-royal to-blue-600 text-white font-bold text-xs shadow-lg soft-glow-blue hover:from-blue-600 hover:to-royal transition-all duration-300"
                >
                  Awesome! Keep learning
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
