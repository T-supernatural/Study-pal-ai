import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { STUDENT_AVATARS, StudentAvatar } from "./StudentAvatar";
import { NeumorphicCard } from "./NeumorphicCard";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Check, Target, GraduationCap, Heart, User } from "lucide-react";

export const Onboarding: React.FC = () => {
  const { saveOnboardingIdentity } = useApp();

  const [name, setName] = useState("");
  const [preferredClass, setPreferredClass] = useState("");
  const [favoriteSubject, setFavoriteSubject] = useState("");
  const [dailyGoal, setDailyGoal] = useState(3);
  const [selectedAvatarId, setSelectedAvatarId] = useState("avatar-1");

  const [step, setStep] = useState(1); // Step 1: Welcome & Name/Avatar, Step 2: Study Preferences

  const handleNext = () => {
    if (!name.trim()) return;
    setStep(2);
  };

  const handleFinish = () => {
    if (!name.trim()) return;
    saveOnboardingIdentity({
      name: name.trim(),
      preferredClass: preferredClass.trim() || "Undergraduate",
      favoriteSubject: favoriteSubject.trim() || "General Studies",
      dailyGoal: dailyGoal || 3,
      avatarId: selectedAvatarId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F0F6F8] flex flex-col justify-between overflow-y-auto font-sans">
      <div className="w-full max-w-md mx-auto min-h-screen px-6 py-8 flex flex-col justify-between relative bg-white border-x border-[#A9C0E0]/15 shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-blue-100 to-teal-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

        {/* Top Header Branding */}
        <div className="flex items-center justify-center space-x-2 pb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-royal to-blue-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 fill-white stroke-none" />
          </div>
          <span className="font-display font-black text-sm tracking-tight text-royal">
            StudyPal <span className="text-blue-500">AI</span>
          </span>
        </div>

        {/* STEP 1: Name and Avatar */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col justify-center space-y-6 text-left"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                Step 1 of 2
              </span>
              <h2 className="font-display text-2xl font-black text-royal leading-tight">
                Create Your <span className="text-blue-600">Student Identity</span>
              </h2>
              <p className="text-xs text-royal/70 leading-relaxed">
                Welcome to StudyPal AI! Set up your local profile to customize your dashboard, track study streaks, and unlock academic achievements. All data remains 100% private on your device.
              </p>
            </div>

            {/* Name input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-royal flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>What should we call you? *</span>
              </label>
              <input
                type="text"
                placeholder="Enter your name or nickname..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-3 text-sm rounded-2xl bg-white border border-[#A9C0E0]/30 outline-none focus:border-royal text-royal font-medium transition-all shadow-inner focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Avatar Selector Gallery */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-royal">Choose Your Learning Avatar</label>
              <div className="grid grid-cols-3 gap-3">
                {STUDENT_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatarId === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={`relative rounded-2xl p-2.5 transition-all duration-300 border flex flex-col items-center justify-center space-y-1.5 ${
                        isSelected
                          ? "bg-blue-50/50 border-blue-500 shadow-md scale-102"
                          : "bg-[#F0F6F8]/45 border-[#A9C0E0]/15 hover:border-[#A9C0E0]/40"
                      }`}
                    >
                      <StudentAvatar avatarId={avatar.id} className="w-12 h-12 shadow" />
                      <span className="text-[10px] font-black text-royal">{avatar.name}</span>
                      
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className={`w-full py-3.5 rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all ${
                name.trim()
                  ? "bg-gradient-to-r from-royal to-blue-600 text-white hover:scale-102 active:scale-98"
                  : "bg-powder/30 text-powder cursor-not-allowed"
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* STEP 2: Preferences */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-center space-y-6 text-left"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                Step 2 of 2
              </span>
              <h2 className="font-display text-2xl font-black text-royal leading-tight">
                Your <span className="text-blue-600">Learning Goals</span>
              </h2>
              <p className="text-xs text-royal/70 leading-relaxed">
                Tell us about your courses so we can personalize the AI summaries, quiz suggestions, and flashcard difficulty.
              </p>
            </div>

            {/* School / Class input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-royal flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <span>Preferred Class / Grade (optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Grade 11, Biology Undergrad..."
                value={preferredClass}
                onChange={(e) => setPreferredClass(e.target.value)}
                maxLength={40}
                className="w-full px-4 py-3 text-sm rounded-2xl bg-white border border-[#A9C0E0]/30 outline-none focus:border-royal text-royal font-medium transition-all shadow-inner focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Favorite subject input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-royal flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-500" />
                <span>Favorite Subject / Core Course (optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Molecular Biology, Calculus..."
                value={favoriteSubject}
                onChange={(e) => setFavoriteSubject(e.target.value)}
                maxLength={40}
                className="w-full px-4 py-3 text-sm rounded-2xl bg-white border border-[#A9C0E0]/30 outline-none focus:border-royal text-royal font-medium transition-all shadow-inner focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Daily study goal (lessons) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-royal flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-green-500" />
                  <span>Daily Study Goal</span>
                </div>
                <span className="text-xs font-bold text-blue-600">{dailyGoal} study packs / day</span>
              </label>
              <p className="text-[10px] text-royal/60">How many summarized lessons do you want to complete each day?</p>
              
              <div className="flex items-center space-x-2 pt-1">
                {[1, 2, 3, 4, 5].map((num) => {
                  const isSelected = dailyGoal === num;
                  return (
                    <button
                      key={num}
                      onClick={() => setDailyGoal(num)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                        isSelected
                          ? "bg-green-500 border-green-500 text-white shadow"
                          : "bg-white border-[#A9C0E0]/30 text-royal hover:bg-powder/10"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-full border border-[#A9C0E0]/40 text-royal font-bold text-xs hover:bg-powder/10 active:scale-98 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-2 py-3.5 rounded-full bg-gradient-to-r from-royal to-blue-600 text-white font-bold text-xs shadow-md hover:scale-102 active:scale-98 transition-all"
              >
                Start Learning
              </button>
            </div>
          </motion.div>
        )}

        {/* Privacy badge in footer */}
        <div className="text-[9px] font-mono font-bold text-powder text-center pt-4 tracking-wider uppercase">
          🛡️ Local Storage Enabled • No Server Accounts
        </div>
      </div>
    </div>
  );
};
