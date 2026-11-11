import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Crown,
  GitBranch,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md px-6 h-16 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-bold shadow-md shadow-amber-500/20">
            <Crown className="w-5 h-5 fill-neutral-950" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">LearnChess</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-neutral-300">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="amber" size="sm" className="font-semibold">
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center justify-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Modern Chess Repertoire System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-100 max-w-3xl leading-[1.15]">
          Master Your Openings Through{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
            Branching Visual Trees
          </span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
          Stop memorizing flat PGN files. Build personal branching trees of moves, annotate strategic ideas, and test your memory with active recall practice against every opponent variation.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/register">
            <Button variant="amber" size="lg" className="font-bold text-sm shadow-xl shadow-amber-500/20">
              Start Building Your Repertoire
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="text-sm">
              Sign In to Your Studies
            </Button>
          </Link>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left w-full">
          <div className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl relative group hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-100">
              Visual Branching Tree
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Every opponent move can branch into custom responses. Extend lines indefinitely without overwriting existing preparation.
            </p>
          </div>

          <div className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl relative group hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-100">
              Active Recall Training
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Test your retention in Guided Mode or blind Active Recall. The engine plays saved opponent variations and tracks mistake hotspots.
            </p>
          </div>

          <div className="p-6 bg-neutral-900/60 border border-neutral-800 rounded-2xl relative group hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Swords className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-100">
              Real-Game Expansion
            </h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Encountered a novelty on Chess.com or Lichess? Import games directly into your existing study to constantly grow your repertoire.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-6 px-6 text-center text-xs text-neutral-500">
        LearnChess — Personal Chess Opening Repertoire Platform. Built with Next.js, TypeScript, and chess.js.
      </footer>
    </div>
  );
}
