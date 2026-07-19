import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { NeumorphicCard } from "./NeumorphicCard";
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, Sparkles, 
  Settings, HelpCircle, Headphones, Star, AlertCircle, RefreshCw
} from "lucide-react";
import { StudyNote } from "../types";

export const AudioTab: React.FC = () => {
  const { notes, activeNote, setActiveNote, markAudioListened, incrementStudyMinutes } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [voiceType, setVoiceType] = useState<"calm" | "smart">("calm");
  
  const selectedNote = activeNote || (notes.length > 0 ? notes[0] : null);

  // Split content into discrete sections for logical skipping controls
  const sections = selectedNote 
    ? [
        `Starting lecture for ${selectedNote.title}.`,
        ...(selectedNote.summary ? selectedNote.summary.split(". ").filter(Boolean).map(s => s.trim()) : []),
        `Now we'll review the core concepts.`,
        ...(selectedNote.keyConcepts || []).map(concept => `Core concept: ${concept}.`)
      ]
    : [];

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Speech synthesis refs and states
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Waveform bars layout (mock visuals bouncing when playing)
  const [waveHeights, setWaveHeights] = useState<number[]>(
    Array.from({ length: 32 }, () => Math.floor(Math.random() * 25) + 5)
  );

  // Estimate duration and time based on sections
  const secPerSection = 12; // 12 seconds average per short sentence
  const totalDurationSeconds = sections.length * secPerSection;
  const elapsedSeconds = currentSectionIndex * secPerSection;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remains = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remains.toString().padStart(2, "0")}`;
  };

  const progress = sections.length > 0 ? Math.round((currentSectionIndex / sections.length) * 100) : 0;

  // Animation effect for waveform when playing
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setWaveHeights(Array.from({ length: 32 }, () => Math.floor(Math.random() * 30) + 6));
      }, 150);
      return () => clearInterval(interval);
    } else {
      setWaveHeights([15, 20, 15, 25, 12, 18, 20, 15, 12, 18, 14, 25, 10, 8, 15, 20, 15, 25, 12, 18, 20, 15, 12, 18, 14, 25, 10, 8, 12, 15, 10, 14]);
    }
  }, [isPlaying]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  // Reset indices if the note changes
  useEffect(() => {
    setCurrentSectionIndex(0);
    if (synth) {
      synth.cancel();
    }
    setIsPlaying(false);
  }, [selectedNote]);

  // Helper speech trigger for a specific section
  const speakSection = (index: number) => {
    if (!synth || !selectedNote || index < 0 || index >= sections.length) return;

    synth.cancel();

    const utteranceText = sections[index];
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.rate = playbackSpeed;

    const voices = synth.getVoices();
    if (voices.length > 0) {
      if (voiceType === "calm") {
        const calmVoice = voices.find(v => v.lang.includes("en-US") && v.name.includes("Natural")) || 
                           voices.find(v => v.lang.includes("en") && (v.name.includes("Zira") || v.name.includes("Google") || v.name.includes("Hazel")));
        if (calmVoice) utterance.voice = calmVoice;
      } else {
        const smartVoice = voices.find(v => v.lang.includes("en-US") && v.name.includes("David")) || 
                           voices.find(v => v.lang.includes("en") && (v.name.includes("David") || v.name.includes("Microsoft")));
        if (smartVoice) utterance.voice = smartVoice;
      }
    }

    utterance.onend = () => {
      if (index + 1 < sections.length) {
        // Auto advance to next section
        const nextIdx = index + 1;
        setCurrentSectionIndex(nextIdx);
        speakSection(nextIdx);
      } else {
        // Finished everything!
        setIsPlaying(false);
        setCurrentSectionIndex(0);
        markAudioListened(selectedNote.id);
        incrementStudyMinutes(5); // Complete reward
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== "interrupted") {
        console.warn("SpeechSynthesisUtterance Error:", e.error);
        setIsPlaying(false);
      }
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (!selectedNote || !synth) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused && utteranceRef.current) {
        synth.resume();
        setIsPlaying(true);
      } else {
        speakSection(currentSectionIndex);
      }
    }
  };

  const handleSkipForward = () => {
    if (!selectedNote) return;
    if (currentSectionIndex < sections.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      if (isPlaying) {
        speakSection(nextIndex);
      }
    }
  };

  const handleSkipBackward = () => {
    if (!selectedNote) return;
    if (currentSectionIndex > 0) {
      const prevIndex = currentSectionIndex - 1;
      setCurrentSectionIndex(prevIndex);
      if (isPlaying) {
        speakSection(prevIndex);
      }
    } else if (currentSectionIndex === 0 && isPlaying) {
      // Retake section 0 from beginning
      speakSection(0);
    }
  };

  const handleSelectNote = (note: StudyNote) => {
    if (synth) {
      synth.cancel();
    }
    setIsPlaying(false);
    setActiveNote(note);
  };

  const handleSpeedToggle = () => {
    const nextSpeed = playbackSpeed === 1.0 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1.0;
    setPlaybackSpeed(nextSpeed);
    
    // Restart active section if playing to apply speed immediately
    if (isPlaying && synth) {
      speakSection(currentSectionIndex);
    }
  };

  const handleVoiceTypeToggle = () => {
    const nextVoice = voiceType === "calm" ? "smart" : "calm";
    setVoiceType(nextVoice);
    
    // Restart active section if playing to apply voice immediately
    if (isPlaying && synth) {
      // Set short timeout to let synth register cancellation
      setTimeout(() => {
        speakSection(currentSectionIndex);
      }, 100);
    }
  };

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* 1. Header */}
      <div className="text-center space-y-1">
        <h2 className="font-display text-lg font-bold text-royal">Audio Notes Player</h2>
        <p className="text-xs text-powder">Listen to AI synthesized lectures & summaries</p>
      </div>

      {selectedNote ? (
        <div className="space-y-6">
          {/* 2. Audio Card Plate */}
          <NeumorphicCard className="space-y-6 relative overflow-hidden border border-white">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#A9C0E0]/10 rounded-full pointer-events-none" />
            
            {/* Subject details & lesson meta */}
            <div className="text-center space-y-1 relative z-10">
              <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {selectedNote.category}
              </span>
              <h3 className="font-display text-md font-extrabold text-royal leading-tight pt-1 truncate">
                {selectedNote.title}
              </h3>
              <p className="text-[10px] text-powder font-semibold uppercase tracking-wider font-mono">
                {currentSectionIndex + 1} of {sections.length} sentences
              </p>
            </div>

            {/* Waveform Visualization Plate */}
            <div className="h-20 bg-blue-50/40 rounded-2xl flex items-center justify-center space-x-0.5 px-6 shadow-inner border border-[#A9C0E0]/15">
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  className={`
                    w-1 bg-gradient-to-t rounded-full transition-all duration-150 ease-out
                    ${isPlaying ? "from-royal to-blue-500 h-[80%]" : "from-powder/30 to-powder/60"}
                  `}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Time labels & track slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-royal/80">
                <span>{formatTime(elapsedSeconds)}</span>
                <span>{formatTime(totalDurationSeconds)}</span>
              </div>
              <div className="w-full bg-[#A9C0E0]/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-royal h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Main Player Controls */}
            <div className="flex items-center justify-center space-x-6">
              <button 
                onClick={handleSkipBackward}
                disabled={currentSectionIndex === 0 && !isPlaying}
                className={`w-10 h-10 rounded-full neumorphic-card flex items-center justify-center border border-white transition-all ${
                  currentSectionIndex === 0 && !isPlaying ? "text-powder/40 cursor-not-allowed" : "text-royal hover:scale-105 active:scale-95"
                }`}
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              
              {/* Giant glowing Play/Pause FAB */}
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-royal to-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-white stroke-none" />
                ) : (
                  <Play className="w-7 h-7 fill-white stroke-none ml-1" />
                )}
              </button>

              <button 
                onClick={handleSkipForward}
                disabled={currentSectionIndex === sections.length - 1}
                className={`w-10 h-10 rounded-full neumorphic-card flex items-center justify-center border border-white transition-all ${
                  currentSectionIndex === sections.length - 1 ? "text-powder/40 cursor-not-allowed" : "text-royal hover:scale-105 active:scale-95"
                }`}
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Active Speech content subtitle display */}
            <div className="px-4 py-2.5 bg-powder/5 border border-[#A9C0E0]/15 rounded-xl text-center min-h-[50px] flex items-center justify-center">
              <p className="text-[11px] font-medium text-royal/90 leading-relaxed italic">
                "{sections[currentSectionIndex] || "Tap play to synthesize natural lecture audio."}"
              </p>
            </div>

            {/* Adjustments row */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleSpeedToggle}
                className="py-2.5 rounded-full neumorphic-card text-[11px] font-bold text-royal flex items-center justify-center space-x-1.5 hover:bg-[#F0F6F8]/35 transition-all"
              >
                <span>{playbackSpeed.toFixed(2)}x</span>
                <span className="text-[9px] text-powder uppercase font-mono tracking-wider font-bold">Speed</span>
              </button>

              <button
                onClick={handleVoiceTypeToggle}
                className="py-2.5 rounded-full neumorphic-card text-[11px] font-bold text-royal flex items-center justify-center space-x-1.5 hover:bg-[#F0F6F8]/35 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5 text-royal" />
                <span>{voiceType === "calm" ? "Calm Voice" : "Smart AI"}</span>
              </button>
            </div>
          </NeumorphicCard>

          {/* 3. Playlist select area */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-royal pl-1 text-left">Available Study Lectures</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {notes.map((note) => {
                const isSelected = selectedNote.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`
                      p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center justify-between text-left
                      ${isSelected 
                        ? "bg-blue-50/50 border-royal/30 shadow-inner" 
                        : "neumorphic-card border-white hover:border-royal/10"}
                    `}
                  >
                    <div className="flex items-center space-x-3 max-w-[80%]">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner ${
                        isSelected ? "bg-royal text-white" : "bg-ice text-royal"
                      }`}>
                        <Headphones className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold leading-tight truncate ${isSelected ? "text-royal" : "text-royal/80"}`}>
                          {note.title}
                        </p>
                        <span className="text-[10px] text-powder font-medium">{note.category}</span>
                      </div>
                    </div>
                    {isSelected && isPlaying && (
                      <span className="flex space-x-0.5 items-end h-3 pr-2">
                        <span className="w-1 bg-royal h-full rounded-full animate-[bounce_0.6s_infinite_100ms]" />
                        <span className="w-1 bg-royal h-2 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
                        <span className="w-1 bg-royal h-full rounded-full animate-[bounce_0.6s_infinite_300ms]" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-powder text-xs font-medium">
          No lecture materials available. Head to the Upload tab to scan study sheets!
        </div>
      )}
    </div>
  );
};
export default AudioTab;
