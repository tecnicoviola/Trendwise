import {
  ConsumerDataRow,
  FashionAuditRow,
  TrendDictionaryRow,
  ValidationIssue,
  ValidationResult,
} from "@/types/data";
import {
  CONTROLLED_VOCABULARY,
  DATE_YYYY_MM_REGEX,
  DATE_YYYY_MM_DD_REGEX,
} from "./schemas";

export function validateConsumerData(rows: any[]): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const info: ValidationIssue[] = [];

  if (!rows || rows.length === 0) {
    errors.push({
      type: "error",
      message: "The file is empty or contains no data rows.",
    });
    return { valid: false, errors, warnings, info, rowCount: 0 };
  }

  const requiredColumns = [
    "date",
    "trend_id",
    "trend_name",
    "category",
    "region",
    "search_interest",
    "source",
    "source_url",
    "collection_date",
    "query_group",
    "time_range",
  ];

  const firstRow = rows[0];
  const missingCols = requiredColumns.filter((col) => !(col in firstRow));
  if (missingCols.length > 0) {
    errors.push({
      type: "error",
      message: `Missing or misspelt required column(s): ${missingCols.join(", ")}`,
    });
    return { valid: false, errors, warnings, info, rowCount: rows.length };
  }

  const regionsSeen = new Set<string>();
  const queryGroupsSeen = new Set<string>();
  const trendIdToName = new Map<string, string>();
  const trendMonthKeys = new Set<string>();
  const trendMonthsMap = new Map<string, Set<string>>();

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-based, row 1 is header

    // Date
    if (!row.date || !DATE_YYYY_MM_REGEX.test(String(row.date).trim())) {
      errors.push({
        type: "error",
        row: rowNum,
        column: "date",
        message: `Row ${rowNum}: invalid date '${row.date}', expected YYYY-MM.`,
      });
    }

    // Collection Date
    if (!row.collection_date || !DATE_YYYY_MM_DD_REGEX.test(String(row.collection_date).trim())) {
      errors.push({
        type: "error",
        row: rowNum,
        column: "collection_date",
        message: `Row ${rowNum}: invalid collection_date '${row.collection_date}', expected YYYY-MM-DD.`,
      });
    }

    // Search Interest
    const searchVal = Number(row.search_interest);
    if (isNaN(searchVal) || searchVal < 0 || searchVal > 100) {
      errors.push({
        type: "error",
        row: rowNum,
        column: "search_interest",
        message: `Row ${rowNum}: search_interest '${row.search_interest}' must be a numeric value between 0 and 100.`,
      });
    }

    // Region
    if (row.region) {
      regionsSeen.add(String(row.region).trim());
    }

    // Query group
    if (row.query_group) {
      queryGroupsSeen.add(String(row.query_group).trim());
    }

    // Source URL
    if (row.source_url && !/^https?:\/\//i.test(String(row.source_url).trim())) {
      warnings.push({
        type: "warning",
        row: rowNum,
        column: "source_url",
        message: `Row ${rowNum}: source_url '${row.source_url}' should start with http:// or https://.`,
      });
    }

    // Trend ID / Trend Name consistency
    const tid = String(row.trend_id).trim();
    const tname = String(row.trend_name).trim();
    if (tid && tname) {
      if (trendIdToName.has(tid) && trendIdToName.get(tid) !== tname) {
        errors.push({
          type: "error",
          row: rowNum,
          column: "trend_name",
          message: `Row ${rowNum}: trend_id '${tid}' has conflicting names ('${trendIdToName.get(tid)}' vs '${tname}').`,
        });
      } else {
        trendIdToName.set(tid, tname);
      }

      // Duplicate trend + month
      const key = `${tid}|${row.date}`;
      if (trendMonthKeys.has(key)) {
        errors.push({
          type: "error",
          row: rowNum,
          column: "date",
          message: `Row ${rowNum}: duplicate entry for trend '${tid}' in month '${row.date}'.`,
        });
      } else {
        trendMonthKeys.add(key);
      }

      if (!trendMonthsMap.has(tid)) {
        trendMonthsMap.set(tid, new Set());
      }
      trendMonthsMap.get(tid)!.add(row.date);
    }
  });

  // Check more than one region
  if (regionsSeen.size > 1) {
    errors.push({
      type: "error",
      message: `Multiple regions found (${Array.from(regionsSeen).join(", ")}). Consumer data must contain exactly one region.`,
    });
  }

  // Warnings
  if (queryGroupsSeen.size > 1) {
    warnings.push({
      type: "warning",
      message: `Multiple query_group values found (${Array.from(queryGroupsSeen).join(", ")}). Series from different query groups cannot be directly compared.`,
    });
  }

  // Check trend months count
  trendMonthsMap.forEach((monthsSet, tid) => {
    const tname = trendIdToName.get(tid) || tid;
    if (monthsSet.size < 12) {
      warnings.push({
        type: "warning",
        message: `Trend '${tname}' (${tid}) has only ${monthsSet.size} months (fewer than 12 months minimum for trend regression).`,
      });
    } else if (monthsSet.size < 36) {
      warnings.push({
        type: "warning",
        message: `Trend '${tname}' (${tid}) has ${monthsSet.size} months (fewer than 36 recommended months).`,
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    rowCount: rows.length,
  };
}

export function validateFashionAudit(rows: any[]): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const info: ValidationIssue[] = [];

  if (!rows || rows.length === 0) {
    errors.push({
      type: "error",
      message: "The audit file is empty or contains no data rows.",
    });
    return { valid: false, errors, warnings, info, rowCount: 0 };
  }

  const requiredColumns = [
    "audit_id",
    "retailer",
    "product",
    "product_url",
    "audit_date",
    "product_category",
    "colour",
    "fabric",
    "print",
    "silhouette",
    "listing_source",
  ];

  const firstRow = rows[0];
  const missingCols = requiredColumns.filter((col) => !(col in firstRow));
  if (missingCols.length > 0) {
    errors.push({
      type: "error",
      message: `Missing or misspelt required column(s): ${missingCols.join(", ")}`,
    });
    return { valid: false, errors, warnings, info, rowCount: rows.length };
  }

  const auditDatesSeen = new Set<string>();
  const productCategoriesSeen = new Set<string>();
  const listingSourcesSeen = new Set<string>();
  const auditIdsSeen = new Set<string>();
  const productUrlsSeen = new Set<string>();
  const retailerCounts: Record<string, number> = {};

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;

    // audit_date
    if (!row.audit_date || !DATE_YYYY_MM_DD_REGEX.test(String(row.audit_date).trim())) {
      errors.push({
        type: "error",
        row: rowNum,
        column: "audit_date",
        message: `Row ${rowNum}: invalid audit_date '${row.audit_date}', expected YYYY-MM-DD.`,
      });
    } else {
      auditDatesSeen.add(String(row.audit_date).trim());
    }

    if (row.product_category) {
      productCategoriesSeen.add(String(row.product_category).trim());
    }
    if (row.listing_source) {
      listingSourcesSeen.add(String(row.listing_source).trim());
    }

    // Unique audit_id
    const aid = String(row.audit_id).trim();
    if (aid) {
      if (auditIdsSeen.has(aid)) {
        errors.push({
          type: "error",
          row: rowNum,
          column: "audit_id",
          message: `Row ${rowNum}: duplicate audit_id '${aid}'.`,
        });
      } else {
        auditIdsSeen.add(aid);
      }
    }

    // Unique product_url
    const purl = String(row.product_url).trim();
    if (purl) {
      if (productUrlsSeen.has(purl)) {
        errors.push({
          type: "error",
          row: rowNum,
          column: "product_url",
          message: `Row ${rowNum}: duplicate product_url '${purl}'.`,
        });
      } else {
        productUrlsSeen.add(purl);
      }
    }

    // Retailer count
    const ret = String(row.retailer).trim();
    if (ret) {
      retailerCounts[ret] = (retailerCounts[ret] || 0) + 1;
    }

    // Controlled vocabulary warnings
    const checkVocab = (val: string, vocab: readonly string[], field: string) => {
      const trimmed = String(val || "").trim();
      const match = vocab.some((v) => v.toLowerCase() === trimmed.toLowerCase());
      if (trimmed && !match) {
        warnings.push({
          type: "warning",
          row: rowNum,
          column: field,
          message: `Row ${rowNum}: value '${trimmed}' for ${field} is outside controlled list (will be grouped under Other in charts).`,
        });
      }
    };

    checkVocab(row.colour, CONTROLLED_VOCABULARY.colour, "colour");
    checkVocab(row.fabric, CONTROLLED_VOCABULARY.fabric, "fabric");
    checkVocab(row.print, CONTROLLED_VOCABULARY.print, "print");
    checkVocab(row.silhouette, CONTROLLED_VOCABULARY.silhouette, "silhouette");
  });

  // Exactly one audit_date, product_category, listing_source per file
  if (auditDatesSeen.size > 1) {
    errors.push({
      type: "error",
      message: `Multiple audit_date values found (${Array.from(auditDatesSeen).join(", ")}). Exactly one audit date is allowed per snapshot.`,
    });
  }
  if (productCategoriesSeen.size > 1) {
    errors.push({
      type: "error",
      message: `Multiple product_category values found (${Array.from(productCategoriesSeen).join(", ")}). Exactly one category is allowed per audit snapshot.`,
    });
  }
  if (listingSourcesSeen.size > 1) {
    errors.push({
      type: "error",
      message: `Multiple listing_source values found (${Array.from(listingSourcesSeen).join(", ")}). Exactly one listing source is allowed per audit file.`,
    });
  }

  // Retailer sample size balance check (differing by more than 3)
  const sizes = Object.values(retailerCounts);
  if (sizes.length > 1) {
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    if (maxSize - minSize > 3) {
      warnings.push({
        type: "warning",
        message: `Retailer sample sizes differ by more than 3 products (range: ${minSize} to ${maxSize}). Balanced sampling (e.g. 17/17/16) is recommended.`,
      });
    }
  }

  // Info: audit size not 50
  if (rows.length !== 50) {
    info.push({
      type: "info",
      message: `Audit file contains ${rows.length} products (the default prototype specification uses n = 50). The app works with any size and always shows n.`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    rowCount: rows.length,
  };
}

