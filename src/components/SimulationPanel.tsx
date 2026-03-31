import { CloudRain, Pause, WifiOff } from 'lucide-react';
import { AdminEnvironmentPayload, WorkerOverridePayload } from '@/lib/api';

type SimulationPanelProps = {
  environment: AdminEnvironmentPayload;
  workerOverride: WorkerOverridePayload;
  onEnvironmentChange: (value: AdminEnvironmentPayload) => void;
  onWorkerOverrideChange: (value: WorkerOverridePayload) => void;
  onSubmitEnvironment: () => void;
  onSubmitWorkerOverride: () => void;
  loading: boolean;
  userId: string;
};

const demandLabels = ['low', 'medium', 'high', 'critical'] as const;

export function SimulationPanel({
  environment,
  workerOverride,
  onEnvironmentChange,
  onWorkerOverrideChange,
  onSubmitEnvironment,
  onSubmitWorkerOverride,
  loading,
  userId,
}: SimulationPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Simulation</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Admin controls</h2>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="rounded-3xl bg-slate-900/80 p-5">
          <p className="text-sm font-semibold text-slate-300">Environment</p>
          <div className="mt-4 space-y-4">
            <label className="space-y-2 text-sm text-slate-400">
              Rain intensity ({environment.rain} mm)
              <input
                type="range"
                min={0}
                max={100}
                value={environment.rain}
                onChange={(event) => onEnvironmentChange({ ...environment, rain: Number(event.target.value) })}
                className="w-full appearance-none rounded-full bg-slate-800/90 accent-sky-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-400">
              Demand level
              <div className="grid grid-cols-4 gap-2">
                {demandLabels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onEnvironmentChange({ ...environment, demandLevel: level })}
                    className={`rounded-2xl px-3 py-2 text-xs font-semibold uppercase transition ${
                      environment.demandLevel === level ? 'bg-sky-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl bg-slate-800/80 px-4 py-3 text-sm text-slate-300">
              <div>
                <p className="font-semibold">Platform outage</p>
                <p className="text-xs text-slate-500">Switch to outage or normal platform status.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onEnvironmentChange({
                    ...environment,
                    platformStatus: environment.platformStatus === 'OUTAGE' ? 'NORMAL' : 'OUTAGE',
                  })
                }
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  environment.platformStatus === 'OUTAGE' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-200'
                }`}
              >
                {environment.platformStatus === 'OUTAGE' ? <WifiOff size={16} /> : <CloudRain size={16} />}
                {environment.platformStatus}
              </button>
            </label>
          </div>
          <button
            type="button"
            onClick={onSubmitEnvironment}
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CloudRain size={18} />
            Apply environment
          </button>
        </div>

        <div className="rounded-3xl bg-slate-900/80 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-300">Worker override</p>
              <p className="text-xs text-slate-500">Enforce specific telemetry values for the selected worker.</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-400">{userId}</span>
          </div>

          <div className="mt-5 space-y-4">
            <label className="space-y-2 text-sm text-slate-400">
              Forced orders per hour
              <input
                type="number"
                value={workerOverride.forcedOrdersPerHour ?? ''}
                onChange={(event) =>
                  onWorkerOverrideChange({
                    ...workerOverride,
                    forcedOrdersPerHour: event.target.value ? Number(event.target.value) : null,
                  })
                }
                placeholder="Leave empty for default"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-400">
                Forced motion
                <select
                  value={workerOverride.forcedMotion ?? ''}
                  onChange={(event) =>
                    onWorkerOverrideChange({
                      ...workerOverride,
                      forcedMotion: event.target.value ? (event.target.value as 'moving' | 'idle') : null,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                >
                  <option value="">Default</option>
                  <option value="moving">moving</option>
                  <option value="idle">idle</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-400">
                Forced GPS pattern
                <select
                  value={workerOverride.forcedGpsPattern ?? ''}
                  onChange={(event) =>
                    onWorkerOverrideChange({
                      ...workerOverride,
                      forcedGpsPattern: event.target.value ? (event.target.value as 'smooth' | 'anomaly') : null,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
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
            onClick={onSubmitWorkerOverride}
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Pause size={18} />
            Apply worker override
          </button>
        </div>
      </div>
    </section>
  );
}
