# TRENDWISE — Methodology Specification & Live Proofs

*Fashion Intelligence & Trend Forecasting · NIFT First-Semester End-Term Research*

---

## 1. System Pipeline Overview

TRENDWISE analyses **two independent observational signals** side by side for five core colour trends in India:
1. **Consumer Search Trajectory:** Google Trends relative search interest (India market, 36 complete monthly aggregates, scale 0–100).
2. **Retail Shelf Presence:** A documented manual fashion audit snapshot of 50 products across three fashion retailers (Women's Tops, New Arrivals).

These datasets remain strictly separate. They are **never aggregated into an arbitrary composite score** (such as a hypothetical score *T*), and the fashion market snapshot is **never forecast**.

---

## 2. Consumer Search Statistics & Extrapolation

Let the series of $n$ complete monthly points be $y_1, y_2, \dots, y_n$ where $x = 1, 2, \dots, n$.

### 2.1 Ordinary Least Squares (OLS) Linear Regression
- Mean index: $\bar{x} = \frac{n + 1}{2}$
- Mean search interest: $\bar{y} = \frac{1}{n} \sum_{i=1}^n y_i$
- Sum of squared deviations for $x$: $S_{xx} = \sum_{i=1}^n (x_i - \bar{x})^2$
- Slope: $b_1 = \frac{\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})}{S_{xx}}$
- Intercept: $b_0 = \bar{y} - b_1 \bar{x}$
- Fitted values: $\hat{y}_i = b_0 + b_1 x_i$
- Sum of Squared Errors: $\text{SSE} = \sum_{i=1}^n (y_i - \hat{y}_i)^2$
- Total Sum of Squares: $\text{SST} = \sum_{i=1}^n (y_i - \bar{y})^2$
- Coefficient of Determination: $R^2 = 1 - \frac{\text{SSE}}{\text{SST}}$ (reported as `null` / `n/a` when $\text{SST} = 0$).
- Standard error of regression: $s = \sqrt{\frac{\text{SSE}}{n - 2}}$ for $n > 2$.

### 2.2 Normalised Slope & Direction Classification
To allow meaningful comparison across terms with differing baselines, the slope is normalised as a percentage of the series mean per month:
$$\text{Normalised Slope} = \frac{b_1}{\bar{y}} \times 100$$

- **Increasing:** Normalised slope $> +0.5\%$ per month
- **Decreasing:** Normalised slope $< -0.5\%$ per month
- **Stable:** Between $-0.5\%$ and $+0.5\%$ per month (inclusive)
- **No Signal:** If $\bar{y} = 0$.

### 2.3 Year-on-Year (YoY) Change
Compensates for seasonal cycles by comparing the mean of the most recent 3 months ($n-2, n-1, n$) with the same 3-month quarter 12 months prior ($n-14, n-13, n-12$):
$$\text{YoY} = \left(\frac{\bar{y}_{\text{recent}}}{\bar{y}_{\text{earlier}}} - 1\right) \times 100$$
- If $\bar{y}_{\text{earlier}} < 5$, YoY returns `null` ("n/a, base too small").
- If $n < 15$, YoY returns `null`.
- **Direction:** $> +5\%$ is "up", $< -5\%$ is "down", otherwise "flat".
- **Mixed Signals Warning:** Triggered whenever the OLS slope direction and YoY direction contradict (e.g. Increasing slope with YoY down, or Decreasing slope with YoY up).

### 2.4 95% Prediction Interval Band
At future extrapolation point $x_0$:
$$\hat{y}_0 \pm t_{0.95, \, n-2} \cdot s \cdot \sqrt{1 + \frac{1}{n} + \frac{(x_0 - \bar{x})^2}{S_{xx}}}$$
where $t$ is the two-sided 95% critical value of Student's t-distribution with $n-2$ degrees of freedom. Displayed values are clipped to $[0, 100]$, while raw values are preserved in the data export.

---

## 3. Live Worked Mathematical Verification

Tested with reference dataset: $y = [40, 44, 43, 48, 50, 53]$ ($n = 6$, $x = 1, 2, 3, 4, 5, 6$):

- $\bar{x} = 3.5$
- $\bar{y} = 46.333$
- $S_{xx} = 17.5$
- Fitted slope $b_1 = 2.514$ points per month
- Intercept $b_0 = 37.533$
- $\text{SSE} = 6.705$
- $R^2 = 0.943$ (Strong linear fit)
- Extrapolation at $x = 7$: $\hat{y} = 55.133$
- Extrapolation at $x = 8$: $\hat{y} = 57.648$
- Extrapolation at $x = 9$: $\hat{y} = 60.162$
- 95% prediction interval half-width at $x = 7$: $\pm 4.91$ (Range: $50.22$ to $60.04$).

---

## 4. Out-of-Sample Forecaster Evaluation

To hold the model to strict scientific accountability:
- **Chronological Split:** The first 30 months serve as training; the final 6 months serve as an out-of-sample test set (never shuffled, zero lookahead leakage).
- **Competitor Models:**
  1. **Linear Regression (OLS):** Fitted on training data only and extended into the test period.
  2. **Persistence Baseline:** Repeats the final training month's observed value.
  3. **Seasonal-Naive Baseline:** Uses the actual value observed 12 months prior.
- **Metric:** Mean Absolute Error ($\text{MAE} = \frac{1}{k} \sum |\text{actual} - \text{predicted}|$).
- **Honesty Rule:** If a simple baseline achieves a lower MAE than OLS, the system openly reports that the straight-line model failed to beat the baseline.

---

## 5. Retail Market Audit & Signal Alignment

### 5.1 Binomial Uncertainty (Wilson Score Interval)
For observed count $k$ out of $n = 50$ sampled items at $z = 1.96$:
$$\text{Centre} = \frac{\hat{p} + \frac{z^2}{2n}}{1 + \frac{z^2}{n}}, \quad \text{Half} = \frac{z \sqrt{\frac{\hat{p}(1-\hat{p})}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}$$
For Butter Yellow ($k = 8, n = 50$): Observed frequency is $16.0\%$, with a 95% Wilson range of $8.34\%$ to $28.51\%$.

### 5.2 Retail Visibility Rule
- **Visible:** Frequency $\ge 10.0\%$ **and** present in $\ge 2$ retailers.
- **Low:** Otherwise (includes unobserved colours).

### 5.3 Signal Alignment Matrix
| Search Direction | Visible in Retail | Low in Retail |
| --- | --- | --- |
| **Increasing** | **Aligned rise** — Interest rising and already stocked | **Emerging signal** — Interest rising, little retail shelf presence yet |
| **Stable** | **Established** — Steady interest and consistently stocked | **Quiet** — Little market activity on either side |
| **Decreasing** | **Fading interest, still stocked** — Retail merchandising may lag search | **Aligned decline** — Interest falling and little on shelves |

*Mandatory notice: "This compares two observations. It does not predict retail performance."*

