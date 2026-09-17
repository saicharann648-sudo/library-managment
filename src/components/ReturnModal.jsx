// ReturnModal — return a book and show fine using useLibrary hook
import { useState } from "react";
import { X, ArrowDownFromLine, IndianRupee, AlertTriangle } from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import { calculateFine, isOverdue, getOverdueDays } from "../utils/fineCalculator";
import { formatDate } from "../utils/dateHelpers";
import toast from "react-hot-toast";

const ReturnModal = ({ isOpen, onClose, transaction }) => {
  const { handleReturn } = useLibrary();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !transaction) return null;

  const overdue     = isOverdue(transaction.dueDate);
  const overdueDays = getOverdueDays(transaction.dueDate);
  const previewFine = calculateFine(transaction.dueDate);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const fine = await handleReturn(transaction.id, {
        bookId:   transaction.bookId,
        memberId: transaction.memberId,
        dueDate:  transaction.dueDate,
      });
      toast.success(fine > 0 ? `Book returned. Fine: ₹${fine}` : "Book returned — no fine!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Return failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><ArrowDownFromLine size={18} className="text-amber-400" /></div>
            <h2 className="text-lg font-semibold text-white">Return Book</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-slate-800 p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Book</span><span className="text-white font-medium">{transaction.bookTitle}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Member</span><span className="text-white">{transaction.memberName}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Due Date</span><span className={overdue ? "text-red-400 font-medium" : "text-white"}>{formatDate(transaction.dueDate)}</span></div>
          </div>

          {overdue ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-red-400" /><span className="text-red-400 font-semibold text-sm">Overdue!</span></div>
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">Overdue by</span><span className="text-red-400 font-medium">{overdueDays} day{overdueDays!==1?"s":""}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-300">Fine Rate</span><span className="text-slate-300">₹2 / day</span></div>
              <div className="border-t border-red-500/30 mt-3 pt-3 flex justify-between">
                <span className="text-white font-semibold flex items-center gap-1"><IndianRupee size={14} /> Total Fine</span>
                <span className="text-red-400 font-bold text-lg">₹{previewFine}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><span className="text-emerald-400 text-lg">✓</span></div>
              <div><p className="text-emerald-400 font-semibold text-sm">On Time — No Fine</p><p className="text-slate-400 text-xs">Returned before or on the due date</p></div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button onClick={handleConfirm} disabled={loading} className="flex-1 btn-primary bg-amber-600 hover:bg-amber-500">
              {loading ? "Processing..." : overdue ? `Collect ₹${previewFine} & Return` : "Confirm Return"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;
