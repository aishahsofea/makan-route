import { useEffect, useState } from "react";

export const useDebouncedSearch = (query: string, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(query);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [query, delay]);

  return debouncedValue;
};
