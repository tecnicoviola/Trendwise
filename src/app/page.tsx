"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/lib/data/store";
import {
  selectOverviewKPIs,
  selectAllTrendAnalyses,
  selectAuditOverview,
  selectTrendAuditAnalysis,
} from "@/lib/data/selectors";
import { OriginBadge } from "@/components/ui/OriginBadge";
import { DirectionChip } from "@/components/ui/DirectionChip";
import { SmallMultipleChart } from "@/components/charts/SmallMultipleChart";
import { RetailSnapshotBars } from "@/components/charts/RetailSnapshotBars";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import {
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  Sparkles,
  ArrowRight,
  Database,
  ExternalLink,
} from "lucide-react";

export default function OverviewPage() {
  const { state } = useStore();
  const kpis = selectOverviewKPIs(state);
  const allAnalyses = selectAllTrendAnalyses(state);
  const auditOverview = selectAuditOverview(state);

  const hasData = state.consumerRows.length > 0 || state.auditRows.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-editorial-border bg-surface my-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-editorial-muted">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-editorial-text">No Trend Data Loaded</h2>
        <p className="text-xs text-editorial-text-2 max-w-md">
          Load the synthetic demo dataset or import your own Google Trends and Fashion Audit CSV files to begin exploring.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-editorial-accent-strong text-white text-xs font-medium hover:bg-opacity-95"
          >
            Load Demo Data
          </button>
        </div>
      </div>
    );
  }

  // Pre-fetch audit analyses for each trend
  const trendAudits = allAnalyses
    .map((a) => selectTrendAuditAnalysis(state, a.trendId))
    .filter(Boolean) as any[];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Editorial Header */}
      <section className="border-b border-editorial-border pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-editorial-text-2">
            Overview
          </span>
          <span className="text-editorial-muted">•</span>
          <span className="text-xs text-editorial-text-2">India Market (Nov 2023 – Oct 2026)</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-editorial-text">
            Colour Trends in India
          </h1>
          <OriginBadge
            origin={
              state.consumerOrigin === "Synthetic demonstration"
                ? "Synthetic demonstration"
                : "Real observations"
            }
          />
        </div>

        <p className="text-xs md:text-sm text-editorial-text-2 max-w-3xl leading-relaxed pt-1">
          A dual-signal fashion intelligence prototype comparing 36 months of consumer search interest with a 50-item manual retail audit across three fashion retailers. Datasets remain separate and are evaluated side by side.
        </p>
      </section>

      {/* KPI Row (All derived from loaded data) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tracked Trends */}
        <div className="p-4 rounded-xl border border-editorial-border bg-surface space-y-1">
          <div className="flex items-center justify-between text-editorial-text-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Trends Tracked</span>
            <Layers className="w-4 h-4 text-editorial-accent" />
          </div>
          <p className="text-2xl font-bold font-mono text-editorial-text">{kpis.trendsTracked}</p>
          <p className="text-[11px] text-editorial-text-2">Five core colour signals</p>
        </div>

        {/* Direction Distribution */}
        <div className="p-4 rounded-xl border border-editorial-border bg-surface space-y-1">
          <div className="flex items-center justify-between text-editorial-text-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Search Trajectory</span>
            <TrendingUp className="w-4 h-4 text-editorial-accent" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold mt-1">
            <span className="text-editorial-success">{kpis.increasingCount} Up</span>
            <span className="text-editorial-text-2">/</span>
            <span className="text-editorial-text">{kpis.stableCount} Flat</span>
            <span className="text-editorial-text-2">/</span>
            <span className="text-editorial-error">{kpis.decreasingCount} Down</span>
          </div>
          <p className="text-[11px] text-editorial-text-2">36-mo OLS slope classification</p>
        </div>

        {/* Audit Sample Size */}
        <div className="p-4 rounded-xl border border-editorial-border bg-surface space-y-1">
          <div className="flex items-center justify-between text-editorial-text-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Audit Snapshot</span>
            <Activity className="w-4 h-4 text-editorial-accent" />
          </div>
          <p className="text-2xl font-bold font-mono text-editorial-text">
            {kpis.auditProductCount} items
          </p>
          <p className="text-[11px] text-editorial-text-2 truncate">
            {kpis.auditDate ? `Sampled on ${kpis.auditDate}` : "One-day snapshot"}
          </p>
        </div>

        {/* Recent Collection */}
        <div className="p-4 rounded-xl border border-editorial-border bg-surface space-y-1">
          <div className="flex items-center justify-between text-editorial-text-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Data Current As Of</span>
            <Calendar className="w-4 h-4 text-editorial-accent" />
          </div>
          <p className="text-2xl font-bold font-mono text-editorial-text">
            {kpis.recentCollectionDate}
          </p>
          <p className="text-[11px] text-editorial-text-2">Latest Google Trends collection</p>
        </div>
      </section>

      {/* Featured Movers Editorial Section */}
      {kpis.featuredMovers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold text-editorial-text">Featured Movers</h2>
              <p className="text-xs text-editorial-text-2">
                Strongest upward momentum by 36-month normalised slope
              </p>
            </div>
            <Link
              href="/explore"
              className="text-xs font-semibold text-editorial-accent-strong hover:underline flex items-center gap-1"
            >
              <span>Explore all trends</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kpis.featuredMovers.map(({ analysis, audit, alignment }) => (
              <div
                key={analysis.trendId}
                className="rounded-2xl border border-editorial-border bg-surface p-6 flex flex-col justify-between hover:border-editorial-accent/60 transition-all shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-editorial-text-2 uppercase">
                        {analysis.trendId} · {analysis.category}
                      </span>
                      <h3 className="text-2xl font-serif font-bold text-editorial-text">
                        {analysis.trendName}
                      </h3>
                    </div>
                    {analysis.stats && <DirectionChip direction={analysis.stats.direction} />}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ColorSwatch
                      trendId={analysis.trendId}
                      trendName={analysis.trendName}
                      aspectRatio="square"
                      showCaption={false}
                    />
                    <div className="flex flex-col justify-center space-y-2 text-xs">
                      <div>
                        <span className="text-editorial-text-2 block text-[10px] uppercase font-bold">
                          Normalised Slope
                        </span>
                        <span className="font-mono text-sm font-bold text-editorial-text">
                          +{analysis.stats?.normalisedSlope.toFixed(2)}%/mo
                        </span>
                      </div>
                      <div>
                        <span className="text-editorial-text-2 block text-[10px] uppercase font-bold">
                          Retail Shelf Frequency
                        </span>
                        <span className="font-mono text-sm font-bold text-editorial-text">
                          {audit ? `${audit.frequency.toFixed(1)}%` : "n/a"} ({audit?.k || 0}/{kpis.auditProductCount})
                        </span>
                      </div>
                      <div>
                        <span className="text-editorial-text-2 block text-[10px] uppercase font-bold">
                          Signal Alignment
                        </span>
                        <span className="font-medium text-editorial-accent-strong">
                          {alignment?.label || "Aligned"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-editorial-border/60 flex items-center justify-between text-xs">
                  <span className="text-editorial-text-2 italic text-[11px]">
                    Extrapolates 3 months forward
                  </span>
                  <Link
                    href={`/trend?id=${analysis.trendId}`}
                    className="font-semibold text-editorial-accent-strong hover:underline flex items-center gap-1"
                  >
                    <span>View full analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search Interest Small Multiples (Grid of 5) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-editorial-text">
            Search Interest — Last 36 Months
          </h2>
          <p className="text-xs text-editorial-text-2">
            Relative search interest in India (0–100) with direction and YoY change
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {allAnalyses.map((analysis) => {
            const audit = selectTrendAuditAnalysis(state, analysis.trendId);
            return (
              <SmallMultipleChart
                key={analysis.trendId}
                analysis={analysis}
                auditFrequency={audit?.frequency}
              />
            );
          })}
        </div>
      </section>

      {/* Retail Snapshot Bars */}
      <section>
        <RetailSnapshotBars
          trendAudits={trendAudits}
          auditDate={auditOverview.auditDate}
          totalProducts={auditOverview.totalProducts}
        />
      </section>

      {/* Editorial Footer with Verified Sources */}
      <footer className="border-t border-editorial-border pt-6 text-xs text-editorial-text-2 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p>
            <strong>TRENDWISE</strong> · Fashion Intelligence &amp; Trend Forecasting Prototype · NIFT First-Semester End-Term Research
          </p>
          <div className="flex gap-4">
            <Link href="/methodology" className="hover:underline">
              Methodology &amp; Formulas
            </Link>
            <Link href="/reports" className="hover:underline">
              Generate Reports
            </Link>
          </div>
        </div>
        <p className="text-[11px] text-editorial-muted">
          Two independent signals: Google Trends relative search interest (India, 36 months) and a 50-product manual retail audit. No merged composite score. Retail audit is never forecast.
        </p>
      </footer>
    </div>
  );
}

