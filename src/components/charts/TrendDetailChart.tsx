"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";
import { Table, Eye } from "lucide-react";
import { TrendAnalysis } from "@/types/forecast";
import { getTrendColor } from "@/lib/colors";
import { useTheme } from "@/lib/theme";

interface TrendDetailChartProps {
  analysis: TrendAnalysis;
  collectionDate?: string;
}

export function TrendDetailChart({ analysis, collectionDate }: TrendDetailChartProps) {
  const [viewTable, setViewTable] = useState(false);
  const { theme } = useTheme();
  const colorToken = getTrendColor(analysis.trendId);

  const n = analysis.series.length;
  const testCount = analysis.evaluation?.testCount || 0;
  const testStartIndex = n - testCount;
  const testStartMonth = testCount > 0 ? analysis.series[testStartIndex]?.date : null;
  const testEndMonth = testCount > 0 ? analysis.series[n - 1]?.date : null;

  // Build chart data array
  const lastObserved = analysis.series[n - 1];

  const chartData: any[] = [];

  analysis.series.forEach((pt, idx) => {
    const isTestZone = idx >= testStartIndex;
    let olsPred: number | undefined = undefined;

    if (isTestZone && analysis.evaluation) {
      const predItem = analysis.evaluation.models.ols.predictions.find(
        (p) => p.date === pt.date
      );
      if (predItem) {
        olsPred = Math.round(predItem.predicted * 10) / 10;
      }
    }

    chartData.push({
      date: pt.date,
      type: "observed",
      observed: pt.value,
      forecast: null,
      bandLower: null,
      bandUpper: null,
      olsTestPrediction: olsPred,
    });
  });

  // Seamless anchor for forecast line at last observed point
  if (analysis.forecast.length > 0 && lastObserved) {
    chartData[chartData.length - 1].forecast = lastObserved.value;
    chartData[chartData.length - 1].bandLower = lastObserved.value;
    chartData[chartData.length - 1].bandUpper = lastObserved.value;

    analysis.forecast.forEach((f) => {
      chartData.push({
        date: f.date,
        type: "forecast",
        observed: null,
        forecast: f.clipped,
        bandLower: f.lower,
        bandUpper: f.upper,
        olsTestPrediction: null,
      });
    });
  }

  let summaryText = "";
  if (analysis.stats) {
    summaryText = `Observed interest is ${analysis.stats.direction.toLowerCase()} (${analysis.stats.normalisedSlope.toFixed(1)}% of mean/mo, R² = ${analysis.stats.r2 !== null ? analysis.stats.r2.toFixed(2) : "n/a"}). Extrapolation extends 3 months with 95% prediction interval.`;
  } else {
    summaryText = "Insufficient series length for straight-line extrapolation.";
  }

  // Theme-aware chart colors
  const gridColor = theme === "dark" ? "#2C302C" : "#E5E3DB";
  const axisTextColor = theme === "dark" ? "#96958C" : "#66665E";
  const observedLineColor = theme === "dark" ? "#EDEDE8" : "#20211F";
  const bandBottomColor = theme === "dark" ? "#1E201E" : "#FFFFFF";
  const bandFillColor = theme === "dark" ? "#8E9E86" : "#73816B";

  return (
    <div className="rounded-2xl border border-editorial-border bg-surface p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-serif font-bold text-editorial-text">
            Search Trajectory &amp; 3-Month Extrapolation
          </h3>
          <p className="text-xs text-editorial-text-2 mt-0.5">
            Source: Google Trends, India, collected {collectionDate || "2026-11-08"} (monthly aggregated relative interest, 0–100)
          </p>
        </div>

        <button
          onClick={() => setViewTable(!viewTable)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-text-2 transition-colors"
        >
          {viewTable ? <Eye className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
          <span>{viewTable ? "View chart" : "View as table"}</span>
        </button>
      </div>

      {/* Summary line */}
      <p className="text-xs text-editorial-text italic bg-surface-2/40 px-3 py-2 rounded-lg border border-editorial-border/60">
        {summaryText}
      </p>

      {/* Chart vs Table */}
      {!viewTable ? (
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 25, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

              <XAxis
                dataKey="date"
                stroke={axisTextColor}
                fontSize={11}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={25}
              />
              <YAxis
                domain={[0, 100]}
                stroke={axisTextColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                ticks={[0, 25, 50, 75, 100]}
              />

              {/* Shaded Test Period Zone */}
              {testStartMonth && testEndMonth && (
                <ReferenceArea
                  x1={testStartMonth}
                  x2={testEndMonth}
                  fill={bandFillColor}
                  fillOpacity={0.12}
                  stroke={bandFillColor}
                  strokeOpacity={0.3}
                  strokeDasharray="2 2"
                  label={{
                    value: "Test Period (6 mo)",
                    position: "insideTopLeft",
                    fill: axisTextColor,
                    fontSize: 10,
                  }}
                />
              )}

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="rounded-lg bg-surface p-3 shadow-lg border border-editorial-border text-xs space-y-1">
                        <p className="font-serif font-bold text-editorial-text">{label}</p>
                        {row.observed !== null && row.observed !== undefined && (
                          <p className="text-editorial-text">
                            <span className="font-semibold">Observed Interest:</span>{" "}
                            <span className="tabular-nums font-mono">{row.observed}</span>
                          </p>
                        )}
                        {row.olsTestPrediction !== null && row.olsTestPrediction !== undefined && (
                          <p className="text-editorial-text-2">
                            <span>OLS Test Prediction:</span>{" "}
                            <span className="tabular-nums font-mono">{row.olsTestPrediction}</span>
                          </p>
                        )}
                        {row.forecast !== null && row.forecast !== undefined && (
                          <>
                            <p className="text-editorial-accent-strong font-medium">
                              <span>Forecast (Extrapolation):</span>{" "}
                              <span className="tabular-nums font-mono">{row.forecast}</span>
                            </p>
                            <p className="text-[11px] text-editorial-text-2">
                              <span>95% Prediction Interval:</span>{" "}
                              <span className="tabular-nums font-mono">
                                {row.bandLower} – {row.bandUpper}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: "15px", fontSize: "11px", color: axisTextColor }}
              />

              {/* Shaded 95% Prediction Band */}
              <Area
                type="monotone"
                dataKey="bandUpper"
                stroke="none"
                fill={bandFillColor}
                fillOpacity={theme === "dark" ? 0.25 : 0.15}
                name="95% Prediction Band"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="bandLower"
                stroke="none"
                fill={bandBottomColor}
                fillOpacity={1}
                legendType="none"
                isAnimationActive={false}
              />

              {/* Solid Line for Observed */}
              <Line
                type="monotone"
                dataKey="observed"
                stroke={observedLineColor}
                strokeWidth={2}
                dot={{ r: 2, fill: observedLineColor }}
                name="Observed Interest"
                isAnimationActive={false}
              />

              {/* Dashed Line for Forecast */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke={colorToken.line}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: colorToken.line }}
                name="Forecast Extrapolation"
                isAnimationActive={false}
              />

              {/* Dotted Line for OLS in Test Zone */}
              {analysis.evaluation && (
                <Line
                  type="monotone"
                  dataKey="olsTestPrediction"
                  stroke={theme === "dark" ? "#6B7068" : "#A4A18F"}
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                  name="OLS Out-of-sample Test"
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="overflow-x-auto border border-editorial-border rounded-lg text-xs max-h-80 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-2 sticky top-0 text-editorial-text-2 border-b border-editorial-border">
              <tr>
                <th className="p-2.5 font-semibold">Month</th>
                <th className="p-2.5 font-semibold">Type</th>
                <th className="p-2.5 font-semibold text-right">Observed</th>
                <th className="p-2.5 font-semibold text-right">Forecast (Clipped)</th>
                <th className="p-2.5 font-semibold text-right">95% Lower</th>
                <th className="p-2.5 font-semibold text-right">95% Upper</th>
                <th className="p-2.5 font-semibold text-right">OLS Test Pred</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((r, i) => (
                <tr key={i} className="border-b border-editorial-border/40 hover:bg-surface-2/30">
                  <td className="p-2.5 font-medium text-editorial-text">{r.date}</td>
                  <td className="p-2.5 capitalize text-editorial-text-2">{r.type}</td>
                  <td className="p-2.5 text-right font-mono text-editorial-text">
                    {r.observed !== null ? r.observed : "—"}
                  </td>
                  <td className="p-2.5 text-right font-mono text-editorial-accent-strong font-medium">
                    {r.forecast !== null ? r.forecast : "—"}
                  </td>
                  <td className="p-2.5 text-right font-mono text-editorial-text-2">
                    {r.bandLower !== null ? r.bandLower : "—"}
                  </td>
                  <td className="p-2.5 text-right font-mono text-editorial-text-2">
                    {r.bandUpper !== null ? r.bandUpper : "—"}
                  </td>
                  <td className="p-2.5 text-right font-mono text-editorial-text-2">
                    {r.olsTestPrediction !== null && r.olsTestPrediction !== undefined
                      ? r.olsTestPrediction
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Uncertainty Caution Note */}
      <div className="text-[11px] text-editorial-text-2 border-t border-editorial-border/60 pt-2 space-y-0.5">
        <p>
          * <strong>Prediction Interval:</strong> 95% prediction range for a single monthly value, calculated via Student&apos;s t-distribution. Search series exhibit autocorrelation, meaning real-world uncertainty is wider than the theoretical band.
        </p>
        <p className="italic">Statistical extrapolation of a straight line. Not a guarantee.</p>
      </div>
    </div>
  );
}
