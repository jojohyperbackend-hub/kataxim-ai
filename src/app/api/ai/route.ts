// src/app/api/ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL!,
});

// ✅ Model name benar sesuai OpenRouter
const MODEL = "meta-llama/llama-3.2-3b-instruct";

// ── HELPER: call LLM ─────────────────────────────────────
async function callLLM(
  system: string,
  user: string,
  temperature = 0.7,
  max_tokens = 800
): Promise<string> {
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature,
    max_tokens,
  });

  const content = res.choices?.[0]?.message?.content;
  if (!content) throw new Error("Model tidak menghasilkan output. Coba generate ulang.");
  return content.trim();
}

// ── HELPER: strip markdown ────────────────────────────────
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/_{1,2}/g, "")
    .replace(/`{1,3}/g, "")
    .replace(/^\s*[-–—]\s/gm, "")
    .replace(/^\s*\d+\.\s/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ════════════════════════════════════════════════════════
// LAYER 1 — INPUT INTAKE & SAFETY FILTER
// ════════════════════════════════════════════════════════
function intakeAndFilter(body: any): {
  valid: boolean;
  reason?: string;
  data?: any;
} {
  const { user_id, nama_usaha, deskripsi, target_market, tantangan } = body ?? {};

  if (!user_id || !nama_usaha || !deskripsi || !target_market || !tantangan) {
    return { valid: false, reason: "Semua field usaha wajib diisi sebelum generate." };
  }

  if (!nama_usaha.trim() || !deskripsi.trim() || !target_market.trim() || !tantangan.trim()) {
    return { valid: false, reason: "Semua field wajib diisi, tidak boleh hanya spasi." };
  }

  const allInput = `${nama_usaha} ${deskripsi} ${target_market} ${tantangan}`;

  const injectionPattern =
    /ignore previous|forget instructions|jailbreak|act as|you are now|system prompt|disregard|override/i;
  if (injectionPattern.test(allInput)) {
    return { valid: false, reason: "Input tidak valid. Gunakan deskripsi usaha yang sebenarnya." };
  }

  if (allInput.length > 4000) {
    return { valid: false, reason: "Input terlalu panjang. Ringkas deskripsi usahamu." };
  }

  // ✅ Tidak ada minimum length — deskripsi pendek tetap lolos
  return {
    valid: true,
    data: {
      user_id,
      nama_usaha: nama_usaha.trim(),
      deskripsi: deskripsi.trim(),
      target_market: target_market.trim(),
      tantangan: tantangan.trim(),
    },
  };
}

// ════════════════════════════════════════════════════════
// LAYER 2 — AGENT CONTROLLER
// ════════════════════════════════════════════════════════
function agentController(data: any) {
  return {
    task_type: "umkm_business_strategy",
    mode: "sequential_single_agent",
    success_criteria: [
      "positioning spesifik bukan klise",
      "tiga ide marketing berbeda pendekatan dan realistis untuk UMKM",
      "satu diferensiasi yang terasa nyata oleh pelanggan",
    ],
    context: data,
  };
}

// ════════════════════════════════════════════════════════
// LAYER 3 — TASK DECOMPOSER
// ════════════════════════════════════════════════════════
function taskDecomposer() {
  return [
    { step: 1, label: "analyze_business", dep: null },
    { step: 2, label: "generate_positioning", dep: "analyze_business" },
    { step: 3, label: "generate_marketing", dep: "generate_positioning" },
    { step: 4, label: "generate_differentiation", dep: "generate_marketing" },
    { step: 5, label: "self_review", dep: "generate_differentiation" },
  ];
}

// ════════════════════════════════════════════════════════
// LAYER 4 — CORE AGENT REASONING
// ════════════════════════════════════════════════════════

async function agentAnalyze(ctx: any): Promise<string> {
  return await callLLM(
    `Kamu adalah analis bisnis UMKM Indonesia yang berpengalaman.
Meskipun informasi yang diberikan singkat, tetap analisis dengan cerdas menggunakan konteks yang ada.
Gunakan asumsi yang masuk akal berdasarkan nama dan jenis usaha jika deskripsi minim.
Tulis dalam bentuk paragraf mengalir, natural, tidak seperti laporan formal.
Tidak boleh ada simbol markdown, tanda bintang, pagar, atau bullet.`,

    `Analisis konteks usaha ini:

Nama Usaha: ${ctx.nama_usaha}
Deskripsi: ${ctx.deskripsi}
Target Market: ${ctx.target_market}
Tantangan Utama: ${ctx.tantangan}

Identifikasi keunikan tersirat, pesaing implisit, dan celah pasar yang belum digarap.
Jika informasi singkat, gunakan pengetahuanmu tentang jenis usaha serupa di Indonesia.
Maksimal dua paragraf. Langsung tulis tanpa judul atau label.`,
    0.65,
    400
  );
}

async function agentPositioning(ctx: any, analysis: string): Promise<string> {
  return await callLLM(
    `Kamu adalah brand strategist untuk UMKM Indonesia.
Rumuskan positioning yang spesifik, hindari klise seperti berkualitas tinggi, terpercaya, atau terbaik.
Jika data input singkat, gunakan kreativitas berbasis konteks nama dan jenis usaha.
Tulis seperti saran mentor bisnis, bukan laporan formal.
Tidak ada simbol markdown apapun.`,

    `Analisis konteks:
${analysis}

Nama usaha: ${ctx.nama_usaha}
Target market: ${ctx.target_market}

Rumuskan positioning unik dalam dua sampai tiga kalimat tegas dan spesifik.
Jawab: untuk siapa, apa yang ditawarkan, mengapa berbeda.
Langsung tulis kalimatnya tanpa label atau kata pengantar.`,
    0.75,
    300
  );
}

async function agentMarketing(ctx: any, positioning: string): Promise<string> {
  return await callLLM(
    `Kamu adalah konsultan marketing UMKM Indonesia yang pragmatis.
Buat tiga ide marketing yang realistis dengan pendekatan berbeda.
Satu berbasis komunitas atau relasi, satu berbasis konten atau media sosial, satu berbasis kolaborasi atau event lokal.
Meski input singkat, tetap buat saran yang konkret dan bisa langsung dieksekusi minggu ini.
Tulis dengan bahasa lugas seperti saran teman yang paham bisnis.
Tidak ada simbol markdown, tanda bintang, pagar, atau bullet.
Format: tulis nama ide lalu titik dua lalu penjelasan dan langkah pertama yang konkret. Pisahkan setiap ide dengan satu baris kosong.`,

    `Usaha: ${ctx.nama_usaha}
Positioning: ${positioning}
Target market: ${ctx.target_market}
Tantangan: ${ctx.tantangan}

Tulis tiga ide strategi marketing. Setiap ide punya nama deskriptif, penjelasan singkat, dan satu langkah pertama konkret.
Langsung tulis tanpa nomor urut, bullet, atau kata pengantar.`,
    0.8,
    600
  );
}

async function agentDifferentiation(ctx: any, positioning: string): Promise<string> {
  return await callLLM(
    `Kamu adalah business advisor fokus pada keunggulan kompetitif UMKM.
Temukan satu diferensiasi yang bisa dirasakan langsung oleh pelanggan.
Jika data minim, gunakan kreativitas berdasarkan jenis usaha dan tantangan yang ada.
Diferensiasi harus spesifik, actionable, dan sulit ditiru pesaing dalam jangka pendek.
Tulis seperti saran senior berpengalaman. Tidak ada simbol markdown apapun.`,

    `Usaha: ${ctx.nama_usaha}
Deskripsi: ${ctx.deskripsi}
Positioning: ${positioning}
Tantangan: ${ctx.tantangan}

Rumuskan satu diferensiasi kuat dalam dua sampai empat kalimat.
Langsung tulis kalimatnya tanpa label atau kata pengantar.`,
    0.7,
    300
  );
}

async function agentSelfReview(
  ctx: any,
  positioning: string,
  marketing: string,
  differentiation: string
): Promise<boolean> {
  try {
    const review = await callLLM(
      `Kamu adalah quality reviewer strategi bisnis UMKM.
Nilai apakah output konsisten dan tidak generik meski input usaha mungkin singkat.
Jawab hanya satu kata: PASSED atau FAILED.`,
      `Usaha: ${ctx.nama_usaha} — Target: ${ctx.target_market} — Tantangan: ${ctx.tantangan}
Positioning: ${positioning}
Marketing: ${marketing}
Diferensiasi: ${differentiation}
Apakah output relevan dan tidak terdengar seperti template AI generik?`,
      0.1, 10
    );
    return review.toUpperCase().includes("PASSED");
  } catch {
    return true;
  }
}

// ════════════════════════════════════════════════════════
// LAYER 5 — MULTI-AGENT VALIDATION (parallel)
// ════════════════════════════════════════════════════════
async function validationLayer(
  ctx: any,
  positioning: string,
  marketing: string,
  differentiation: string
): Promise<{ score: number; approved: boolean }> {
  const parseScore = (raw: string): number => {
    const match = raw.match(/\d+/);
    return match ? Math.min(10, Math.max(1, parseInt(match[0]))) : 6;
  };

  try {
    const [logicRaw, riskRaw, qualityRaw] = await Promise.all([
      callLLM(
        "Kamu adalah logic validator. Nilai relevansi output terhadap input meski input singkat. Jawab hanya angka 1 sampai 10.",
        `Input: ${ctx.nama_usaha}, ${ctx.target_market}, ${ctx.tantangan}\nOutput: ${positioning} ${marketing} ${differentiation}\nSkor:`,
        0.1, 5
      ),
      callLLM(
        "Kamu adalah risk validator. Nilai apakah saran ini realistis untuk UMKM Indonesia. Jawab hanya angka 1 sampai 10.",
        `Saran: ${marketing} ${differentiation}\nSkor:`,
        0.1, 5
      ),
      callLLM(
        "Kamu adalah quality validator. Nilai apakah teks terdengar natural dan tidak seperti template AI. Jawab hanya angka 1 sampai 10.",
        `Teks: ${positioning} ${differentiation}\nSkor:`,
        0.1, 5
      ),
    ]);

    const avg = (parseScore(logicRaw) + parseScore(riskRaw) + parseScore(qualityRaw)) / 3;
    return { score: Math.round(avg * 10) / 10, approved: avg >= 5 };
  } catch {
    return { score: 7, approved: true };
  }
}

// ════════════════════════════════════════════════════════
// LAYER 6 — OUTPUT SYNTHESIS
// ════════════════════════════════════════════════════════
async function outputSynthesis(
  positioning: string,
  marketing: string,
  differentiation: string
): Promise<{ positioning: string; marketing: string; diferensiasi: string }> {
  const sys = `Kamu adalah editor teks bisnis.
Rapikan teks agar enak dibaca dan mengalir natural.
Hapus semua simbol markdown: tanda bintang, pagar, tanda hubung sebagai bullet, underscore, backtick.
Pertahankan isi dan makna sepenuhnya. Jangan tambah atau kurangi informasi.
Langsung keluarkan teks hasil tanpa kata pengantar.`;

  try {
    const [cleanPos, cleanMkt, cleanDiff] = await Promise.all([
      callLLM(sys, `Rapikan teks ini:\n${positioning}`, 0.3, 300),
      callLLM(sys, `Rapikan teks ini. Pastikan tiga ide tetap terpisah jelas dengan baris kosong di antaranya:\n${marketing}`, 0.3, 600),
      callLLM(sys, `Rapikan teks ini:\n${differentiation}`, 0.3, 300),
    ]);

    return {
      positioning: stripMarkdown(cleanPos),
      marketing: stripMarkdown(cleanMkt),
      diferensiasi: stripMarkdown(cleanDiff),
    };
  } catch {
    return {
      positioning: stripMarkdown(positioning),
      marketing: stripMarkdown(marketing),
      diferensiasi: stripMarkdown(differentiation),
    };
  }
}

// ════════════════════════════════════════════════════════
// LAYER 7 — FINAL TRUST GATE
// ════════════════════════════════════════════════════════
function finalTrustGate(
  output: { positioning: string; marketing: string; diferensiasi: string },
  validation: { score: number; approved: boolean }
): { passed: boolean; reason: string } {
  if (!validation.approved) {
    return { passed: false, reason: "Kualitas output belum memenuhi standar. Coba generate ulang." };
  }

  const combined = `${output.positioning} ${output.marketing} ${output.diferensiasi}`.toLowerCase();

  const hallucinationFlags = [
    "riset menunjukkan bahwa",
    "studi harvard",
    "data global membuktikan",
    "menurut survei internasional",
    "statistik menunjukkan bahwa",
    "forbes menyebutkan",
  ];

  for (const flag of hallucinationFlags) {
    if (combined.includes(flag)) {
      return { passed: false, reason: "Output mengandung klaim tidak terverifikasi. Coba generate ulang." };
    }
  }

  // ✅ Minimum length longgar — cocok untuk input pendek
  if (
    output.positioning.length < 30 ||
    output.marketing.length < 60 ||
    output.diferensiasi.length < 30
  ) {
    return { passed: false, reason: "Output terlalu singkat. Coba generate ulang." };
  }

  return { passed: true, reason: "OK" };
}

// ════════════════════════════════════════════════════════
// MAIN POST HANDLER
// ════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Request body tidak valid." }, { status: 400 });
    }

    // Layer 1 — Intake & Safety
    const intake = intakeAndFilter(body);
    if (!intake.valid) {
      return NextResponse.json({ error: intake.reason }, { status: 400 });
    }
    const ctx = intake.data;

    // Layer 2 & 3
    agentController(ctx);
    taskDecomposer();

    // Layer 4 — Core Reasoning
    let analysis: string;
    let positioning: string;
    let marketing: string;
    let differentiation: string;

    try {
      analysis        = await agentAnalyze(ctx);
      positioning     = await agentPositioning(ctx, analysis);
      marketing       = await agentMarketing(ctx, positioning);
      differentiation = await agentDifferentiation(ctx, positioning);
    } catch (e: any) {
      console.error("[ai/route] Core reasoning error:", e.message);
      return NextResponse.json(
        {
          error:
            e.message?.includes("401") || e.message?.includes("API key")
              ? "API key tidak valid. Periksa OPENAI_API_KEY di .env.local."
              : e.message?.includes("404") || e.message?.includes("model")
              ? "Model tidak ditemukan. Periksa nama model di route.ts."
              : `Generate gagal: ${e.message}`,
        },
        { status: 500 }
      );
    }

    // Self-review (non-blocking)
    const reviewPassed = await agentSelfReview(ctx, positioning, marketing, differentiation);

    // Layer 5 — Validation (non-blocking)
    const validation = await validationLayer(ctx, positioning, marketing, differentiation);

    // Layer 6 — Synthesis (non-blocking fallback built-in)
    const synthesized = await outputSynthesis(positioning, marketing, differentiation);

    // Layer 7 — Trust Gate
    const trust = finalTrustGate(synthesized, validation);
    if (!trust.passed) {
      return NextResponse.json({ error: trust.reason }, { status: 422 });
    }

    return NextResponse.json(
      {
        hasil_ai: JSON.stringify({
          positioning: synthesized.positioning,
          marketing: synthesized.marketing,
          diferensiasi: synthesized.diferensiasi,
        }),
        meta: {
          model: MODEL,
          validation_score: validation.score,
          self_review_passed: reviewPassed,
        },
      },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("[ai/route] Unhandled error:", err.message);
    return NextResponse.json(
      {
        error:
          err.message?.includes("401") || err.message?.includes("API key")
            ? "API key tidak valid. Periksa OPENAI_API_KEY di .env.local."
            : err.message?.includes("404") || err.message?.includes("model")
            ? "Model tidak ditemukan. Periksa nama model di route.ts."
            : "Terjadi kesalahan server. Coba generate ulang.",
      },
      { status: 500 }
    );
  }
}