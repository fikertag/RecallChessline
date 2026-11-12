"use client";

import React from "react";
import { useTheme } from "@/context/theme-provider";
import { Sun, Moon } from "lucide-react";
import { Button } from "./button";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={className || "h-9 w-9 text-muted-foreground hover:text-foreground"}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 transition-all hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-all hover:-rotate-12" />
      )}
    </Button>
  );
}

