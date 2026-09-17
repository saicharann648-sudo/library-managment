// ReceiptModal.jsx — printable receipt modal for library transactions
import { Printer, X, GraduationCap, CheckCircle } from "lucide-react";
import { getSettings } from "../db/localDB";

const ReceiptModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const settings = getSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-blue-400" />
            <h3 className="text-base font-bold text-white">Transaction Receipt</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 overflow-y-auto space-y-6" id="receipt-content">
          <div className="text-center pb-4 border-b border-dashed border-slate-700">
            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <h2 className="text-lg font-bold text-white">{settings.libraryName || "School Library"}</h2>
            <p className="text-xs text-slate-400">Library Issue & Return Receipt</p>
            <p className="text-[10px] text-slate-500 mt-1">Date: {new Date().toLocaleString()}</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400">Transaction ID</span>
              <span className="font-mono text-xs text-blue-400 font-semibold">{transaction.id.slice(0, 8)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Member Name</span>
              <span className="font-semibold text-white">{transaction.memberName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Book Title</span>
              <span className="font-semibold text-white truncate max-w-[200px]" title={transaction.bookTitle}>
                {transaction.bookTitle}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Issue Date</span>
              <span className="text-slate-300">{new Date(transaction.issuedAt).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Due Date</span>
              <span className="text-amber-400 font-medium">{new Date(transaction.dueDate).toLocaleDateString()}</span>
            </div>

            {transaction.returnedAt && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Returned On</span>
                <span className="text-emerald-400 font-medium">{new Date(transaction.returnedAt).toLocaleDateString()}</span>
              </div>
            )}

            {transaction.fine > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-red-400 font-semibold">
                <span>Fine Charged</span>
                <span>₹{transaction.fine} ({transaction.finePaid ? "PAID" : "UNPAID"})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>Please keep this receipt for library records.</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30 transition"
          >
            <Printer size={16} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
