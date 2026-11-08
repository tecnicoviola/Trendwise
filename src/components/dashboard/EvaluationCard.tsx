"use client";

import React, { useState } from "react";
import { EvaluationResult, ExtendedEvaluationResult } from "@/types/forecast";
import { ChevronDown, ChevronUp, CheckCircle, Award } from "lucide-react";

interface EvaluationCardProps {
  evaluation: EvaluationResult | null;
  rollingEvaluation: ExtendedEvaluationResult | null;
}

export function EvaluationCard({ evaluation, rollingEvaluation }: EvaluationCardProps) {
  const [showRolling, setShowRolling] = useState(false);

  if (!evaluation || !evaluation.evaluated) {
    return (
      <div className="rounded-2xl border border-editorial-border bg-surface p-6">
        <h3 className="text-base font-serif font-bold text-editorial-text mb-2">
          Model Evaluation (Out-of-sample Test)
        </h3>
        <p className="text-xs text-editorial-text-2">
          Out-of-sample model evaluation requires at least 24 months of historical observations.
        </p>
      </div>
    );
  }

  const { models, bestModel, verdict } = evaluation;

  return (
    <div className="rounded-2xl border border-editorial-border bg-surface p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif font-bold text-editorial-text">
            Forecaster Evaluation (Hold-out Test: Last 6 Months)
          </h3>
          <p className="text-xs text-editorial-text-2 mt-0.5">
            Trained on first {evaluation.trainCount} months; tested on final {evaluation.testCount} months (chronological split, no data leakage).
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3E8] text-[#335629] border-[#C2DCBC] dark:bg-[#1F2E1C] dark:text-[#A8D19C] dark:border-[#2F472B] text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>Winner: {evaluation.bestModelName}</span>
        </div>
      </div>

      {/* Models Comparison Table */}
      <div className="overflow-x-auto border border-editorial-border rounded-xl text-xs">
        <table className="w-full text-left">
          <thead className="bg-surface-2 text-editorial-text-2 border-b border-editorial-border">
            <tr>
              <th className="p-3 font-semibold">Model Specification</th>
              <th className="p-3 font-semibold text-right">Test Error (MAE)</th>
              <th className="p-3 font-semibold text-center">Status</th>
              <th className="p-3 font-semibold">Logic</th>
            </tr>
          </thead>
          <tbody>
            {/* OLS */}
            <tr
              className={`border-b border-editorial-border/40 ${bestModel === "ols" ? "bg-editorial-accent/10 font-medium" : ""
                }`}
            >
              <td className="p-3 text-editorial-text font-semibold flex items-center gap-2">
                {bestModel === "ols" && <CheckCircle className="w-3.5 h-3.5 text-editorial-success" />}
                Linear Regression (OLS)
              </td>
              <td className="p-3 text-right font-mono tabular-nums text-sm font-bold text-editorial-text">
                {models.ols.mae.toFixed(2)} pts
              </td>
              <td className="p-3 text-center">
                {bestModel === "ols" ? (
                  <span className="px-2 py-0.5 rounded bg-editorial-success/20 text-editorial-success text-[10px] font-bold uppercase">
                    Best
                  </span>
                ) : (
                  <span className="text-editorial-text-2 text-[11px]">—</span>
                )}
              </td>
              <td className="p-3 text-editorial-text-2 text-[11px]">
                Fitted line extended from training window
              </td>
            </tr>

            {/* Persistence */}
            <tr
              className={`border-b border-editorial-border/40 ${bestModel === "persistence" ? "bg-editorial-accent/10 font-medium" : ""
                }`}
            >
              <td className="p-3 text-editorial-text font-semibold flex items-center gap-2">
                {bestModel === "persistence" && (
                  <CheckCircle className="w-3.5 h-3.5 text-editorial-success" />
                )}
                Persistence Baseline
              </td>
              <td className="p-3 text-right font-mono tabular-nums text-sm font-bold text-editorial-text">
                {models.persistence.mae.toFixed(2)} pts
              </td>
              <td className="p-3 text-center">
                {bestModel === "persistence" ? (
                  <span className="px-2 py-0.5 rounded bg-editorial-success/20 text-editorial-success text-[10px] font-bold uppercase">
                    Best
                  </span>
                ) : (
                  <span className="text-editorial-text-2 text-[11px]">—</span>
                )}
              </td>
              <td className="p-3 text-editorial-text-2 text-[11px]">
                Repeats the last observed training month
              </td>
            </tr>

            {/* Seasonal Naive */}
            <tr
              className={`${bestModel === "seasonal_naive" ? "bg-editorial-accent/10 font-medium" : ""
                }`}
            >
              <td className="p-3 text-editorial-text font-semibold flex items-center gap-2">
                {bestModel === "seasonal_naive" && (
                  <CheckCircle className="w-3.5 h-3.5 text-editorial-success" />
                )}
                Seasonal-Naive Baseline
              </td>
              <td className="p-3 text-right font-mono tabular-nums text-sm font-bold text-editorial-text">
                {models.seasonal_naive.mae.toFixed(2)} pts
              </td>
              <td className="p-3 text-center">
                {bestModel === "seasonal_naive" ? (
                  <span className="px-2 py-0.5 rounded bg-editorial-success/20 text-editorial-success text-[10px] font-bold uppercase">
                    Best
                  </span>
                ) : (
                  <span className="text-editorial-text-2 text-[11px]">—</span>
                )}
              </td>
              <td className="p-3 text-editorial-text-2 text-[11px]">
                Actual value from same month 1 year prior
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Honest Verdict Sentence */}
      <div className="p-3.5 rounded-xl bg-surface-2/60 border border-editorial-border text-xs text-editorial-text space-y-1">
        <p className="font-semibold text-editorial-accent-strong">Evaluation Verdict:</p>
        <p className="leading-relaxed">{verdict}</p>
      </div>

      {/* Collapsible Extended Rolling-Origin Evaluation */}
      {rollingEvaluation && rollingEvaluation.tested && (
        <div className="border border-editorial-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowRolling(!showRolling)}
            className="w-full flex items-center justify-between p-3.5 bg-surface-2/30 hover:bg-surface-2/60 text-xs font-semibold text-editorial-text transition-colors"
          >
            <span>
              Extended Evaluation: Walk-Forward Rolling Origins ({rollingEvaluation.originsCount} cutoffs)
            </span>
            {showRolling ? (
              <ChevronUp className="w-4 h-4 text-editorial-text-2" />
            ) : (
              <ChevronDown className="w-4 h-4 text-editorial-text-2" />
            )}
          </button>

          {showRolling && (
            <div className="p-4 bg-surface border-t border-editorial-border space-y-3 text-xs">
              <p className="text-editorial-text-2 text-[11px]">
                To avoid depending on a single test window, training was ended at months 24 through 33 and tested 3 months ahead each time.
              </p>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-surface-2/40 text-center">
                <div>
                  <p className="text-[10px] text-editorial-text-2 uppercase">Avg OLS MAE</p>
                  <p className="text-sm font-mono font-bold text-editorial-text">
                    {rollingEvaluation.averageMae.ols.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-editorial-text-2 uppercase">Avg Persistence MAE</p>
                  <p className="text-sm font-mono font-bold text-editorial-text">
                    {rollingEvaluation.averageMae.persistence.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-editorial-text-2 uppercase">Avg Seasonal-Naive MAE</p>
                  <p className="text-sm font-mono font-bold text-editorial-text">
                    {rollingEvaluation.averageMae.seasonal_naive.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-48 overflow-y-auto border border-editorial-border rounded text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-surface-2 sticky top-0 text-editorial-text-2">
                    <tr>
                      <th className="p-1.5 font-medium">Origin #</th>
                      <th className="p-1.5 font-medium">Train Cutoff</th>
                      <th className="p-1.5 font-medium text-right">OLS MAE</th>
                      <th className="p-1.5 font-medium text-right">Persistence MAE</th>
                      <th className="p-1.5 font-medium text-right">Seasonal-Naive MAE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rollingEvaluation.origins.map((o) => (
                      <tr key={o.origin} className="border-b border-editorial-border/30">
                        <td className="p-1.5 font-mono">Origin {o.origin}</td>
                        <td className="p-1.5 text-editorial-text-2">{o.trainEndMonth}</td>
                        <td className="p-1.5 text-right font-mono">{o.maeOls.toFixed(2)}</td>
                        <td className="p-1.5 text-right font-mono">{o.maePersistence.toFixed(2)}</td>
                        <td className="p-1.5 text-right font-mono">{o.maeSeasonalNaive.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
