# TRENDWISE — Final Specification Pack

*Fashion Intelligence & Trend Forecasting · NIFT First-Semester End-Term Project · Version 1.0 · 8 November 2026*

This pack contains: the final PRD and methodology (sections 2–3), the CSV schemas and data dictionary (section 4), the website architecture (section 5), the acceptance and testing checklist (section 6) and a jury guide (section 7). The Antigravity master prompt is a separate document.

---

## 0. How to use this pack (beginner steps)

1. Create an empty folder called `trendwise` on your computer and open it in Google Antigravity.
2. Copy `fashion_audit_SYNTHETIC.csv` (the 50-row demo file) into the **root** of that folder.
3. Open the document **TRENDWISE — Antigravity Master Prompt**. Copy everything between the lines `=== START OF PROMPT ===` and `=== END OF PROMPT ===` and paste it into Antigravity's agent chat. If the chat box refuses such a long message, save the text as `MASTER_PROMPT.md` in the folder and send this one line instead: *"Read MASTER\_PROMPT.md completely and carry out every instruction until every acceptance item is done. Do not stop to ask me questions."*
4. Let Antigravity work. The prompt tells it to keep a progress log in `docs/BUILD_LOG.md`. If your free quota runs out mid-build, wait for the quota to reset and send: *"Continue from docs/BUILD\_LOG.md and finish the build."* That is a restart after an interruption, not a new phase.
5. When it finishes, run `npm install` then `npm run dev` and open `http://localhost:3000`. Everything shown will be labelled **Synthetic demonstration data** until you import real data.
6. Read the files in the `docs/` folder and section 7 of this pack before your jury.
7. To use real data, follow section 4.7 (how to collect Google Trends and audit data), upload on the **Data** page and choose **Real observations**.

---

## 1. Locked decisions

| Area | Decision |
| --- | --- |
| Trends | Five colour trends: Butter Yellow, Burgundy, Chocolate Brown, Powder Blue, Sage Green, collected in **one** Google Trends comparison (same region, same time range) |
| Consumer data | Google Trends, India, relative interest, aggregated to monthly, last 36 complete months |
| Fashion audit | **50 products** only, 3 retailers (17 / 17 / 16), category **Women's Tops**, listing type **New Arrivals**, one audit date (a snapshot) |
| Audit columns | `audit_id, retailer, product, product_url, audit_date, product_category, colour, fabric, print, silhouette, listing_source` |
| Combined score T | **Dropped.** Replaced by the Signal Alignment panel. The audit is never forecast |
| Forecasting | OLS linear regression, persistence baseline, seasonal-naive baseline, year-on-year change, MAE, 95% prediction interval, actual vs predicted |
| Stack | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Lucide, Recharts, Motion, Papa Parse, Zod, Vitest |
| Out of version 1 | Dark mode, PDF library (browser print-to-PDF is used), authentication, database, any "AI" claims |
| Build method | One master prompt, one continuous build, no stage approvals |

---

## 2. Product Requirements Document (final)

### 2.1 Purpose

Fashion students and independent designers see trend signals scattered across search tools, retail websites and reports. TRENDWISE brings **two independent signals** into one place and explains them in plain language:

1. **Consumer search interest** (Google Trends): how interest in a colour has moved over 36 months, with a transparent statistical forecast of the next 3 months.
2. **Fashion market snapshot** (a documented manual product audit): how visible each colour is in current retail new arrivals today.

It is an **educational forecasting prototype**. It does not compete with WGSN, Heuritech, EDITED or VisioNxt, which use proprietary data, large teams and (for some) computer vision.

### 2.2 Users

Primary: fashion students, independent designers, design researchers in India. Secondary: small labels and enthusiasts. Language: English.

### 2.3 What the app may and may not claim

| It may say | It must never say |
| --- | --- |
| "Search interest has a rising straight-line trend" | "This colour will be popular" (as a certainty) |
| "Seen in 8 of 50 sampled products, 3 of 3 retailers" | "Demand", "sales" or "growth" for audit data |
| "The model's test error was X points" | "Accuracy of X%" without the test shown |
| "Synthetic demonstration data" on sample data | Synthetic data presented as research |
| "Relative interest (0–100)" | "Search volume" or "number of searches" |

### 2.4 Scope

**Must have**

- Six pages: Overview, Trend Explorer, Trend Detail, Analytics, Reports, Methodology & Data.
- CSV import for consumer interest, fashion audit and (optionally) a trend dictionary, with validation, preview and clear errors.
- An importer for the **raw Google Trends export** file that converts weekly data to the app's monthly format.
- Forecast engine with all items in section 3.
- Signal Alignment panel.
- Printable report (browser print-to-PDF), CSV export, downloadable templates.
- Responsive layout (desktop-first), accessible, no console errors.
- Unit tests (Vitest) and documentation.

**Should have:** extended rolling-origin evaluation, "view as table" for every chart, remember-my-data toggle (browser only).

**Won't have (v1):** dark mode, PDF library, accounts, cloud database, scraping of any website, live data claims, computer vision, social media data.

### 2.5 Page requirements (summary)

| Page | Purpose | Key content |
| --- | --- | --- |
| Overview | Dashboard | Period covered, trends tracked (5), counts of increasing / stable / decreasing, audit size and date, data-origin badge, featured movers, small multiples of the five series, latest report links |
| Trend Explorer | Browse | Search, status filter (Increasing / Stable / Decreasing), sort, five trend cards with colour swatch, direction, YoY, audit frequency |
| Trend Detail | Explain one trend (most important) | Editorial header, observed solid line, forecast dashed line with prediction band, test-period actual vs predicted, metrics (slope, R², YoY, MAE table), Signal Alignment, audit evidence, sources, plain-language explanation, limitations |
| Analytics | Compare | Compare up to 5 series (same comparison group only), monthly movement, audit frequency by retailer and attribute, date range filter, retailer filter, data download |
| Reports | Research output | Pick a trend, see a print-ready report, export CSV, print |
| Methodology & Data | Transparency | How it works, formulas with worked example, constants, evaluation results, limitations, data dictionary, templates, **Import data** tool |

