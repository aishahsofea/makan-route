import React, { useEffect, useState } from "react";
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  useMap,
} from "@vis.gl/react-google-maps";

import { Polyline } from "@/components/Polyline";
import { RouteDataSchema, useGetRoute } from "@/hooks/useGetRoute";
import { useSearchParams } from "next/navigation";
import { z } from "zod";

const defaultAppearance = {
  walkingPolylineColor: "#000000",
  defaultPolylineColor: "#9a1e45",
  stepMarkerFillColor: "#333333",
  stepMarkerBorderColor: "#000000",
};

const Route = () => {
  const [route, setRoute] = useState<z.infer<typeof RouteDataSchema> | null>(
    null
  );

  console.log({ route });
  const map = useMap();

  const searchParams = useSearchParams();
  const originLatitude = Number(searchParams.get("starting-point-lat"));
  const originLongitude = Number(searchParams.get("starting-point-lon"));
  const destinationLatitude = Number(searchParams.get("destination-lat"));
  const destinationLongitude = Number(searchParams.get("destination-lon"));

  const origin = { lat: originLatitude, lng: originLongitude };
  const destination = {
    lat: destinationLatitude,
    lng: destinationLongitude,
  };

  const mutation = useGetRoute({
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  useEffect(() => {
    if (!map) return;

    const getRoute = async () => {
      const route = await mutation.mutateAsync();

      setRoute(route);

      const { high, low } = route.viewport;
      const bounds: google.maps.LatLngBoundsLiteral = {
        north: high.latitude,
        south: low.latitude,
        east: high.longitude,
        west: low.longitude,
      };

      map.fitBounds(bounds);
    };

    getRoute();
  }, []);

  if (!route) return null;

  // With only two waypoints, our route will have a single leg.
  // We now want to create a visualization for the steps in that leg.
  const routeSteps = route.legs[0].steps;

  const appearance = { ...defaultAppearance };

  // Every step of the route is visualized using a polyline (see ./polyline.tsx);
  // color and weight depend on the travel mode. For public transit lines
  // with established colors, the official color will be used.
  const polylines = routeSteps.map((_, index) => {
    return (
      <Polyline
        key={`${index}-polyline`}
        encodedPath={route.polyline.encodedPolyline}
        strokeWeight={6}
        strokeColor={appearance.defaultPolylineColor}
      />
    );
  });

  // At the beginning of every step, an AdvancedMarker with a small circle is placed.
  // The beginning of the first step is omitted for a different marker.
  const stepMarkerStyle = {
    backgroundColor: appearance.stepMarkerFillColor,
    borderColor: appearance.stepMarkerBorderColor,
    width: 8,
    height: 8,
    border: `1px solid`,
    borderRadius: "50%",
  };

  const stepMarkers = routeSteps.slice(1).map((step, index) => {
    const position = {
      lat: step.startLocation.latLng.latitude,
      lng: step.startLocation.latLng.longitude,
    };

    return (
      <AdvancedMarker
        key={`${index}-start`}
        anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
        position={position}
      >
        <div style={stepMarkerStyle} />
      </AdvancedMarker>
    );
  });

  return (
    <>
      <AdvancedMarker position={origin} />
      <AdvancedMarker position={destination} />

      {polylines}
      {stepMarkers}
    </>
  );
};

export default React.memo(Route);
