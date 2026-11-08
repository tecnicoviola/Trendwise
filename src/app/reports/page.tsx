"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/data/store";
import {
  selectTrendsList,
  selectTrendAnalysis,
  selectTrendAuditAnalysis,
  selectSignalAlignment,
  selectAuditOverview,
} from "@/lib/data/selectors";
import { TrendDetailChart } from "@/components/charts/TrendDetailChart";
import { SignalAlignmentPanel } from "@/components/dashboard/SignalAlignmentPanel";
import { EvaluationCard } from "@/components/dashboard/EvaluationCard";
import { AuditEvidenceCard } from "@/components/dashboard/AuditEvidenceCard";
import { InterpretationBlock } from "@/components/dashboard/InterpretationBlock";
import { OriginBadge } from "@/components/ui/OriginBadge";
import { DirectionChip } from "@/components/ui/DirectionChip";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { Printer, Download, CheckSquare, Square } from "lucide-react";
import { generateForecastResultsCSV } from "@/lib/csv/export";

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialTrend = searchParams.get("trend") || "T001";
  const { state } = useStore();
  const trendsList = selectTrendsList(state);

  const [selectedTrendId, setSelectedTrendId] = useState(initialTrend);

  // Sections inclusion toggles
  const [includeChart, setIncludeChart] = useState(true);
  const [includeAlignment, setIncludeAlignment] = useState(true);
  const [includeEvaluation, setIncludeEvaluation] = useState(true);
  const [includeAudit, setIncludeAudit] = useState(true);
  const [includeInterpretation, setIncludeInterpretation] = useState(true);
  const [includeLimitations, setIncludeLimitations] = useState(true);

  const analysis = selectTrendAnalysis(state, selectedTrendId);
  const auditAnalysis = selectTrendAuditAnalysis(state, selectedTrendId);
  const alignment = selectSignalAlignment(state, selectedTrendId);
  const auditOverview = selectAuditOverview(state);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!analysis) return;
    const csvStr = generateForecastResultsCSV([analysis]);
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TRENDWISE_Report_${analysis.trendId}_${analysis.trendName.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!analysis) {
    return (
      <div className="p-8 text-center text-xs text-editorial-text-2">
        Please select a valid trend to generate report.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Control Strip (Hidden in print) */}
      <section className="no-print p-4 rounded-xl border border-editorial-border bg-surface flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-editorial-text">Select Trend:</label>
          <select
            value={selectedTrendId}
            onChange={(e) => setSelectedTrendId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-editorial-border bg-surface text-xs text-editorial-text font-medium focus:outline-none"
          >
            {trendsList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} — {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Section toggles */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-editorial-text">
          <span className="font-semibold text-editorial-text-2">Include:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeChart}
              onChange={() => setIncludeChart(!includeChart)}
              className="rounded"
            />
            <span>Chart</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAlignment}
              onChange={() => setIncludeAlignment(!includeAlignment)}
              className="rounded"
            />
            <span>Alignment</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeEvaluation}
              onChange={() => setIncludeEvaluation(!includeEvaluation)}
              className="rounded"
            />
            <span>Evaluation</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAudit}
              onChange={() => setIncludeAudit(!includeAudit)}
              className="rounded"
            />
            <span>Audit</span>
          </label>
        </div>

        {/* Print / Download buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-text shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-editorial-accent" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-editorial-accent-strong text-white text-xs font-medium hover:bg-opacity-95 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </section>

      {/* Publication Style Report Container */}
      <article className="bg-surface border border-editorial-border rounded-2xl p-8 md:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Masthead */}
        <header className="border-b-2 border-editorial-text pb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-editorial-text block">
                TRENDWISE
              </span>
              <span className="text-[10px] uppercase tracking-widest text-editorial-text-2 font-medium">
                Fashion Intelligence &amp; Trend Forecasting Research Report
              </span>
            </div>
            <div className="text-right">
              <OriginBadge
                origin={
                  state.consumerOrigin === "Synthetic demonstration"
                    ? "Synthetic demonstration"
                    : "Real observations"
                }
                size="sm"
              />
              <p className="text-[10px] text-editorial-text-2 mt-1">
                Date of analysis: {auditOverview.auditDate || "2026-11-08"}
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase text-editorial-text-2 tracking-wider">
                Trend Report #{analysis.trendId} · {analysis.category}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-editorial-text">
                {analysis.trendName}
              </h2>
            </div>
            {analysis.stats && (
              <div className="flex items-center gap-2">
                <DirectionChip direction={analysis.stats.direction} />
                <span className="text-xs font-mono text-editorial-text-2">
                  Slope: {analysis.stats.b1 >= 0 ? "+" : ""}
                  {analysis.stats.b1.toFixed(3)} pts/mo
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Executive Summary Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-2/40 border border-editorial-border break-inside-avoid">
          <div>
            <p className="text-[10px] uppercase font-bold text-editorial-text-2">Search Trend</p>
            <p className="text-base font-bold font-serif text-editorial-text mt-0.5">
              {analysis.stats?.direction || "n/a"}
            </p>
            <p className="text-[10px] text-editorial-text-2">
              R² = {analysis.stats?.r2 !== null ? analysis.stats?.r2?.toFixed(2) : "n/a"} ({analysis.stats?.fit} fit)
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-editorial-text-2">Quarterly YoY</p>
            <p className="text-base font-bold font-serif text-editorial-text mt-0.5">
              {analysis.yoy?.value !== null && analysis.yoy?.value !== undefined
                ? `${analysis.yoy.value >= 0 ? "+" : ""}${analysis.yoy.value.toFixed(1)}%`
                : "n/a"}
            </p>
            <p className="text-[10px] text-editorial-text-2">vs same quarter prior yr</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-editorial-text-2">Retail Frequency</p>
            <p className="text-base font-bold font-serif text-editorial-text mt-0.5">
              {auditAnalysis ? `${auditAnalysis.frequency.toFixed(1)}%` : "n/a"}
            </p>
            <p className="text-[10px] text-editorial-text-2">
              {auditAnalysis ? `${auditAnalysis.k} of ${auditAnalysis.n} sampled tops` : "n/a"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-editorial-text-2">Signal Alignment</p>
            <p className="text-base font-bold font-serif text-editorial-accent-strong mt-0.5">
              {alignment?.label || "Aligned"}
            </p>
            <p className="text-[10px] text-editorial-text-2">Search × Shelf Presence</p>
          </div>
        </section>

        {/* Chart */}
        {includeChart && (
          <section className="break-inside-avoid">
            <TrendDetailChart
              analysis={analysis}
              collectionDate={state.consumerRows[0]?.collection_date}
            />
          </section>
        )}

        {/* Alignment Panel */}
        {includeAlignment && alignment && (
          <section className="break-inside-avoid">
            <SignalAlignmentPanel alignment={alignment} />
          </section>
        )}

        {/* Out-of-sample Evaluation */}
        {includeEvaluation && (
          <section className="break-inside-avoid">
            <EvaluationCard
              evaluation={analysis.evaluation}
              rollingEvaluation={analysis.rollingEvaluation}
            />
          </section>
        )}

        {/* Retail Audit Evidence */}
        {includeAudit && (
          <section className="break-inside-avoid">
            <AuditEvidenceCard
              auditAnalysis={auditAnalysis}
              auditDate={auditOverview.auditDate}
            />
          </section>
        )}

        {/* Plain Language Interpretation */}
        {includeInterpretation && (
          <section className="break-inside-avoid">
            <InterpretationBlock
              analysis={analysis}
              auditAnalysis={auditAnalysis}
              alignment={alignment}
              auditDate={auditOverview.auditDate}
            />
          </section>
        )}

        {/* Methodology & Limitations */}
        {includeLimitations && (
          <footer className="border-t border-editorial-border pt-6 text-xs text-editorial-text-2 space-y-2 break-inside-avoid">
            <p className="font-bold text-editorial-text">Methodology &amp; Disclaimers</p>
            <p>
              1. <strong>Consumer Search:</strong> 36-month Google Trends series aggregated from weekly start dates to monthly means. OLS slope measures linear trajectory; prediction band reflects 95% single-month interval.
            </p>
            <p>
              2. <strong>Retail Audit:</strong> 50 products across three retailers sampled on {auditOverview.auditDate || "2026-11-08"}. Wilson score calculates binomial confidence. The audit is a one-day snapshot and does not predict retail performance, inventory sell-through, or sales.
            </p>
            <p className="italic pt-1">
              Antigravity Fashion Intelligence System · NIFT End-Term Research Prototype
            </p>
          </footer>
        )}
      </article>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading report...</div>}>
      <ReportsContent />
    </Suspense>
  );
}