### 2.6 Non-functional requirements

All computation in the browser. No external data calls. No hardcoded figures in components. WCAG AA contrast for text. Keyboard-usable. Reduced-motion respected. Works down to a 360px-wide screen. `npm run lint`, `npm run build` and `npm test` all pass.

### 2.7 Success criteria

A jury member can open the app, see where each number comes from, and trace any chart value back to a CSV row. You can explain every calculation without notes (section 7).

---

## 3. Methodology (final)

### 3.1 Pipeline in one picture

CSV file → read and check → clean (months, no invented values) → statistics → forecast + evaluation → plain-language text → screen / report.

The two data sets stay **separate**. They are compared side by side (Signal Alignment) but never merged into one number.

### 3.2 Data preparation (consumer interest)

1. Google Trends gives **weekly** values for a 5-year window. Keep the raw file.
2. Assign each weekly point to a month by the week's **start date**.
3. Monthly value = **mean of that month's weekly values**. A month needs at least 3 weekly points, otherwise it is flagged incomplete.
4. **Drop the month of the collection date** if the export was made before that month ended (it is partial).
5. Keep the **last 36 complete months**. Values are **not re-scaled**, so 100 means the peak of the whole 5-year window across the five terms.
6. Missing months are shown as gaps. Nothing is invented or filled.
7. The text "<1" in Google exports is treated as 0, and the app reports how many such cells there were.

### 3.3 Consumer-interest metrics

Let the 36 monthly values be y₁ … y₃₆ and the time index x = 1 … 36.

- **Average interest** = (Σ y) / n.
- **Year-on-year change (YoY)** = (mean of the last 3 months ÷ mean of the same 3 months one year earlier − 1) × 100. Because it compares the same season, it is not fooled by seasonality. If the earlier mean is below 5, show "n/a (base too small)".
- **OLS slope b₁** = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)². **Intercept b₀** = ȳ − b₁x̄. The fitted line is ŷ = b₀ + b₁x.
- **Normalised slope** = b₁ ÷ ȳ × 100, in **percent of average interest per month**.
- **R²** = 1 − SSE ÷ SST (how much of the ups and downs the straight line explains; 0 to 1).

### 3.4 Direction rule (a design choice, stated openly)

| Normalised slope | Direction label |
| --- | --- |
| greater than +0.5 | Increasing |
| between −0.5 and +0.5 | Stable |
| less than −0.5 | Decreasing |

If average interest is 0, the label is "No signal". **Fit strength:** R² below 0.2 = weak, 0.2–0.5 = moderate, above 0.5 = strong. **Mixed signals warning:** shown when the slope direction and the YoY direction disagree (YoY above +5% counts as up, below −5% as down).

### 3.5 Forecast and the 95% prediction interval

Refit OLS on **all** complete months (normally 36) and forecast the next **3 months** (x = 37, 38, 39).

The **prediction interval** is the range where a *single new monthly value* is expected to fall 95% of the time **if the straight-line model and its assumptions are right**:

ŷ₀ ± t × s × √(1 + 1/n + (x₀ − x̄)² ÷ Sxx)

where s = √(SSE ÷ (n − 2)), Sxx = Σ(x − x̄)², and t is the 95% critical value of the t-distribution with n − 2 degrees of freedom (2.776 for 4 df, 2.048 for 28 df, 2.032 for 34 df, and about 1.96 for large samples).

- It is a **prediction** interval (for one new month), not a confidence interval for the line. It is wider.
- It assumes errors are independent. Search data are autocorrelated, so the **true uncertainty is larger** than the band shows. The app says this next to every band.
- Displayed values are clipped to 0–100; the raw numbers are kept in the CSV export.
- Wording on screen: *"Statistical extrapolation of a straight line. Not a guarantee."*

### 3.6 Evaluation: does the model beat simple guesses?

**Chronological split** (never shuffled): first 30 months = training, last 6 months = testing.

Three forecasters predict the 6 test months using only training data:

| Model | Prediction for each test month |
| --- | --- |
| Linear regression (OLS) | The line fitted on the 30 training months, extended |
| Persistence baseline | The last training value (month 30), repeated |
| Seasonal-naive baseline | The actual value from the same month one year earlier |

**MAE** (Mean Absolute Error) = average of |actual − predicted|, in points on the 0–100 scale. Example: actual 50, 52, 55 and predicted 48, 53, 60 give errors 2, 1, 5 and MAE = 8 ÷ 3 = 2.67.

**Verdict text (automatic):** the lowest MAE is named the best model on this test window. If OLS is **not** the best, the app says so plainly ("the straight line did not beat the simple baseline on this window"). Reporting this honestly is a strength.

**Series length rules:** under 12 months = no regression (message shown); 12–23 months = regression and forecast with a "short history" warning, no evaluation; 24 or more = evaluation with the last 6 months as the test set and everything earlier as training.

### 3.7 Extended check (rolling origin)

To reduce the luck of a single 6-month test, repeat the 3-month-ahead test from several starting points (training end at month 24, 25 … 33) and average the MAE per model. Shown in a collapsible "Extended evaluation" box.

### 3.8 Fashion-audit metrics (snapshot only)

For each trend colour, over the n = 50 audited products:

