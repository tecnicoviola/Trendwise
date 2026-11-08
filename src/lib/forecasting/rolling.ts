import { ExtendedEvaluationResult, MonthlyPoint, RollingOriginResult } from "@/types/forecast";
import { calculateOLS } from "../stats/ols";
import { calculateMAE } from "../stats/mae";

/**
 * Computes rolling-origin evaluation (walk-forward validation) over 10 origins for series with 36 points.
 * One-line explanation: Evaluates 3-month-ahead forecast robustness across multiple chronological train/test cutoffs.
 */
export function calculateRollingOriginEvaluation(
  series: MonthlyPoint[]
): ExtendedEvaluationResult | null {
  const n = series.length;
  // Requires at least 27 months to have at least one 3-month forecast origin starting at 24
  if (n < 27) {
    return null;
  }

  const values = series.map((pt) => pt.value);
  const origins: RollingOriginResult[] = [];

  // Origins: training end points from 24 up to min(33, n - 3)
  const maxOrigin = Math.min(33, n - 3);
  for (let trainEnd = 24; trainEnd <= maxOrigin; trainEnd++) {
    const trainValues = values.slice(0, trainEnd);
    const testValues = values.slice(trainEnd, trainEnd + 3);

    // 1. OLS
    const ols = calculateOLS(trainValues);
    const olsPreds = [1, 2, 3].map((step) => ols.b0 + ols.b1 * (trainEnd + step));

    // 2. Persistence
    const lastTrainVal = trainValues[trainEnd - 1];
    const persPreds = [lastTrainVal, lastTrainVal, lastTrainVal];

    // 3. Seasonal-naive
    const snPreds = [0, 1, 2].map((step) => {
      const pastIdx = trainEnd + step - 12;
      return values[pastIdx];
    });

    const maeOls = calculateMAE(testValues, olsPreds);
    const maePers = calculateMAE(testValues, persPreds);
    const maeSn = calculateMAE(testValues, snPreds);

    origins.push({
      origin: trainEnd,
      trainEndMonth: series[trainEnd - 1].date,
      maeOls,
      maePersistence: maePers,
      maeSeasonalNaive: maeSn,
    });
  }

  if (origins.length === 0) {
    return null;
  }

  const avgOls = origins.reduce((acc, o) => acc + o.maeOls, 0) / origins.length;
  const avgPers = origins.reduce((acc, o) => acc + o.maePersistence, 0) / origins.length;
  const avgSn = origins.reduce((acc, o) => acc + o.maeSeasonalNaive, 0) / origins.length;

  return {
    tested: true,
    originsCount: origins.length,
    averageMae: {
      ols: avgOls,
      persistence: avgPers,
      seasonal_naive: avgSn,
    },
    origins,
  };
}

