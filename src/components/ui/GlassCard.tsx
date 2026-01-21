"use client";

import { useTheme } from "@/context/ThemeContext";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  accentColor?: string;
}

export function GlassCard({ children, className = "", gradient, accentColor }: GlassCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const defaultGradient = isDark
    ? "radial-gradient(ellipse at top left, rgba(40, 169, 99, 0.1) 0%, transparent 50%)"
    : "radial-gradient(ellipse at top left, rgba(40, 169, 99, 0.08) 0%, transparent 50%)";

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        border border-border
        shadow-xl
        bg-card
        ${className}
      `}
      style={{
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: gradient || defaultGradient,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default GlassCard;
