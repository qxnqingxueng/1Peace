import { useEffect, useState } from 'react';
import type { ExecutionWorkflow } from '../../services/policyToActionMock';

type ExecutionPanelProps = {
  workflow: ExecutionWorkflow | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function ExecutionPanel({
  workflow,
  isOpen,
  onClose,
}: ExecutionPanelProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    if (!workflow || !isOpen) {
      setCurrentStepIndex(0);
      setCheckedItems([]);
      return;
    }

    setCurrentStepIndex(0);
    setCheckedItems([]);
  }, [isOpen, workflow]);

  if (!workflow || !isOpen) {
    return null;
  }

  const completedSteps = currentStepIndex;
  const progress = Math.round(((completedSteps + 1) / workflow.steps.length) * 100);

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close execution panel"
        onClick={onClose}
        className="absolute inset-0 bg-[#030916]/46 backdrop-blur-sm"
      />

      <aside className="absolute inset-x-0 bottom-0 max-h-[88vh] rounded-t-[30px] border border-white/18 bg-[linear-gradient(180deg,rgba(13,33,165,0.96),rgba(8,18,36,0.94))] p-5 text-white shadow-[0_-22px_60px_rgba(2,9,19,0.42)] backdrop-blur-xl md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-[440px] md:rounded-none md:border-l md:border-t-0">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
                Guided Execution
              </p>
              <h3 className="mt-3 text-2xl font-semibold">{workflow.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/74">{workflow.intro}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/16 bg-white/8 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/74 transition hover:bg-white/12"
            >
              Close
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-white/14 bg-white/8 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/62">{workflow.progressLabel}</p>
                <p className="mt-2 text-lg font-semibold">{progress}% ready</p>
              </div>
              <div className="rounded-full border border-[var(--theme-accent)]/35 bg-[var(--theme-accent)]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--theme-accent)]">
                Step {Math.min(currentStepIndex + 1, workflow.steps.length)} of {workflow.steps.length}
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--theme-accent)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
            <section className="rounded-2xl border border-white/14 bg-white/8 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--theme-accent)]">
                Step Tracker
              </p>
              <div className="mt-4 space-y-3">
                {workflow.steps.map((step, index) => {
                  const status =
                    index < currentStepIndex ? 'done' : index === currentStepIndex ? 'active' : 'pending';

                  return (
                    <div
                      key={step.id}
                      className={`rounded-2xl border px-4 py-3 ${
                        status === 'done'
                          ? 'border-[#D1D067]/35 bg-[#D1D067]/12'
                          : status === 'active'
                            ? 'border-[#86C5FF]/35 bg-[#86C5FF]/12'
                            : 'border-white/12 bg-white/6'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                            status === 'done'
                              ? 'bg-[#D1D067] text-[#0B132B]'
                              : status === 'active'
                                ? 'bg-[#86C5FF] text-[#0B132B]'
                                : 'bg-white/12 text-white/72'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{step.title}</p>
                          <p className="mt-1 text-sm leading-6 text-white/72">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-white/14 bg-white/8 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--theme-accent)]">
                Prefilled Profile
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {workflow.prefilledFields.map((field) => (
                  <div key={field.label} className="rounded-xl border border-white/10 bg-white/6 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/58">{field.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{field.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/14 bg-white/8 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--theme-accent)]">
                Checklist
              </p>
              <div className="mt-4 space-y-2">
                {workflow.checklist.map((item) => {
                  const checked = checkedItems.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setCheckedItems((current) =>
                          checked ? current.filter((entry) => entry !== item) : [...current, item],
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                        checked
                          ? 'border-[#D1D067]/35 bg-[#D1D067]/12'
                          : 'border-white/10 bg-white/6 hover:bg-white/10'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                          checked ? 'bg-[#D1D067] text-[#0B132B]' : 'bg-white/12 text-white/72'
                        }`}
                      >
                        {checked ? 'Y' : ''}
                      </span>
                      <span className="text-sm text-white/78">{item}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-white/14 bg-white/8 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--theme-accent)]">
                Next Confirmations
              </p>
              <div className="mt-4 space-y-2">
                {workflow.confirmations.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/6 px-3 py-3 text-sm leading-6 text-white/74"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-white/12 pt-4">
            <button
              type="button"
              onClick={() =>
                setCurrentStepIndex((current) => Math.min(current + 1, workflow.steps.length - 1))
              }
              className="rounded-full bg-[var(--theme-accent)] px-5 py-3 text-sm font-semibold text-[#0B132B] transition hover:brightness-105"
            >
              {currentStepIndex === workflow.steps.length - 1 ? workflow.primaryActionLabel : 'Continue to next step'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/16 bg-white/8 px-5 py-3 text-sm font-semibold text-white/74 transition hover:bg-white/12"
            >
              Keep exploring chat
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

