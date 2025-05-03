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

const placeSchema = z.object({
  place_id: z.number(),
  osm_id: z.number(),
  lat: z.string(),
  lon: z.string(),
  class: z.union([
    z.literal("place"),
    z.literal("natural"),
    z.literal("railway"),
  ]),
  type: z.string(),
  name: z.string(),
  display_name: z.string(),
  boundingbox: z.tuple([z.string(), z.string(), z.string(), z.string()]),
});

const placesSchema = z.array(placeSchema);

const fetchLocations = async (query: string) => {
  const res = await fetch(`/api/location?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return placesSchema.parse(await res.json());
};

export const SearchInput = (props: SearchInputProps) => {
  const { name, label } = props;
  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<z.infer<typeof placeSchema> | null>(null);
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
    const place = places?.find((p) => p.place_id.toString() === key.toString());
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
      >
        {!places
          ? null
          : places.map(({ place_id, name }) => (
              <AutocompleteItem key={place_id}>{name}</AutocompleteItem>
            ))}
      </Autocomplete>
      {selectedPlace && (
        <>
          <input type="hidden" name={`${name}-lat`} value={selectedPlace.lat} />
          <input type="hidden" name={`${name}-lon`} value={selectedPlace.lon} />
        </>
      )}
    </div>
  );
};
