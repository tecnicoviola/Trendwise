"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CONFIG } from "@/lib/config";
import { calculateOLS, calculatePredictionInterval } from "@/lib/stats/ols";
import { tCritical } from "@/lib/stats/tcrit";
import { calculateMAE } from "@/lib/stats/mae";
import { calculateWilsonInterval } from "@/lib/stats/wilson";
import { CONTROLLED_VOCABULARY } from "@/lib/csv/schemas";
import { useStore } from "@/lib/data/store";
import { selectAllTrendAnalyses } from "@/lib/data/selectors";
import { ImportWizard } from "@/components/data/ImportWizard";
import {
  Download,
  UploadCloud,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  BookOpen,
  Settings,
  Database,
  FileSpreadsheet,
} from "lucide-react";

export default function MethodologyPage() {
  const [activeTab, setActiveTab] = useState<
    "how_it_works" | "formulas" | "constants" | "evaluation" | "limitations" | "dictionary" | "import"
  >("how_it_works");

  const { state, dispatch } = useStore();
  const allAnalyses = selectAllTrendAnalyses(state);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Live calculation of worked example: y = 40, 44, 43, 48, 50, 53
  const workedSeries = [40, 44, 43, 48, 50, 53];
  const workedOLS = calculateOLS(workedSeries);
  const f7 = calculatePredictionInterval(workedOLS, 7);
  const f8 = calculatePredictionInterval(workedOLS, 8);
  const f9 = calculatePredictionInterval(workedOLS, 9);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <section className="border-b border-editorial-border pb-6 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-editorial-text-2">
          Documentation &amp; Transparency
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-editorial-text">
          Methodology &amp; Data Contract
        </h1>
        <p className="text-xs md:text-sm text-editorial-text-2 max-w-2xl">
          Full algorithmic transparency, live mathematical proofs, statistical constants, data schemas, and limitations.
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 pt-4 border-t border-editorial-border/60 mt-4">
          {[
            { id: "how_it_works", label: "How It Works" },
            { id: "formulas", label: "Formulas & Worked Example" },
            { id: "constants", label: "System Constants" },
            { id: "evaluation", label: "Model Evaluation" },
            { id: "limitations", label: "Assumptions & Limitations" },
            { id: "dictionary", label: "Data Dictionary" },
            { id: "import", label: "Import & Data Management" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-editorial-accent-strong text-white shadow-xs"
                  : "bg-surface text-editorial-text-2 hover:bg-surface-2 hover:text-editorial-text border border-editorial-border/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Tab 1: How It Works */}
      {activeTab === "how_it_works" && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl border border-editorial-border bg-surface space-y-6">
            <h2 className="text-xl font-serif font-bold text-editorial-text">
              Dual-Signal Processing Pipeline
            </h2>

            {/* Pipeline CSS Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-1">
                <span className="font-mono text-[10px] text-editorial-muted">01. INGESTION</span>
                <p className="font-bold text-editorial-text">CSV Read &amp; Validate</p>
                <p className="text-[11px] text-editorial-text-2">
                  Strict Zod schemas for consumer &amp; audit data
                </p>
              </div>
              <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-1">
                <span className="font-mono text-[10px] text-editorial-muted">02. PREPARATION</span>
                <p className="font-bold text-editorial-text">Monthly Aggregation</p>
                <p className="text-[11px] text-editorial-text-2">
                  Weekly to monthly mean; drops partial month
                </p>
              </div>
              <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-1">
                <span className="font-mono text-[10px] text-editorial-muted">03. STATISTICS</span>
                <p className="font-bold text-editorial-text">OLS &amp; Wilson Score</p>
                <p className="text-[11px] text-editorial-text-2">
                  Regression slope, R², YoY &amp; binomial interval
                </p>
              </div>
              <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-1">
                <span className="font-mono text-[10px] text-editorial-muted">04. VALIDATION</span>
                <p className="font-bold text-editorial-text">Hold-Out Evaluation</p>
                <p className="text-[11px] text-editorial-text-2">
                  OLS vs persistence vs seasonal-naive baselines
                </p>
              </div>
              <div className="p-4 rounded-xl border-2 border-editorial-accent bg-[#FAF9F5] dark:bg-[#222521] space-y-1">
                <span className="font-mono text-[10px] text-editorial-accent-strong font-bold">
                  05. SYNTHESIS
                </span>
                <p className="font-bold text-editorial-text">Signal Alignment</p>
                <p className="text-[11px] text-editorial-text-2">
                  Search direction × retail presence
                </p>
              </div>
            </div>

            <div className="border-t border-editorial-border pt-6 space-y-4 text-xs md:text-sm text-editorial-text leading-relaxed">
              <h3 className="text-base font-serif font-bold text-editorial-text">
                Why Datasets Are Never Merged Into a Single Score
              </h3>
              <p>
                A core tenet of TRENDWISE is that <strong>consumer search interest</strong> and <strong>retail audit presence</strong> are fundamentally independent observations measured on different dimensions and timeframes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-editorial-text-2">
                <li>
                  <strong>Consumer Interest (Google Trends)</strong> represents a dynamic 36-month time series of relative query volume (0–100) indexed against a comparison set.
                </li>
                <li>
                  <strong>Fashion Audit</strong> represents a cross-sectional point-in-time snapshot of 50 sampled products from retailer new-arrivals sections on a single date.
                </li>
              </ul>
              <p>
                Combining them mathematically into a hypothetical single metric (such as a composite trend score &quot;T&quot;) creates an unscientific illusion of unified certainty. Instead, TRENDWISE presents them side by side in the <strong>Signal Alignment matrix</strong>, allowing researchers to evaluate where consumer curiosity aligns with or diverges from retailer stocking.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Formulas & Worked Example */}
      {activeTab === "formulas" && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl border border-editorial-border bg-surface space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-editorial-text">
                Formulas &amp; Live Worked Verification
              </h2>
              <p className="text-xs text-editorial-text-2 mt-0.5">
                Computed live in the browser using the actual mathematical engine.
              </p>
            </div>

            {/* Formula Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-2">
                <p className="font-bold text-editorial-text">1. Ordinary Least Squares (OLS)</p>
                <p className="font-mono text-[11px] bg-surface p-2 rounded border border-editorial-border/60">
                  b₁ = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²<br />
                  b₀ = ȳ − b₁·x̄<br />
                  ŷ = b₀ + b₁·x
                </p>
              </div>

              <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-2">
                <p className="font-bold text-editorial-text">2. Normalised Slope (%/mo)</p>
                <p className="font-mono text-[11px] bg-surface p-2 rounded border border-editorial-border/60">
                  Normalised slope = (b₁ / ȳ) × 100
                </p>
              </div>

              <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-2">
                <p className="font-bold text-editorial-text">3. 95% Prediction Interval</p>
                <p className="font-mono text-[11px] bg-surface p-2 rounded border border-editorial-border/60">
                  ŷ₀ ± t·s·√(1 + 1/n + (x₀ − x̄)² / Sxx)<br />
                  s = √(SSE / (n − 2)), df = n − 2
                </p>
              </div>

              <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-2">
                <p className="font-bold text-editorial-text">4. Wilson Score Interval for Proportions</p>
                <p className="font-mono text-[11px] bg-surface p-2 rounded border border-editorial-border/60">
                  centre = (p̂ + z²/2n) / (1 + z²/n)<br />
                  half = z·√(p̂(1−p̂)/n + z²/4n²) / (1 + z²/n)
                </p>
              </div>
            </div>

            {/* Live Worked Example */}
            <div className="p-5 rounded-xl border-2 border-editorial-accent-strong/40 bg-[#FAF9F5] dark:bg-[#222521] space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-editorial-accent-strong" />
                <h3 className="text-base font-serif font-bold text-editorial-text">
                  Live Worked Example: y = [40, 44, 43, 48, 50, 53] (n = 6)
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-surface border border-editorial-border">
                  <span className="text-editorial-text-2 text-[10px] uppercase font-bold block">
                    Fitted Slope (b₁)
                  </span>
                  <span className="font-mono text-sm font-bold text-editorial-text">
                    {workedOLS.b1.toFixed(3)}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-surface border border-editorial-border">
                  <span className="text-editorial-text-2 text-[10px] uppercase font-bold block">
                    Intercept (b₀)
                  </span>
                  <span className="font-mono text-sm font-bold text-editorial-text">
                    {workedOLS.b0.toFixed(3)}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-surface border border-editorial-border">
                  <span className="text-editorial-text-2 text-[10px] uppercase font-bold block">
                    Sum Sq Error (SSE)
                  </span>
                  <span className="font-mono text-sm font-bold text-editorial-text">
                    {workedOLS.SSE.toFixed(3)}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-surface border border-editorial-border">
                  <span className="text-editorial-text-2 text-[10px] uppercase font-bold block">
                    R-Squared (R²)
                  </span>
                  <span className="font-mono text-sm font-bold text-editorial-accent-strong">
                    {workedOLS.r2?.toFixed(3)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-editorial-text">
                <p className="font-semibold text-editorial-text">Extrapolations at x = 7, 8, 9:</p>
                <ul className="list-disc pl-5 space-y-1 text-editorial-text-2 font-mono">
                  <li>
                    x = 7: ŷ = {f7.predicted.toFixed(3)} (95% range: {f7.lower.toFixed(2)} to {f7.upper.toFixed(2)}, half-width ±{f7.halfWidth.toFixed(2)})
                  </li>
                  <li>
                    x = 8: ŷ = {f8.predicted.toFixed(3)} (95% range: {f8.lower.toFixed(2)} to {f8.upper.toFixed(2)})
                  </li>
                  <li>
                    x = 9: ŷ = {f9.predicted.toFixed(3)} (95% range: {f9.lower.toFixed(2)} to {f9.upper.toFixed(2)})
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: System Constants */}
      {activeTab === "constants" && (
        <section className="p-6 rounded-2xl border border-editorial-border bg-surface space-y-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-editorial-text">
              System Constants (Config Register)
            </h2>
            <p className="text-xs text-editorial-text-2 mt-0.5">
              Hardcoded constants defined in <code>src/lib/config.ts</code> governing trend boundaries and evaluation windows.
            </p>
          </div>

          <div className="overflow-x-auto border border-editorial-border rounded-xl text-xs">
            <table className="w-full text-left">
              <thead className="bg-surface-2 text-editorial-text-2 border-b border-editorial-border">
                <tr>
                  <th className="p-3 font-semibold">Constant Name</th>
                  <th className="p-3 font-semibold">Value</th>
                  <th className="p-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(CONFIG).map(([key, val]) => (
                  <tr key={key} className="border-b border-editorial-border/40 hover:bg-surface-2/30">
                    <td className="p-3 font-mono font-bold text-editorial-text">{key}</td>
                    <td className="p-3 font-mono text-editorial-accent-strong font-semibold">{String(val)}</td>
                    <td className="p-3 text-editorial-text-2 text-[11px]">
                      {key === "WINDOW_MONTHS" && "Total historical months retained for OLS model"}
                      {key === "TEST_MONTHS" && "Chronological hold-out test window for MAE evaluation"}
                      {key === "HORIZON_MONTHS" && "Number of future months extrapolated"}
                      {key === "MIN_MONTHS_REGRESSION" && "Minimum points required to fit straight-line regression"}
                      {key === "MIN_MONTHS_EVALUATION" && "Minimum history required to run train/test evaluation"}
                      {key === "DIRECTION_BAND" && "Normalised slope threshold (+0.5% for Increasing, -0.5% for Decreasing)"}
                      {key === "YOY_BAND" && "Year-on-year threshold (+5% up, -5% down)"}
                      {key === "YOY_MIN_BASE" && "Minimum historical mean required to calculate YoY percentage"}
                      {key === "R2_WEAK" && "Boundary below which fit is weak"}
                      {key === "R2_STRONG" && "Boundary above which fit is strong"}
                      {key === "VISIBLE_MIN_FREQ" && "Minimum audit frequency percentage required for retail visibility"}
                      {key === "VISIBLE_MIN_RETAILERS" && "Minimum number of retailers with presence for visibility"}
                      {key === "WEEKS_PER_MONTH_MIN" && "Minimum weekly observations required for a complete month"}
                      {key === "CONFIDENCE" && "Statistical confidence level for Student's t and Wilson score"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 4: Evaluation Results */}
      {activeTab === "evaluation" && (
        <section className="p-6 rounded-2xl border border-editorial-border bg-surface space-y-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-editorial-text">
              Model Evaluation Across Tracked Trends
            </h2>
            <p className="text-xs text-editorial-text-2 mt-0.5">
              Out-of-sample holdout test (last 6 months) comparing OLS regression with persistence and seasonal-naive baselines.
            </p>
          </div>

          <div className="overflow-x-auto border border-editorial-border rounded-xl text-xs">
            <table className="w-full text-left">
              <thead className="bg-surface-2 text-editorial-text-2 border-b border-editorial-border">
                <tr>
                  <th className="p-3 font-semibold">Trend</th>
                  <th className="p-3 font-semibold text-right">OLS MAE</th>
                  <th className="p-3 font-semibold text-right">Persistence MAE</th>
                  <th className="p-3 font-semibold text-right">Seasonal-Naive MAE</th>
                  <th className="p-3 font-semibold text-center">Best Model</th>
                </tr>
              </thead>
              <tbody>
                {allAnalyses.map((a) => {
                  const ev = a.evaluation;
                  return (
                    <tr key={a.trendId} className="border-b border-editorial-border/40 hover:bg-surface-2/30">
                      <td className="p-3 font-medium text-editorial-text">
                        <Link href={`/trend?id=${a.trendId}`} className="hover:underline">
                          {a.trendName}
                        </Link>
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums">
                        {ev ? `${ev.models.ols.mae.toFixed(2)} pts` : "—"}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums">
                        {ev ? `${ev.models.persistence.mae.toFixed(2)} pts` : "—"}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums">
                        {ev ? `${ev.models.seasonal_naive.mae.toFixed(2)} pts` : "—"}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-surface-2 font-semibold text-[11px] text-editorial-text">
                          {ev ? ev.bestModelName : "Insufficient history"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 5: Limitations */}
      {activeTab === "limitations" && (
        <section className="p-6 rounded-2xl border border-editorial-border bg-surface space-y-4 text-xs md:text-sm text-editorial-text leading-relaxed">
          <h2 className="text-xl font-serif font-bold text-editorial-text">
            Assumptions &amp; Methodological Limitations
          </h2>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-surface-2/60 border border-editorial-border space-y-1">
              <p className="font-bold text-editorial-text">1. Google Trends Relative Normalisation</p>
              <p className="text-editorial-text-2 text-xs">
                Google Trends reports indexed relative search interest (0–100) scaled to the peak term within the specified comparison group, time window and region. A value of 50 does not represent a specific quantity of searches, nor does it equate across separate download queries.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-2/60 border border-editorial-border space-y-1">
              <p className="font-bold text-editorial-text">2. Linear Extrapolation vs Seasonality</p>
              <p className="text-editorial-text-2 text-xs">
                OLS straight-line regression captures secular momentum but inherently ignores annual seasonal cycles. Highly seasonal trends (such as burgundy in autumn/winter) will frequently be outperformed by seasonal-naive baselines.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-2/60 border border-editorial-border space-y-1">
              <p className="font-bold text-editorial-text">3. Prediction Intervals &amp; Autocorrelation</p>
              <p className="text-editorial-text-2 text-xs">
                The 95% prediction interval band uses Student&apos;s t-distribution assuming independent and identically distributed errors. Time-series search queries exhibit autocorrelation; consequently, true empirical uncertainty is wider than the theoretical band.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-2/60 border border-editorial-border space-y-1">
              <p className="font-bold text-editorial-text">4. Fashion Audit Snapshot Constraints</p>
              <p className="text-editorial-text-2 text-xs">
                The retail audit is limited to 50 items sampled on a single date across women&apos;s tops from three retailers. Shelf presence does not measure consumer sell-through, sales velocity, profitability, or restocking intent.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-2/60 border border-editorial-border space-y-1">
              <p className="font-bold text-editorial-text">5. Lexical &amp; Perceptual Ambiguity</p>
              <p className="text-editorial-text-2 text-xs">
                Colour naming by retailers is subjective and unstandardised. Searches for &quot;butter yellow&quot; capture both intentional apparel interest and unrelated culinary queries.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tab 6: Data Dictionary */}
      {activeTab === "dictionary" && (
        <section className="p-6 rounded-2xl border border-editorial-border bg-surface space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-editorial-text">Data Dictionary</h2>
            <p className="text-xs text-editorial-text-2 mt-0.5">
              Strict column contracts and controlled vocabularies.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-serif font-bold text-editorial-text uppercase tracking-wider">
              1. Consumer Interest Dataset (`consumer_interest.csv`)
            </h3>
            <div className="overflow-x-auto border border-editorial-border rounded-xl text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-2 text-editorial-text-2 border-b border-editorial-border">
                  <tr>
                    <th className="p-2.5 font-semibold">Column</th>
                    <th className="p-2.5 font-semibold">Format</th>
                    <th className="p-2.5 font-semibold">Requirement</th>
                    <th className="p-2.5 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["date", "YYYY-MM", "Required", "Monthly aggregation start month"],
                    ["trend_id", "String (e.g. T001)", "Required", "Unique trend identifier"],
                    ["trend_name", "String", "Required", "Editorial trend name"],
                    ["category", "String (Colour)", "Required", "Trend classification domain"],
                    ["region", "String (India)", "Required", "Geographic market region"],
                    ["search_interest", "Number (0–100)", "Required", "Aggregated relative search index"],
                    ["source", "String", "Required", "Source provenance name"],
                    ["source_url", "URL (http/https)", "Required", "Link to data origin"],
                    ["collection_date", "YYYY-MM-DD", "Required", "Date data was captured"],
                    ["query_group", "String", "Required", "Group ID for comparative series"],
                    ["time_range", "String", "Required", "Historical query span (e.g. 2023-11 to 2026-10)"],
                  ].map(([col, fmt, req, desc]) => (
                    <tr key={col} className="border-b border-editorial-border/30">
                      <td className="p-2.5 font-mono font-bold text-editorial-text">{col}</td>
                      <td className="p-2.5 font-mono text-editorial-text-2">{fmt}</td>
                      <td className="p-2.5 text-editorial-accent-strong font-medium">{req}</td>
                      <td className="p-2.5 text-editorial-text-2">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-sm font-serif font-bold text-editorial-text uppercase tracking-wider pt-4">
              2. Fashion Audit Dataset (`fashion_audit.csv`)
            </h3>
            <div className="overflow-x-auto border border-editorial-border rounded-xl text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-2 text-editorial-text-2 border-b border-editorial-border">
                  <tr>
                    <th className="p-2.5 font-semibold">Column</th>
                    <th className="p-2.5 font-semibold">Requirement</th>
                    <th className="p-2.5 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["audit_id", "Required, Unique", "Unique sample identifier"],
                    ["retailer", "Required", "Online fashion retailer name"],
                    ["product", "Required", "Listing product title"],
                    ["product_url", "Required, Unique", "Direct web listing link"],
                    ["audit_date", "Required, YYYY-MM-DD", "One date per file snapshot"],
                    ["product_category", "Required", "Women's Tops"],
                    ["colour", "Required", "Controlled vocabulary (e.g. Butter Yellow, Burgundy)"],
                    ["fabric", "Required", "Controlled vocabulary (Cotton, Linen, Satin, etc.)"],
                    ["print", "Required", "Controlled vocabulary (Solid, Floral, Stripes, etc.)"],
                    ["silhouette", "Required", "Controlled vocabulary (Fitted, Relaxed, etc.)"],
                    ["listing_source", "Required", "New Arrivals section"],
                  ].map(([col, req, desc]) => (
                    <tr key={col} className="border-b border-editorial-border/30">
                      <td className="p-2.5 font-mono font-bold text-editorial-text">{col}</td>
                      <td className="p-2.5 font-medium text-editorial-accent-strong">{req}</td>
                      <td className="p-2.5 text-editorial-text-2">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tab 7: Import & Data Management */}
      {activeTab === "import" && (
        <section className="p-6 rounded-2xl border border-editorial-border bg-surface space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-editorial-text">
                Dataset Management &amp; Templates
              </h2>
              <p className="text-xs text-editorial-text-2 mt-0.5">
                Download verified templates or upload custom research CSV files.
              </p>
            </div>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-editorial-accent-strong text-white text-xs font-medium hover:bg-opacity-95 shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Launch Import Wizard</span>
            </button>
          </div>

          {/* Download CSV Templates */}
          <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/30 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-editorial-text">
              Download Standard CSV Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <a
                href="/templates/consumer_interest_template.csv"
                download="consumer_interest_template.csv"
                className="flex items-center gap-3 p-3 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-text transition-colors"
              >
                <Download className="w-4 h-4 text-editorial-accent" />
                <div>
                  <p className="font-semibold">Consumer Interest Template</p>
                  <p className="text-[10px] text-editorial-text-2">Long-format monthly structure</p>
                </div>
              </a>

              <a
                href="/templates/fashion_audit_template.csv"
                download="fashion_audit_template.csv"
                className="flex items-center gap-3 p-3 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-text transition-colors"
              >
                <Download className="w-4 h-4 text-editorial-accent" />
                <div>
                  <p className="font-semibold">Fashion Audit Template</p>
                  <p className="text-[10px] text-editorial-text-2">50-product snapshot schema</p>
                </div>
              </a>

              <a
                href="/templates/trend_dictionary_template.csv"
                download="trend_dictionary_template.csv"
                className="flex items-center gap-3 p-3 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-text transition-colors"
              >
                <Download className="w-4 h-4 text-editorial-accent" />
                <div>
                  <p className="font-semibold">Trend Dictionary Template</p>
                  <p className="text-[10px] text-editorial-text-2">Custom attribute mapping</p>
                </div>
              </a>
            </div>
          </div>

          {/* Session Data Controls */}
          <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/30 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-editorial-text">
              Data Persistence &amp; Reset Controls
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-editorial-text font-medium">
                <input
                  type="checkbox"
                  checked={state.rememberInBrowser}
                  onChange={(e) =>
                    dispatch({ type: "SET_REMEMBER_BROWSER", payload: e.target.checked })
                  }
                  className="rounded"
                />
                <span>Remember my data in this browser (saves to localStorage)</span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => dispatch({ type: "LOAD_DEMO_DATA" })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-text"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-editorial-accent" />
                  <span>Reload Demo Data</span>
                </button>
                <button
                  onClick={() => dispatch({ type: "CLEAR_DATA" })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-error"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Global Import Wizard Modal */}
      <ImportWizard
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}

