"use client";

import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  filterRouteByDistance,
  haversineDistance,
  roundToTwoDecimalPlaces,
} from "@/utils/haversine";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Phone, Globe, MapPin, Star, Navigation } from "lucide-react";
import { useGetPlacesAlongRoute } from "@/hooks/useGetPlacesAlongRoute";
import { useEffect } from "react";

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

const classificationSchema = z.object({
  code: z.string(),
  names: z.array(
    z.object({
      nameLocale: z.string(),
      name: z.string(),
    })
  ),
});

const poiSchema = z.object({
  categories: z.array(z.string()),
  categorySet: z.array(
    z.object({
      id: z.number(),
    })
  ),
  classifications: z.array(classificationSchema),
  name: z.string(),
  brands: z.array(z.object({ name: z.string(), logo: z.string().optional() })),
  phone: z.string().optional(),
  url: z.string().optional(),
});

const addressSchema = z.object({
  country: z.string().optional(),
  countryCode: z.string().optional(),
  countryCodeISO3: z.string().optional(),
  countrySecondarySubdivision: z.string().optional(),
  countrySubdivision: z.string().optional(),
  countrySubdivisionCode: z.string().optional(),
  countrySubdivisionName: z.string().optional(),
  freeformAddress: z.string().optional(),
  localName: z.string().optional(),
  streetName: z.string().optional(),
  streetNumber: z.string().optional(),
  municipality: z.string().optional(),
  postalCode: z.string().optional(),
});

const positionSchema = z.object({
  lat: z.number(),
  lon: z.number(),
});

const placeAlongRouteSchema = z.object({
  id: z.string(),
  address: addressSchema,
  poi: poiSchema,
  position: positionSchema,
});

const placesAlongRouteSchema = z.array(placeAlongRouteSchema);

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

export const PlacesAlongRoute = () => {
  const searchParams = useSearchParams();
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

  const mutation = useGetPlacesAlongRoute(filteredPoints);

  useEffect(() => {
    mutation.mutate();
  }, [JSON.stringify(filteredPoints)]);

  const places: z.infer<typeof placesAlongRouteSchema> = mutation.data;

  const distanceFromOrigin = (makanSpotPosition: Coordinate) =>
    roundToTwoDecimalPlaces(
      haversineDistance(originCoordinates, makanSpotPosition) / 1000
    );

  const distanceFromDestination = (makanSpotPosition: Coordinate) =>
    roundToTwoDecimalPlaces(
      haversineDistance(destinationCoordinates, makanSpotPosition) / 1000
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {places?.map((place) => (
        <Card
          key={place.id}
          className=" rounded-none overflow-hidden border border-gray-800 transition-all duration-300 hover:shadow-lg group"
        >
          <CardHeader className="flex justify-between gap-3">
            <h2 className="text-xl font-medium transition-colors">
              {place.poi.name}
            </h2>
            {place.poi.categories
              .filter((category) => category !== "restaurant")
              .map((category) => (
                <Chip
                  size="sm"
                  key={category}
                  style={{ color: "var(--secondary)" }}
                  className="bg-gray-800 hover:bg-gray-700 border-0 font-semibold rounded-sm"
                >
                  {category}
                </Chip>
              ))}
          </CardHeader>
          <CardBody>
            {/* Distance Info */}
            <div className="space-y-1 mb-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Navigation style={{ color: "var(--secondary)" }} size={14} />
                <span>
                  {distanceFromOrigin(place.position)} km from {origin}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation style={{ color: "var(--secondary)" }} size={14} />
                <span>
                  {distanceFromDestination(place.position)} km from{" "}
                  {destination}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 mb-4 text-sm text-gray-700">
              <MapPin
                style={{ color: "var(--secondary)" }}
                size={14}
                className="mt-1 flex-shrink-0"
              />
              <p>{place.address.freeformAddress}</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-5 text-sm">
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
            </div>
          </CardBody>
          <CardFooter>
            <Button
              style={{
                backgroundColor: "var(--secondary)",
              }}
              className="w-full transition-all duration-300 hover:translate-y-[-2px] rounded-none"
              onPress={() =>
                window.open(
                  `https://www.google.com/maps?q=${place.position.lat},${place.position.lon}`,
                  "_blank"
                )
              }
            >
              View in Google Maps
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
