import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server-session";
import { checkRateLimit } from "@/lib/ratelimit";

// ─── SSRF Protection: Block private/internal IP ranges ───────────────────────

/**
 * Blocks requests to RFC1918 private ranges, loopback, link-local, and
 * cloud metadata endpoints (AWS 169.254.169.254, GCP, etc.) to prevent
 * Server-Side Request Forgery (SSRF) attacks.
 */
const BLOCKED_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,     // link-local / AWS metadata
  /^::1$/,           // IPv6 loopback
  /^fd[0-9a-f]{2}:/i, // IPv6 ULA (unique local)
  /^0\./,            // 0.0.0.0/8
  /^[^.]+$/,         // bare hostnames with no dots (internal DNS)
];

function isBlockedHost(hostname: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(hostname));
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // 1. Authentication — only logged-in users can proxy external URLs
  const session = await getSession(request);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit — 30 scrapes per minute per IP
  const rl = await checkRateLimit(request, "scrape_og", { limit: 30, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
  }

  let formattedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  // 3. Parse and validate the URL
  let parsed: URL;
  try {
    parsed = new URL(formattedUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // 4. SSRF guard — block internal hosts
  if (isBlockedHost(parsed.hostname)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
  }

  // 5. Protocol guard — only http/https allowed
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http and https URLs are allowed" }, { status: 400 });
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
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    // Guard against redirect-based SSRF (e.g. external URL redirecting to metadata endpoint)
    const finalUrl = res.url ? new URL(res.url) : parsed;
    if (isBlockedHost(finalUrl.hostname)) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
    }

    if (!res.ok) {
      return NextResponse.json(getFallbackMetadata(formattedUrl));
    }

    // Read at most 1 MB of HTML to prevent memory attacks
    const rawText = await res.text();
    const html = rawText.slice(0, 1_000_000);
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
