import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GO_URL = process.env.GO_BACKEND_URL || "http://localhost:5000/api";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || cookieStore.get("token")?.value;

    const contentType = request.headers.get("content-type") || "";
    let body: BodyInit | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = formData;
    } else {
      const json = await request.json();
      body = JSON.stringify(json);
    }

    const { id } = await params;
    const res = await fetch(`${GO_URL}/banner/${id}`, {
      method: "PATCH",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(contentType.includes("application/json") ? { "Content-Type": "application/json" } : {}),
      },
      body,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error PATCH /api/banners/[id]:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || cookieStore.get("token")?.value;

    const { id } = await params;
    const res = await fetch(`${GO_URL}/banner/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error DELETE /api/banners/[id]:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}