- **Observed count** k and **frequency** = k ÷ n × 100.
- **Sample size** n and **audit date** always shown beside the numbers.
- **Retailer coverage** = number of retailers (out of 3) where the colour appears at least once.
- **Uncertainty (Wilson 95% interval)** for the frequency p̂ = k/n: centre = (p̂ + z²/2n) ÷ (1 + z²/n), half-width = z·√(p̂(1−p̂)/n + z²/4n²) ÷ (1 + z²/n), with z = 1.96. Example: k = 8, n = 50 gives 16%, with a 95% range of roughly 8% to 29%.
- Attribute distributions (fabric, print, silhouette) are also shown, with counts.

The audit is **one date**. It cannot show growth, decline or sales and is **never forecast**.

### 3.9 Signal Alignment (replaces the combined score)

Two plain questions, answered separately and then placed side by side:

1. **Search direction** (from 3.4): Increasing, Stable or Decreasing.
2. **Retail visibility** (from 3.8): **Visible** if frequency ≥ 10% **and** coverage ≥ 2 of 3 retailers; otherwise **Low** (includes "Not observed").

| Search direction | Visible in retail | Low in retail |
| --- | --- | --- |
| Increasing | **Aligned rise** — interest rising and already on shelves | **Emerging signal** — interest rising, little retail presence yet |
| Stable | **Established** — steady interest and well stocked | **Quiet** — little signal on either side |
| Decreasing | **Fading interest, still stocked** — retail may lag search | **Aligned decline** — interest falling and little on shelves |

Every alignment label carries the sentence: *"This compares two observations. It does not predict retail performance."* The 10% and 2-retailer thresholds are design choices kept in one configuration file and listed on the Methodology page.

### 3.10 Worked example (use this to explain OLS to the jury)

Six months of illustrative values: y = 40, 44, 43, 48, 50, 53 at x = 1…6.

1. x̄ = 3.5 and ȳ = 46.33.
2. Sxx = 17.5 and Σ(x − x̄)(y − ȳ) = 44.0.
3. Slope b₁ = 44.0 ÷ 17.5 = **2.514** points per month. Intercept b₀ = 46.33 − 2.514 × 3.5 = **37.53**.
4. Forecast for x = 7: 37.53 + 2.514 × 7 = **55.13**; for x = 8: 57.65; for x = 9: 60.16.
5. SSE = 6.705, so s = √(6.705 ÷ 4) = 1.295 and R² = 1 − 6.705 ÷ 117.33 = **0.943**.
6. 95% prediction interval at x = 7: t = 2.776, the root term is √(1 + 1/6 + 12.25/17.5) = 1.366, so the half-width is 2.776 × 1.295 × 1.366 ≈ **4.91**. Interval: about **50.2 to 60.0**.

These exact numbers are used as automated tests in the project.

### 3.11 Configuration constants (all in one file, all shown on the Methodology page)

| Constant | Value | Meaning |
| --- | --- | --- |
| WINDOW\_MONTHS | 36 | History used |
| TEST\_MONTHS | 6 | Test set length |
| HORIZON\_MONTHS | 3 | Forecast length |
| MIN\_MONTHS\_REGRESSION / EVALUATION | 12 / 24 | Series length rules |
| DIRECTION\_BAND | 0.5 | % of mean per month for "Stable" |
| YOY\_BAND / YOY\_MIN\_BASE | 5 / 5 | YoY direction band and minimum base |
| R2\_WEAK / R2\_STRONG | 0.2 / 0.5 | Fit strength cut-offs |
| VISIBLE\_MIN\_FREQ / VISIBLE\_MIN\_RETAILERS | 10% / 2 | Retail visibility rule |
| WEEKS\_PER\_MONTH\_MIN | 3 | Weekly points needed for a complete month |

### 3.12 Assumptions and limitations (shown on the Methodology page)

1. Google Trends values are **relative** (100 = the peak of the chosen window), sampled and anonymised, not search volumes. Changing the window changes the numbers.
2. Colour words are ambiguous ("burgundy" is also a wine region and a place; "chocolate brown" is also a food word). Interest may not be fashion-only.
3. A straight line cannot capture seasonal cycles or sudden fashion shifts; that is why baselines and YoY are shown.
4. The test set is only 6 points, so MAE is noisy.
5. Prediction bands assume independent errors, which time series often break.
6. The audit is 50 products, three retailers, women's tops, new arrivals, one day. It reflects what stores chose to release recently, so it lags consumer interest and cannot be generalised to all fashion or all of India.
7. Product frequency is not demand or sales. Search interest is not purchase.
8. Thresholds (0.5%, 10%, 2 retailers, R² cut-offs) are design choices, not scientific constants.
9. Colours were coded by a person from product pages; a different coder might disagree on shades.

---

## 4. CSV schemas and data dictionary (final)

### 4.1 Files

| File | Required | How it arrives | Purpose |
| --- | --- | --- | --- |
| `consumer_interest.csv` | Yes | Upload (long format) **or** converted from a raw Google Trends export | Monthly relative search interest per trend |
| `fashion_audit.csv` | Yes | Upload | One row per audited product |
| `trend_dictionary.csv` | Optional | Upload | Links each trend to the audit attribute it matches. If missing, the app builds it automatically by matching trend name to `colour` |
| Raw Google Trends export (`multiTimeline.csv`) | Optional | Upload on the Data page | Converted into `consumer_interest.csv` rows by the app |
| `fashion_audit_summary.csv` | Never uploaded | **Exported** by the app | Counts and frequencies computed from the audit |
| `forecast_results.csv` | Never uploaded | **Exported** by the app | Forecast, interval and evaluation numbers |

Synthetic demonstration files are named with `_SYNTHETIC` and always show a badge.

### 4.2 `consumer_interest.csv`

