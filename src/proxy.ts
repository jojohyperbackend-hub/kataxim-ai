// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const guestName       = req.cookies.get("guest_name")?.value;
  const firebaseSession = req.cookies.get("firebase_session")?.value;

  const isLoggedIn = !!firebaseSession || !!guestName;

  // Proteksi /katalog — wajib login atau guest
  if (pathname.startsWith("/katalog")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Proteksi /login — kalau sudah login redirect ke /katalog
  if (pathname.startsWith("/login")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/katalog", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/katalog/:path*", "/login/:path*"],
};