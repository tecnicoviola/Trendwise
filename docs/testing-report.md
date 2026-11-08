# TRENDWISE — Comprehensive Verification & Testing Report

*Date: 8 November 2026 · Lead Engineer & QA*

---

## 1. Executive Test Summary

| Check Suite | Target Criteria | Status | Notes |
| --- | --- | --- | --- |
| **Unit Tests (Vitest)** | All 13 specification items pass | **PASSED (30/30)** | 6 test files covering all mathematical formulas, parsers, and edge cases |
| **Linter (ESLint)** | `npm run lint` exits 0 with 0 errors | **PASSED** | Clean pass across all components and libraries |
| **Production Build** | `npm run build` exits 0 with static pages | **PASSED** | Next.js App Router 9 static pages pre-rendered cleanly |
| **Export/Import Roundtrip** | Exported CSV re-imports with identical numbers | **PASSED** | Verified via test `tests/synthetic-data-and-export.test.ts` |
| **Responsive Layout** | Tested from 1440px down to 360px | **PASSED** | Drawer navigation on mobile, horizontal table overflow, zero page-level clipping |

---

## 2. Unit Test Breakdown (Vitest)

All 30 tests passed with 0 failures:

```
 ✓ tests/wilson-and-alignment.test.ts (4 tests)
   - k = 8, n = 50 gives about 0.0834–0.2851
   - k = 0 lower bound 0; k = n upper bound 1
   - Retail visibility thresholds (10% with 2 retailers, 9.9% Low, 15% with 1 retailer Low)
   - All six Signal Alignment combinations produce standard caution sentence

 ✓ tests/yoy-and-direction.test.ts (3 tests)
   - YoY calculates +50% example correctly
   - YoY returns null when earlier base is below 5
   - Direction boundaries at 0.5 (Stable), 0.51 (Increasing), -0.51 (Decreasing), and mean 0 (No signal)

 ✓ tests/ols-and-tcrit.test.ts (4 tests)
   - OLS on y = 1,2,3,4,5: slope 1, intercept 0, R² 1
   - Constant series: slope 0, R² null, no NaN or crash
   - Worked example y = [40, 44, 43, 48, 50, 53]: slope 2.514, intercept 37.533, SSE 6.705, R² 0.943; forecasts 55.133, 57.648, 60.162; 95% half-width ±4.91
   - tCritical lookup and linear interpolation in 1/df: df 4 (2.776), 28 (2.048), 34 (2.032), 1000 (~1.96)

 ✓ tests/mae-and-evaluation.test.ts (7 tests)
   - MAE of actual [50, 52, 55] vs predicted [48, 53, 60] = 2.667
   - Seasonal series (12 values repeated): seasonal-naive MAE 0 and named best
   - Linear series y = 2 + 0.5x: OLS MAE 0 and named best
   - Series-length rules: n = 11 (no regression), n = 18 (regression, no evaluation), n = 24 (evaluation enabled)
   - Rolling origin walk-forward: 10 origins for n = 36

 ✓ tests/csv-parsers-and-validation.test.ts (9 tests)
   - Weekly-to-monthly aggregation: start-date grouping, partial collection month exclusion, incomplete month flagging
   - Raw Google Trends export parser: preamble stripping, '<1' conversion to 0 and counting, unknown layout error
   - Consumer validation: missing columns, invalid date, search_interest bounds, duplicate trend+month, multiple regions
   - Audit validation: duplicate audit_id, duplicate product_url, controlled vocabulary warnings

 ✓ tests/synthetic-data-and-export.test.ts (3 tests)
   - Synthetic fashion audit file: 50 rows, 17/17/16 retailer split, exact colour counts (Butter Yellow 8, Burgundy 6, Chocolate Brown 7, Powder Blue 5, Sage Green 6, Others 18), 0 errors
   - Synthetic consumer interest file: 180 rows, values 0–100, deterministic seed 2026, expected trend directions
   - Export then re-import gives identical numerical values
```

---

## 3. Responsive Screen Checks

- **1440px (Desktop Wide):** Full 264px sidebar, 1280px container max-width, 5-column small multiples grid, 4-column KPI cards.
- **1024px (Desktop Compact):** Sidebar collapsed to 72px icon strip or expanded, responsive 3-column charts, no horizontal overflow.
- **768px (Tablet):** Responsive breakpoint, sidebar switches to slide-over drawer triggered by header hamburger menu.
- **390px & 360px (Mobile):** Touch targets $\ge 40\text{px}$, vertical stack for small multiples and cards, horizontal scroll contained strictly inside table containers without window-level horizontal scroll.

---

## 4. Console & Runtime Check

- Zero console errors or unhandled exceptions across all pages: `/`, `/explore`, `/trend?id=T001`, `/analytics`, `/reports`, `/methodology`.
- Clean print styles verified via `@media print` with sidebar/topbar suppressed and A4 18mm margin styling.

