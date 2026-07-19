import React from "react";

interface StatRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  id?: string;
}

export const StatRing: React.FC<StatRingProps> = ({
  percentage,
  size = 140,
  strokeWidth = 12,
  label,
  sublabel,
  id,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div id={id} className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90 filter drop-shadow-[0_4px_10px_rgba(169,192,224,0.3)]">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#0E2F76" />
          </linearGradient>
        </defs>
        {/* Background Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#A9C0E0"
          strokeWidth={strokeWidth}
          opacity="0.25"
        />
        {/* Glowing Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Inner Label Container */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-bold text-royal">{label || `${percentage}%`}</span>
        {sublabel && <span className="text-[10px] uppercase font-mono tracking-wider text-powder mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
};
export default StatRing;
