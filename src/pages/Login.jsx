// Login page — normal login + forgot-password OTP flow
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, Mail, Lock, Eye, EyeOff,
  LogIn, ArrowLeft, RefreshCw, ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  // ── Login form state ──────────────────────────────────────────────────────
  const [mode,    setMode]    = useState("login"); // "login" | "otp"
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── OTP state ──────────────────────────────────────────────────────────────
  const [otpToken,  setOtpToken]  = useState(null);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  // Countdown timer for "Resend OTP"
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

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
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Send OTP ───────────────────────────────────────────────────────────────
  const sendOtp = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/send-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setOtpToken(data.token);
      setOtpDigits(["", "", "", "", "", ""]);
      setMode("otp");
      setCountdown(60);
      toast.success("OTP sent to your registered email!");
      // Auto-focus first box
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch (err) {
      toast.error(err.message || "Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP box helpers ────────────────────────────────────────────────────────
  const handleOtpDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const digits    = [...otpDigits];
    digits[index]   = value;
    setOtpDigits(digits);
    // Auto-advance
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKey = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtpDigits(text.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Verify OTP & auto-login ────────────────────────────────────────────────
  const verifyOtp = () => {
    const entered = otpDigits.join("");
    if (entered.length < 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    try {
      const decoded              = atob(otpToken);
      const [storedOtp, tsStr]   = decoded.split(":");
      const elapsed              = Date.now() - parseInt(tsStr, 10);

      if (elapsed > 10 * 60 * 1000) {
        toast.error("OTP has expired. Please request a new one.");
        return;
      }
      if (storedOtp !== entered) {
        toast.error("Incorrect OTP. Please try again.");
        // Shake the boxes
        return;
      }
      // ✅ Correct — auto-login as admin
      login("admin@library.com", "admin123");
      toast.success("Verified! Logging you in…");
      navigate("/");
    } catch {
      toast.error("Invalid session. Please request a new OTP.");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
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
            {mode === "login" ? "Librarian & Admin Login Portal" : "OTP Verification"}
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
                  onClick={sendOtp}
                  disabled={loading}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 transition"
                >
                  {loading ? "Sending OTP…" : "Forgot Password?"}
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

          {/* ── MODE: OTP Verification ── */}
          {mode === "otp" && (
            <div className="space-y-5">
              {/* Icon + description */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
                  <ShieldCheck size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 text-center leading-relaxed">
                  A 6-digit OTP has been sent to your registered email.<br />
                  <span className="text-xs text-slate-400">It expires in 10 minutes.</span>
                </p>
              </div>

              {/* 6-digit OTP boxes */}
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    id={`otp-digit-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigit(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className="w-11 h-[52px] text-center text-xl font-bold rounded-lg border-2 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none transition text-slate-800 dark:text-white"
                  />
                ))}
              </div>

              {/* Verify button */}
              <button
                id="verify-otp-btn"
                type="button"
                onClick={verifyOtp}
                className="w-full btn-primary justify-center py-2.5"
              >
                <ShieldCheck size={16} />
                <span>Verify OTP &amp; Login</span>
              </button>

              {/* Back + Resend */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                >
                  <ArrowLeft size={13} />
                  Back to Login
                </button>

                {countdown > 0 ? (
                  <span className="text-slate-400">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    id="resend-otp-btn"
                    onClick={sendOtp}
                    disabled={loading}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 transition"
                  >
                    <RefreshCw size={12} />
                    {loading ? "Sending…" : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
