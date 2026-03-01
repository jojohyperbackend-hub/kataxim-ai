"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { auth, logout } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// ── TYPES ─────────────────────────────────────────────────
type Usaha = {
  id: string;
  user_id: string;
  nama_usaha: string;
  deskripsi: string;
  target_market: string;
  tantangan: string;
  hasil_ai: string | null;
  created_at: string;
  updated_at: string;
};

type HasilAI = {
  positioning: string;
  marketing: string;
  diferensiasi: string;
};

type ModalType = "form" | "hasil" | "hapus" | null;

type FormState = {
  nama_usaha: string;
  deskripsi: string;
  target_market: string;
  tantangan: string;
};

// ── COOKIE HELPER ─────────────────────────────────────────
function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// ── ANIMATIONS ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const overlayAnim = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalAnim = {
  hidden: { opacity: 0, scale: 0.93, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.18 } },
};

const EMPTY_FORM: FormState = {
  nama_usaha: "", deskripsi: "", target_market: "", tantangan: "",
};

// ════════════════════════════════════════════════════════
export default function KatalogPage() {
  const router = useRouter();

  // ── AUTH ───────────────────────────────────────────────
  const [user, setUser] = useState<any>(null);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // ── DATA ───────────────────────────────────────────────
  const [usahaList, setUsahaList] = useState<Usaha[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // ── UI ─────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Usaha | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState("");
  const [toast, setToast] = useState("");

  // ── COMPUTED ───────────────────────────────────────────
  const isGuest = !user && !!guestName;
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || guestName || "Pengguna";
  const userId: string =
    user?.uid ?? (guestName ? `guest_${guestName}` : "");

  // ── TOAST ──────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  // ── AUTH INIT ──────────────────────────────────────────
  useEffect(() => {
    // Baca guest dari cookie
    const cookieGuestName = document.cookie
      .split("; ")
      .find((c) => c.startsWith("guest_name="))
      ?.split("=")[1];

    if (cookieGuestName) setGuestName(decodeURIComponent(cookieGuestName));

    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else if (!cookieGuestName) {
        router.push("/login");
        return;
      }
      setAuthReady(true);
    });

    if (cookieGuestName) setAuthReady(true);
    return () => unsub();
  }, [router]);

  // ── FETCH ──────────────────────────────────────────────
  const fetchUsaha = useCallback(async () => {
    if (!userId) return;
    setLoadingData(true);
    setGlobalError("");
    try {
      const res = await fetch(`/api/crud?user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setUsahaList(json.data ?? []);
    } catch (e: any) {
      setGlobalError(e.message || "Gagal memuat data. Coba refresh.");
    } finally {
      setLoadingData(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authReady && userId) fetchUsaha();
  }, [authReady, userId, fetchUsaha]);

  // ── MODAL HELPERS ──────────────────────────────────────
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setFormError("");
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModal("form");
  };

  const openEdit = (u: Usaha) => {
    setSelected(u);
    setForm({
      nama_usaha: u.nama_usaha,
      deskripsi: u.deskripsi,
      target_market: u.target_market,
      tantangan: u.tantangan,
    });
    setFormError("");
    setModal("form");
  };

  const openHapus = (u: Usaha) => { setSelected(u); setModal("hapus"); };
  const openHasil = (u: Usaha) => { setSelected(u); setModal("hasil"); };

  // ── SAVE ───────────────────────────────────────────────
  const handleSave = async () => {
    const { nama_usaha, deskripsi, target_market, tantangan } = form;
    if (!nama_usaha.trim() || !deskripsi.trim() || !target_market.trim() || !tantangan.trim()) {
      setFormError("Semua field wajib diisi.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const method = selected ? "PUT" : "POST";
      const body = selected
        ? { id: selected.id, ...form }
        : { user_id: userId, ...form };

      const res = await fetch("/api/crud", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      showToast(selected ? "Usaha berhasil diperbarui." : "Usaha berhasil ditambahkan.");
      await fetchUsaha();
      closeModal();
    } catch (e: any) {
      setFormError(e.message || "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ─────────────────────────────────────────────
  const handleHapus = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/crud?id=${selected.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      showToast("Usaha berhasil dihapus.");
      await fetchUsaha();
      closeModal();
    } catch (e: any) {
      setGlobalError(e.message || "Gagal menghapus usaha.");
      closeModal();
    } finally {
      setDeleting(false);
    }
  };

  // ── GENERATE ───────────────────────────────────────────
  const handleGenerate = async (u: Usaha) => {
    setGenerating(u.id);
    setGlobalError("");
    if (modal) closeModal();

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          nama_usaha: u.nama_usaha,
          deskripsi: u.deskripsi,
          target_market: u.target_market,
          tantangan: u.tantangan,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(
          json.error ||
          (res.status === 500
            ? "Server error. Pastikan API key & model di .env.local sudah benar."
            : `Error ${res.status}`)
        );
      }

      // Simpan hasil ke DB
      const putRes = await fetch("/api/crud", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, hasil_ai: json.hasil_ai }),
      });
      const putJson = await putRes.json();
      if (putJson.error) throw new Error(putJson.error);

      await fetchUsaha();
      showToast("Strategi berhasil di-generate.");

      // Buka modal hasil
      setSelected({ ...u, hasil_ai: json.hasil_ai });
      setModal("hasil");
    } catch (e: any) {
      setGlobalError(e.message || "Generate gagal. Periksa koneksi dan coba lagi.");
    } finally {
      setGenerating(null);
    }
  };

  // ── LOGOUT ─────────────────────────────────────────────
  const handleLogout = async () => {
    deleteCookie("firebase_session");
    deleteCookie("guest_name");
    if (!isGuest) await logout();
    router.push("/login");
  };

  // ── PARSE HASIL AI ─────────────────────────────────────
  const parseHasil = (raw: string | null): HasilAI | null => {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  };

  // ── SHARED CLASSES ─────────────────────────────────────
  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-[#1E3A5F] text-sm placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all duration-200 resize-none font-medium";

  const btnPrimary =
    "flex-1 py-3 rounded-xl bg-[#1E3A5F] text-white text-sm font-bold hover:bg-[#10B981] transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1E3A5F] disabled:hover:shadow-none";

  const btnSecondary =
    "flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200";

  const spinner = (
    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
  );

  // ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] antialiased">

      {/* ── NAVBAR ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center shadow-sm">
              <span className="text-[#10B981] font-black text-sm">K</span>
            </div>
            <span className="text-[#1E3A5F] font-bold text-lg tracking-tight">
              kataxim <span className="text-[#10B981]">ai</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-black">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-slate-600 text-xs font-semibold truncate max-w-[140px]">
                {displayName}
              </span>
              {isGuest && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-bold border border-amber-200">
                  Tamu
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-red-500 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── PAGE HEADER ─────────────────────────────────── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10"
        >
          <div>
            <p className="text-[11px] font-bold text-[#10B981] tracking-[0.15em] uppercase mb-1.5">
              Katalog Usaha
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-[#1E3A5F] tracking-tight leading-none">
              Strategi yang siap{" "}
              <span className="text-[#10B981]">dieksekusi.</span>
            </h1>
            {!loadingData && (
              <p className="text-slate-400 text-sm mt-2 font-medium">
                {usahaList.length === 0
                  ? "Belum ada usaha. Mulai tambahkan sekarang."
                  : `${usahaList.length} usaha terdaftar — ${usahaList.filter((u) => !!u.hasil_ai).length} sudah punya strategi`}
              </p>
            )}
          </div>

          <button
            onClick={openCreate}
            className="self-start sm:self-auto flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1E3A5F] text-white text-sm font-bold hover:bg-[#10B981] transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 flex-shrink-0"
          >
            <span className="text-xl leading-none font-light">+</span>
            Tambah Usaha
          </button>
        </motion.div>

        {/* ── GLOBAL ERROR ─────────────────────────────────── */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-base flex-shrink-0 mt-0.5">⚠</span>
                <p className="text-red-600 text-sm font-medium leading-relaxed">{globalError}</p>
              </div>
              <button
                onClick={() => setGlobalError("")}
                className="text-red-300 hover:text-red-500 text-xl leading-none flex-shrink-0 transition-colors"
              >×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SKELETON ─────────────────────────────────────── */}
        {loadingData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-[3px] bg-slate-100" />
                <div className="p-6">
                  <div className="h-3 bg-slate-100 rounded-full w-1/3 mb-4" />
                  <div className="h-5 bg-slate-100 rounded-full w-2/3 mb-3" />
                  <div className="h-3 bg-slate-100 rounded-full w-full mb-2" />
                  <div className="h-3 bg-slate-100 rounded-full w-4/5 mb-8" />
                  <div className="h-11 bg-slate-100 rounded-xl mb-2" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-9 bg-slate-100 rounded-xl" />
                    <div className="flex-1 h-9 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE ──────────────────────────────────── */}
        {!loadingData && usahaList.length === 0 && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-4xl shadow-inner">
                ◈
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#10B981] flex items-center justify-center text-white text-lg shadow-lg font-light">
                +
              </div>
            </div>
            <h3 className="text-[#1E3A5F] font-black text-2xl mb-3">Belum ada usaha</h3>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-8 font-medium">
              Tambahkan usaha pertamamu. Isi 4 field singkat,
              lalu biarkan AI merumuskan strategi bisnismu.
            </p>
            <button
              onClick={openCreate}
              className="px-8 py-4 rounded-2xl bg-[#F97316] text-white text-sm font-bold hover:bg-[#ea6c0a] transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5"
            >
              Tambah Usaha Pertama →
            </button>
          </motion.div>
        )}

        {/* ── CARD GRID ─────────────────────────────────────── */}
        {!loadingData && usahaList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {usahaList.map((u, i) => {
              const hasHasil = !!u.hasil_ai;
              const isGen = generating === u.id;

              return (
                <motion.div
                  key={u.id}
                  variants={fadeUp} initial="hidden" animate="visible" custom={i}
                  className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-100/80 transition-all duration-400 hover:-translate-y-1.5 flex flex-col overflow-hidden"
                >
                  {/* Accent bar */}
                  <div className={`h-[3px] w-full transition-all duration-500 ${
                    isGen
                      ? "bg-gradient-to-r from-[#F97316] via-[#10B981] to-[#F97316] animate-pulse"
                      : hasHasil
                      ? "bg-[#10B981]"
                      : "bg-slate-100 group-hover:bg-slate-200"
                  }`} />

                  <div className="p-6 flex flex-col flex-1">

                    {/* Status + date */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide ${
                        hasHasil
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}>
                        {hasHasil && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        {hasHasil ? "Strategi Tersedia" : "Belum di-generate"}
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium">
                        {new Date(u.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Nama */}
                    <h3 className="text-[#1E3A5F] font-black text-lg leading-snug mb-2 group-hover:text-[#10B981] transition-colors duration-300">
                      {u.nama_usaha}
                    </h3>

                    {/* Deskripsi */}
                    <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2 font-medium">
                      {u.deskripsi}
                    </p>

                    {/* Tag */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      <span className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-500 font-semibold border border-blue-100 truncate max-w-[200px]">
                        {u.target_market.length > 30
                          ? u.target_market.slice(0, 30) + "…"
                          : u.target_market}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-2">

                      {/* Primary */}
                      <button
                        onClick={() => hasHasil ? openHasil(u) : handleGenerate(u)}
                        disabled={isGen || (!!generating && !isGen)}
                        className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2.5 ${
                          isGen
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : hasHasil
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                            : "bg-[#F97316] text-white hover:bg-[#ea6c0a] hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5"
                        } disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                      >
                        {isGen ? (
                          <>{spinner} <span>AI sedang bekerja...</span></>
                        ) : hasHasil ? (
                          <><span>Lihat Strategi</span><span>→</span></>
                        ) : (
                          <><span>✦</span><span>Generate Strategi</span></>
                        )}
                      </button>

                      {/* Secondary */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-500 border border-slate-200 hover:border-[#1E3A5F] hover:text-[#1E3A5F] hover:bg-slate-50 transition-all duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openHapus(u)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-red-400 border border-red-100 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                        >
                          Hapus
                        </button>
                        {hasHasil && (
                          <button
                            onClick={() => handleGenerate(u)}
                            disabled={!!generating}
                            title="Re-generate strategi"
                            className="w-10 py-2.5 rounded-xl text-sm text-slate-400 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 disabled:opacity-40 flex items-center justify-center"
                          >
                            ⟳
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════ */}
      {/* MODALS                                              */}
      {/* ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              variants={overlayAnim} initial="hidden" animate="visible" exit="exit"
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              variants={modalAnim} initial="hidden" animate="visible" exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className={`pointer-events-auto bg-white rounded-2xl shadow-2xl shadow-slate-300/40 w-full overflow-hidden ${
                  modal === "hasil" ? "max-w-2xl" : "max-w-md"
                }`}
              >

                {/* ══ FORM MODAL ══════════════════════════════ */}
                {modal === "form" && (
                  <>
                    <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
                      <div>
                        <h2 className="text-[#1E3A5F] font-black text-xl tracking-tight">
                          {selected ? "Edit Usaha" : "Usaha Baru"}
                        </h2>
                        <p className="text-slate-400 text-xs mt-1 font-medium">
                          {selected
                            ? "Perbarui informasi usahamu."
                            : "Isi data usaha untuk di-generate strateginya oleh AI."}
                        </p>
                      </div>
                      <button onClick={closeModal} className="text-slate-300 hover:text-slate-600 text-2xl leading-none transition-colors ml-4 flex-shrink-0">×</button>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                      {[
                        { label: "Nama Usaha", key: "nama_usaha", type: "input", placeholder: "Contoh: Warung Kopi Semesta" },
                        { label: "Deskripsi Usaha", key: "deskripsi", type: "textarea", placeholder: "Ceritakan apa yang kamu jual dan bagaimana cara melayani pelanggan..." },
                        { label: "Target Market", key: "target_market", type: "input", placeholder: "Contoh: Mahasiswa 18-25 tahun di area kampus" },
                        { label: "Tantangan Utama", key: "tantangan", type: "textarea", placeholder: "Apa masalah terbesar yang kamu hadapi sekarang?" },
                      ].map(({ label, key, type, placeholder }) => (
                        <div key={key}>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5 tracking-wide">
                            {label} <span className="text-red-400">*</span>
                          </label>
                          {type === "input" ? (
                            <input
                              type="text"
                              placeholder={placeholder}
                              value={form[key as keyof FormState]}
                              onChange={(e) => {
                                setForm({ ...form, [key]: e.target.value });
                                setFormError("");
                              }}
                              className={inputCls}
                              maxLength={200}
                            />
                          ) : (
                            <textarea
                              rows={key === "deskripsi" ? 3 : 2}
                              placeholder={placeholder}
                              value={form[key as keyof FormState]}
                              onChange={(e) => {
                                setForm({ ...form, [key]: e.target.value });
                                setFormError("");
                              }}
                              className={inputCls}
                              maxLength={500}
                            />
                          )}
                        </div>
                      ))}

                      <AnimatePresence>
                        {formError && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-red-500 text-xs bg-red-50 border border-red-100 px-4 py-3 rounded-xl font-medium"
                          >
                            {formError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="px-6 pb-6 flex gap-3">
                      <button onClick={closeModal} className={btnSecondary}>Batal</button>
                      <button onClick={handleSave} disabled={saving} className={btnPrimary}>
                        {saving
                          ? <span className="flex items-center justify-center gap-2">{spinner} Menyimpan...</span>
                          : selected ? "Simpan Perubahan" : "Simpan Usaha"}
                      </button>
                    </div>
                  </>
                )}

                {/* ══ HAPUS MODAL ══════════════════════════════ */}
                {modal === "hapus" && selected && (
                  <>
                    <div className="px-6 pt-8 pb-5 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5 text-3xl">
                        🗑
                      </div>
                      <h2 className="text-[#1E3A5F] font-black text-xl mb-3">Hapus Usaha?</h2>
                      <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-xs mx-auto">
                        Usaha{" "}
                        <span className="font-bold text-slate-600">"{selected.nama_usaha}"</span>{" "}
                        dan seluruh hasil strategi AI-nya akan dihapus permanen.
                      </p>
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                      <button onClick={closeModal} className={btnSecondary}>Batal</button>
                      <button
                        onClick={handleHapus}
                        disabled={deleting}
                        className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all duration-200 disabled:opacity-60"
                      >
                        {deleting
                          ? <span className="flex items-center justify-center gap-2">{spinner} Menghapus...</span>
                          : "Ya, Hapus Permanen"}
                      </button>
                    </div>
                  </>
                )}

                {/* ══ HASIL AI MODAL ════════════════════════════ */}
                {modal === "hasil" && selected && (() => {
                  const hasil = parseHasil(selected.hasil_ai);
                  return (
                    <>
                      <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-[10px] font-bold text-[#10B981] tracking-[0.15em] uppercase mb-1">
                            Hasil Strategi AI
                          </p>
                          <h2 className="text-[#1E3A5F] font-black text-xl tracking-tight leading-tight truncate">
                            {selected.nama_usaha}
                          </h2>
                          <p className="text-slate-400 text-xs mt-1 font-medium truncate">
                            {selected.target_market}
                          </p>
                        </div>
                        <button
                          onClick={closeModal}
                          className="text-slate-300 hover:text-slate-600 text-2xl leading-none transition-colors flex-shrink-0"
                        >×</button>
                      </div>

                      <div className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto">

                        {/* Positioning */}
                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-[#1E3A5F] flex items-center justify-center flex-shrink-0">
                              <span className="text-[#10B981] text-sm font-black">✦</span>
                            </div>
                            <div>
                              <p className="text-[#1E3A5F] font-black text-sm">Positioning Unik</p>
                              <p className="text-blue-400 text-[10px] font-semibold">Siapa kamu di mata pasar</p>
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            {hasil?.positioning || "Data tidak tersedia."}
                          </p>
                        </div>

                        {/* Marketing */}
                        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-[#10B981] flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-black">◈</span>
                            </div>
                            <div>
                              <p className="text-emerald-700 font-black text-sm">3 Ide Strategi Marketing</p>
                              <p className="text-emerald-400 text-[10px] font-semibold">Pendekatan berbeda, langsung eksekusi</p>
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-line">
                            {hasil?.marketing || "Data tidak tersedia."}
                          </p>
                        </div>

                        {/* Diferensiasi */}
                        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-[#F97316] flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-black">⬡</span>
                            </div>
                            <div>
                              <p className="text-orange-700 font-black text-sm">Diferensiasi Kuat</p>
                              <p className="text-orange-400 text-[10px] font-semibold">Yang membuat kamu sulit ditiru</p>
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            {hasil?.diferensiasi || "Data tidak tersedia."}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-4 flex gap-3 border-t border-slate-100">
                        <button onClick={closeModal} className={btnSecondary}>Tutup</button>
                        <button
                          onClick={() => {
                            const copy = { ...selected };
                            closeModal();
                            setTimeout(() => handleGenerate(copy), 120);
                          }}
                          disabled={!!generating}
                          className={btnPrimary}
                        >
                          {generating === selected.id
                            ? <span className="flex items-center justify-center gap-2">{spinner} Generating...</span>
                            : "⟳ Re-generate Strategi"}
                        </button>
                      </div>
                    </>
                  );
                })()}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── TOAST ─────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-[#1E3A5F] text-white text-sm font-semibold shadow-2xl shadow-slate-900/20 flex items-center gap-2.5 whitespace-nowrap"
          >
            <span className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center text-xs font-black flex-shrink-0">✓</span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="mt-20 py-6 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-xs font-medium">
          © {new Date().getFullYear()} Kataxim AI —{" "}
          <span className="text-[#10B981] font-semibold">ziel van Satoru</span>
          {" "}Full Stack Developer
        </p>
      </footer>
    </div>
  );
}