"use client";

import { useSearchParams } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";
import { Suspense } from "react";
import { z } from "zod";
import { PlacesAlongRoute } from "@/components/PlacesAlongRoute";

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

const makanSpotSchema = z.object({
  id: z.string(),
  name: z.string(),
  cuisine: z.string(),
  tags: z.array(z.string()),
  distanceFromStart: z.number(),
  distanceToEnd: z.number(),
  rating: z.number().min(0).max(5),
  address: z.string(),
  imageUrl: z.string().url(),
  googleMapsUrl: z.string().url(),
});

const makanSpotsSchema = z.array(makanSpotSchema);

const fetchMakanSpots = async () => {
  const res = await fetch(`/api/makan-spots`);
  if (!res.ok) {
    throw new Error("Failed to fetch makan spots");
  }
  return makanSpotsSchema.parse(await res.json());
};

export const MakanSpotsContainer = () => {
  const searchParams = useSearchParams();
  const startingPoint = searchParams.get("starting-point");
  const destination = searchParams.get("destination");
  const originLatitude = Number(searchParams.get("starting-point-lat"));
  const originLongitude = Number(searchParams.get("starting-point-lon"));
  const destinationLatitude = Number(searchParams.get("destination-lat"));
  const destinationLongitude = Number(searchParams.get("destination-lon"));

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Makan Spots</h1>
        <p className="space-y-2 text-default-500 py-4">
          Showing all the makan spots between <b>{startingPoint}</b> and{" "}
          <b>{destination}</b>
        </p>
        {originLatitude &&
          originLongitude &&
          destinationLatitude &&
          destinationLongitude && (
            <p className="text-sm text-default-500 mt-2">
              Coordinates: Start ({originLatitude}, {originLongitude}) → End (
              {destinationLatitude}, {destinationLongitude})
            </p>
          )}

        <div className="flex items-center justify-start p-6 gap-4 my-8 text-gray-300 border-1 border-default-100 rounded-lg">
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w">
          <PlacesAlongRoute />
        </div>
      </div>
    </Suspense>
  );
};
