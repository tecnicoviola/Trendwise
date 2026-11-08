export interface WilsonScoreResult {
  p: number;
  centre: number;
  halfWidth: number;
  lower: number;
  upper: number;
  lowerPercent: number;
  upperPercent: number;
}

/**
 * Computes Wilson score interval for a binomial proportion at 95% confidence (z = 1.96).
 * One-line explanation: Calculates an asymmetric confidence interval suitable for proportions even with small sample sizes.
 */
export function calculateWilsonInterval(k: number, n: number, z: number = 1.96): WilsonScoreResult {
  if (n <= 0) {
    return {
      p: 0,
      centre: 0,
      halfWidth: 0,
      lower: 0,
      upper: 0,
      lowerPercent: 0,
      upperPercent: 0,
    };
  }

  const p = k / n;
  const z2 = z * z;
  const denominator = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denominator;

  const underRadical = (p * (1 - p)) / n + z2 / (4 * n * n);
  const halfWidth = (z * Math.sqrt(Math.max(0, underRadical))) / denominator;

  // Clamping to [0, 1] for proportions, ensuring k=0 gives lower 0 and k=n gives upper 1
  const lower = k === 0 ? 0 : Math.max(0, centre - halfWidth);
  const upper = k === n ? 1 : Math.min(1, centre + halfWidth);

  return {
    p,
    centre,
    halfWidth,
    lower,
    upper,
    lowerPercent: lower * 100,
    upperPercent: upper * 100,
  };
}

