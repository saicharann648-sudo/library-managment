// Reports page using useLibrary hook
import { useMemo, useState } from "react";
import { BarChart3, Download, AlertTriangle, BookMarked, IndianRupee, CheckCircle2 } from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import { isOverdue, getOverdueDays, calculateFine } from "../utils/fineCalculator";
import { formatDate } from "../utils/dateHelpers";
import { downloadCSV } from "../utils/csvExport";
import toast from "react-hot-toast";

const TAB_LIST = [
  { id: "issued",   label: "Currently Issued", icon: BookMarked    },
  { id: "overdue",  label: "Overdue Books",    icon: AlertTriangle },
  { id: "fines",    label: "Fine Collection",  icon: IndianRupee   },
  { id: "returned", label: "Returned Books",   icon: CheckCircle2  },
];

const Reports = () => {
  const { transactions } = useLibrary();
  const [tab, setTab] = useState("issued");

  const issued   = useMemo(() => transactions.filter(t => t.status === "issued"), [transactions]);
  const overdue  = useMemo(() => issued.filter(t => isOverdue(t.dueDate)).map(t => ({ ...t, overdueDays: getOverdueDays(t.dueDate), pendingFine: calculateFine(t.dueDate) })), [issued]);
  const fines    = useMemo(() => transactions.filter(t => t.fine > 0), [transactions]);
  const returned = useMemo(() => transactions.filter(t => t.status === "returned"), [transactions]);
  const totalFinesCollected = useMemo(() => fines.reduce((s, t) => s + t.fine, 0), [fines]);

  const handleExport = () => {
    const maps = {
      issued:   issued.map(t   => ({ Book: t.bookTitle, Member: t.memberName, "Issued On": formatDate(t.issuedAt), "Due Date": formatDate(t.dueDate) })),
      overdue:  overdue.map(t  => ({ Book: t.bookTitle, Member: t.memberName, "Due Date": formatDate(t.dueDate), "Overdue Days": t.overdueDays, "Pending Fine (₹)": t.pendingFine })),
      fines:    fines.map(t    => ({ Book: t.bookTitle, Member: t.memberName, "Issued On": formatDate(t.issuedAt), "Returned On": formatDate(t.returnedAt), "Fine (₹)": t.fine })),
      returned: returned.map(t => ({ Book: t.bookTitle, Member: t.memberName, "Issued On": formatDate(t.issuedAt), "Returned On": formatDate(t.returnedAt), "Fine (₹)": t.fine })),
    };
    if (maps[tab].length === 0) { toast.error("No data to export"); return; }
    downloadCSV(maps[tab], tab + "_report");
    toast.success("CSV exported!");
  };

  const renderTable = () => {
    if (tab === "issued") return (
      <table className="w-full">
        <thead><tr className="border-b border-slate-800"><th className="th">Book</th><th className="th">Member</th><th className="th">Issued On</th><th className="th">Due Date</th><th className="th">Status</th></tr></thead>
        <tbody>
          {issued.length === 0
            ? <tr><td colSpan={5} className="text-center py-12 text-slate-500">No books currently issued</td></tr>
            : issued.map(t => {
                const over = isOverdue(t.dueDate);
                return (
                  <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="td font-medium text-white">{t.bookTitle}</td>
                    <td className="td text-slate-300">{t.memberName}</td>
                    <td className="td text-slate-400 text-sm">{formatDate(t.issuedAt)}</td>
                    <td className="td"><span className={`text-sm font-medium ${over ? "text-red-400" : "text-slate-300"}`}>{formatDate(t.dueDate)}</span></td>
                    <td className="td"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${over ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>{over ? "Overdue" : "Active"}</span></td>
                  </tr>
                );
              })
          }
        </tbody>
      </table>
    );

    if (tab === "overdue") return (
      <table className="w-full">
        <thead><tr className="border-b border-slate-800"><th className="th">Book</th><th className="th">Member</th><th className="th">Due Date</th><th className="th text-center">Overdue Days</th><th className="th text-right">Pending Fine</th></tr></thead>
        <tbody>
          {overdue.length === 0
            ? <tr><td colSpan={5} className="text-center py-12 text-slate-500"><div className="flex flex-col items-center gap-2"><CheckCircle2 size={32} className="text-emerald-500/40" /><span>No overdue books! Great job 🎉</span></div></td></tr>
            : overdue.map(t => (
                <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="td font-medium text-white">{t.bookTitle}</td>
                  <td className="td text-slate-300">{t.memberName}</td>
                  <td className="td text-red-400 text-sm font-medium">{formatDate(t.dueDate)}</td>
                  <td className="td text-center"><span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold">{t.overdueDays} day{t.overdueDays!==1?"s":""}</span></td>
                  <td className="td text-right"><span className="text-red-400 font-bold">₹{t.pendingFine}</span></td>
                </tr>
              ))
          }
        </tbody>
      </table>
    );

    if (tab === "fines") return (
      <>
        <div className="mx-5 mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div><p className="text-slate-400 text-sm">Total Fines Collected</p><p className="text-2xl font-bold text-emerald-400 mt-0.5">₹{totalFinesCollected}</p></div>
          <IndianRupee size={32} className="text-emerald-500/30" />
        </div>
        <table className="w-full mt-4">
          <thead><tr className="border-b border-slate-800"><th className="th">Book</th><th className="th">Member</th><th className="th">Issued</th><th className="th">Returned</th><th className="th text-right">Fine Paid</th></tr></thead>
          <tbody>
            {fines.length === 0
              ? <tr><td colSpan={5} className="text-center py-12 text-slate-500">No fines collected yet</td></tr>
              : fines.map(t => (
                  <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="td font-medium text-white">{t.bookTitle}</td>
                    <td className="td text-slate-300">{t.memberName}</td>
                    <td className="td text-slate-400 text-sm">{formatDate(t.issuedAt)}</td>
                    <td className="td text-slate-400 text-sm">{formatDate(t.returnedAt)}</td>
                    <td className="td text-right"><span className="text-red-400 font-bold">₹{t.fine}</span></td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </>
    );

    if (tab === "returned") return (
      <table className="w-full">
        <thead><tr className="border-b border-slate-800"><th className="th">Book</th><th className="th">Member</th><th className="th">Issued</th><th className="th">Returned</th><th className="th text-right">Fine</th></tr></thead>
        <tbody>
          {returned.length === 0
            ? <tr><td colSpan={5} className="text-center py-12 text-slate-500">No returns yet</td></tr>
            : returned.map(t => (
                <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="td font-medium text-white">{t.bookTitle}</td>
                  <td className="td text-slate-300">{t.memberName}</td>
                  <td className="td text-slate-400 text-sm">{formatDate(t.issuedAt)}</td>
                  <td className="td text-slate-400 text-sm">{formatDate(t.returnedAt)}</td>
                  <td className="td text-right">{t.fine > 0 ? <span className="text-red-400 font-semibold">₹{t.fine}</span> : <span className="text-emerald-400 text-sm">—</span>}</td>
                </tr>
              ))
          }
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Reports</h1><p className="text-slate-400 text-sm mt-1">Library activity and fine reports</p></div>
        <button id="export-csv-btn" onClick={handleExport} className="btn-secondary flex items-center gap-2"><Download size={16} />Export CSV</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TAB_LIST.map(({ id, label, icon: Icon }) => {
          const count = id==="issued" ? issued.length : id==="overdue" ? overdue.length : id==="fines" ? fines.length : returned.length;
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab===id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"}`}>
              <Icon size={14} />{label}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${tab===id ? "bg-blue-500 text-white" : "bg-slate-700 text-slate-400"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">{renderTable()}</div>
      </div>
    </div>
  );
};

export default Reports;
