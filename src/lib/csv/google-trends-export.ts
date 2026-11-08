import { ConsumerDataRow } from "@/types/data";
import { DEFAULT_TREND_DICTIONARY } from "./schemas";
import { aggregateWeeklyToMonthly } from "./monthly";

export interface GoogleTrendsParsedExport {
  terms: string[];
  matchedTrends: Record<string, { trendId: string; trendName: string }>;
  unmatchedTerms: string[];
  rawRows: { date: string; values: Record<string, number> }[];
  lessThanOneCount: number;
  detectedGranularity: "weekly" | "monthly";
  firstDate: string;
  lastDate: string;
  detectedHeaderLine: number;
}

export interface GoogleTrendsImportConfig {
  region: string;
  collectionDate: string;
  queryGroup: string;
  timeRange: string;
  searchCategory: string;
  termMappings: Record<string, { trendId: string; trendName: string }>; // term -> { trendId, trendName }
}

/**
 * Parses raw text from a Google Trends CSV export.
 * Tolerant of metadata preambles, variable header naming (Week/Month/Day/Time), and '<1' values.
 */
export function parseRawGoogleTrendsExport(csvText: string): GoogleTrendsParsedExport {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim());
  let headerIndex = -1;
  const headerKeywords = ["week", "month", "day", "time"];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const firstCell = line.split(",")[0].trim().toLowerCase().replace(/^["']|["']$/g, "");
    if (headerKeywords.includes(firstCell)) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error(
      "Unrecognised Google Trends layout: Could not find header line starting with Week, Month, Day, or Time. Please check the file or use the long-format template."
    );
  }

  // Parse header
  const headerCells = lines[headerIndex]
    .split(",")
    .map((c) => c.trim().replace(/^["']|["']$/g, ""));
  const dateCol = headerCells[0];
  const detectedGranularity: "weekly" | "monthly" =
    dateCol.toLowerCase() === "month" ? "monthly" : "weekly";

  const terms: string[] = [];
  for (let c = 1; c < headerCells.length; c++) {
    const rawTerm = headerCells[c];
    if (!rawTerm) continue;
    // Strip ': (Region)' e.g. "butter yellow: (India)" -> "butter yellow"
    const cleaned = rawTerm.replace(/:\s*\([^)]*\)$/i, "").trim();
    terms.push(cleaned);
  }

  if (terms.length === 0) {
    throw new Error("No search term columns found in Google Trends export.");
  }

  let lessThanOneCount = 0;
  const rawRows: { date: string; values: Record<string, number> }[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cells = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const dateStr = cells[0];
    if (!dateStr || !/^\d{4}-\d{2}/.test(dateStr)) continue;

    const rowValues: Record<string, number> = {};
    for (let c = 0; c < terms.length; c++) {
      const term = terms[c];
      const valStr = cells[c + 1] !== undefined ? cells[c + 1] : "0";
      let numVal = 0;

      if (valStr === "<1") {
        numVal = 0;
        lessThanOneCount++;
      } else {
        const parsed = parseFloat(valStr);
        numVal = isNaN(parsed) ? 0 : parsed;
      }
      rowValues[term] = numVal;
    }

    rawRows.push({
      date: dateStr,
      values: rowValues,
    });
  }

  if (rawRows.length === 0) {
    throw new Error("No data rows found below Google Trends header.");
  }

  // Map terms to default trends by case-insensitive name match
  const matchedTrends: Record<string, { trendId: string; trendName: string }> = {};
  const unmatchedTerms: string[] = [];

  for (const term of terms) {
    const match = DEFAULT_TREND_DICTIONARY.find(
      (dict) => dict.trend_name.toLowerCase() === term.toLowerCase()
    );
    if (match) {
      matchedTrends[term] = { trendId: match.trend_id, trendName: match.trend_name };
    } else {
      unmatchedTerms.push(term);
    }
  }

  return {
    terms,
    matchedTrends,
    unmatchedTerms,
    rawRows,
    lessThanOneCount,
    detectedGranularity,
    firstDate: rawRows[0].date,
    lastDate: rawRows[rawRows.length - 1].date,
    detectedHeaderLine: headerIndex + 1,
  };
}

/**
 * Converts parsed raw Google Trends data into standard long-format ConsumerDataRow items.
 */
export function convertGoogleTrendsToLongFormat(
  parsed: GoogleTrendsParsedExport,
  config: GoogleTrendsImportConfig
): { rows: ConsumerDataRow[]; transformations: string[] } {
  const allTransformations: string[] = [];
  allTransformations.push(`Detected ${parsed.terms.length} search terms: ${parsed.terms.join(", ")}.`);
  if (parsed.lessThanOneCount > 0) {
    allTransformations.push(
      `Converted ${parsed.lessThanOneCount} instance(s) of '<1' to 0 (reported and tracked).`
    );
  }

  const resultRows: ConsumerDataRow[] = [];

  for (const term of parsed.terms) {
    const mapping = config.termMappings[term] || parsed.matchedTrends[term];
    if (!mapping) {
      continue; // Unmapped term skipped
    }

    const weeklyPoints = parsed.rawRows.map((r) => ({
      date: r.date,
      value: r.values[term] !== undefined ? r.values[term] : 0,
    }));

    if (parsed.detectedGranularity === "weekly") {
      const agg = aggregateWeeklyToMonthly(weeklyPoints, config.collectionDate);
      allTransformations.push(
        `For '${mapping.trendName}': Aggregated ${agg.totalWeeklyPoints} weekly points into ${agg.monthlyPoints.length} monthly points.`
      );
      if (agg.droppedPartialMonth) {
        allTransformations.push(`Dropped partial month ${agg.droppedPartialMonth}.`);
      }

      for (const mPt of agg.monthlyPoints) {
        resultRows.push({
          date: mPt.date,
          trend_id: mapping.trendId,
          trend_name: mapping.trendName,
          category: "Colour",
          region: config.region,
          search_interest: mPt.value,
          source: "Google Trends",
          source_url: "https://trends.google.com",
          collection_date: config.collectionDate,
          query_group: config.queryGroup,
          time_range: config.timeRange,
          search_query: term,
          search_category: config.searchCategory,
          granularity_source: "weekly",
        });
      }
    } else {
      // Monthly direct
      for (const pt of weeklyPoints) {
        resultRows.push({
          date: pt.date.substring(0, 7),
          trend_id: mapping.trendId,
          trend_name: mapping.trendName,
          category: "Colour",
          region: config.region,
          search_interest: pt.value,
          source: "Google Trends",
          source_url: "https://trends.google.com",
          collection_date: config.collectionDate,
          query_group: config.queryGroup,
          time_range: config.timeRange,
          search_query: term,
          search_category: config.searchCategory,
          granularity_source: "monthly",
        });
      }
    }
  }

  return {
    rows: resultRows,
    transformations: allTransformations,
  };
}

