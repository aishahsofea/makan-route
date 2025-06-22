"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
} from "@heroui/react";
import { MapPin, ExternalLink, Navigation } from "lucide-react";

interface NearbyFoodsData {
  type: "nearby_foods";
  location: {
    latitude: number;
    longitude: number;
  };
  places: Array<{
    id: string;
    name: string;
    type: string;
    address: string;
    distance: number;
    link: string;
    categories: Array<{
      id: number;
      name: string;
      short_name: string;
      plural_name: string;
      icon: {
        prefix: string;
        suffix: string;
      };
    }>;
    geocodes: {
      main: {
        latitude: number;
        longitude: number;
      };
    };
  }>;
}

interface NearbyFoodsCardsProps {
  data: NearbyFoodsData;
  location: string;
}

export const NearbyFoodsCards = ({ data, location }: NearbyFoodsCardsProps) => {
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${distance} meters`;
    }
    return `${(distance / 1000).toFixed(1)} km`;
  };

  const openInMaps = (latitude: number, longitude: number) => {
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Found {data.places.length} places near {location}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.places.map((place) => (
          <Card
            key={place.id}
            className="rounded-none overflow-hidden border border-gray-800 transition-all duration-300 hover:shadow-lg group"
          >
            <CardHeader className="flex justify-between gap-3">
              <h3 className="text-lg font-medium transition-colors">
                {place.name}
              </h3>
              <div className="flex items-center gap-1">
                {place.categories.slice(0, 2).map((category) => (
                  <Chip
                    size="sm"
                    key={category.id}
                    style={{ color: "var(--secondary)" }}
                    className="bg-gray-800 hover:bg-gray-700 border-0 font-semibold rounded-sm"
                  >
                    {category.short_name}
                  </Chip>
                ))}
              </div>
            </CardHeader>

            <CardBody>
              {/* Distance Info */}
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                <Navigation style={{ color: "var(--secondary)" }} size={14} />
                <span>{formatDistance(place.distance)} away</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 mb-4 text-sm text-gray-700">
                <MapPin
                  style={{ color: "var(--secondary)" }}
                  size={14}
                  className="mt-1 flex-shrink-0"
                />
                <p className="line-clamp-2">{place.address}</p>
              </div>
            </CardBody>

            <CardFooter className="flex gap-2">
              <Button
                style={{
                  backgroundColor: "var(--secondary)",
                }}
                className="flex-1 transition-all duration-300 hover:translate-y-[-2px] rounded-none"
                onPress={() =>
                  openInMaps(
                    place.geocodes.main.latitude,
                    place.geocodes.main.longitude
                  )
                }
              >
                View in Maps
              </Button>

              {place.link && (
                <Button
                  variant="bordered"
                  className="transition-all duration-300 hover:translate-y-[-2px] rounded-none"
                  onPress={() => window.open(place.link, "_blank")}
                >
                  <ExternalLink size={16} />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
