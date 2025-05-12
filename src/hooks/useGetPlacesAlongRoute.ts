import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

const bodySchema = z.object({
  route: z.object({
    points: z.array(
      z.object({
        lat: z.number(),
        lon: z.number(),
      })
    ),
  }),
});

export const useGetPlacesAlongRoute = () => {
  const mutation = useMutation({
    mutationFn: async (body: z.infer<typeof bodySchema>) => {
      const route = await fetch("/api/makan-spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await route.json();
      return data;
    },
  });

  return mutation;
};
