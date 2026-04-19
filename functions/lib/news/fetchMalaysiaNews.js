"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMalaysiaNews = fetchMalaysiaNews;
const TIMEZONE = 'Asia/Kuala_Lumpur';
const OG_FETCH_TIMEOUT_MS = 3000;
const OG_READ_LIMIT_BYTES = 25_000; // read only enough to find <head> og:image
const MAX_ARTICLES_PER_CATEGORY = 8;
// In-memory cache so repeated function invocations within the same instance skip refetching.
let fnCache = null;
const FN_CACHE_TTL_MS = 10 * 60 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const FEEDS = [
    { url: 'https://www.thestar.com.my/rss/News/Nation', source: 'The Star', category: 'policy' },
    { url: 'https://www.freemalaysiatoday.com/category/nation/feed/', source: 'FMT', category: 'policy' },
    { url: 'https://www.bernama.com/en/rss/politics.php', source: 'Bernama', category: 'policy' },
    { url: 'https://www.thestar.com.my/rss/Business', source: 'The Star', category: 'financial' },
    { url: 'https://www.nst.com.my/business/feed', source: 'NST', category: 'financial' },
    { url: 'https://www.bernama.com/en/rss/business.php', source: 'Bernama', category: 'financial' },
    { url: 'https://www.freemalaysiatoday.com/category/business/feed/', source: 'FMT', category: 'economic' },
    { url: 'https://www.bernama.com/en/rss/economics.php', source: 'Bernama', category: 'economic' },
    { url: 'https://www.malaymail.com/section/money/feed', source: 'Malay Mail', category: 'economic' },
];
const CATEGORY_KEYWORDS = {
    policy: ['policy', 'parliament', 'ministry', 'minister', 'cabinet', 'government', 'subsidy', 'bill', 'law', 'regulation'],
    economic: ['economy', 'inflation', 'gdp', 'jobs', 'employment', 'wage', 'cost of living', 'fuel', 'price', 'exports'],
    financial: ['ringgit', 'bank', 'bursa', 'klci', 'stock', 'bond', 'loan', 'profit', 'earnings', 'interest rate', 'market'],
};
// ── Helpers ──────────────────────────────────────────────────────────────────
function decodeEntities(s) {
    return s
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
}
function stripTags(s) {
    return decodeEntities(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function readTag(block, tag) {
    return block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1]?.trim() ?? '';
}
function readAttr(block, tag, attr) {
    return block.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i'))?.[1]?.trim() ?? '';
}
function extractRssImage(block, description, content) {
    const candidates = [
        readAttr(block, 'media:content', 'url'),
        readAttr(block, 'media:thumbnail', 'url'),
        readAttr(block, 'enclosure', 'url'),
        description.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? '',
        content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? '',
    ].filter((v) => /^https?:\/\//.test(v));
    return candidates[0] ? decodeEntities(candidates[0]) : null;
}
function classifyCategory(text, defaultCategory) {
    const hay = text.toLowerCase();
    let best = defaultCategory;
    let bestScore = 1;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const score = keywords.reduce((n, kw) => n + (hay.includes(kw) ? 1 : 0), 0);
        if (score > bestScore) {
            bestScore = score;
            best = cat;
        }
    }
    return best;
}
function makeId(title, url) {
    return `${title}-${url}`.toLowerCase().replace(/https?:\/\//g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
}
// ── OG image extraction ───────────────────────────────────────────────────────
async function fetchOgImage(url) {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), OG_FETCH_TIMEOUT_MS);
        const res = await fetch(url, {
            signal: controller.signal,
            headers: { 'user-agent': BROWSER_UA, accept: 'text/html' },
        });
        clearTimeout(timer);
        if (!res.ok || !res.body)
            return null;
        // Stream only the first OG_READ_LIMIT_BYTES bytes — og:image is always in <head>
        const reader = res.body.getReader();
        const chunks = [];
        let total = 0;
        while (total < OG_READ_LIMIT_BYTES) {
            const { done, value } = await reader.read();
            if (done || !value)
                break;
            chunks.push(value);
            total += value.byteLength;
        }
        reader.cancel().catch(() => undefined);
        const html = new TextDecoder().decode(chunks.reduce((a, b) => { const m = new Uint8Array(a.length + b.length); m.set(a); m.set(b, a.length); return m; }, new Uint8Array()));
        const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        const img = match?.[1];
        return img && /^https?:\/\//.test(img) ? img : null;
    }
    catch {
        return null;
    }
}
// ── RSS fetch ─────────────────────────────────────────────────────────────────
async function fetchFeed(feed) {
    const res = await fetch(feed.url, {
        headers: { 'user-agent': BROWSER_UA, accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });
    if (!res.ok)
        throw new Error(`Feed ${res.status}: ${feed.url}`);
    const xml = await res.text();
    const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
    return blocks.flatMap((block) => {
        const title = stripTags(readTag(block, 'title'));
        const url = decodeEntities(readTag(block, 'link'));
        const description = readTag(block, 'description');
        const content = readTag(block, 'content:encoded');
        const pubDate = readTag(block, 'pubDate');
        if (!title || !url || !pubDate)
            return [];
        const published = new Date(pubDate);
        if (Number.isNaN(published.getTime()))
            return [];
        return [{
                id: makeId(title, url),
                title,
                source: feed.source,
                url,
                imageUrl: extractRssImage(block, description, content),
                publishedAt: published.toISOString(),
                summary: stripTags(content || description).slice(0, 200),
                category: classifyCategory(`${title} ${stripTags(description)}`, feed.category),
            }];
    });
}
// ── Enrich articles without RSS images via OG extraction ─────────────────────
async function enrichImages(articles) {
    const needsImage = articles.filter((a) => !a.imageUrl && a.url !== '#');
    const ogImages = await Promise.all(needsImage.map((a) => fetchOgImage(a.url)));
    const ogMap = new Map(needsImage.map((a, i) => [a.id, ogImages[i]]));
    return articles.map((a) => ({ ...a, imageUrl: a.imageUrl ?? ogMap.get(a.id) ?? null }));
}
// ── Fallback ──────────────────────────────────────────────────────────────────
function buildFallbackSections(generatedAt) {
    const make = (category) => ({
        featured: {
            id: `fallback-${category}`, title: `Malaysia ${category} headlines unavailable`,
            source: '1Peace', url: '#', imageUrl: null, publishedAt: generatedAt,
            summary: 'Live headlines will appear here once the feed is restored.', category,
        },
        articles: [],
    });
    return { policy: make('policy'), economic: make('economic'), financial: make('financial') };
}
// ── Main export ───────────────────────────────────────────────────────────────
async function fetchMalaysiaNews() {
    if (fnCache && Date.now() - fnCache.ts < FN_CACHE_TTL_MS)
        return fnCache.data;
    const generatedAt = new Date().toISOString();
    const fallbackSections = buildFallbackSections(generatedAt);
    const settled = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f)));
    let articles = settled.flatMap((r) => r.status === 'fulfilled' ? r.value : []);
    if (!articles.length) {
        return { generatedAt, timezone: TIMEZONE, source: 'fallback', sections: fallbackSections };
    }
    // Deduplicate by URL
    const seen = new Set();
    articles = articles.filter((a) => { if (seen.has(a.url))
        return false; seen.add(a.url); return true; });
    // Enrich missing images via OG extraction (parallel, capped per category to control latency)
    const capped = Object.keys(fallbackSections).flatMap((cat) => articles.filter((a) => a.category === cat).slice(0, MAX_ARTICLES_PER_CATEGORY));
    const enriched = await enrichImages(capped);
    const withImages = enriched.filter((a) => a.imageUrl);
    if (!withImages.length) {
        return { generatedAt, timezone: TIMEZONE, source: 'fallback', sections: fallbackSections };
    }
    const sections = Object.keys(fallbackSections).reduce((acc, cat) => {
        const sorted = withImages
            .filter((a) => a.category === cat)
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        acc[cat] = { featured: sorted[0] ?? fallbackSections[cat].featured, articles: sorted.slice(1) };
        return acc;
    }, {});
    const result = { generatedAt, timezone: TIMEZONE, source: 'live', sections };
    fnCache = { data: result, ts: Date.now() };
    return result;
}
