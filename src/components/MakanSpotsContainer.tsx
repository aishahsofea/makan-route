"use client";

import { useSearchParams } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";
import { Suspense } from "react";
import { fetchRoute, PlacesAlongRoute } from "@/components/PlacesAlongRoute";
import { roundToTwoDecimalPlaces } from "@/utils/haversine";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Spinner } from "@heroui/spinner";

export const cuisines = [
  { key: "cat", label: "Cat" },
  { key: "dog", label: "Dog" },
  { key: "elephant", label: "Elephant" },
  { key: "lion", label: "Lion" },
  { key: "tiger", label: "Tiger" },
  { key: "giraffe", label: "Giraffe" },
  { key: "dolphin", label: "Dolphin" },
  { key: "penguin", label: "Penguin" },
  { key: "zebra", label: "Zebra" },
  { key: "shark", label: "Shark" },
  { key: "whale", label: "Whale" },
  { key: "otter", label: "Otter" },
  { key: "crocodile", label: "Crocodile" },
];

const ratings = [
  { key: "1", label: "⭐️" },
  { key: "2", label: "⭐️⭐️" },
  { key: "3", label: "⭐️⭐️⭐️" },
  { key: "4", label: "⭐️⭐️⭐️⭐️" },
  { key: "5", label: "⭐️⭐️⭐️⭐️⭐️" },
];

export const MakanSpotsContainer = () => {
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const originLatitude = Number(searchParams.get("origin-lat"));
  const originLongitude = Number(searchParams.get("origin-lon"));
  const destinationLatitude = Number(searchParams.get("destination-lat"));
  const destinationLongitude = Number(searchParams.get("destination-lon"));

  const locations = `${originLatitude},${originLongitude}:${destinationLatitude},${destinationLongitude}`;

  const { data: routeData } = useSuspenseQuery({
    queryKey: ["route", locations],
    queryFn: () => fetchRoute(locations),
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="p-4 flex flex-col min-h-screen">
        <div className="flex-none">
          <h1 className="text-2xl font-medium mb-2">
            Showing all the makan spots between{" "}
            <span
              style={{ backgroundColor: "var(--secondary)" }}
              className="font-semibold px-1"
            >
              {origin}
            </span>{" "}
            and{" "}
            <span
              style={{ backgroundColor: "var(--secondary)" }}
              className="font-semibold px-1"
            >
              {destination}
            </span>
          </h1>
          {originLatitude &&
            originLongitude &&
            destinationLatitude &&
            destinationLongitude && (
              <p className="text-gray-600 text-sm mb-6">
                The distance from {origin} to {destination} is approximately{" "}
                {roundToTwoDecimalPlaces(
                  (routeData?.summary.lengthInMeters ?? 0) / 1000
                )}{" "}
                km.
              </p>
            )}
          {/* Filter section */}
          {/* <div className="flex items-center justify-start p-6 gap-4 my-8 text-gray-300 border-1 border-default-100 rounded-none">
            <h4>Filter:</h4>
            <Select
              className="max-w-40"
              items={cuisines}
              label="Cusine Type"
              placeholder="Select a cuisine"
            >
              {(cuisine) => <SelectItem>{cuisine.label}</SelectItem>}
            </Select>
            <Select
              className="max-w-40"
              items={ratings}
              label="Rating"
              placeholder="Select a rating"
            >
              {(rating) => <SelectItem>{rating.label}</SelectItem>}
            </Select>
          </div> */}
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <Suspense
            fallback={
              <Spinner
                classNames={{ label: "text-foreground mt-4" }}
                label="Getting all the places..."
                variant="spinner"
              />
            }
          >
            <PlacesAlongRoute />
          </Suspense>
        </div>
      </div>
    </Suspense>
  );
};
