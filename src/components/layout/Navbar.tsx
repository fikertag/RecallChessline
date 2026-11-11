"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth";
import { LogOut, User as UserIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <header className="h-16 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile brand & breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="md:hidden font-bold text-amber-500">
          LearnChess
        </Link>
      </div>

      {/* Right actions */}
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

        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-neutral-200 block leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-neutral-400 block leading-tight">
                  {user.email}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sign Out"
              className="h-8 w-8 text-neutral-400 hover:text-red-400"
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
