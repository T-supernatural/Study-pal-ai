import React from "react";
import { useApp } from "../context/AppContext";
import { NeumorphicCard } from "./NeumorphicCard";
import { 
  Zap, Clock, BookOpen, Award, CheckCircle2, ChevronRight, 
  Settings, LogOut, ArrowUpRight, ShieldCheck, Trophy, Sparkles 
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

  const badges = [
    { title: "Streak Master", desc: "Maintained a 3+ day study streak", icon: Trophy, color: "from-yellow-400 to-amber-500" },
    { title: "Perfect Quiz", desc: "Got 100% on a study practice quiz", icon: ShieldCheck, color: "from-green-400 to-emerald-500" },
    { title: "Early Scanner", desc: "Scanned study sheets before 9 AM", icon: Sparkles, color: "from-blue-400 to-indigo-500" },
  ];

  return (
    <div class="space-y-6 pb-24">
      {/* 1. Header Profile block */}
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 rounded-full border-2 border-royal overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
            alt="John Doe profile"
            class="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div class="space-y-0.5">
          <h2 class="font-display text-lg font-bold text-royal">John Doe</h2>
          <p class="text-xs text-powder font-medium">Biology & Math Undergraduate</p>
          <span class="inline-flex text-[9px] font-mono font-bold bg-[#A9C0E0]/20 text-royal px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Premium Pal
          </span>
        </div>
      </div>

      {/* 2. Key Statistics Bento Row */}
      <div class="grid grid-cols-3 gap-3">
        {[
          { label: "Streak", value: `${stats.streakDays} Days`, icon: Zap, iconColor: "text-orange-500" },
          { label: "Studied", value: `${stats.totalStudyMinutes}m`, icon: Clock, iconColor: "text-blue-500" },
          { label: "Materials", value: `${stats.lessonsHistoryCount} Items`, icon: BookOpen, iconColor: "text-purple-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <NeumorphicCard key={i} class="p-4.5 text-center flex flex-col items-center justify-center space-y-1 rounded-2xl border border-white">
              <Icon class={`w-5 h-5 ${stat.iconColor} mb-0.5`} />
              <span class="text-[9px] font-mono text-powder uppercase tracking-wider font-bold">{stat.label}</span>
              <span class="text-xs font-black text-royal">{stat.value}</span>
            </NeumorphicCard>
          );
        })}
      </div>

      {/* 3. Recharts Weekly Analytics graph */}
      <div class="space-y-3">
        <h3 class="font-display text-sm font-bold text-royal uppercase tracking-wider pl-1">
          Study Analytics
        </h3>
        
        <NeumorphicCard class="p-4 rounded-3xl border border-white">
          <div class="flex items-center justify-between pb-3 pl-1">
            <span class="text-[10px] text-powder uppercase font-mono tracking-wider font-bold">Minutes studied per day</span>
            <span class="text-[10px] text-green-500 font-bold flex items-center gap-0.5">
              <ArrowUpRight class="w-3.5 h-3.5" />
              <span>+14% this week</span>
            </span>
          </div>

          <div class="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#3B82F6" stop-opacity={0.3} />
                    <stop offset="95%" stop-color="#0E2F76" stop-opacity={0} />
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
      <div class="space-y-3">
        <h3 class="font-display text-sm font-bold text-royal uppercase tracking-wider pl-1">
          Achievements
        </h3>

        <div class="space-y-3">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div 
                key={idx}
                class="neumorphic-card rounded-2xl p-4 flex items-center justify-between border border-white"
              >
                <div class="flex items-center space-x-3.5">
                  <div class={`w-11 h-11 rounded-xl bg-gradient-to-tr ${badge.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon class="w-5.5 h-5.5" />
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs font-bold text-royal">{badge.title}</p>
                    <p class="text-[10px] text-royal/70 leading-relaxed">{badge.desc}</p>
                  </div>
                </div>

                <div class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <CheckCircle2 class="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default ProfileTab;
