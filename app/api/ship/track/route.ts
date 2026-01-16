import { NextResponse } from "next/server";

const FSHIP_API_BASE = "https://capi.fship.in/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const awb = searchParams.get("awb");

  if (!awb) {
    return NextResponse.json({ error: "AWB number is required" }, { status: 400 });
  }

  const signature = process.env.FSHIP_SECRET_KEY;

  if (!signature) {
    return NextResponse.json(
      { error: "Shipping provider configuration is missing" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${FSHIP_API_BASE}/trackinghistory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "signature": `bearer ${signature}`,
      },
      body: JSON.stringify({ waybill: awb }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: "Authentication failed with shipping provider. Please check API keys.",
          details: data 
        },
        { status: response.status }
      );
    }

    if (!data.status) {
      return NextResponse.json(
        { error: data.response || "No tracking found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "An error occurred while fetching tracking data" },
      { status: 500 }
    );
  }
}
