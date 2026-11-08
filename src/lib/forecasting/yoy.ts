import { CONFIG } from "@/lib/config";
import { Direction } from "@/types/data";
import { YoYResult } from "@/types/forecast";

/**
 * Computes Year-on-Year (YoY) percentage change comparing the mean of the last 3 months with the same 3 months 12 months prior.
 * One-line explanation: Compares the recent quarter to the same quarter last year to avoid seasonal distortion.
 */
export function calculateYoY(values: number[]): YoYResult {
  const n = values.length;
  if (n < 15) {
    return {
      value: null,
      direction: null,
      baseTooSmall: false,
      earlierMean: null,
      recentMean: null,
      message: "Insufficient history (requires at least 15 months)",
    };
  }

  // Last 3 months: indices [n - 3, n - 2, n - 1]
  const recent3 = values.slice(n - 3, n);
  const recentMean = recent3.reduce((a, b) => a + b, 0) / 3;

  // Same 3 months 12 months earlier: indices [n - 15, n - 14, n - 13]
  const earlier3 = values.slice(n - 15, n - 12);
  const earlierMean = earlier3.reduce((a, b) => a + b, 0) / 3;

  if (earlierMean < CONFIG.YOY_MIN_BASE) {
    return {
      value: null,
      direction: null,
      baseTooSmall: true,
      earlierMean,
      recentMean,
      message: "n/a, base too small",
    };
  }

  const yoyPct = (recentMean / earlierMean - 1) * 100;

  let direction: "up" | "down" | "flat" = "flat";
  if (yoyPct > CONFIG.YOY_BAND) {
    direction = "up";
  } else if (yoyPct < -CONFIG.YOY_BAND) {
    direction = "down";
  } else {
    direction = "flat";
  }

  return {
    value: yoyPct,
    direction,
    baseTooSmall: false,
    earlierMean,
    recentMean,
  };
}

/**
 * Checks for mixed signals between slope direction and YoY direction.
 * Mixed signals flag is set when slope is Increasing but YoY is down, or slope is Decreasing but YoY is up.
 */
export function checkMixedSignals(slopeDirection: Direction, yoyDirection: "up" | "down" | "flat" | null): boolean {
  if (!yoyDirection) return false;
  if (slopeDirection === "Increasing" && yoyDirection === "down") return true;
  if (slopeDirection === "Decreasing" && yoyDirection === "up") return true;
  return false;
}

