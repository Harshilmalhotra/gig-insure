import { Pause } from 'lucide-react';
import { WorkerOverridePayload } from '@/lib/api';

type AdminWorkerOverridePanelProps = {
  workerId: string;
  overrideData: WorkerOverridePayload;
  onWorkerIdChange: (value: string) => void;
  onOverrideChange: (value: WorkerOverridePayload) => void;
  onApply: () => void;
  loading: boolean;
};

export function AdminWorkerOverridePanel({
  workerId,
  overrideData,
  onWorkerIdChange,
  onOverrideChange,
  onApply,
  loading,
}: AdminWorkerOverridePanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Worker override</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Force telemetry values</h2>
        </div>
        <span className="rounded-full bg-slate-900/90 px-4 py-2 text-xs uppercase tracking-[0.16em] text-slate-400">{workerId || 'No worker selected'}</span>
      </div>
      <div className="mt-6 space-y-4 rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-300">
        <label className="space-y-2 text-sm text-slate-400">
          Worker ID
          <input
            type="text"
            value={workerId}
            onChange={(event) => onWorkerIdChange(event.target.value)}
            placeholder="worker-123"
            className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-400">
          Force orders per hour
          <input
            type="number"
            value={overrideData.forcedOrdersPerHour ?? ''}
            onChange={(event) =>
              onOverrideChange({
                ...overrideData,
                forcedOrdersPerHour: event.target.value ? Number(event.target.value) : null,
              })
            }
            placeholder="Leave blank for default"
            className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-400">
            Force motion
            <select
              value={overrideData.forcedMotion ?? ''}
              onChange={(event) =>
                onOverrideChange({
                  ...overrideData,
                  forcedMotion: event.target.value ? (event.target.value as 'moving' | 'idle') : null,
                })
              }
              className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
            >
              <option value="">Default</option>
              <option value="moving">moving</option>
              <option value="idle">idle</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-400">
            Force GPS pattern
            <select
              value={overrideData.forcedGpsPattern ?? ''}
              onChange={(event) =>
                onOverrideChange({
                  ...overrideData,
                  forcedGpsPattern: event.target.value ? (event.target.value as 'smooth' | 'anomaly') : null,
                })
              }
              className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
            >
              <option value="">Default</option>
              <option value="smooth">smooth</option>
              <option value="anomaly">anomaly</option>
            </select>
          </label>
        </div>
      </div>
      <button
        type="button"
        onClick={onApply}
        disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Pause size={18} />
        Apply override
      </button>
    </section>
  );
}
