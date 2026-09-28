import React from "react";
import { Play, Clock, CheckCircle, AlertTriangle, Terminal, Database, FileText, Mail, BarChart3, UploadCloud } from "lucide-react";
import { SystemStatus } from "../types";

interface HeaderProps {
  status: SystemStatus | null;
  isRunning: boolean;
  onRunPipeline: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  isRunning,
  onRunPipeline,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-sm shadow-indigo-200">
              RB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  ReportBot
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {status?.status || "HEALTHY"}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Automated Sales Analytics Pipeline & PDF Delivery
              </p>
            </div>
          </div>

          {/* Quick Schedule & Run Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                Schedule: <strong className="text-slate-800">Daily @ {status?.scheduleTime || "09:00"} AM</strong>
              </span>
            </div>

            <button
              id="btn-run-pipeline-now"
              onClick={onRunPipeline}
              disabled={isRunning}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-xs ${
                isRunning
                  ? "bg-indigo-400 text-white cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 active:scale-98"
              }`}
            >
              <Play className={`w-4 h-4 ${isRunning ? "animate-spin" : "fill-current"}`} />
              <span>{isRunning ? "Executing Pipeline..." : "Run Pipeline Now"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {[
            { id: "overview", label: "Executive Analytics", icon: BarChart3 },
            { id: "ingestion", label: "CSV Ingestion & Quarantine", icon: UploadCloud, badge: status?.quarantineCount },
            { id: "reports", label: "PDF Reports", icon: FileText, badge: status?.totalRuns },
            { id: "email", label: "Email Delivery", icon: Mail },
            { id: "cli", label: "CLI & Diagnostics", icon: Terminal },
            { id: "history", label: "SQLite Audit Log", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      tab.id === "ingestion" && status?.quarantineCount
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
