import React from "react";

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  inset?: boolean;
  hoverable?: boolean;
  className?: string;
  id?: string;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  inset = false,
  hoverable = false,
  className = "",
  id,
  ...props
}) => {
  return (
    <div
      id={id}
      className={`
        rounded-3xl p-6 transition-all duration-300
        ${inset ? "neumorphic-inset" : "neumorphic-card"}
        ${hoverable && !inset ? "neumorphic-card-hover cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
export default NeumorphicCard;
