import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    // Support both naming conventions from client
    const orderId = (formData.get("order_id") as string) || (formData.get("orderId") as string);
    const file = (formData.get("payment_proof") as File) || (formData.get("file") as File);
    const fullName = (formData.get("full_name") as string) || '';
    const phoneNumber = (formData.get("phone_number") as string) || '';

    if (!orderId || !file) {
      return NextResponse.json(
        { error: "Order ID dan file bukti pembayaran wajib diisi" },
        { status: 400 }
      );
    }

    // Prepare payload for Go backend
    const backendFormData = new FormData();
    backendFormData.append("payment_proof", file);
    if (fullName) backendFormData.append("full_name", fullName);
    if (phoneNumber) backendFormData.append("phone_number", phoneNumber);

    const GO_BACKEND_URL = process.env.GO_BACKEND_URL || "http://localhost:5000/api";

    const response = await fetch(
      `${GO_BACKEND_URL}/order/${orderId}/payment-proof`,
      {
        method: "POST",
        body: backendFormData,
      }
    );

    if (!response.ok) {
      let errorMessage = "Failed to upload payment proof";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {}
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
