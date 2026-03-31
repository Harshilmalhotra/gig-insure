import { ArrowUpRight, Clock3, MapPin, Zap } from 'lucide-react';
import { HeartbeatPayload } from '@/lib/api';

type TelemetryPanelProps = {
  telemetry: HeartbeatPayload;
  lastUpdated?: string | null;
};

export function TelemetryPanel({ telemetry, lastUpdated }: TelemetryPanelProps) {
  const metrics = [
    { label: 'Orders / hour', value: telemetry.ordersPerHour.toFixed(1), icon: ArrowUpRight },
    { label: 'Motion', value: telemetry.motion, icon: Zap },
    { label: 'GPS pattern', value: telemetry.gpsPattern, icon: MapPin },
    { label: 'Earnings', value: `${telemetry.earnings.toFixed(0)} INR`, icon: Clock3 },
  ] as const;

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Telemetry</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Live worker state</h2>
        </div>
        {lastUpdated ? (
          <p className="rounded-3xl bg-slate-900/90 px-4 py-2 text-xs text-slate-400">Updated {lastUpdated}</p>
        ) : null}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-3xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-sky-300">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{metric.label}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{metric.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
