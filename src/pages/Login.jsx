// Login page — normal login + recovery code forgot-password flow
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, Mail, Lock, Eye, EyeOff,
  LogIn, ArrowLeft, ShieldCheck, KeyRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  hasRecoveryCode,
  generateRecoveryCode,
  verifyRecoveryCode,
} from "../db/localDB";
import RecoveryCodeModal from "../components/RecoveryCodeModal";
import toast from "react-hot-toast";

const Login = () => {
  // ── Login form ─────────────────────────────────────────────────────────────
  const [mode,    setMode]    = useState("login"); // "login" | "forgot"
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Recovery code modal (shown once after first login) ─────────────────────
  const [recoveryCode,     setRecoveryCode]     = useState(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // ── Forgot password form ───────────────────────────────────────────────────
  const [recoveryInput, setRecoveryInput] = useState("");

  const { login }  = useAuth();
  const navigate   = useNavigate();

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      login(form.email, form.password);

      // First-time login → generate and show recovery code once
      if (!hasRecoveryCode()) {
        const code = generateRecoveryCode();
        setRecoveryCode(code);
        setShowRecoveryModal(true);
        // Don't navigate yet — wait for user to close modal
      } else {
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryModalClose = () => {
    setShowRecoveryModal(false);
    toast.success("Welcome! You're logged in.");
    navigate("/");
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!hasRecoveryCode()) {
      toast.error("No recovery code has been set up yet.\nLog in with your password first.");
      return;
    }
    if (verifyRecoveryCode(recoveryInput)) {
      login("admin@library.com", "admin123");
      toast.success("Recovery successful! You are now logged in.");
      navigate("/");
    } else {
      toast.error("Incorrect recovery code. Please try again.");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Recovery code one-time modal */}
      {showRecoveryModal && recoveryCode && (
        <RecoveryCodeModal code={recoveryCode} onClose={handleRecoveryModalClose} />
      )}

      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md space-y-6">

          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 text-white shadow-md mb-3">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              School Library System
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {mode === "login" ? "Librarian & Admin Login Portal" : "Account Recovery"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-md">

            {/* ── MODE: Normal Login ── */}
            {mode === "login" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="input pl-9"
                      placeholder="admin@library.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password"
                      type={showPwd ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="input pl-9 pr-9"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    id="forgot-password-btn"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login button */}
                <button
                  id="login-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center py-2.5"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <LogIn size={16} />
                  }
                  <span>{loading ? "Logging in…" : "Login to Library"}</span>
                </button>
              </form>
            )}

            {/* ── MODE: Forgot Password / Recovery Code ── */}
            {mode === "forgot" && (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                {/* Icon + description */}
                <div className="flex flex-col items-center gap-2 text-center pb-1">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
                    <KeyRound size={22} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Enter your Recovery Code
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      This was shown when you first logged in.<br />
                      Paste or type it below to regain access.
                    </p>
                  </div>
                </div>

                {/* Recovery code input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Recovery Code
                  </label>
                  <div className="relative">
                    <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="recovery-code-input"
                      type="text"
                      value={recoveryInput}
                      onChange={(e) => setRecoveryInput(e.target.value)}
                      required
                      className="input pl-9 font-mono tracking-widest uppercase"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Verify button */}
                <button
                  id="verify-recovery-btn"
                  type="submit"
                  className="w-full btn-primary justify-center py-2.5"
                >
                  <ShieldCheck size={16} />
                  <span>Verify &amp; Login</span>
                </button>

                {/* Back */}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setRecoveryInput(""); }}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition mx-auto"
                >
                  <ArrowLeft size={13} />
                  Back to Login
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
