import { SignalAlignmentResult } from "@/types/data";
import { TrendAnalysis } from "@/types/forecast";

export interface AuditSummaryForInterpretation {
  date: string;
  k: number;
  n: number;
  frequency: number;
  wilsonLowerPercent: number;
  wilsonUpperPercent: number;
  coverageCount: number;
  totalRetailers: number;
}

export interface TrendInterpretationBlocks {
  directionText: string;
  fitText: string;
  yoyText: string;
  mixedSignalsText?: string;
  forecastText: string;
  evaluationText?: string;
  auditText?: string;
  alignmentText?: string;
  standardCautionSentence: string;
}

/**
 * Formats deterministic plain-language interpretation sentences based strictly on computed metrics.
 * Follows the exact sentence templates required by Section 6 without ever using forbidden words like 'will'.
 */
export function generateTrendInterpretation(
  analysis: TrendAnalysis,
  auditSummary?: AuditSummaryForInterpretation,
  alignment?: SignalAlignmentResult
): TrendInterpretationBlocks {
  const { trendName, series, stats, yoy, mixedSignals, forecast, evaluation } = analysis;
  const n = series.length;

  // 1. Direction
  let directionText = "";
  if (stats) {
    const sign = stats.b1 > 0 ? "+" : "";
    directionText = `Relative search interest for ${trendName} in India has a ${stats.direction} straight-line trend over ${n} months (slope ${sign}${stats.b1.toFixed(3)} points per month, ${stats.normalisedSlope.toFixed(2)}% of average interest per month).`;
  } else {
    directionText = `Insufficient history for ${trendName} to determine a straight-line trend (requires at least 12 months).`;
  }

  // 2. Fit
  let fitText = "";
  if (stats && stats.r2 !== null) {
    const r2pct = (stats.r2 * 100).toFixed(1);
    fitText = `The line explains ${r2pct}% of the month-to-month movement (${stats.fit} fit).`;
  } else {
    fitText = "Goodness of fit (R²) is not applicable for this series.";
  }

  // 3. YoY
  let yoyText = "";
  if (yoy && yoy.value !== null) {
    const higherLower = yoy.value >= 0 ? "higher" : "lower";
    const absVal = Math.abs(yoy.value).toFixed(1);
    yoyText = `Compared with the same three months a year earlier, interest is ${absVal}% ${higherLower}.`;
  } else if (yoy?.baseTooSmall) {
    yoyText = "Year-on-year change cannot be calculated because the earlier base is too small.";
  } else {
    yoyText = "Year-on-year change requires at least 15 months of historical data.";
  }

  // 4. Mixed signals
  const mixedSignalsText = mixedSignals
    ? "The straight-line trend and the year-on-year change point in different directions, so treat the direction with extra caution."
    : undefined;

  // 5. Forecast
  let forecastText = "";
  if (forecast && forecast.length >= 3) {
    const v1 = forecast[0].clipped.toFixed(1);
    const v2 = forecast[1].clipped.toFixed(1);
    const v3 = forecast[2].clipped.toFixed(1);

    const l1 = forecast[0].lower.toFixed(1);
    const u1 = forecast[0].upper.toFixed(1);
    const l2 = forecast[1].lower.toFixed(1);
    const u2 = forecast[1].upper.toFixed(1);
    const l3 = forecast[2].lower.toFixed(1);
    const u3 = forecast[2].upper.toFixed(1);

    forecastText = `If the straight-line trend continued, the fitted line extends to ${v1}, ${v2} and ${v3} for the next three months (95% prediction range for each month: ${l1}–${u1}, ${l2}–${u2}, ${l3}–${u3}). This is a statistical extrapolation, not a guarantee.`;
  } else {
    forecastText = "A 3-month statistical extrapolation requires at least 12 months of historical observations.";
  }

  // 6. Evaluation
  let evaluationText: string | undefined = undefined;
  if (evaluation && evaluation.evaluated) {
    const maeOls = evaluation.models.ols.mae.toFixed(2);
    const maeP = evaluation.models.persistence.mae.toFixed(2);
    const maeS = evaluation.models.seasonal_naive.mae.toFixed(2);
    const best = evaluation.bestModelName;

    let evalBase = `On the last 6 months, held back as a test, the average error (MAE) was ${maeOls} points for linear regression, ${maeP} for the persistence baseline and ${maeS} for the seasonal-naive baseline. ${best} had the lowest error on this window.`;
    if (!evaluation.olsBeatBaselines) {
      evalBase += " The straight line did not beat the simplest baseline on this window.";
    }
    evaluationText = evalBase;
  }

  // 7. Audit
  let auditText: string | undefined = undefined;
  if (auditSummary) {
    const { date, k, n: sampleN, frequency, wilsonLowerPercent, wilsonUpperPercent, coverageCount, totalRetailers } = auditSummary;
    auditText = `In the audit snapshot taken on ${date}, ${trendName} appeared in ${k} of ${sampleN} sampled women's tops (${frequency.toFixed(1)}%, 95% range ${wilsonLowerPercent.toFixed(1)}–${wilsonUpperPercent.toFixed(1)}%) across ${coverageCount} of ${totalRetailers} retailers. The audit is a one-day snapshot and does not show growth or sales.`;
  }

  // 8. Alignment
  let alignmentText: string | undefined = undefined;
  if (alignment) {
    alignmentText = `${alignment.label}: ${alignment.description} ${alignment.standardSentence}`;
  }

  return {
    directionText,
    fitText,
    yoyText,
    mixedSignalsText,
    forecastText,
    evaluationText,
    auditText,
    alignmentText,
    standardCautionSentence: "This compares two observations. It does not predict retail performance.",
  };
}

