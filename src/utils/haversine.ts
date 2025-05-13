export const haversineDistance = (
  coord1: Coordinate,
  coord2: Coordinate
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters

  const lat1 = toRad(coord1.lat);
  const lon1 = toRad(coord1.lon);
  const lat2 = toRad(coord2.lat);
  const lon2 = toRad(coord2.lon);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in meters
};

export const filterRouteByDistance = (
  coords: Coordinate[],
  minDistance = 1000
) => {
  if (coords.length === 0) return [];

  const filtered = [coords[0]];
  let last = coords[0];

  for (const point of coords) {
    const dist = haversineDistance(last, point);
    if (dist >= minDistance) {
      filtered.push(point);
      last = point;
    }
  }

  return filtered;
};

export const roundToTwoDecimalPlaces = (num: number) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
