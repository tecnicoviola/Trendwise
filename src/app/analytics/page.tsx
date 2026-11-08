"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/data/store";
import {
  selectAllTrendAnalyses,
  selectAuditOverview,
  selectTrendsList,
} from "@/lib/data/selectors";
import { getTrendColor } from "@/lib/colors";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Download, SlidersHorizontal, Table, AlertCircle, Info } from "lucide-react";
import { stringifyCSV } from "@/lib/csv/parse";
import { useTheme } from "@/lib/theme";

type AttributeTab = "colour" | "fabric" | "print" | "silhouette";

export default function AnalyticsPage() {
  const { state } = useStore();
  const { theme } = useTheme();
  const allAnalyses = selectAllTrendAnalyses(state);
  const auditOverview = selectAuditOverview(state);
  const trendsList = selectTrendsList(state);

  // Filters
  const [selectedTrends, setSelectedTrends] = useState<string[]>(
    trendsList.map((t) => t.id).slice(0, 5)
  );
  const [selectedRetailer, setSelectedRetailer] = useState<string>("All");
  const [activeAttributeTab, setActiveAttributeTab] = useState<AttributeTab>("colour");

  // Check query_group consistency across consumer series
  const queryGroups = useMemo(() => {
    const qgSet = new Set<string>();
    state.consumerRows.forEach((r) => {
      if (r.query_group) qgSet.add(r.query_group);
    });
    return Array.from(qgSet);
  }, [state.consumerRows]);

  const canCompare = queryGroups.length <= 1;

  // Filtered audit products based on retailer filter
  const filteredAuditProducts = useMemo(() => {
    if (selectedRetailer === "All") return state.auditRows;
    return state.auditRows.filter((r) => r.retailer === selectedRetailer);
  }, [state.auditRows, selectedRetailer]);

  // Aggregate attribute distribution for filtered audit products
  const attributeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAuditProducts.forEach((p) => {
      let val = p[activeAttributeTab] || "Other";
      counts[val] = (counts[val] || 0) + 1;
    });

    const total = filteredAuditProducts.length;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredAuditProducts, activeAttributeTab]);

  // Multi-line comparison chart data
  const comparisonData = useMemo(() => {
    const dateMap: Record<string, any> = {};

    allAnalyses.forEach((a) => {
      if (!selectedTrends.includes(a.trendId)) return;
      a.series.forEach((pt) => {
        if (!dateMap[pt.date]) {
          dateMap[pt.date] = { date: pt.date };
        }
        dateMap[pt.date][a.trendName] = pt.value;
      });
    });

    return Object.values(dateMap).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );
  }, [allAnalyses, selectedTrends]);

  const toggleTrend = (id: string) => {
    if (selectedTrends.includes(id)) {
      if (selectedTrends.length > 1) {
        setSelectedTrends(selectedTrends.filter((t) => t !== id));
      }
    } else {
      if (selectedTrends.length < 5) {
        setSelectedTrends([...selectedTrends, id]);
      }
    }
  };

  const handleDownloadFilteredData = () => {
    const csvStr = stringifyCSV(comparisonData);
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trends_comparison_filtered.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <section className="border-b border-editorial-border pb-6 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-editorial-text-2">
          Cross-Series Analysis
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-editorial-text">
          Market &amp; Search Analytics
        </h1>
        <p className="text-xs md:text-sm text-editorial-text-2 max-w-2xl">
          Side-by-side comparison of Google Trends search interest and retail audit distributions.
        </p>
      </section>

      {/* Control Filters */}
      <section className="p-4 rounded-xl border border-editorial-border bg-surface space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Trend Toggles */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase font-bold text-editorial-text-2 block">
              Active Trends (Select up to 5)
            </span>
            <div className="flex flex-wrap gap-2">
              {trendsList.map((t) => {
                const isSelected = selectedTrends.includes(t.id);
                const colorToken = getTrendColor(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTrend(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-surface border-editorial-accent-strong text-editorial-text shadow-xs ring-1 ring-editorial-accent-strong"
                        : "bg-surface-2 border-editorial-border text-editorial-text-2 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colorToken.swatch }}
                    />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Retailer Filter (Audit only) */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase font-bold text-editorial-text-2 block">
              Retailer Scope (Audit Only)
            </span>
            <select
              value={selectedRetailer}
              onChange={(e) => setSelectedRetailer(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-editorial-border bg-surface text-xs text-editorial-text focus:outline-none"
            >
              <option value="All">All Retailers ({auditOverview.totalProducts} items)</option>
              {auditOverview.retailers.map((r) => (
                <option key={r} value={r}>
                  {r} (n = {auditOverview.retailerSampleSizes[r] || 0})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Comparison Chart */}
      <section className="rounded-2xl border border-editorial-border bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-serif font-bold text-editorial-text">
              Multi-Trend Search Comparison (36 Months)
            </h3>
            <p className="text-xs text-editorial-text-2 mt-0.5">
              Source: Google Trends, India. Indexed relative interest (0–100) within the same query group.
            </p>
          </div>

          <button
            onClick={handleDownloadFilteredData}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-editorial-border bg-surface hover:bg-surface-2 text-xs font-medium text-editorial-text shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-editorial-accent" />
            <span>Download CSV</span>
          </button>
        </div>

        {canCompare ? (
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={comparisonData}
                margin={{ top: 15, right: 25, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#2C302C" : "#E5E3DB"} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={theme === "dark" ? "#96958C" : "#66665E"}
                  fontSize={11}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={25}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke={theme === "dark" ? "#96958C" : "#66665E"}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg bg-surface p-3 shadow-lg border border-editorial-border text-xs space-y-1">
                          <p className="font-serif font-bold text-editorial-text">{label}</p>
                          {payload.map((entry: any) => (
                            <div
                              key={entry.name}
                              className="flex items-center justify-between gap-4"
                            >
                              <span style={{ color: entry.color }} className="font-medium">
                                {entry.name}:
                              </span>
                              <span className="font-mono tabular-nums font-bold">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: "15px", fontSize: "11px" }}
                />

                {allAnalyses
                  .filter((a) => selectedTrends.includes(a.trendId))
                  .map((a) => {
                    const colorToken = getTrendColor(a.trendId);
                    return (
                      <Line
                        key={a.trendId}
                        type="monotone"
                        dataKey={a.trendName}
                        stroke={colorToken.line}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    );
                  })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#FAF5E6] border border-[#E8D4A2] text-[#8C6314] dark:bg-[#2E291C] dark:border-[#4A3E25] dark:text-[#E5C37A] rounded-xl text-xs space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto text-[#B07A1E] dark:text-[#E5C37A]" />
            <p className="font-bold text-sm">Direct Comparison Disabled</p>
            <p className="max-w-md mx-auto">
              The loaded series come from different query groups ({queryGroups.join(", ")}). Google Trends normalises each comparison group independently, so numbers from separate exports cannot be plotted on the same 0–100 scale without misrepresenting relative volumes.
            </p>
          </div>
        )}
      </section>

      {/* Retail Audit Attribute Distribution */}
      <section className="rounded-2xl border border-editorial-border bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-editorial-text">
              Fashion Audit Breakdown ({selectedRetailer === "All" ? "All Retailers" : selectedRetailer})
            </h3>
            <p className="text-xs text-editorial-text-2 mt-0.5">
              Source: manual retail audit snapshot, {auditOverview.auditDate || "2026-11-08"}, n = {filteredAuditProducts.length} items
            </p>
          </div>

          {/* Attribute Tabs */}
          <div className="flex bg-surface-2 p-1 rounded-lg border border-editorial-border text-xs">
            {(["colour", "fabric", "print", "silhouette"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveAttributeTab(tab)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-all ${
                  activeAttributeTab === tab
                    ? "bg-surface text-editorial-text shadow-xs"
                    : "text-editorial-text-2 hover:text-editorial-text"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Attribute Distribution Bars */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={attributeData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E3DB" />
              <XAxis type="number" stroke="#66665E" fontSize={11} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#20211F"
                fontSize={11}
                tickLine={false}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded bg-surface p-2 shadow-md border border-editorial-border text-xs">
                        <p className="font-bold text-editorial-text">{item.name}</p>
                        <p className="text-editorial-text-2">
                          Count: <strong className="text-editorial-text">{item.count}</strong> (
                          {item.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#73816B" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-editorial-text-2 italic border-t border-editorial-border/60 pt-2">
          * Note: Version 1 focuses exclusively on colour trends. Fabric, print and silhouette distributions are collected as contextual styling attributes of the audited tops.
        </p>
      </section>
    </div>
  );
}

