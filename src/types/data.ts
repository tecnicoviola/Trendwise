export type Direction = "Increasing" | "Stable" | "Decreasing" | "No signal";
export type FitStrength = "weak" | "moderate" | "strong";
export type RetailVisibility = "Visible" | "Low";

export type SignalAlignmentKey =
  | "aligned_rise"
  | "emerging_signal"
  | "established"
  | "quiet"
  | "fading_interest"
  | "aligned_decline"
  | "insufficient_signal";

export interface SignalAlignmentResult {
  key: SignalAlignmentKey;
  label: string;
  description: string;
  standardSentence: string;
  searchDirection: Direction;
  retailVisibility: RetailVisibility;
}

export interface ConsumerDataRow {
  date: string; // YYYY-MM
  trend_id: string;
  trend_name: string;
  category: string;
  region: string;
  search_interest: number;
  source: string;
  source_url: string;
  collection_date: string; // YYYY-MM-DD
  query_group: string;
  time_range: string;
  search_query?: string;
  search_category?: string;
  granularity_source?: "weekly" | "monthly";
}

export interface FashionAuditRow {
  audit_id: string;
  retailer: string;
  product: string;
  product_url: string;
  audit_date: string;
  product_category: string;
  colour: string;
  fabric: string;
  print: string;
  silhouette: string;
  listing_source: string;
}

export interface TrendDictionaryRow {
  trend_id: string;
  trend_name: string;
  category: string;
  attribute_type: string;
  attribute_value: string;
  search_query?: string;
}

export interface ValidationIssue {
  type: "error" | "warning" | "info";
  row?: number;
  column?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
  rowCount: number;
}

