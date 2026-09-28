import React from "react";
import { Database, CheckCircle2, Clock, FileText, Mail, AlertTriangle, ShieldCheck } from "lucide-react";
import { PipelineRun, EmailLog } from "../types";

interface HistoryLogProps {
  runs: PipelineRun[];
  emails: EmailLog[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ runs, emails }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            SQLite Audit Ledger & Execution Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable database records stored in <code className="bg-slate-100 px-1 rounded font-mono text-indigo-700">/data/reportbot.db</code> tracking runs, quarantined anomalies, compute latencies, and email deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Audit Ledger Synchronized
          </span>
        </div>
      </div>

      {/* Pipeline Runs Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Pipeline Execution History ({runs.length})
            </h3>
            <p className="text-xs text-slate-500">
              Schema: <code className="bg-slate-100 px-1 rounded font-mono text-[11px]">pipeline_runs</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Run ID & Trigger</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Rows (Valid / Quarantined)</th>
                <th className="py-2.5 px-3 text-right">Gross Revenue</th>
                <th className="py-2.5 px-3 text-right">AOV</th>
                <th className="py-2.5 px-3 text-right">MoM Growth</th>
                <th className="py-2.5 px-3 text-right">Latency</th>
                <th className="py-2.5 px-3 text-right">Email Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-slate-900">{run.run_id}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{run.trigger_type} trigger</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    {run.timestamp.slice(0, 19).replace("T", " ")}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        run.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {run.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-semibold text-slate-800">{run.valid_rows}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className={`font-semibold ${run.quarantined_rows > 0 ? "text-amber-700 font-bold" : "text-slate-500"}`}>
                      {run.quarantined_rows}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    ${Number(run.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700">
                    ${Number(run.aov || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        Number(run.mom_growth || 0) >= 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {Number(run.mom_growth || 0) >= 0 ? "+" : ""}
                      {run.mom_growth}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px]">
                    {run.duration_ms.toFixed(1)} ms
                  </td>
                  <td className="py-3 px-3 text-right">
                    {run.email_sent ? (
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Dispatched
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Delivery Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Email Dispatch Audit Ledger ({emails.length})
            </h3>
            <p className="text-xs text-slate-500">
              Schema: <code className="bg-slate-100 px-1 rounded font-mono text-[11px]">email_logs</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Run ID</th>
                <th className="py-2.5 px-3">Delivered To</th>
                <th className="py-2.5 px-3">CC / BCC</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 text-center">Attempts</th>
                <th className="py-2.5 px-3 text-right">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emails.map((em) => (
                <tr key={em.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{em.run_id}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{em.to_recipients}</td>
                  <td className="py-3 px-3 text-[11px] text-slate-500">
                    <div>CC: {em.cc_recipients || "none"}</div>
                    <div>BCC: {em.bcc_recipients || "none"}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-800 max-w-xs truncate">{em.subject}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                      {em.attempts} / 3
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      {em.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
