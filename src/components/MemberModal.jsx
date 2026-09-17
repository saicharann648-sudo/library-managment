// MemberModal — add/edit member using useLibrary hook
import { useState, useEffect } from "react";
import { X, UserCircle } from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import toast from "react-hot-toast";

const EMPTY = { name:"", classSection:"", phone:"", email:"" };

const MemberModal = ({ isOpen, onClose, member = null }) => {
  const { handleAddMember, handleUpdateMember } = useLibrary();
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(member);

  useEffect(() => { setForm(member ? { ...EMPTY, ...member } : EMPTY); }, [member]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const { id, ...rest } = form;
        handleUpdateMember(id, rest);
        toast.success("Member updated!");
      } else {
        handleAddMember(form);
        toast.success("Member added!");
      }
      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><UserCircle size={18} className="text-purple-400" /></div>
            <h2 className="text-lg font-semibold text-white">{isEdit ? "Edit Member" : "Add New Member"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="label">Full Name *</label><input name="name" value={form.name} onChange={handleChange} required className="input" placeholder="Student name" /></div>
          <div><label className="label">Class / Section *</label><input name="classSection" value={form.classSection} onChange={handleChange} required className="input" placeholder="e.g. 10-A" /></div>
          <div><label className="label">Phone Number</label><input name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="Phone number" /></div>
          <div><label className="label">Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="Email address" /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">{loading ? "Saving..." : isEdit ? "Update Member" : "Add Member"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberModal;
