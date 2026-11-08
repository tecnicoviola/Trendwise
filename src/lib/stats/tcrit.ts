/**
 * Computes the two-sided 95% critical value of Student's t-distribution for given degrees of freedom.
 * Uses exact table for df 1-30, 40, 60, 120 and linear interpolation in 1/df for intermediate values above 30.
 */
export function tCritical(df: number): number {
  if (df <= 0) return 1.96;
  const roundedDf = Math.round(df);

  const TABLE: Record<number, number> = {
    1: 12.706,
    2: 4.303,
    3: 3.182,
    4: 2.776,
    5: 2.571,
    6: 2.447,
    7: 2.365,
    8: 2.306,
    9: 2.262,
    10: 2.228,
    11: 2.201,
    12: 2.179,
    13: 2.160,
    14: 2.145,
    15: 2.131,
    16: 2.120,
    17: 2.110,
    18: 2.101,
    19: 2.093,
    20: 2.086,
    21: 2.080,
    22: 2.074,
    23: 2.069,
    24: 2.064,
    25: 2.060,
    26: 2.056,
    27: 2.052,
    28: 2.048,
    29: 2.045,
    30: 2.042,
    40: 2.021,
    60: 2.000,
    120: 1.980,
  };

  if (TABLE[roundedDf] !== undefined) {
    return TABLE[roundedDf];
  }

  if (roundedDf > 120) {
    return 1.96;
  }

  // Bracket for interpolation in 1/df between breakpoints: [30, 40], [40, 60], [60, 120]
  const breakpoints = [30, 40, 60, 120];
  let lower = 30;
  let upper = 40;

  for (let i = 0; i < breakpoints.length - 1; i++) {
    if (roundedDf >= breakpoints[i] && roundedDf <= breakpoints[i + 1]) {
      lower = breakpoints[i];
      upper = breakpoints[i + 1];
      break;
    }
  }

  const tLow = TABLE[lower];
  const tHigh = TABLE[upper];
  const invDf = 1 / roundedDf;
  const invLow = 1 / lower;
  const invHigh = 1 / upper;

  const fraction = (invDf - invLow) / (invHigh - invLow);
  return tLow + fraction * (tHigh - tLow);
}

