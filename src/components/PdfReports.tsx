import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  ShieldCheck,
  Clock,
  Bell,
  BellOff,
  Save,
  Check,
  RotateCw,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Globe,
  Send,
  AlertCircle,
} from "lucide-react";
import { GeneratedReport, ScheduleConfig } from "../types";

interface PdfReportsProps {
  reports: GeneratedReport[];
  onGenerateReport: () => void;
  isGenerating: boolean;
  onShowToast?: (message: string, type?: "success" | "error") => void;
  onRefresh?: () => void;
}

const PRESET_HOURS = [
  {
    id: "morning",
    hour: "09:00",
    label: "Morning Briefing",
    timeStr: "09:00 AM UTC",
    sub: "Start of business day",
    icon: Coffee,
  },
  {
    id: "midday",
    hour: "12:00",
    label: "Midday Checkpoint",
    timeStr: "12:00 PM UTC",
    sub: "Lunch revenue review",
    icon: Sun,
  },
  {
    id: "close",
    hour: "17:00",
    label: "End of Day Digest",
    timeStr: "05:00 PM UTC",
    sub: "Daily closing wrap",
    icon: Sunset,
  },
  {
    id: "night",
    hour: "21:00",
    label: "Nightly Audit Batch",
    timeStr: "09:00 PM UTC",
    sub: "Full ledger reconciliation",
    icon: Moon,
  },
];

const AVAILABLE_HOURS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

