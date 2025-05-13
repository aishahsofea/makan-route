"use client";

import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  filterRouteByDistance,
  haversineDistance,
  roundToTwoDecimalPlaces,
} from "@/utils/haversine";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Phone, Globe, MapPin, Star, Navigation } from "lucide-react";

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
  country: z.string(),
  countryCode: z.string(),
  countryCodeISO3: z.string(),
  countrySecondarySubdivision: z.string(),
  countrySubdivision: z.string(),
  countrySubdivisionCode: z.string(),
  countrySubdivisionName: z.string(),
  freeformAddress: z.string(),
  localName: z.string(),
  streetName: z.string(),
  streetNumber: z.string().optional(),
  municipality: z.string(),
  postalCode: z.string(),
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

export const fetchRoute = async (locations: string) => {
  const res = await fetch(
    `/api/makan-spots/get-route?locations=${encodeURIComponent(locations)}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch route");
  }
  return routeSchema.parse(await res.json());
};

const fetchPlacesAlongRoute = async (points: Coordinate[]) => {
  const res = await fetch(
    `/api/makan-spots?coordinates=${encodeURIComponent(JSON.stringify(points))}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch places along route");
  }

  // IDK exactly the response structure, hence not using zod to parse it
  return res.json();
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

  const { data: places } = useSuspenseQuery({
    queryKey: ["places-along-route", locations],
    queryFn: () => fetchPlacesAlongRoute(filteredPoints as Coordinate[]),
  });

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
      {places?.map((place: z.infer<typeof placeAlongRouteSchema>) => (
        <Card
          key={place.id}
          className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 transition-all duration-300 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 group"
        >
          <CardHeader className="flex justify-between gap-3">
            <h2 className="text-xl font-medium group-hover:text-teal-400 transition-colors">
              {place.poi.name}
            </h2>
            {place.poi.categories
              .filter((category) => category !== "restaurant")
              .map((category) => (
                <Chip
                  size="sm"
                  key={category}
                  className="bg-gray-800 hover:bg-gray-700 text-teal-300 border-0 font-semibold"
                >
                  {category}
                </Chip>
              ))}
          </CardHeader>
          <CardBody>
            {/* Distance Info */}
            <div className="space-y-1 mb-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-teal-400" />
                <span>
                  {distanceFromOrigin(place.position)} km from {origin}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-teal-400" />
                <span>
                  {distanceFromDestination(place.position)} km from{" "}
                  {destination}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 mb-4 text-sm text-gray-400">
              <MapPin size={14} className="text-teal-400 mt-1 flex-shrink-0" />
              <p>{place.address.freeformAddress}</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-5 text-sm">
              {place.poi.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-teal-400" />
                  <a
                    href={`tel:${place.poi.phone}`}
                    className="text-gray-400 hover:text-teal-300 transition-colors"
                  >
                    {place.poi.phone}
                  </a>
                </div>
              )}

              {place.poi.url && (
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-teal-400" />
                  <a
                    href={place.poi.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-teal-300 transition-colors truncate"
                  >
                    {place.poi.url.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </CardBody>
          <CardFooter>
            <Button
              className="w-full bg-teal-500 hover:bg-teal-600 text-white transition-all duration-300 hover:translate-y-[-2px]"
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
