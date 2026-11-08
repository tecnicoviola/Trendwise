"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1 w-full max-w-[1280px] mx-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