| Column | Type | Required | Rules | Example |
| --- | --- | --- | --- | --- |
| date | text `YYYY-MM` | Yes | Valid month, one row per trend per month | 2026-03 |
| trend\_id | text | Yes | Same id always maps to the same trend\_name | T001 |
| trend\_name | text | Yes | Must be one of the trends in the file | Butter Yellow |
| category | text | Yes | Colour (v1) | Colour |
| region | text | Yes | All rows the same | India |
| search\_interest | number | Yes | 0 to 100, decimals allowed (monthly means) | 47.5 |
| source | text | Yes | Normally "Google Trends" | Google Trends |
| source\_url | text | Yes | Starts with http | https://trends.google.com/trends/ |
| collection\_date | date `YYYY-MM-DD` | Yes | Date you exported the data | 2026-11-08 |
| query\_group | text | Yes | Same value for all five trends = one comparison | india-colours-5y-2026-11-08 |
| time\_range | text | Yes | The Google Trends window you used | 2021-11-14 to 2026-11-08 |
| search\_query | text | No | Exact term typed | butter yellow |
| search\_category | text | No | Google category filter used, or "All categories" | All categories |
| granularity\_source | text | No | weekly or monthly (default monthly) | weekly |

**Row example (illustrative, not real):** `2026-03,T001,Butter Yellow,Colour,India,47.5,Google Trends,https://trends.google.com/trends/,2026-11-08,india-colours-5y-2026-11-08,2021-11-14 to 2026-11-08,butter yellow,All categories,weekly`

### 4.3 `fashion_audit.csv` (your final columns)

| Column | Type | Required | Rules | Example |
| --- | --- | --- | --- | --- |
| audit\_id | text | Yes | Unique | AUD-001 |
| retailer | text | Yes | 2 to 6 retailers; each should have a similar number of rows | Retailer A |
| product | text | Yes | Product name or your own identifier | Ribbed Knit Top |
| product\_url | text | Yes | Starts with http, so anyone can verify | https://example.com/p/123 |
| audit\_date | date `YYYY-MM-DD` | Yes | Same for the whole audit (single-date snapshot) | 2026-11-08 |
| product\_category | text | Yes | One value for the whole file | Women's Tops |
| colour | text | Yes | From the colour list (4.5) | Sage Green |
| fabric | text | Yes | From the fabric list. Use the main fabric if blended | Cotton |
| print | text | Yes | From the print list | Solid |
| silhouette | text | Yes | From the silhouette list | Boxy |
| listing\_source | text | Yes | One value for the whole file | New Arrivals |

Rules the app applies: no duplicate `audit_id`; no duplicate `product_url`; one `audit_date`; one `product_category`; one `listing_source`. Anything else is a warning, not a blocker.

### 4.4 `trend_dictionary.csv` (optional)

| Column | Meaning | Example |
| --- | --- | --- |
| trend\_id | Matches consumer\_interest | T001 |
| trend\_name | Display name | Butter Yellow |
| category | Colour | Colour |
| attribute\_type | Which audit column to match | colour |
| attribute\_value | The audit value that counts as this trend | Butter Yellow |
| search\_query | The Google Trends term | butter yellow |

Default for the five trends: T001 Butter Yellow, T002 Burgundy, T003 Chocolate Brown, T004 Powder Blue, T005 Sage Green.

### 4.5 Controlled vocabularies (what each column may contain)

- **colour (tracked trends):** Butter Yellow, Burgundy, Chocolate Brown, Powder Blue, Sage Green.
- **colour (other, untracked):** White, Black, Cream, Navy, Pink, Olive Green, Other. Rule for coders: if a product is a pale yellow but clearly not butter yellow, write *Other*, and note the shade in your own notes. The app counts anything not matching a tracked trend as "Other colours".
- **fabric:** Cotton, Linen, Satin, Knit, Crochet, Rayon, Denim, Other.
- **print:** Solid, Floral, Stripes, Checks, Polka Dots, Geometric, Other.
- **silhouette:** Fitted, Oversized, Relaxed, Cropped, Boxy, Other.
- **listing\_source:** New Arrivals. **product\_category:** Women's Tops.

Values outside these lists produce a **warning** (they are kept exactly as typed and grouped under "Other" in charts). Source values are never edited.

### 4.6 Validation rules

| Check | Result |
| --- | --- |
| Required column missing or misspelled | **Error** (file rejected, missing names listed) |
| Wrong file type (not .csv) | **Error** |
| Empty file or header only | **Error** |
| `date` not `YYYY-MM`, `audit_date` / `collection_date` not valid dates | **Error** (row numbers listed) |
| `search_interest` not numeric, below 0 or above 100 | **Error** (row numbers listed) |
| Duplicate trend + month | **Error** |
| Same trend\_id with different trend\_name | **Error** |
| More than one region, query\_group, audit\_date, product\_category or listing\_source where one is expected | **Error** (or **Warning** for query\_group; the app then refuses to compare series across groups) |
| Missing months inside the range | **Warning** (shown as gaps, never filled) |
| Fewer than 36 months | **Warning** (short-history rules from section 3.6 apply) |
| Trend with fewer than 12 months | **Warning** (no forecast) |
| Duplicate audit\_id or product\_url | **Error** |
| Retailer sample sizes differ by more than 3 | **Warning** |
| Audit total is not 50 | **Info** (the app works with any size, and shows n) |
| Value outside the controlled list | **Warning** |
| Audit trend not matched to any consumer trend (or reverse) | **Warning** with a mapping preview |
| Partial collection month present | **Info**, month excluded automatically |

