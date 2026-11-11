"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Swords,
  Settings,
  PlusCircle,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onOpenCreateStudy?: () => void;
}

export function Sidebar({ onOpenCreateStudy }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Studies", href: "/studies", icon: BookOpen },
    { label: "Training", href: "/training", icon: GraduationCap },
    { label: "Games & Import", href: "/games", icon: Swords },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0 hidden md:flex">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Crown className="w-5 h-5 fill-neutral-950" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">
              LearnChess
            </span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium">
              Repertoire Platform
            </span>
          </div>
        </Link>

        {/* Quick New Study Button */}
        {onOpenCreateStudy ? (
          <button
            onClick={onOpenCreateStudy}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Study</span>
          </button>
        ) : null}

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-500/10 text-amber-400 font-semibold border-l-2 border-amber-500 rounded-l-none"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-amber-500" : "text-neutral-500")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/60 text-xs text-neutral-400">
        <p className="font-semibold text-neutral-200">Chess Repertoire 2.0</p>
        <p className="text-[11px] text-neutral-500 mt-0.5">
          Active recall & visual move trees for competitive memory.
        </p>
      </div>
    </aside>
  );
}
