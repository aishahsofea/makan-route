import { z } from 'zod'

// Place schemas
export const placeSchema = z.object({
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
})

export const placesSchema = z.array(placeSchema)

// Route schemas
export const pointsSchema = z.array(
  z.object({
    lat: z.number(),
    lon: z.number(),
  })
)

export const routeSchema = z.object({
  points: pointsSchema,
  summary: z.object({
    lengthInMeters: z.number(),
    travelTimeInSeconds: z.number(),
    trafficDelayInSeconds: z.number(),
    trafficLengthInMeters: z.number(),
    departureTime: z.string(),
    arrivalTime: z.string(),
  }),
})

// Makan spot schemas
const iconSchema = z.object({
  prefix: z.string().url(),
  suffix: z.string(),
})

const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  short_name: z.string(),
  plural_name: z.string(),
  icon: iconSchema,
})

const geocodeSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
})

const geocodesSchema = z.object({
  drop_off: geocodeSchema,
  main: geocodeSchema,
  roof: geocodeSchema,
})

const locationSchema = z.object({
  address: z.string().optional(),
  country: z.string(),
  cross_street: z.string(),
  formatted_address: z.string(),
  locality: z.string(),
  postcode: z.string(),
  region: z.string(),
})

const relatedPlaceParentSchema = z.object({
  fsq_id: z.string(),
  name: z.string(),
  categories: z.array(categorySchema),
})

export const placeAlongRouteSchema = z.object({
  fsq_id: z.string(),
  categories: z.array(categorySchema),
  chains: z.array(z.any()),
  closed_bucket: z.string(),
  distance: z.number(),
  geocodes: geocodesSchema,
  link: z.string(),
  location: locationSchema,
  name: z.string(),
  related_places: z.object({
    parent: relatedPlaceParentSchema.optional(),
  }),
  timezone: z.string(),
})

export const placesAlongRouteSchema = z.array(placeAlongRouteSchema)

// Inferred types
export type Place = z.infer<typeof placeSchema>
export type Route = z.infer<typeof routeSchema>
export type PlaceAlongRoute = z.infer<typeof placeAlongRouteSchema>