Every upload shows a **preview of the first 10 rows**, an **error and warning summary**, and **Import / Cancel** buttons. Nothing is stored until the user presses Import. Source values are never silently changed; any transformation (weekly to monthly, partial-month removal) is listed in a "What the app did to your file" panel.

The import screen also requires the user to choose **Real observations** or **Synthetic / demonstration** for each file. Default: none selected, so the user must decide.

### 4.7 How to collect real data (beginner guide)

**Google Trends (Dataset A)**

1. Open trends.google.com/trends and choose Explore.
2. Type the first term (butter yellow), then use *Add comparison* for burgundy, chocolate brown, powder blue and sage green. Five terms is the maximum for one comparison.
3. Set location to **India** and time to **Past 5 years**. Leave the same settings for all five (they are one request). If a clothing-related category is available, choose it and write the category name down; otherwise keep All categories and note that the words are ambiguous.
4. Click the download arrow on *Interest over time*. You get a file usually named `multiTimeline.csv`. Keep the original untouched.
5. Note today's date and paste the browser address into your notes (it is your `source_url`).
6. Upload it on the **Data** page, choose *Google Trends raw export*, fill the small form (region, collection date, category used) and the app converts it.

Button names and file layout may change over time; the app also accepts the long-format template if the raw layout is not recognised.

**Fashion audit (Dataset B)**

1. Choose three public retailer websites whose terms allow viewing; do **not** scrape or automate anything.
2. Open each retailer's *New Arrivals* page for **women's tops**, all on the **same day**.
3. Take the first 16 or 17 products in the order shown (17, 17, 16 = 50). Skip duplicates and sold-out tiles that show no details.
4. For each product record the product link and choose colour, fabric, print and silhouette from the lists in 4.5.
5. Fabric: read the product description. If blended, write the main fabric. If unclear, write Other.
6. Ask a friend to code 10 of the same products independently and note how many of their four labels match yours (your agreement check; mention it in the jury).
7. Never use retailer images in the app; link only.

### 4.8 The synthetic demonstration audit (for development)

`fashion_audit_SYNTHETIC.csv` has **50 invented rows**: retailer names include "(SYNTHETIC)", product names say "Synthetic Demo Top", and all links point to `example.com/synthetic/...`. It is not research. Expected values (use them to check the app):

| Colour | Count of 50 | Frequency | Retailers (of 3) |
| --- | --- | --- | --- |
| Butter Yellow | 8 | 16% | 3 |
| Burgundy | 6 | 12% | 3 |
| Chocolate Brown | 7 | 14% | 3 |
| Powder Blue | 5 | 10% | 2 |
| Sage Green | 6 | 12% | 3 |
| Other colours (White 5, Black 4, Cream 3, Navy 2, Pink 2, Olive Green 2) | 18 | 36% | 3 |

Retailer sizes: A = 17, B = 17, C = 16. Fabric: Cotton 19, Satin 9, Linen 8, Knit 7, Rayon 4, Crochet 3. Print: Solid 35, Floral 7, Stripes 4, Checks 2, Polka Dots 1, Geometric 1. Silhouette: Fitted 13, Oversized 11, Relaxed 10, Cropped 9, Boxy 7. Powder Blue sits exactly on the 10% visibility threshold, which deliberately tests the rule "10% or more".

---

## 5. Website architecture (final)

### 5.1 Sitemap

`/` Overview · `/explore` Trend Explorer · `/trend?id=T001` Trend Detail · `/analytics` Analytics · `/reports` Reports · `/methodology` Methodology & Data (tabs: How it works, Evaluation, Assumptions, Data dictionary, Import data)

The trend page uses a **query string** (`?id=`), not a folder per trend, because trend ids come from uploaded files and are not known when the site is built.

### 5.2 Data flow

Upload or built-in sample → Papa Parse (read text into rows) → Zod schemas (check each row) → normalise (months, partial-month removal, weekly to monthly) → typed Dataset in React state → pure functions (metrics, regression, evaluation, audit stats, alignment, interpretation text) → page components → charts and report.

Rule: **components never contain numbers**. They only display what functions return.

### 5.3 Folder structure

```
trendwise/
  MASTER_PROMPT.md            (optional copy of the prompt)
  public/
    sample-data/              consumer_interest_SYNTHETIC.csv, fashion_audit_SYNTHETIC.csv, trend_dictionary.csv
    templates/                blank templates with one example row each
    images/trends/            optional photos (swatch used if missing)
  src/
    app/                      layout.tsx, globals.css, page.tsx (Overview), explore/, trend/, analytics/, reports/, methodology/
    components/
      layout/                 app-shell, sidebar, topbar, page-header, data-badge
      dashboard/              metric, trend-mini-chart, mover-list
      trends/                 trend-card, trend-filters, signal-alignment, audit-evidence, explanation
      charts/                 forecast-chart, comparison-chart, bar-chart, chart-table-toggle
      data/                   uploader, preview-table, validation-summary, import-wizard, trends-export-form
      reports/                report-layout, export-buttons
      ui/                     shadcn components
    lib/
      config.ts               all constants (section 3.11)
      csv/                    parse.ts, schemas.ts, validate.ts, google-trends-export.ts, monthly.ts, export.ts
      stats/                  ols.ts, tcrit.ts, mae.ts, wilson.ts
      forecasting/            pipeline.ts, evaluation.ts, rolling.ts, direction.ts, yoy.ts, interpretation.ts
      audit/                  frequencies.ts, coverage.ts, alignment.ts
      data/                   store.tsx (context + reducer), sample-loader.ts, selectors.ts
      utils.ts
    types/                    trend.ts, dataset.ts, forecast.ts, audit.ts
  scripts/generate-sample-data.ts
  tests/                      stats, forecasting, csv, audit, alignment (Vitest)
  docs/                       methodology.md, data-dictionary.md, limitations.md, source-register.md, image-credits.md, testing-report.md, BUILD_LOG.md, README-for-jury.md
```

