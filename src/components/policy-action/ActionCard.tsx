import type {
  ActionOption,
  ActionWorkflowId,
} from '../../services/policyToActionMock';

type ActionCardProps = {
  actions: ActionOption[];
  actionPrompt: string;
  onActionSelect: (actionId: ActionWorkflowId) => void;
};

export default function ActionCard({
  actions,
  actionPrompt,
  onActionSelect,
}: ActionCardProps) {
  return (
    <section className="rounded-[28px] border border-white/18 bg-white/10 p-5 shadow-[0_16px_38px_rgba(8,18,36,0.16)] backdrop-blur-[16px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
            Suggested Actions
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Move from insight to execution</h3>
        </div>
        <div className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/68">
          Gemini-style action layer
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-white/78">{actionPrompt}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onActionSelect(action.id)}
            className={`rounded-[22px] border px-4 py-4 text-left transition duration-300 hover:scale-[1.01] ${
              action.recommended
                ? 'border-[var(--theme-accent)]/35 bg-[var(--theme-accent)]/12 shadow-[0_14px_28px_rgba(209,208,103,0.18)]'
                : 'border-white/16 bg-white/7 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-white">{action.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/74">{action.description}</p>
              </div>
              {action.recommended ? (
                <span className="rounded-full border border-[var(--theme-accent)]/35 bg-[var(--theme-accent)]/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--theme-accent)]">
                  Recommended
                </span>
              ) : null}
            </div>
            <div className="mt-4 inline-flex rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72">
              {action.buttonLabel}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

