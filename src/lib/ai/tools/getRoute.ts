import { redis } from "@/lib/redis";
import { tool } from "ai";
import { z } from "zod";

const getRouteParameters = z.object({
  originLatitude: z.number(),
  originLongitude: z.number(),
  destinationLatitude: z.number(),
  destinationLongitude: z.number(),
});

export const getRoute = tool({
  description:
    "Given a starting location and a destination, find the route between them.",
  parameters: getRouteParameters,
  execute: async ({
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude,
  }) => {
    const locations = `${originLatitude},${originLongitude}:${destinationLatitude},${destinationLongitude}`;
    const REDIS_ROUTE_KEY = `route:${locations}`;

    const cachedRoute = await redis.get(REDIS_ROUTE_KEY);
    if (cachedRoute) {
      console.log("Cache hit for route");
      return JSON.parse(cachedRoute);
    }

    const response = await fetch(
      `${
        process.env.TOMTOM_API_URL
      }/routing/1/calculateRoute/${encodeURIComponent(locations)}/json?key=${
        process.env.TOMTOM_API_KEY
      }`
    );

    console.log(response);

    if (!response.ok) {
      throw new Error(`Failed to fetch route: ${response.statusText}`);
    }

    const rawData = await response.json();
    
    // TomTom API returns routes[0].legs[0].points structure
    const routeData = rawData.routes[0].legs[0].points.map((point: any) => ({
      lat: point.latitude,
      lon: point.longitude,
    }));

    console.log("Route data:", routeData);

    await redis.set(REDIS_ROUTE_KEY, JSON.stringify(routeData));
    return routeData;
  },
});
