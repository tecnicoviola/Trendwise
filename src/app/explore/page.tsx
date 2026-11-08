"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/data/store";
import { selectAllTrendAnalyses, selectTrendAuditAnalysis } from "@/lib/data/selectors";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { DirectionChip } from "@/components/ui/DirectionChip";
import { Direction } from "@/types/data";
import { Search, SlidersHorizontal, RotateCcw, ArrowRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { getTrendColor } from "@/lib/colors";

type SortOption = "name" | "slope" | "yoy" | "audit";

export default function TrendExplorerPage() {
  const { state } = useStore();
  const allAnalyses = selectAllTrendAnalyses(state);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Direction>("All");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  // Filter and sort trends
  const filteredTrends = useMemo(() => {
    return allAnalyses
      .map((analysis) => {
        const audit = selectTrendAuditAnalysis(state, analysis.trendId);
        return { analysis, audit };
      })
      .filter(({ analysis }) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = analysis.trendName.toLowerCase().includes(q);
          const matchId = analysis.trendId.toLowerCase().includes(q);
          if (!matchName && !matchId) return false;
        }

        // Status filter
        if (statusFilter !== "All") {
          if (analysis.stats?.direction !== statusFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.analysis.trendName.localeCompare(b.analysis.trendName);
        }
        if (sortBy === "slope") {
          return (
            (b.analysis.stats?.normalisedSlope || 0) -
            (a.analysis.stats?.normalisedSlope || 0)
          );
        }
        if (sortBy === "yoy") {
          return (b.analysis.yoy?.value || 0) - (a.analysis.yoy?.value || 0);
        }
        if (sortBy === "audit") {
          return (b.audit?.frequency || 0) - (a.audit?.frequency || 0);
        }
        return 0;
      });
  }, [allAnalyses, state, searchQuery, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setSortBy("name");
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <section className="border-b border-editorial-border pb-6 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-editorial-text-2">
          Directory
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-editorial-text">
          Trend Explorer
        </h1>
        <p className="text-xs md:text-sm text-editorial-text-2 max-w-2xl">
          Browse, filter and compare the five tracked Indian colour trends across both consumer search interest and retail market presence.
        </p>
      </section>

      {/* Filter and Search Bar */}
      <section className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-surface p-4 rounded-xl border border-editorial-border">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-editorial-muted" />
          <input
            type="text"
            placeholder="Search trend name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-editorial-border bg-surface text-xs text-editorial-text focus:outline-none focus:border-editorial-accent"
          />
        </div>

        {/* Status Filter & Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Buttons */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-editorial-border text-xs">
            {(["All", "Increasing", "Stable", "Decreasing"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  statusFilter === status
                    ? "bg-surface text-editorial-text shadow-xs font-semibold"
                    : "text-editorial-text-2 hover:text-editorial-text"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-editorial-text-2">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 rounded-lg border border-editorial-border bg-surface text-editorial-text text-xs focus:outline-none"
            >
              <option value="name">Name (A–Z)</option>
              <option value="slope">Normalised Slope (High to Low)</option>
              <option value="yoy">YoY Change (High to Low)</option>
              <option value="audit">Retail Audit Frequency</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== "All" || sortBy !== "name") && (
            <button
              onClick={clearFilters}
              className="text-xs text-editorial-accent-strong hover:underline flex items-center gap-1 font-medium ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </section>

      {/* Grid of Portrait Trend Cards (4:5 swatch composition) */}
      {filteredTrends.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {filteredTrends.map(({ analysis, audit }, idx) => {
            const colorToken = getTrendColor(analysis.trendId);
            const sparklineData = analysis.series.map((s) => ({ value: s.value }));
            const lastMonth =
              analysis.series.length > 0
                ? analysis.series[analysis.series.length - 1].date
                : "2026-10";

            return (
              <Link
                key={analysis.trendId}
                href={`/trend?id=${analysis.trendId}`}
                className="group flex flex-col rounded-2xl border border-editorial-border bg-surface p-4 hover:border-editorial-accent transition-all duration-300 shadow-xs hover:shadow-md"
              >
                {/* 4:5 Portrait Swatch Composition */}
                <div className="w-full mb-3">
                  <ColorSwatch
                    trendId={analysis.trendId}
                    trendName={analysis.trendName}
                    aspectRatio="4/5"
                    showCaption={true}
                  />
                </div>

                {/* Number & Name */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-editorial-text-2 font-mono">
                    <span>No. {String(idx + 1).padStart(2, "0")}</span>
                    <span>{analysis.category}</span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-editorial-text group-hover:text-editorial-accent-strong transition-colors">
                    {analysis.trendName}
                  </h3>
                </div>

                {/* Direction Chip & YoY */}
                <div className="flex items-center justify-between pt-2">
                  {analysis.stats && (
                    <DirectionChip direction={analysis.stats.direction} showIcon={false} />
                  )}
                  <span className="text-xs font-mono font-medium text-editorial-text-2">
                    {analysis.yoy && analysis.yoy.value !== null
                      ? `${analysis.yoy.value >= 0 ? "+" : ""}${analysis.yoy.value.toFixed(1)}% YoY`
                      : "YoY n/a"}
                  </span>
                </div>

                {/* Tiny Sparkline */}
                <div className="h-10 w-full my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={colorToken.line}
                        strokeWidth={1.8}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Shelf Frequency & Last Data Month */}
                <div className="mt-auto pt-2 border-t border-editorial-border/60 flex items-center justify-between text-[11px] text-editorial-text-2">
                  <span>
                    Audit:{" "}
                    <strong className="text-editorial-text">
                      {audit ? `${audit.frequency.toFixed(1)}%` : "n/a"}
                    </strong>
                  </span>
                  <span className="font-mono text-[10px]">{lastMonth}</span>
                </div>
              </Link>
            );
          })}
        </section>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-editorial-border bg-surface space-y-3">
          <p className="font-serif text-lg text-editorial-text font-bold">No matching trends found</p>
          <p className="text-xs text-editorial-text-2">
            Try adjusting your search query or status filter.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg bg-editorial-accent-strong text-white text-xs font-medium"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

