import { redis } from "@/lib/redis";
import { tool } from "ai";
import { z } from "zod";

const getNearbyFoodsParameters = z.object({
  locationName: z
    .string()
    .describe("The name of the location to search for nearby food options."),
  latitude: z.number(),
  longitude: z.number(),
});

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    "X-Places-Api-Version": "2025-06-17",
    authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
  },
};

const RESTAURANT_CATEGORY = "4d4b7105d754a06374d81259"; // Foursquare category ID for restaurants

export const getNearbyFoods = tool({
  description:
    "Given a location, find nearby food options. Return the results as structured data that can be displayed as cards.",
  parameters: getNearbyFoodsParameters,
  execute: async ({ locationName, latitude, longitude }) => {
    const ll = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const REDIS_NEARBY_FOODS_KEY = `nearbyFoods:${ll}`;

    const cachedNearbyFoods = await redis.get(REDIS_NEARBY_FOODS_KEY);
    if (cachedNearbyFoods) {
      console.log("Cache hit for nearby foods");
      return JSON.parse(cachedNearbyFoods);
    }

    const response = await fetch(
      `${
        process.env.FOURSQUARE_API_URL
      }/places/search?fsq_category_ids=${RESTAURANT_CATEGORY}&ll=${encodeURIComponent(
        ll
      )}`,
      options
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch nearby foods: ${response.statusText}`);
    }

    const { results } = await response.json();

    // Transform the results to a more structured format for card display
    const structuredResults = {
      type: "nearby_foods",
      locationName,
      location: { latitude, longitude },
      places: results.map((place: any) => ({
        id: place.fsq_id,
        name: place.name,
        type: place.categories?.[0]?.name || "Restaurant",
        address: place.location?.formatted_address || "Address not available",
        distance: place.distance,
        link: place.link,
        categories: place.categories || [],
        geocodes: place.geocodes || {},
      })),
    };

    await redis.set(REDIS_NEARBY_FOODS_KEY, JSON.stringify(structuredResults));
    return structuredResults;
  },
});
