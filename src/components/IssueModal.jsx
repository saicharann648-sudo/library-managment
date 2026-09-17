// IssueModal — issue a book using useLibrary hook
import { useState } from "react";
import { X, ArrowUpFromLine } from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import { futureDateISO, todayISO } from "../utils/dateHelpers";
import toast from "react-hot-toast";

const IssueModal = ({ isOpen, onClose, books, members }) => {
  const { handleIssue }   = useLibrary();
  const [form, setForm]   = useState({ bookId:"", memberId:"", dueDate: futureDateISO(14) });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const availableBooks = books.filter(b => b.availableCopies > 0);
  const handleChange   = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookId || !form.memberId) { toast.error("Please select both a book and a member"); return; }
    if (form.dueDate < todayISO())       { toast.error("Due date must be in the future"); return; }
    setLoading(true);
    try {
      const book   = books.find(b => b.id === form.bookId);
      const member = members.find(m => m.id === form.memberId);
      handleIssue({ bookId: form.bookId, memberId: form.memberId, bookTitle: book?.title ?? "Unknown", memberName: member?.name ?? "Unknown", dueDate: new Date(form.dueDate).toISOString() });
      toast.success(`"${book?.title}" issued to ${member?.name}!`);
      setForm({ bookId:"", memberId:"", dueDate: futureDateISO(14) });
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to issue book");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><ArrowUpFromLine size={18} className="text-emerald-400" /></div>
            <h2 className="text-lg font-semibold text-white">Issue Book</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Select Book *</label>
            <select name="bookId" value={form.bookId} onChange={handleChange} required className="input">
              <option value="">-- Choose a book --</option>
              {availableBooks.map(b => <option key={b.id} value={b.id}>{b.title} ({b.availableCopies} available)</option>)}
            </select>
            {availableBooks.length === 0 && <p className="mt-1 text-xs text-amber-400">No books currently available</p>}
          </div>
          <div>
            <label className="label">Select Member *</label>
            <select name="memberId" value={form.memberId} onChange={handleChange} required className="input">
              <option value="">-- Choose a member --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name} — {m.classSection}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Due Date (default: 14 days)</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} min={todayISO()} className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={loading || availableBooks.length === 0} className="flex-1 btn-primary bg-emerald-600 hover:bg-emerald-500">
              {loading ? "Issuing..." : "Issue Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueModal;
