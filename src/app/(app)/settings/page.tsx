"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useBoardStore } from "@/store/board-store";
import { Button } from "@/components/ui/button";
import { Settings, Volume2, Palette, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const {
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    showCoordinates,
    setShowCoordinates,
  } = useBoardStore();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const themes: Array<{ id: "classic" | "wood" | "green" | "blue" | "glass"; name: string; light: string; dark: string }> = [
    { id: "classic", name: "Warm Classic Wood", light: "#f3e7db", dark: "#8a5839" },
    { id: "wood", name: "Natural Walnut", light: "#f0d9b5", dark: "#b58863" },
    { id: "green", name: "Tournament Green", light: "#eeeed2", dark: "#769656" },
    { id: "blue", name: "Modern Navy Blue", light: "#c5d5e4", dark: "#4f7797" },
    { id: "glass", name: "Midnight Charcoal", light: "#8d99ae", dark: "#2b2d42" },
  ];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-extrabold text-neutral-100 tracking-tight">
            Preferences & Settings
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Customize your chessboard aesthetic, audio feedback, and study experience.
        </p>
      </div>

      {savedSuccess ? (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 rounded-lg">
          Settings saved successfully!
        </div>
      ) : null}

      {/* Board Theme Selection */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <Palette className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-neutral-200">
            Chessboard Color Theme
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                theme === t.id
                  ? "bg-neutral-800 border-amber-500 ring-2 ring-amber-500/30"
                  : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
              }`}
            >
              {/* Mini 2x2 board swatch */}
              <div className="w-8 h-8 rounded-md overflow-hidden grid grid-cols-2 border border-neutral-700/60 shrink-0">
                <div style={{ backgroundColor: t.light }} />
                <div style={{ backgroundColor: t.dark }} />
                <div style={{ backgroundColor: t.dark }} />
                <div style={{ backgroundColor: t.light }} />
              </div>

              <div>
                <span className="text-xs font-semibold text-neutral-100 block">
                  {t.name}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {theme === t.id ? "Active Theme" : "Select"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Audio & Interaction Toggles */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
          <Volume2 className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-neutral-200">
            Board Audio & Notations
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
            <div>
              <span className="text-xs font-semibold text-neutral-200 block">
                Sound Effects
              </span>
              <span className="text-[11px] text-neutral-400">
                Play subtle synthesized audio on moves, captures, checks, and practice feedback.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                soundEnabled ? "bg-amber-600" : "bg-neutral-800"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
            <div>
              <span className="text-xs font-semibold text-neutral-200 block">
                Show Board Coordinates
              </span>
              <span className="text-[11px] text-neutral-400">
                Display algebraic rank (1-8) and file (a-h) notations on the edges of the board.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCoordinates(!showCoordinates)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                showCoordinates ? "bg-amber-600" : "bg-neutral-800"
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
      <div className="p-5 bg-neutral-900 border border-red-950/60 rounded-xl space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-red-950/60 text-red-400">
          <ShieldAlert className="w-4 h-4" />
          <h2 className="text-sm font-bold">Account Management</h2>
        </div>
        <p className="text-xs text-neutral-400">
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
            className="text-xs text-red-400 border-red-900/60 hover:bg-red-950/40"
          >
            Sign Out of Account
          </Button>
        </div>
      </div>
    </div>
  );
}
