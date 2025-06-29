import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

const RESTAURANT_CATEGORY = "4d4b7105d754a06374d81259"; // Foursquare category ID for restaurants
const FIELDS = [
  "fsq_place_id",
  "name",
  "categories",
  "location",
  "description",
  "attributes",
  "price",
  "rating",
  "popularity",
  "menu",
  "tastes",
].join(",");

export async function GET(req: NextRequest) {
  const ll = req.nextUrl.searchParams.get("ll") ?? "";
  const radius = req.nextUrl.searchParams.get("radius") ?? "1000";

  const REDIS_RESTAURANTS_IN_AREA_KEY = `restaurantsInArea:${ll}:${radius}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-Places-Api-Version": "2025-06-17",
      authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
    },
  };

  const url = `${
    process.env.FOURSQUARE_API_URL
  }/places/search?categories=${RESTAURANT_CATEGORY}&fields=${encodeURIComponent(
    FIELDS
  )}&ll=${ll}&limit=50`;

  try {
    const cachedRestaurantsInArea = await redis.get(
      REDIS_RESTAURANTS_IN_AREA_KEY
    );

    if (cachedRestaurantsInArea) {
      console.log("Cache hit for restaurants in area");
      const parsedData = JSON.parse(cachedRestaurantsInArea);
      return NextResponse.json(parsedData, { status: 200 });
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { results } = await response.json();
    const transformedResults = results.map((item: any) => {
      return {
        ...item,
        categories: item.categories.map((cat: any) => cat.short_name),
        location: item.location.formatted_address,
      };
    });
    await redis.set(REDIS_RESTAURANTS_IN_AREA_KEY, JSON.stringify(results));
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
