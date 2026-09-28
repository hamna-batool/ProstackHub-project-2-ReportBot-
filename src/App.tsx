import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { MetricCards } from "./components/MetricCards";
import { AnalyticsCharts } from "./components/AnalyticsCharts";
import { IngestionQuarantine } from "./components/IngestionQuarantine";
import { PdfReports } from "./components/PdfReports";
import { EmailDelivery } from "./components/EmailDelivery";
import { CliTerminal } from "./components/CliTerminal";
import { HistoryLog } from "./components/HistoryLog";
import { ExecutionSparklineWidget } from "./components/ExecutionSparklineWidget";
import {
  SystemStatus,
  AnalyticsMetrics,
  QuarantinedRecord,
  QuarantineFile,
  GeneratedReport,
  EmailPreviewData,
  PipelineRun,
  EmailLog,
} from "./types";
import { CheckCircle2, AlertCircle, Sparkles, RefreshCw } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [quarantinedRecords, setQuarantinedRecords] = useState<QuarantinedRecord[]>([]);
  const [quarantineFiles, setQuarantineFiles] = useState<QuarantineFile[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [emailPreview, setEmailPreview] = useState<EmailPreviewData | null>(null);
  const [historyRuns, setHistoryRuns] = useState<PipelineRun[]>([]);
  const [historyEmails, setHistoryEmails] = useState<EmailLog[]>([]);
  const [incomingFiles, setIncomingFiles] = useState<string[]>([]);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Show temporary toast notification
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Load all system data
  const fetchData = async () => {
    try {
      // 1. Status & Metrics
      const statusRes = await fetch("/api/status");
      if (statusRes.ok) {
        const sData = await statusRes.json();
        setStatus(sData);
        if (sData.lastRun?.summary_json) {
          setMetrics(sData.lastRun.summary_json);
        }
        setIncomingFiles(sData.incomingFiles || []);
      }

      // If metrics not loaded from status, fetch direct
      const metricsRes = await fetch("/api/metrics");
      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        if (mData.metrics) {
          setMetrics(mData.metrics);
        }
      }

      // 2. Quarantine
      const qRes = await fetch("/api/quarantine");
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuarantinedRecords(qData.records || []);
        setQuarantineFiles(qData.files || []);
      }

      // 3. Reports
      const rRes = await fetch("/api/reports");
      if (rRes.ok) {
        const rData = await rRes.json();
        setReports(rData.reports || []);
      }

      // 4. Email Preview
      const eRes = await fetch("/api/email/preview");
      if (eRes.ok) {
        const eData = await eRes.json();
        setEmailPreview(eData);
      }

      // 5. History
      const hRes = await fetch("/api/history");
      if (hRes.ok) {
        const hData = await hRes.json();
        setHistoryRuns(hData.runs || []);
        setHistoryEmails(hData.emails || []);
      }
    } catch (err) {
      console.error("Error fetching pipeline data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s background sync
    return () => clearInterval(interval);
  }, []);

  // Run full pipeline now
  const handleRunPipeline = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "ui_manual" }),
      });
      const data = await res.json();
      if (data.success) {
        const runId = data.latestRun?.run_id || "NEW-RUN";
        const valRows = data.latestRun?.valid_rows ?? 0;
        const qRows = data.latestRun?.quarantined_rows ?? 0;
        showToast(
          `Pipeline run ${runId} completed: ${valRows} valid rows computed, ${qRows} quarantined, ReportLab PDF generated, and email delivered!`,
          "success"
        );
        fetchData();
      } else {
        showToast(`Pipeline execution failed: ${data.error || "Unknown error"}`, "error");
      }
    } catch (err: any) {
      showToast(`Network error: ${err.message}`, "error");
    } finally {
      setIsRunning(false);
    }
  };

  // Generate sample CSV into /data/incoming/
  const handleGenerateSample = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/incoming/generate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("Fresh sales transaction batch with test anomalies generated in /data/incoming/!", "success");
        fetchData();
      } else {
        showToast(`Generation failed: ${data.error}`, "error");
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              notification.type === "success"
                ? "bg-emerald-900 text-white border-emerald-700"
                : "bg-red-900 text-white border-red-700"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-300" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        status={status}
        isRunning={isRunning}
        onRunPipeline={handleRunPipeline}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Top Deck (always visible on Overview) */}
        {metrics && (
          <MetricCards
            kpis={metrics.kpis}
            quarantineCount={status?.quarantineCount || quarantinedRecords.length}
          />
        )}

        {/* Tab Views */}
        {activeTab === "overview" && (
          <div>
            {/* Execution Times Sparkline Widget for Last 10 Runs */}
            <ExecutionSparklineWidget
              historyRuns={historyRuns}
              onTriggerRun={handleRunPipeline}
              isRunning={isRunning}
            />

            {metrics ? (
              <AnalyticsCharts metrics={metrics} />
            ) : (
              <div className="p-12 text-center rounded-xl bg-white border border-slate-200">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">Loading Analytics Engine...</h3>
                <p className="text-xs text-slate-500">
                  Retrieving computed metrics from SQLite and ReportBot pipeline
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "ingestion" && (
          <IngestionQuarantine
            incomingFiles={incomingFiles}
            quarantinedRecords={quarantinedRecords}
            quarantineFiles={quarantineFiles}
            onGenerateSample={handleGenerateSample}
            onRefresh={fetchData}
            isGenerating={isGenerating}
            onUploadSuccess={() => {
              showToast("File uploaded to /data/incoming/. Click 'Run Pipeline Now' to process.", "success");
              fetchData();
            }}
          />
        )}

        {activeTab === "reports" && (
          <PdfReports
            reports={reports}
            onGenerateReport={handleRunPipeline}
            isGenerating={isRunning}
            onShowToast={showToast}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "email" && (
          <EmailDelivery emailPreview={emailPreview} onRefresh={fetchData} />
        )}

        {activeTab === "cli" && <CliTerminal />}

        {activeTab === "history" && (
          <HistoryLog runs={historyRuns} emails={historyEmails} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <strong>ReportBot Enterprise Analytics</strong> &bull; Python Pandas &bull; ReportLab Platypus &bull; SMTPLib &bull; SQLite
          </div>
          <div className="flex items-center gap-3">
            <span>Daemon Schedule: 09:00 AM UTC</span>
            <span>&bull;</span>
            <span>Local Quarantine: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
