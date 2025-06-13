import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const locations = req.nextUrl.searchParams.get("locations") ?? "";

    const response = await fetch(
      `${
        process.env.TOMTOM_API_URL
      }/routing/1/calculateRoute/${encodeURIComponent(locations)}/json?key=${
        process.env.TOMTOM_API_KEY
      }`
    );

    const rawData = await response.json();
    const points = rawData.routes[0].legs[0].points;
    const processedPoints = points.map((point: any) => ({
      lat: point.latitude,
      lon: point.longitude,
    }));

    return NextResponse.json(
      { points: processedPoints, summary: rawData.routes[0].summary },
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
