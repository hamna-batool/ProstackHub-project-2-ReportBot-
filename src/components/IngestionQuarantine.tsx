import React, { useState } from "react";
import { UploadCloud, AlertTriangle, FileText, CheckCircle2, RefreshCw, Download, Info, ShieldAlert } from "lucide-react";
import { QuarantinedRecord, QuarantineFile } from "../types";

interface IngestionQuarantineProps {
  incomingFiles: string[];
  quarantinedRecords: QuarantinedRecord[];
  quarantineFiles: QuarantineFile[];
  onGenerateSample: () => void;
  onRefresh: () => void;
  isGenerating: boolean;
  onUploadSuccess: () => void;
}

export const IngestionQuarantine: React.FC<IngestionQuarantineProps> = ({
  incomingFiles,
  quarantinedRecords,
  quarantineFiles,
  onGenerateSample,
  onRefresh,
  isGenerating,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [activeRecord, setActiveRecord] = useState<QuarantinedRecord | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadMessage(null);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/incoming/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadMessage(`Uploaded successfully to /data/incoming/${data.filename}`);
        setSelectedFile(null);
        onUploadSuccess();
      } else {
        setUploadMessage(`Error: ${data.error || "Upload failed"}`);
      }
    } catch (err: any) {
      setUploadMessage(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Ingestion Queue & Schema Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incoming Queue Watcher (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-base font-bold text-slate-900">
                  Incoming Directory Watcher: <code className="text-xs bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">/data/incoming/</code>
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Continuously monitored. Any incoming CSV is automatically validated against schema types.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onGenerateSample}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "Generating..." : "Generate Test Sales Batch"}</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <form onSubmit={handleFileUpload} className="mb-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="csv-file-input"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">
                  {selectedFile ? selectedFile.name : "Choose CSV or drag and drop sales file"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Expected schema: order_id, order_date, customer_id, customer_name, product_id, quantity, unit_price...
                </p>
              </label>

              {selectedFile && (
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    {isUploading ? "Uploading..." : "Upload to /data/incoming/"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {uploadMessage && (
              <p className="text-xs font-medium text-indigo-700 mt-2 bg-indigo-50 px-3 py-1.5 rounded-md">
                {uploadMessage}
              </p>
            )}
          </form>

          {/* Files waiting in Queue */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Files Pending Ingestion ({incomingFiles.length})</span>
              <button onClick={onRefresh} className="text-[11px] text-indigo-600 hover:underline">
                Refresh Queue
              </button>
            </h3>

            {incomingFiles.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                Incoming queue is currently clear. Click <strong>"Generate Test Sales Batch"</strong> above or upload a CSV to test validation.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {incomingFiles.map((file) => (
                  <div key={file} className="p-3 flex items-center justify-between bg-white text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="font-mono font-medium text-slate-800">{file}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Pending Watcher
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schema Validation Rules Guide (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-indigo-600" />
            Validation Rules
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            ReportBot strictly isolates any rows failing these rules into <code className="bg-slate-100 px-1 rounded text-slate-700 font-mono">/data/quarantine/</code>
          </p>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block mb-0.5">Required Non-Null Fields</strong>
              order_id, customer_id, customer_name, product_id, product_name, category, region.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block mb-0.5">Date Type Format</strong>
              order_date must match ISO standard <code className="text-indigo-600 font-mono">YYYY-MM-DD</code>.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block mb-0.5">Numeric Boundaries</strong>
              quantity &ge; 1, unit_price &gt; $0.00, discount between 0.0 and 1.0, tax &ge; 0.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block mb-0.5">Isolation & Quarantine</strong>
              Failed records never break the pipeline; they are logged to SQLite and exported as quarantine CSV/JSON.
            </div>
          </div>
        </div>
      </div>

      {/* Quarantined Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Quarantined Malformed Rows ({quarantinedRecords.length})
            </h2>
            <p className="text-xs text-slate-500">
              Records rejected during CSV ingestion with exact error diagnostics
            </p>
          </div>

          {quarantineFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Export Logs:</span>
              {quarantineFiles.slice(0, 2).map((qf) => (
                <span
                  key={qf.filename}
                  className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono"
                >
                  <FileText className="w-3 h-3 text-slate-400" />
                  {qf.filename}
                </span>
              ))}
            </div>
          )}
        </div>

        {quarantinedRecords.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Zero Quarantined Anomalies</p>
            <p className="text-xs text-slate-500 mt-1">
              All processed rows passed schema and type validation without issues.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Run ID & Timestamp</th>
                  <th className="py-2.5 px-3">Source File & Row</th>
                  <th className="py-2.5 px-3">Validation Failure Reason</th>
                  <th className="py-2.5 px-3">Raw Malformed Data</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quarantinedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-800 font-semibold">{rec.run_id}</div>
                      <div className="text-[10px] text-slate-400">{rec.timestamp.slice(0, 19).replace("T", " ")}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-700">{rec.filename}</div>
                      <div className="text-[10px] text-amber-700 font-bold">Line #{rec.row_index}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-900 font-medium text-[11px] leading-tight">
                        {rec.validation_error}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {typeof rec.parsed_data === "object"
                        ? JSON.stringify(rec.parsed_data)
                        : rec.raw_data}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setActiveRecord(rec)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {activeRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Quarantine Anomaly Inspector
              </h3>
              <button
                onClick={() => setActiveRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Validation Failure:</span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                  {activeRecord.validation_error}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">File Name</span>
                  <strong className="text-slate-800">{activeRecord.filename}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Row Number</span>
                  <strong className="text-slate-800">Line #{activeRecord.row_index}</strong>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-0.5">Raw Payload:</span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {typeof activeRecord.parsed_data === "object"
                    ? JSON.stringify(activeRecord.parsed_data, null, 2)
                    : activeRecord.raw_data}
                </pre>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setActiveRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
