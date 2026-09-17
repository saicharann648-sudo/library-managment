// Members page using useLibrary hook & ConfirmModal
import { useState, useMemo } from "react";
import { Plus, Search, Users, Pencil, Trash2, BookMarked, Phone, Mail } from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import MemberModal from "../components/MemberModal";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

const Members = () => {
  const { members, handleDeleteMember } = useLibrary();
  const [search, setSearch]           = useState("");
  const [modalOpen, setModalOpen]     = useState(false);
  const [editMember, setEditMember]   = useState(null);

  // Confirm modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() =>
    members.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.classSection || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(search.toLowerCase())
    ), [members, search]);

  const onRequestDelete = (member) => {
    if (member.issuedBooks > 0) {
      toast.error(`${member.name} has ${member.issuedBooks} book(s) issued. Return them first.`);
      return;
    }
    setDeleteTarget(member);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    handleDeleteMember(deleteTarget.id);
    toast.success(`${deleteTarget.name} removed`);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Library Members</h1>
          <p className="text-slate-400 text-sm mt-1">{members.length} registered students & staff</p>
        </div>
        <button id="add-member-btn" onClick={() => { setEditMember(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input id="member-search" type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, class, or email…" className="input pl-10 w-full" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <Users size={48} className="mb-3 opacity-30 text-slate-400" />
          <p className="font-semibold text-slate-300">No members found</p>
          <p className="text-xs mt-1">Try searching with a different term or register a new member.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="th">Member</th>
                  <th className="th">Class / Grade</th>
                  <th className="th">Contact Info</th>
                  <th className="th text-center">Books Issued</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                          {m.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{m.name}</p>
                          {m.email && <p className="text-slate-400 text-xs">{m.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
                        {m.classSection || "—"}
                      </span>
                    </td>
                    <td className="td">
                      <div className="space-y-1">
                        {m.phone && <div className="flex items-center gap-1.5 text-xs text-slate-400"><Phone size={12} />{m.phone}</div>}
                        {m.email && <div className="flex items-center gap-1.5 text-xs text-slate-400"><Mail size={12} />{m.email}</div>}
                      </div>
                    </td>
                    <td className="td text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <BookMarked size={14} className={m.issuedBooks > 0 ? "text-amber-400" : "text-slate-600"} />
                        <span className={`font-semibold text-sm ${m.issuedBooks > 0 ? "text-amber-400" : "text-slate-500"}`}>{m.issuedBooks || 0}</span>
                      </div>
                    </td>
                    <td className="td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditMember(m); setModalOpen(true); }} className="icon-btn text-blue-400 hover:bg-blue-500/10" title="Edit Member"><Pencil size={15} /></button>
                        <button onClick={() => onRequestDelete(m)} className="icon-btn text-red-400 hover:bg-red-500/10" title="Delete Member"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-800 text-slate-500 text-xs">
            Showing {filtered.length} of {members.length} members
          </div>
        </div>
      )}

      <MemberModal isOpen={modalOpen} onClose={() => setModalOpen(false)} member={editMember} />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove Member?"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from the library directory?`}
        confirmText="Remove Member"
        danger={true}
      />
    </div>
  );
};

export default Members;
