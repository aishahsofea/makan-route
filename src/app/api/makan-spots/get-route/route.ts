import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locations = searchParams.get("locations") ?? "";

  try {
    const response = await fetch(
      `${
        process.env.TOMTOM_API_URL
      }/routing/1/calculateRoute/${encodeURIComponent(locations)}/json?key=${
        process.env.TOMTOM_API_KEY
      }`
    );

    const rawData = await response.json();
    const points = rawData.routes[0].legs[0].points;
    const processedData = { routes: { points } };

    return NextResponse.json(processedData, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
