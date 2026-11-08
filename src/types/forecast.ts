import { Direction, FitStrength } from "./data";

export interface MonthlyPoint {
  date: string; // YYYY-MM
  value: number; // 0-100
  isIncomplete?: boolean;
}

export interface StatsResult {
  mean: number;
  b0: number;
  b1: number;
  normalisedSlope: number; // percentage of mean per month
  r2: number | null; // null if SST == 0
  s: number; // standard error of regression
  direction: Direction;
  fit: FitStrength;
}

export interface YoYResult {
  value: number | null; // percentage change or null if base < 5 or < 15 months
  direction: "up" | "down" | "flat" | null;
  baseTooSmall: boolean;
  earlierMean: number | null;
  recentMean: number | null;
  message?: string;
}

export interface ForecastPoint {
  date: string;
  monthIndex: number; // 1-based relative or absolute
  raw: number;
  clipped: number; // clipped to 0-100
  lower: number; // 95% prediction interval lower bound clipped to 0-100
  upper: number; // 95% prediction interval upper bound clipped to 0-100
  halfWidth: number;
}

export interface EvaluationModelResult {
  model: "ols" | "persistence" | "seasonal_naive";
  name: string;
  mae: number;
  predictions: { date: string; actual: number; predicted: number; error: number }[];
}

export interface EvaluationResult {
  evaluated: boolean;
  trainCount: number;
  testCount: number;
  models: {
    ols: EvaluationModelResult;
    persistence: EvaluationModelResult;
    seasonal_naive: EvaluationModelResult;
  };
  bestModel: "ols" | "persistence" | "seasonal_naive" | "tied";
  bestModelName: string;
  verdict: string;
  olsBeatBaselines: boolean;
}

export interface RollingOriginResult {
  origin: number; // end of training month index (24..33)
  trainEndMonth: string;
  maeOls: number;
  maePersistence: number;
  maeSeasonalNaive: number;
}

export interface ExtendedEvaluationResult {
  tested: boolean;
  originsCount: number;
  averageMae: {
    ols: number;
    persistence: number;
    seasonal_naive: number;
  };
  origins: RollingOriginResult[];
}

export interface TrendAnalysis {
  trendId: string;
  trendName: string;
  category: string;
  series: MonthlyPoint[];
  stats: StatsResult | null;
  yoy: YoYResult | null;
  mixedSignals: boolean;
  forecast: ForecastPoint[];
  evaluation: EvaluationResult | null;
  rollingEvaluation: ExtendedEvaluationResult | null;
  warnings: string[];
}

