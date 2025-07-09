import { z } from "zod";

export const RestaurantSchema = z.object({
  fsq_place_id: z.string(),
  categories: z.array(z.string()),
  description: z.string().optional(),
  attributes: z.record(z.union([z.string(), z.boolean()])).optional(),
  location: z.string(),
  name: z.string(),
  popularity: z.number(),
  price: z.number().int().optional(),
  rating: z.number().optional(),
  tastes: z.array(z.string()).optional(),
});
