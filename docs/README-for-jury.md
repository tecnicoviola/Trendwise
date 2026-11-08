# TRENDWISE — Jury Briefing Guide

*NIFT First-Semester End-Term Research Prototype · Version 1.0*

---

## 1. What TRENDWISE Does

TRENDWISE is an educational trend-intelligence web application created for fashion students and independent designers in India. Rather than relying on black-box &quot;AI&quot; or vague qualitative forecasts, TRENDWISE evaluates **two independent observational signals** side by side:

1. **Consumer Curiosity (Google Trends):** A 36-month time series of indexed search interest (0–100) across five colour trends in India (*Butter Yellow, Burgundy, Chocolate Brown, Powder Blue, Sage Green*), with an honest 3-month statistical extrapolation.
2. **Retail Reality (Manual Fashion Audit):** A single-day snapshot of 50 sampled women's tops in *New Arrivals* across three Indian fashion retailers (*Retailer A, Retailer B, Retailer C*).

These signals are **never aggregated into an arbitrary single score**. Instead, the **Signal Alignment matrix** presents where consumer interest and retail stocking match or diverge.

---

## 2. How Every Number Is Calculated & Excel Reproduction

Any jury member can reproduce TRENDWISE's mathematical results in Microsoft Excel or Google Sheets:

### A. Linear Regression & Slope
Suppose monthly search interest numbers for months 1 to 6 are in cells `B1:B6`, and time indices $1, 2, 3, 4, 5, 6$ are in `A1:A6`:
- **Slope ($b_1$):** `=SLOPE(B1:B6, A1:A6)` (e.g. for values `40, 44, 43, 48, 50, 53`, returns `2.514`).
- **Intercept ($b_0$):** `=INTERCEPT(B1:B6, A1:A6)` (returns `37.533`).
- **Goodness of Fit ($R^2$):** `=RSQ(B1:B6, A1:A6)` (returns `0.943`).
- **Extrapolation at Month 7:** `=FORECAST(7, B1:B6, A1:A6)` (returns `55.133`).
- **Normalised Slope:** `=(SLOPE(B1:B6, A1:A6) / AVERAGE(B1:B6)) * 100`. If $> +0.5\%$, direction is **Increasing**; if $< -0.5\%$, **Decreasing**; otherwise **Stable**.

### B. Forecaster Evaluation (MAE)
The model holds back the final 6 months as an out-of-sample test and compares OLS regression against:
1. **Persistence:** Repeats month 30.
2. **Seasonal-Naive:** Repeats the value from 12 months earlier.
$$\text{MAE} = \text{AVERAGE}(\text{ABS}(\text{Actual} - \text{Predicted}))$$
The model with the lowest MAE is declared the winner on that window. If OLS is beaten, the app openly states it.

### C. Retail Audit Frequency & Binomial Uncertainty
- **Observed Frequency:** $k / n \times 100$ (e.g. 8 of 50 items = $16.0\%$).
- **Wilson 95% Confidence Interval:** Calculates the sample proportion's confidence range (e.g. $8.34\%$ to $28.51\%$ for $k = 8, n = 50$).
- **Retail Visibility:** **Visible** if frequency $\ge 10.0\%$ **and** present in $\ge 2$ retailers; otherwise **Low**.

---

## 3. Honest Scientific Disclaimers

1. **No Claims of Sales or Demand:** The retail audit records what is on display on retailer websites on one date. It does not measure customer purchases, units sold, or revenue.
2. **No "Search Volume" Claims:** Google Trends numbers are relative indices (0–100) within the query comparison set, not absolute counts of queries.
3. **No Black-Box AI:** All forecasts are deterministic OLS linear extrapolations with full mathematical proofs provided in the app.

