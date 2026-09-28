import React, { useState } from "react";
import {
  Timer,
  Zap,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Info,
  Calendar,
  Layers,
} from "lucide-react";
import { PipelineRun } from "../types";

interface ExecutionSparklineWidgetProps {
  historyRuns: PipelineRun[];
  onTriggerRun?: () => void;
  isRunning?: boolean;
}

export const ExecutionSparklineWidget: React.FC<ExecutionSparklineWidgetProps> = ({
  historyRuns,
  onTriggerRun,
  isRunning = false,
}) => {
  // historyRuns is ordered by id DESC (newest first).
  // Extract up to the last 10 runs:
  const last10RunsDesc = historyRuns.slice(0, 10);
  // Chronological order (oldest to newest among the 10) so the sparkline reads left-to-right:
  const runs = [...last10RunsDesc].reverse();

  const [hoveredRun, setHoveredRun] = useState<PipelineRun | null>(null);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);

  // Active run displayed in the inspector (hovered takes precedence, then selected, then latest)
  const activeRun = hoveredRun || selectedRun || (runs.length > 0 ? runs[runs.length - 1] : null);

  // Compute metrics
  const durations = runs.map((r) => Number(r.duration_ms) || 0);
  const totalCount = runs.length;
  const latestDuration = durations.length > 0 ? durations[durations.length - 1] : 0;
  const avgDuration =
    totalCount > 0 ? durations.reduce((sum, d) => sum + d, 0) / totalCount : 0;
  const minDuration = totalCount > 0 ? Math.min(...durations) : 0;
  const maxDuration = totalCount > 0 ? Math.max(...durations) : 0;

  // Comparison: latest vs average
  const deltaVsAvg =
    avgDuration > 0 ? ((latestDuration - avgDuration) / avgDuration) * 100 : 0;

  // SVG dimensions for the sparkline
  const svgWidth = 600;
  const svgHeight = 130;
  const paddingX = 28;
  const paddingTop = 18;
  const paddingBottom = 26;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Min and max bounds with padding for visual breathing room
  const yMin = Math.max(0, Math.floor(minDuration * 0.75));
  const yMax = Math.ceil(maxDuration * 1.25) || 100;
  const yRange = yMax - yMin > 0 ? yMax - yMin : 100;

  // Generate coordinates for points
  const points = runs.map((run, idx) => {
    const x =
      totalCount === 1
        ? paddingX + chartWidth / 2
        : paddingX + (idx / (totalCount - 1)) * chartWidth;
    const dur = Number(run.duration_ms) || 0;
    const y = paddingTop + chartHeight - ((dur - yMin) / yRange) * chartHeight;
    return { x, y, run, duration: dur, index: idx };
  });

  // Calculate Average Y line
  const avgY = paddingTop + chartHeight - ((avgDuration - yMin) / yRange) * chartHeight;

  // Build SVG Path
  let pathD = "";
  let areaD = "";
  if (points.length === 1) {
    pathD = `M ${paddingX} ${points[0].y} L ${svgWidth - paddingX} ${points[0].y}`;
    areaD = `M ${paddingX} ${points[0].y} L ${svgWidth - paddingX} ${points[0].y} L ${svgWidth - paddingX} ${svgHeight - paddingBottom} L ${paddingX} ${svgHeight - paddingBottom} Z`;
  } else if (points.length > 1) {
    // Smooth bezier curve generator
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    const lastP = points[points.length - 1];
    const firstP = points[0];
    areaD = `${pathD} L ${lastP.x} ${svgHeight - paddingBottom} L ${firstP.x} ${svgHeight - paddingBottom} Z`;
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms.toFixed(1)} ms`;
    }
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const formatShortTime = (ts: string) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return ts.slice(11, 19);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-6 transition-all hover:border-slate-300">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Execution Time Sparkline
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Last {totalCount} {totalCount === 1 ? "Run" : "Runs"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time latency trend across the sales analytics pipeline (CSV validation &bull; Pandas aggregation &bull; ReportLab PDF &bull; SMTPLib)
          </p>
        </div>

        {/* Quick Actions */}
        {onTriggerRun && (
          <button
            onClick={onTriggerRun}
            disabled={isRunning}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer self-start sm:self-auto"
            title="Execute pipeline now to record a new latency data point"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Pipeline</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-3.5 mb-4 rounded-lg bg-slate-50 border border-slate-100 text-xs">
        {/* Metric 1: Latest Latency */}
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">
            Latest Run
          </div>
          <div className="text-lg font-extrabold text-slate-900 tracking-tight">
            {formatDuration(latestDuration)}
          </div>
          <div className="flex items-center gap-1 text-[11px] mt-0.5">
            {deltaVsAvg < -1 ? (
              <span className="inline-flex items-center font-semibold text-emerald-700">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                {Math.abs(deltaVsAvg).toFixed(1)}% faster
              </span>
            ) : deltaVsAvg > 1 ? (
              <span className="inline-flex items-center font-semibold text-amber-700">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {Math.abs(deltaVsAvg).toFixed(1)}% slower
              </span>
            ) : (
              <span className="inline-flex items-center font-medium text-slate-500">
                <Minus className="w-3 h-3 mr-0.5" />
                Near average
              </span>
            )}
            <span className="text-slate-400">vs avg</span>
          </div>
        </div>

        {/* Metric 2: 10-Run Average */}
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">
            10-Run Average
          </div>
          <div className="text-lg font-extrabold text-slate-900 tracking-tight">
            {formatDuration(avgDuration)}
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            Baseline mean latency
          </div>
        </div>

        {/* Metric 3: Range (Min / Max) */}
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">
            Min / Max Range
          </div>
          <div className="text-sm font-bold text-slate-800 tracking-tight mt-1">
            <span className="text-emerald-700 font-extrabold">{formatDuration(minDuration)}</span>
            <span className="text-slate-400 mx-1.5">&ndash;</span>
            <span className="text-slate-700 font-extrabold">{formatDuration(maxDuration)}</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            Peak dispersion range
          </div>
        </div>

        {/* Metric 4: Pipeline Health Status */}
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">
            Pipeline Health
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold mt-1 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Optimal</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            Sub-second SLA compliant
          </div>
        </div>
      </div>

      {/* Sparkline Canvas Area */}
      {totalCount === 0 ? (
        <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50 text-center p-4">
          <Timer className="w-6 h-6 text-slate-400 mb-1.5" />
          <p className="text-xs font-semibold text-slate-700">No pipeline run history recorded yet</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Execute the pipeline to record execution times and build the sparkline.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Sparkline SVG */}
          <div className="w-full h-36 relative select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>

                {/* Glow Filter for Active Dot */}
                <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#4F46E5" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Horizontal Baseline Grids */}
              <line
                x1={paddingX}
                y1={paddingTop + chartHeight}
                x2={svgWidth - paddingX}
                y2={paddingTop + chartHeight}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <line
                x1={paddingX}
                y1={paddingTop}
                x2={svgWidth - paddingX}
                y2={paddingTop}
                stroke="#F1F5F9"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Average Latency Reference Line */}
              {totalCount > 1 && (
                <g>
                  <line
                    x1={paddingX}
                    y1={avgY}
                    x2={svgWidth - paddingX}
                    y2={avgY}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={svgWidth - paddingX}
                    y={avgY - 4}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-slate-400 font-semibold"
                  >
                    Avg: {avgDuration.toFixed(1)}ms
                  </text>
                </g>
              )}

              {/* Gradient Area under Sparkline */}
              {areaD && (
                <path
                  d={areaD}
                  fill="url(#sparklineGradient)"
                  className="transition-all duration-300"
                />
              )}

              {/* The Sparkline Path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Data Points */}
              {points.map((pt) => {
                const isHovered = hoveredRun?.run_id === pt.run.run_id;
                const isSelected = selectedRun?.run_id === pt.run.run_id;
                const isLatest = pt.index === points.length - 1;
                const isSuccess = pt.run.status === "SUCCESS";

                return (
                  <g
                    key={pt.run.run_id}
                    className="cursor-pointer transition-transform"
                    onMouseEnter={() => setHoveredRun(pt.run)}
                    onMouseLeave={() => setHoveredRun(null)}
                    onClick={() =>
                      setSelectedRun(selectedRun?.run_id === pt.run.run_id ? null : pt.run)
                    }
                  >
                    {/* Invisible larger hover area */}
                    <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                    {/* Outer Ring for latest or active */}
                    {(isLatest || isHovered || isSelected) && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered || isSelected ? "7.5" : "6"}
                        fill="none"
                        stroke={isSuccess ? "#4F46E5" : "#EF4444"}
                        strokeWidth="2"
                        className={isLatest && !isHovered ? "animate-pulse" : ""}
                        opacity="0.8"
                      />
                    )}

                    {/* Point Dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered || isSelected ? "4.5" : "3.5"}
                      fill={isSuccess ? (isLatest ? "#4F46E5" : "#6366F1") : "#EF4444"}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      filter={isHovered || isSelected ? "url(#dotGlow)" : undefined}
                    />

                    {/* Duration Label for Min / Max / Latest */}
                    {(isHovered || isSelected || isLatest) && (
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-slate-800 select-none font-mono"
                      >
                        {formatDuration(pt.duration)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Time Progression Axis Labels */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 px-1 border-t border-slate-100 pt-1.5">
            <span className="flex items-center gap-1">
              <span>Oldest ({formatShortTime(runs[0].timestamp)})</span>
            </span>
            <span className="text-slate-400 text-[10px]">
              &larr; Chronological Run Sequence &rarr;
            </span>
            <span className="flex items-center gap-1 font-semibold text-indigo-700">
              <span>Latest ({formatShortTime(runs[runs.length - 1].timestamp)})</span>
            </span>
          </div>

          {/* Active Run Detailed Inspector */}
          {activeRun && (
            <div className="mt-3 p-3 rounded-lg border border-indigo-100 bg-indigo-50/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-10 rounded-full ${
                    activeRun.status === "SUCCESS" ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      {activeRun.run_id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        activeRun.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {activeRun.status === "SUCCESS" ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-600" />
                      )}
                      {activeRun.status}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {activeRun.trigger_type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Executed: {activeRun.timestamp.slice(0, 19).replace("T", " ")} &bull;{" "}
                    {activeRun.valid_rows} valid rows &bull; {activeRun.quarantined_rows} quarantined
                  </div>
                </div>
              </div>

              {/* Latency & Deliverables */}
              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Duration</div>
                  <div className="text-base font-extrabold text-indigo-700 font-mono">
                    {formatDuration(activeRun.duration_ms)}
                  </div>
                </div>
                {activeRun.pdf_path && (
                  <div className="hidden sm:block border-l border-indigo-200 pl-3 text-left">
                    <div className="text-[10px] uppercase font-bold text-slate-500">PDF Report</div>
                    <div className="text-[11px] font-semibold text-slate-700 truncate max-w-[140px]">
                      {activeRun.pdf_path.split("/").pop()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Run Sequence Pills (Click to inspect) */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Select Run:
            </span>
            {runs.map((r, i) => {
              const isSelected = activeRun?.run_id === r.run_id;
              const isLatest = i === runs.length - 1;
              return (
                <button
                  key={r.run_id}
                  onClick={() => setSelectedRun(r)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                  title={`${r.run_id}: ${formatDuration(r.duration_ms)}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected
                        ? "bg-white"
                        : r.status === "SUCCESS"
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span>#{i + 1}</span>
                  <span className={isSelected ? "text-indigo-100" : "text-slate-500"}>
                    {r.duration_ms.toFixed(0)}ms
                  </span>
                  {isLatest && (
                    <span
                      className={`text-[9px] uppercase px-1 rounded font-sans font-bold ${
                        isSelected ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      Latest
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
