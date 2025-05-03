"use client";

import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { Input } from "@heroui/input";
import { ChangeEvent, useEffect, useState, useTransition } from "react";

type SearchInputProps = {
  name: string;
  label: string;
  placeholder: string;
};

export const SearchInput = (props: SearchInputProps) => {
  const { name, label, placeholder } = props;
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedSearch(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      console.log("Simulating API call for:", debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <Input
      isRequired
      name={name}
      label={label}
      placeholder={placeholder}
      variant="bordered"
      type="text"
      size="md"
      onChange={handleChange}
    />
  );
};
