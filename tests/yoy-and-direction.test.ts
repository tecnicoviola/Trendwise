import { describe, it, expect } from "vitest";
import { calculateYoY } from "@/lib/forecasting/yoy";
import { calculateOLS } from "@/lib/stats/ols";

describe("Section 12.7: YoY and direction boundaries", () => {
  it("YoY calculates +50% example correctly", () => {
    // 15 months: first 3 are 20, 20, 20; middle 9 are 25; last 3 are 30, 30, 30
    const values = [20, 20, 20, 25, 25, 25, 25, 25, 25, 25, 25, 25, 30, 30, 30];
    const res = calculateYoY(values);
    expect(res.value).toBeCloseTo(50, 2);
    expect(res.direction).toBe("up");
    expect(res.baseTooSmall).toBe(false);
  });

  it("YoY returns null when the earlier base is below 5", () => {
    const values = [4, 4, 4, 10, 10, 10, 10, 10, 10, 10, 10, 10, 20, 20, 20];
    const res = calculateYoY(values);
    expect(res.value).toBeNull();
    expect(res.baseTooSmall).toBe(true);
    expect(res.direction).toBeNull();
  });

  it("Direction boundaries: normalised slope at 0.5 (Stable), 0.51 (Increasing), -0.51 (Decreasing), and mean 0 (No signal)", () => {
    // We can test calculateOLS or normalised slope mapping
    // Mean = 100.
    // If b1 = 0.5, normSlope = 0.50 -> Stable
    // If b1 = 0.51, normSlope = 0.51 -> Increasing
    // If b1 = -0.51, normSlope = -0.51 -> Decreasing

    // For a 5-point series with x = 1,2,3,4,5 (xBar = 3):
    // y = b0 + b1 * x. With b0 = 100 - 3 * b1:
    // mean will be 100.
    const makeSeries = (b1: number) => {
      const b0 = 100 - 3 * b1;
      return [1, 2, 3, 4, 5].map((x) => b0 + b1 * x);
    };

    const sBoundary = calculateOLS(makeSeries(0.5));
    expect(sBoundary.normalisedSlope).toBeCloseTo(0.5, 3);
    expect(sBoundary.direction).toBe("Stable");

    const sInc = calculateOLS(makeSeries(0.51));
    expect(sInc.normalisedSlope).toBeCloseTo(0.51, 3);
    expect(sInc.direction).toBe("Increasing");

    const sDec = calculateOLS(makeSeries(-0.51));
    expect(sDec.normalisedSlope).toBeCloseTo(-0.51, 3);
    expect(sDec.direction).toBe("Decreasing");

    // Mean 0
    const sZero = calculateOLS([0, 0, 0, 0, 0]);
    expect(sZero.direction).toBe("No signal");
  });
});

