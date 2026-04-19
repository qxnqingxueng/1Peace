import { useEffect, useMemo, useState } from 'react';
import { buildFallbackNewsResponse, fetchMalaysiaNews } from '../services/policyNewsService';

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;
const WEEK_CAP = 12;

const TABS = [
  { id: 'policy', label: 'Policy', emoji: '🏛' },
  { id: 'economic', label: 'Economy', emoji: '🛒' },
  { id: 'financial', label: 'Finance', emoji: '💹' },
];

function isToday(ts) {
  const d = new Date(ts);
  return !Number.isNaN(d.getTime()) && Date.now() - d.getTime() < DAY;
}

function isThisWeek(ts) {
  const d = new Date(ts);
  return !Number.isNaN(d.getTime()) && Date.now() - d.getTime() < WEEK;
}

function fmtTime(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return 'Recent';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function NewsCard({ article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#dce6ff] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-video w-full overflow-hidden bg-[#eef4ff]">
        <img
          src={article.imageUrl}
          alt={article.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-[#6d7d9e]">
          <span className="font-semibold text-[#09132a]">{article.source}</span>
          {' · '}
          {fmtTime(article.publishedAt)}
        </p>
        <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-[#09132a] group-hover:text-[#0d21a5]">
          {article.title}
        </h3>
      </div>
    </a>
  );
}

function SectionBlock({ title, articles, cap, expanded, onExpand, emptyMsg }) {
  const visible = cap && !expanded ? articles.slice(0, cap) : articles;
  const hasMore = cap && !expanded && articles.length > cap;

  return (
    <div>
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6c79a4]">
        {title} · {articles.length} {articles.length === 1 ? 'story' : 'stories'}
      </h2>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-[#eef4ff] bg-[#f8fbff] px-5 py-4 text-sm text-[#6d7d9e]">
          {emptyMsg}
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={onExpand}
              className="mt-5 rounded-full border border-[#d8e2fb] bg-white px-5 py-2 text-sm font-semibold text-[#0d21a5] transition hover:bg-[#eef4ff]"
            >
              Load more ({articles.length - cap} more stories)
            </button>
          )}
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {[0, 1].map((s) => (
        <div key={s}>
          <div className="mb-4 h-3 w-28 animate-pulse rounded-full bg-[#eef4ff]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-[#dce6ff]">
                <div className="aspect-video animate-pulse bg-[#eef4ff]" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#eef4ff]" />
                  <div className="h-4 animate-pulse rounded bg-[#eef4ff]" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-[#eef4ff]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PolicyNewsView({ lang: _lang = 'en', profile: _profile = null }) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('policy');
  const [weekExpanded, setWeekExpanded] = useState(false);
  const fallback = useMemo(() => buildFallbackNewsResponse(), []);

  const load = async (bust = false) => {
    bust ? setRefreshing(true) : setLoading(true);
    try {
      setNews(await fetchMalaysiaNews({ bust }));
    } catch {
      // fallback used on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(true); }, []);

  useEffect(() => { setWeekExpanded(false); }, [activeTab]);

  const resolved = news || fallback;
  const section = resolved.sections[activeTab];

  const withImages = useMemo(
    () => [section.featured, ...section.articles].filter((a) => a?.imageUrl),
    [section],
  );

  const todayArticles = useMemo(
    () => withImages.filter((a) => isToday(a.publishedAt)),
    [withImages],
  );

  const weekArticles = useMemo(
    () => withImages.filter((a) => isThisWeek(a.publishedAt) && !isToday(a.publishedAt)),
    [withImages],
  );

  const isLive = resolved.source === 'live';

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 md:px-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#09132a]">Malaysia News</h1>
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            isLive
              ? 'border-[#c8deff] bg-[#eef4ff] text-[#0d21a5]'
              : 'border-[#f1dd96] bg-[#fff8dc] text-[#7b5b0b]'
          }`}>
            {isLive ? '🟢 Live' : '⚠ Offline'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="rounded-full bg-[#0d21a5] px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-[#0b1b85] disabled:opacity-60"
        >
          {refreshing ? '↻ Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {/* Category tabs */}
      <div className="mb-7 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-[#0d21a5] text-white shadow-md'
                : 'border border-[#d8e2fb] bg-white text-[#405078] hover:border-[#0d21a5] hover:text-[#0d21a5]'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex flex-col gap-10">
          <SectionBlock
            title="Today"
            articles={todayArticles}
            emptyMsg="No stories with images today yet — check back soon."
          />
          <SectionBlock
            title="This Week"
            articles={weekArticles}
            cap={WEEK_CAP}
            expanded={weekExpanded}
            onExpand={() => setWeekExpanded(true)}
            emptyMsg="No stories with images this week yet."
          />
        </div>
      )}
    </section>
  );
}
