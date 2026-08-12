import { NextRequest, NextResponse } from "next/server";

const PRESET_COVERS = [
  {
    id: "preset-1",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    alt: "Abstract Fluid Gradient",
  },
  {
    id: "preset-2",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1600&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400&auto=format&fit=crop",
    alt: "Color Wave Gradient",
  },
  {
    id: "preset-3",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
    alt: "Ocean Horizon",
  },
  {
    id: "preset-4",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop",
    alt: "Starry Mountain Night",
  },
  {
    id: "preset-5",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop",
    alt: "Mist Peaks",
  },
  {
    id: "preset-6",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop",
    alt: "Neon Cyber Mesh",
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!query || !accessKey) {
    return NextResponse.json({ results: PRESET_COVERS, source: "presets" });
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=12&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ results: PRESET_COVERS, source: "presets" });
    }

    const data = await res.json();
    const results = (data.results || []).map((item: { id: string; urls: { regular: string; small: string }; alt_description?: string }) => ({
      id: item.id,
      url: item.urls.regular,
      thumb: item.urls.small,
      alt: item.alt_description || "Unsplash Banner",
    }));

    return NextResponse.json({ results, source: "unsplash" });
  } catch (err) {
    console.error("Unsplash fetch error:", err);
    return NextResponse.json({ results: PRESET_COVERS, source: "presets" });
  }
}
