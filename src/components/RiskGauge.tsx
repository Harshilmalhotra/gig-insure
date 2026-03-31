import clsx from 'clsx';

type RiskGaugeProps = {
  score: number;
};

export function RiskGauge({ score }: RiskGaugeProps) {
  const percent = Math.round(score * 100);
  const color = score > 0.7 ? 'bg-rose-500' : score > 0.4 ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Risk score</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{percent}%</h2>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-4 text-center">
          <span className="text-sm text-slate-400">Risk band</span>
          <p className="mt-2 text-lg font-semibold text-white">{score > 0.7 ? 'Elevated' : score > 0.4 ? 'Moderate' : 'Low'}</p>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <div className="rounded-full bg-slate-800/90 p-1">
          <div className="h-4 rounded-full bg-slate-950" />
          <div className={clsx('relative -mt-4 h-4 rounded-full transition-all', color)} style={{ width: `${percent}%` }} />
        </div>
        <div className="flex justify-between text-sm text-slate-400">
          <span>Minimal</span>
          <span>Critical</span>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-400">
        This risk score reflects your current quote and simulated worker telemetry. It combines weather exposure, worker motion, GPS consistency, and demand-side signals.
      </p>
    </div>
  );
}
