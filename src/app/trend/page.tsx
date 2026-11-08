"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/data/store";
import {
  selectTrendAnalysis,
  selectTrendAuditAnalysis,
  selectSignalAlignment,
  selectAuditOverview,
} from "@/lib/data/selectors";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import { DirectionChip } from "@/components/ui/DirectionChip";
import { OriginBadge } from "@/components/ui/OriginBadge";
import { TrendDetailChart } from "@/components/charts/TrendDetailChart";
import { SignalAlignmentPanel } from "@/components/dashboard/SignalAlignmentPanel";
import { EvaluationCard } from "@/components/dashboard/EvaluationCard";
import { AuditEvidenceCard } from "@/components/dashboard/AuditEvidenceCard";
import { InterpretationBlock } from "@/components/dashboard/InterpretationBlock";
import {
  Download,
  FileText,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  Info,
} from "lucide-react";
import { stringifyCSV } from "@/lib/csv/parse";

function TrendDetailContent() {
  const searchParams = useSearchParams();
  const trendId = searchParams.get("id") || "T001";
  const { state } = useStore();

  const analysis = selectTrendAnalysis(state, trendId);
  const auditAnalysis = selectTrendAuditAnalysis(state, trendId);
  const alignment = selectSignalAlignment(state, trendId);
  const auditOverview = selectAuditOverview(state);

  if (!analysis) {
    return (
      <div className="p-12 text-center rounded-2xl border border-editorial-border bg-surface space-y-4 my-8">
        <div className="w-12 h-12 rounded-full bg-editorial-error/10 text-editorial-error flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-editorial-text">Trend Not Found</h2>
        <p className="text-xs text-editorial-text-2 max-w-md mx-auto">
          No trend matching identifier &apos;{trendId}&apos; was found in the current dataset. Please check the Trend Explorer to select an available colour trend.
        </p>
        <Link
          href="/explore"
          className="inline-block px-5 py-2.5 rounded-lg bg-editorial-accent-strong text-white text-xs font-medium"
        >
          Return to Trend Explorer
        </Link>
      </div>
    );
  }

  const { stats, yoy, series, forecast, mixedSignals } = analysis;
  const n = series.length;
  const firstDate = n > 0 ? series[0].date : "—";
  const lastDate = n > 0 ? series[n - 1].date : "—";

  const handleDownloadTrendCSV = () => {
    const exportRows: any[] = [];
    series.forEach((s) => {
      exportRows.push({
        trend_id: analysis.trendId,
        trend_name: analysis.trendName,
        type: "observed",
        date: s.date,
        value: s.value,
        forecast_raw: "",
        forecast_clipped: "",
        prediction_lower: "",
        prediction_upper: "",
      });
    });

    forecast.forEach((f) => {
      exportRows.push({
        trend_id: analysis.trendId,
        trend_name: analysis.trendName,
        type: "forecast",
        date: f.date,
        value: "",
        forecast_raw: f.raw.toFixed(2),
        forecast_clipped: f.clipped.toFixed(1),
        prediction_lower: f.lower.toFixed(1),
        prediction_upper: f.upper.toFixed(1),
      });
    });

    const csvStr = stringifyCSV(exportRows);
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${analysis.trendId}_${analysis.trendName.replace(/\s+/g, "_")}_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Editorial Swatch & Title Banner */}
      <section className="space-y-4">
        {/* Full-width swatch banner */}
        <div className="w-full">
          <ColorSwatch
            trendId={analysis.trendId}
            trendName={analysis.trendName}
            aspectRatio="banner"
            showCaption={true}
          />
        </div>

        {/* Title, Category & Direction */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-editorial-border pb-6 pt-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-editorial-text-2 uppercase tracking-wider mb-1">
              <span>Trend {analysis.trendId}</span>
              <span>•</span>
              <span>{analysis.category}</span>
              <span>•</span>
              <span>India Market</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-editorial-text tracking-tight">
              {analysis.trendName}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {stats && <DirectionChip direction={stats.direction} />}
            <OriginBadge
              origin={
                state.consumerOrigin === "Synthetic demonstration"
                  ? "Synthetic demonstration"
                  : "Real observations"
              }
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadTrendCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-text shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-editorial-accent" />
                <span>Download CSV</span>
              </button>
              <Link
                href={`/reports?trend=${analysis.trendId}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-editorial-accent-strong text-white text-xs font-medium hover:bg-opacity-95 shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Report</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Chart (Observed solid, Forecast dashed, 95% band, test zone) */}
      <section>
        <TrendDetailChart
          analysis={analysis}
          collectionDate={state.consumerRows[0]?.collection_date}
        />
      </section>

      {/* Metrics Panel */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl border border-editorial-border bg-surface">
          <p className="text-[10px] uppercase font-bold text-editorial-text-2">Average Interest</p>
          <p className="text-lg font-bold font-mono text-editorial-text mt-1">
            {stats ? stats.mean.toFixed(1) : "n/a"}
          </p>
          <p className="text-[10px] text-editorial-text-2">Scale 0–100</p>
        </div>

        <div className="p-3 rounded-xl border border-editorial-border bg-surface">
          <p className="text-[10px] uppercase font-bold text-editorial-text-2">OLS Slope (b₁)</p>
          <p className="text-lg font-bold font-mono text-editorial-text mt-1">
            {stats ? `${stats.b1 >= 0 ? "+" : ""}${stats.b1.toFixed(3)}` : "n/a"}
          </p>
          <p className="text-[10px] text-editorial-text-2">pts / month</p>
        </div>

        <div className="p-3 rounded-xl border border-editorial-border bg-surface">
          <p className="text-[10px] uppercase font-bold text-editorial-text-2">Normalised Slope</p>
          <p className="text-lg font-bold font-mono text-editorial-accent-strong mt-1">
            {stats ? `${stats.normalisedSlope >= 0 ? "+" : ""}${stats.normalisedSlope.toFixed(2)}%` : "n/a"}
          </p>
          <p className="text-[10px] text-editorial-text-2">% of mean / mo</p>
        </div>

        <div className="p-3 rounded-xl border border-editorial-border bg-surface">
          <p className="text-[10px] uppercase font-bold text-editorial-text-2">Goodness of Fit (R²)</p>
          <p className="text-lg font-bold font-mono text-editorial-text mt-1">
            {stats?.r2 !== null && stats?.r2 !== undefined ? stats.r2.toFixed(3) : "n/a"}
          </p>
          <p className="text-[10px] capitalize text-editorial-text-2">{stats?.fit || "n/a"} fit</p>
        </div>

        <div className="p-3 rounded-xl border border-editorial-border bg-surface">
          <p className="text-[10px] uppercase font-bold text-editorial-text-2">Year-on-Year (YoY)</p>
          <p className="text-lg font-bold font-mono text-editorial-text mt-1">
            {yoy?.value !== null && yoy?.value !== undefined
              ? `${yoy.value >= 0 ? "+" : ""}${yoy.value.toFixed(1)}%`
              : "n/a"}
          </p>
          <p className="text-[10px] text-editorial-text-2 truncate">
            {yoy?.baseTooSmall ? "Base too small (<5)" : "Quarter vs prior yr"}
          </p>
        </div>

        <div className="p-3 rounded-xl border border-editorial-border bg-surface">
          <p className="text-[10px] uppercase font-bold text-editorial-text-2">Horizon Window</p>
          <p className="text-lg font-bold font-mono text-editorial-text mt-1">3 Months</p>
          <p className="text-[10px] text-editorial-text-2">{n} mo history</p>
        </div>
      </section>

      {/* Mixed Signals Alert if present */}
      {mixedSignals && (
        <section className="flex items-start gap-3 p-4 rounded-xl bg-[#FAF5E6] border border-[#E8D4A2] text-xs text-[#8C6314]">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#B07A1E]" />
          <div>
            <p className="font-bold text-sm">Mixed Signals Warning</p>
            <p className="mt-0.5 leading-relaxed">
              The 36-month linear slope and the recent year-on-year change contradict one another. This often happens in seasonal items where the long-term trend differs from recent seasonal movement. Treat directional extrapolation with extra caution.
            </p>
          </div>
        </section>
      )}

      {/* Signal Alignment Panel */}
      {alignment && (
        <section>
          <SignalAlignmentPanel alignment={alignment} />
        </section>
      )}

      {/* Out-of-sample Evaluation Card */}
      <section>
        <EvaluationCard
          evaluation={analysis.evaluation}
          rollingEvaluation={analysis.rollingEvaluation}
        />
      </section>

      {/* Retail Audit Evidence */}
      <section>
        <AuditEvidenceCard
          auditAnalysis={auditAnalysis}
          auditDate={auditOverview.auditDate}
        />
      </section>

      {/* Plain Language Explanation Block */}
      <section>
        <InterpretationBlock
          analysis={analysis}
          auditAnalysis={auditAnalysis}
          alignment={alignment}
          auditDate={auditOverview.auditDate}
        />
      </section>

      {/* Sources & Methodology Accordion */}
      <section className="border border-editorial-border rounded-2xl bg-surface p-6 space-y-3">
        <h3 className="text-sm font-serif font-bold text-editorial-text uppercase tracking-wider">
          Sources, Assumptions &amp; Scientific Limitations
        </h3>
        <div className="space-y-2 text-xs text-editorial-text-2 leading-relaxed">
          <p>
            • <strong>Consumer Search Signal:</strong> Sourced from Google Trends India, aggregated from weekly points to monthly means. Values are relative index numbers (0–100) within the query comparison group and do not measure absolute search volumes.
          </p>
          <p>
            • <strong>Forecasting Model:</strong> Ordinary Least Squares (OLS) linear regression fitted over complete monthly points. Prediction intervals account for statistical variance but assume independent errors; real search interest exhibits autocorrelation.
          </p>
          <p>
            • <strong>Market Audit Signal:</strong> A single-date sample of 50 women&apos;s tops from three retailer new arrival sections. It reflects current shelf presence, not consumer purchase volume or sales growth.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function TrendDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-editorial-text-2">
          Loading trend analysis...
        </div>
      }
    >
      <TrendDetailContent />
    </Suspense>
  );
}

