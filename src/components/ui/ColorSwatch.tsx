import React from "react";
import { getTrendColor } from "@/lib/colors";

interface ColorSwatchProps {
  trendId: string;
  trendName: string;
  aspectRatio?: "4/5" | "banner" | "circle" | "square";
  showCaption?: boolean;
  className?: string;
}

export function ColorSwatch({
  trendId,
  trendName,
  aspectRatio = "4/5",
  showCaption = true,
  className = "",
}: ColorSwatchProps) {
  const colorToken = getTrendColor(trendId || trendName);

  let aspectClass = "aspect-[4/5] w-full";
  if (aspectRatio === "banner") aspectClass = "h-48 md:h-64 w-full";
  if (aspectRatio === "circle") aspectClass = "w-10 h-10 rounded-full";
  if (aspectRatio === "square") aspectClass = "w-full aspect-square";

  return (
    <div className={`relative flex flex-col ${className}`}>
      <div
        className={`relative rounded-xl overflow-hidden shadow-inner border border-black/5 swatch-woven transition-transform duration-300 ${aspectClass}`}
        style={{ backgroundColor: colorToken.swatch }}
      >
        {/* Subtle cloth weave gradient effect */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 6px)`,
          }}
        />

        {/* Small corner label for banner / portrait mode */}
        {aspectRatio !== "circle" && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/20 backdrop-blur-sm text-white text-[11px] font-mono tracking-wider">
            {trendId}
          </div>
        )}
      </div>

      {showCaption && aspectRatio !== "circle" && (
        <span className="mt-1.5 text-[11px] text-editorial-text-2 italic tracking-wide text-center">
          Illustrative colour swatch
        </span>
      )}
    </div>
  );
}

