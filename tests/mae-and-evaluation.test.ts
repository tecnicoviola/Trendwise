import { describe, it, expect } from "vitest";
import { calculateMAE } from "@/lib/stats/mae";
import { evaluateForecast } from "@/lib/forecasting/evaluation";
import { calculateRollingOriginEvaluation } from "@/lib/forecasting/rolling";
import { analyzeTrendSeries } from "@/lib/forecasting/pipeline";
import { MonthlyPoint } from "@/types/forecast";

describe("Section 12.4: MAE calculation", () => {
  it("MAE of actual [50,52,55] vs predicted [48,53,60] = 2.667", () => {
    const actual = [50, 52, 55];
    const predicted = [48, 53, 60];
    const mae = calculateMAE(actual, predicted);
    expect(mae).toBeCloseTo(2.667, 3);
  });
});

describe("Section 12.5: Chronological evaluation", () => {
  it("Evaluation on a 36-month perfectly seasonal series (12 values repeated): seasonal-naive MAE 0 and named best", () => {
    const base12 = [10, 15, 20, 25, 30, 35, 40, 35, 30, 25, 20, 15];
    const series36: MonthlyPoint[] = [];
    for (let cycle = 0; cycle < 3; cycle++) {
      for (let m = 0; m < 12; m++) {
        const y = 2023 + cycle;
        const mm = String(m + 1).padStart(2, "0");
        series36.push({
          date: `${y}-${mm}`,
          value: base12[m],
        });
      }
    }

    const evalResult = evaluateForecast(series36);
    expect(evalResult).not.toBeNull();
    expect(evalResult!.trainCount).toBe(30);
    expect(evalResult!.testCount).toBe(6);
    expect(evalResult!.models.seasonal_naive.mae).toBeCloseTo(0, 4);
    expect(evalResult!.bestModel).toBe("seasonal_naive");
    expect(evalResult!.olsBeatBaselines).toBe(false);
  });

  it("Evaluation on y = 2 + 0.5x: OLS MAE about 0 and named best", () => {
    const linearSeries: MonthlyPoint[] = [];
    for (let i = 1; i <= 36; i++) {
      const y = Math.floor((i - 1) / 12) + 2023;
      const m = ((i - 1) % 12) + 1;
      linearSeries.push({
        date: `${y}-${String(m).padStart(2, "0")}`,
        value: 2 + 0.5 * i,
      });
    }

    const evalResult = evaluateForecast(linearSeries);
    expect(evalResult).not.toBeNull();
    expect(evalResult!.models.ols.mae).toBeCloseTo(0, 3);
    expect(evalResult!.bestModel).toBe("ols");
    expect(evalResult!.olsBeatBaselines).toBe(true);
  });
});

describe("Section 12.6: Series length rules and rolling origin", () => {
  function makeDummySeries(count: number): MonthlyPoint[] {
    const res: MonthlyPoint[] = [];
    for (let i = 1; i <= count; i++) {
      res.push({
        date: `2023-${String((i % 12) + 1).padStart(2, "0")}`,
        value: 50 + (i % 5),
      });
    }
    return res;
  }

  it("Series-length rule: n = 11 has no regression and shows warning", () => {
    const analysis = analyzeTrendSeries("T001", "Butter Yellow", "Colour", makeDummySeries(11));
    expect(analysis.stats).toBeNull();
    expect(analysis.forecast).toHaveLength(0);
    expect(analysis.warnings.some((w) => w.includes("minimum 12"))).toBe(true);
  });

  it("Series-length rule: n = 18 has regression but no evaluation", () => {
    const analysis = analyzeTrendSeries("T001", "Butter Yellow", "Colour", makeDummySeries(18));
    expect(analysis.stats).not.toBeNull();
    expect(analysis.forecast).toHaveLength(3);
    expect(analysis.evaluation).toBeNull();
    expect(analysis.warnings.some((w) => w.includes("Short history"))).toBe(true);
  });

  it("Series-length rule: n = 24 has evaluation", () => {
    const analysis = analyzeTrendSeries("T001", "Butter Yellow", "Colour", makeDummySeries(24));
    expect(analysis.stats).not.toBeNull();
    expect(analysis.evaluation).not.toBeNull();
  });

  it("Rolling origin gives exactly 10 origins for n = 36", () => {
    const series36 = makeDummySeries(36);
    const rolling = calculateRollingOriginEvaluation(series36);
    expect(rolling).not.toBeNull();
    expect(rolling!.originsCount).toBe(10);
    expect(rolling!.origins).toHaveLength(10);
    expect(rolling!.origins[0].origin).toBe(24);
    expect(rolling!.origins[9].origin).toBe(33);
  });
});

