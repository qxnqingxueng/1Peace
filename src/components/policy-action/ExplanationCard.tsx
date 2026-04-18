import type { ExplanationData } from '../../services/policyToActionMock';

type ExplanationCardProps = {
  explanation: ExplanationData;
};

export default function ExplanationCard({ explanation }: ExplanationCardProps) {
  return (
    <section className="rounded-[28px] border border-white/18 bg-white/10 p-5 shadow-[0_16px_38px_rgba(8,18,36,0.16)] backdrop-blur-[16px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
            Explanation
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{explanation.heading}</h3>
        </div>
        <div className="rounded-full border border-white/18 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72">
          Plain-language RAG
        </div>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/82">{explanation.summary}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {explanation.bullets.map((bullet) => (
          <div
            key={bullet}
            className="rounded-2xl border border-white/14 bg-white/6 px-4 py-3 text-sm leading-6 text-white/78"
          >
            {bullet}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/14 bg-[rgba(13,33,165,0.22)] px-4 py-3 text-sm text-white/76">
        <span className="font-semibold text-white">Clause hint:</span> {explanation.clauseHint}
      </div>
    </section>
  );
}

