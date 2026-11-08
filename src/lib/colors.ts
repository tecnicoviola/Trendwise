export interface TrendColorToken {
  id: string;
  name: string;
  swatch: string;
  line: string;
  textColor: string;
  lightBg: string;
}

export const TREND_COLORS: Record<string, TrendColorToken> = {
  T001: {
    id: "T001",
    name: "Butter Yellow",
    swatch: "#F4E4A6",
    line: "#C9A227",
    textColor: "#544308",
    lightBg: "#FCF8E9",
  },
  T002: {
    id: "T002",
    name: "Burgundy",
    swatch: "#7A1F32",
    line: "#7A1F32",
    textColor: "#FFFFFF",
    lightBg: "#F7E6E9",
  },
  T003: {
    id: "T003",
    name: "Chocolate Brown",
    swatch: "#4A2C20",
    line: "#4A2C20",
    textColor: "#FFFFFF",
    lightBg: "#F2EBE8",
  },
  T004: {
    id: "T004",
    name: "Powder Blue",
    swatch: "#B7D0E3",
    line: "#5B8DB5",
    textColor: "#1A3950",
    lightBg: "#F0F6FA",
  },
  T005: {
    id: "T005",
    name: "Sage Green",
    swatch: "#9DB08A",
    line: "#6F8A5A",
    textColor: "#2B3C23",
    lightBg: "#F2F5F0",
  },
};

export function getTrendColor(trendIdOrName: string): TrendColorToken {
  if (TREND_COLORS[trendIdOrName]) {
    return TREND_COLORS[trendIdOrName];
  }

  const normalized = trendIdOrName.trim().toLowerCase();
  for (const token of Object.values(TREND_COLORS)) {
    if (token.name.toLowerCase() === normalized) {
      return token;
    }
  }

  // Fallback neutral
  return {
    id: "other",
    name: trendIdOrName,
    swatch: "#D4D2C9",
    line: "#73816B",
    textColor: "#20211F",
    lightBg: "#F7F6F2",
  };
}

