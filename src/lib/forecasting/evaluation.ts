import { CONFIG } from "@/lib/config";
import { EvaluationModelResult, EvaluationResult, MonthlyPoint } from "@/types/forecast";
import { calculateOLS } from "../stats/ols";
import { calculateMAE } from "../stats/mae";

/**
 * Evaluates OLS, Persistence, and Seasonal-Naive models over the chronological test window (last 6 months).
 * One-line explanation: Tests out-of-sample forecast accuracy using chronological train/test split.
 */
export function evaluateForecast(series: MonthlyPoint[]): EvaluationResult | null {
  const n = series.length;
  if (n < CONFIG.MIN_MONTHS_EVALUATION) {
    return null;
  }

  const testCount = CONFIG.TEST_MONTHS;
  const trainCount = n - testCount;

  const values = series.map((pt) => pt.value);
  const trainValues = values.slice(0, trainCount);
  const testPoints = series.slice(trainCount);

  // 1. OLS on training data
  const trainOLS = calculateOLS(trainValues);
  const olsPredictions: EvaluationModelResult["predictions"] = [];
  const olsPredValues: number[] = [];

  for (let i = 0; i < testCount; i++) {
    const originalIndex = trainCount + i;
    const x = originalIndex + 1; // 1-based index
    const pred = trainOLS.b0 + trainOLS.b1 * x;
    const actual = testPoints[i].value;
    olsPredValues.push(pred);
    olsPredictions.push({
      date: testPoints[i].date,
      actual,
      predicted: pred,
      error: Math.abs(actual - pred),
    });
  }

  // 2. Persistence baseline: last training value repeated
  const lastTrainVal = trainValues[trainCount - 1];
  const persPredictions: EvaluationModelResult["predictions"] = [];
  const persPredValues: number[] = [];

  for (let i = 0; i < testCount; i++) {
    const actual = testPoints[i].value;
    persPredValues.push(lastTrainVal);
    persPredictions.push({
      date: testPoints[i].date,
      actual,
      predicted: lastTrainVal,
      error: Math.abs(actual - lastTrainVal),
    });
  }

  // 3. Seasonal-Naive baseline: actual value from 12 months earlier
  const snPredictions: EvaluationModelResult["predictions"] = [];
  const snPredValues: number[] = [];

  for (let i = 0; i < testCount; i++) {
    const originalIndex = trainCount + i;
    const pastIndex = originalIndex - 12;
    if (pastIndex < 0) {
      throw new Error("Seasonal naive requires historical value from 12 months prior");
    }
    const pred = values[pastIndex];
    const actual = testPoints[i].value;
    snPredValues.push(pred);
    snPredictions.push({
      date: testPoints[i].date,
      actual,
      predicted: pred,
      error: Math.abs(actual - pred),
    });
  }

  const actuals = testPoints.map((p) => p.value);
  const maeOls = calculateMAE(actuals, olsPredValues);
  const maePers = calculateMAE(actuals, persPredValues);
  const maeSn = calculateMAE(actuals, snPredValues);

  // Determine best model (strictly lowest MAE within 1e-9 tolerance)
  const minMae = Math.min(maeOls, maePers, maeSn);
  let bestModel: "ols" | "persistence" | "seasonal_naive" | "tied" = "tied";
  let bestModelName = "Tied";

  const isTied =
    (Math.abs(maeOls - minMae) < 1e-9 ? 1 : 0) +
    (Math.abs(maePers - minMae) < 1e-9 ? 1 : 0) +
    (Math.abs(maeSn - minMae) < 1e-9 ? 1 : 0) > 1;

  if (isTied) {
    bestModel = "tied";
    bestModelName = "Tied";
  } else if (Math.abs(maeOls - minMae) < 1e-9) {
    bestModel = "ols";
    bestModelName = "Linear regression (OLS)";
  } else if (Math.abs(maePers - minMae) < 1e-9) {
    bestModel = "persistence";
    bestModelName = "Persistence baseline";
  } else {
    bestModel = "seasonal_naive";
    bestModelName = "Seasonal-naive baseline";
  }

  const olsBeatBaselines = bestModel === "ols";

  let verdict: string;
  if (bestModel === "ols") {
    verdict = `Linear regression had the lowest error (${maeOls.toFixed(2)} points) on this window.`;
  } else if (bestModel === "tied") {
    verdict = `Multiple models tied with lowest error (${minMae.toFixed(2)} points). The straight line did not beat the simplest baseline on this window.`;
  } else {
    verdict = `${bestModelName} had the lowest error (${minMae.toFixed(2)} points vs ${maeOls.toFixed(2)} for OLS). The straight line did not beat the simplest baseline on this window.`;
  }

  return {
    evaluated: true,
    trainCount,
    testCount,
    models: {
      ols: {
        model: "ols",
        name: "Linear regression (OLS)",
        mae: maeOls,
        predictions: olsPredictions,
      },
      persistence: {
        model: "persistence",
        name: "Persistence baseline",
        mae: maePers,
        predictions: persPredictions,
      },
      seasonal_naive: {
        model: "seasonal_naive",
        name: "Seasonal-naive baseline",
        mae: maeSn,
        predictions: snPredictions,
      },
    },
    bestModel,
    bestModelName,
    verdict,
    olsBeatBaselines,
  };
}

