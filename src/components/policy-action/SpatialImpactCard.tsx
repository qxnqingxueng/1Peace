import type { SpatialPreviewData } from '../../services/policyToActionMock';

type SpatialImpactCardProps = {
  spatial: SpatialPreviewData;
  onOpenInsights: () => void;
};

function MiniSpatialPreview({ spatial }: { spatial: SpatialPreviewData }) {
  return (
    <div className="relative h-40 overflow-hidden rounded-[24px] border border-white/14 bg-[linear-gradient(180deg,rgba(13,33,165,0.35),rgba(8,18,36,0.28))] p-4">
      <div className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_68%)]" />
      <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-3">
        {spatial.topUnits.map((unit, index) => (
          <div key={unit.id} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-[16px] border border-white/16 shadow-[0_10px_24px_rgba(8,18,36,0.18)]"
              style={{
                height: `${40 + unit.impact * 0.65}px`,
                background: `linear-gradient(180deg, ${unit.statusColor}, rgba(13,33,165,0.86))`,
                transform: `translateY(${index % 2 === 0 ? 0 : 8}px)`,
              }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/72">
              {unit.sectorLabel.replace('Public ', '')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SpatialImpactCard({
  spatial,
  onOpenInsights,
}: SpatialImpactCardProps) {
  return (
    <section className="rounded-[28px] border border-white/18 bg-white/10 p-5 shadow-[0_16px_38px_rgba(8,18,36,0.16)] backdrop-blur-[16px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
            Spatial Impact
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{spatial.areaLabel}</h3>
          <p className="mt-2 text-sm leading-7 text-white/78">
            {spatial.affectedServices} nearby public units are showing active pressure with a {spatial.riskLevel.toLowerCase()} risk band.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenInsights}
          className="rounded-full border border-[#86C5FF]/45 bg-[#86C5FF]/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#DFF1FF] transition hover:bg-[#86C5FF]/18"
        >
          Open insights
        </button>
      </div>

      <div className="mt-5">
        <MiniSpatialPreview spatial={spatial} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {spatial.topUnits.map((unit) => (
          <div
            key={unit.id}
            className="rounded-full border border-white/16 bg-white/7 px-3 py-1.5 text-xs text-white/76"
          >
            {unit.label} - {unit.impact}/100
          </div>
        ))}
      </div>
    </section>
  );
}

