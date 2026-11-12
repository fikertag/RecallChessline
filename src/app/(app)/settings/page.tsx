"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useBoardStore } from "@/store/board-store";
import { useTheme } from "@/context/theme-provider";
import { Button } from "@/components/ui/button";
import { Settings, Volume2, Palette, ShieldAlert, Sun, Moon, Monitor } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();

  const {
    theme: boardTheme,
    setTheme: setBoardTheme,
    soundEnabled,
    setSoundEnabled,
    showCoordinates,
    setShowCoordinates,
  } = useBoardStore();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const boardThemes: Array<{
    id: "classic" | "wood" | "green" | "blue" | "glass";
    name: string;
    light: string;
    dark: string;
  }> = [
    { id: "classic", name: "Warm Classic Wood", light: "#f3e7db", dark: "#8a5839" },
    { id: "wood", name: "Natural Walnut", light: "#f0d9b5", dark: "#b58863" },
    { id: "green", name: "Tournament Green", light: "#eeeed2", dark: "#769656" },
    { id: "blue", name: "Modern Navy Blue", light: "#c5d5e4", dark: "#4f7797" },
    { id: "glass", name: "Midnight Charcoal", light: "#8d99ae", dark: "#2b2d42" },
  ];

  return (
    <div className="space-y-6 mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Preferences & Appearance
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Customize your application theme, chessboard aesthetic, audio feedback, and study preferences.
        </p>
      </div>

      {savedSuccess ? (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 rounded-lg">
          Settings saved successfully!
        </div>
      ) : null}

      {/* Application Theme (Dark & Light Mode) */}
      <div className="p-5 bg-card text-card-foreground border border-border rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Application Theme (Light & Dark Mode)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setAppTheme("dark")}
            className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${
              appTheme === "dark"
                ? "bg-secondary border-primary ring-2 ring-primary/30"
                : "bg-muted/40 border-border hover:border-primary/40"
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Dark Mode
              </span>
              <span className="text-[10px] text-muted-foreground">
                Midnight surfaces & amber accents
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAppTheme("light")}
            className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${
              appTheme === "light"
                ? "bg-secondary border-primary ring-2 ring-primary/30"
                : "bg-muted/40 border-border hover:border-primary/40"
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Light Mode
              </span>
              <span className="text-[10px] text-muted-foreground">
                Crisp high-contrast daylight aesthetic
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAppTheme("system")}
            className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${
              appTheme === "system"
                ? "bg-secondary border-primary ring-2 ring-primary/30"
                : "bg-muted/40 border-border hover:border-primary/40"
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-primary shrink-0 shadow-xs">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block">
                System Default
              </span>
              <span className="text-[10px] text-muted-foreground">
                Sync automatically with device OS
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Board Theme Selection */}
      <div className="p-5 bg-card text-card-foreground border border-border rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Chessboard Wood & Color Theme
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {boardThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => setBoardTheme(t.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                boardTheme === t.id
                  ? "bg-secondary border-primary ring-2 ring-primary/30"
                  : "bg-muted/40 border-border hover:border-primary/40"
              }`}
            >
              {/* Mini 2x2 board swatch */}
              <div className="w-8 h-8 rounded-md overflow-hidden grid grid-cols-2 border border-border shrink-0">
                <div style={{ backgroundColor: t.light }} />
                <div style={{ backgroundColor: t.dark }} />
                <div style={{ backgroundColor: t.dark }} />
                <div style={{ backgroundColor: t.light }} />
              </div>

              <div>
                <span className="text-xs font-semibold text-foreground block">
                  {t.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {boardTheme === t.id ? "Active Board" : "Select"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Audio & Interaction Toggles */}
      <div className="p-5 bg-card text-card-foreground border border-border rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Volume2 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Board Audio & Notations
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Sound Effects
              </span>
              <span className="text-[11px] text-muted-foreground">
                Play synthesized chess audio on moves, captures, checks, and practice feedback.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                soundEnabled ? "bg-primary" : "bg-muted border border-border"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Show Board Coordinates
              </span>
              <span className="text-[11px] text-muted-foreground">
                Display algebraic rank (1-8) and file (a-h) notations on the edges of the board.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCoordinates(!showCoordinates)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                showCoordinates ? "bg-primary" : "bg-muted border border-border"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  showCoordinates ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 bg-card text-card-foreground border border-destructive/30 rounded-xl space-y-3 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-destructive/20 text-destructive">
          <ShieldAlert className="w-4 h-4" />
          <h2 className="text-sm font-bold">Account Management</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          To reset your training stats or manage your private data, sign out or contact support.
        </p>
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/login");
            }}
            className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            Sign Out of Account
          </Button>
        </div>
      </div>
    </div>
  );
}
