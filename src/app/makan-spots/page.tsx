"use client";

import { makanSpots } from "@/data/dummy-spots";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { Button } from "@/components/Button";
import { Select, SelectItem } from "@heroui/select";

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

export default function MakanSpots() {
  const spot = makanSpots[0];
  return (
    <>
      <h2 className="text-3xl">Makan spots</h2>

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
        {makanSpots.map((spot) => (
          <Card key={spot.id} className="p-2 shadow-lg rounded-lg">
            <CardHeader className="flex gap-3">
              <Image
                alt="heroui logo"
                height={80}
                radius="sm"
                src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                width={80}
              />
              <div className="flex flex-col">
                <p className="text-lg">{spot.name}</p>
                <p className="text-xs text-default-500">
                  {spot.distanceFromStart} km from Ampang, Kuala Lumpur
                </p>
                <p className="text-xs text-default-500">
                  {spot.distanceToEnd} km from Shah Alam, Selangor
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex justify-start gap-1 pb-2">
                {spot.tags.map((tag) => (
                  <Chip key={tag} size="sm" radius="sm">
                    {tag}
                  </Chip>
                ))}
              </div>
              <p className="text-sm text-default-500">
                Rating: {spot.rating} ⭐
              </p>
              <p className="text-sm text-default-500">
                Address: {spot.address}
              </p>
            </CardBody>
            <CardFooter>
              <Button text=" Open in Google Maps" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
