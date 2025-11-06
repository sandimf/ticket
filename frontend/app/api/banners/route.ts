import { NextRequest, NextResponse } from "next/server";
import { headers, cookies } from "next/headers";

const GO_URL = process.env.GO_BACKEND_URL || "http://localhost:5000/api";

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${GO_URL}/banner`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error GET /api/banners:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || cookieStore.get("token")?.value;

    const res = await fetch(`${GO_URL}/banner`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error POST /api/banners:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}