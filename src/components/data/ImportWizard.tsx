"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  FileText,
  Download,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useStore, DataOrigin } from "@/lib/data/store";
import { parseCSV, stringifyCSV } from "@/lib/csv/parse";
import { validateConsumerData, validateFashionAudit } from "@/lib/csv/validate";
import {
  parseRawGoogleTrendsExport,
  convertGoogleTrendsToLongFormat,
  GoogleTrendsParsedExport,
} from "@/lib/csv/google-trends-export";
import { ValidationResult } from "@/types/data";

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type DetectedFileType =
  | "consumer_interest"
  | "fashion_audit"
  | "trend_dictionary"
  | "google_trends_raw"
  | "unknown";

export function ImportWizard({ isOpen, onClose }: ImportWizardProps) {
  const { state, dispatch } = useStore();

  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileType, setFileType] = useState<DetectedFileType>("unknown");
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [transformations, setTransformations] = useState<string[]>([]);
  const [chosenOrigin, setChosenOrigin] = useState<DataOrigin | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Raw Google Trends metadata form fields
  const [rawGoogleParsed, setRawGoogleParsed] = useState<GoogleTrendsParsedExport | null>(null);
  const [gtRegion, setGtRegion] = useState("India");
  const [gtCollectionDate, setGtCollectionDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [gtQueryGroup, setGtQueryGroup] = useState(`india-colours-5y-${new Date().toISOString().substring(0, 10)}`);
  const [gtTimeRange, setGtTimeRange] = useState("5 years");
  const [gtSearchCategory, setGtSearchCategory] = useState("All categories");
  const [convertedMonthlyCSV, setConvertedMonthlyCSV] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const resetImport = () => {
    setFile(null);
    setFileContent("");
    setFileType("unknown");
    setRawRows([]);
    setValidation(null);
    setTransformations([]);
    setChosenOrigin(null);
    setRawGoogleParsed(null);
    setConvertedMonthlyCSV(null);
    setImportStatus("idle");
    setStatusMessage("");
  };

  const handleCancel = () => {
    resetImport();
    onClose();
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setImportStatus("error");
      setStatusMessage("Only .csv files are supported.");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      detectAndValidate(content, selectedFile.name);
    };
    reader.readAsText(selectedFile);
  };

  const detectAndValidate = (csvText: string, fileName: string) => {
    setTransformations([]);
    // Check if raw Google Trends export
    try {
      const parsedGT = parseRawGoogleTrendsExport(csvText);
      setFileType("google_trends_raw");
      setRawGoogleParsed(parsedGT);
      setGtTimeRange(`${parsedGT.firstDate} to ${parsedGT.lastDate}`);
      setTransformations([
        `Identified raw Google Trends export with ${parsedGT.terms.length} search terms.`,
        `Header found at line ${parsedGT.detectedHeaderLine} (${parsedGT.detectedGranularity} granularity).`,
        `Counted ${parsedGT.lessThanOneCount} values of '<1' which will be handled as 0.`,
      ]);
      setRawRows(parsedGT.rawRows.slice(0, 10));
      return;
    } catch {
      // Not raw Google Trends export, parse standard CSV
    }

    const { data } = parseCSV(csvText);
    if (!data || data.length === 0) {
      setFileType("unknown");
      setValidation({
        valid: false,
        errors: [{ type: "error", message: "File is empty or contains no readable rows." }],
        warnings: [],
        info: [],
        rowCount: 0,
      });
      return;
    }

    const sampleRow = data[0];
    const keys = Object.keys(sampleRow);

    if (keys.includes("audit_id") && keys.includes("retailer") && keys.includes("audit_date")) {
      setFileType("fashion_audit");
      const val = validateFashionAudit(data);
      setValidation(val);
      setRawRows(data.slice(0, 10));
      setTransformations([`Parsed ${data.length} fashion audit records.`]);
    } else if (keys.includes("trend_id") && keys.includes("search_interest") && keys.includes("collection_date")) {
      setFileType("consumer_interest");
      const val = validateConsumerData(data);
      setValidation(val);
      setRawRows(data.slice(0, 10));
      setTransformations([`Parsed ${data.length} consumer interest records.`]);
    } else if (keys.includes("trend_id") && keys.includes("attribute_type") && keys.includes("attribute_value")) {
      setFileType("trend_dictionary");
      setRawRows(data.slice(0, 10));
      setTransformations([`Parsed ${data.length} trend dictionary mappings.`]);
      setValidation({ valid: true, errors: [], warnings: [], info: [], rowCount: data.length });
    } else {
      setFileType("unknown");
      setValidation({
        valid: false,
        errors: [
          {
            type: "error",
            message:
              "Unrecognised layout: Could not detect Consumer Interest, Fashion Audit, or Trend Dictionary columns. Please verify column headers.",
          },
        ],
        warnings: [],
        info: [],
        rowCount: data.length,
      });
      setRawRows(data.slice(0, 10));
    }
  };

  const handlePerformImport = () => {
    if (!chosenOrigin) return;

    if (fileType === "google_trends_raw" && rawGoogleParsed) {
      try {
        const converted = convertGoogleTrendsToLongFormat(rawGoogleParsed, {
          region: gtRegion,
          collectionDate: gtCollectionDate,
          queryGroup: gtQueryGroup,
          timeRange: gtTimeRange,
          searchCategory: gtSearchCategory,
          termMappings: rawGoogleParsed.matchedTrends,
        });

        const val = validateConsumerData(converted.rows);
        if (!val.valid) {
          setValidation(val);
          setImportStatus("error");
          setStatusMessage("Converted Google Trends data failed validation.");
          return;
        }

        const csvOut = stringifyCSV(converted.rows);
        setConvertedMonthlyCSV(csvOut);

        dispatch({
          type: "SET_CONSUMER_DATA",
          payload: {
            rows: converted.rows,
            fileName: file?.name || "google_trends_converted.csv",
            origin: chosenOrigin,
            transformationNotes: converted.transformations,
          },
        });

        setImportStatus("success");
        setStatusMessage(
          `Successfully converted and imported ${converted.rows.length} monthly observations for ${Object.keys(rawGoogleParsed.matchedTrends).length} trend colours!`
        );
      } catch (err: any) {
        setImportStatus("error");
        setStatusMessage(err.message || "Failed to convert Google Trends export.");
      }
      return;
    }

    const { data } = parseCSV(fileContent);

    if (fileType === "consumer_interest") {
      dispatch({
        type: "SET_CONSUMER_DATA",
        payload: {
          rows: data,
          fileName: file?.name || "consumer_interest.csv",
          origin: chosenOrigin,
          transformationNotes: transformations,
        },
      });
      setImportStatus("success");
      setStatusMessage(`Successfully imported ${data.length} consumer interest records.`);
    } else if (fileType === "fashion_audit") {
      dispatch({
        type: "SET_AUDIT_DATA",
        payload: {
          rows: data,
          fileName: file?.name || "fashion_audit.csv",
          origin: chosenOrigin,
        },
      });
      setImportStatus("success");
      setStatusMessage(`Successfully imported ${data.length} fashion audit products.`);
    } else if (fileType === "trend_dictionary") {
      dispatch({
        type: "SET_DICTIONARY_DATA",
        payload: {
          rows: data,
          fileName: file?.name || "trend_dictionary.csv",
        },
      });
      setImportStatus("success");
      setStatusMessage(`Successfully imported ${data.length} trend dictionary mappings.`);
    }
  };

  const handleDownloadConverted = () => {
    if (!convertedMonthlyCSV) return;
    const blob = new Blob([convertedMonthlyCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "converted_consumer_monthly.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImportDisabled =
    !file ||
    (validation && !validation.valid) ||
    !chosenOrigin ||
    importStatus === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl border border-editorial-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-editorial-border bg-surface-2/40">
          <div>
            <h2 className="text-xl font-serif text-editorial-text font-bold">Import Dataset</h2>
            <p className="text-xs text-editorial-text-2 mt-0.5">
              Upload Consumer Interest, Fashion Audit, Trend Dictionary, or raw Google Trends exports.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-editorial-text-2 hover:bg-surface-2 hover:text-editorial-text transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Success screen */}
          {importStatus === "success" ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-editorial-success/10 text-editorial-success rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-editorial-text">Import Completed</h3>
              <p className="text-sm text-editorial-text-2 max-w-md mx-auto">{statusMessage}</p>

              {convertedMonthlyCSV && (
                <div className="pt-2">
                  <button
                    onClick={handleDownloadConverted}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-editorial-border text-sm font-medium text-editorial-accent-strong hover:bg-surface-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download converted monthly CSV
                  </button>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-lg bg-editorial-accent-strong text-white text-sm font-medium hover:bg-opacity-90"
                >
                  Done & View Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* File Dropzone */}
              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      processFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-editorial-border hover:border-editorial-accent rounded-xl p-8 text-center cursor-pointer bg-surface-2/30 hover:bg-surface-2/60 transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processFile(e.target.files[0]);
                      }
                    }}
                  />
                  <UploadCloud className="w-10 h-10 mx-auto text-editorial-muted mb-3" />
                  <p className="text-sm font-medium text-editorial-text">
                    Drag and drop your <span className="font-semibold">.csv</span> file here, or click to browse
                  </p>
                  <p className="text-xs text-editorial-text-2 mt-1">
                    Accepts consumer interest, fashion audit snapshot, or Google Trends exports.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-editorial-accent" />
                    <div>
                      <p className="text-sm font-medium text-editorial-text">{file.name}</p>
                      <p className="text-xs text-editorial-text-2">
                        {(file.size / 1024).toFixed(1)} KB · Detected as{" "}
                        <span className="font-semibold capitalize text-editorial-accent-strong">
                          {fileType.replace(/_/g, " ")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetImport}
                    className="text-xs text-editorial-error hover:underline flex items-center gap-1 font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Change file
                  </button>
                </div>
              )}

              {/* Raw Google Trends Metadata Form */}
              {fileType === "google_trends_raw" && rawGoogleParsed && (
                <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/40 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-editorial-text-2">
                    Google Trends Conversion Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-editorial-text-2 mb-1">Region</label>
                      <input
                        type="text"
                        value={gtRegion}
                        onChange={(e) => setGtRegion(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-editorial-border bg-surface text-editorial-text"
                      />
                    </div>
                    <div>
                      <label className="block text-editorial-text-2 mb-1">Collection Date (YYYY-MM-DD)</label>
                      <input
                        type="date"
                        value={gtCollectionDate}
                        onChange={(e) => setGtCollectionDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-editorial-border bg-surface text-editorial-text"
                      />
                    </div>
                    <div>
                      <label className="block text-editorial-text-2 mb-1">Query Group Identifier</label>
                      <input
                        type="text"
                        value={gtQueryGroup}
                        onChange={(e) => setGtQueryGroup(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-editorial-border bg-surface text-editorial-text"
                      />
                    </div>
                    <div>
                      <label className="block text-editorial-text-2 mb-1">Time Range</label>
                      <input
                        type="text"
                        value={gtTimeRange}
                        onChange={(e) => setGtTimeRange(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-editorial-border bg-surface text-editorial-text"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Transformations log */}
              {transformations.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-editorial-text-2">
                    What the app did to your file
                  </h4>
                  <ul className="text-xs text-editorial-text bg-surface-2/30 rounded-lg p-3 border border-editorial-border/60 space-y-1">
                    {transformations.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-editorial-accent mt-0.5">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Feedback */}
              {validation && (
                <div className="space-y-2">
                  {validation.errors.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-[#FBECEB] border border-[#F1C8C5] text-xs text-[#7A2E26] dark:bg-[#301E1D] dark:border-[#4C2B29] dark:text-[#E5958E] space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Validation Errors ({validation.errors.length}) — Cannot import until fixed</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {validation.errors.map((err, i) => (
                          <li key={i}>{err.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.warnings.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-[#FAF5E6] border border-[#E8D4A2] text-xs text-[#8C6314] dark:bg-[#2E291C] dark:border-[#4A3E25] dark:text-[#E5C37A] space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Warnings ({validation.warnings.length})</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {validation.warnings.map((w, i) => (
                          <li key={i}>{w.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.info.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-surface-2 border border-editorial-border text-xs text-editorial-text space-y-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <Info className="w-4 h-4 shrink-0 text-editorial-accent" />
                        <span>Informational Notes ({validation.info.length})</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {validation.info.map((inf, i) => (
                          <li key={i}>{inf.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Data Preview (First 10 rows) */}
              {rawRows.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-editorial-text-2">
                    Data Preview (First 10 rows)
                  </h4>
                  <div className="max-h-44 overflow-x-auto overflow-y-auto border border-editorial-border rounded-lg bg-surface text-[11px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-2 sticky top-0 text-editorial-text-2 border-b border-editorial-border">
                        <tr>
                          {Object.keys(rawRows[0]).map((h) => (
                            <th key={h} className="p-2 font-medium whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rawRows.map((r, idx) => (
                          <tr key={idx} className="border-b border-editorial-border/40 hover:bg-surface-2/30">
                            {Object.values(r).map((v: any, cIdx) => (
                              <td key={cIdx} className="p-2 whitespace-nowrap text-editorial-text">
                                {typeof v === "object" ? JSON.stringify(v) : String(v)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Data Origin Selection (Mandatory) */}
              {file && (!validation || validation.valid) && (
                <div className="p-4 rounded-xl border border-editorial-border bg-surface-2/30 space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-editorial-text">
                      Step 5: Select Data Origin (Mandatory)
                    </h4>
                    <p className="text-xs text-editorial-text-2 mt-0.5">
                      Per project ethics rules, you must declare whether this file contains verified real-world
                      observations or synthetic demonstration data.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        chosenOrigin === "Real observations"
                          ? "bg-surface border-editorial-accent-strong shadow-sm ring-1 ring-editorial-accent-strong"
                          : "bg-surface hover:bg-surface-2 border-editorial-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="data_origin"
                        value="Real observations"
                        checked={chosenOrigin === "Real observations"}
                        onChange={() => setChosenOrigin("Real observations")}
                        className="mt-0.5 accent-editorial-accent-strong"
                      />
                      <div>
                        <p className="text-xs font-semibold text-editorial-text">Real observations</p>
                        <p className="text-[11px] text-editorial-text-2">
                          Actual Google Trends research or manual retail audit data.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        chosenOrigin === "Synthetic demonstration"
                          ? "bg-surface border-editorial-accent-strong shadow-sm ring-1 ring-editorial-accent-strong"
                          : "bg-surface hover:bg-surface-2 border-editorial-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="data_origin"
                        value="Synthetic demonstration"
                        checked={chosenOrigin === "Synthetic demonstration"}
                        onChange={() => setChosenOrigin("Synthetic demonstration")}
                        className="mt-0.5 accent-editorial-accent-strong"
                      />
                      <div>
                        <p className="text-xs font-semibold text-editorial-text">Synthetic / demonstration</p>
                        <p className="text-[11px] text-editorial-text-2">
                          Simulated demo data for prototyping or testing.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {importStatus !== "success" && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-editorial-border bg-surface-2/40">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "LOAD_DEMO_DATA" });
                  setImportStatus("success");
                  setStatusMessage("Default synthetic demonstration datasets loaded successfully.");
                }}
                className="text-xs font-medium text-editorial-text-2 hover:text-editorial-text flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Load demo data
              </button>
              <span className="text-editorial-muted">|</span>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "CLEAR_DATA" });
                  handleCancel();
                }}
                className="text-xs font-medium text-editorial-error hover:underline flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear data
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-editorial-border text-editorial-text text-xs font-medium hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isImportDisabled}
                onClick={handlePerformImport}
                className={`px-5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isImportDisabled
                    ? "bg-editorial-muted text-white/80 cursor-not-allowed"
                    : "bg-editorial-accent-strong text-white hover:bg-opacity-95 shadow-sm"
                }`}
              >
                Import Dataset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

