import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

const RESTAURANT_CATEGORY = "4d4b7105d754a06374d81259"; // Foursquare category ID for restaurants

export async function GET(req: NextRequest) {
  const ne = req.nextUrl.searchParams.get("ne") ?? "";
  const sw = req.nextUrl.searchParams.get("sw") ?? "";

  const REDIS_BOUNDING_BOX_KEY = `boundingBox:${ne}:${sw}`;

  const url = `${process.env.FOURSQUARE_API_URL}/places/search?categories=${RESTAURANT_CATEGORY}&ne=${ne}&sw=${sw}&limit=50`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: process.env.FOURSQUARE_API_KEY || "",
    },
  };

  try {
    const cachedNearbyPlaces = await redis.get(REDIS_BOUNDING_BOX_KEY);

    if (cachedNearbyPlaces) {
      console.log("Cache hit for nearby places");
      const parsedData = JSON.parse(cachedNearbyPlaces);
      return NextResponse.json(parsedData, { status: 200 });
    }

    const response = await fetch(url, options);
    console.log({ response });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { results } = await response.json();

    await redis.set(REDIS_BOUNDING_BOX_KEY, JSON.stringify(results));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
