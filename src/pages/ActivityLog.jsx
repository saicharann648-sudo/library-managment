// ActivityLog.jsx — audit trail of library activities
import { useState, useEffect } from "react";
import { getActivity } from "../db/localDB";
import { History, Search, BookOpen, Users, ArrowLeftRight, Settings, RotateCw, Trash2, PlusCircle } from "lucide-react";

const TYPE_ICONS = {
  ADD_BOOK: { icon: PlusCircle, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  EDIT_BOOK: { icon: BookOpen, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  DELETE_BOOK: { icon: Trash2, color: "text-red-400 bg-red-500/10 border-red-500/20" },
  ADD_MEMBER: { icon: Users, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  EDIT_MEMBER: { icon: Users, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  DELETE_MEMBER: { icon: Trash2, color: "text-red-400 bg-red-500/10 border-red-500/20" },
  ISSUE: { icon: ArrowLeftRight, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  RETURN: { icon: ArrowLeftRight, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  RENEW: { icon: RotateCw, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  FINE_PAID: { icon: ArrowLeftRight, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  RESTORE: { icon: Settings, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
};

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [search, setSearch]         = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    setActivities(getActivity());
  }, []);

  const filtered = activities.filter((act) => {
    const matchesSearch = act.description.toLowerCase().includes(search.toLowerCase());
    const matchesType   = filterType === "all" || act.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="text-blue-400" size={24} />
            <h1 className="text-2xl font-bold text-white">Activity Log</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Audit trail of all system actions and transaction records</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full font-medium border border-slate-700">
            Total Entries: {activities.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Event Types</option>
          <option value="ISSUE">Book Issues</option>
          <option value="RETURN">Book Returns</option>
          <option value="RENEW">Book Renewals</option>
          <option value="ADD_BOOK">Book Additions</option>
          <option value="ADD_MEMBER">Member Additions</option>
          <option value="FINE_PAID">Fine Payments</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No activity log entries found matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filtered.map((item) => {
              const meta = TYPE_ICONS[item.type] || { icon: History, color: "text-slate-400 bg-slate-800" };
              const Icon = meta.icon;

              return (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`p-2.5 rounded-xl border ${meta.color} flex-shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{item.description}</p>
                      <span className="inline-block mt-0.5 text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-xs font-mono text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
