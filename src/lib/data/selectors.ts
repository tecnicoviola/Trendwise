import { AppState } from "./store";
import { MonthlyPoint, TrendAnalysis } from "@/types/forecast";
import { SignalAlignmentResult } from "@/types/data";
import { analyzeTrendSeries } from "../forecasting/pipeline";
import {
  analyzeTrendAudit,
  calculateAuditOverview,
  TrendAuditAnalysis,
  AuditOverviewSummary,
} from "../audit/frequencies";
import { calculateSignalAlignment, determineRetailVisibility } from "../audit/alignment";

export interface TrendItem {
  id: string;
  name: string;
  category: string;
  mappedColour: string;
}

export function selectTrendsList(state: AppState): TrendItem[] {
  const dictionaryMap = new Map<string, string>();
  for (const dict of state.dictionaryRows) {
    dictionaryMap.set(dict.trend_id, dict.attribute_value || dict.trend_name);
  }

  const trendsMap = new Map<string, { name: string; category: string }>();

  for (const row of state.consumerRows) {
    if (!trendsMap.has(row.trend_id)) {
      trendsMap.set(row.trend_id, {
        name: row.trend_name,
        category: row.category || "Colour",
      });
    }
  }

  // Also include dictionary items if not in consumer data
  for (const dict of state.dictionaryRows) {
    if (!trendsMap.has(dict.trend_id)) {
      trendsMap.set(dict.trend_id, {
        name: dict.trend_name,
        category: dict.category || "Colour",
      });
    }
  }

  return Array.from(trendsMap.entries()).map(([id, info]) => ({
    id,
    name: info.name,
    category: info.category,
    mappedColour: dictionaryMap.get(id) || info.name,
  }));
}

export function selectTrendSeries(state: AppState, trendId: string): MonthlyPoint[] {
  const matching = state.consumerRows.filter((r) => r.trend_id === trendId);
  if (matching.length === 0) return [];

  // Sort by date YYYY-MM
  matching.sort((a, b) => a.date.localeCompare(b.date));

  return matching.map((r) => ({
    date: r.date,
    value: Number(r.search_interest),
  }));
}

export function selectTrendAnalysis(state: AppState, trendId: string): TrendAnalysis | null {
  const trends = selectTrendsList(state);
  const trend = trends.find((t) => t.id === trendId);
  if (!trend) return null;

  const series = selectTrendSeries(state, trendId);
  return analyzeTrendSeries(trend.id, trend.name, trend.category, series);
}

export function selectAllTrendAnalyses(state: AppState): TrendAnalysis[] {
  const trends = selectTrendsList(state);
  return trends.map((t) => {
    const series = selectTrendSeries(state, t.id);
    return analyzeTrendSeries(t.id, t.name, t.category, series);
  });
}

export function selectAuditOverview(state: AppState): AuditOverviewSummary {
  return calculateAuditOverview(state.auditRows);
}

export function selectTrendAuditAnalysis(
  state: AppState,
  trendId: string
): TrendAuditAnalysis | null {
  const trends = selectTrendsList(state);
  const trend = trends.find((t) => t.id === trendId);
  if (!trend) return null;

  return analyzeTrendAudit(trend.id, trend.name, trend.mappedColour, state.auditRows);
}

export function selectSignalAlignment(
  state: AppState,
  trendId: string
): SignalAlignmentResult | null {
  const analysis = selectTrendAnalysis(state, trendId);
  const audit = selectTrendAuditAnalysis(state, trendId);
  if (!analysis) return null;

  const searchDirection = analysis.stats ? analysis.stats.direction : "No signal";
  const visibility = audit
    ? determineRetailVisibility(audit.frequency, audit.retailerCoverageCount)
    : "Low";

  return calculateSignalAlignment(searchDirection, visibility);
}

export interface OverviewKPIs {
  trendsTracked: number;
  increasingCount: number;
  stableCount: number;
  decreasingCount: number;
  noSignalCount: number;
  auditProductCount: number;
  auditDate: string;
  recentCollectionDate: string;
  featuredMovers: {
    analysis: TrendAnalysis;
    audit: TrendAuditAnalysis | null;
    alignment: SignalAlignmentResult | null;
  }[];
}

export function selectOverviewKPIs(state: AppState): OverviewKPIs {
  const analyses = selectAllTrendAnalyses(state);
  const auditOverview = selectAuditOverview(state);

  let increasing = 0;
  let stable = 0;
  let decreasing = 0;
  let noSignal = 0;

  for (const a of analyses) {
    if (!a.stats) {
      noSignal++;
    } else if (a.stats.direction === "Increasing") {
      increasing++;
    } else if (a.stats.direction === "Stable") {
      stable++;
    } else if (a.stats.direction === "Decreasing") {
      decreasing++;
    } else {
      noSignal++;
    }
  }

  let recentCollection = "";
  for (const r of state.consumerRows) {
    if (r.collection_date && (!recentCollection || r.collection_date > recentCollection)) {
      recentCollection = r.collection_date;
    }
  }

  // Featured movers: trends with Increasing direction sorted by normalised slope descending
  const increasingAnalyses = analyses
    .filter((a) => a.stats?.direction === "Increasing")
    .sort((a, b) => (b.stats?.normalisedSlope || 0) - (a.stats?.normalisedSlope || 0));

  const featuredMovers = (
    increasingAnalyses.length > 0 ? increasingAnalyses : analyses.slice(0, 2)
  ).map((analysis) => {
    const audit = selectTrendAuditAnalysis(state, analysis.trendId);
    const alignment = selectSignalAlignment(state, analysis.trendId);
    return { analysis, audit, alignment };
  });

  return {
    trendsTracked: analyses.length,
    increasingCount: increasing,
    stableCount: stable,
    decreasingCount: decreasing,
    noSignalCount: noSignal,
    auditProductCount: auditOverview.totalProducts,
    auditDate: auditOverview.auditDate,
    recentCollectionDate: recentCollection || "2026-11-08",
    featuredMovers,
  };
}

