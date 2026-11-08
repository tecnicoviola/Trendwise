import { ConsumerDataRow, FashionAuditRow } from "@/types/data";
import { TrendAnalysis } from "@/types/forecast";
import { TrendAuditAnalysis } from "../audit/frequencies";
import { stringifyCSV } from "./parse";

export interface FashionAuditSummaryRow {
  audit_date: string;
  trend_id: string;
  trend_name: string;
  category: string;
  retailer: string;
  sample_size: number;
  observed_count: number;
  frequency_percentage: number;
}

export function generateConsumerInterestCSV(rows: ConsumerDataRow[]): string {
  return stringifyCSV(rows);
}

export function generateAuditSummaryCSV(
  trendAudits: TrendAuditAnalysis[],
  auditDate: string
): string {
  const summaryRows: FashionAuditSummaryRow[] = [];

  for (const item of trendAudits) {
    // 1. All retailers row
    summaryRows.push({
      audit_date: auditDate,
      trend_id: item.trendId,
      trend_name: item.trendName,
      category: "Colour",
      retailer: "All retailers",
      sample_size: item.n,
      observed_count: item.k,
      frequency_percentage: Math.round(item.frequency * 10) / 10,
    });

    // 2. Individual retailer rows
    for (const rStat of item.retailerStats) {
      summaryRows.push({
        audit_date: auditDate,
        trend_id: item.trendId,
        trend_name: item.trendName,
        category: "Colour",
        retailer: rStat.retailer,
        sample_size: rStat.totalSampled,
        observed_count: rStat.observedCount,
        frequency_percentage: Math.round(rStat.frequency * 10) / 10,
      });
    }
  }

  return stringifyCSV(summaryRows);
}

export function generateForecastResultsCSV(analyses: TrendAnalysis[]): string {
  const rows: any[] = [];

  for (const a of analyses) {
    // Observed points
    for (const pt of a.series) {
      rows.push({
        trend_id: a.trendId,
        trend_name: a.trendName,
        type: "observed",
        date: pt.date,
        observed_value: pt.value,
        forecast_raw: "",
        forecast_clipped: "",
        prediction_lower: "",
        prediction_upper: "",
        slope_b1: a.stats ? a.stats.b1.toFixed(4) : "",
        normalised_slope: a.stats ? a.stats.normalisedSlope.toFixed(2) : "",
        r2: a.stats?.r2 !== null && a.stats?.r2 !== undefined ? a.stats.r2.toFixed(3) : "",
        direction: a.stats ? a.stats.direction : "",
        mae_ols: a.evaluation ? a.evaluation.models.ols.mae.toFixed(2) : "",
        mae_persistence: a.evaluation ? a.evaluation.models.persistence.mae.toFixed(2) : "",
        mae_seasonal_naive: a.evaluation ? a.evaluation.models.seasonal_naive.mae.toFixed(2) : "",
        best_model: a.evaluation ? a.evaluation.bestModelName : "",
      });
    }

    // Forecast points
    for (const f of a.forecast) {
      rows.push({
        trend_id: a.trendId,
        trend_name: a.trendName,
        type: "forecast",
        date: f.date,
        observed_value: "",
        forecast_raw: f.raw.toFixed(2),
        forecast_clipped: f.clipped.toFixed(1),
        prediction_lower: f.lower.toFixed(1),
        prediction_upper: f.upper.toFixed(1),
        slope_b1: a.stats ? a.stats.b1.toFixed(4) : "",
        normalised_slope: a.stats ? a.stats.normalisedSlope.toFixed(2) : "",
        r2: a.stats?.r2 !== null && a.stats?.r2 !== undefined ? a.stats.r2.toFixed(3) : "",
        direction: a.stats ? a.stats.direction : "",
        mae_ols: a.evaluation ? a.evaluation.models.ols.mae.toFixed(2) : "",
        mae_persistence: a.evaluation ? a.evaluation.models.persistence.mae.toFixed(2) : "",
        mae_seasonal_naive: a.evaluation ? a.evaluation.models.seasonal_naive.mae.toFixed(2) : "",
        best_model: a.evaluation ? a.evaluation.bestModelName : "",
      });
    }
  }

  return stringifyCSV(rows);
}

