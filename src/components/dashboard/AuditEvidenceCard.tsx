import React from "react";
import { TrendAuditAnalysis } from "@/lib/audit/frequencies";
import { ExternalLink, ClipboardList, Store } from "lucide-react";

interface AuditEvidenceCardProps {
  auditAnalysis: TrendAuditAnalysis | null;
  auditDate?: string;
}

export function AuditEvidenceCard({ auditAnalysis, auditDate }: AuditEvidenceCardProps) {
  if (!auditAnalysis || auditAnalysis.n === 0) {
    return (
      <div className="rounded-2xl border border-editorial-border bg-surface p-6">
        <h3 className="text-base font-serif font-bold text-editorial-text mb-2">
          Retail Audit Snapshot (Field Evidence)
        </h3>
        <p className="text-xs text-editorial-text-2">
          No audit snapshot data is currently loaded for this colour trend.
        </p>
      </div>
    );
  }

  const {
    k,
    n,
    frequency,
    wilson,
    retailerCoverageCount,
    totalRetailers,
    retailerStats,
    fabricDistribution,
    printDistribution,
    silhouetteDistribution,
    products,
  } = auditAnalysis;

  return (
    <div className="rounded-2xl border border-editorial-border bg-surface p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-editorial-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-editorial-accent-strong" />
            <h3 className="text-lg font-serif font-bold text-editorial-text">
              Retail Audit Evidence (Field Notes)
            </h3>
          </div>
          <p className="text-xs text-editorial-text-2 mt-0.5">
            Single-day snapshot taken on {auditDate || "2026-11-08"} across {totalRetailers} online stores (Women&apos;s Tops, New Arrivals)
          </p>
        </div>

        <div className="px-3 py-1 rounded-full bg-surface-2 border border-editorial-border text-xs font-semibold text-editorial-text">
          Observed in {k} of {n} products ({frequency.toFixed(1)}%)
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl border border-editorial-border bg-surface-2/40">
          <p className="text-[10px] uppercase font-bold tracking-wider text-editorial-text-2">
            Observed Count
          </p>
          <p className="text-xl font-bold font-mono text-editorial-text mt-1">{k} items</p>
          <p className="text-[10px] text-editorial-text-2">Out of {n} total tops</p>
        </div>

        <div className="p-3.5 rounded-xl border border-editorial-border bg-surface-2/40">
          <p className="text-[10px] uppercase font-bold tracking-wider text-editorial-text-2">
            Sample Frequency
          </p>
          <p className="text-xl font-bold font-mono text-editorial-accent-strong mt-1">
            {frequency.toFixed(1)}%
          </p>
          <p className="text-[10px] text-editorial-text-2">Proportion of snapshot</p>
        </div>

        <div className="p-3.5 rounded-xl border border-editorial-border bg-surface-2/40">
          <p className="text-[10px] uppercase font-bold tracking-wider text-editorial-text-2">
            95% Wilson Range
          </p>
          <p className="text-xl font-bold font-mono text-editorial-text mt-1">
            {wilson.lowerPercent.toFixed(1)}%–{wilson.upperPercent.toFixed(1)}%
          </p>
          <p className="text-[10px] text-editorial-text-2">Binomial uncertainty</p>
        </div>

        <div className="p-3.5 rounded-xl border border-editorial-border bg-surface-2/40">
          <p className="text-[10px] uppercase font-bold tracking-wider text-editorial-text-2">
            Retailer Coverage
          </p>
          <p className="text-xl font-bold font-mono text-editorial-text mt-1">
            {retailerCoverageCount} / {totalRetailers}
          </p>
          <p className="text-[10px] text-editorial-text-2">Stores stocking colour</p>
        </div>
      </div>

      {/* Per-Retailer Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-editorial-text flex items-center gap-1.5">
          <Store className="w-4 h-4 text-editorial-accent" />
          <span>Retailer Shelf Distribution</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {retailerStats.map((r) => (
            <div
              key={r.retailer}
              className="p-3 rounded-xl border border-editorial-border bg-surface-2/30 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-editorial-text truncate">{r.retailer}</span>
                <span className="font-mono text-editorial-accent-strong">
                  {r.observedCount}/{r.totalSampled}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full bg-editorial-accent rounded-full transition-all duration-300"
                  style={{
                    width: `${r.totalSampled > 0 ? (r.observedCount / r.totalSampled) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-editorial-text-2">
                <span>{r.frequency.toFixed(1)}% of store sample</span>
                <span>n = {r.totalSampled}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attribute Distributions (Fabric, Print, Silhouette) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-editorial-border/60 pt-4">
        {/* Fabric */}
        <div className="space-y-2">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-editorial-text-2">
            Fabric Mix ({k} items)
          </h5>
          <div className="space-y-1 text-xs">
            {Object.entries(fabricDistribution).length > 0 ? (
              Object.entries(fabricDistribution).map(([name, count]) => (
                <div key={name} className="flex justify-between py-0.5 border-b border-editorial-border/20">
                  <span className="text-editorial-text">{name}</span>
                  <span className="font-mono text-editorial-text-2">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-editorial-muted text-[11px]">None observed</p>
            )}
          </div>
        </div>

        {/* Print */}
        <div className="space-y-2">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-editorial-text-2">
            Print Pattern ({k} items)
          </h5>
          <div className="space-y-1 text-xs">
            {Object.entries(printDistribution).length > 0 ? (
              Object.entries(printDistribution).map(([name, count]) => (
                <div key={name} className="flex justify-between py-0.5 border-b border-editorial-border/20">
                  <span className="text-editorial-text">{name}</span>
                  <span className="font-mono text-editorial-text-2">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-editorial-muted text-[11px]">None observed</p>
            )}
          </div>
        </div>

        {/* Silhouette */}
        <div className="space-y-2">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-editorial-text-2">
            Silhouette Cut ({k} items)
          </h5>
          <div className="space-y-1 text-xs">
            {Object.entries(silhouetteDistribution).length > 0 ? (
              Object.entries(silhouetteDistribution).map(([name, count]) => (
                <div key={name} className="flex justify-between py-0.5 border-b border-editorial-border/20">
                  <span className="text-editorial-text">{name}</span>
                  <span className="font-mono text-editorial-text-2">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-editorial-muted text-[11px]">None observed</p>
            )}
          </div>
        </div>
      </div>

      {/* Product Evidence Links */}
      {products.length > 0 && (
        <div className="border-t border-editorial-border/60 pt-4 space-y-2">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-editorial-text-2">
            Audited Product URL Register ({products.length})
          </h5>
          <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs pr-2">
            {products.map((p) => (
              <div
                key={p.audit_id}
                className="flex items-center justify-between p-2 rounded bg-surface-2/40 border border-editorial-border/40 hover:bg-surface-2/70"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="font-mono text-[10px] text-editorial-muted">{p.audit_id}</span>
                  <span className="font-medium text-editorial-text truncate">{p.product}</span>
                  <span className="text-[10px] text-editorial-text-2">({p.retailer})</span>
                </div>
                <a
                  href={p.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-editorial-accent-strong hover:underline shrink-0 flex items-center gap-1 text-[11px] font-medium"
                >
                  <span>Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footnote on snapshot methodology */}
      <p className="text-[11px] text-editorial-text-2 italic border-t border-editorial-border/40 pt-2">
        Note: The fashion audit is a single-date snapshot of 50 sampled products. It does not measure consumer purchases, sales velocity, or inventory re-orders.
      </p>
    </div>
  );
}

