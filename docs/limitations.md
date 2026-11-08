# TRENDWISE — Limitations, Constraints & Scientific Disclaimers

*Version 1.0 · 8 November 2026*

Scientific honesty and transparent methodological disclosure are core requirements of the TRENDWISE prototype. This document enumerates all inherent and technical limitations.

---

## 1. Google Trends Data Characteristics
- **Relative Scale (0–100):** Google Trends normalises query volume relative to the highest point for the selected terms, region and timeframe. The numbers are unitless index values and do **not** represent search counts or absolute search traffic.
- **Window & Sampling Dependency:** Google Trends queries are based on sampling of Google web searches. Different extraction dates or comparison groups produce different normalised relative values.
- **Autocorrelation:** Search interest series exhibit autocorrelation (consecutive months are correlated). The theoretical 95% prediction interval band assumes independent errors, meaning real-world forecasting uncertainty is wider than the mathematical band.
- **Search Intent Ambiguity:** Searches for colour words (e.g. &quot;butter yellow&quot;, &quot;chocolate brown&quot;) include queries related to culinary recipes, makeup, nail polish, interior paint, or cars. Google Trends does not isolate clothing queries unless restricted to narrow fashion subcategories.

---

## 2. Linear Regression (OLS) Modeling
- **Linearity vs Seasonality:** OLS straight-line regression models secular trajectory ($y = b_0 + b_1 x$) but cannot capture annual seasonal cycles. For cyclical fashion colours (such as burgundy peaking in winter), seasonal-naive baselines will frequently outperform OLS.
- **Small Evaluation Sample:** The out-of-sample holdout test window comprises 6 months. While useful for comparative testing, 6 months is a small sample size for statistical generalisation.
- **Extrapolation Risk:** Projecting 3 months into the future assumes market momentum persists unaltered. Straight-line extrapolation is a statistical baseline, not an economic guarantee.

---

## 3. Fashion Market Audit Snapshot
- **Cross-Sectional Point-in-Time:** The audit represents a single date snapshot (8 November 2026) of 50 products across three retailers. It captures static shelf presence at that moment.
- **No Measure of Sales or Demand:** The audit records what retailers have listed in New Arrivals. It cannot measure inventory volume, sales velocity, re-order rates, sell-through percentage, or consumer purchase intent.
- **Sample Scope:** Restricted to 50 women's tops across three retailers. Findings cannot be generalised to mens, kids, footwear, accessories, or the entire Indian retail landscape.
- **Human Coding Subjectivity:** Visual classification of garments into controlled colour, fabric, print, and silhouette categories involves subjective human interpretation.

---

## 4. Signal Alignment Thresholds
- **Design Choices:** The classification thresholds (10% sample frequency and 2 retailers for &quot;Visible&quot;, $\pm 0.5\%$ normalised slope for &quot;Increasing&quot;/&quot;Decreasing&quot;) are transparent heuristic design choices defined in `src/lib/config.ts`. They represent reasonable exploratory boundaries, not physical laws.

---

## 5. Technical Environment Fallbacks
- **Offline Font Fallback:** Due to local sandbox isolation preventing outbound network calls to Google's font CDN (`fonts.googleapis.com`), typography falls back gracefully to system serif and sans-serif stacks (`Georgia, serif` and `-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`) while preserving the exact layout, metrics, and tabular numeral alignments.

