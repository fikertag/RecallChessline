import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/context/query-provider";

export const metadata: Metadata = {
  title: "LearnChess — Chess Opening Learning & Repertoire Platform",
  description:
    "Build, organize, branch, and memorize your personal chess opening repertoires through visual move trees and active recall practice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-neutral-950 text-neutral-100 antialiased">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 selection:bg-amber-500/30 selection:text-amber-200">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
