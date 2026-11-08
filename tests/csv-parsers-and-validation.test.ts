import { describe, it, expect } from "vitest";
import { aggregateWeeklyToMonthly } from "@/lib/csv/monthly";
import { parseRawGoogleTrendsExport } from "@/lib/csv/google-trends-export";
import { validateConsumerData, validateFashionAudit } from "@/lib/csv/validate";

describe("Section 12.10: Weekly-to-monthly aggregation and Google Trends raw parser", () => {
  it("Weekly-to-monthly aggregates by start date, drops partial collection month, and flags incomplete months", () => {
    // 5 weekly points in Oct 2026, 1 weekly point in Nov 2026.
    // Collection date is 2026-11-08 (not the last day of November).
    const weekly = [
      { date: "2026-10-01", value: 40 },
      { date: "2026-10-08", value: 42 },
      { date: "2026-10-15", value: 44 },
      { date: "2026-10-22", value: 46 },
      { date: "2026-10-29", value: 48 },
      { date: "2026-11-05", value: 50 },
    ];

    const res = aggregateWeeklyToMonthly(weekly, "2026-11-08");
    expect(res.droppedPartialMonth).toBe("2026-11");
    expect(res.monthlyPoints).toHaveLength(1);
    expect(res.monthlyPoints[0].date).toBe("2026-10");
    expect(res.monthlyPoints[0].value).toBe(44.0);
    expect(res.monthlyPoints[0].isIncomplete).toBe(false);
  });

  it("Google Trends raw parser handles preambles, '<1' values, and reports unknown layout", () => {
    const rawCSV = [
      "Category: All categories",
      "",
      "Week,butter yellow: (India),burgundy: (India)",
      "2026-10-04,<1,35",
      "2026-10-11,12,38",
    ].join("\n");

    const parsed = parseRawGoogleTrendsExport(rawCSV);
    expect(parsed.terms).toEqual(["butter yellow", "burgundy"]);
    expect(parsed.lessThanOneCount).toBe(1);
    expect(parsed.rawRows[0].values["butter yellow"]).toBe(0);
    expect(parsed.rawRows[0].values["burgundy"]).toBe(35);

    // Unknown layout throws helpful error
    const badCSV = "col1,col2\n1,2";
    expect(() => parseRawGoogleTrendsExport(badCSV)).toThrow(/Unrecognised Google Trends layout/);
  });
});

describe("Section 12.11: Comprehensive CSV Validation tests", () => {
  const baseValidConsumerRow = {
    date: "2026-10",
    trend_id: "T001",
    trend_name: "Butter Yellow",
    category: "Colour",
    region: "India",
    search_interest: 45,
    source: "Google Trends",
    source_url: "https://example.com",
    collection_date: "2026-11-08",
    query_group: "q1",
    time_range: "2023-11 to 2026-10",
  };

  it("Consumer validation detects missing columns", () => {
    const res = validateConsumerData([{ date: "2026-10" }]);
    expect(res.valid).toBe(false);
    expect(res.errors[0].message).toMatch(/Missing or misspelt required column/);
  });

  it("Consumer validation detects invalid date and row number", () => {
    const res = validateConsumerData([
      baseValidConsumerRow,
      { ...baseValidConsumerRow, date: "2026/10" },
    ]);
    expect(res.valid).toBe(false);
    const dateErr = res.errors.find((e) => e.column === "date");
    expect(dateErr).toBeDefined();
    expect(dateErr!.row).toBe(3);
  });

  it("Consumer validation detects search_interest out of bounds", () => {
    const res = validateConsumerData([
      { ...baseValidConsumerRow, search_interest: 105 },
    ]);
    expect(res.valid).toBe(false);
    expect(res.errors[0].column).toBe("search_interest");
  });

  it("Consumer validation detects duplicate trend + month", () => {
    const res = validateConsumerData([
      baseValidConsumerRow,
      baseValidConsumerRow,
    ]);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.message.includes("duplicate entry"))).toBe(true);
  });

  it("Consumer validation detects multiple regions", () => {
    const res = validateConsumerData([
      baseValidConsumerRow,
      { ...baseValidConsumerRow, date: "2026-09", region: "Worldwide" },
    ]);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.message.includes("Multiple regions"))).toBe(true);
  });

  it("Audit validation detects duplicate audit_id and product_url", () => {
    const baseAuditRow = {
      audit_id: "A1",
      retailer: "Retailer A",
      product: "Top A",
      product_url: "https://example.com/p1",
      audit_date: "2026-11-08",
      product_category: "Women's Tops",
      colour: "Butter Yellow",
      fabric: "Cotton",
      print: "Solid",
      silhouette: "Fitted",
      listing_source: "New Arrivals",
    };

    const res = validateFashionAudit([
      baseAuditRow,
      { ...baseAuditRow, audit_id: "A1", product_url: "https://example.com/p2" },
    ]);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.column === "audit_id")).toBe(true);
  });

  it("Audit validation warns on value outside controlled vocabulary", () => {
    const baseAuditRow = {
      audit_id: "A1",
      retailer: "Retailer A",
      product: "Top A",
      product_url: "https://example.com/p1",
      audit_date: "2026-11-08",
      product_category: "Women's Tops",
      colour: "Neon Orange", // outside controlled vocab
      fabric: "Cotton",
      print: "Solid",
      silhouette: "Fitted",
      listing_source: "New Arrivals",
    };

    const res = validateFashionAudit([baseAuditRow]);
    expect(res.warnings.some((w) => w.column === "colour" && w.message.includes("Neon Orange"))).toBe(true);
  });
});

