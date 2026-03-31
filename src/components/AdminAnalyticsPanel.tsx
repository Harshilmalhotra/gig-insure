import { AdminMetrics } from '@/lib/api';

type AdminAnalyticsPanelProps = {
  metrics: AdminMetrics | null;
  loading: boolean;
};

export function AdminAnalyticsPanel({ metrics, loading }: AdminAnalyticsPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Analytics</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Key metrics</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {['Claims', 'Payouts', 'Fraud flags', 'Active workers'].map((label, index) => {
          const value =
            loading || !metrics
              ? '—'
              : label === 'Claims'
              ? metrics.claims
              : label === 'Payouts'
              ? metrics.payouts
              : label === 'Fraud flags'
              ? metrics.fraudFlags
              : metrics.activeWorkers;
          return (
            <div key={label} className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
