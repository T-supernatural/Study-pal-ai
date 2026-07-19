import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = "",
  id,
  ...props
}) => {
  return (
    <div
      id={id}
      className={`
        liquid-glass rounded-3xl p-6
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassPanel;
