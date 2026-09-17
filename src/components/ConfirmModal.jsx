// ConfirmModal.jsx — reusable styled confirm modal
import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${danger ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Please confirm your action</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          {message}
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            type="button"
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg transition ${
              danger
                ? "bg-red-600 hover:bg-red-500 shadow-red-900/30"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/30"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
