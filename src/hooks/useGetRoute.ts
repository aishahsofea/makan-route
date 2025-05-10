import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const boundingBoxSchema = z.object({
  low: coordinateSchema,
  high: coordinateSchema,
});

const StepSchema = z.object({
  startLocation: z.object({ latLng: coordinateSchema }),
});

const LegsSchema = z.array(
  z.object({
    steps: z.array(StepSchema),
  })
);

export const RouteDataSchema = z.object({
  distanceMeters: z.number(),
  duration: z.string(), // e.g., "1874s"
  polyline: z.object({
    encodedPolyline: z.string(),
  }),
  viewport: boundingBoxSchema,
  legs: LegsSchema,
});

type GetRouteArgs = {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
};

export const useGetRoute = ({
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
}: GetRouteArgs) => {
  const routeOptions = {
    travelMode: "TRANSIT",
    computeAlternativeRoutes: false,
    units: "METRIC",
  };

  const body = {
    origin: {
      location: {
        latLng: {
          latitude: originLatitude,
          longitude: originLongitude,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: destinationLatitude,
          longitude: destinationLongitude,
        },
      },
    },
    ...routeOptions,
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const route = await fetch("/api/makan-spots/get-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await route.json();
      return RouteDataSchema.parse(data);
    },
  });

  return mutation;
};
