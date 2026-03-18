import { cn } from "../../lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-gray-600/40 bg-linear-to-br from-white/8 to-white/3 backdrop-blur-md transition-all duration-300",
        hoverEffect && "hover:bg-linear-to-br hover:from-white/12 hover:to-white/5 hover:border-white/30 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
