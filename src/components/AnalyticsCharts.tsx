import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AnalyticsMetrics } from "../types";
import { TrendingUp, Globe, Award, PieChart as PieIcon, Calendar, ArrowUpRight } from "lucide-react";

interface AnalyticsChartsProps {
  metrics: AnalyticsMetrics;
}

const REGION_COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#8B5CF6"];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ metrics }) => {
  const [revenueGranularity, setRevenueGranularity] = useState<"daily" | "weekly">("weekly");

  const formattedDaily = (metrics.daily_revenue || []).map((d) => ({
    label: d.order_date_dt.slice(5),
    revenue: Math.round(d.revenue),
    orders: d.orders,
  }));

  const formattedWeekly = (metrics.weekly_revenue || []).map((w) => ({
    label: w.year_week.replace("2026-", ""),
    revenue: Math.round(w.revenue),
    orders: w.orders,
  }));

  const activeRevenueData = revenueGranularity === "weekly" ? formattedWeekly : formattedDaily;

  return (
    <div className="space-y-6">
      {/* Top Row: Revenue Trend & Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Revenue Performance Trend
              </h2>
              <p className="text-xs text-slate-500">
                Calculated using Pandas aggregation on validated sales records
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setRevenueGranularity("weekly")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  revenueGranularity === "weekly"
                    ? "bg-white text-indigo-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setRevenueGranularity("daily")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  revenueGranularity === "daily"
                    ? "bg-white text-indigo-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Daily
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {revenueGranularity === "weekly" ? (
                <BarChart data={activeRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(label) => `Period: ${label}`}
                    contentStyle={{ borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Gross Revenue" />
                </BarChart>
              ) : (
                <LineChart data={activeRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748B" }} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 3, fill: "#4F46E5" }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Share (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-cyan-600" />
              Regional Breakdown
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Geographic distribution of sales volume & AOV
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.regional_breakdown}
                    dataKey="total_revenue"
                    nameKey="region"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {metrics.regional_breakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
            {metrics.regional_breakdown.map((r, i) => (
              <div key={r.region} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: REGION_COLORS[i % REGION_COLORS.length] }}
                  />
                  <span className="font-medium text-slate-700">{r.region}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">${(r.total_revenue / 1000).toFixed(1)}k</span>
                  <span className="text-slate-400 ml-1.5">({r.revenue_share}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Top Products Table & Customer Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top-Performing Products Table (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Top-Performing Products
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by gross sales volume and individual product contributions
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Rank & Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Avg Price</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.top_products.slice(0, 6).map((prod, idx) => (
                  <tr key={prod.product_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">{prod.product_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{prod.product_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{prod.category}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-800">{prod.units_sold}</td>
                    <td className="py-3 px-3 text-right text-slate-600">${prod.avg_price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ${prod.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        {prod.revenue_share}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Lifetime Value (CLV) Tiers (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-purple-600" />
              Customer Value Tiers (CLV)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Segmentation by cumulative enterprise account spend
            </p>

            <div className="space-y-3">
              {metrics.customer_tiers.map((tier) => (
                <div key={tier.tier} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">{tier.tier}</span>
                    <span className="text-slate-500 font-medium">{tier.customers} accounts</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-extrabold text-slate-900">
                      ${tier.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">
                      {tier.revenue_share}% portfolio
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${Math.min(tier.revenue_share, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Overall Cohort Average CLV:</span>
            <strong className="text-slate-900">${metrics.kpis.clv.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
