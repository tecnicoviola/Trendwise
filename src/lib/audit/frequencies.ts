import { FashionAuditRow } from "@/types/data";
import { calculateWilsonInterval, WilsonScoreResult } from "../stats/wilson";

export interface AttributeBreakdown {
  category: "fabric" | "print" | "silhouette";
  counts: Record<string, number>;
  total: number;
}

export interface RetailerAuditStats {
  retailer: string;
  totalSampled: number;
  observedCount: number;
  frequency: number;
}

export interface TrendAuditAnalysis {
  trendId: string;
  trendName: string;
  mappedColour: string;
  k: number; // total observed count for this colour
  n: number; // total sample size across all retailers
  frequency: number; // k / n * 100
  wilson: WilsonScoreResult;
  retailerCoverageCount: number; // retailers with k >= 1
  totalRetailers: number;
  retailerStats: RetailerAuditStats[];
  fabricDistribution: Record<string, number>;
  printDistribution: Record<string, number>;
  silhouetteDistribution: Record<string, number>;
  products: FashionAuditRow[];
}

export interface AuditOverviewSummary {
  auditDate: string;
  productCategory: string;
  listingSource: string;
  totalProducts: number;
  retailers: string[];
  retailerSampleSizes: Record<string, number>;
  colourDistribution: Record<string, number>;
  fabricDistribution: Record<string, number>;
  printDistribution: Record<string, number>;
  silhouetteDistribution: Record<string, number>;
}

/**
 * Calculates attribute frequencies and distributions across all audit products.
 */
export function calculateAuditOverview(rows: FashionAuditRow[]): AuditOverviewSummary {
  const totalProducts = rows.length;
  if (totalProducts === 0) {
    return {
      auditDate: "",
      productCategory: "",
      listingSource: "",
      totalProducts: 0,
      retailers: [],
      retailerSampleSizes: {},
      colourDistribution: {},
      fabricDistribution: {},
      printDistribution: {},
      silhouetteDistribution: {},
    };
  }

  const auditDate = rows[0].audit_date;
  const productCategory = rows[0].product_category;
  const listingSource = rows[0].listing_source;

  const retailerSampleSizes: Record<string, number> = {};
  const colourDistribution: Record<string, number> = {};
  const fabricDistribution: Record<string, number> = {};
  const printDistribution: Record<string, number> = {};
  const silhouetteDistribution: Record<string, number> = {};

  for (const row of rows) {
    retailerSampleSizes[row.retailer] = (retailerSampleSizes[row.retailer] || 0) + 1;
    colourDistribution[row.colour] = (colourDistribution[row.colour] || 0) + 1;
    fabricDistribution[row.fabric] = (fabricDistribution[row.fabric] || 0) + 1;
    printDistribution[row.print] = (printDistribution[row.print] || 0) + 1;
    silhouetteDistribution[row.silhouette] = (silhouetteDistribution[row.silhouette] || 0) + 1;
  }

  const retailers = Object.keys(retailerSampleSizes).sort();

  return {
    auditDate,
    productCategory,
    listingSource,
    totalProducts,
    retailers,
    retailerSampleSizes,
    colourDistribution,
    fabricDistribution,
    printDistribution,
    silhouetteDistribution,
  };
}

/**
 * Computes frequency and breakdown for a specific trend colour across the audited products.
 */
export function analyzeTrendAudit(
  trendId: string,
  trendName: string,
  targetColour: string,
  auditRows: FashionAuditRow[]
): TrendAuditAnalysis {
  const n = auditRows.length;
  const matchingRows = auditRows.filter(
    (row) => row.colour.trim().toLowerCase() === targetColour.trim().toLowerCase()
  );
  const k = matchingRows.length;
  const frequency = n > 0 ? (k / n) * 100 : 0;
  const wilson = calculateWilsonInterval(k, n);

  // Group by retailer
  const allRetailersMap: Record<string, { total: number; observed: number }> = {};
  for (const row of auditRows) {
    if (!allRetailersMap[row.retailer]) {
      allRetailersMap[row.retailer] = { total: 0, observed: 0 };
    }
    allRetailersMap[row.retailer].total += 1;
  }

  for (const match of matchingRows) {
    if (allRetailersMap[match.retailer]) {
      allRetailersMap[match.retailer].observed += 1;
    }
  }

  const retailerNames = Object.keys(allRetailersMap).sort();
  const retailerStats: RetailerAuditStats[] = retailerNames.map((retailer) => {
    const data = allRetailersMap[retailer];
    return {
      retailer,
      totalSampled: data.total,
      observedCount: data.observed,
      frequency: data.total > 0 ? (data.observed / data.total) * 100 : 0,
    };
  });

  const retailerCoverageCount = retailerStats.filter((r) => r.observedCount >= 1).length;

  // Breakdown of attributes for products with this colour
  const fabricDistribution: Record<string, number> = {};
  const printDistribution: Record<string, number> = {};
  const silhouetteDistribution: Record<string, number> = {};

  for (const match of matchingRows) {
    fabricDistribution[match.fabric] = (fabricDistribution[match.fabric] || 0) + 1;
    printDistribution[match.print] = (printDistribution[match.print] || 0) + 1;
    silhouetteDistribution[match.silhouette] = (silhouetteDistribution[match.silhouette] || 0) + 1;
  }

  return {
    trendId,
    trendName,
    mappedColour: targetColour,
    k,
    n,
    frequency,
    wilson,
    retailerCoverageCount,
    totalRetailers: retailerNames.length,
    retailerStats,
    fabricDistribution,
    printDistribution,
    silhouetteDistribution,
    products: matchingRows,
  };
}

