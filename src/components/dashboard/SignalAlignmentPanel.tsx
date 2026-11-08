import React from "react";
import { SignalAlignmentResult } from "@/types/data";
import { DirectionChip } from "../ui/DirectionChip";
import { Layers, ShieldAlert } from "lucide-react";

interface SignalAlignmentPanelProps {
  alignment: SignalAlignmentResult;
}

export function SignalAlignmentPanel({ alignment }: SignalAlignmentPanelProps) {
  return (
    <div className="rounded-2xl border border-editorial-border bg-surface p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-editorial-accent-strong" />
        <h3 className="text-lg font-serif font-bold text-editorial-text">
          Signal Alignment (Search Direction × Retail Shelf Presence)
        </h3>
      </div>

      {/* Two observation inputs into synthesized alignment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Signal A: Consumer Search */}
        <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-editorial-text-2">
            Observation 1: Consumer Search
          </span>
          <p className="text-sm font-semibold text-editorial-text">Search Trajectory</p>
          <div>
            <DirectionChip direction={alignment.searchDirection} />
          </div>
          <p className="text-[11px] text-editorial-text-2">
            Derived from 36-month OLS normalised slope.
          </p>
        </div>

        {/* Signal B: Retail Audit */}
        <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-editorial-text-2">
            Observation 2: Retail Market
          </span>
          <p className="text-sm font-semibold text-editorial-text">Shelf Visibility</p>
          <div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                alignment.retailVisibility === "Visible"
                  ? "bg-[#EBF3E8] text-[#335629] border-[#C2DCBC] dark:bg-[#1F2E1C] dark:text-[#A8D19C] dark:border-[#2F472B]"
                  : "bg-surface text-editorial-text-2 border-editorial-border"
              }`}
            >
              {alignment.retailVisibility}
            </span>
          </div>
          <p className="text-[11px] text-editorial-text-2">
            Visible if ≥ 10% frequency &amp; ≥ 2 retailers.
          </p>
        </div>

        {/* Output Synthesis */}
        <div className="p-4 rounded-xl border-2 border-editorial-accent/30 bg-[#FAF9F5] dark:bg-[#222521] dark:border-editorial-accent/50 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-editorial-accent-strong">
            Synthesized Alignment
          </span>
          <p className="text-base font-serif font-bold text-editorial-text">
            {alignment.label}
          </p>
          <p className="text-xs text-editorial-text leading-relaxed">
            {alignment.description}
          </p>
        </div>
      </div>

      {/* Mandatory Cautionary Sentence */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-2 text-xs text-editorial-text border border-editorial-border">
        <ShieldAlert className="w-4 h-4 text-editorial-warning shrink-0" />
        <span className="font-medium">{alignment.standardSentence}</span>
      </div>
    </div>
  );
}
