"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
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
    // { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Studies", href: "/studies", icon: BookOpen },
    // { label: "Training", href: "/training", icon: GraduationCap },
    { label: "Games & Import", href: "/games", icon: Swords },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0 hidden md:flex transition-colors">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <Link href="/studies" className="flex items-center gap-2.5 px-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Crown className="w-5 h-5 fill-neutral-950" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-sidebar-foreground block">
              LearnChess
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
              Repertoire Platform
            </span>
          </div>
        </Link>

        {/* Quick New Study Button */}
        {onOpenCreateStudy ? (
          <button
            onClick={onOpenCreateStudy}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
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
                    ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary rounded-l-none"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-muted"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
