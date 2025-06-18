import { placesAlongRouteSchema } from "@/components/PlacesAlongRoute";
import { getBoundingBox } from "@/utils/boundingBox";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
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

const pageSize = 10; // Number of results per page

export const useGetPlacesAlongRoute = (
  boundingBox: ReturnType<typeof getBoundingBox>
) => {
  const northEast = boundingBox.ne.join(",");
  const southWest = boundingBox.sw.join(",");
  const query = useInfiniteQuery({
    queryKey: ["places-along-route", boundingBox],
    queryFn: async ({ pageParam }) => {
      const response = await fetch(
        `/api/makan-spots?ne=${encodeURIComponent(
          northEast
        )}&sw=${encodeURIComponent(southWest)}&cursor=${pageParam}`
      );

      const data = await response.json();
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const totalItems = lastPage.length;
      const nextCursor = pages.length * pageSize;
      return nextCursor < totalItems ? nextCursor : undefined;
    },
    select: (data) => {
      // paginate the large list into slices
      const flat = data.pages[0]; // all 50 items from API
      const paginated = [];
      for (let i = 0; i < flat.length; i += pageSize) {
        paginated.push(flat.slice(i, i + pageSize));
      }
      return { pages: paginated.slice(0, data.pageParams.length) } as {
        pages: z.infer<typeof placesAlongRouteSchema>[];
      };
    },
  });

  return query;
};