### 5.4 State model

One dataset store holds: `consumer` (rows, origin = real or synthetic, file name, collection date, query group, notes of transformations), `audit` (rows, origin, audit date), `dictionary`, and `status` (empty, loading, ready, error). If either file is synthetic, a **Synthetic demonstration data** badge appears in the top bar of every page and in every report. Imported data lives in memory; a **Remember my data in this browser** switch (off by default) stores it in `localStorage` inside try/catch, and **Clear saved data** removes it.

### 5.5 Design system

**Direction:** editorial fashion publication on top of a calm, premium software structure. Data screens stay quiet; editorial moments live in headers, trend titles and the report.

| Token | Value | Use |
| --- | --- | --- |
| canvas | #F7F6F2 | page background |
| surface | #FFFFFF | cards, tables |
| surface-2 | #EFEEE8 | quiet panels, table headers |
| text | #20211F | main text |
| text-2 | #66665E | secondary text (about 5.3:1 on canvas) |
| muted | #A4A18F | hairlines, disabled, never text |
| accent | #73816B | large text, icons, chart accents |
| accent-strong | #5A6853 | links, small text, filled buttons |
| border | #E5E3DB | dividers |
| success / warning / error | #5B7A52 / #B07A1E / #A64B3F | status |

**Trend colours** (swatch fill / chart line): Butter Yellow #F4E4A6 / #C9A227 · Burgundy #7A1F32 / #7A1F32 · Chocolate Brown #4A2C20 / #4A2C20 · Powder Blue #B7D0E3 / #5B8DB5 · Sage Green #9DB08A / #6F8A5A. Swatches are design approximations, not Pantone references. Colour never carries meaning alone: lines also differ in marker shape and are labelled directly.

**Type:** Manrope for interface and data (tabular figures); DM Serif Display only for page titles, trend names and report headings. Sizes 12 / 14 / 16 / 18 for UI and 32 / 48 / 64 for editorial headings.

**Layout:** 8-point spacing, sidebar 264px (collapses to 72px; becomes a drawer on mobile), content max width about 1280px, card radius 12, controls 8, editorial panels 24, hairline borders instead of shadows.

**Chart language:** observed = solid ink line; forecast = dashed accent line with a light prediction band; test period = softly shaded zone containing actual vs predicted; baselines = thin dotted lines. Every chart has a *View as table* switch and a source line ("Source: Google Trends, India, collected 2026-11-08").

**Editorial touches:** numbered trends ("No. 01") in serif; portrait trend cards with the caption below the image; Trend Detail opens with a full-width swatch composition (or photo if supplied) and a large serif title; audit evidence styled as a small "field notes" caption with retailer, date, n and links; the report is laid out like a two-column publication spread.

**Motion:** 150 / 250 / 400 ms ease-out; lines draw once; counters animate only when data changes; everything off when the user prefers reduced motion.

### 5.6 Dependencies and licences

Next.js, React, TypeScript, Tailwind CSS, shadcn/ui (copied components built on Radix and its helper packages), Lucide, Recharts, Motion, Papa Parse, Zod, Vitest. Fonts via `next/font` (Manrope, DM Serif Display, both Google Fonts, believed OFL; confirm and record in `docs/source-register.md`). No paid component, template or API. No other library is added.

### 5.7 Hosting

Runs locally with `npm run dev`. The site is fully client-side, so it can also be built as a static site (`next build`, static export if compatible) and hosted free on any static host. Hosting is optional for the jury.

---

## 6. Acceptance and testing checklist (final)

The build is **accepted** only when every row below is true. Antigravity must run the automated rows itself and record results in `docs/testing-report.md`; you can repeat the manual rows in ten minutes.

### 6.1 Automated tests (Vitest, `npm test`)

| ID | Test | Expected result |
| --- | --- | --- |
| A1 | OLS on y = 1, 2, 3, 4, 5 | slope 1, intercept 0, R² = 1 |
| A2 | OLS on a constant series (5, 5, 5, 5) | slope 0; R² shown as "n/a"; no crash or NaN on screen |
| A3 | Worked example y = 40, 44, 43, 48, 50, 53 | slope 2.514, intercept 37.533, SSE 6.705, R² 0.943 (tolerance 0.001) |
| A4 | Same example, forecasts at x = 7, 8, 9 | 55.133, 57.647, 60.160 (tolerance 0.001) |
| A5 | Same example, 95% prediction interval at x = 7 | half-width 4.91, range about 50.22 to 60.04 (tolerance 0.02) |
| A6 | t critical values | 4 df = 2.776; 28 df = 2.048; 34 df = 2.032 (tolerance 0.001); large df about 1.96 |
| A7 | MAE of actual 50, 52, 55 vs predicted 48, 53, 60 | 2.667 |
| A8 | Evaluation on a perfectly seasonal 36-month series (same 12 values repeated) | seasonal-naive MAE = 0; verdict names seasonal-naive as best |
| A9 | Evaluation on a perfect straight line (y = 2 + 0.5x) | OLS MAE about 0; OLS best; persistence and seasonal-naive worse |
| A10 | Split | training = months 1–30, test = months 31–36; order never shuffled |
| A11 | Series-length rules | 11 months: no regression; 18 months: forecast and short-history warning, no evaluation; 24 months: evaluation with 18 train and 6 test |
| A12 | Rolling origin on 36 months | 10 origins, 3-month horizon, average MAE per model |
| A13 | YoY | last-3 mean 60 vs earlier 40 gives +50%; earlier mean below 5 gives "n/a" |
| A14 | Direction boundaries | normalised slope exactly 0.5 = Stable; 0.51 = Increasing; −0.51 = Decreasing; mean 0 = No signal |
| A15 | Wilson interval | k = 8, n = 50: about 0.0834 to 0.2851; k = 0 gives lower bound 0; k = n gives upper bound 1 |
| A16 | Retail visibility | 10% and 2 retailers = Visible; 9.9% = Low; 15% and 1 retailer = Low |
| A17 | Signal Alignment | all six combinations return the correct label from section 3.9 |
| A18 | Weekly to monthly | weeks assigned by start date; month with fewer than 3 weekly points flagged; collection month removed when partial |
| A19 | Raw Google Trends parser | skips title lines; reads the Week column and five term columns; "<1" becomes 0 and is counted; unknown layout returns a helpful error |
| A20 | Validation | one test per Error row in section 4.6, each with the right message and row numbers |
| A21 | Synthetic audit file | 50 rows; retailers 17 / 17 / 16; colour counts exactly as in section 4.8; zero errors |
| A22 | Synthetic consumer file | 5 trends × 36 months = 180 rows; all values 0–100; generator gives identical output for the same seed |
| A23 | Export | exported CSV re-imports with no errors and identical numbers |

