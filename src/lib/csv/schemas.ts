import { z } from "zod";

export const CONTROLLED_VOCABULARY = {
  colour: [
    "Butter Yellow",
    "Burgundy",
    "Chocolate Brown",
    "Powder Blue",
    "Sage Green",
    "White",
    "Black",
    "Cream",
    "Navy",
    "Pink",
    "Olive Green",
    "Other",
  ],
  fabric: [
    "Cotton",
    "Linen",
    "Satin",
    "Knit",
    "Crochet",
    "Rayon",
    "Denim",
    "Other",
  ],
  print: [
    "Solid",
    "Floral",
    "Stripes",
    "Checks",
    "Polka Dots",
    "Geometric",
    "Other",
  ],
  silhouette: [
    "Fitted",
    "Oversized",
    "Relaxed",
    "Cropped",
    "Boxy",
    "Other",
  ],
} as const;

export const DEFAULT_TREND_DICTIONARY = [
  {
    trend_id: "T001",
    trend_name: "Butter Yellow",
    category: "Colour",
    attribute_type: "colour",
    attribute_value: "Butter Yellow",
    search_query: "butter yellow",
  },
  {
    trend_id: "T002",
    trend_name: "Burgundy",
    category: "Colour",
    attribute_type: "colour",
    attribute_value: "Burgundy",
    search_query: "burgundy",
  },
  {
    trend_id: "T003",
    trend_name: "Chocolate Brown",
    category: "Colour",
    attribute_type: "colour",
    attribute_value: "Chocolate Brown",
    search_query: "chocolate brown",
  },
  {
    trend_id: "T004",
    trend_name: "Powder Blue",
    category: "Colour",
    attribute_type: "colour",
    attribute_value: "Powder Blue",
    search_query: "powder blue",
  },
  {
    trend_id: "T005",
    trend_name: "Sage Green",
    category: "Colour",
    attribute_type: "colour",
    attribute_value: "Sage Green",
    search_query: "sage green",
  },
];

// Regex for YYYY-MM
export const DATE_YYYY_MM_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])$/;
// Regex for YYYY-MM-DD
export const DATE_YYYY_MM_DD_REGEX = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

export const ConsumerDataRowSchema = z.object({
  date: z.string().regex(DATE_YYYY_MM_REGEX, "date must be in YYYY-MM format"),
  trend_id: z.string().min(1, "trend_id is required"),
  trend_name: z.string().min(1, "trend_name is required"),
  category: z.string().min(1, "category is required"),
  region: z.string().min(1, "region is required"),
  search_interest: z
    .coerce
    .number()
    .min(0, "search_interest must be between 0 and 100")
    .max(100, "search_interest must be between 0 and 100"),
  source: z.string().min(1, "source is required"),
  source_url: z.string().regex(/^https?:\/\//i, "source_url must start with http:// or https://"),
  collection_date: z.string().regex(DATE_YYYY_MM_DD_REGEX, "collection_date must be in YYYY-MM-DD format"),
  query_group: z.string().min(1, "query_group is required"),
  time_range: z.string().min(1, "time_range is required"),
  search_query: z.string().optional(),
  search_category: z.string().optional(),
  granularity_source: z.enum(["weekly", "monthly"]).default("monthly"),
});

export const FashionAuditRowSchema = z.object({
  audit_id: z.string().min(1, "audit_id is required"),
  retailer: z.string().min(1, "retailer is required"),
  product: z.string().min(1, "product is required"),
  product_url: z.string().min(1, "product_url is required"),
  audit_date: z.string().regex(DATE_YYYY_MM_DD_REGEX, "audit_date must be in YYYY-MM-DD format"),
  product_category: z.string().min(1, "product_category is required"),
  colour: z.string().min(1, "colour is required"),
  fabric: z.string().min(1, "fabric is required"),
  print: z.string().min(1, "print is required"),
  silhouette: z.string().min(1, "silhouette is required"),
  listing_source: z.string().min(1, "listing_source is required"),
});

export const TrendDictionaryRowSchema = z.object({
  trend_id: z.string().min(1, "trend_id is required"),
  trend_name: z.string().min(1, "trend_name is required"),
  category: z.string().min(1, "category is required"),
  attribute_type: z.string().min(1, "attribute_type is required"),
  attribute_value: z.string().min(1, "attribute_value is required"),
  search_query: z.string().optional(),
});

