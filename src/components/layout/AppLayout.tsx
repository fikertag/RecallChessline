"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { CreateStudyModal } from "@/components/study/CreateStudyModal";
import { User } from "@/types/auth";

interface AppLayoutProps {
  children: React.ReactNode;
  user?: User | null;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      {/* Sidebar (Desktop) */}
      <Sidebar onOpenCreateStudy={() => setIsCreateOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} onOpenCreateStudy={() => setIsCreateOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Global Create Study Modal */}
      <CreateStudyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
