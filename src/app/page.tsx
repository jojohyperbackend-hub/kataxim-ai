"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: "✦",
    title: "Form Usaha CRUD",
    desc: "Buat, simpan, edit, dan hapus data usaha kamu dengan form yang simpel dan cepat diisi.",
  },
  {
    icon: "◈",
    title: "AI Strategy Generator",
    desc: "Satu klik generate — AI langsung menghasilkan positioning, strategi marketing, dan diferensiasi tajam.",
  },
  {
    icon: "⬡",
    title: "Dashboard Katalog",
    desc: "Semua usaha tersusun rapi dalam satu dashboard. Pantau, kelola, dan akses hasil strategi kapan saja.",
  },
  {
    icon: "⟳",
    title: "Simpan & Re-generate",
    desc: "Hasil AI tersimpan otomatis. Tidak puas? Re-generate dan bandingkan pendekatan strategi berbeda.",
  },
];

const steps = [
  { num: "01", label: "Isi data usaha", sub: "Nama, deskripsi, target market, tantangan utama" },
  { num: "02", label: "Simpan & generate", sub: "Klik tombol generate, AI bekerja dalam hitungan detik" },
  { num: "03", label: "Terima strategi", sub: "Positioning unik, 3 ide marketing, 1 diferensiasi kuat" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased overflow-x-hidden">

      {/* ── HEADER ───────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
              <span className="text-[#10B981] font-black text-sm tracking-tighter">K</span>
            </div>
            <span className="text-[#1E3A5F] font-bold text-lg tracking-tight">
              kataxim <span className="text-[#10B981]">ai</span>
            </span>
          </motion.div>

          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-8"
          >
            <a href="#cara-kerja" className="hidden md:block text-sm text-slate-500 hover:text-[#1E3A5F] transition-colors duration-200 font-medium">
              Cara Kerja
            </a>
            <a href="#fitur" className="hidden md:block text-sm text-slate-500 hover:text-[#1E3A5F] transition-colors duration-200 font-medium">
              Fitur
            </a>
            <Link
              href="/login"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#1E3A5F] text-white hover:bg-[#10B981] transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5"
            >
              Masuk
            </Link>
          </motion.nav>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle gradient blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-50 via-transparent to-transparent rounded-full opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-50 via-transparent to-transparent rounded-full opacity-50 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[2px] bg-gradient-to-r from-transparent via-emerald-200 to-transparent opacity-40 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide uppercase mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Strategi Bisnis Berbasis AI — Untuk UMKM Indonesia
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl md:text-7xl font-black text-[#1E3A5F] leading-[1.05] tracking-tighter mb-6"
          >
            Usahamu Layak Punya{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#10B981]">Strategi Tajam</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-emerald-100 opacity-60 rounded-sm -z-0" />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12 font-medium"
          >
            Bukan sekadar saran generik. Kataxim AI membaca konteks usahamu —
            lalu menghasilkan positioning, strategi marketing, dan diferensiasi
            yang langsung bisa kamu eksekusi.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/login"
              className="group relative px-8 py-4 rounded-2xl bg-[#10B981] text-white font-bold text-base tracking-tight shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-1 hover:bg-[#059669] transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Mulai Gratis Sekarang →</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#F97316]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <a
              href="#cara-kerja"
              className="px-8 py-4 rounded-2xl border-2 border-slate-200 text-[#1E3A5F] font-semibold text-base hover:border-[#1E3A5F] hover:bg-slate-50 transition-all duration-200"
            >
              Lihat Cara Kerja
            </a>
          </motion.div>

          {/* Hero Visual — abstract stat cards */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-20 relative max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Positioning Unik", value: "✦", color: "text-[#1E3A5F]", bg: "bg-blue-50", border: "border-blue-100" },
                { label: "3 Ide Marketing", value: "◈", color: "text-[#10B981]", bg: "bg-emerald-50", border: "border-emerald-100" },
                { label: "1 Diferensiasi Kuat", value: "⬡", color: "text-[#F97316]", bg: "bg-orange-50", border: "border-orange-100" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  custom={i + 5}
                  className={`${item.bg} ${item.border} border rounded-2xl p-6 text-center`}
                >
                  <div className={`text-3xl font-black ${item.color} mb-2`}>{item.value}</div>
                  <div className="text-sm font-semibold text-slate-600">{item.label}</div>
                </motion.div>
              ))}
            </div>
            {/* glow bottom */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-emerald-200 blur-2xl opacity-30 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ── CARA KERJA ───────────────────────────────────────── */}
      <section id="cara-kerja" className="py-24 px-6 bg-[#1E3A5F] relative overflow-hidden">
        {/* decorative */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#10B981] opacity-5 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F97316] opacity-5 rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold tracking-widest uppercase mb-4">
              Cara Kerja
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Tiga langkah.<br />
              <span className="text-[#10B981]">Strategi langsung jadi.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connector line desktop */}
            <div className="hidden md:block absolute top-10 left-[17%] right-[17%] h-px bg-gradient-to-r from-emerald-500/20 via-emerald-400/40 to-emerald-500/20" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center mb-6 group-hover:bg-[#10B981]/30 transition-colors duration-300">
                  <span className="text-[#10B981] font-black text-sm">{step.num}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.label}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FITUR ────────────────────────────────────────────── */}
      <section id="fitur" className="py-24 px-6 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#f0fdf4_0%,_transparent_60%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-widest uppercase mb-4">
              Fitur Utama
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1E3A5F] leading-tight tracking-tight">
              Simpel. Fokus.{" "}
              <span className="text-[#10B981]">Langsung hasil.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                className="group p-8 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 text-[#10B981] text-xl font-bold group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-[#1E3A5F] font-bold text-lg mb-3">{feat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ───────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#1E3A5F] via-[#1a3354] to-[#0f2240] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full pointer-events-none" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-6">
            Usahamu butuh lebih dari{" "}
            <span className="text-[#10B981]">sekadar niat.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Kataxim AI hadir untuk membantu kamu membangun strategi yang terukur —
            bukan template kosong, tapi rekomendasi yang kontekstual dan actionable.
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-[#F97316] text-white font-bold text-base tracking-tight shadow-lg shadow-orange-900/30 hover:bg-[#ea6c0a] hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/40 transition-all duration-300"
          >
            Mulai Strategi Bisnismu
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="py-8 px-6 bg-[#0f2240] border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center">
              <span className="text-[#10B981] font-black text-xs">K</span>
            </div>
            <span className="text-white/60 text-sm font-medium">
              kataxim <span className="text-[#10B981]">ai</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs text-center">
            © {new Date().getFullYear()} Kataxim AI. All rights reserved.
          </p>
          <p className="text-slate-500 text-xs">
            Developed by{" "}
            <span className="text-[#10B981] font-semibold">ziel van Satoru</span>
            {" "}— Full Stack Developer
          </p>
        </div>
      </footer>
    </div>
  );
}
// end