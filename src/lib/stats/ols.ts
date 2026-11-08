import { Direction, FitStrength } from "@/types/data";
import { CONFIG } from "@/lib/config";
import { tCritical } from "./tcrit";

export interface OLSResult {
  n: number;
  xBar: number;
  yBar: number;
  Sxx: number;
  b1: number;
  b0: number;
  SSE: number;
  SST: number;
  r2: number | null;
  s: number;
  normalisedSlope: number;
  direction: Direction;
  fit: FitStrength;
}

export interface PredictionIntervalResult {
  x: number;
  predicted: number;
  halfWidth: number;
  lower: number;
  upper: number;
  clippedPredicted: number;
  clippedLower: number;
  clippedUpper: number;
}

/**
 * Computes Ordinary Least Squares (OLS) linear regression statistics for a 1-indexed time series.
 * y is an array of numbers representing values at x = 1 ... n.
 */
export function calculateOLS(y: number[]): OLSResult {
  const n = y.length;
  if (n < 2) {
    throw new Error("OLS requires at least 2 data points");
  }

  // x is 1, 2, ..., n
  const xBar = (n + 1) / 2;
  const yBar = y.reduce((sum, val) => sum + val, 0) / n;

  let Sxx = 0;
  let Sxy = 0;
  let SST = 0;

  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const dx = x - xBar;
    const dy = y[i] - yBar;
    Sxx += dx * dx;
    Sxy += dx * dy;
    SST += dy * dy;
  }

  const b1 = Sxx === 0 ? 0 : Sxy / Sxx;
  const b0 = yBar - b1 * xBar;

  let SSE = 0;
  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const yHat = b0 + b1 * x;
    const err = y[i] - yHat;
    SSE += err * err;
  }

  const r2 = SST === 0 ? null : Math.max(0, Math.min(1, 1 - SSE / SST));
  const s = n > 2 ? Math.sqrt(Math.max(0, SSE / (n - 2))) : 0;

  // Normalised slope in percent of mean per month
  const normalisedSlope = yBar === 0 ? 0 : (b1 / yBar) * 100;

  let direction: Direction = "Stable";
  if (yBar === 0) {
    direction = "No signal";
  } else if (normalisedSlope > CONFIG.DIRECTION_BAND) {
    direction = "Increasing";
  } else if (normalisedSlope < -CONFIG.DIRECTION_BAND) {
    direction = "Decreasing";
  } else {
    direction = "Stable";
  }

  let fit: FitStrength = "weak";
  if (r2 !== null) {
    if (r2 > CONFIG.R2_STRONG) {
      fit = "strong";
    } else if (r2 >= CONFIG.R2_WEAK) {
      fit = "moderate";
    }
  }

  return {
    n,
    xBar,
    yBar,
    Sxx,
    b1,
    b0,
    SSE,
    SST,
    r2,
    s,
    normalisedSlope,
    direction,
    fit,
  };
}

/**
 * Computes the 95% prediction interval at a single point x0.
 * Prediction formula: yHat0 ± t * s * sqrt(1 + 1/n + (x0 - xBar)^2 / Sxx)
 */
export function calculatePredictionInterval(
  ols: OLSResult,
  x0: number
): PredictionIntervalResult {
  const predicted = ols.b0 + ols.b1 * x0;

  if (ols.n <= 2 || ols.s === 0 || ols.Sxx === 0) {
    const clipped = Math.max(0, Math.min(100, predicted));
    return {
      x: x0,
      predicted,
      halfWidth: 0,
      lower: predicted,
      upper: predicted,
      clippedPredicted: clipped,
      clippedLower: clipped,
      clippedUpper: clipped,
    };
  }

  const df = ols.n - 2;
  const t = tCritical(df);
  const dx = x0 - ols.xBar;
  const varianceFactor = 1 + 1 / ols.n + (dx * dx) / ols.Sxx;
  const halfWidth = t * ols.s * Math.sqrt(varianceFactor);

  const lower = predicted - halfWidth;
  const upper = predicted + halfWidth;

  return {
    x: x0,
    predicted,
    halfWidth,
    lower,
    upper,
    clippedPredicted: Math.max(0, Math.min(100, predicted)),
    clippedLower: Math.max(0, Math.min(100, lower)),
    clippedUpper: Math.max(0, Math.min(100, upper)),
  };
}

