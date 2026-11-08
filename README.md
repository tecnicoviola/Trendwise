# TRENDWISE — Fashion Intelligence & Trend Forecasting

> A transparent dual-signal fashion trend-intelligence prototype built for fashion students and independent designers in India (NIFT First-Semester End-Term Research).

TRENDWISE monitors five core colour trends in India:
- **Butter Yellow**
- **Burgundy**
- **Chocolate Brown**
- **Powder Blue**
- **Sage Green**

It compares two independent observational signals side by side:
1. **Consumer Curiosity (Google Trends):** 36 months of relative search interest in India (0–100) with a 3-month OLS linear extrapolation, 95% prediction interval band, and out-of-sample baseline evaluation.
2. **Retail Reality (Manual Fashion Audit):** A single-day snapshot of 50 sampled products (Women's Tops, New Arrivals) across three online retailers (*Retailer A, Retailer B, Retailer C*).

---

## 1. Quick Start

### Prerequisites
- Node.js $\ge 18$ (tested on Node v24)
- npm $\ge 9$

### Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The application launches with pre-loaded **Synthetic demonstration data**.

---

## 2. Available Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Starts local development server on port 3000 |
| `npm test` | Runs all 30 unit tests via Vitest |
| `npm run lint` | Runs ESLint type and code quality check |
| `npm run build` | Builds optimized production static web application |
| `npm run start` | Starts Next.js production server |

---

## 3. How to Import Real Research Data

1. Navigate to the **Import Data** tool from the top navigation bar or via `/methodology#import`.
2. Upload either:
   - A standard long-format `consumer_interest.csv` (download template from `/templates/consumer_interest_template.csv`).
   - A manual retail snapshot `fashion_audit.csv` (template at `/templates/fashion_audit_template.csv`).
   - A raw, unmodified export from **Google Trends** (the app automatically detects preambles, cleans `<1` values, assigns weekly points to month start dates, drops partial collection months, and retains the last 36 complete months).
3. Select **Real observations** as the Data Origin (mandatory declaration per research ethics).
4. Click **Import Dataset**. All dashboard metrics, charts, and Signal Alignment matrices will dynamically update.

---

## 4. Documentation Index

- [`docs/methodology.md`](docs/methodology.md) — Complete mathematical equations, OLS derivation, Student's t critical values, and live worked example.
- [`docs/data-dictionary.md`](docs/data-dictionary.md) — Detailed column definitions and controlled vocabularies.
- [`docs/limitations.md`](docs/limitations.md) — Honest scientific and methodological constraints.
- [`docs/README-for-jury.md`](docs/README-for-jury.md) — One-page plain-language jury briefing guide with Excel formulas (`SLOPE`, `INTERCEPT`, `RSQ`, `FORECAST`).
- [`docs/testing-report.md`](docs/testing-report.md) — Test suite results and responsive verification log.
- [`docs/source-register.md`](docs/source-register.md) — Dependencies, licences, and benchmark comparisons.
- [`docs/image-credits.md`](docs/image-credits.md) — Image and swatch credits.
- [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md) — Chronological engineering execution record.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — Engineering decision register.

