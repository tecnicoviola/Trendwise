import { ConsumerDataRow } from "@/types/data";
import { MonthlyPoint } from "@/types/forecast";
import { CONFIG } from "../config";

export interface MonthlyAggregationResult {
  monthlyPoints: MonthlyPoint[];
  transformations: string[];
  incompleteMonths: string[];
  droppedPartialMonth?: string;
  totalWeeklyPoints: number;
}

export function isLastDayOfMonth(dateStr: string): boolean {
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return false;
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d === daysInMonth;
}

/**
 * Converts weekly Google Trends series to monthly points.
 * One-line explanation: Averages weekly points by month start date, drops partial collection months, and retains the last 36 complete months.
 */
export function aggregateWeeklyToMonthly(
  weeklyRows: { date: string; value: number }[],
  collectionDate: string
): MonthlyAggregationResult {
  const transformations: string[] = [];
  transformations.push(`Received ${weeklyRows.length} raw weekly observations.`);

  // 1. Group by month (YYYY-MM from start date)
  const monthGroups: Map<string, number[]> = new Map();
  for (const row of weeklyRows) {
    const monthKey = row.date.substring(0, 7); // YYYY-MM
    if (!monthGroups.has(monthKey)) {
      monthGroups.set(monthKey, []);
    }
    monthGroups.get(monthKey)!.push(row.value);
  }

  // Sort months chronologically
  const sortedMonths = Array.from(monthGroups.keys()).sort();

  // 2. Check partial collection-date month
  const collectionMonth = collectionDate.substring(0, 7);
  let droppedPartialMonth: string | undefined = undefined;

  if (monthGroups.has(collectionMonth) && !isLastDayOfMonth(collectionDate)) {
    monthGroups.delete(collectionMonth);
    droppedPartialMonth = collectionMonth;
    transformations.push(
      `Excluded partial collection month ${collectionMonth} (collection date ${collectionDate} is not the month's final day).`
    );
  }

  // 3. Compute mean and flag incomplete (< 3 weeks)
  const incompleteMonths: string[] = [];
  const allMonthlyPoints: MonthlyPoint[] = [];

  const remainingMonths = Array.from(monthGroups.keys()).sort();
  for (const m of remainingMonths) {
    const vals = monthGroups.get(m)!;
    const mean = vals.reduce((sum, v) => sum + v, 0) / vals.length;
    const roundedMean = Math.round(mean * 10) / 10;
    const isIncomplete = vals.length < CONFIG.WEEKS_PER_MONTH_MIN;

    if (isIncomplete) {
      incompleteMonths.push(m);
    }

    allMonthlyPoints.push({
      date: m,
      value: roundedMean,
      isIncomplete,
    });
  }

  transformations.push(
    `Aggregated ${allMonthlyPoints.length} calendar months (mean of weekly points in each month).`
  );
  if (incompleteMonths.length > 0) {
    transformations.push(
      `Flagged ${incompleteMonths.length} month(s) with fewer than ${CONFIG.WEEKS_PER_MONTH_MIN} weeks as incomplete (${incompleteMonths.join(", ")}).`
    );
  }

  // 4. Retain last 36 complete months (or fewer if fewer exist)
  let finalPoints = allMonthlyPoints;
  if (allMonthlyPoints.length > CONFIG.WINDOW_MONTHS) {
    const droppedCount = allMonthlyPoints.length - CONFIG.WINDOW_MONTHS;
    finalPoints = allMonthlyPoints.slice(-CONFIG.WINDOW_MONTHS);
    transformations.push(
      `Retained the most recent ${CONFIG.WINDOW_MONTHS} complete months (trimmed ${droppedCount} earlier months).`
    );
  } else {
    transformations.push(
      `Retained all ${allMonthlyPoints.length} complete months (within the ${CONFIG.WINDOW_MONTHS}-month window).`
    );
  }

  transformations.push("Preserved original 0–100 scale without re-normalisation.");

  return {
    monthlyPoints: finalPoints,
    transformations,
    incompleteMonths,
    droppedPartialMonth,
    totalWeeklyPoints: weeklyRows.length,
  };
}

