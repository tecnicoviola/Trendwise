import React from "react";
import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
import { Direction } from "@/types/data";

interface DirectionChipProps {
  direction: Direction;
  className?: string;
  showIcon?: boolean;
}

export function DirectionChip({ direction, className = "", showIcon = true }: DirectionChipProps) {
  let bgClass = "bg-surface-2 text-editorial-text border-editorial-border";
  let Icon = Minus;

  switch (direction) {
    case "Increasing":
      bgClass = "bg-[#EBF3E8] text-[#335629] border-[#C2DCBC] dark:bg-[#1F2E1C] dark:text-[#A8D19C] dark:border-[#2F472B]";
      Icon = TrendingUp;
      break;
    case "Decreasing":
      bgClass = "bg-[#FBECEB] text-[#7A2E26] border-[#F1C8C5] dark:bg-[#301E1D] dark:text-[#E5958E] dark:border-[#4C2B29]";
      Icon = TrendingDown;
      break;
    case "Stable":
      bgClass = "bg-[#F5F4ED] text-[#55564E] border-[#DBD9CE] dark:bg-[#242724] dark:text-[#C4C3BA] dark:border-[#363A36]";
      Icon = Minus;
      break;
    case "No signal":
      bgClass = "bg-surface-2 text-editorial-text-2 border-editorial-border";
      Icon = HelpCircle;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgClass} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{direction}</span>
    </span>
  );
}
