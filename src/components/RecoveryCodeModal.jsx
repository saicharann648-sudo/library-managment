// RecoveryCodeModal.jsx — shown once after first login with the generated recovery code
import { useState } from "react";
import { ShieldCheck, Copy, Check, AlertTriangle } from "lucide-react";

const RecoveryCodeModal = ({ code, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
            <ShieldCheck size={28} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Save Your Recovery Code
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This code lets you log in if you ever forget your password.
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            <strong>This is shown only once.</strong> Write it down or save it somewhere safe.
            You cannot recover it again.
          </p>
        </div>

        {/* Recovery Code */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Your Recovery Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-lg font-bold tracking-[0.2em] text-center py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 select-all">
              {code}
            </div>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95"
              title="Copy to clipboard"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-semibold text-sm transition active:scale-[0.98]"
        >
          I've saved my recovery code
        </button>
      </div>
    </div>
  );
};

export default RecoveryCodeModal;
