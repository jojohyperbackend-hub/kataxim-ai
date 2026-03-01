# Kataxim AI

Kataxim AI adalah web app ringan berbasis AI yang membantu pelaku UMKM merumuskan strategi bisnis dengan cepat dan terarah. Pengguna cukup mengisi data usaha, klik generate, dan mendapatkan rekomendasi strategis yang langsung bisa dieksekusi tanpa perlu konsultan bisnis mahal.

---

## 🚀 Apa Itu Kataxim AI?

Kataxim AI dirancang untuk menjadi tools produktivitas modern bagi UMKM. Dengan pendekatan yang simpel dan cepat, aplikasi ini membantu merumuskan:

- Positioning unik usaha
- 3 ide strategi marketing dengan pendekatan berbeda
- 1 diferensiasi kuat yang ringkas dan actionable

Semua hasil dihasilkan oleh AI berdasarkan data usaha yang dimasukkan pengguna.

---

## ✨ 4 Fitur Utama

### 1️⃣ Form Usaha (CRUD)
Pengguna dapat:
- Membuat data usaha baru
- Melihat daftar usaha
- Mengedit data usaha
- Menghapus data usaha

Field input:
- Nama usaha
- Deskripsi singkat
- Target market
- Tantangan utama

Form dibuat simpel agar tidak memakan waktu lama.

---

### 2️⃣ AI Strategy Generator
Setelah data disimpan, pengguna dapat menekan tombol **"Generate Strategi"**.

AI akan menghasilkan:
- Positioning unik
- 3 strategi marketing (pendekatan berbeda)
- 1 diferensiasi kuat

Model LLM yang digunakan:

```
meta-llama/llama-3.2-3b-instruct
```

---

### 3️⃣ Dashboard Usaha
Dashboard menampilkan seluruh usaha dalam bentuk card.

Dari dashboard pengguna bisa:
- Akses detail usaha
- Edit atau hapus
- Melihat status apakah strategi sudah di-generate atau belum

---

### 4️⃣ Simpan & Bandingkan Hasil
- Hasil AI tersimpan otomatis di database
- Bisa dibuka kembali kapan saja
- Bisa re-generate untuk mendapatkan alternatif strategi
- Bisa membandingkan hasil berbeda untuk usaha yang sama

---

## 🎨 Color Palette

| Peran | Warna | Kode |
|-------|--------|-------|
| Background utama | Putih bersih | #FFFFFF |
| Surface / Card | Abu sangat terang | #F8FAFC |
| Brand & Navigasi | Biru navy | #1E3A5F |
| Aksen Growth | Emerald / Hijau toska | #10B981 |
| Tombol aksi utama | Orange lembut | #F97316 |
| Teks primer | Abu gelap | #1E293B |
| Teks sekunder | Abu medium | #64748B |

Konsep visual:
- Navy sebagai anchor kepercayaan
- Emerald untuk badge status & indikator AI
- Orange khusus tombol Generate (high-action emphasis)
- Clean, modern, profesional

---

## 🔄 User Flow

1. Buka aplikasi
2. Buat data usaha baru
3. Isi 4 field utama
4. Simpan
5. Klik Generate Strategi
6. Baca hasil AI
7. Simpan atau re-generate
8. Kelola semua usaha dari dashboard

---

## 🗂 ERD - Tabel `kataxim`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key, auto generate |
| user_id | VARCHAR | ID user dari Firebase Auth |
| nama_usaha | VARCHAR | Nama usaha UMKM |
| deskripsi | TEXT | Deskripsi singkat usaha |
| target_market | TEXT | Target pasar usaha |
| tantangan | TEXT | Tantangan utama usaha |
| hasil_ai | TEXT | Output JSON dari AI |
| created_at | TIMESTAMP | Waktu data dibuat |
| updated_at | TIMESTAMP | Waktu data terakhir diubah |

---

## 🛠 Cara Setup Database di Supabase

1. Buka Supabase Dashboard
2. Masuk ke SQL Editor
3. Klik "New Query"
4. Paste SQL berikut lalu Run

```sql
-- Buat tabel kataxim
CREATE TABLE kataxim (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  nama_usaha VARCHAR NOT NULL,
  deskripsi TEXT NOT NULL,
  target_market TEXT NOT NULL,
  tantangan TEXT NOT NULL,
  hasil_ai TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto update updated_at setiap kali row di-update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON kataxim
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Index biar query by user_id cepat
CREATE INDEX idx_kataxim_user_id ON kataxim(user_id);

-- Disable RLS karena pakai service role key
ALTER TABLE kataxim DISABLE ROW LEVEL SECURITY;
```

---

## 🔐 .env.local.example

Buat file `.env.local` dan isi dengan:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Supabase
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_URL=

# OpenAI / OpenRouter
OPENAI_API_KEY=
OPENAI_BASE_URL=
```

---

## 📦 Cara Clone Project

```bash
git clone https://github.com/jojohyperbackend-hub/kataxim-ai.git
cd kataxim-ai
npm install
npm run dev
```

---

## 👨‍💻 Kontributor

- izzivansatoru

---

## 📌 Ringkasan

Kataxim AI adalah tools AI-first untuk UMKM yang fokus pada kecepatan, kejelasan strategi, dan eksekusi nyata. Bukan sekadar generator ide, tetapi partner berpikir strategis berbasis AI.