export const PdfReports: React.FC<PdfReportsProps> = ({
  reports,
  onGenerateReport,
  isGenerating,
  onShowToast,
  onRefresh,
}) => {
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [activePdfName, setActivePdfName] = useState<string>("");

  // Scheduling Configuration State
  const [autoDelivery, setAutoDelivery] = useState<boolean>(true);
  const [preferredHours, setPreferredHours] = useState<string[]>(["09:00"]);
  const [deliveryDays, setDeliveryDays] = useState<string>("all");
  const [timezone, setTimezone] = useState<string>("UTC");
  const [recipient, setRecipient] = useState<string>("executive-team@company.internal");
  const [isSavingSchedule, setIsSavingSchedule] = useState<boolean>(false);
  const [scheduleSaveSuccess, setScheduleSaveSuccess] = useState<boolean>(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);

  // Fetch current schedule configuration
  useEffect(() => {
    const fetchScheduleConfig = async () => {
      try {
        setIsLoadingConfig(true);
        const res = await fetch("/api/config/schedule");
        if (res.ok) {
          const data: ScheduleConfig = await res.json();
          setAutoDelivery(data.autoDelivery ?? true);
          if (Array.isArray(data.preferredHours) && data.preferredHours.length > 0) {
            setPreferredHours(data.preferredHours);
          } else if (data.scheduleTime) {
            setPreferredHours([data.scheduleTime]);
          }
          if (data.deliveryDays) setDeliveryDays(data.deliveryDays);
          if (data.timezone) setTimezone(data.timezone);
          if (data.recipient) setRecipient(data.recipient);
        }
      } catch (err) {
        console.error("Failed to load delivery schedule config:", err);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchScheduleConfig();
  }, []);

  // Save updated schedule configuration
  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    setScheduleSaveSuccess(false);
    try {
      const primaryHour = preferredHours.length > 0 ? preferredHours[0] : "09:00";
      const payload = {
        autoDelivery,
        preferredHours,
        scheduleTime: primaryHour,
        deliveryDays,
        timezone,
      };

      const res = await fetch("/api/config/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setScheduleSaveSuccess(true);
        setTimeout(() => setScheduleSaveSuccess(false), 3500);
        if (onShowToast) {
          onShowToast(
            autoDelivery
              ? `Delivery schedule saved: Automatic PDF reports active at ${preferredHours.join(", ")} ${timezone}!`
              : "Automatic delivery disabled. PDF reports will now be generated manually.",
            "success"
          );
        }
        if (onRefresh) {
          onRefresh();
        }
      } else {
        if (onShowToast) {
          onShowToast(`Failed to save schedule: ${data.error || "Unknown error"}`, "error");
        }
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(`Network error saving schedule: ${err.message}`, "error");
      }
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Toggle preferred hour selection
  const handleToggleHour = (hour: string) => {
    if (preferredHours.includes(hour)) {
      // Don't remove if it's the only one selected
      if (preferredHours.length > 1) {
        setPreferredHours(preferredHours.filter((h) => h !== hour));
      } else if (onShowToast) {
        onShowToast("At least one preferred delivery hour must remain selected.", "error");
      }
    } else {
      // Add and keep sorted chronologically
      const updated = [...preferredHours, hour].sort();
      setPreferredHours(updated);
    }
  };

  // Set single preset hour
  const handleSelectPreset = (hour: string) => {
    if (!preferredHours.includes(hour)) {
      setPreferredHours([hour]);
    } else if (preferredHours.length > 1) {
      setPreferredHours([hour]);
    }
  };

  const formatAmPm = (hour24: string) => {
    const [hStr, mStr] = hour24.split(":");
    const h = parseInt(hStr, 10);
    const m = mStr || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Generator CTA */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            ReportLab Platypus Engine
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Executive PDF Report Publishing Suite
          </h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
            Multi-page boardroom-grade documents produced with ReportLab. Features a dedicated cover page, executive metrics summary, embedded Matplotlib analytics charts, formatted data tables, and dynamic headers/footers with two-pass page numbering.
          </p>
        </div>

        <button
          onClick={onGenerateReport}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-all shadow-md active:scale-98 whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          <span>{isGenerating ? "Compiling PDF..." : "Generate Fresh PDF"}</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* NEW: Automated Delivery Scheduling Configuration UI               */}
      {/* ==================================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-all hover:border-slate-300">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Automated Report Delivery Schedule
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  autoDelivery
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {autoDelivery ? (
                  <>
                    <Bell className="w-3 h-3 text-emerald-600" />
                    <span>Active &bull; {preferredHours.join(", ")} {timezone}</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-3 h-3 text-amber-600" />
                    <span>Paused &bull; Manual Only</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure automated background PDF compilation and scheduled email delivery to stakeholder distribution lists.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleSaveSchedule}
              disabled={isSavingSchedule || isLoadingConfig}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                scheduleSaveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              } disabled:opacity-50`}
            >
              {isSavingSchedule ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : scheduleSaveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Schedule Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Schedule</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration Body */}
        <div className="pt-5 space-y-6">
          {/* 1. Toggle 'Automatic Delivery' */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                  autoDelivery
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : "bg-slate-200 text-slate-500 border-slate-300"
                }`}
              >
                {autoDelivery ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <label htmlFor="auto-delivery-toggle" className="font-bold text-slate-900 text-sm cursor-pointer select-none">
                    Automatic delivery
                  </label>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                      autoDelivery ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {autoDelivery ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  When enabled, the daemon schedules automated pipeline runs, renders new ReportLab PDFs, and delivers email previews at your preferred hours.
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                {autoDelivery ? "Scheduled" : "Off"}
              </span>
              <button
                type="button"
                role="switch"
                id="auto-delivery-toggle"
                aria-checked={autoDelivery}
                onClick={() => setAutoDelivery(!autoDelivery)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  autoDelivery ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoDelivery ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2. Preferred Delivery Hours Selection */}
          <div className={`space-y-4 transition-opacity ${autoDelivery ? "opacity-100" : "opacity-45 pointer-events-none"}`}>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Preferred Delivery Hours ({preferredHours.length} selected)
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  Timezone: <strong>{timezone} (Daemon Time)</strong> &bull; Click chips to toggle hours
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Select one or more preferred hours of the day when executive PDF reports should be generated and distributed.
              </p>
            </div>

            {/* Quick Presets Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRESET_HOURS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = preferredHours.includes(preset.hour);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.hour)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/50 shadow-xs"
                        : "bg-slate-50/50 hover:bg-slate-100/70 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-xs font-bold text-slate-800">{preset.label}</span>
                      <div
                        className={`p-1 rounded-md ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-extrabold font-mono text-indigo-950">
                        {preset.timeStr}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                          Selected
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">{preset.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Multi-Hour Selector Chips */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                All Available Delivery Windows:
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_HOURS.map((hour) => {
                  const isSelected = preferredHours.includes(hour);
                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleToggleHour(hour)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-300/60"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-slate-400"
                        }`}
                      />
                      <span>{hour}</span>
                      <span className={`text-[10px] ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                        ({formatAmPm(hour)})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cadence and Distribution Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              {/* Delivery Frequency */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Delivery Frequency
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryDays"
                      value="all"
                      checked={deliveryDays === "all"}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Daily (7 days)</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryDays"
                      value="weekdays"
                      checked={deliveryDays === "weekdays"}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Weekdays (Mon-Fri)</span>
                  </label>
                </div>
              </div>

              {/* Timezone Configuration */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Timezone Standard
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>UTC (Coordinated Universal Time)</span>
                </div>
                <span className="text-[10px] text-slate-400">Synchronized with pipeline daemon</span>
              </div>

              {/* Recipient Target */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Delivery Destination
                </span>
                <div className="font-mono text-[11px] font-semibold text-slate-800 truncate" title={recipient}>
                  {recipient}
                </div>
                <span className="text-[10px] text-slate-400">Configured in SMTP dispatch settings</span>
              </div>
            </div>

            {/* Schedule Summary Banner */}
            <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-slate-800">
                  <strong>Cadence Summary:</strong> Reports will generate automatically{" "}
                  <strong>{deliveryDays === "weekdays" ? "every weekday" : "every day"}</strong> at{" "}
                  <strong className="text-indigo-700">{preferredHours.join(", ")} UTC</strong>.
                </span>
              </div>
              <span className="text-[11px] text-indigo-700 font-semibold hidden md:inline">
                Daemon Active &bull; Next check 09:00 AM UTC
              </span>
            </div>
          </div>

          {/* Notice when disabled */}
          {!autoDelivery && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Automatic Delivery Paused:</strong> Background scheduled runs are suspended. PDF reports will only be compiled when manually initiated via the <strong>Generate Fresh PDF</strong> button or CLI command <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">reportbot --run-now</code>.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Features Specs Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase mb-1">
            <ShieldCheck className="w-4 h-4" /> Dedicated Cover Page
          </div>
          <p className="text-xs text-slate-600">
            Navy branding theme, report title, run metadata, date stamp, and confidentiality notice.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase mb-1">
            <Layers className="w-4 h-4" /> Embedded Visual Charts
          </div>
          <p className="text-xs text-slate-600">
            Vector-rendered Matplotlib 300 DPI revenue graphs seamlessly embedded into the PDF body.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase mb-1">
            <FileText className="w-4 h-4" /> Styled Platypus Tables
          </div>
          <p className="text-xs text-slate-600">
            Auto-wrapped column cells, alternating row stripes, and formatted financial amounts.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase mb-1">
            <CheckCircle2 className="w-4 h-4" /> Two-Pass Page Numbering
          </div>
          <p className="text-xs text-slate-600">
            NumberedCanvas computes true "Page X of Y" total counts with running top headers.
          </p>
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Published PDF Reports ({reports.length})
            </h3>
            <p className="text-xs text-slate-500">
              Stored in <code className="bg-slate-100 px-1 rounded font-mono">/data/reports/</code> with download and inline view endpoints
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
            No PDF reports generated yet. Click "Generate Fresh PDF" or run the pipeline to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((rpt) => (
              <div
                key={rpt.filename}
                className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Thumbnail Header */}
                <div className="relative h-44 bg-slate-100 border-b border-slate-200 flex items-center justify-center overflow-hidden group">
                  {rpt.thumbnailUrl ? (
                    <img
                      src={rpt.thumbnailUrl}
                      alt="Report Chart Thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <FileText className="w-12 h-12 mb-1" />
                      <span className="text-xs font-medium">Executive PDF Document</span>
                    </div>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                    PDF 1.4
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm truncate mb-1" title={rpt.filename}>
                      {rpt.filename}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(rpt.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>{(rpt.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setSelectedPdfUrl(rpt.viewUrl);
                        setActivePdfName(rpt.filename);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Inline</span>
                    </button>
                    <a
                      href={rpt.downloadUrl}
                      download
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inline PDF Viewer Modal */}
      {selectedPdfUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-800 text-sm truncate">{activePdfName}</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/api/reports/download/${activePdfName}`}
                  download
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700"
                >
                  <Download className="w-3 h-3" />
                  Save File
                </a>
                <button
                  onClick={() => setSelectedPdfUrl(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 w-full bg-slate-200">
              <iframe
                src={selectedPdfUrl}
                title="ReportLab Generated PDF Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
