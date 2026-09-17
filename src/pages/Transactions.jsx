// Transactions page with Renew, Fine Payment, Print Receipt, & Return
import { useState, useMemo } from "react";
import { ArrowUpFromLine, ArrowDownFromLine, Search, BookMarked, AlertTriangle, CheckCircle2, Clock, Printer, RotateCw, CheckCheck, IndianRupee } from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import IssueModal  from "../components/IssueModal";
import ReturnModal from "../components/ReturnModal";
import ReceiptModal from "../components/ReceiptModal";
import { renewBookTxn, markFinePaidTxn } from "../db/localDB";
import { isOverdue, getOverdueDays } from "../utils/fineCalculator";
import { formatDate } from "../utils/dateHelpers";
import toast from "react-hot-toast";

const Transactions = () => {
  const { books, members, transactions, refreshData } = useLibrary();
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [issueOpen, setIssueOpen]   = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selected, setSelected]     = useState(null);

  const filtered = useMemo(() =>
    transactions.filter((t) => {
      const matchSearch  = t.bookTitle.toLowerCase().includes(search.toLowerCase()) || t.memberName.toLowerCase().includes(search.toLowerCase());
      const matchStatus  =
        statusFilter === "all"      ? true :
        statusFilter === "issued"   ? t.status === "issued" :
        statusFilter === "returned" ? t.status === "returned" :
        statusFilter === "overdue"  ? (t.status === "issued" && isOverdue(t.dueDate)) : true;
      return matchSearch && matchStatus;
    }), [transactions, search, statusFilter]);

  const handleRenew = (t) => {
    try {
      const currentDue = new Date(t.dueDate);
      currentDue.setDate(currentDue.getDate() + 14); // extend by 14 days
      const renewalsCount = renewBookTxn(t.id, currentDue.toISOString());
      toast.success(`Book renewed successfully (${renewalsCount}x renewed)`);
      refreshData();
    } catch (err) {
      toast.error(err.message || "Failed to renew book");
    }
  };

  const handleMarkFinePaid = (t) => {
    markFinePaidTxn(t.id);
    toast.success(`Fine of ₹${t.fine} marked as paid`);
    refreshData();
  };

  const handleOpenReceipt = (t) => {
    setSelected(t);
    setReceiptOpen(true);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Issue & Return Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            {transactions.filter(t => t.status === "issued").length} books currently on loan
          </p>
        </div>
        <button
          id="issue-book-btn"
          onClick={() => setIssueOpen(true)}
          className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30"
        >
          <ArrowUpFromLine size={16} /> Issue Book
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="txn-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title or member name…"
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all","issued","overdue","returned"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                statusFilter === s
                  ? s==="overdue" ? "bg-red-600 text-white shadow-lg shadow-red-900/40" : s==="returned" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40" : s==="issued" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40" : "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <BookMarked size={48} className="mb-3 opacity-30 text-slate-400" />
          <p className="font-semibold text-slate-300">No transactions found</p>
          <p className="text-xs mt-1">There are no issue records matching your selected filter.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="th">Status</th>
                  <th className="th">Book</th>
                  <th className="th">Member</th>
                  <th className="th">Issued</th>
                  <th className="th">Due Date</th>
                  <th className="th">Returned</th>
                  <th className="th text-center">Fine</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((t) => {
                  const overdue     = t.status === "issued" && isOverdue(t.dueDate);
                  const overdueDays = overdue ? getOverdueDays(t.dueDate) : 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="td">
                        {t.status === "returned" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={12} /> Returned
                          </span>
                        ) : overdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <AlertTriangle size={12} /> Overdue ({overdueDays}d)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock size={12} /> Issued
                          </span>
                        )}
                      </td>
                      <td className="td">
                        <p className="text-white text-sm font-semibold max-w-[180px] truncate" title={t.bookTitle}>
                          {t.bookTitle}
                        </p>
                        {t.renewals > 0 && (
                          <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-0.5 mt-0.5">
                            <RotateCw size={10} /> Renewed x{t.renewals}
                          </span>
                        )}
                      </td>
                      <td className="td"><p className="text-slate-300 text-sm font-medium">{t.memberName}</p></td>
                      <td className="td"><p className="text-slate-400 text-xs font-mono">{formatDate(t.issuedAt)}</p></td>
                      <td className="td">
                        <p className={`text-xs font-mono font-medium ${overdue ? "text-red-400 font-bold" : "text-slate-300"}`}>
                          {formatDate(t.dueDate)}
                        </p>
                      </td>
                      <td className="td"><p className="text-slate-400 text-xs font-mono">{t.returnedAt ? formatDate(t.returnedAt) : "—"}</p></td>
                      <td className="td text-center">
                        {t.fine > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className="text-red-400 font-bold text-xs">₹{t.fine}</span>
                            {t.finePaid ? (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-0.5">
                                PAID
                              </span>
                            ) : (
                              <button
                                onClick={() => handleMarkFinePaid(t)}
                                className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 underline mt-0.5"
                                title="Mark fine as paid"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="td text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Receipt */}
                          <button
                            onClick={() => handleOpenReceipt(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Print Receipt"
                          >
                            <Printer size={15} />
                          </button>

                          {/* Renew button */}
                          {t.status === "issued" && (
                            <button
                              onClick={() => handleRenew(t)}
                              className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition"
                              title="Renew Loan (Extend Due Date)"
                            >
                              <RotateCw size={15} />
                            </button>
                          )}

                          {/* Return button */}
                          {t.status === "issued" && (
                            <button
                              onClick={() => { setSelected(t); setReturnOpen(true); }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition"
                            >
                              <ArrowDownFromLine size={13} /> Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-800 text-slate-500 text-xs flex justify-between items-center">
            <span>Showing {filtered.length} of {transactions.length} records</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <IssueModal isOpen={issueOpen} onClose={() => setIssueOpen(false)} books={books} members={members} />
      <ReturnModal isOpen={returnOpen} onClose={() => { setReturnOpen(false); setSelected(null); }} transaction={selected} />
      <ReceiptModal isOpen={receiptOpen} onClose={() => { setReceiptOpen(false); setSelected(null); }} transaction={selected} />
    </div>
  );
};

export default Transactions;
