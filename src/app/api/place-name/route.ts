import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const url = `${process.env.TOMTOM_API_URL}/search/2/reverseGeocode/${lat},${lon}.json?key=${process.env.TOMTOM_API_KEY}`;

  const REDIS_PLACE_NAME_KEY = `placeName:${lat}:${lon}`;

  try {
    const cachedPlaceName = await redis.get(REDIS_PLACE_NAME_KEY);
    if (cachedPlaceName) {
      console.log("Cache hit for place name");
      return NextResponse.json(JSON.parse(cachedPlaceName), { status: 200 });
    }

    const res = await fetch(url);
    const data = await res.json();

    const address = data.addresses?.[0]?.address;
    if (!address) return "Unknown location";

    const placeName = address.freeformAddress;
    await redis.set(REDIS_PLACE_NAME_KEY, JSON.stringify({ placeName }));
    return NextResponse.json({ placeName });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
