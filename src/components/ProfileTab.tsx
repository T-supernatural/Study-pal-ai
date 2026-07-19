import React from "react";
import { useApp } from "../context/AppContext";
import { NeumorphicCard } from "./NeumorphicCard";
import { 
  Zap, Clock, BookOpen, Award, CheckCircle2, ChevronRight, 
  Settings, LogOut, ArrowUpRight, ShieldCheck, Trophy, Sparkles, Lock 
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export const ProfileTab: React.FC = () => {
  const { stats } = useApp();

  // Mock study minutes weekly progression
  const chartData = [
    { name: "Mon", minutes: 20 },
    { name: "Tue", minutes: 35 },
    { name: "Wed", minutes: 15 },
    { name: "Thu", minutes: 40 },
    { name: "Fri", minutes: 10 },
    { name: "Sat", minutes: 30 },
    { name: "Sun", minutes: stats.totalStudyMinutes - 150 > 0 ? stats.totalStudyMinutes - 150 : 30 },
  ];

  const badgeDefinitions = [
    { 
      id: "streak-master",
      title: "Streak Master", 
      desc: "Maintained a 3+ day study streak", 
      icon: Trophy, 
      color: "from-yellow-400 to-amber-500" 
    },
    { 
      id: "paladin-focus",
      title: "Paladin of Focus", 
      desc: "Logged over 150 total minutes of active study", 
      icon: Zap, 
      color: "from-orange-400 to-amber-500" 
    },
    { 
      id: "perfect-10",
      title: "Perfect 10", 
      desc: "Achieved a flawless 100% score on any study pack quiz", 
      icon: ShieldCheck, 
      color: "from-green-400 to-emerald-500" 
    },
    { 
      id: "curator-wisdom",
      title: "Curator of Wisdom", 
      desc: "Scanned and processed 4+ custom Study Packs", 
      icon: Sparkles, 
      color: "from-purple-400 to-indigo-500" 
    },
    { 
      id: "consistency-champ",
      title: "Consistency Champ", 
      desc: "Unlocked an elite 5-day study streak", 
      icon: Award, 
      color: "from-blue-400 to-indigo-500" 
    },
  ];

  const unlockedSet = new Set(stats.unlockedBadges || ["streak-master"]);

  return (
    <div className="space-y-6 pb-24 text-left">
      {/* 1. Header Profile block */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full border-2 border-royal overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
            alt="John Doe profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-0.5">
          <h2 className="font-display text-lg font-bold text-royal">John Doe</h2>
          <p className="text-xs text-powder font-medium">Biology & Math Undergraduate</p>
          <span className="inline-flex text-[9px] font-mono font-bold bg-[#A9C0E0]/20 text-royal px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Premium Pal
          </span>
        </div>
      </div>

      {/* 2. Key Statistics Bento Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Streak", value: `${stats.streakDays} Days`, icon: Zap, iconColor: "text-orange-500" },
          { label: "Studied", value: `${stats.totalStudyMinutes}m`, icon: Clock, iconColor: "text-blue-500" },
          { label: "Materials", value: `${stats.lessonsHistoryCount} Items`, icon: BookOpen, iconColor: "text-purple-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <NeumorphicCard key={i} className="p-4 text-center flex flex-col items-center justify-center space-y-1 rounded-2xl border border-white">
              <Icon className={`w-5 h-5 ${stat.iconColor} mb-0.5`} />
              <span className="text-[9px] font-mono text-powder uppercase tracking-wider font-bold">{stat.label}</span>
              <span className="text-xs font-black text-royal">{stat.value}</span>
            </NeumorphicCard>
          );
        })}
      </div>

      {/* 3. Recharts Weekly Analytics graph */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-royal uppercase tracking-wider pl-1">
          Study Analytics
        </h3>
        
        <NeumorphicCard className="p-4 rounded-3xl border border-white">
          <div className="flex items-center justify-between pb-3 pl-1">
            <span className="text-[10px] text-powder uppercase font-mono tracking-wider font-bold">Minutes studied per day</span>
            <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14% this week</span>
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0E2F76" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#A9C0E0" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                  fontFamily="Inter"
                />
                <YAxis 
                  stroke="#A9C0E0" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                  fontFamily="Inter"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.95)", 
                    borderRadius: "16px",
                    border: "1px solid rgba(169, 192, 224, 0.2)",
                    fontSize: "10px",
                    fontFamily: "Inter"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="#0E2F76" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorMinutes)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </NeumorphicCard>
      </div>

      {/* 4. Gamified Achievements row */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-royal uppercase tracking-wider pl-1">
          Achievements Showcase
        </h3>

        <div className="space-y-3">
          {badgeDefinitions.map((badge) => {
            const Icon = badge.icon;
            const isUnlocked = unlockedSet.has(badge.id);

            return (
              <div 
                key={badge.id}
                className={`neumorphic-card rounded-2xl p-4 flex items-center justify-between border border-white transition-opacity duration-300 ${
                  isUnlocked ? "opacity-100" : "opacity-60 bg-powder/5"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md transition-all ${
                    isUnlocked 
                      ? `bg-gradient-to-tr ${badge.color}` 
                      : "bg-[#A9C0E0]/20 text-powder/50"
                  }`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-royal flex items-center gap-1.5">
                      <span>{badge.title}</span>
                      {!isUnlocked && (
                        <span className="text-[8px] uppercase tracking-widest text-powder font-mono border border-powder/20 px-1.5 py-0.5 rounded-md">
                          Locked
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-royal/70 leading-normal max-w-xs">{badge.desc}</p>
                  </div>
                </div>

                {isUnlocked ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#A9C0E0]/20 flex items-center justify-center text-powder">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
