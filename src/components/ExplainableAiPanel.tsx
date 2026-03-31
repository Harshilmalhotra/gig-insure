import { RiskBreakdown } from '@/lib/api';

const metricIcons = {
  motion: '⚡',
  gpsConsistency: '📍',
  ordersRate: '📈',
  weather: '⛅',
} as const;

type ExplainableAiPanelProps = {
  breakdown: RiskBreakdown;
  riskScore: number;
};

export function ExplainableAiPanel({ breakdown, riskScore }: ExplainableAiPanelProps) {
  const metrics = [
    { label: 'Motion validation', value: breakdown.motion, description: 'How well the worker motion matches expected active work.', key: 'motion' },
    { label: 'GPS consistency', value: breakdown.gpsConsistency, description: 'Trajectory integrity and pattern coherence.', key: 'gpsConsistency' },
    { label: 'Orders velocity', value: breakdown.ordersRate, description: 'Delivery intensity relative to expected demand.', key: 'ordersRate' },
    { label: 'Weather stress', value: breakdown.weather, description: 'Environmental factor pressure on risk.', key: 'weather' },
  ] as const;

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Explainable AI</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Risk breakdown</h2>
        </div>
        <div className="rounded-3xl bg-slate-900/90 px-4 py-3 text-right text-sm text-slate-400">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Combined risk</p>
          <p className="mt-1 text-lg font-semibold text-white">{Math.round(riskScore * 100)}%</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.key} className="rounded-3xl bg-slate-900/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl">{metricIcons[metric.key]}</span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                {(metric.value * 100).toFixed(0)}%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-white">{metric.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{metric.description}</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-sky-400" style={{ width: `${metric.value * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
