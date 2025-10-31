import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers"; // Untuk meneruskan auth

// Ambil URL backend Go dari environment variable
const GO_URL = process.env.GO_BACKEND_URL;

if (!GO_URL) {
  throw new Error("GO_BACKEND_URL environment variable is not set");
}

/**
 * @route   GET /api/events
 * @desc    Mengambil semua event dari backend Go/Fiber
 */
export async function GET(request: Request) {
  try {
    // 1. Ambil header auth (jika ada) dari request client
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie");

    // 2. Siapkan header untuk dikirim ke Go
    const goHeaders = new Headers();
    // Set Authorization dari cookie access_token
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) {
      goHeaders.append("Authorization", `Bearer ${token}`);
    }
    // Teruskan cookie jika diperlukan oleh backend
    if (cookie) {
      goHeaders.append("Cookie", cookie);
    }

    // 3. Panggil backend Go/Fiber
    // Pastikan path-nya benar, e.g., /events atau /api/v1/events
    const res = await fetch(`${GO_URL}/event`, {
      method: "GET",
      headers: goHeaders,
      cache: "no-store", // Jangan cache di sisi Next.js
    });

    // 4. Tangani jika Go merespons dengan error
    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { message: "Failed to fetch from Go backend", details: errorData },
        { status: res.status }
      );
    }

    // 5. Kembalikan data dari Go ke client
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/events proxy:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * @route   POST /api/events
 * @desc    Meneruskan (forward) FormData ke backend Go/Fiber
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie");

    const goHeaders = new Headers();
    // Set Authorization dari cookie access_token
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) {
      goHeaders.append("Authorization", `Bearer ${token}`);
    }
    // Teruskan cookie jika diperlukan oleh backend
    if (cookie) {
      goHeaders.append("Cookie", cookie);
    }

    // 4. Panggil backend Go/Fiber
    // Pastikan path-nya benar, e.g., /events atau /api/v1/events
    const res = await fetch(`${GO_URL}/event`, {
      method: "POST",
      headers: goHeaders,
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { message: "Failed to create event in Go backend", details: errorData },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/events proxy:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}