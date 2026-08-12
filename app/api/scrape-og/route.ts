import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
  }

  let formattedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(getFallbackMetadata(formattedUrl));
    }

    const html = await res.text();
    const metadata = parseOgMetadata(html, formattedUrl);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("OpenGraph scrape error:", error);
    return NextResponse.json(getFallbackMetadata(formattedUrl));
  }
}

function parseOgMetadata(html: string, urlStr: string) {
  const urlObj = new URL(urlStr);
  const domain = urlObj.hostname.replace(/^www\./, "");

  const getMeta = (prop: string): string => {
    const regexes = [
      new RegExp(`<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']*)["']`, "i"),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${prop}["']`, "i"),
      new RegExp(`<meta[^>]*name=["']${prop}["'][^>]*content=["']([^"']*)["']`, "i"),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${prop}["']`, "i"),
    ];

    for (const r of regexes) {
      const match = html.match(r);
      if (match && match[1]) return decodeHtmlEntities(match[1].trim());
    }
    return "";
  };

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const docTitle = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : "";

  const title = getMeta("og:title") || getMeta("twitter:title") || docTitle || domain;
  const description =
    getMeta("og:description") || getMeta("description") || getMeta("twitter:description") || "";
  const image = getMeta("og:image") || getMeta("twitter:image") || "";
  const siteName = getMeta("og:site_name") || domain;
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return {
    url: urlStr,
    title,
    description,
    image,
    siteName,
    favicon,
    domain,
  };
}

function getFallbackMetadata(urlStr: string) {
  try {
    const urlObj = new URL(urlStr);
    const domain = urlObj.hostname.replace(/^www\./, "");
    return {
      url: urlStr,
      title: domain,
      description: `Link to ${domain}`,
      image: "",
      siteName: domain,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      domain,
    };
  } catch {
    return {
      url: urlStr,
      title: urlStr,
      description: "External link",
      image: "",
      siteName: "Web",
      favicon: "",
      domain: "web",
    };
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
