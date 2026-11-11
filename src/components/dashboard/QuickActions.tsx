import React from "react";
import Link from "next/link";
import { PlusCircle, GraduationCap, Upload, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onOpenCreateStudy: () => void;
}

export function QuickActions({ onOpenCreateStudy }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="amber"
        onClick={onOpenCreateStudy}
        className="font-semibold shadow-md"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        New Opening Study
      </Button>

      <Link href="/training">
        <Button variant="secondary">
          <GraduationCap className="w-4 h-4 mr-2 text-amber-400" />
          Start Training
        </Button>
      </Link>

      <Link href="/games">
        <Button variant="outline">
          <Swords className="w-4 h-4 mr-2 text-blue-400" />
          Analyze Real Game / PGN
        </Button>
      </Link>
    </div>
  );
}
