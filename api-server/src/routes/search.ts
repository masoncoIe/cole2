import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface DuckDuckGoResult {
  FirstURL: string;
  Text: string;
  Icon?: { URL: string };
  Result?: string;
  Topics?: DuckDuckGoResult[];
}

interface DuckDuckGoResponse {
  AbstractText: string;
  AbstractSource: string;
  AbstractURL: string;
  RelatedTopics: DuckDuckGoResult[];
  Results: DuckDuckGoResult[];
  Heading: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

router.get("/search", async (req, res) => {
  const q = req.query.q;

  if (!q || typeof q !== "string" || q.trim() === "") {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  try {
    const url = new URL("https://api.duckduckgo.com/");
    url.searchParams.set("q", q.trim());
    url.searchParams.set("format", "json");
    url.searchParams.set("no_html", "1");
    url.searchParams.set("skip_disambig", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "SearchProxy/1.0",
      },
    });

    if (!response.ok) {
      req.log.error({ status: response.status }, "DuckDuckGo API error");
      res.status(502).json({ error: "Failed to fetch search results" });
      return;
    }

    const data = (await response.json()) as DuckDuckGoResponse;

    const results = (data.Results || [])
      .filter((r) => r.FirstURL && r.Text)
      .map((r) => ({
        title: stripHtml(r.Text).split(" - ")[0] || stripHtml(r.Text),
        url: r.FirstURL,
        snippet: stripHtml(r.Text),
      }));

    const relatedTopics = (data.RelatedTopics || [])
      .filter((r): r is DuckDuckGoResult => !!(r.FirstURL && r.Text) && !r.Topics)
      .slice(0, 8)
      .map((r) => ({
        title: stripHtml(r.Text).split(" - ")[0] || stripHtml(r.Text),
        url: r.FirstURL,
        snippet: stripHtml(r.Text),
      }));

    res.json({
      query: q.trim(),
      results,
      abstract: data.AbstractText || "",
      abstractSource: data.AbstractSource || "",
      abstractUrl: data.AbstractURL || "",
      relatedTopics,
    });
  } catch (err) {
    req.log.error({ err }, "Search proxy error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
