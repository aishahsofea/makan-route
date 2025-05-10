import { NextRequest, NextResponse } from "next/server";

const MAPS_API_KEY = process.env.MAPS_API_KEY ?? "";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": MAPS_API_KEY,
          "X-Goog-FieldMask":
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.viewport,routes.legs.steps.startLocation",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    return NextResponse.json(
      { ...data.routes[0] },
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
