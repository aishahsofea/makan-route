"use client";

import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

type SearchInputProps = {
  name: string;
  label: string;
};

const placeSchema = z.object({
  id: z.string(),
  address: z.object({
    country: z.string().optional(),
    countryCode: z.string().optional(),
    countryCodeISO3: z.string().optional(),
    countrySecondarySubdivision: z.string().optional(),
    countrySubdivision: z.string().optional(),
    countrySubdivisionCode: z.string().optional(),
    countrySubdivisionName: z.string().optional(),
    freeformAddress: z.string().optional(),
    localName: z.string().optional(),
    municipality: z.string().optional(),
    postalCode: z.string().optional(),
    streetName: z.string().optional(),
  }),
  name: z.string(),
  position: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
});

const placesSchema = z.array(placeSchema);

const fetchLocations = async (query: string) => {
  const res = await fetch(`/api/location?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("Failed to fetch places");
  }

  const parsedPlaces = placesSchema.parse(await res.json());
  if (parsedPlaces.length === 0) {
    throw new Error("No places found");
  }
  return parsedPlaces;
};

export const SearchPlaceInput = (props: SearchInputProps) => {
  const { name, label } = props;
  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<z.infer<
    typeof placeSchema
  > | null>(null);
  const debouncedQuery = useDebouncedSearch(query, 300);

  const placesQuery = useQuery({
    queryKey: ["location", debouncedQuery],
    queryFn: () => fetchLocations(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
  });

  const places = placesQuery.data;

  const handleChange = (value: string) => {
    setQuery(value);
    return value;
  };

  const handleSelection = (key: string | number | null) => {
    if (!key) return;
    const place = places?.find((p) => p.id === key.toString());
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
        items={places || []}
        value={selectedPlace?.name}
        className="rounded-none"
        style={{ color: "var(--foreground)" }}
      >
        {(place) => (
          <AutocompleteItem key={place.id}>{place.name}</AutocompleteItem>
        )}
      </Autocomplete>
      {selectedPlace && (
        <>
          <input
            type="hidden"
            name={`${name}-lat`}
            value={selectedPlace.position.lat}
          />
          <input
            type="hidden"
            name={`${name}-lon`}
            value={selectedPlace.position.lon}
          />
        </>
      )}
    </div>
  );
};