### 6.2 Manual checks in the browser

| ID | Page | Check | Expected |
| --- | --- | --- | --- |
| M1 | All | Click every sidebar link, browser Back and Forward | Correct page, active item highlighted, no console errors |
| M2 | All | Top bar | Synthetic badge visible while demo data is loaded |
| M3 | Overview | Counts of increasing / stable / decreasing | Add up to 5 and match Trend Explorer |
| M4 | Explorer | Search "sage", status filter, sort | Results update; empty state when nothing matches; Clear works |
| M5 | Trend Detail | Open each of the five trends | Solid observed line, dashed forecast, shaded band, test-period actual vs predicted; slope, R², YoY, MAE table, alignment, audit evidence, sources, limitations all present |
| M6 | Trend Detail | Hand-check one trend | Slope and forecast match Excel (`SLOPE`, `INTERCEPT`, `FORECAST`) within rounding |
| M7 | Trend Detail | "View as table" | Same numbers as the chart |
| M8 | Analytics | Compare 2–5 trends; change date range and retailer | Charts update; only one comparison group allowed; data download works |
| M9 | Reports | Choose a trend, press Print | Print preview shows a clean page without sidebar; has identity, chart, method, evidence, sources, limitations, date and the Synthetic notice if applicable |
| M10 | Reports | CSV export | File downloads and opens in Excel with correct columns |
| M11 | Methodology | Read every tab | Formulas, constants table, evaluation results, assumptions and limitations, data dictionary all visible |
| M12 | Import | Upload a good file | Preview, summary, "What the app did" panel; Import updates all pages |
| M13 | Import | Upload a bad file (wrong column, 120 as interest, duplicate month, empty file, .txt file) | Each gives a plain-English error with row numbers; nothing imported |
| M14 | Import | Press Cancel mid-way | Existing data unchanged |
| M15 | Import | Upload a raw Google Trends export | Converted, preview shown, monthly file downloadable |
| M16 | Import | Choose neither Real nor Synthetic | Import button stays disabled |
| M17 | Empty | Clear all data | Every page shows a helpful empty state with a link to Import or Load demo data |

### 6.3 Responsive and accessibility

| ID | Check | Expected |
| --- | --- | --- |
| R1 | Widths 1440, 1024, 768, 390 and 360 | No sideways page scroll; sidebar becomes a drawer on small screens; tables scroll inside their own box |
| R2 | Keyboard only | Every control reachable, visible focus ring, dialogs trap and release focus |
| R3 | Contrast | Text and data labels at least 4.5:1 (large text 3:1) |
| R4 | Reduced motion | With the system setting on, no animation |
| R5 | Charts | Each has a title, source line, text summary and table view |
| R6 | Print | No dark backgrounds; page breaks do not cut charts |

### 6.4 Academic integrity

| ID | Check |
| --- | --- |
| I1 | No page calls audit data demand, sales or growth |
| I2 | No page calls Google Trends values search volume |
| I3 | Predicted values are never labelled observed; forecast is always dashed and labelled |
| I4 | No accuracy claim appears without the test MAE and baselines beside it |
| I5 | No combined T score exists anywhere; the audit is never forecast |
| I6 | Synthetic data always carries the badge and is never described as research |
| I7 | No claims of AI, computer vision, live data or social media analysis |
| I8 | Every chart shows its source and collection date |
| I9 | All thresholds appear on the Methodology page |
| I10 | Competitor statements stay within what is in section 7.8 |

### 6.5 Build gates and documents

`npm run lint`, `npm test` and `npm run build` all pass; no console errors or warnings on any page; `docs/` contains methodology, data dictionary, limitations, source register, image credits, testing report, build log and the jury README; every document states which items are verified, assumed or not implemented.

---

## 7. Jury guide

### 7.1 The two-minute explanation (say it in your own words)

"TRENDWISE helps fashion students see whether a colour is gaining or losing attention, and whether shops are already showing it. I used two separate sources. First, Google Trends gives a relative index of search interest in India for five colours over three years. Second, I audited 50 women's tops from three retailers' New Arrivals pages on one day and counted the colours.

For search interest, I fit a straight line to the monthly values. If the line slopes up, I call the trend increasing; if it is nearly flat, stable. I extend the line three months ahead with a 95% prediction range, and I test the method honestly: I train on the first 30 months, hide the last 6, and compare my line with two simple guesses, 'same as last month' and 'same as this month last year'. If the line does not beat them, the app says so.

