import React from "react";
import { generateTrendInterpretation } from "@/lib/forecasting/interpretation";
import { TrendAnalysis } from "@/types/forecast";
import { TrendAuditAnalysis } from "@/lib/audit/frequencies";
import { SignalAlignmentResult } from "@/types/data";
import { BookOpen, AlertTriangle } from "lucide-react";

interface InterpretationBlockProps {
  analysis: TrendAnalysis;
  auditAnalysis: TrendAuditAnalysis | null;
  alignment: SignalAlignmentResult | null;
  auditDate?: string;
}

export function InterpretationBlock({
  analysis,
  auditAnalysis,
  alignment,
  auditDate,
}: InterpretationBlockProps) {
  const auditSummary = auditAnalysis
    ? {
        date: auditDate || "2026-11-08",
        k: auditAnalysis.k,
        n: auditAnalysis.n,
        frequency: auditAnalysis.frequency,
        wilsonLowerPercent: auditAnalysis.wilson.lowerPercent,
        wilsonUpperPercent: auditAnalysis.wilson.upperPercent,
        coverageCount: auditAnalysis.retailerCoverageCount,
        totalRetailers: auditAnalysis.totalRetailers,
      }
    : undefined;

  const blocks = generateTrendInterpretation(analysis, auditSummary, alignment || undefined);

  return (
    <div className="rounded-2xl border border-editorial-border bg-surface p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-editorial-border pb-3">
        <BookOpen className="w-5 h-5 text-editorial-accent-strong" />
        <h3 className="text-lg font-serif font-bold text-editorial-text">
          Plain-Language Editorial Synthesis
        </h3>
      </div>

      <div className="space-y-3 text-xs md:text-sm text-editorial-text leading-relaxed">
        {/* Direction & Fit */}
        <p>
          {blocks.directionText} {blocks.fitText}
        </p>

        {/* YoY */}
        <p>{blocks.yoyText}</p>

        {/* Mixed Signals Alert */}
        {blocks.mixedSignalsText && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FAF5E6] border border-[#E8D4A2] text-xs text-[#8C6314] dark:bg-[#2E291C] dark:border-[#4A3E25] dark:text-[#E5C37A]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#B07A1E] dark:text-[#E5C37A]" />
            <p className="font-medium">{blocks.mixedSignalsText}</p>
          </div>
        )}

        {/* Extrapolation */}
        <p>{blocks.forecastText}</p>

        {/* Out-of-sample Evaluation */}
        {blocks.evaluationText && <p>{blocks.evaluationText}</p>}

        {/* Retail Snapshot */}
        {blocks.auditText && <p>{blocks.auditText}</p>}

        {/* Synthesized Alignment */}
        {blocks.alignmentText && (
          <div className="p-3.5 rounded-xl bg-surface-2 border border-editorial-border text-xs space-y-1">
            <p className="font-semibold text-editorial-text">Alignment Summary:</p>
            <p className="text-editorial-text">{blocks.alignmentText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
