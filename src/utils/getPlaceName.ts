const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

export const getPlaceName = async (lat: number, lon: number) => {
  const url = `/api/place-name?lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  const data = await res.json();

  return data.placeName || "Unknown location";
};
