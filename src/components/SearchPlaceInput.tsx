"use client";

import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

type SearchInputProps = {
  name: string;
  label: string;
};

const geometrySchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  viewport: z.object({
    northeast: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    southwest: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
});

const placeSchema = z.object({
  formatted_address: z.string(),
  geometry: geometrySchema,
  name: z.string(),
  place_id: z.string(),
  types: z.array(z.string()),
  photos: z
    .array(
      z.object({
        height: z.number(),
        width: z.number(),
        photo_reference: z.string(),
      })
    )
    .optional(),
});

const placesSchema = z.object({
  html_attributions: z.array(z.string()),
  results: z.array(placeSchema),
  status: z.string(),
});

const fetchLocations = async (query: string) => {
  const res = await fetch(`/api/location?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return placesSchema.parse(await res.json());
};

export const SearchPlaceInput = (props: SearchInputProps) => {
  const { name, label } = props;
  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<z.infer<
    typeof placeSchema
  > | null>(null);
  const debouncedQuery = useDebouncedSearch(query, 300);

  const { data: places } = useQuery({
    queryKey: ["location", debouncedQuery],
    queryFn: () => fetchLocations(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
  });

  const handleChange = (value: string) => {
    setQuery(value);
    return value;
  };

  const handleSelection = (key: string | number | null) => {
    if (!key) return;
    const place = places?.results?.find(
      (p) => p.place_id.toString() === key.toString()
    );
    if (place) {
      setSelectedPlace(place);
    }
  };

  return (
    <div>
      <Autocomplete
        isRequired
        name={name}
        variant="bordered"
        label={label}
        onInputChange={handleChange}
        onSelectionChange={handleSelection}
        items={places?.results || []}
        value={selectedPlace?.name || query}
      >
        {(place) => (
          <AutocompleteItem key={place.place_id}>{place.name}</AutocompleteItem>
        )}
      </Autocomplete>
      {selectedPlace && (
        <>
          <input
            type="hidden"
            name={`${name}-lat`}
            value={selectedPlace.geometry.location.lat}
          />
          <input
            type="hidden"
            name={`${name}-lon`}
            value={selectedPlace.geometry.location.lng}
          />
        </>
      )}
    </div>
  );
};
