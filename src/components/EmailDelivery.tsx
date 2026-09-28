import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, RefreshCw, Paperclip, Shield, UserCheck, Eye } from "lucide-react";
import { EmailPreviewData } from "../types";

interface EmailDeliveryProps {
  emailPreview: EmailPreviewData | null;
  onRefresh: () => void;
}

export const EmailDelivery: React.FC<EmailDeliveryProps> = ({ emailPreview, onRefresh }) => {
  const [toInput, setToInput] = useState(emailPreview?.to || "executive-team@company.internal");
  const [ccInput, setCcInput] = useState(emailPreview?.cc || "finance-analytics@company.internal");
  const [bccInput, setBccInput] = useState(emailPreview?.bcc || "compliance-audit@company.internal");
  const [isSending, setIsSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setDispatchResult(null);

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: toInput,
          cc: ccInput,
          bcc: bccInput,
        }),
      });
      const data = await res.json();
      setDispatchResult(data);
      onRefresh();
    } catch (err: any) {
      setDispatchResult({ success: false, error: err.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            Automated Email Dispatch System
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Built using Python <code className="bg-slate-100 px-1 rounded font-mono text-indigo-700">smtplib</code> & <code className="bg-slate-100 px-1 rounded font-mono text-indigo-700">email.mime</code>. Delivers rich HTML summaries with embedded CID thumbnails, PDF attachments, and 3-attempt exponential backoff retry logic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Retry Engine Active (Max 3 Attempts)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Configuration & Dispatcher (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSendEmail} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              Delivery Recipients & Routing
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Recipient (To)
              </label>
              <input
                type="text"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="executive-team@company.internal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Carbon Copy (CC)
              </label>
              <input
                type="text"
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="finance-analytics@company.internal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blind Carbon Copy (BCC)
              </label>
              <input
                type="text"
                value={bccInput}
                onChange={(e) => setBccInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="compliance-audit@company.internal"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500">Attachment:</span>
                <span className="font-mono text-slate-800 truncate max-w-[200px]" title={emailPreview?.pdfAttachment}>
                  {emailPreview?.pdfAttachment || "Latest ReportLab PDF"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500">Payload Structure:</span>
                <span>Multipart/Mixed + Related CID</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500">Retry Protocol:</span>
                <span>Exponential (+2s, +4s, +8s)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs"
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? "animate-spin" : ""}`} />
              <span>{isSending ? "Executing Send with Retry Check..." : "Dispatch Email Now"}</span>
            </button>
          </form>

          {/* Dispatch Result Feedback */}
          {dispatchResult && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                dispatchResult.success !== false
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              <div className="font-bold mb-1 flex items-center gap-1.5">
                {dispatchResult.success !== false ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                {dispatchResult.success !== false ? "Delivery Dispatch Completed" : "Delivery Error"}
              </div>
              <p className="text-[11px] leading-relaxed">
                {dispatchResult.result?.details || dispatchResult.error || JSON.stringify(dispatchResult)}
              </p>
              {dispatchResult.result?.attempts && (
                <div className="mt-2 text-[10px] font-semibold text-emerald-700">
                  Total Delivery Attempts: {dispatchResult.result.attempts} / 3
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Real-time HTML Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">HTML Email Preview Simulator</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Rendered Client Template</span>
          </div>

          {/* Simulated Email Client Frame */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-inner flex-1 flex flex-col">
            {/* Simulated Email Client Header */}
            <div className="bg-slate-100 p-3 border-b border-slate-200 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-400 font-semibold text-[10px] uppercase">Subject:</span>
                <span className="font-bold text-slate-800">
                  {emailPreview?.subject || "[ReportBot] Executive Sales Analytics Report"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-400 font-semibold text-[10px] uppercase">To:</span>
                <span className="font-mono text-slate-700">{toInput}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-slate-400 font-semibold text-[10px] uppercase">CC:</span>
                <span className="font-mono text-slate-600">{ccInput}</span>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="p-6 bg-white flex-1 overflow-y-auto max-h-[480px]">
              {/* Email Branding */}
              <div className="border-b-2 border-indigo-600 pb-3 mb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">REPORTBOT</h4>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Automated Sales Analytics Pipeline
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Dear Executive Leadership,
                <br />
                <br />
                The daily automated analytics pipeline has completed processing incoming sales transactions for Run{" "}
                <strong className="font-mono text-slate-800">{emailPreview?.runId || "RUN-LATEST"}</strong>. The formal board-ready PDF document is attached to this dispatch.
              </p>

              {/* Highlight KPI Grid inside Email */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 mb-4 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Revenue</div>
                  <div className="text-sm font-black text-slate-900">
                    ${emailPreview?.kpis?.total_revenue?.toLocaleString() || "593,144"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Closed Orders</div>
                  <div className="text-sm font-black text-slate-900">
                    {emailPreview?.kpis?.total_orders || "120"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Average Order Value</div>
                  <div className="text-sm font-black text-slate-900">
                    ${emailPreview?.kpis?.aov?.toFixed(2) || "4,942.87"}
                  </div>
                </div>
              </div>

              {/* Embedded Thumbnail Preview */}
              <div className="mb-4">
                <div className="text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  Embedded Visual Analytics Snapshot (CID inline):
                </div>
                <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-100 max-h-48 flex items-center justify-center">
                  {emailPreview?.thumbnailUrl ? (
                    <img
                      src={emailPreview.thumbnailUrl}
                      alt="Embedded Report Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Chart thumbnail embedded via inline Content-ID header
                    </div>
                  )}
                </div>
              </div>

              {/* Attachment Pill */}
              <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs mb-4">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-indigo-900">
                    {emailPreview?.pdfAttachment || "ReportBot_Sales_Analytics.pdf"}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">PDF Attachment</span>
              </div>

              <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 text-center">
                Confidential & Proprietary. Automated delivery dispatched via ReportBot Daemon at 09:00 AM UTC.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
