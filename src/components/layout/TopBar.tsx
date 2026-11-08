"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UploadCloud, Menu } from "lucide-react";
import { useStore } from "@/lib/data/store";
import { OriginBadge } from "../ui/OriginBadge";
import { ImportWizard } from "../data/ImportWizard";
import { ThemeToggle } from "@/lib/theme";

interface TopBarProps {
  onToggleSidebar?: () => void;
  pageTitle?: string;
  category?: string;
}

export function TopBar({ onToggleSidebar, pageTitle, category }: TopBarProps) {
  const { state } = useStore();
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Determine overall origin to display in top badge
  const origin =
    state.consumerOrigin === "Synthetic demonstration" ||
    state.auditOrigin === "Synthetic demonstration"
      ? "Synthetic demonstration"
      : "Real observations";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-editorial-border bg-surface/90 backdrop-blur-md px-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-editorial-text hover:bg-surface-2 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            {category && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-editorial-text-2">
                {category}
              </span>
            )}
            <h1 className="text-sm md:text-base font-semibold text-editorial-text leading-none">
              {pageTitle || "Overview"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Data Origin Badge */}
          <OriginBadge origin={origin} size="sm" />

          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle />

          {/* Data import action button */}
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-accent-strong transition-colors shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import Data</span>
          </button>
        </div>
      </header>

      {/* Global Import Wizard Modal */}
      <ImportWizard isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </>
  );
}
