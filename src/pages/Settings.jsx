// Settings.jsx — Library config, backup/restore, & maintenance
import { useState, useEffect } from "react";
import { getSettings, saveSettings, exportBackup, importBackup, resetAllData } from "../db/localDB";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";
import { Settings as SettingsIcon, Download, Upload, Trash2, Save, Building, Clock, IndianRupee, ShieldAlert } from "lucide-react";

const Settings = () => {
  const [settings, setSettings]           = useState({ libraryName: "", fineRatePerDay: 2, defaultLoanDays: 14, maxRenewals: 2 });
  const [resetModalOpen, setResetModalOpen] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveSettings(settings);
    toast.success("Library settings updated successfully!");
  };

  const handleExport = () => {
    const backup = exportBackup();
    const blob   = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href       = url;
    a.download   = `library_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded successfully!");
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        importBackup(data);
        toast.success("Library data restored successfully!");
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        toast.error("Failed to import backup: Invalid JSON format");
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    resetAllData();
    toast.success("Database has been reset.");
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="text-blue-400" size={24} />
          <h1 className="text-2xl font-bold text-white">Library Settings & System</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">Configure library rules, manage backups, and perform system operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <Building className="text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-white">General Rules & Configuration</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Library Name</label>
              <input
                type="text"
                required
                value={settings.libraryName}
                onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <IndianRupee size={14} className="text-emerald-400" /> Fine / Day (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={settings.fineRatePerDay}
                  onChange={(e) => setSettings({ ...settings, fineRatePerDay: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-400" /> Loan Period (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.defaultLoanDays}
                  onChange={(e) => setSettings({ ...settings, defaultLoanDays: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <SettingsIcon size={14} className="text-purple-400" /> Max Renewals
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={settings.maxRenewals}
                  onChange={(e) => setSettings({ ...settings, maxRenewals: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30 transition text-sm"
              >
                <Save size={16} /> Save Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Data Backup & System Operations */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Download size={18} className="text-blue-400" /> Data Backup & Restore
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export your entire database (books, members, issues, history) as a JSON file, or restore from a previous backup.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              >
                <Download size={15} /> Export JSON Backup
              </button>

              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition">
                <Upload size={15} /> Restore JSON Backup
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert size={18} /> Danger Zone & Reset
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Permanently wipe all books, members, and transaction history from local storage to keep a clean production environment.
            </p>

            <button
              onClick={() => setResetModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-900/30 transition"
            >
              <Trash2 size={15} /> Clear All Data (Fresh Start)
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleResetData}
        title="Reset Entire Database?"
        message="Are you sure you want to clear all data? This will erase all books, members, transactions, and logs permanently."
        confirmText="Yes, Erase Everything"
        danger={true}
      />
    </div>
  );
};

export default Settings;
