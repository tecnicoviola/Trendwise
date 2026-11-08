import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseCSV } from "@/lib/csv/parse";
import { validateConsumerData, validateFashionAudit } from "@/lib/csv/validate";
import { analyzeTrendSeries } from "@/lib/forecasting/pipeline";
import {
  generateConsumerInterestCSV,
  generateAuditSummaryCSV,
  generateForecastResultsCSV,
} from "@/lib/csv/export";
import { analyzeTrendAudit } from "@/lib/audit/frequencies";
import { ConsumerDataRow, FashionAuditRow } from "@/types/data";

describe("Section 12.12: Synthetic files verification", () => {
  it("Synthetic fashion audit file has 50 rows, 17/17/16 retailer split, correct colour counts, and 0 errors", () => {
    const csvPath = path.resolve(process.cwd(), "public/sample-data/fashion_audit_SYNTHETIC.csv");
    const content = fs.readFileSync(csvPath, "utf-8");
    const { data } = parseCSV<FashionAuditRow>(content);

    expect(data).toHaveLength(50);

    const valResult = validateFashionAudit(data);
    expect(valResult.valid).toBe(true);
    expect(valResult.errors).toHaveLength(0);

    // Retailer counts 17 / 17 / 16
    const retailerCounts: Record<string, number> = {};
    for (const r of data) {
      retailerCounts[r.retailer] = (retailerCounts[r.retailer] || 0) + 1;
    }
    const counts = Object.values(retailerCounts).sort((a, b) => b - a);
    expect(counts).toEqual([17, 17, 16]);

    // Colour counts: Butter Yellow 8 (3), Burgundy 6 (3), Chocolate Brown 7 (3), Powder Blue 5 (2), Sage Green 6 (3), others 18
    const colourCounts: Record<string, number> = {};
    for (const r of data) {
      colourCounts[r.colour] = (colourCounts[r.colour] || 0) + 1;
    }

    expect(colourCounts["Butter Yellow"]).toBe(8);
    expect(colourCounts["Burgundy"]).toBe(6);
    expect(colourCounts["Chocolate Brown"]).toBe(7);
    expect(colourCounts["Powder Blue"]).toBe(5);
    expect(colourCounts["Sage Green"]).toBe(6);

    const mainColours = ["Butter Yellow", "Burgundy", "Chocolate Brown", "Powder Blue", "Sage Green"];
    let others = 0;
    for (const [col, count] of Object.entries(colourCounts)) {
      if (!mainColours.includes(col)) {
        others += count;
      }
    }
    expect(others).toBe(18);
  });

  it("Synthetic consumer interest file has 180 rows, values 0-100, and expected directions", () => {
    const csvPath = path.resolve(process.cwd(), "public/sample-data/consumer_interest_SYNTHETIC.csv");
    const content = fs.readFileSync(csvPath, "utf-8");
    const { data } = parseCSV<ConsumerDataRow>(content);

    expect(data).toHaveLength(180);

    const valResult = validateConsumerData(data);
    expect(valResult.valid).toBe(true);
    expect(valResult.errors).toHaveLength(0);

    // Group by trend
    const trends: Record<string, { date: string; value: number }[]> = {};
    for (const row of data) {
      if (!trends[row.trend_id]) {
        trends[row.trend_id] = [];
      }
      trends[row.trend_id].push({
        date: row.date,
        value: Number(row.search_interest),
      });
    }

    // T001 Butter Yellow: Increasing
    const t1 = analyzeTrendSeries("T001", "Butter Yellow", "Colour", trends["T001"]);
    expect(t1.stats?.direction).toBe("Increasing");

    // T003 Chocolate Brown: Increasing
    const t3 = analyzeTrendSeries("T003", "Chocolate Brown", "Colour", trends["T003"]);
    expect(t3.stats?.direction).toBe("Increasing");

    // T004 Powder Blue: Decreasing
    const t4 = analyzeTrendSeries("T004", "Powder Blue", "Colour", trends["T004"]);
    expect(t4.stats?.direction).toBe("Decreasing");

    // T002 Burgundy: Stable
    const t2 = analyzeTrendSeries("T002", "Burgundy", "Colour", trends["T002"]);
    expect(t2.stats?.direction).toBe("Stable");

    // T005 Sage Green: Stable
    const t5 = analyzeTrendSeries("T005", "Sage Green", "Colour", trends["T005"]);
    expect(t5.stats?.direction).toBe("Stable");
  });
});

describe("Section 12.13: Export then re-import gives identical numbers", () => {
  it("Consumer interest CSV re-imports with identical values", () => {
    const csvPath = path.resolve(process.cwd(), "public/sample-data/consumer_interest_SYNTHETIC.csv");
    const originalContent = fs.readFileSync(csvPath, "utf-8");
    const { data: originalData } = parseCSV<ConsumerDataRow>(originalContent);

    const exportedCSV = generateConsumerInterestCSV(originalData);
    const { data: reimportedData } = parseCSV<ConsumerDataRow>(exportedCSV);

    expect(reimportedData).toHaveLength(originalData.length);
    for (let i = 0; i < originalData.length; i++) {
      expect(reimportedData[i].date).toBe(originalData[i].date);
      expect(reimportedData[i].trend_id).toBe(originalData[i].trend_id);
      expect(Number(reimportedData[i].search_interest)).toBeCloseTo(
        Number(originalData[i].search_interest),
        3
      );
    }
  });
});

