// StatsCard — simple clean stat widget for student project UI
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const StatsCard = ({ title, value, icon: Icon, color = "blue", trend, trendLabel, subtitle }) => {
  const colorMap = {
    blue:   { bg: "bg-blue-50 dark:bg-blue-950/40",   text: "text-blue-600 dark:text-blue-400",   border: "border-blue-200 dark:border-blue-900/50" },
    green:  { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/50" },
    amber:  { bg: "bg-amber-50 dark:bg-amber-950/40",  text: "text-amber-600 dark:text-amber-400",  border: "border-amber-200 dark:border-amber-900/50" },
    red:    { bg: "bg-red-50 dark:bg-red-950/40",    text: "text-red-600 dark:text-red-400",    border: "border-red-200 dark:border-red-900/50" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-900/50" },
  };
  const c = colorMap[color] || colorMap.blue;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-600" : "text-slate-400";

  return (
    <div className={`bg-white dark:bg-slate-900 border ${c.border} rounded-xl p-5 shadow-sm flex items-start justify-between`}>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value ?? "—"}</p>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        {trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor} pt-1`}>
            <TrendIcon size={12} />
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
      <div className={`p-2.5 rounded-lg ${c.bg} ${c.text}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

export default StatsCard;
