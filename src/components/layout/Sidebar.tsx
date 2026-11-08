"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  LineChart,
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sun,
  Moon,
} from "lucide-react";
import { useStore } from "@/lib/data/store";
import { useTheme } from "@/lib/theme";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { dispatch } = useStore();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Trend Explorer", href: "/explore", icon: Compass },
    { name: "Analytics", href: "/analytics", icon: LineChart },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Methodology & Data", href: "/methodology", icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen flex-col justify-between border-r border-editorial-border bg-surface transition-all duration-300 no-print ${
          collapsed ? "w-[72px]" : "w-[264px]"
        } ${
          isMobileOpen ? "flex left-0" : "-left-full md:left-0 md:flex"
        }`}
      >
        {/* Top: Logo & Nav */}
        <div className="flex flex-col">
          {/* Masthead */}
          <div className="flex h-16 items-center justify-between border-b border-editorial-border px-4">
            {!collapsed ? (
              <Link href="/" className="flex flex-col" onClick={onCloseMobile}>
                <span className="font-serif text-xl font-bold tracking-tight text-editorial-text">
                  TRENDWISE
                </span>
                <span className="text-[10px] uppercase tracking-widest text-editorial-text-2 font-medium">
                  Fashion Intelligence
                </span>
              </Link>
            ) : (
              <span className="font-serif text-xl font-bold text-editorial-accent-strong mx-auto">
                TW
              </span>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-editorial-text-2 hover:bg-surface-2 transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-surface-2 text-editorial-text font-semibold shadow-xs"
                      : "text-editorial-text-2 hover:bg-surface-2/60 hover:text-editorial-text"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-editorial-accent-strong" : "text-editorial-muted"
                    }`}
                  />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="border-t border-editorial-border p-3 space-y-2">
          {!collapsed && (
            <div className="px-2 py-1 text-[11px] text-editorial-text-2">
              <p className="font-semibold text-editorial-text">NIFT Research Prototype</p>
              <p className="text-[10px] text-editorial-text-2">5 colour trends · India market</p>
            </div>
          )}

          {/* Theme switcher button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-editorial-text-2 hover:bg-surface-2 hover:text-editorial-text transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-3.5 h-3.5 text-editorial-accent" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#D49D3B]" />
            )}
            {!collapsed && (
              <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
            )}
          </button>

          {/* Reload Demo */}
          <button
            onClick={() => dispatch({ type: "LOAD_DEMO_DATA" })}
            className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-editorial-text-2 hover:bg-surface-2 hover:text-editorial-text transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title="Reload Synthetic Demo Data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-editorial-accent" />
            {!collapsed && <span>Reload Demo Data</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
