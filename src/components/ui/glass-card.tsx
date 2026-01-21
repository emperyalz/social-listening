import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "border-white/20 dark:border-gray-800/50",
      success: "border-emerald-500/30 bg-emerald-500/5",
      warning: "border-amber-500/30 bg-amber-500/5",
      danger: "border-red-500/30 bg-red-500/5",
      info: "border-blue-500/30 bg-blue-500/5",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border shadow-lg p-6",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
