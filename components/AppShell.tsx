"use client";

import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AppShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpen = () => setIsSidebarOpen(true);
  const handleClose = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={handleClose} />

      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open navigation"
        aria-expanded={isSidebarOpen}
        className={`md:hidden fixed top-[calc(env(safe-area-inset-top)+1rem)] left-[calc(env(safe-area-inset-left)+1rem)] z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-surface/90 text-foreground shadow-lg backdrop-blur-xl transition-opacity ${
          isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Menu size={18} />
      </button>

      <main className="flex-1 min-h-0 relative overflow-y-auto bg-transparent selection:bg-primary/20 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto min-h-full flex flex-col">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
