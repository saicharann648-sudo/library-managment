// BookModal — add/edit book using useLibrary hook
import { useState, useEffect } from "react";
import { X, BookOpen } from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import toast from "react-hot-toast";

const CATEGORIES = ["Fiction","Science","History","Mathematics","Programming","Biography","Geography","Language","Arts","Other"];
const EMPTY = { title:"", author:"", publisher:"", isbn:"", category:"Fiction", totalCopies:1 };

const BookModal = ({ isOpen, onClose, book = null }) => {
  const { handleAddBook, handleUpdateBook } = useLibrary();
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(book);

  useEffect(() => { setForm(book ? { ...EMPTY, ...book } : EMPTY); }, [book]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const { id, ...rest } = form;
        handleUpdateBook(id, { ...rest, totalCopies: Number(rest.totalCopies) });
        toast.success("Book updated!");
      } else {
        handleAddBook({ ...form, totalCopies: Number(form.totalCopies) });
        toast.success("Book added!");
      }
      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><BookOpen size={18} className="text-blue-400" /></div>
            <h2 className="text-lg font-semibold text-white">{isEdit ? "Edit Book" : "Add New Book"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Title *</label><input name="title" value={form.title} onChange={handleChange} required className="input" placeholder="Book title" /></div>
            <div><label className="label">Author *</label><input name="author" value={form.author} onChange={handleChange} required className="input" placeholder="Author name" /></div>
            <div><label className="label">Publisher</label><input name="publisher" value={form.publisher} onChange={handleChange} className="input" placeholder="Publisher" /></div>
            <div><label className="label">ISBN</label><input name="isbn" value={form.isbn} onChange={handleChange} className="input" placeholder="ISBN" /></div>
            <div>
              <label className="label">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2"><label className="label">Total Copies *</label><input name="totalCopies" type="number" min="1" value={form.totalCopies} onChange={handleChange} required className="input" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">{loading ? "Saving..." : isEdit ? "Update Book" : "Add Book"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookModal;
