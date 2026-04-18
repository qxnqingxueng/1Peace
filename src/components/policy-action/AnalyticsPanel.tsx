import { useEffect, useMemo, useState } from 'react';
import type { AnalyticsData } from '../../services/policyToActionMock';

type AnalyticsPanelProps = {
  analytics: AnalyticsData;
  defaultOpen?: boolean;
};

function chartY(height: number, maxValue: number, value: number) {
  return height - (value / Math.max(maxValue, 1)) * height;
}

function sampleLabels(values: Array<{ label: string; value: number }>) {
  const step = values.length <= 6 ? 1 : values.length <= 12 ? 2 : 5;
  return values.map((entry, index) => ({ entry, visible: index % step === 0 || index === values.length - 1 }));
}

function BarChart({
  values,
}: {
  values: AnalyticsData['impactSeries'];
}) {
  const width = 620;
  const height = 220;
  const leftPad = 20;
  const rightPad = 16;
  const topPad = 18;
  const bottomPad = 34;
  const innerWidth = width - leftPad - rightPad;
  const innerHeight = height - topPad - bottomPad;
  const maxValue = Math.max(...values.map((entry) => entry.value), 1);
  const barWidth = innerWidth / values.length - 4;
  const labels = sampleLabels(values);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {[0.25, 0.5, 0.75, 1].map((tick) => {
        const y = topPad + innerHeight - innerHeight * tick;
        return (
          <line
            key={tick}
            x1={leftPad}
            x2={width - rightPad}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="5 5"
          />
        );
      })}
      {labels.map(({ entry, visible }, index) => {
        const x = leftPad + index * (barWidth + 4);
        const barHeight = (entry.value / maxValue) * innerHeight;
        const y = topPad + innerHeight - barHeight;

        return (
          <g key={entry.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="7"
              fill={index === values.length - 1 ? '#D1D067' : index % 2 === 0 ? '#86C5FF' : '#2E5AA7'}
              opacity={0.92}
            />
            {visible ? (
              <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fill="rgba(255,255,255,0.72)" fontSize="11">
                {entry.label.replace('Day ', 'D').replace('Week ', 'W').replace('Month ', 'M').replace('Year ', 'Y')}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({
  series,
}: {
  series: AnalyticsData['cascadeSeries'];
}) {
  const width = 620;
  const height = 220;
  const leftPad = 20;
  const rightPad = 16;
  const topPad = 18;
  const bottomPad = 34;
  const innerWidth = width - leftPad - rightPad;
  const innerHeight = height - topPad - bottomPad;
  const maxValue = Math.max(...series.flatMap((entry) => entry.values), 1);
  const labels = sampleLabels(
    (series[0]?.values || []).map((value, index) => ({ label: `${index + 1}`, value })),
  );

  const paths = useMemo(
    () =>
      series.map((entry) => ({
        ...entry,
        path: entry.values
          .map((value, index) => {
            const x = leftPad + (innerWidth / Math.max(entry.values.length - 1, 1)) * index;
            const y = topPad + chartY(innerHeight, maxValue, value);
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
          })
          .join(' '),
      })),
    [innerHeight, innerWidth, leftPad, maxValue, series, topPad],
  );

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {[0.25, 0.5, 0.75, 1].map((tick) => {
          const y = topPad + innerHeight - innerHeight * tick;
          return (
            <line
              key={tick}
              x1={leftPad}
              x2={width - rightPad}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="5 5"
            />
          );
        })}

        {paths.map((entry) => (
          <path
            key={entry.key}
            d={entry.path}
            fill="none"
            stroke={entry.color}
            strokeWidth="3.1"
            strokeLinecap="round"
          />
        ))}

        {labels.map(({ visible }, index) => {
          if (!visible) {
            return null;
          }
          const x = leftPad + (innerWidth / Math.max(labels.length - 1, 1)) * index;
          return (
            <text key={`label-${index}`} x={x} y={height - 10} textAnchor="middle" fill="rgba(255,255,255,0.72)" fontSize="11">
              {index + 1}
            </text>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        {series.map((entry) => (
          <div
            key={entry.key}
            className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-1.5 text-xs text-white/78"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPanel({
  analytics,
  defaultOpen = false,
}: AnalyticsPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <section className="rounded-[28px] border border-white/18 bg-white/10 p-5 shadow-[0_16px_38px_rgba(8,18,36,0.16)] backdrop-blur-[16px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
            {analytics.title}
          </p>
          <p className="mt-2 text-sm leading-7 text-white/78">{analytics.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72 transition hover:bg-white/12"
        >
          {isOpen ? 'Hide Insights' : 'Show Insights'}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/14 bg-white/7 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/62">Highest affected sector</p>
          <p className="mt-2 text-lg font-semibold text-white">{analytics.highestAffectedSector}</p>
        </div>
        <div className="rounded-2xl border border-[var(--theme-accent)]/28 bg-[var(--theme-accent)]/12 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/62">Estimated cost increase</p>
          <p className="mt-2 text-lg font-semibold text-white">{analytics.estimatedCostIncrease}</p>
        </div>
        <div className="rounded-2xl border border-white/14 bg-white/7 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/62">Eligibility status</p>
          <p className="mt-2 text-lg font-semibold text-white">{analytics.eligibilityStatus}</p>
        </div>
      </div>

      {isOpen ? (
        <div className="mt-5 space-y-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-[24px] border border-white/14 bg-white/6 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--theme-accent)]">
                Affected Public Units
              </p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Number of public units under visible pressure over time.
              </p>
              <div className="mt-4">
                <BarChart values={analytics.impactSeries} />
              </div>
            </div>

            <div className="rounded-[24px] border border-white/14 bg-white/6 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--theme-accent)]">
                Cascading Sector Impact
              </p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Fuel, mobility, and public-service ripple across connected sectors.
              </p>
              <div className="mt-4">
                <LineChart series={analytics.cascadeSeries} />
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {analytics.summaryCards.map((card) => (
              <div
                key={card.key}
                className="rounded-2xl border border-white/14 bg-white/7 px-4 py-3"
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/62">{card.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
