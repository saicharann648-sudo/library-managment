// Books page — catalog with Table/Grid toggle, search, filter, add/edit/delete
import { useState, useMemo } from "react";
import { Plus, Search, Filter, BookOpen, Pencil, Trash2, ChevronDown, LayoutGrid, LayoutList, Bookmark } from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import BookModal from "../components/BookModal";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

const CATEGORIES = ["All","Fiction","Science","History","Mathematics","Programming","Biography","Geography","Language","Arts","Other"];

const categoryColors = {
  Fiction: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  Science: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  History: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Mathematics: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Programming: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  Biography: "bg-pink-500/10 text-pink-300 border-pink-500/20",
  Geography: "bg-teal-500/10 text-teal-300 border-teal-500/20",
  Language: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  Arts: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  Other: "bg-slate-500/10 text-slate-300 border-slate-500/20",
};

const Books = () => {
  const { books, handleDeleteBook } = useLibrary();
  const [search, setSearch]          = useState("");
  const [category, setCategory]      = useState("All");
  const [viewMode, setViewMode]      = useState("grid"); // 'grid' | 'table'
  const [modalOpen, setModalOpen]    = useState(false);
  const [editBook, setEditBook]      = useState(null);

  // Confirm delete state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() =>
    books.filter((b) => {
      const matchSearch   = b.title.toLowerCase().includes(search.toLowerCase()) ||
                            b.author.toLowerCase().includes(search.toLowerCase()) ||
                            (b.isbn || "").includes(search);
      const matchCategory = category === "All" || b.category === category;
      return matchSearch && matchCategory;
    }),
    [books, search, category]
  );

  const confirmDelete = () => {
    if (!deleteTarget) return;
    handleDeleteBook(deleteTarget.id);
    toast.success(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Book Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">{books.length} books in library collection</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg text-xs font-medium transition ${
                viewMode === "grid" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg text-xs font-medium transition ${
                viewMode === "table" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <LayoutList size={16} />
            </button>
          </div>

          <button
            id="add-book-btn"
            onClick={() => { setEditBook(null); setModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Add Book
          </button>
        </div>
      </div>

      {/* Search & Category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="book-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or ISBN…"
            className="input pl-10 w-full"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            id="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input pl-9 pr-8 appearance-none cursor-pointer"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Catalog Display */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <BookOpen size={48} className="mb-3 opacity-30 text-slate-400" />
          <p className="font-semibold text-slate-300">No books found</p>
          <p className="text-xs mt-1">Try adjusting your search criteria or add a new book to the library.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((book) => {
            const availPct = Math.round(((book.availableCopies || 0) / (book.totalCopies || 1)) * 100);
            return (
              <div
                key={book.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition hover:-translate-y-1 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        categoryColors[book.category] || "bg-slate-500/10 text-slate-300 border-slate-500/20"
                      }`}
                    >
                      <Bookmark size={10} /> {book.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{book.isbn || "NO-ISBN"}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{book.author}</p>
                    {book.publisher && <p className="text-[11px] text-slate-500">{book.publisher}</p>}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                  {/* Availability indicator */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Available Copies</span>
                      <span
                        className={`font-semibold ${
                          book.availableCopies === 0
                            ? "text-red-400"
                            : book.availableCopies <= 1
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {book.availableCopies} / {book.totalCopies}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          book.availableCopies === 0
                            ? "bg-red-500"
                            : book.availableCopies <= 1
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(5, availPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => { setEditBook(book); setModalOpen(true); }}
                      className="p-2 rounded-xl text-blue-400 hover:bg-blue-500/10 transition"
                      title="Edit Book"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(book)}
                      className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition"
                      title="Delete Book"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="th">Title / Author</th>
                  <th className="th">ISBN</th>
                  <th className="th">Category</th>
                  <th className="th text-center">Total</th>
                  <th className="th text-center">Available</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{book.title}</p>
                          <p className="text-slate-400 text-xs">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td"><span className="text-slate-400 text-sm font-mono">{book.isbn || "—"}</span></td>
                    <td className="td">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${categoryColors[book.category] || "bg-slate-500/10 text-slate-300"}`}>
                        {book.category}
                      </span>
                    </td>
                    <td className="td text-center"><span className="text-white font-medium">{book.totalCopies}</span></td>
                    <td className="td text-center">
                      <span className={`font-semibold ${book.availableCopies === 0 ? "text-red-400" : book.availableCopies <= 1 ? "text-amber-400" : "text-emerald-400"}`}>
                        {book.availableCopies}
                      </span>
                    </td>
                    <td className="td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditBook(book); setModalOpen(true); }} className="icon-btn text-blue-400 hover:bg-blue-500/10"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(book)} className="icon-btn text-red-400 hover:bg-red-500/10"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-800 text-slate-500 text-xs">
            Showing {filtered.length} of {books.length} books
          </div>
        </div>
      )}

      {/* Book Add/Edit Modal */}
      <BookModal isOpen={modalOpen} onClose={() => setModalOpen(false)} book={editBook} />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Book?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Book"
        danger={true}
      />
    </div>
  );
};

export default Books;
