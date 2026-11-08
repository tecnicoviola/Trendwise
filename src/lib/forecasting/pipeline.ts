import { CONFIG } from "@/lib/config";
import { ForecastPoint, MonthlyPoint, TrendAnalysis } from "@/types/forecast";
import { calculateOLS, calculatePredictionInterval } from "../stats/ols";
import { calculateYoY, checkMixedSignals } from "./yoy";
import { evaluateForecast } from "./evaluation";
import { calculateRollingOriginEvaluation } from "./rolling";

/**
 * Increments a YYYY-MM string by a number of months.
 */
export function addMonths(dateStr: string, monthsToAdd: number): string {
  const [yearStr, monthStr] = dateStr.split("-");
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10) - 1;
  m += monthsToAdd;
  y += Math.floor(m / 12);
  m = ((m % 12) + 12) % 12;
  const mm = String(m + 1).padStart(2, "0");
  return `${y}-${mm}`;
}

/**
 * Runs the full forecasting analysis pipeline on a monthly time series for one trend.
 * Enforces strict length rules:
 * - n < 12: no regression, warnings attached
 * - 12 <= n < 24: regression and 3-month forecast with 'short history' warning, no evaluation
 * - n >= 24: full regression, 3-month forecast, out-of-sample evaluation, and rolling evaluation if n >= 27
 */
export function analyzeTrendSeries(
  trendId: string,
  trendName: string,
  category: string,
  series: MonthlyPoint[]
): TrendAnalysis {
  const warnings: string[] = [];
  const n = series.length;

  if (n < CONFIG.MIN_MONTHS_REGRESSION) {
    warnings.push(`Series has only ${n} months (minimum ${CONFIG.MIN_MONTHS_REGRESSION} required for linear regression).`);
    return {
      trendId,
      trendName,
      category,
      series,
      stats: null,
      yoy: null,
      mixedSignals: false,
      forecast: [],
      evaluation: null,
      rollingEvaluation: null,
      warnings,
    };
  }

  const values = series.map((pt) => pt.value);
  const ols = calculateOLS(values);

  if (n < CONFIG.MIN_MONTHS_EVALUATION) {
    warnings.push(`Short history (${n} months). Out-of-sample model evaluation requires at least ${CONFIG.MIN_MONTHS_EVALUATION} months.`);
  }

  // YoY
  const yoy = calculateYoY(values);
  const mixedSignals = checkMixedSignals(ols.direction, yoy.direction);
  if (mixedSignals) {
    warnings.push("Mixed signals: straight-line direction and year-on-year change contradict.");
  }

  // 3-month forecast refit on all complete months
  const lastDate = series[n - 1].date;
  const forecast: ForecastPoint[] = [];

  for (let step = 1; step <= CONFIG.HORIZON_MONTHS; step++) {
    const x0 = n + step;
    const interval = calculatePredictionInterval(ols, x0);
    const forecastDate = addMonths(lastDate, step);

    forecast.push({
      date: forecastDate,
      monthIndex: x0,
      raw: interval.predicted,
      clipped: interval.clippedPredicted,
      lower: interval.clippedLower,
      upper: interval.clippedUpper,
      halfWidth: interval.halfWidth,
    });
  }

  // Evaluation
  const evaluation = n >= CONFIG.MIN_MONTHS_EVALUATION ? evaluateForecast(series) : null;
  const rollingEvaluation = n >= 27 ? calculateRollingOriginEvaluation(series) : null;

  return {
    trendId,
    trendName,
    category,
    series,
    stats: {
      mean: ols.yBar,
      b0: ols.b0,
      b1: ols.b1,
      normalisedSlope: ols.normalisedSlope,
      r2: ols.r2,
      s: ols.s,
      direction: ols.direction,
      fit: ols.fit,
    },
    yoy,
    mixedSignals,
    forecast,
    evaluation,
    rollingEvaluation,
    warnings,
  };
}