The shop audit is only a snapshot, so I do not forecast it. I show how often each colour appeared, in how many retailers, and how uncertain that is with a small sample. Then the Signal Alignment panel puts the two side by side in plain language, without mixing them into one score. Every number comes from a CSV row, and all limits are written on the Methodology page."

### 7.2 Plain-language glossary

| Term | Meaning |
| --- | --- |
| Relative interest (0–100) | Google's scale where 100 is the highest point in the chosen period; not a count of searches |
| Monthly mean | Average of that month's weekly values |
| OLS regression | The straight line that keeps the total squared distance to the points as small as possible |
| Slope | How many index points the line rises (or falls) each month |
| Normalised slope | The slope as a percentage of average interest, so trends of different size can be compared |
| R² | Share of the up-and-down movement the line explains (0 = none, 1 = all) |
| YoY | Change compared with the same months a year ago; removes the effect of seasons |
| Persistence baseline | Guess that the future equals the latest value |
| Seasonal-naive baseline | Guess that this month equals the same month last year |
| MAE | Average size of the mistakes, in index points; smaller is better |
| Prediction interval | Range where one new month would land 95% of the time if the model's assumptions hold |
| Train / test split | Learn on early months, check on later months the model has not seen |
| Wilson interval | Honest range around a percentage from a small sample |
| Retailer coverage | In how many of the three retailers a colour appears |
| Snapshot | Data from one day; shows what is, not how it changed |

### 7.3 Calculation walkthrough you can do on paper

Use the six-point example in section 3.10. Draw the six points. Say: "The average of x is 3.5 and of y is 46.3. The slope is the sum of the products of the distances from these averages divided by the sum of squared x distances: 44 divided by 17.5, so 2.5 points a month. The line passes through the averages, so the intercept is 37.5. Month 7 is 55.1." You can confirm in Excel with `=SLOPE(y_range, x_range)`, `=INTERCEPT(y_range, x_range)`, `=RSQ(y_range, x_range)` and `=FORECAST(7, y_range, x_range)`.

### 7.4 Ninety-second demo route

Overview (badge, counts) → Trend Explorer (filter to Increasing) → Trend Detail (solid vs dashed, band, test period, MAE table, alignment, audit evidence) → Methodology (formulas, constants, limitations) → Reports (print preview).

### 7.5 Likely questions and good answers

| Question | Answer |
| --- | --- |
| Why linear regression? | It is simple, transparent and explainable; I show whether it beats simple baselines instead of assuming it works. |
| Is your forecast accurate? | I report the test error (MAE, in index points) next to two baselines. It is a statistical extrapolation, not a guarantee, and sometimes the baselines win. |
| Why 36 months? | Three full years include three seasonal cycles; the split gives 30 months to learn from and 6 to test; the seasonal-naive guess needs at least a year of history. |
| Why not shuffle the data? | Time has an order. Shuffling would let the model see the future, which is cheating (data leakage). |
| What does a Google Trends 60 mean? | 60% of that period's peak for the chosen region, not 60 searches or 60%. |
| Why did you drop the combined score? | The two datasets have different units and time coverage: one is a 36-month series, the other a one-day snapshot. Mixing them would invent precision. |
| Why only 50 products? | A manual audit is time-consuming. I show uncertainty ranges and state the limits. A repeat audit over several months would allow trend analysis later. |
| Is the demo data fake? | It is synthetic and labelled everywhere, used only to test the software. Real data replaces it by upload. It is never presented as research. |
| What is a prediction interval? | The range in which a single new month should fall about 95% of the time if my straight-line assumptions hold. Real uncertainty is probably larger because search data are autocorrelated. |
| Why year-on-year change? | Colours are seasonal; comparing the same months removes the season. |
| What does R² tell you? | How much of the movement the line explains. A low value means the line is a weak description. |
| How do you know your calculations are right? | Automated tests with a hand-calculated example, and I cross-checked in Excel with SLOPE, INTERCEPT and FORECAST. |
| Did you use AI? | The app has no AI features: its calculations are standard statistics. I used an AI coding assistant to help write the code, and I tested and documented the results myself. (Say what is true for you.) |
| How is this different from WGSN, Heuritech, EDITED or VisioNxt? | Those are professional services with proprietary data and teams. TRENDWISE is a small educational tool with open data and open methods so a student can follow every step. |
| What would you improve? | Repeat the audit monthly to build a real product-history dataset, add more retailers and categories, test a seasonal model, and add Indian market sources. |

### 7.6 Sentences to use when you are unsure

"That is a limitation I documented on the Methodology page." · "The app shows that as a warning rather than hiding it." · "With only six test months I would not claim more than the numbers show."

### 7.7 Honest statement about scale

Three sentences you can say: "TRENDWISE is a learning prototype. It uses public Google Trends data and a small manual audit. It is built to be transparent, not to match commercial forecasting services."

### 7.8 Competitor facts you may safely state (checked on 8 November 2026)

- **WGSN:** a subscription-based trend forecasting company with colour work through its Coloro partnership; it markets accuracy figures for its own AI model, so do not repeat them as established fact.
- **Heuritech:** a Paris-based company using AI image recognition on social media pictures to forecast fashion attributes; its public material describes collecting from Instagram and (for China) Weibo.
- **EDITED:** a UK-based retail intelligence platform focused on assortment, pricing and merchandising rather than being mainly a trend forecaster.
- **VisioNxt:** an initiative of NIFT under the Ministry of Textiles, with a portal at visionxt.in and the "Paridhi 24x25" India trend book launched in September 2024; it combines AI with human (emotional-intelligence) research.

For VisioNxt, read its public pages and the Ministry of Textiles (PIB) release yourself before the jury, and do not copy its report layouts or images.
