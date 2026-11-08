"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TrendAnalysis } from "@/types/forecast";
import { getTrendColor } from "@/lib/colors";
import { DirectionChip } from "../ui/DirectionChip";
import { Table, Eye } from "lucide-react";

interface SmallMultipleChartProps {
  analysis: TrendAnalysis;
  auditFrequency?: number;
}

export function SmallMultipleChart({ analysis, auditFrequency }: SmallMultipleChartProps) {
  const [viewTable, setViewTable] = useState(false);
  const colorToken = getTrendColor(analysis.trendId);

  const data = analysis.series.map((pt) => ({
    date: pt.date,
    value: pt.value,
  }));

  const yoyText =
    analysis.yoy && analysis.yoy.value !== null
      ? `${analysis.yoy.value >= 0 ? "+" : ""}${analysis.yoy.value.toFixed(1)}% YoY`
      : analysis.yoy?.baseTooSmall
      ? "YoY n/a (base < 5)"
      : "YoY n/a";

  return (
    <div className="flex flex-col rounded-xl border border-editorial-border bg-surface p-4 transition-all hover:border-editorial-accent/60">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: colorToken.swatch }}
            />
            <Link
              href={`/trend?id=${analysis.trendId}`}
              className="font-serif text-base font-bold text-editorial-text hover:text-editorial-accent-strong transition-colors"
            >
              {analysis.trendName}
            </Link>
          </div>
          <span className="text-[11px] text-editorial-text-2">{yoyText}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {analysis.stats && (
            <DirectionChip direction={analysis.stats.direction} showIcon={false} />
          )}
          <button
            onClick={() => setViewTable(!viewTable)}
            className="p-1 rounded text-editorial-text-2 hover:bg-surface-2 transition-colors"
            title={viewTable ? "View chart" : "View table"}
          >
            {viewTable ? <Eye className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Chart or Table */}
      {!viewTable ? (
        <div className="h-28 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded bg-surface p-2 shadow-md border border-editorial-border text-[11px]">
                        <p className="font-semibold text-editorial-text">{d.date}</p>
                        <p className="text-editorial-text-2">
                          Interest: <span className="font-medium text-editorial-text">{d.value}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
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
      ) : (
        <div className="h-28 overflow-y-auto mt-2 border border-editorial-border/60 rounded text-[10px]">
          <table className="w-full text-left">
            <thead className="bg-surface-2 sticky top-0 text-editorial-text-2">
              <tr>
                <th className="p-1 font-medium">Month</th>
                <th className="p-1 font-medium text-right">Interest</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className="border-b border-editorial-border/30">
                  <td className="p-1 text-editorial-text-2">{d.date}</td>
                  <td className="p-1 text-right font-mono text-editorial-text">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-3 pt-2 border-t border-editorial-border/40 flex items-center justify-between text-[11px] text-editorial-text-2">
        <span>
          Audit:{" "}
          <strong className="text-editorial-text">
            {auditFrequency !== undefined ? `${auditFrequency.toFixed(1)}%` : "n/a"}
          </strong>
        </span>
        <Link
          href={`/trend?id=${analysis.trendId}`}
          className="text-editorial-accent-strong hover:underline font-medium"
        >
          Details →
        </Link>
      </div>
    </div>
  );
}

