import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { NeumorphicCard } from "./NeumorphicCard";
import { GlassPanel } from "./GlassPanel";
import { UploadCloud, Camera, Image, FileText, CheckCircle, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { StudyNote } from "../types";

export const UploadTab: React.FC = () => {
  const { addNote, setActiveNote, setActiveTab } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Upload, 2: OCR, 3: Format, 4: AI, 5: Finished
  const [progressVal, setProgressVal] = useState(0);

  const steps = [
    { label: "Uploading file", desc: "Sending document to local buffer" },
    { label: "Extracting text (OCR)", desc: "Reading handwritten/printed content with Tesseract" },
    { label: "Cleaning & formatting", desc: "Structuring text into readable paragraphs" },
    { label: "AI processing", desc: "Synthesizing summarization, flashcards, and quizzes" },
  ];

  // Simulated OCR trigger for demonstration
  const handleSimulatedScan = () => {
    setIsProcessing(true);
    setProgressVal(10);
    setCurrentStep(1);

    // Simulate progress bars
    const interval = setInterval(() => {
      setProgressVal((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleFinishScan();
          return 100;
        }

        const nextVal = prev + 15;
        if (nextVal >= 30 && nextVal < 60) {
          setCurrentStep(2); // OCR stage
        } else if (nextVal >= 60 && nextVal < 85) {
          setCurrentStep(3); // Clean format stage
        } else if (nextVal >= 85) {
          setCurrentStep(4); // AI processing stage
        }

        return Math.min(nextVal, 100);
      });
    }, 800);
  };

  const handleFinishScan = () => {
    setCurrentStep(5);
    
    // Generate a beautiful mock note based on sample history
    const sampleId = `note-${Date.now()}`;
    const newScannedNote: StudyNote = {
      id: sampleId,
      title: "Cell Division (Mitosis)",
      category: "Biology",
      createdAt: new Date().toISOString(),
      studyProgress: 0,
      textContent: `Cell division is the process by which a parent cell divides into two or more daughter cells. Mitosis is a part of the cell cycle where replicated chromosomes are separated into two new nuclei. Mitosis is divided into four distinct phases:
1. Prophase: Chromatin condenses into visible chromosomes.
2. Metaphase: Chromosomes align along the cell's equator.
3. Anaphase: Sister chromatids are pulled apart by spindle fibers.
4. Telophase: Nuclear envelopes reform around the separated sets of chromosomes.`,
      summary: "Mitosis is the cell division process creating two identical daughter nuclei. It consists of four main phases: Prophase (chromosome condensation), Metaphase (equator alignment), Anaphase (sister chromatids separate), and Telophase (nuclear division wraps up).",
      flashcards: [
        { id: `${sampleId}-fc1`, question: "What are the four phases of mitosis?", answer: "Prophase, Metaphase, Anaphase, and Telophase.", memorized: false },
        { id: `${sampleId}-fc2`, question: "In which phase do chromosomes align along the middle?", answer: "Metaphase.", memorized: false },
        { id: `${sampleId}-fc3`, question: "What structures pull sister chromatids apart?", answer: "Spindle fibers.", memorized: false },
      ],
      quiz: [
        {
          id: `${sampleId}-qz1`,
          question: "During which phase of mitosis do sister chromatids separate?",
          options: ["Prophase", "Metaphase", "Anaphase", "Telophase"],
          correctAnswer: "Anaphase",
          explanation: "In Anaphase, spindle fibers contract, pulling chromatids apart to opposite poles."
        }
      ]
    };

    // Inject note and navigate
    setTimeout(() => {
      addNote(newScannedNote);
      setActiveNote(newScannedNote);
      setActiveTab("library");
      setIsProcessing(false);
      setCurrentStep(0);
      setProgressVal(0);
    }, 1200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleSimulatedScan();
  };

  return (
    <div class="space-y-6 pb-24">
      {/* 1. View Title Header */}
      <div class="text-center space-y-1">
        <h2 class="font-display text-lg font-bold text-royal">Upload Notes</h2>
        <p class="text-xs text-powder">Transform paper notes into digital study boards</p>
      </div>

      {/* 2. Drag & Drop File Zone */}
      {!isProcessing ? (
        <div class="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleSimulatedScan}
            class={`
              w-full h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300
              ${isDragging 
                ? "border-royal bg-[#A9C0E0]/20 scale-95 shadow-inner" 
                : "border-[#A9C0E0] hover:border-royal bg-[#F4FEFF] shadow-[0_8px_24px_rgba(169,192,224,0.15)]"}
            `}
          >
            <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-royal mb-4 shadow-inner">
              <UploadCloud class="w-8 h-8" />
            </div>
            <h3 class="font-display text-sm font-bold text-royal mb-1">
              Drag & drop your notes here
            </h3>
            <p class="text-[11px] text-royal/70 mb-3">or tap to browse files</p>
            <span class="text-[9px] font-mono px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase tracking-wider font-bold">
              Supports: JPG, PNG, PDF (Max 20MB)
            </span>
          </div>

          {/* 3. Action Buttons Row */}
          <div class="grid grid-cols-3 gap-3">
            {[
              { label: "Camera", icon: Camera, color: "text-blue-500" },
              { label: "Gallery", icon: Image, color: "text-purple-500" },
              { label: "PDF File", icon: FileText, color: "text-green-500" },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.label}
                  onClick={handleSimulatedScan}
                  class="neumorphic-card rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 hover:scale-105 active:scale-95 transition-all duration-300 border border-white"
                >
                  <Icon class={`w-5 h-5 ${btn.color}`} />
                  <span class="text-[10px] font-bold text-royal">{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Prompt/Tutorial hint */}
          <div class="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start space-x-3 text-left">
            <Sparkles class="w-4 h-4 text-royal shrink-0 mt-0.5" />
            <div class="space-y-0.5">
              <span class="text-[11px] font-bold text-royal">Need a sample to test?</span>
              <p class="text-[10px] text-royal/80 leading-relaxed">
                Click anywhere on the upload region or on the shortcut buttons above. It will trigger our premium AI simulation engine to automatically scan a handwritten biology paper on Cell Division.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* 4. Processing Screen (matching mockup exactly!) */
        <NeumorphicCard class="space-y-6 py-8 border border-white">
          <div class="text-center space-y-1">
            <h3 class="font-display text-sm font-bold text-royal">Processing your notes...</h3>
            <p class="text-[10px] text-powder uppercase font-mono tracking-wider font-bold">AI Processing Pipeline</p>
          </div>

          {/* Step Timeline Indicator */}
          <div class="space-y-4 max-w-[85%] mx-auto">
            {steps.map((step, idx) => {
              const stepIndex = idx + 1;
              const isChecked = currentStep > stepIndex || currentStep === 5;
              const isCurrent = currentStep === stepIndex;
              const isPending = currentStep < stepIndex && currentStep !== 5;

              return (
                <div key={idx} class="flex items-start space-x-3">
                  {/* Status Node */}
                  <div class="pt-0.5">
                    {isChecked ? (
                      <CheckCircle class="w-4.5 h-4.5 text-green-500 fill-green-500/10" />
                    ) : isCurrent ? (
                      <Loader2 class="w-4.5 h-4.5 text-royal animate-spin" />
                    ) : (
                      <div class="w-4.5 h-4.5 rounded-full border border-powder flex items-center justify-center text-[9px] font-mono text-powder font-bold">
                        {stepIndex}
                      </div>
                    )}
                  </div>
                  
                  {/* Text Description */}
                  <div class="space-y-0.5">
                    <span class={`text-xs font-bold leading-tight ${
                      isChecked ? "text-green-600 font-semibold" : isCurrent ? "text-royal font-black" : "text-powder"
                    }`}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <p class="text-[10px] text-royal/70 leading-snug">
                        {step.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar matching mockup (e.g. 45%!) */}
          <div class="space-y-2 max-w-[85%] mx-auto pt-2">
            <div class="flex items-center justify-between text-[10px] font-mono text-royal font-bold">
              <span>Overall Progress</span>
              <span>{progressVal}%</span>
            </div>
            <div class="w-full bg-[#A9C0E0]/20 h-2.5 rounded-full overflow-hidden">
              <div 
                class="bg-gradient-to-r from-blue-400 to-royal h-full rounded-full transition-all duration-300"
                style={{ width: `${progressVal}%` }}
              />
            </div>
          </div>
        </NeumorphicCard>
      )}
    </div>
  );
};
export default UploadTab;
