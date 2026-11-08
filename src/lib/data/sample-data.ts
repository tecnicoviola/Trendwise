import { parseCSV } from "../csv/parse";
import { ConsumerDataRow, FashionAuditRow, TrendDictionaryRow } from "@/types/data";

// Sample CSV contents are embedded directly to ensure 100% offline reliability and static export compatibility
export const SYNTHETIC_CONSUMER_CSV = `date,trend_id,trend_name,category,region,search_interest,source,source_url,collection_date,query_group,time_range,search_query,search_category,granularity_source
2023-11,T001,Butter Yellow,Colour,India,16.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2023-12,T001,Butter Yellow,Colour,India,13.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-01,T001,Butter Yellow,Colour,India,18.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-02,T001,Butter Yellow,Colour,India,18.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-03,T001,Butter Yellow,Colour,India,19.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-04,T001,Butter Yellow,Colour,India,24.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-05,T001,Butter Yellow,Colour,India,24.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-06,T001,Butter Yellow,Colour,India,29.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-07,T001,Butter Yellow,Colour,India,29.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-08,T001,Butter Yellow,Colour,India,27.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-09,T001,Butter Yellow,Colour,India,26.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-10,T001,Butter Yellow,Colour,India,30.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-11,T001,Butter Yellow,Colour,India,31.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2024-12,T001,Butter Yellow,Colour,India,33.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-01,T001,Butter Yellow,Colour,India,35.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-02,T001,Butter Yellow,Colour,India,36.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-03,T001,Butter Yellow,Colour,India,40.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-04,T001,Butter Yellow,Colour,India,44.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-05,T001,Butter Yellow,Colour,India,48.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-06,T001,Butter Yellow,Colour,India,50.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-07,T001,Butter Yellow,Colour,India,48.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-08,T001,Butter Yellow,Colour,India,45.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-09,T001,Butter Yellow,Colour,India,44.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-10,T001,Butter Yellow,Colour,India,48.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-11,T001,Butter Yellow,Colour,India,47.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2025-12,T001,Butter Yellow,Colour,India,48.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2026-01,T001,Butter Yellow,Colour,India,52.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2026-02,T001,Butter Yellow,Colour,India,52.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2026-03,T001,Butter Yellow,Colour,India,59.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2026-04,T001,Butter Yellow,Colour,India,62.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2026-05,T001,Butter Yellow,Colour,India,65.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2026-06,T001,Butter Yellow,Colour,India,68.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2026-07,T001,Butter Yellow,Colour,India,66.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2026-08,T001,Butter Yellow,Colour,India,63.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2026-09,T001,Butter Yellow,Colour,India,62.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2026-10,T001,Butter Yellow,Colour,India,67.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,butter yellow,All categories,monthly
2023-11,T002,Burgundy,Colour,India,70.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2023-12,T002,Burgundy,Colour,India,68.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-01,T002,Burgundy,Colour,India,60.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-02,T002,Burgundy,Colour,India,47.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-03,T002,Burgundy,Colour,India,41.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-04,T002,Burgundy,Colour,India,32.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-05,T002,Burgundy,Colour,India,31.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-06,T002,Burgundy,Colour,India,32.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-07,T002,Burgundy,Colour,India,39.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-08,T002,Burgundy,Colour,India,43.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-09,T002,Burgundy,Colour,India,59.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-10,T002,Burgundy,Colour,India,68.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-11,T002,Burgundy,Colour,India,72.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2024-12,T002,Burgundy,Colour,India,69.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-01,T002,Burgundy,Colour,India,62.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-02,T002,Burgundy,Colour,India,50.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-03,T002,Burgundy,Colour,India,43.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-04,T002,Burgundy,Colour,India,35.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-05,T002,Burgundy,Colour,India,33.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-06,T002,Burgundy,Colour,India,34.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-07,T002,Burgundy,Colour,India,42.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-08,T002,Burgundy,Colour,India,46.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-09,T002,Burgundy,Colour,India,62.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-10,T002,Burgundy,Colour,India,71.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-11,T002,Burgundy,Colour,India,75.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2025-12,T002,Burgundy,Colour,India,72.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2026-01,T002,Burgundy,Colour,India,64.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2026-02,T002,Burgundy,Colour,India,53.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2026-03,T002,Burgundy,Colour,India,46.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2026-04,T002,Burgundy,Colour,India,38.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2026-05,T002,Burgundy,Colour,India,35.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2026-06,T002,Burgundy,Colour,India,37.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2026-07,T002,Burgundy,Colour,India,45.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2026-08,T002,Burgundy,Colour,India,48.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2026-09,T002,Burgundy,Colour,India,65.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2026-10,T002,Burgundy,Colour,India,74.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,burgundy,All categories,monthly
2023-11,T003,Chocolate Brown,Colour,India,39.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2023-12,T003,Chocolate Brown,Colour,India,37.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-01,T003,Chocolate Brown,Colour,India,33.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-02,T003,Chocolate Brown,Colour,India,28.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-03,T003,Chocolate Brown,Colour,India,24.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-04,T003,Chocolate Brown,Colour,India,20.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-05,T003,Chocolate Brown,Colour,India,21.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-06,T003,Chocolate Brown,Colour,India,24.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-07,T003,Chocolate Brown,Colour,India,28.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-08,T003,Chocolate Brown,Colour,India,34.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-09,T003,Chocolate Brown,Colour,India,42.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-10,T003,Chocolate Brown,Colour,India,49.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-11,T003,Chocolate Brown,Colour,India,48.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2024-12,T003,Chocolate Brown,Colour,India,46.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-01,T003,Chocolate Brown,Colour,India,42.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-02,T003,Chocolate Brown,Colour,India,37.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-03,T003,Chocolate Brown,Colour,India,33.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-04,T003,Chocolate Brown,Colour,India,29.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-05,T003,Chocolate Brown,Colour,India,30.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-06,T003,Chocolate Brown,Colour,India,32.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-07,T003,Chocolate Brown,Colour,India,37.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-08,T003,Chocolate Brown,Colour,India,43.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-09,T003,Chocolate Brown,Colour,India,51.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-10,T003,Chocolate Brown,Colour,India,58.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-11,T003,Chocolate Brown,Colour,India,57.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2025-12,T003,Chocolate Brown,Colour,India,55.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2026-01,T003,Chocolate Brown,Colour,India,50.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2026-02,T003,Chocolate Brown,Colour,India,46.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2026-03,T003,Chocolate Brown,Colour,India,41.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2026-04,T003,Chocolate Brown,Colour,India,38.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2026-05,T003,Chocolate Brown,Colour,India,39.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2026-06,T003,Chocolate Brown,Colour,India,41.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2026-07,T003,Chocolate Brown,Colour,India,46.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2026-08,T003,Chocolate Brown,Colour,India,52.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2026-09,T003,Chocolate Brown,Colour,India,59.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2026-10,T003,Chocolate Brown,Colour,India,67.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,chocolate brown,All categories,monthly
2023-11,T004,Powder Blue,Colour,India,64.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2023-12,T004,Powder Blue,Colour,India,60.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-01,T004,Powder Blue,Colour,India,56.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-02,T004,Powder Blue,Colour,India,58.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-03,T004,Powder Blue,Colour,India,62.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-04,T004,Powder Blue,Colour,India,67.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-05,T004,Powder Blue,Colour,India,73.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-06,T004,Powder Blue,Colour,India,76.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-07,T004,Powder Blue,Colour,India,77.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-08,T004,Powder Blue,Colour,India,75.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-09,T004,Powder Blue,Colour,India,70.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-10,T004,Powder Blue,Colour,India,64.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-11,T004,Powder Blue,Colour,India,55.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2024-12,T004,Powder Blue,Colour,India,51.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-01,T004,Powder Blue,Colour,India,48.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-02,T004,Powder Blue,Colour,India,49.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-03,T004,Powder Blue,Colour,India,54.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-04,T004,Powder Blue,Colour,India,59.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-05,T004,Powder Blue,Colour,India,64.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-06,T004,Powder Blue,Colour,India,68.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-07,T004,Powder Blue,Colour,India,69.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-08,T004,Powder Blue,Colour,India,67.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-09,T004,Powder Blue,Colour,India,62.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-10,T004,Powder Blue,Colour,India,56.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-11,T004,Powder Blue,Colour,India,47.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2025-12,T004,Powder Blue,Colour,India,43.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2026-01,T004,Powder Blue,Colour,India,39.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2026-02,T004,Powder Blue,Colour,India,41.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2026-03,T004,Powder Blue,Colour,India,46.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2026-04,T004,Powder Blue,Colour,India,51.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2026-05,T004,Powder Blue,Colour,India,56.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2026-06,T004,Powder Blue,Colour,India,59.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2026-07,T004,Powder Blue,Colour,India,61.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2026-08,T004,Powder Blue,Colour,India,58.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2026-09,T004,Powder Blue,Colour,India,54.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2026-10,T004,Powder Blue,Colour,India,48.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,powder blue,All categories,monthly
2023-11,T005,Sage Green,Colour,India,41.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2023-12,T005,Sage Green,Colour,India,39.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-01,T005,Sage Green,Colour,India,37.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-02,T005,Sage Green,Colour,India,40.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-03,T005,Sage Green,Colour,India,43.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-04,T005,Sage Green,Colour,India,47.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-05,T005,Sage Green,Colour,India,50.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-06,T005,Sage Green,Colour,India,51.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-07,T005,Sage Green,Colour,India,50.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-08,T005,Sage Green,Colour,India,48.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-09,T005,Sage Green,Colour,India,44.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-10,T005,Sage Green,Colour,India,42.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-11,T005,Sage Green,Colour,India,42.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2024-12,T005,Sage Green,Colour,India,39.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-01,T005,Sage Green,Colour,India,38.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-02,T005,Sage Green,Colour,India,40.8,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-03,T005,Sage Green,Colour,India,44.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-04,T005,Sage Green,Colour,India,48.5,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-05,T005,Sage Green,Colour,India,51.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-06,T005,Sage Green,Colour,India,52.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-07,T005,Sage Green,Colour,India,51.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-08,T005,Sage Green,Colour,India,48.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-09,T005,Sage Green,Colour,India,45.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-10,T005,Sage Green,Colour,India,42.6,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-11,T005,Sage Green,Colour,India,43.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2025-12,T005,Sage Green,Colour,India,40.3,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2026-01,T005,Sage Green,Colour,India,39.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2026-02,T005,Sage Green,Colour,India,41.4,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2026-03,T005,Sage Green,Colour,India,44.9,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2026-04,T005,Sage Green,Colour,India,49.1,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2026-05,T005,Sage Green,Colour,India,52.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2026-06,T005,Sage Green,Colour,India,53.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2026-07,T005,Sage Green,Colour,India,52.0,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2026-08,T005,Sage Green,Colour,India,49.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2026-09,T005,Sage Green,Colour,India,45.7,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly
2026-10,T005,Sage Green,Colour,India,43.2,Synthetic demonstration,https://example.com/synthetic,2026-11-08,synthetic-india-colours,2023-11 to 2026-10,sage green,All categories,monthly`;

