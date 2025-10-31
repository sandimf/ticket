import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const headersList = await headers();
    const cookie = headersList.get("cookie");

    const goHeaders = new Headers();
    if (cookie) {
      goHeaders.append("Cookie", cookie);
    }

    const response = await fetch(`${API_URL}/event/slug/${slug}`, {
      method: "GET",
      headers: goHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: "Failed to fetch event", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/events/[slug] proxy:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}