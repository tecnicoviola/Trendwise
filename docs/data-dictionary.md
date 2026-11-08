# TRENDWISE — Data Dictionary & Schema Specification

*Version 1.0 · 8 November 2026*

This document defines the strict data contracts and validation specifications for all CSV files ingested and exported by TRENDWISE. All schemas are enforced via Zod in `src/lib/csv/schemas.ts`.

---

## 1. `consumer_interest.csv` (Long Format)

Captures monthly aggregated Google Trends relative search interest for monitored trends.

| Column | Type | Validation Rules | Description & Example |
| --- | --- | --- | --- |
| `date` | String | Format `YYYY-MM`. Complete months only. | Month of observation. E.g. `2026-10`. |
| `trend_id` | String | Required. Alphanumeric. | Unique trend identifier. E.g. `T001`. |
| `trend_name` | String | Required. Must be consistent per `trend_id`. | Editorial trend name. E.g. `Butter Yellow`. |
| `category` | String | Required. Version 1 uses `Colour`. | Fashion domain. E.g. `Colour`. |
| `region` | String | Required. Exactly one region per file. | Geographic search scope. E.g. `India`. |
| `search_interest` | Number | Numeric float in range $[0, 100]$. | Relative interest index. E.g. `42.5`. |
| `source` | String | Required. | Origin name. E.g. `Google Trends`. |
| `source_url` | URL | Required. Starts with `http://` or `https://`. | Link to query. E.g. `https://trends.google.com`. |
| `collection_date` | String | Format `YYYY-MM-DD`. | Export capture date. E.g. `2026-11-08`. |
| `query_group` | String | Required. Series must share group for direct comparison. | Comparison group ID. E.g. `india-colours-5y-2026-11-08`. |
| `time_range` | String | Required. E.g. `2023-11 to 2026-10`. | Date span of query window. |
| `search_query` | String | Optional. Lowercase search term. | Query text. E.g. `butter yellow`. |
| `search_category` | String | Optional. Default `All categories`. | Google Trends topic category. |
| `granularity_source` | String | Optional. `weekly` or `monthly` (default `monthly`). | Original export frequency. |

---

## 2. `fashion_audit.csv` (Audit Snapshot)

Captures a cross-sectional point-in-time sample of fashion products from online retailers.

| Column | Type | Validation Rules | Description & Example |
| --- | --- | --- | --- |
| `audit_id` | String | Required. Globally unique within file. | Sample identifier. E.g. `AUDIT-001`. |
| `retailer` | String | Required. E.g. `Retailer A`. | Retail store name. Balanced across sample. |
| `product` | String | Required. | Product listing title. E.g. `Linen Relaxed Shirt`. |
| `product_url` | URL | Required. Globally unique within file. | Direct listing URL. E.g. `https://example.com/p1`. |
| `audit_date` | String | Format `YYYY-MM-DD`. Exactly one date per file. | Snapshot capture date. E.g. `2026-11-08`. |
| `product_category` | String | Required. Exactly one per file (`Women's Tops`). | Garment category. |
| `colour` | String | Required. Checked against controlled vocabulary. | Colour classification. E.g. `Butter Yellow`. |
| `fabric` | String | Required. Checked against controlled vocabulary. | Primary fabric. E.g. `Linen`. |
| `print` | String | Required. Checked against controlled vocabulary. | Pattern styling. E.g. `Solid`. |
| `silhouette` | String | Required. Checked against controlled vocabulary. | Garment cut. E.g. `Relaxed`. |
| `listing_source` | String | Required. Exactly one per file (`New Arrivals`). | Merchandising filter. |

---

## 3. Controlled Vocabularies

Values outside these lists produce import warnings, remain unmodified as typed by the researcher, and are aggregated under `"Other"` in visual charts:

- **Colour:** `Butter Yellow`, `Burgundy`, `Chocolate Brown`, `Powder Blue`, `Sage Green`, `White`, `Black`, `Cream`, `Navy`, `Pink`, `Olive Green`, `Other`
- **Fabric:** `Cotton`, `Linen`, `Satin`, `Knit`, `Crochet`, `Rayon`, `Denim`, `Other`
- **Print:** `Solid`, `Floral`, `Stripes`, `Checks`, `Polka Dots`, `Geometric`, `Other`
- **Silhouette:** `Fitted`, `Oversized`, `Relaxed`, `Cropped`, `Boxy`, `Other`

---

## 4. `trend_dictionary.csv` (Optional Mapping)

Maps trend identifiers to attributes in audit files.

| Column | Type | Description |
| --- | --- | --- |
| `trend_id` | String | Unique ID. E.g. `T001`. |
| `trend_name` | String | Trend name. E.g. `Butter Yellow`. |
| `category` | String | Domain. E.g. `Colour`. |
| `attribute_type` | String | Target audit column (e.g. `colour`). |
| `attribute_value` | String | Target value in audit (e.g. `Butter Yellow`). |
| `search_query` | String | Associated search term. |

