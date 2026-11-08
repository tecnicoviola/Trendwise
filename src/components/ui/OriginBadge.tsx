import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { DataOrigin } from "@/lib/data/store";

interface OriginBadgeProps {
  origin: DataOrigin;
  className?: string;
  size?: "sm" | "md";
}

export function OriginBadge({ origin, className = "", size = "md" }: OriginBadgeProps) {
  const isSynthetic = origin === "Synthetic demonstration";

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide uppercase border ${sizeClass} ${
        isSynthetic
          ? "bg-[#FAF5E6] text-[#8C6314] border-[#E8D4A2] dark:bg-[#2E291C] dark:text-[#E5C37A] dark:border-[#4A3E25]"
          : "bg-[#EBF3E8] text-[#335629] border-[#C2DCBC] dark:bg-[#1F2E1C] dark:text-[#A8D19C] dark:border-[#2F472B]"
      } ${className}`}
    >
      {isSynthetic ? (
        <>
          <Sparkles className="w-3 h-3 text-[#B07A1E] dark:text-[#E5C37A]" />
          <span>Synthetic demonstration data</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-3 h-3 text-[#5B7A52] dark:text-[#7BA071]" />
          <span>Real observations</span>
        </>
      )}
    </span>
  );
}
