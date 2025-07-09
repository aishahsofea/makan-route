import { z } from "zod";
import { RestaurantSchema } from "../rag/schema";
import { RestaurantFetcher } from "./restaurantFetcher";
import { redis } from "@/lib/redis";

const KL_AREAS = [
  { name: "Bukit Bintang", lat: 3.1478, lng: 101.7072, radius: 2000 },
  { name: "KLCC", lat: 3.1579, lng: 101.7116, radius: 1500 },
  { name: "Bangsar", lat: 3.1291, lng: 101.6737, radius: 2000 },
  { name: "Damansara Heights", lat: 3.1557, lng: 101.6647, radius: 2000 },
  { name: "Mont Kiara", lat: 3.1569, lng: 101.6578, radius: 2000 },
  { name: "Petaling Jaya", lat: 3.0738, lng: 101.5183, radius: 3000 },
  { name: "Subang Jaya", lat: 3.0738, lng: 101.5183, radius: 3000 },
];

const ResultsSchema = z.array(RestaurantSchema);

export class TopRestaurantsCollector {
  private restaurantFetcher: RestaurantFetcher;

  constructor() {
    this.restaurantFetcher = new RestaurantFetcher();
  }

  private async getTopRestaurantsInArea(
    areaName: string
  ): Promise<z.infer<typeof ResultsSchema>> {
    const area = KL_AREAS.find((area) => area.name === areaName);

    if (!area) {
      console.error(`Area ${areaName} not found`);
      return [];
    }

    const REDIS_TOP_RESTAURANTS_KEY = `topRestaurants:${areaName}`;
    const cachedTopRestaurants = await redis.get(REDIS_TOP_RESTAURANTS_KEY);

    if (cachedTopRestaurants) {
      console.log("Cache hit for top restaurants in area");
      return JSON.parse(cachedTopRestaurants);
    }

    try {
      const topRestaurants =
        await this.restaurantFetcher.getTopRestaurantsInArea(
          areaName,
          area.lat,
          area.lng,
          area.radius
        );

      await redis.setex(
        REDIS_TOP_RESTAURANTS_KEY,
        24 * 60 * 60, // 24 hours
        JSON.stringify(topRestaurants)
      );

      return topRestaurants;
    } catch (error) {
      console.error(`Error fetching top restaurants in ${areaName}:`, error);
      return [];
    }
  }

  async getTopRestaurantsInKL() {
    const allRestaurants: z.infer<typeof ResultsSchema> = [];

    const areaPromises = KL_AREAS.map((area) =>
      this.getTopRestaurantsInArea(area.name)
    );
    const results = await Promise.all(areaPromises);

    results.forEach((restaurants) => {
      allRestaurants.push(...restaurants);
    });

    const uniqueRestaurants = allRestaurants
      .flat()
      .filter(
        (restaurant, index, self) =>
          index ===
          self.findIndex((r) => r.fsq_place_id === restaurant.fsq_place_id)
      );

    console.log(
      `Total unique top restaurants collected: ${uniqueRestaurants.length}`
    );
    return uniqueRestaurants;
  }
}
