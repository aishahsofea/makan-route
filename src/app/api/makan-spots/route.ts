import { NextResponse } from "next/server";
import { makanSpots } from "@/data/dummy-spots";

export async function GET() {
    return new NextResponse(JSON.stringify(makanSpots), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
  