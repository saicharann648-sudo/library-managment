// Dashboard — clean student project dashboard page
import { useMemo } from "react";
import { BookOpen, Users, BookMarked, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import StatsCard from "../components/StatsCard";
import { useLibrary } from "../hooks/useLibrary";
import { isOverdue } from "../utils/fineCalculator";
import { formatDate } from "../utils/dateHelpers";
import { Link } from "react-router-dom";

const CATEGORY_COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#dc2626","#0891b2","#db2777","#65a30d"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-md text-xs">
        <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-medium mt-0.5">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { books, members, transactions } = useLibrary();

  const stats = useMemo(() => {
    const totalBooks     = books.reduce((s, b) => s + Number(b.totalCopies || 0), 0);
    const availableBooks = books.reduce((s, b) => s + Number(b.availableCopies || 0), 0);
    const issuedNow      = transactions.filter((t) => t.status === "issued");
    const overdueBooks   = issuedNow.filter((t) => isOverdue(t.dueDate)).length;
    const totalFines     = transactions.reduce((s, t) => s + (t.fine || 0), 0);
    return { totalBooks, availableBooks, issuedBooks: totalBooks - availableBooks, totalMembers: members.length, overdueBooks, totalFines };
  }, [books, members, transactions]);

  const categoryData = useMemo(() => {
    const counts = {};
    books.forEach((b) => { counts[b.category] = (counts[b.category] || 0) + Number(b.totalCopies || 0); });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [books]);

  const availabilityData = useMemo(() =>
    books.slice(0, 8).map((b) => ({
      name: b.title.length > 12 ? b.title.slice(0, 12) + "…" : b.title,
      Total: Number(b.totalCopies),
      Available: Number(b.availableCopies),
    })), [books]);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Library Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Overview of library inventory, transactions, and members</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/transactions" className="btn-primary">
            + Issue Book
          </Link>
          <Link to="/books" className="btn-secondary">
            View Catalog
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Books"     value={stats.totalBooks}      icon={BookOpen}      color="blue"   subtitle="Total registered copies" />
        <StatsCard title="Available Books" value={stats.availableBooks}  icon={BookOpen}      color="green"  subtitle="Ready for issue" />
        <StatsCard title="Issued Books"    value={stats.issuedBooks}     icon={BookMarked}    color="amber"  subtitle="Currently borrowed" />
        <StatsCard title="Total Members"   value={stats.totalMembers}    icon={Users}         color="purple" subtitle="Students & teachers" />
        <StatsCard title="Overdue Books"   value={stats.overdueBooks}    icon={AlertTriangle} color="red"    subtitle="Pass due date" />
        <StatsCard title="Fines Recovered" value={`₹${stats.totalFines}`} icon={TrendingUp}   color="green"  subtitle="Total fine collection" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-container">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Book Availability Overview</h3>
          {availabilityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={availabilityData} barGap={4} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Total"     fill="#2563eb" radius={[4,4,0,0]} name="Total Copies" />
                <Bar dataKey="Available" fill="#059669" radius={[4,4,0,0]} name="Available Copies" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-xs text-center py-16">No book inventory to display yet</p>
          )}
        </div>

        <div className="card-container">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Books by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-300">{v}</span>} />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-xs text-center py-16">No categories added</p>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card-container">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent Transactions</h3>
          </div>
          <Link to="/transactions" className="text-xs font-medium text-blue-600 hover:underline">View All &rarr;</Link>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-8">No recent transactions recorded</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((t) => {
              const overdue = t.status === "issued" && isOverdue(t.dueDate);
              return (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.status === "returned" ? "bg-emerald-500" : overdue ? "bg-red-500" : "bg-amber-500"}`} />
                    <div>
                      <p className="text-slate-800 dark:text-slate-100 text-sm font-semibold">{t.bookTitle}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{t.memberName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.status === "returned" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                      overdue ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    }`}>
                      {t.status === "returned" ? "Returned" : overdue ? "Overdue" : "Issued"}
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5">Due: {formatDate(t.dueDate)}</p>
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

export default Dashboard;
