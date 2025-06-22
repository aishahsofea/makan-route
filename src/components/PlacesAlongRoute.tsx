"use client";

import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  filterRouteByDistance,
  haversineDistance,
  roundToTwoDecimalPlaces,
} from "@/utils/haversine";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
} from "@heroui/react";
import { Phone, Globe, MapPin, Star, Navigation } from "lucide-react";
import { useGetPlacesAlongRoute } from "@/hooks/useGetPlacesAlongRoute";
import { useEffect } from "react";
import { getBoundingBox } from "@/utils/boundingBox";
import { useInView } from "react-intersection-observer";

const pointsSchema = z.array(
  z.object({
    lat: z.number(),
    lon: z.number(),
  })
);

const routeSchema = z.object({
  points: pointsSchema,
  summary: z.object({
    lengthInMeters: z.number(),
    travelTimeInSeconds: z.number(),
    trafficDelayInSeconds: z.number(),
    trafficLengthInMeters: z.number(),
    departureTime: z.string(),
    arrivalTime: z.string(),
  }),
});

const iconSchema = z.object({
  prefix: z.string().url(),
  suffix: z.string(),
});

const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  short_name: z.string(),
  plural_name: z.string(),
  icon: iconSchema,
});

const geocodeSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const geocodesSchema = z.object({
  drop_off: geocodeSchema,
  main: geocodeSchema,
  roof: geocodeSchema,
});

const locationSchema = z.object({
  address: z.string().optional(),
  country: z.string(),
  cross_street: z.string(),
  formatted_address: z.string(),
  locality: z.string(),
  postcode: z.string(),
  region: z.string(),
});

const relatedPlaceParentSchema = z.object({
  fsq_id: z.string(),
  name: z.string(),
  categories: z.array(categorySchema),
});

const placeAlongRouteSchema = z.object({
  fsq_id: z.string(),
  categories: z.array(categorySchema),
  chains: z.array(z.any()), // Adjust if chains have a known structure
  closed_bucket: z.string(),
  distance: z.number(),
  geocodes: geocodesSchema,
  link: z.string(),
  location: locationSchema,
  name: z.string(),
  related_places: z.object({
    parent: relatedPlaceParentSchema.optional(),
  }),

  timezone: z.string(),
});

export const placesAlongRouteSchema = z.array(placeAlongRouteSchema);

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const fetchRoute = async (locations: string) => {
  const res = await fetch(
    `${baseUrl}/api/makan-spots/get-route?locations=${encodeURIComponent(
      locations
    )}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch route");
  }
  return routeSchema.parse(await res.json());
};

type PlacesAlongRouteParams = {
  boundingBox: ReturnType<typeof getBoundingBox>;
};

export const PlacesAlongRoute = (params: PlacesAlongRouteParams) => {
  const searchParams = useSearchParams();
  const { ref, inView } = useInView();

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const originLatitude = Number(searchParams.get("origin-lat"));
  const originLongitude = Number(searchParams.get("origin-lon"));
  const destinationLatitude = Number(searchParams.get("destination-lat"));
  const destinationLongitude = Number(searchParams.get("destination-lon"));

  const originCoordinates: Coordinate = {
    lat: originLatitude,
    lon: originLongitude,
  };
  const destinationCoordinates: Coordinate = {
    lat: destinationLatitude,
    lon: destinationLongitude,
  };
  const locations = `${originLatitude},${originLongitude}:${destinationLatitude},${destinationLongitude}`;

  const { data: routeData } = useSuspenseQuery({
    queryKey: ["route", locations],
    queryFn: () => fetchRoute(locations),
  });

  const filteredPoints = routeData?.points
    ? filterRouteByDistance(routeData.points as Coordinate[], 1000)
    : [];

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useGetPlacesAlongRoute(params.boundingBox);

  console.log({ isFetchingNextPage, hasNextPage, hasPreviousPage });

  console.log({ status, data });

  const distanceFromOrigin = (makanSpotPosition: Coordinate) =>
    roundToTwoDecimalPlaces(
      haversineDistance(originCoordinates, makanSpotPosition) / 1000
    );

  const distanceFromDestination = (makanSpotPosition: Coordinate) =>
    roundToTwoDecimalPlaces(
      haversineDistance(destinationCoordinates, makanSpotPosition) / 1000
    );

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <div className="flex flex-col">
      {data?.pages.map((places, pageIndex) => (
        <div
          key={pageIndex}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2"
        >
          {places.map((place) => (
            <Card
              key={place.fsq_id}
              className=" rounded-none overflow-hidden border border-gray-800 transition-all duration-300 hover:shadow-lg group"
            >
              <CardHeader className="flex justify-between gap-3">
                <h2 className="text-xl font-medium transition-colors">
                  {place.name}
                </h2>
                <div className="flex items-center gap-1">
                  {place.categories.map((category) => (
                    <Chip
                      size="sm"
                      key={category.id}
                      style={{ color: "var(--secondary)" }}
                      className="bg-gray-800 hover:bg-gray-700 border-0 font-semibold rounded-sm"
                    >
                      {category.short_name}
                    </Chip>
                  ))}
                </div>
              </CardHeader>
              <CardBody>
                {/* Distance Info */}
                <div className="space-y-1 mb-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Navigation
                      style={{ color: "var(--secondary)" }}
                      size={14}
                    />
                    <span>
                      {distanceFromOrigin({
                        lat: place.geocodes.main.latitude,
                        lon: place.geocodes.main.longitude,
                      })}{" "}
                      km from {origin}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation
                      style={{ color: "var(--secondary)" }}
                      size={14}
                    />
                    <span>
                      {distanceFromDestination({
                        lat: place.geocodes.main.latitude,
                        lon: place.geocodes.main.longitude,
                      })}{" "}
                      km from {destination}
                    </span>
                  </div>
                </div>

                {/* Address */}
                {place.location.address ? (
                  <div className="flex items-start gap-2 mb-4 text-sm text-gray-700">
                    <MapPin
                      style={{ color: "var(--secondary)" }}
                      size={14}
                      className="mt-1 flex-shrink-0"
                    />
                    <p>{place.location.address}</p>
                  </div>
                ) : null}

                {/* Contact Info */}
                {/* <div className="space-y-2 mb-5 text-sm">
              {place.poi.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="" />
                  <a
                    href={`tel:${place.poi.phone}`}
                    className="text-gray-700 transition-colors"
                  >
                    {place.poi.phone}
                  </a>
                </div>
              )}

              {place.poi.url && (
                <div className="flex items-center gap-2">
                  <Globe size={14} style={{ color: "var(--secondary)" }} />
                  <a
                    href={place.poi.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 transition-colors truncate"
                  >
                    {place.poi.url.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div> */}
              </CardBody>
              <CardFooter>
                <Button
                  style={{
                    backgroundColor: "var(--secondary)",
                  }}
                  className="w-full transition-all duration-300 hover:translate-y-[-2px] rounded-none"
                  onPress={() =>
                    // window.open(
                    //   `https://www.google.com/maps?q=${place.position.lat},${place.position.lon}`,
                    //   "_blank"
                    // )
                    console.log(
                      "will open Google Maps with coordinates:",
                      place.geocodes.main.latitude,
                      place.geocodes.main.longitude
                    )
                  }
                >
                  View in Google Maps
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ))}

      {hasNextPage && (
        <button
          ref={ref}
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="my-4"
        >
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};
