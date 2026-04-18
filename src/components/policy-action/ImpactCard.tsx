import type { ImpactData } from '../../services/policyToActionMock';

type ImpactCardProps = {
  impact: ImpactData;
};

export default function ImpactCard({ impact }: ImpactCardProps) {
  return (
    <section className="rounded-[28px] border border-[var(--theme-accent)]/30 bg-[linear-gradient(180deg,rgba(209,208,103,0.18),rgba(13,33,165,0.16))] p-5 shadow-[0_18px_42px_rgba(8,18,36,0.18)] backdrop-blur-[16px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
            Personalized Impact
          </p>
          <h3 className="mt-3 text-4xl font-semibold text-white md:text-5xl">
            {impact.monthlyChangeLabel}
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/82">{impact.netEffectLabel}</p>
        </div>
        <div className="rounded-2xl border border-white/18 bg-white/10 px-4 py-3 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">
            Likely Support
          </p>
          <p className="mt-2 text-lg font-semibold text-white">{impact.supportAmountLabel}</p>
          <p className="mt-1 text-xs text-white/66">{impact.eligibilityStatus}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {impact.drivers.map((driver) => (
          <div
            key={driver}
            className="rounded-2xl border border-white/14 bg-white/7 px-4 py-3 text-sm leading-6 text-white/78"
          >
            {driver}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/14 bg-white/7 px-4 py-3">
        <p className="text-sm text-white/72">{impact.confidenceLabel}</p>
        <div className="rounded-full border border-[var(--theme-accent)]/35 bg-[var(--theme-accent)]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--theme-accent)]">
          Household-aware estimate
        </div>
      </div>
    </section>
  );
}