export const SYNTHETIC_AUDIT_CSV = `audit_id,retailer,product,product_url,audit_date,product_category,colour,fabric,print,silhouette,listing_source
A001,Retailer A (SYNTHETIC),Butter Yellow Linen Shirt,https://example.com/synthetic/a-01,2026-11-08,Women's Tops,Butter Yellow,Linen,Solid,Relaxed,New Arrivals
A002,Retailer A (SYNTHETIC),Butter Yellow Ribbed Knit Top,https://example.com/synthetic/a-02,2026-11-08,Women's Tops,Butter Yellow,Knit,Solid,Fitted,New Arrivals
A003,Retailer A (SYNTHETIC),Butter Yellow Satin Blouse,https://example.com/synthetic/a-03,2026-11-08,Women's Tops,Butter Yellow,Satin,Solid,Relaxed,New Arrivals
A004,Retailer A (SYNTHETIC),Burgundy Crop Top,https://example.com/synthetic/a-04,2026-11-08,Women's Tops,Burgundy,Cotton,Solid,Cropped,New Arrivals
A005,Retailer A (SYNTHETIC),Burgundy Floral Satin Top,https://example.com/synthetic/a-05,2026-11-08,Women's Tops,Burgundy,Satin,Floral,Fitted,New Arrivals
A006,Retailer A (SYNTHETIC),Chocolate Brown Boxy Tee,https://example.com/synthetic/a-06,2026-11-08,Women's Tops,Chocolate Brown,Cotton,Solid,Boxy,New Arrivals
A007,Retailer A (SYNTHETIC),Chocolate Brown Oversized Shirt,https://example.com/synthetic/a-07,2026-11-08,Women's Tops,Chocolate Brown,Linen,Solid,Oversized,New Arrivals
A008,Retailer A (SYNTHETIC),Chocolate Brown Knit Vest,https://example.com/synthetic/a-08,2026-11-08,Women's Tops,Chocolate Brown,Knit,Solid,Relaxed,New Arrivals
A009,Retailer A (SYNTHETIC),Powder Blue Floral Blouse,https://example.com/synthetic/a-09,2026-11-08,Women's Tops,Powder Blue,Rayon,Floral,Relaxed,New Arrivals
A010,Retailer A (SYNTHETIC),Powder Blue Cotton Tee,https://example.com/synthetic/a-10,2026-11-08,Women's Tops,Powder Blue,Cotton,Solid,Fitted,New Arrivals
A011,Retailer A (SYNTHETIC),Powder Blue Striped Shirt,https://example.com/synthetic/a-11,2026-11-08,Women's Tops,Powder Blue,Cotton,Stripes,Oversized,New Arrivals
A012,Retailer A (SYNTHETIC),Sage Green Linen Top,https://example.com/synthetic/a-12,2026-11-08,Women's Tops,Sage Green,Linen,Solid,Relaxed,New Arrivals
A013,Retailer A (SYNTHETIC),Sage Green Crochet Camisole,https://example.com/synthetic/a-13,2026-11-08,Women's Tops,Sage Green,Crochet,Solid,Cropped,New Arrivals
A014,Retailer A (SYNTHETIC),Classic White Cotton Shirt,https://example.com/synthetic/a-14,2026-11-08,Women's Tops,White,Cotton,Solid,Boxy,New Arrivals
A015,Retailer A (SYNTHETIC),Black Ribbed Tank,https://example.com/synthetic/a-15,2026-11-08,Women's Tops,Black,Cotton,Solid,Fitted,New Arrivals
A016,Retailer A (SYNTHETIC),Cream Silk Blend Shirt,https://example.com/synthetic/a-16,2026-11-08,Women's Tops,Cream,Satin,Solid,Relaxed,New Arrivals
A017,Retailer A (SYNTHETIC),Navy Nautical Striped Tee,https://example.com/synthetic/a-17,2026-11-08,Women's Tops,Navy,Cotton,Stripes,Relaxed,New Arrivals
B001,Retailer B (SYNTHETIC),Butter Yellow Cotton Tee,https://example.com/synthetic/b-01,2026-11-08,Women's Tops,Butter Yellow,Cotton,Solid,Relaxed,New Arrivals
B002,Retailer B (SYNTHETIC),Butter Yellow Floral Peplum Top,https://example.com/synthetic/b-02,2026-11-08,Women's Tops,Butter Yellow,Rayon,Floral,Fitted,New Arrivals
B003,Retailer B (SYNTHETIC),Butter Yellow Oversized Shirt,https://example.com/synthetic/b-03,2026-11-08,Women's Tops,Butter Yellow,Linen,Solid,Oversized,New Arrivals
B004,Retailer B (SYNTHETIC),Burgundy Velvet-Touch Knit,https://example.com/synthetic/b-04,2026-11-08,Women's Tops,Burgundy,Knit,Solid,Fitted,New Arrivals
B005,Retailer B (SYNTHETIC),Burgundy Satin Cami,https://example.com/synthetic/b-05,2026-11-08,Women's Tops,Burgundy,Satin,Solid,Cropped,New Arrivals
B006,Retailer B (SYNTHETIC),Burgundy Polka Dot Blouse,https://example.com/synthetic/b-06,2026-11-08,Women's Tops,Burgundy,Rayon,Polka Dots,Relaxed,New Arrivals
B007,Retailer B (SYNTHETIC),Chocolate Brown Ribbed Top,https://example.com/synthetic/b-07,2026-11-08,Women's Tops,Chocolate Brown,Knit,Solid,Fitted,New Arrivals
B008,Retailer B (SYNTHETIC),Chocolate Brown Satin Halter,https://example.com/synthetic/b-08,2026-11-08,Women's Tops,Chocolate Brown,Satin,Solid,Cropped,New Arrivals
B009,Retailer B (SYNTHETIC),Sage Green Fitted Tee,https://example.com/synthetic/b-09,2026-11-08,Women's Tops,Sage Green,Cotton,Solid,Fitted,New Arrivals
B010,Retailer B (SYNTHETIC),Sage Green Oversized Cotton Shirt,https://example.com/synthetic/b-10,2026-11-08,Women's Tops,Sage Green,Cotton,Solid,Oversized,New Arrivals
B011,Retailer B (SYNTHETIC),White Poplin Wrap Top,https://example.com/synthetic/b-11,2026-11-08,Women's Tops,White,Cotton,Solid,Fitted,New Arrivals
B012,Retailer B (SYNTHETIC),White Crochet Lace Top,https://example.com/synthetic/b-12,2026-11-08,Women's Tops,White,Crochet,Floral,Relaxed,New Arrivals
B013,Retailer B (SYNTHETIC),Black Satin Camisole,https://example.com/synthetic/b-13,2026-11-08,Women's Tops,Black,Satin,Solid,Cropped,New Arrivals
B014,Retailer B (SYNTHETIC),Cream Relaxed Linen Shirt,https://example.com/synthetic/b-14,2026-11-08,Women's Tops,Cream,Linen,Solid,Relaxed,New Arrivals
B015,Retailer B (SYNTHETIC),Navy Checks Cotton Shirt,https://example.com/synthetic/b-15,2026-11-08,Women's Tops,Navy,Cotton,Checks,Boxy,New Arrivals
B016,Retailer B (SYNTHETIC),Blush Pink Floral Top,https://example.com/synthetic/b-16,2026-11-08,Women's Tops,Pink,Cotton,Floral,Cropped,New Arrivals
B017,Retailer B (SYNTHETIC),Olive Green Utility Shirt,https://example.com/synthetic/b-17,2026-11-08,Women's Tops,Olive Green,Cotton,Solid,Boxy,New Arrivals
C001,Retailer C (SYNTHETIC),Butter Yellow Cropped Cardigan,https://example.com/synthetic/c-01,2026-11-08,Women's Tops,Butter Yellow,Knit,Solid,Cropped,New Arrivals
C002,Retailer C (SYNTHETIC),Butter Yellow Boxy Tee,https://example.com/synthetic/c-02,2026-11-08,Women's Tops,Butter Yellow,Cotton,Solid,Boxy,New Arrivals
C003,Retailer C (SYNTHETIC),Burgundy Ribbed Long Sleeve,https://example.com/synthetic/c-03,2026-11-08,Women's Tops,Burgundy,Knit,Solid,Fitted,New Arrivals
C004,Retailer C (SYNTHETIC),Chocolate Brown Striped Top,https://example.com/synthetic/c-04,2026-11-08,Women's Tops,Chocolate Brown,Cotton,Stripes,Relaxed,New Arrivals
C005,Retailer C (SYNTHETIC),Chocolate Brown Linen Tunic,https://example.com/synthetic/c-05,2026-11-08,Women's Tops,Chocolate Brown,Linen,Solid,Oversized,New Arrivals
C006,Retailer C (SYNTHETIC),Powder Blue Satin Wrap Top,https://example.com/synthetic/c-06,2026-11-08,Women's Tops,Powder Blue,Satin,Solid,Fitted,New Arrivals
C007,Retailer C (SYNTHETIC),Powder Blue Oversized Linen Shirt,https://example.com/synthetic/c-07,2026-11-08,Women's Tops,Powder Blue,Linen,Solid,Oversized,New Arrivals
C008,Retailer C (SYNTHETIC),Sage Green Floral Blouse,https://example.com/synthetic/c-08,2026-11-08,Women's Tops,Sage Green,Rayon,Floral,Relaxed,New Arrivals
C009,Retailer C (SYNTHETIC),Sage Green Cropped Cotton Tank,https://example.com/synthetic/c-09,2026-11-08,Women's Tops,Sage Green,Cotton,Solid,Cropped,New Arrivals
C010,Retailer C (SYNTHETIC),White Relaxed T-Shirt,https://example.com/synthetic/c-10,2026-11-08,Women's Tops,White,Cotton,Solid,Relaxed,New Arrivals
C011,Retailer C (SYNTHETIC),White Geometric Embroidery Top,https://example.com/synthetic/c-11,2026-11-08,Women's Tops,White,Cotton,Geometric,Boxy,New Arrivals
C012,Retailer C (SYNTHETIC),Black Boxy Cotton Tee,https://example.com/synthetic/c-12,2026-11-08,Women's Tops,Black,Cotton,Solid,Boxy,New Arrivals
C013,Retailer C (SYNTHETIC),Black Crochet Vest,https://example.com/synthetic/c-13,2026-11-08,Women's Tops,Black,Crochet,Solid,Cropped,New Arrivals
C014,Retailer C (SYNTHETIC),Cream Checks Cotton Shirt,https://example.com/synthetic/c-14,2026-11-08,Women's Tops,Cream,Cotton,Checks,Oversized,New Arrivals
C015,Retailer C (SYNTHETIC),Dusty Pink Linen Shirt,https://example.com/synthetic/c-15,2026-11-08,Women's Tops,Pink,Linen,Solid,Oversized,New Arrivals
C016,Retailer C (SYNTHETIC),Olive Green Ribbed Tank,https://example.com/synthetic/c-16,2026-11-08,Women's Tops,Olive Green,Cotton,Solid,Fitted,New Arrivals`;

export function getInitialDemoData() {
  const { data: consumerRows } = parseCSV<ConsumerDataRow>(SYNTHETIC_CONSUMER_CSV);
  const { data: auditRows } = parseCSV<FashionAuditRow>(SYNTHETIC_AUDIT_CSV);

  return {
    consumerRows,
    auditRows,
    consumerFileName: "consumer_interest_SYNTHETIC.csv",
    auditFileName: "fashion_audit_SYNTHETIC.csv",
  };
}

