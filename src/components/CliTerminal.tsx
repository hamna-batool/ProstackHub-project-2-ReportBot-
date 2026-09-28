import React, { useState } from "react";
import { Terminal as TerminalIcon, Play, Copy, Check, Sparkles, Clock, AlertCircle } from "lucide-react";

export const CliTerminal: React.FC = () => {
  const [activeCommand, setActiveCommand] = useState<string>("reportbot --status");
  const [terminalOutput, setTerminalOutput] = useState<string>(
    `====================================================================\n  REPORTBOT PIPELINE MONITOR & HEALTH DIAGNOSTICS\n====================================================================\n  System Status         : [HEALTHY / ACTIVE]\n  Background Schedule   : Daily execution automated at 09:00 AM UTC\n  Incoming Queue Watch  : 0 file(s) pending in /data/incoming/\n  Total Historical Runs : 1 run(s) logged in SQLite\n  Quarantine Flag Count : 3 malformed row(s) isolated in /data/quarantine/\n--------------------------------------------------------------------\n  Ready to execute CLI diagnostic commands.\n====================================================================`
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const executeCommand = async (cmdToRun: string) => {
    setIsExecuting(true);
    try {
      const res = await fetch("/api/cli/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmdToRun }),
      });
      const data = await res.json();
      setTerminalOutput(data.output || "No output returned.");
    } catch (err: any) {
      setTerminalOutput(`Execution error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(terminalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-indigo-600" />
            ReportBot Command-Line Interface (CLI)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Symlinked to <code className="bg-slate-100 px-1 rounded font-mono text-indigo-700">/usr/local/bin/reportbot</code>. Exposes flags for health diagnostics, pipeline execution, test generation, and daemon scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3.5 h-3.5" />
            Daily 9:00 AM UTC Cron Active
          </span>
        </div>
      </div>

      {/* Preset CLI Command Triggers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Check Health Status", cmd: "reportbot --status", desc: "View diagnostics and last run" },
          { label: "Run Pipeline Now", cmd: "reportbot --run-now", desc: "Ingest CSVs, make PDF, deliver email" },
          { label: "Generate Sample Batch", cmd: "reportbot --generate-sample", desc: "Create sales CSV with test anomalies" },
          { label: "View CLI Flags & Help", cmd: "reportbot --help", desc: "Inspect all supported CLI options" },
        ].map((item) => (
          <button
            key={item.cmd}
            onClick={() => {
              setActiveCommand(item.cmd);
              executeCommand(item.cmd);
            }}
            disabled={isExecuting}
            className="p-3 text-left rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all text-xs group"
          >
            <div className="font-mono font-bold text-indigo-700 group-hover:text-indigo-900 mb-0.5">
              {item.cmd}
            </div>
            <div className="text-[11px] text-slate-500">{item.desc}</div>
          </button>
        ))}
      </div>

      {/* Terminal View Window */}
      <div className="rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-slate-950 font-mono text-xs">
        {/* Terminal Title Bar */}
        <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-slate-400 text-xs ml-2">bash - reportbot@production-container</span>
          </div>

          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 text-[11px] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Output"}</span>
          </button>
        </div>

        {/* Command Input Bar */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2">
          <span className="text-emerald-400 font-bold">$</span>
          <input
            type="text"
            value={activeCommand}
            onChange={(e) => setActiveCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                executeCommand(activeCommand);
              }
            }}
            placeholder="Type command (e.g. reportbot --status)"
            className="flex-1 bg-transparent text-slate-100 focus:outline-none text-xs font-mono"
          />
          <button
            onClick={() => executeCommand(activeCommand)}
            disabled={isExecuting}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-bold inline-flex items-center gap-1"
          >
            <Play className={`w-3 h-3 ${isExecuting ? "animate-spin" : "fill-current"}`} />
            <span>{isExecuting ? "Running..." : "Run"}</span>
          </button>
        </div>

        {/* Terminal Screen Output */}
        <div className="p-4 text-slate-300 max-h-96 overflow-y-auto whitespace-pre font-mono text-[11px] leading-relaxed">
          {terminalOutput}
        </div>
      </div>
    </div>
  );
};
