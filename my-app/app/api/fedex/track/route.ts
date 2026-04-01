// app/api/fedex/track/route.ts

import { NextRequest, NextResponse } from "next/server";

const FEDEX_BASE = "https://apis-sandbox.fedex.com"; // swap to https://apis.fedex.com for production

export async function POST(req: NextRequest) {
  const { trackingNumber } = await req.json();

  if (!trackingNumber) {
    return NextResponse.json({ error: "Missing trackingNumber" }, { status: 400 });
  }

  const apiKey    = process.env.FEDEX_API_KEY!;
  const secretKey = process.env.FEDEX_SECRET_KEY!;

  // ── Step 1: Get OAuth token ──────────────────────────────────────────────
  const tokenRes = await fetch(`${FEDEX_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "client_credentials",
      client_id:     apiKey,
      client_secret: secretKey,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error("FedEx auth failed:", text);
    return NextResponse.json({ error: "FedEx authentication failed" }, { status: 502 });
  }

  const { access_token } = await tokenRes.json();

  // ── Step 2: Track the package ────────────────────────────────────────────
  const trackRes = await fetch(`${FEDEX_BASE}/track/v1/trackingnumbers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
      "X-locale": "en_US",
    },
    body: JSON.stringify({
      includeDetailedScans: true,
      trackingInfo: [{ trackingNumberInfo: { trackingNumber } }],
    }),
  });

  if (!trackRes.ok) {
    const text = await trackRes.text();
    console.error("FedEx tracking failed:", text);
    return NextResponse.json({ error: "FedEx tracking request failed" }, { status: 502 });
  }

  const data   = await trackRes.json();
  const result = data?.output?.completeTrackResults?.[0]?.trackResults?.[0];

  if (!result) {
    return NextResponse.json({ error: "No tracking data found" }, { status: 404 });
  }

  // ── Step 3: Shape the response ───────────────────────────────────────────
  const events = (result.scanEvents ?? []).map((e: {
    date?: string;
    eventDescription?: string;
    scanLocation?: { city?: string; stateOrProvinceCode?: string; countryCode?: string };
  }) => ({
    timestamp:   e.date ?? "",
    description: e.eventDescription ?? "",
    location: [
      e.scanLocation?.city,
      e.scanLocation?.stateOrProvinceCode,
      e.scanLocation?.countryCode,
    ].filter(Boolean).join(", "),
  }));

  return NextResponse.json({
    trackingNumber,
    status:            result.latestStatusDetail?.code ?? "UNKNOWN",
    statusDetail:      result.latestStatusDetail?.description ?? "Unknown",
    estimatedDelivery: result.estimatedDeliveryTimeWindow?.window?.ends ?? null,
    origin:      result.originLocation?.locationContactAndAddress?.address?.city ?? "—",
    destination: result.destinationLocation?.locationContactAndAddress?.address?.city ?? "—",
    events,
  });
}