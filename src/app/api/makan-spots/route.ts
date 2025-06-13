import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const coordinates = body.coordinates;

  const getURL = (lat: number, lon: number) =>
    `${process.env.TOMTOM_API_URL}/search/2/nearbySearch/.json?lat=${lat}&lon=${lon}&radius=3000&categorySet=7315&view=Unified&relatedPois=off&key=${process.env.TOMTOM_API_KEY}`;

  let results: any[] = [];

  for (const coord of coordinates) {
    try {
      // Check data in cache
      const cachedNearbyPlaces = await redis.get(`${coord.lat}:${coord.lon}`);
      if (cachedNearbyPlaces) {
        console.log("Cache hit");
        const parsedData = JSON.parse(cachedNearbyPlaces);
        results = [...results, ...parsedData];
        continue;
      }

      const url = getURL(coord.lat, coord.lon);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const processedData = data.results
        .filter((place: any) => place.type === "POI")
        .map((place: any) => ({
          id: place.id,
          poi: place.poi,
          address: place.address,
          position: place.position,
        }));
      results = [...results, ...processedData];

      // Store the data in cache
      await redis.set(
        `${coord.lat}:${coord.lon}`,
        JSON.stringify(processedData)
      );
    } catch (error) {
      console.error(`Failed to fetch data: `, error);
      return NextResponse.json(
        { error: JSON.stringify(error) },
        { status: 500 }
      );
    }
  }

  // Deduplicate results based on place ID
  const uniqueResults = Array.from(
    new Map(results.map((item) => [item.id, item])).values()
  );

  return NextResponse.json(uniqueResults, { status: 200 });
}
