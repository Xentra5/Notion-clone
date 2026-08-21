export async function searchDuckDuckGo(query: string, maxResults = 5): Promise<{ title: string; url: string; snippet: string }[]> {
  try {
    const res = await fetch("https://lite.duckduckgo.com/lite/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: "q=" + encodeURIComponent(query),
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return [];
    const html = await res.text();

    const results: { title: string; url: string; snippet: string }[] = [];
    
    // Match each result link
    const linkRegex = /<a[^>]*href=['"]([^'"]+)['"][^>]*class=['"]result-link['"][^>]*>([\s\S]*?)<\/a>/gi;
    const snippetRegex = /<td[^>]*class=['"]result-snippet['"][^>]*>([\s\S]*?)<\/td>/gi;

    const links: { url: string; title: string }[] = [];
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null && links.length < maxResults) {
      let rawUrl = linkMatch[1];
      // If duckduckgo redirect link, unwrap uddg
      if (rawUrl.includes("uddg=")) {
        const urlMatch = /uddg=([^&]+)/.exec(rawUrl);
        if (urlMatch) rawUrl = decodeURIComponent(urlMatch[1]);
      }
      const title = linkMatch[2].replace(/<[^>]+>/g, "").trim();
      if (title && !rawUrl.startsWith("/lite/")) {
        links.push({ url: rawUrl, title });
      }
    }

    const snippets: string[] = [];
    let snipMatch;
    while ((snipMatch = snippetRegex.exec(html)) !== null && snippets.length < maxResults) {
      snippets.push(snipMatch[1].replace(/<[^>]+>/g, "").trim());
    }

    for (let i = 0; i < links.length; i++) {
      results.push({
        title: links[i].title,
        url: links[i].url,
        snippet: snippets[i] || "",
      });
    }

    return results;
  } catch (err) {
    console.error("[DuckDuckGo Search error]", err);
    return [];
  }
}
