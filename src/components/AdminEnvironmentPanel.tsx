import { CloudRain, WifiOff } from 'lucide-react';
import { AdminEnvironmentPayload } from '@/lib/api';

type AdminEnvironmentPanelProps = {
  environment: AdminEnvironmentPayload;
  onChange: (environment: AdminEnvironmentPayload) => void;
  onApply: () => void;
  loading: boolean;
};

const demandLabels = ['low', 'medium', 'high', 'critical'] as const;

export function AdminEnvironmentPanel({ environment, onChange, onApply, loading }: AdminEnvironmentPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Environment</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Simulation controls</h2>
        </div>
      </div>
      <div className="mt-6 space-y-5 rounded-3xl bg-slate-900/80 p-5">
        <label className="space-y-2 text-sm text-slate-400">
          Rain intensity ({environment.rain} mm)
          <input
            type="range"
            min={0}
            max={100}
            value={environment.rain}
            onChange={(event) => onChange({ ...environment, rain: Number(event.target.value) })}
            className="w-full appearance-none rounded-full bg-slate-800/90 accent-sky-400"
          />
        </label>
        <div className="space-y-2 text-sm text-slate-400">
          <p className="font-semibold">Demand level</p>
          <div className="grid grid-cols-4 gap-2">
            {demandLabels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange({ ...environment, demandLevel: level })}
                className={`rounded-2xl px-3 py-2 text-xs font-semibold uppercase transition ${
                  environment.demandLevel === level ? 'bg-sky-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center justify-between gap-3 rounded-2xl bg-slate-800/80 px-4 py-3 text-sm text-slate-300">
          <div>
            <p className="font-semibold">Platform status</p>
            <p className="text-xs text-slate-500">Toggle normal or outage state.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
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
        onClick={onApply}
        disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Apply environment
      </button>
    </section>
  );
}
