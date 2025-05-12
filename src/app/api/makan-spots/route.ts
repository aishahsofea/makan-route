import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // TODO: use foursquare api to get the places along the route
  try {
    const response = await fetch(
      `${process.env.TOMTOM_API_URL}/search/2/searchAlongRoute/food.json?maxDetourTime=900&categorySet=7315&view=Unified&sortBy=detourOffset&relatedPois=off&key=${process.env.TOMTOM_API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }
    );

    const rawData = await response.json();

    return NextResponse.json(rawData, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
  }
}
