import { redis } from "@/lib/redis";
import { RestaurantSchema } from "../rag/schema";
import { z } from "zod";

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

const ResultsSchema = z.array(RestaurantSchema);

export class RestaurantFetcher {
  private async fetchRestaurantsInArea(
    ll: string,
    radius: string
  ): Promise<z.infer<typeof ResultsSchema>> {
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
        return JSON.parse(cachedRestaurantsInArea);
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

      await redis.set(
        REDIS_RESTAURANTS_IN_AREA_KEY,
        JSON.stringify(transformedResults)
      );
      return ResultsSchema.parse(transformedResults);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      return [];
    }
  }

  async getTopRestaurantsInArea(
    areaName: string,
    lat: number,
    lng: number,
    radius: number
  ) {
    const coordinates = `${lat},${lng}`;

    try {
      const results = await this.fetchRestaurantsInArea(
        coordinates,
        radius.toString()
      );

      const topRestaurants = results.filter(
        (restaurant: any) =>
          restaurant.rating >= 6 && restaurant.popularity >= 0.6
      );

      console.log(
        `Found ${topRestaurants.length} top restaurants in ${areaName}`
      );
      return topRestaurants;
    } catch (error) {
      console.error(`Error fetching top restaurants in ${areaName}:`, error);
      return [];
    }
  }
}
