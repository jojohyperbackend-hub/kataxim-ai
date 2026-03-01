// src/app/api/crud/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ── GET — ambil semua usaha by user_id ──────────────────
export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "user_id wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("kataxim")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 200 });
}

// ── POST — buat usaha baru ───────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, nama_usaha, deskripsi, target_market, tantangan } = body;

  if (!user_id || !nama_usaha || !deskripsi || !target_market || !tantangan) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("kataxim")
    .insert([{ user_id, nama_usaha, deskripsi, target_market, tantangan }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}

// ── PUT — update usaha by id ─────────────────────────────
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, nama_usaha, deskripsi, target_market, tantangan, hasil_ai } = body;

  if (!id) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("kataxim")
    .update({
      nama_usaha,
      deskripsi,
      target_market,
      tantangan,
      hasil_ai,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 200 });
}

// ── DELETE — hapus usaha by id ───────────────────────────
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }

  const { error } = await supabase
    .from("kataxim")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Usaha berhasil dihapus" }, { status: 200 });
}