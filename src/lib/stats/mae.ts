/**
 * Computes Mean Absolute Error (MAE) between two arrays of equal length.
 * One-line explanation: Returns the arithmetic mean of absolute differences between actual and predicted values.
 */
export function calculateMAE(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) {
    throw new Error("Arrays must be non-empty and of equal length to compute MAE");
  }

  let totalDiff = 0;
  for (let i = 0; i < actual.length; i++) {
    totalDiff += Math.abs(actual[i] - predicted[i]);
  }

  return totalDiff / actual.length;
}

