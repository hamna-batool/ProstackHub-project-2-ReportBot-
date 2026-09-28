import React from "react";
import { DollarSign, ShoppingCart, TrendingUp, Users, AlertOctagon, Layers } from "lucide-react";
import { KPIMetrics } from "../types";

interface MetricCardsProps {
  kpis: KPIMetrics | null;
  quarantineCount: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ kpis, quarantineCount }) => {
  if (!kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: "card-revenue",
      label: "Total Gross Revenue",
      value: `$${kpis.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `${kpis.total_units.toLocaleString()} total units sold`,
      icon: DollarSign,
      accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      id: "card-orders",
      label: "Total Closed Orders",
      value: kpis.total_orders.toLocaleString(),
      sub: `${kpis.unique_customers} distinct enterprise accounts`,
      icon: ShoppingCart,
      accent: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      id: "card-aov",
      label: "Average Order Value (AOV)",
      value: `$${kpis.aov.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: "Per individual purchase order",
      icon: TrendingUp,
      accent: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      id: "card-clv",
      label: "Avg Customer Lifetime Value",
      value: `$${kpis.clv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: "Cohort aggregated average spend",
      icon: Users,
      accent: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      id: "card-mom",
      label: "Month-over-Month Growth",
      value: `${kpis.mom_growth_pct > 0 ? "+" : ""}${kpis.mom_growth_pct}%`,
      sub: "Calculated across monthly cycles",
      icon: Layers,
      accent: kpis.mom_growth_pct >= 0 ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      id: "card-quarantine",
      label: "Quarantined Anomalies",
      value: quarantineCount.toLocaleString(),
      sub: "Isolated in /data/quarantine/",
      icon: AlertOctagon,
      accent: quarantineCount > 0 ? "text-amber-600 bg-amber-50 border-amber-100" : "text-slate-600 bg-slate-50 border-slate-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight mb-0.5">
              {card.value}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {card.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
};
