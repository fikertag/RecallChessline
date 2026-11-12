"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth";
import { LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavbarProps {
  user?: User | null;
  onOpenCreateStudy?: () => void;
}

export function Navbar({ user, onOpenCreateStudy }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      //
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Mobile brand */}
      <div className="flex items-center gap-3">
        <Link href="/studies" className="md:hidden font-bold text-primary">
          LearnChess
        </Link>
      </div>

      {/* Right actions: ThemeToggle + Profile */}
      <div className="flex items-center gap-3">
        {onOpenCreateStudy ? (
          <Button
            variant="default"
            size="sm"
            onClick={onOpenCreateStudy}
            className="md:hidden text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New
          </Button>
        ) : null}

        {/* Global Dark / Light Mode Toggle */}
        <ThemeToggle />

        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-foreground block leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-foreground block leading-tight">
                  {user.email}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sign Out"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
