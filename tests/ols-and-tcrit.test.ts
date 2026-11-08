import { describe, it, expect } from "vitest";
import { calculateOLS, calculatePredictionInterval } from "@/lib/stats/ols";
import { tCritical } from "@/lib/stats/tcrit";

describe("Section 12.1: OLS baseline and constant series", () => {
  it("OLS on y = 1,2,3,4,5: slope 1, intercept 0, R2 1", () => {
    const res = calculateOLS([1, 2, 3, 4, 5]);
    expect(res.b1).toBeCloseTo(1, 3);
    expect(res.b0).toBeCloseTo(0, 3);
    expect(res.r2).toBeCloseTo(1, 3);
    expect(res.direction).toBe("Increasing");
    expect(res.fit).toBe("strong");
  });

  it("Constant series: slope 0, R2 null, no NaN or crash", () => {
    const res = calculateOLS([5, 5, 5, 5, 5]);
    expect(res.b1).toBe(0);
    expect(res.b0).toBe(5);
    expect(res.r2).toBeNull();
    expect(res.direction).toBe("Stable");
    expect(Number.isNaN(res.s)).toBe(false);
  });
});

describe("Section 12.2: Worked example verification", () => {
  it("y = 40,44,43,48,50,53 produces expected slope, intercept, SSE, R2 and forecasts", () => {
    const y = [40, 44, 43, 48, 50, 53];
    const res = calculateOLS(y);

    // slope 2.514, intercept 37.533, SSE 6.705, R2 0.943
    expect(res.b1).toBeCloseTo(2.514, 3);
    expect(res.b0).toBeCloseTo(37.533, 3);
    expect(res.SSE).toBeCloseTo(6.705, 3);
    expect(res.r2!).toBeCloseTo(0.943, 3);

    // Forecasts at x = 7, 8, 9 are 55.133, 57.647, 60.160
    const f7 = calculatePredictionInterval(res, 7);
    const f8 = calculatePredictionInterval(res, 8);
    const f9 = calculatePredictionInterval(res, 9);

    expect(f7.predicted).toBeCloseTo(55.133, 2);
    expect(f8.predicted).toBeCloseTo(57.647, 2);
    expect(f9.predicted).toBeCloseTo(60.160, 2);

    // 95% prediction half-width at x = 7 is about 4.91 (range about 50.22-60.04) (tolerance 0.02)
    expect(f7.halfWidth).toBeCloseTo(4.91, 1);
    expect(f7.lower).toBeGreaterThanOrEqual(50.20);
    expect(f7.lower).toBeLessThanOrEqual(50.25);
    expect(f7.upper).toBeGreaterThanOrEqual(60.00);
    expect(f7.upper).toBeLessThanOrEqual(60.07);
  });
});

describe("Section 12.3: tCritical table and interpolation", () => {
  it("df 4 = 2.776, 28 = 2.048, 34 = 2.032, df 1000 about 1.96", () => {
    expect(tCritical(4)).toBeCloseTo(2.776, 3);
    expect(tCritical(28)).toBeCloseTo(2.048, 3);
    expect(tCritical(34)).toBeCloseTo(2.032, 3);
    expect(tCritical(1000)).toBeCloseTo(1.96, 2);
  });
});
