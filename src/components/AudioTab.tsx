import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { NeumorphicCard } from "./NeumorphicCard";
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, Sparkles, 
  Settings, HelpCircle, Headphones, Star, AlertCircle 
} from "lucide-react";
import { StudyNote } from "../types";

export const AudioTab: React.FC = () => {
  const { notes, activeNote, setActiveNote, markAudioListened, incrementStudyMinutes } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [voiceType, setVoiceType] = useState<"calm" | "smart">("calm");
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("03:15");
  const [progress, setProgress] = useState(0);

  // Speech synthesis refs and states
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Waveform bars layout (mock visuals bouncing when playing)
  const [waveHeights, setWaveHeights] = useState<number[]>(
    Array.from({ length: 32 }, () => Math.floor(Math.random() * 25) + 5)
  );

  const selectedNote = activeNote || (notes.length > 0 ? notes[0] : null);

  // Animation effect for waveform when playing
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setWaveHeights(Array.from({ length: 32 }, () => Math.floor(Math.random() * 30) + 6));
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [synth]);

  // Handle Note switching in Audio Player
  const handleSelectNote = (note: StudyNote) => {
    if (synth) {
      synth.cancel();
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime("00:00");
    setActiveNote(note);
  };

  const handlePlayPause = () => {
    if (!selectedNote) return;

    if (!synth) {
      // Mock playback if speech synthesis is not available
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (synth.paused && utteranceRef.current) {
        synth.resume();
        setIsPlaying(true);
        startMockTimer();
      } else {
        synth.cancel(); // Clear any pending speak
        
        // Read either the summary or first 500 characters of text content
        const textToRead = selectedNote.summary || selectedNote.textContent.slice(0, 500);
        const utterance = new SpeechSynthesisUtterance(textToRead);
        
        // Configure speed rate
        utterance.rate = playbackSpeed;

        // Try to bind a clean voice based on selection
        const voices = synth.getVoices();
        if (voices.length > 0) {
          // Select voice based on type
          if (voiceType === "calm") {
            // Prefer natural sounding English voices
            const englishVoice = voices.find(v => v.lang.includes("en-US") && v.name.includes("Natural")) || 
                                 voices.find(v => v.lang.includes("en") && (v.name.includes("Zira") || v.name.includes("Google")));
            if (englishVoice) utterance.voice = englishVoice;
          } else {
            const highTechVoice = voices.find(v => v.lang.includes("en-US") && v.name.includes("David")) || 
                                  voices.find(v => v.lang.includes("en"));
            if (highTechVoice) utterance.voice = highTechVoice;
          }
        }

        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(100);
          setCurrentTime(duration);
          if (timerRef.current) clearInterval(timerRef.current);
          if (selectedNote) {
            markAudioListened(selectedNote.id);
            incrementStudyMinutes(5); // Complete lecture reward
          }
        };

        utterance.onerror = (e) => {
          if (e.error !== "interrupted") {
            console.warn("SpeechSynthesisUtterance Info:", e.error);
          }
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
        };

        utteranceRef.current = utterance;
        synth.speak(utterance);
        setIsPlaying(true);
        startMockTimer();
      }
    }
  };

  const startMockTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Simulate current audio progress tracking
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 100;
        }
        const nextProg = prev + 1;
        
        // Update labels
        const totalSecs = Math.round((nextProg / 100) * 195); // 195s total (3:15)
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setCurrentTime(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
        
        return nextProg;
      });
    }, 1000);
  };

  const handleSpeedToggle = () => {
    const nextSpeed = playbackSpeed === 1.0 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1.0;
    setPlaybackSpeed(nextSpeed);
    
    // If speaking, restart to apply new speed rate
    if (isPlaying && synth) {
      synth.cancel();
      setIsPlaying(false);
      setTimeout(() => {
        handlePlayPause();
      }, 100);
    }
  };

  const handleVoiceTypeToggle = () => {
    setVoiceType(voiceType === "calm" ? "smart" : "calm");
    if (isPlaying && synth) {
      synth.cancel();
      setIsPlaying(false);
      setTimeout(() => {
        handlePlayPause();
      }, 100);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header */}
      <div className="text-center space-y-1">
        <h2 className="font-display text-lg font-bold text-royal">Audio Notes Player</h2>
        <p className="text-xs text-powder">Listen to AI synthesized lectures & summaries</p>
      </div>

      {selectedNote ? (
        <div className="space-y-6">
          {/* 2. Audio Card Plate */}
          <NeumorphicCard className="space-y-6 relative overflow-hidden border border-white">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#A9C0E0]/10 rounded-full" />
            
            {/* Subject details & lesson meta */}
            <div className="text-center space-y-1 relative z-10">
              <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {selectedNote.category}
              </span>
              <h3 className="font-display text-md font-extrabold text-royal leading-tight pt-1 truncate">
                {selectedNote.title}
              </h3>
              <p className="text-[10px] text-powder font-medium">Lecturer Mode • AI Synthesizer</p>
            </div>

            {/* Waveform Visualization Plate (bouncing bars) */}
            <div className="h-20 bg-blue-50/40 rounded-2xl flex items-center justify-center space-x-0.5 px-6 shadow-inner border border-[#A9C0E0]/15">
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  className={`
                    w-1.5 rounded-full transition-all duration-150 ease-out
                    ${isPlaying ? "bg-[#0E2F76]" : "bg-[#A9C0E0]/60"}
                  `}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Time labels & track slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-royal/80">
                <span>{currentTime}</span>
                <span>{duration}</span>
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
              <button className="w-10 h-10 rounded-full neumorphic-card flex items-center justify-center text-royal/60 cursor-not-allowed">
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              
              {/* Giant glowing Play/Pause FAB */}
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-royal to-blue-600 text-white flex items-center justify-center shadow-lg soft-glow-blue hover:from-blue-600 hover:to-royal"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-white stroke-none" />
                ) : (
                  <Play className="w-7 h-7 fill-white stroke-none ml-1" />
                )}
              </button>

              <button className="w-10 h-10 rounded-full neumorphic-card flex items-center justify-center text-royal/60 cursor-not-allowed">
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Adjustments row (Speed & voice settings) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSpeedToggle}
                className="py-2.5 rounded-full neumorphic-card text-[11px] font-bold text-royal flex items-center justify-center space-x-1.5"
              >
                <span>{playbackSpeed.toFixed(2)}x</span>
                <span className="text-[9px] text-powder uppercase font-mono tracking-wider font-bold">Speed</span>
              </button>

              <button
                onClick={handleVoiceTypeToggle}
                className="py-2.5 rounded-full neumorphic-card text-[11px] font-bold text-royal flex items-center justify-center space-x-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-royal" />
                <span>{voiceType === "calm" ? "Calm Voice" : "Smart AI"}</span>
              </button>
            </div>
          </NeumorphicCard>

          {/* 3. Playlist select area */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-royal pl-1">Available Audios</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {notes.map((note) => {
                const isSelected = selectedNote.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`
                      p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center justify-between
                      ${isSelected 
                        ? "bg-blue-50/50 border-royal/30" 
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
                        <p className={`text-xs font-bold leading-tight ${isSelected ? "text-royal" : "text-royal/80"}`}>
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
