"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { ConsumerDataRow, FashionAuditRow, TrendDictionaryRow } from "@/types/data";
import { DEFAULT_TREND_DICTIONARY } from "../csv/schemas";
import { getInitialDemoData } from "./sample-data";

export type DataOrigin = "Synthetic demonstration" | "Real observations";

export interface AppState {
  consumerRows: ConsumerDataRow[];
  auditRows: FashionAuditRow[];
  dictionaryRows: TrendDictionaryRow[];
  consumerOrigin: DataOrigin;
  auditOrigin: DataOrigin;
  consumerFileName: string;
  auditFileName: string;
  dictionaryFileName?: string;
  transformationNotes: string[];
  rememberInBrowser: boolean;
  isLoading: boolean;
}

export type Action =
  | { type: "LOAD_DEMO_DATA" }
  | { type: "CLEAR_DATA" }
  | {
      type: "SET_CONSUMER_DATA";
      payload: {
        rows: ConsumerDataRow[];
        fileName: string;
        origin: DataOrigin;
        transformationNotes?: string[];
      };
    }
  | {
      type: "SET_AUDIT_DATA";
      payload: {
        rows: FashionAuditRow[];
        fileName: string;
        origin: DataOrigin;
      };
    }
  | {
      type: "SET_DICTIONARY_DATA";
      payload: {
        rows: TrendDictionaryRow[];
        fileName: string;
      };
    }
  | { type: "SET_REMEMBER_BROWSER"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean };

const initialDemo = getInitialDemoData();

const initialState: AppState = {
  consumerRows: initialDemo.consumerRows,
  auditRows: initialDemo.auditRows,
  dictionaryRows: DEFAULT_TREND_DICTIONARY,
  consumerOrigin: "Synthetic demonstration",
  auditOrigin: "Synthetic demonstration",
  consumerFileName: initialDemo.consumerFileName,
  auditFileName: initialDemo.auditFileName,
  transformationNotes: ["Default synthetic demonstration datasets loaded."],
  rememberInBrowser: false,
  isLoading: false,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_DEMO_DATA": {
      const demo = getInitialDemoData();
      return {
        ...state,
        consumerRows: demo.consumerRows,
        auditRows: demo.auditRows,
        dictionaryRows: DEFAULT_TREND_DICTIONARY,
        consumerOrigin: "Synthetic demonstration",
        auditOrigin: "Synthetic demonstration",
        consumerFileName: demo.consumerFileName,
        auditFileName: demo.auditFileName,
        transformationNotes: ["Loaded synthetic demonstration datasets."],
      };
    }
    case "CLEAR_DATA": {
      return {
        ...state,
        consumerRows: [],
        auditRows: [],
        consumerFileName: "",
        auditFileName: "",
        transformationNotes: ["All datasets cleared."],
      };
    }
    case "SET_CONSUMER_DATA": {
      return {
        ...state,
        consumerRows: action.payload.rows,
        consumerFileName: action.payload.fileName,
        consumerOrigin: action.payload.origin,
        transformationNotes: action.payload.transformationNotes || [
          `Imported consumer dataset '${action.payload.fileName}'.`,
        ],
      };
    }
    case "SET_AUDIT_DATA": {
      return {
        ...state,
        auditRows: action.payload.rows,
        auditFileName: action.payload.fileName,
        auditOrigin: action.payload.origin,
      };
    }
    case "SET_DICTIONARY_DATA": {
      return {
        ...state,
        dictionaryRows: action.payload.rows,
        dictionaryFileName: action.payload.fileName,
      };
    }
    case "SET_REMEMBER_BROWSER": {
      return {
        ...state,
        rememberInBrowser: action.payload,
      };
    }
    case "SET_LOADING": {
      return {
        ...state,
        isLoading: action.payload,
      };
    }
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

const STORAGE_KEY = "trendwise_saved_state_v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Restore from localStorage if rememberInBrowser was set previously
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rememberInBrowser) {
          if (parsed.consumerRows) {
            dispatch({
              type: "SET_CONSUMER_DATA",
              payload: {
                rows: parsed.consumerRows,
                fileName: parsed.consumerFileName || "saved_consumer.csv",
                origin: parsed.consumerOrigin || "Real observations",
              },
            });
          }
          if (parsed.auditRows) {
            dispatch({
              type: "SET_AUDIT_DATA",
              payload: {
                rows: parsed.auditRows,
                fileName: parsed.auditFileName || "saved_audit.csv",
                origin: parsed.auditOrigin || "Real observations",
              },
            });
          }
          dispatch({ type: "SET_REMEMBER_BROWSER", payload: true });
        }
      }
    } catch {
      // LocalStorage unavailable or permission denied
    }
  }, []);

  // Save to localStorage when state changes and rememberInBrowser is enabled
  useEffect(() => {
    try {
      if (state.rememberInBrowser) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            consumerRows: state.consumerRows,
            auditRows: state.auditRows,
            consumerOrigin: state.consumerOrigin,
            auditOrigin: state.auditOrigin,
            consumerFileName: state.consumerFileName,
            auditFileName: state.auditFileName,
            rememberInBrowser: true,
          })
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // LocalStorage failure
    }
  }, [
    state.rememberInBrowser,
    state.consumerRows,
    state.auditRows,
    state.consumerOrigin,
    state.auditOrigin,
    state.consumerFileName,
    state.auditFileName,
  ]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

