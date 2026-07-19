import React from "react";
import { useApp } from "../context/AppContext";
import { Home, FolderOpen, Headphones, User, Plus } from "lucide-react";
import { ActiveTab } from "../types";

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "library", label: "Library", icon: FolderOpen },
    { id: "upload", label: "Upload", icon: Plus, isFab: true },
    { id: "audio", label: "Audio", icon: Headphones },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div class="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
      <div class="max-w-md mx-auto liquid-glass rounded-full px-6 py-3 shadow-xl flex items-center justify-between pointer-events-auto border border-white/50 relative">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          if (item.isFab) {
            return (
              <button
                key={item.id}
                id="nav-fab-btn"
                onClick={() => setActiveTab("upload" as ActiveTab)}
                class={`
                  w-14 h-14 rounded-full bg-gradient-to-tr from-royal to-blue-600
                  flex items-center justify-center text-white shadow-lg soft-glow-blue
                  relative -top-6 transform active:scale-95 transition-all duration-300
                  hover:from-blue-600 hover:to-royal
                `}
              >
                <Plus class="w-7 h-7 stroke-[2.5]" />
                {isActive && (
                  <span class="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-royal animate-ping" />
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              class="flex flex-col items-center justify-center p-2 relative text-powder hover:text-royal transition-all duration-300"
            >
              <IconComponent
                class={`w-6 h-6 transition-all duration-300 ${
                  isActive ? "text-royal scale-110 stroke-[2.5]" : "text-[#A9C0E0] opacity-80"
                }`}
              />
              <span
                class={`text-[10px] font-medium mt-0.5 transition-all duration-300 ${
                  isActive ? "text-royal font-semibold" : "text-powder"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span class="absolute -bottom-1 w-1 h-1 rounded-full bg-royal" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default BottomNav;
