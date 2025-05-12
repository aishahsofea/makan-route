import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 3) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const url = `${
    process.env.TOMTOM_API_URL
  }/search/2/poiSearch/${encodeURIComponent(query)}.json?key=${
    process.env.TOMTOM_API_KEY
  }&language=en-US&lat=3.064195&lon=101.663610&limit=5`;

  const response = await fetch(url);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch a location" },
      { status: 502 }
    );
  }

  const rawData = await response.json();
  const processedData = rawData.results.map((result: any) => ({
    id: result.id,
    address: result.address,
    name: result.poi.name,
    position: result.position,
  }));
  return NextResponse.json(processedData);
}
