import { redis } from "@/lib/redis";
import { getBoundingBox } from "@/utils/boundingBox";
import { tool } from "ai";
import { z } from "zod";

const getFoodsAlongTheRouteParameters = z.object({
  coords: z.array(
    z.object({
      lat: z.number(),
      lon: z.number(),
    })
  ),
});

const RESTAURANT_CATEGORY = "4d4b7105d754a06374d81259";

export const getFoodsAlongTheRoute = tool({
  description:
    "Given a driving route, find food options along the way. Return the results as structured data that can be displayed as cards.",
  parameters: getFoodsAlongTheRouteParameters,
  execute: async ({ coords }) => {
    const { sw, ne } = getBoundingBox(coords);
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
        return parsedData;
      }

      const response = await fetch(url, options);
      console.log({ response });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { results } = await response.json();

      await redis.set(REDIS_BOUNDING_BOX_KEY, JSON.stringify(results));

      return results;
    } catch (error) {
      throw new Error(`Failed to fetch foods along the route: ${error}`);
    }
  },
});
