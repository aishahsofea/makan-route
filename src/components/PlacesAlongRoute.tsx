import React, { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useGetPlacesAlongRoute } from "@/hooks/useGetPlacesAlongRoute";

const routeSchema = z.object({
  routes: z.object({
    points: z.array(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      })
    ),
  }),
});

const fetchRoute = async (locations: string) => {
  const res = await fetch(
    `/api/makan-spots/get-route?locations=${encodeURIComponent(locations)}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch route");
  }
  return routeSchema.parse(await res.json());
};

export const PlacesAlongRoute = () => {
  const searchParams = useSearchParams();
  const originLatitude = Number(searchParams.get("starting-point-lat"));
  const originLongitude = Number(searchParams.get("starting-point-lon"));
  const destinationLatitude = Number(searchParams.get("destination-lat"));
  const destinationLongitude = Number(searchParams.get("destination-lon"));

  const mutation = useGetPlacesAlongRoute();
  const [placesAlongRoute, setPlacesAlongRoute] = useState(null);

  const locations = `${originLatitude},${originLongitude}:${destinationLatitude},${destinationLongitude}`;

  const { data: routes } = useQuery({
    queryKey: ["route", locations],
    queryFn: () => fetchRoute(locations),
  });

  useEffect(() => {
    if (routes) {
      const getPlacesAlongRoute = async () => {
        const points = routes.routes.points.map(({ latitude, longitude }) => ({
          lat: latitude,
          lon: longitude,
        }));
        const body = { route: { points } };
        const placesAlongRoute = await mutation.mutateAsync(body);
        setPlacesAlongRoute(placesAlongRoute);
      };

      getPlacesAlongRoute();
    }
  }, [routes]);

  return <>{JSON.stringify(placesAlongRoute)}</>;
};
