import axios from "axios";
import { env } from "@/config/env";
import { Logger } from "@/utils/logger";

const logger = new Logger("Scraper");

export interface RawExaResult {
  url: string;
  title?: string;
  text?: string;
  summary?: string;
}

export interface ScrapedDoc {
  id: string;
  url: string;
  title: string;
  text: string;
  source: "exa" | "direct";
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n|\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[\t ]{2,}/g, " ")
    .trim();
}

function stripBoilerplate(text: string): string {
  const lines = text.split("\n");
  const filtered = lines.filter((line) => {
    const l = line.trim();
    if (!l) return false;
    // Filter common footer/header items
    if (/^\s*(cookies?|privacy|terms|subscribe|sign in|login)\b/i.test(l))
      return false;
    if (l.length < 3) return false;
    return true;
  });
  return filtered.join("\n");
}

function cleanText(text?: string): string {
  if (!text) return "";
  const cleaned = normalizeWhitespace(text);
  return stripBoilerplate(cleaned);
}

async function exaSearchAndContents(
  query: string,
  limit: number
): Promise<RawExaResult[]> {
  if (!env.EXA_API_KEY) {
    logger.warn("EXA_API_KEY not configured; skipping Exa scraping");
    return [];
  }

  try {
    const url = `${env.EXA_BASE_URL || "https://api.exa.ai"}/search_and_contents`;
    const response = await axios.post(
      url,
      {
        query,
        num_results: Math.min(Math.max(limit, 1), 25),
        include_domains: [
          "aven.com",
          "www.aven.com",
          "tryaven.com",
          "www.tryaven.com",
          "blog.aven.com",
        ],
        type: "neural",
        contents: {
          max_characters: 12000,
          include_html: false,
          summary: true,
        },
        use_autoprompt: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.EXA_API_KEY as string,
        },
        timeout: 20000,
      }
    );

    const results = (response.data?.results || []) as Array<{
      url?: string;
      title?: string;
      content?: { text?: string; summary?: string };
    }>;

    return results
      .filter((r) => r?.url)
      .map((r) => ({
        url: r.url as string,
        title: r.title,
        text: r.content?.text,
        summary: r.content?.summary,
      }));
  } catch (error) {
    logger.error("Exa search_and_contents failed", { error });
    return [];
  }
}

async function fetchDirect(url: string): Promise<string> {
  try {
    const res = await axios.get(url, { timeout: 15000 });
    // Naive HTML to text stripping
    const html: string = typeof res.data === "string" ? res.data : "";
    const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
    const withoutStyles = withoutScripts.replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    );
    const text = withoutStyles
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return cleanText(text);
  } catch (error) {
    logger.error("Direct fetch failed", { url, error });
    return "";
  }
}

function toScrapedDoc(
  item: RawExaResult,
  source: "exa" | "direct"
): ScrapedDoc | null {
  const text = cleanText(item.text || item.summary || "");
  if (!text || text.length < 200) return null;
  const title = item.title || item.url;
  return {
    id: `${source}:${item.url}`,
    url: item.url,
    title,
    text,
    source,
  };
}

function dedupeByUrl(docs: ScrapedDoc[]): ScrapedDoc[] {
  const seen = new Set<string>();
  const out: ScrapedDoc[] = [];
  for (const d of docs) {
    const key = d.url.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(d);
  }
  return out;
}

export async function scrapeAvenKnowledge(
  limit: number = 15
): Promise<ScrapedDoc[]> {
  // Compose targeted queries to improve precision
  const queries = [
    "site:aven.com Aven credit card balance transfer rewards fees",
    "site:aven.com support help contact privacy security",
    "site:aven.com app iOS Android features",
    "Aven fintech credit card overview",
  ];

  const maxPerQuery = Math.max(Math.floor(limit / queries.length), 3);
  const aggregated: ScrapedDoc[] = [];

  // Use Exa when available
  for (const q of queries) {
    const results = await exaSearchAndContents(q, maxPerQuery);
    for (const r of results) {
      const doc = toScrapedDoc(r, "exa");
      if (doc) aggregated.push(doc);
    }
  }

  // Fallback to a few known pages when EXA is missing or returned little
  if (aggregated.length < 5) {
    const candidateUrls = [
      "https://www.aven.com/",
      "https://www.aven.com/legal/privacy",
      "https://www.aven.com/legal/terms",
      "https://www.aven.com/help",
    ];

    for (const url of candidateUrls) {
      const text = await fetchDirect(url);
      if (text && text.length > 200) {
        aggregated.push({
          id: `direct:${url}`,
          url,
          title: url,
          text,
          source: "direct",
        });
      }
    }
  }

  const cleaned = dedupeByUrl(aggregated)
    .filter((d) => d.text.length >= 200)
    .slice(0, limit);

  logger.info(`Scraped ${cleaned.length} Aven documents`);
  return cleaned;
}
