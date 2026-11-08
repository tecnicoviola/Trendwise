import Papa from "papaparse";
import { ConsumerDataRow, FashionAuditRow, TrendDictionaryRow } from "@/types/data";

export function parseCSV<T = any>(csvText: string): { data: T[]; errors: Papa.ParseError[]; meta: Papa.ParseMeta } {
  const result = Papa.parse<T>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
  });

  return {
    data: result.data,
    errors: result.errors,
    meta: result.meta,
  };
}

export function stringifyCSV(data: any[]): string {
  return Papa.unparse(data, {
    quotes: false,
    header: true,
  });
}

