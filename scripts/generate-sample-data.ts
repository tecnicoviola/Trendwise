import fs from "fs";
import path from "path";

// PRNG: mulberry32
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(2026);

// Box-Muller normal distribution generator
function boxMuller(mean = 0, sigma = 2.5): number {
  let u1 = rng();
  let u2 = rng();
  // Ensure non-zero
  while (u1 === 0) u1 = rng();
  while (u2 === 0) u2 = rng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * sigma;
}

interface TrendParam {
  id: string;
  name: string;
  base: number;
  slope: number;
  A: number;
  peak: number;
}

const TRENDS: TrendParam[] = [
  { id: "T001", name: "Butter Yellow", base: 12, slope: 1.5, A: 5, peak: 6 },
  { id: "T002", name: "Burgundy", base: 40, slope: 0.15, A: 16, peak: 11 },
  { id: "T003", name: "Chocolate Brown", base: 22, slope: 0.9, A: 9, peak: 10 },
  { id: "T004", name: "Powder Blue", base: 62, slope: -0.8, A: 10, peak: 7 },
  { id: "T005", name: "Sage Green", base: 38, slope: 0.05, A: 6, peak: 6 },
];

// Months: Nov 2023 ... Oct 2026 (36 months)
function get36Months(): { t: number; dateStr: string; m: number }[] {
  const list: { t: number; dateStr: string; m: number }[] = [];
  let y = 2023;
  let m = 11; // November
  for (let t = 1; t <= 36; t++) {
    const mm = String(m).padStart(2, "0");
    list.push({ t, dateStr: `${y}-${mm}`, m });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return list;
}

function generate() {
  const months = get36Months();

  // First pass: compute raw values for all trends and find maximum raw value
  const rawData: {
    trend: TrendParam;
    month: { t: number; dateStr: string; m: number };
    rawVal: number;
  }[] = [];

  let maxRaw = -Infinity;

  for (const trend of TRENDS) {
    for (const month of months) {
      const { t, m } = month;
      const noise = boxMuller(0, 2.5);
      const seasonal = trend.A * Math.cos((2 * Math.PI * (m - trend.peak)) / 12);
      const raw = trend.base + trend.slope * t + seasonal + noise;
      if (raw > maxRaw) {
        maxRaw = raw;
      }
      rawData.push({
        trend,
        month,
        rawVal: raw,
      });
    }
  }

  // Second pass: scale by 100 / maxRaw, clip to 0-100, round to 1 decimal
  const scale = 100 / maxRaw;
  const consumerRows: string[] = [
    "date,trend_id,trend_name,category,region,search_interest,source,source_url,collection_date,query_group,time_range,search_query,search_category,granularity_source",
  ];

  for (const item of rawData) {
    const scaled = Math.min(100, Math.max(0, item.rawVal * scale));
    const rounded = Math.round(scaled * 10) / 10;

    const row = [
      item.month.dateStr,
      item.trend.id,
      item.trend.name,
      "Colour",
      "India",
      rounded.toFixed(1),
      "Synthetic demonstration",
      "https://example.com/synthetic",
      "2026-11-08",
      "synthetic-india-colours",
      "2023-11 to 2026-10",
      item.trend.name.toLowerCase(),
      "All categories",
      "monthly",
    ].join(",");

    consumerRows.push(row);
  }

  const outDir = path.resolve(process.cwd(), "public/sample-data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outDir, "consumer_interest_SYNTHETIC.csv"),
    consumerRows.join("\n"),
    "utf-8"
  );
  console.log(`Generated consumer_interest_SYNTHETIC.csv (${consumerRows.length - 1} rows)`);

  // Generate trend_dictionary.csv
  const dictRows = [
    "trend_id,trend_name,category,attribute_type,attribute_value,search_query",
    "T001,Butter Yellow,Colour,colour,Butter Yellow,butter yellow",
    "T002,Burgundy,Colour,colour,Burgundy,burgundy",
    "T003,Chocolate Brown,Colour,colour,Chocolate Brown,chocolate brown",
    "T004,Powder Blue,Colour,colour,Powder Blue,powder blue",
    "T005,Sage Green,Colour,colour,Sage Green,sage green",
  ];

  fs.writeFileSync(
    path.join(outDir, "trend_dictionary.csv"),
    dictRows.join("\n"),
    "utf-8"
  );
  console.log("Generated trend_dictionary.csv");

  // Also create templates in public/templates/
  const templatesDir = path.resolve(process.cwd(), "public/templates");
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // Consumer template
  const consumerTemplate = [
    "date,trend_id,trend_name,category,region,search_interest,source,source_url,collection_date,query_group,time_range,search_query,search_category,granularity_source",
    "2026-10,T001,Butter Yellow,Colour,India,42.5,Google Trends,https://trends.google.com,2026-11-08,india-colours-5y-2026-11-08,2023-11 to 2026-10,butter yellow,All categories,monthly",
  ].join("\n");
  fs.writeFileSync(path.join(templatesDir, "consumer_interest_template.csv"), consumerTemplate, "utf-8");

  // Audit template
  const auditTemplate = [
    "audit_id,retailer,product,product_url,audit_date,product_category,colour,fabric,print,silhouette,listing_source",
    "AUDIT-001,Retailer A,Linen Relaxed Shirt,https://example.com/product/1,2026-11-08,Women's Tops,Butter Yellow,Linen,Solid,Relaxed,New Arrivals",
  ].join("\n");
  fs.writeFileSync(path.join(templatesDir, "fashion_audit_template.csv"), auditTemplate, "utf-8");

  // Trend dictionary template
  const dictTemplate = [
    "trend_id,trend_name,category,attribute_type,attribute_value,search_query",
    "T001,Butter Yellow,Colour,colour,Butter Yellow,butter yellow",
  ].join("\n");
  fs.writeFileSync(path.join(templatesDir, "trend_dictionary_template.csv"), dictTemplate, "utf-8");
  console.log("Generated templates in public/templates");
}

generate();
