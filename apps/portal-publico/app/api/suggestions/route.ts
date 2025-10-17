import { NextResponse } from "next/server";
import { getSeededSuggestions, suggestionsForCity } from "@/lib/suggestions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const city = url.searchParams.get("city");
  const state = url.searchParams.get("state");

  if (city) {
    const data = suggestionsForCity(city, state ?? undefined);
    return NextResponse.json({ data });
  }

  return NextResponse.json({ data: getSeededSuggestions() });
}
