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
import { Sparkles, Moon, Sun, Layers, HelpCircle } from "lucide-react";

function AppContent() {
  const { activeTab, themeMode, setThemeMode } = useApp();

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

  return (
    <div 
      id="app-shell"
      class={`min-h-screen w-full flex flex-col justify-between transition-colors duration-500 ${themeClass}`}
    >
      {/* Premium Standalone Shell wrapper constrained to perfect mobile dimensions */}
      <div class="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between bg-transparent shadow-xl relative overflow-hidden border-x border-[#A9C0E0]/15">
        
        {/* TOP STATUS BAR (Dynamic Branding & Theme Selectors) */}
        <header class="safe-top px-6 py-4 flex items-center justify-between border-b border-[#A9C0E0]/15 z-40 bg-transparent">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-royal to-blue-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles class="w-4 h-4 fill-white stroke-none" />
            </div>
            <span class="font-display font-extrabold text-sm tracking-tight text-royal">
              StudyPal <span class="text-blue-500">AI</span>
            </span>
          </div>

          {/* Real-time Theme Mode Switcher */}
          <div class="flex items-center space-x-1.5 p-1 bg-powder/15 rounded-full border border-powder/20">
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
                  class={`
                    p-1.5 rounded-full transition-all duration-300
                    ${isSelected 
                      ? "bg-white text-royal shadow-sm scale-115" 
                      : "text-powder hover:text-royal"}
                  `}
                >
                  <Icon class="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </header>

        {/* MAIN VIEW CONTENT CONTAINER */}
        <main class="flex-1 overflow-y-auto px-6 pt-5 pb-10 no-scrollbar relative z-10">
          {renderActiveTab()}
        </main>

        {/* FLOATING BOTTOM NAV BAR */}
        <BottomNav />
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
