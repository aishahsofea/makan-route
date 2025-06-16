export const getBoundingBox = (
  coords: {
    lat: number;
    lon: number;
  }[]
) => {
  // Start by assuming the first point has the min and max values
  let minLon = coords[0].lon,
    maxLon = coords[0].lon;
  let minLat = coords[0].lat,
    maxLat = coords[0].lat;

  // Loop through each coordinate and update the min/max values
  for (const { lat, lon } of coords) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  const round3Decimal = (num: number) => Number(num.toFixed(3));

  const padding = 0.01; // ~1km

  // Return the bounding box as southwest and northeast corners
  return {
    sw: [round3Decimal(minLat - padding), round3Decimal(minLon - padding)], // Bottom-left of the box
    ne: [round3Decimal(maxLat + padding), round3Decimal(maxLon + padding)], // Top-right of the box
  };
};
