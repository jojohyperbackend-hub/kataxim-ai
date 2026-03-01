"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  setupRecaptcha,
  loginWithPhone,
} from "@/lib/firebase";

type Tab = "email" | "phone" | "guest";
type Mode = "login" | "register";

// ── COOKIE HELPER ────────────────────────────────────────
function setCookie(name: string, value: string, days = 1) {
  document.cookie = `${name}=${value}; path=/; max-age=${days * 86400}; SameSite=Lax`;
}

// ── ANIMATIONS ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export default function LoginPage() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("email");
  const [mode, setMode] = useState<Mode>("login");

  // email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // phone
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmResult, setConfirmResult] = useState<any>(null);

  // guest
  const [guestName, setGuestName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = () => setError("");

  // ── AFTER LOGIN — set cookie + redirect ──────────────────
  const afterLogin = (type: "firebase" | "guest", gName?: string) => {
    if (type === "firebase") {
      setCookie("firebase_session", "true", 1);
    } else if (gName) {
      setCookie("guest_name", gName, 1);
    }
    router.push("/katalog");
  };

  // ── GOOGLE ───────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true);
    clearError();
    try {
      await loginWithGoogle();
      afterLogin("firebase");
    } catch (e: any) {
      setError(friendlyError(e.code || e.message));
    } finally {
      setLoading(false);
    }
  };

  // ── EMAIL ────────────────────────────────────────────────
  const handleEmail = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    clearError();
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      afterLogin("firebase");
    } catch (e: any) {
      setError(friendlyError(e.code || e.message));
    } finally {
      setLoading(false);
    }
  };

  // ── PHONE ────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError("Nomor telepon wajib diisi.");
      return;
    }
    setLoading(true);
    clearError();
    try {
      const recaptcha = setupRecaptcha("recaptcha-container");
      const confirmation = await loginWithPhone(phone, recaptcha);
      setConfirmResult(confirmation);
      setOtpSent(true);
    } catch (e: any) {
      setError(friendlyError(e.code || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("Kode OTP wajib diisi.");
      return;
    }
    setLoading(true);
    clearError();
    try {
      await confirmResult.confirm(otp);
      afterLogin("firebase");
    } catch (e: any) {
      setError(friendlyError(e.code || e.message));
    } finally {
      setLoading(false);
    }
  };

  // ── GUEST ────────────────────────────────────────────────
  const handleGuest = () => {
    if (!guestName.trim()) {
      setError("Masukkan nama kamu dulu sebelum lanjut.");
      return;
    }
    if (guestName.trim().length < 2) {
      setError("Nama minimal 2 karakter.");
      return;
    }
    afterLogin("guest", guestName.trim());
  };

  // ── FRIENDLY ERROR ───────────────────────────────────────
  function friendlyError(code: string): string {
    const map: Record<string, string> = {
      "auth/invalid-credential":    "Email atau password salah.",
      "auth/user-not-found":        "Akun tidak ditemukan. Daftar dulu.",
      "auth/wrong-password":        "Password salah. Coba lagi.",
      "auth/email-already-in-use":  "Email sudah terdaftar. Masuk saja.",
      "auth/weak-password":         "Password minimal 6 karakter.",
      "auth/invalid-email":         "Format email tidak valid.",
      "auth/too-many-requests":     "Terlalu banyak percobaan. Tunggu beberapa saat.",
      "auth/popup-closed-by-user":  "Login Google dibatalkan.",
      "auth/invalid-phone-number":  "Format nomor telepon tidak valid.",
      "auth/invalid-verification-code": "Kode OTP salah. Periksa kembali.",
      "auth/network-request-failed": "Koneksi bermasalah. Periksa internet kamu.",
    };
    return map[code] ?? "Terjadi kesalahan. Coba lagi.";
  }

  // ── SHARED CLASSES ────────────────────────────────────────
  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-[#1E3A5F] text-sm placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all duration-200 font-medium";

  const btnPrimary =
    "w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#1E3A5F] hover:bg-[#10B981] transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-[#1E3A5F] disabled:hover:shadow-none";

  const tabs: { key: Tab; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "phone", label: "Telepon" },
    { key: "guest", label: "Tamu" },
  ];

  // ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex overflow-hidden">

      {/* ── LEFT PANEL (desktop only) ─────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-[#1E3A5F] p-12 relative overflow-hidden flex-shrink-0">

        {/* Decorative rings */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#10B981]/4 border border-[#10B981]/8" />
        <div className="absolute bottom-32 right-0 w-48 h-px bg-gradient-to-l from-transparent via-emerald-500/25 to-transparent" />
        <div className="absolute top-1/2 left-0 w-px h-48 bg-gradient-to-b from-transparent via-white/5 to-transparent" />

        {/* Logo */}
        <motion.div
          variants={slideIn} initial="hidden" animate="visible" custom={0}
          className="relative z-10 flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/25 flex items-center justify-center">
            <span className="text-[#10B981] font-black text-base">K</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            kataxim <span className="text-[#10B981]">ai</span>
          </span>
        </motion.div>

        {/* Center copy */}
        <motion.div
          variants={slideIn} initial="hidden" animate="visible" custom={1}
          className="relative z-10"
        >
          <p className="text-[#10B981] text-xs font-bold tracking-[0.18em] uppercase mb-5">
            Strategi Bisnis × AI
          </p>
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-6">
            Masuk dan mulai<br />
            <span className="text-[#10B981]">bangun strategimu.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] font-medium">
            Isi data usaha, klik generate, dan dapatkan positioning,
            marketing, serta diferensiasi yang langsung bisa dieksekusi.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3.5">
            {[
              { icon: "✦", text: "Positioning unik untuk usahamu" },
              { icon: "◈", text: "3 ide strategi marketing berbeda" },
              { icon: "⬡", text: "1 diferensiasi kuat dan actionable" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={slideIn} initial="hidden" animate="visible" custom={i + 2}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] text-xs flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-slate-300 text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer credit */}
        <motion.p
          variants={slideIn} initial="hidden" animate="visible" custom={5}
          className="relative z-10 text-slate-600 text-xs font-medium"
        >
          © {new Date().getFullYear()} Kataxim AI
        </motion.p>
      </div>

      {/* ── RIGHT PANEL (form) ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white relative min-h-screen">

        {/* Subtle bg radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#ecfdf5_0%,_transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#eff6ff_0%,_transparent_55%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
              <span className="text-[#10B981] font-black text-sm">K</span>
            </div>
            <span className="text-[#1E3A5F] font-bold text-lg tracking-tight">
              kataxim <span className="text-[#10B981]">ai</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[#1E3A5F] tracking-tight mb-1.5">
              {mode === "login" ? "Selamat datang kembali" : "Buat akun baru"}
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {mode === "login"
                ? "Masuk untuk lanjut ke katalog usahamu."
                : "Daftarkan akunmu dan mulai gratis."}
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 hover:shadow-md transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Lanjut dengan Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-slate-400 text-xs font-semibold tracking-wide">ATAU</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); clearError(); setOtpSent(false); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  tab === t.key
                    ? "bg-white text-[#1E3A5F] shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">

            {/* ── EMAIL TAB ── */}
            {tab === "email" && (
              <motion.div
                key="email"
                variants={fadeUp} initial="hidden" animate="visible" exit="exit"
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 tracking-wide">Email</label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    onKeyDown={(e) => e.key === "Enter" && handleEmail()}
                    className={inputCls}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError(); }}
                      onKeyDown={(e) => e.key === "Enter" && handleEmail()}
                      className={`${inputCls} pr-12`}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold"
                    >
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button onClick={handleEmail} disabled={loading} className={btnPrimary}>
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memproses...
                      </span>
                    : mode === "login" ? "Masuk" : "Daftar Sekarang"}
                </button>

                <p className="text-center text-xs text-slate-400 pt-1">
                  {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                  <button
                    onClick={() => { setMode(mode === "login" ? "register" : "login"); clearError(); }}
                    className="text-[#10B981] font-bold hover:underline"
                  >
                    {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── PHONE TAB ── */}
            {tab === "phone" && (
              <motion.div
                key="phone"
                variants={fadeUp} initial="hidden" animate="visible" exit="exit"
                className="space-y-3"
              >
                {!otpSent ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 tracking-wide">Nomor Telepon</label>
                      <input
                        type="tel"
                        placeholder="+62 812 3456 7890"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); clearError(); }}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                        className={inputCls}
                      />
                      <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                        Gunakan format internasional, contoh: +62 untuk Indonesia
                      </p>
                    </div>
                    <div id="recaptcha-container" />
                    <button onClick={handleSendOtp} disabled={loading} className={btnPrimary}>
                      {loading
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Mengirim OTP...
                          </span>
                        : "Kirim Kode OTP"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="text-emerald-700 text-xs font-semibold">
                        Kode OTP dikirim ke{" "}
                        <span className="font-black">{phone}</span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 tracking-wide">Kode OTP</label>
                      <input
                        type="text"
                        placeholder="Masukkan 6 digit kode"
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); clearError(); }}
                        onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                        className={inputCls}
                        maxLength={6}
                        inputMode="numeric"
                      />
                    </div>
                    <button onClick={handleVerifyOtp} disabled={loading} className={btnPrimary}>
                      {loading
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Memverifikasi...
                          </span>
                        : "Verifikasi & Masuk"}
                    </button>
                    <button
                      onClick={() => { setOtpSent(false); setOtp(""); clearError(); }}
                      className="w-full text-xs text-slate-400 hover:text-[#1E3A5F] transition-colors py-1.5 font-semibold"
                    >
                      ← Ganti nomor telepon
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* ── GUEST TAB ── */}
            {tab === "guest" && (
              <motion.div
                key="guest"
                variants={fadeUp} initial="hidden" animate="visible" exit="exit"
                className="space-y-3"
              >
                <div className="px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-amber-700 text-xs font-semibold leading-relaxed">
                    Mode tamu tidak menyimpan data secara permanen.
                    Sesi akan berakhir saat browser ditutup.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 tracking-wide">Nama Kamu</label>
                  <input
                    type="text"
                    placeholder="Siapa namamu?"
                    value={guestName}
                    onChange={(e) => { setGuestName(e.target.value); clearError(); }}
                    onKeyDown={(e) => e.key === "Enter" && handleGuest()}
                    className={inputCls}
                    maxLength={50}
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleGuest}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#F97316] hover:bg-[#ea6c0a] transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5"
                >
                  Lanjut sebagai Tamu →
                </button>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100"
              >
                <span className="text-red-400 text-base flex-shrink-0 mt-0.5">⚠</span>
                <p className="text-red-600 text-xs font-semibold leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-[#1E3A5F] transition-colors font-semibold"
            >
              ← Kembali ke halaman utama
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}