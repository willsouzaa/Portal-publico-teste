import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const PLACE_ID = process.env.GOOGLE_PLACES_PLACE_ID;

    if (!API_KEY || !PLACE_ID) {
      return NextResponse.json({ error: 'Google Places API key or place id not configured' }, { status: 500 });
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', PLACE_ID);
    // request only the fields we need
    url.searchParams.set('fields', 'rating,user_ratings_total,reviews');
    url.searchParams.set('key', API_KEY);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('Google Places error:', res.status, text);
      return NextResponse.json({ error: 'Error fetching from Google Places' }, { status: 502 });
    }

    const j = await res.json();
    // Normalize and return a minimal shape
    const result = j.result ?? {};
    const rating = result.rating ?? null;
    const user_ratings_total = result.user_ratings_total ?? null;
    let reviews = (result.reviews ?? []).map((r: any) => ({
      author_name: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.time,
      relative_time_description: r.relative_time_description,
    }));

    // Optional filtering by exact star rating via ?stars=5
    try {
      const starsParam = request.nextUrl.searchParams.get('stars');
      if (starsParam) {
        const stars = Number(starsParam);
        if (!Number.isNaN(stars)) {
          reviews = reviews.filter((r: any) => Number(r.rating) === stars);
        }
      }
    } catch (err) {
      // ignore param parsing errors
    }

    return NextResponse.json({ success: true, rating, user_ratings_total, reviews }, { status: 200 });
  } catch (err) {
    console.error('Error in /api/google-reviews', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
