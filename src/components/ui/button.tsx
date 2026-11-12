import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "ghost" | "amber";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variants = {
      default:
        "bg-primary text-primary-foreground hover:opacity-90 shadow-sm active:scale-[0.98]",
      amber:
        "bg-amber-600 dark:bg-amber-500 text-white dark:text-neutral-950 font-semibold hover:bg-amber-700 dark:hover:bg-amber-400 shadow-sm",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
      outline:
        "border border-border text-foreground hover:bg-muted hover:text-foreground",
      danger:
        "bg-destructive text-destructive-foreground hover:opacity-90 active:scale-[0.98]",
      ghost:
        "text-muted-foreground hover:text-foreground hover:bg-muted",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "h-9 w-9 p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
