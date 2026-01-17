import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import Parser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const token = process.env.ADMIN_TOKEN;
const base = "http://localhost:3000";

if (!token) {
  console.error("Missing ADMIN_TOKEN");
  process.exit(1);
}

const parser = new Parser();

const FEEDS = [
  { source: "AP News", url: "https://apnews.com/rss" },
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  { source: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
  { source: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
  { source: "ESPN", url: "https://www.espn.com/espn/rss/news" },
  { source: "IGN", url: "https://feeds.ign.com/ign/all" }
];

function summary(item) {
  return item.contentSnippet || item.summary || item.content || "";
}

function published(item) {
  return item.isoDate || item.pubDate || null;
}

async function run() {
  const stories = [];

  for (const f of FEEDS) {
    try {
      const feed = await parser.parseURL(f.url);
      for (const item of feed.items.slice(0, 6)) {
        const link = item.link || item.guid;
        if (!link) continue;

        stories.push({
          source: f.source,
          title: item.title || "",
          url: link,
          published_at: published(item),
          summary: summary(item),
          raw: { feed: f.url }
        });
      }
    } catch (e) {
      console.warn("Feed failed:", f.source);
    }
  }

  const res = await fetch(`${base}/api/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, stories })
  });

  const json = await res.json();
  console.log("INGEST RESULT:", json);
}

run();
