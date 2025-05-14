import { redis } from "@/lib/redis";
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

  try {
    // Check data in cache
    const cachedLocation = await redis.get(query);
    if (cachedLocation) {
      console.log("Cache hit");
      return NextResponse.json(JSON.parse(cachedLocation));
    }

    // Fetch data from the TomTom API
    const response = await fetch(url);
    const rawData = await response.json();
    const processedData = rawData.results.map((result: any) => ({
      id: result.id,
      address: result.address,
      name: result.poi.name,
      position: result.position,
    }));

    // Store the data in cache
    await redis.set(query, JSON.stringify(processedData));

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
