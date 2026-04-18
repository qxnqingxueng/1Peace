import MapDashboard from './MapDashboard';
import { useModeTheme } from '../hooks/useModeTheme';

export default function CrisisOpsPage({ onBack }) {
  useModeTheme('crisis');

  return (
    <main className="theme-shell min-h-screen px-4 py-5 text-[var(--theme-foreground)] md:px-6 md:py-6">
      <div className="mx-auto grid max-w-7xl gap-4">
        <div className="surface-card flex flex-wrap items-center justify-between gap-3 rounded-[28px] p-5">
          <div className="space-y-2">
            <p className="font-crisis text-xs font-semibold uppercase tracking-[0.24em] text-[var(--theme-accent)]">
              Crisis-Time Mode
            </p>
            <h1 className="font-crisis text-3xl font-semibold text-[var(--theme-foreground)] md:text-4xl">
              Disaster Twin Live Ops
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--theme-muted)] md:text-base">
              Real-time response surface for Butterworth, Penang. Deck.gl layers stay active for flood zones,
              facilities, and route overlays while the interface stays aligned to the flood alert palette.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="rounded-full border px-4 py-2 text-sm font-semibold text-[var(--theme-foreground)] transition hover:bg-[color:rgba(46,90,167,0.3)]"
            style={{
              borderColor: 'var(--theme-border)',
              backgroundColor: 'rgba(46,90,167,0.2)',
            }}
          >
            Back
          </button>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-theme-border shadow-[0_24px_64px_rgba(20,38,68,0.28)]">
          <MapDashboard appMode="CRISIS" />
        </div>
      </div>
    </main>
  );
}
