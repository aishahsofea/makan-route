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
  id: z.string(),
  address: z.object({
    country: z.string(),
    countryCode: z.string(),
    countryCodeISO3: z.string(),
    countrySecondarySubdivision: z.string(),
    countrySubdivision: z.string(),
    countrySubdivisionCode: z.string(),
    countrySubdivisionName: z.string(),
    freeformAddress: z.string(),
    localName: z.string(),
    municipality: z.string(),
    postalCode: z.string(),
    streetName: z.string(),
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
