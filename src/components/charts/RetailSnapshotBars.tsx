"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Table, Eye } from "lucide-react";
import { TrendAuditAnalysis } from "@/lib/audit/frequencies";
import { getTrendColor } from "@/lib/colors";

interface RetailSnapshotBarsProps {
  trendAudits: TrendAuditAnalysis[];
  auditDate: string;
  totalProducts: number;
}

export function RetailSnapshotBars({
  trendAudits,
  auditDate,
  totalProducts,
}: RetailSnapshotBarsProps) {
  const [viewTable, setViewTable] = useState(false);

  // Sort by frequency descending
  const sorted = [...trendAudits].sort((a, b) => b.frequency - a.frequency);

  const topTrend = sorted.length > 0 ? sorted[0] : null;

  return (
    <div className="rounded-2xl border border-editorial-border bg-surface p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-serif font-bold text-editorial-text">
            Retail Snapshot — Colour Presence
          </h3>
          <p className="text-xs text-editorial-text-2 mt-0.5">
            Source: manual retail audit, {auditDate || "2026-11-08"}, n = {totalProducts} (one-day snapshot)
          </p>
        </div>

        <button
          onClick={() => setViewTable(!viewTable)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-text-2"
        >
          {viewTable ? <Eye className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
          <span>{viewTable ? "View chart" : "View as table"}</span>
        </button>
      </div>

      {/* One line summary */}
      <p className="text-xs text-editorial-text italic bg-surface-2/40 px-3 py-1.5 rounded-md border border-editorial-border/60">
        {topTrend
          ? `${topTrend.trendName} had the highest shelf representation (${topTrend.k} of ${totalProducts} products, ${topTrend.frequency.toFixed(1)}%) across ${topTrend.retailerCoverageCount} of ${topTrend.totalRetailers} retailers.`
          : "No audit observations loaded."}
      </p>

      {/* Chart vs Table */}
      {!viewTable ? (
        <div className="space-y-3 pt-2">
          {sorted.map((item) => {
            const colorToken = getTrendColor(item.trendId);
            return (
              <div key={item.trendId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: colorToken.swatch }}
                    />
                    <Link
                      href={`/trend?id=${item.trendId}`}
                      className="font-medium text-editorial-text hover:text-editorial-accent-strong hover:underline"
                    >
                      {item.trendName}
                    </Link>
                  </div>
                  <div className="text-editorial-text-2 tabular-nums">
                    <strong className="text-editorial-text">{item.frequency.toFixed(1)}%</strong> ({item.k}/{totalProducts} items)
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-3 w-full rounded-full bg-surface-2 overflow-hidden flex">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, item.frequency * 3)}%`, // visual scaling for readability up to ~33%
                      backgroundColor: colorToken.line,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto border border-editorial-border rounded-lg text-xs">
          <table className="w-full text-left">
            <thead className="bg-surface-2 text-editorial-text-2 border-b border-editorial-border">
              <tr>
                <th className="p-2.5 font-semibold">Trend Colour</th>
                <th className="p-2.5 font-semibold text-right">Count (k)</th>
                <th className="p-2.5 font-semibold text-right">Sample (n)</th>
                <th className="p-2.5 font-semibold text-right">Frequency</th>
                <th className="p-2.5 font-semibold text-right">Coverage</th>
                <th className="p-2.5 font-semibold text-right">95% Range</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.trendId} className="border-b border-editorial-border/40 hover:bg-surface-2/30">
                  <td className="p-2.5 font-medium text-editorial-text">
                    <Link href={`/trend?id=${item.trendId}`} className="hover:underline">
                      {item.trendName}
                    </Link>
                  </td>
                  <td className="p-2.5 text-right tabular-nums">{item.k}</td>
                  <td className="p-2.5 text-right tabular-nums">{totalProducts}</td>
                  <td className="p-2.5 text-right tabular-nums font-semibold text-editorial-text">
                    {item.frequency.toFixed(1)}%
                  </td>
                  <td className="p-2.5 text-right tabular-nums">
                    {item.retailerCoverageCount}/{item.totalRetailers}
                  </td>
                  <td className="p-2.5 text-right tabular-nums text-editorial-text-2">
                    {item.wilson.lowerPercent.toFixed(1)}%–{item.wilson.upperPercent.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] text-editorial-text-2 pt-1">
        * The audit is a one-day snapshot of new arrivals and does not show demand, growth or sales.
      </p>
    </div>
  );
}

