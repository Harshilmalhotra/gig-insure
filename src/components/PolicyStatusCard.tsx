import { Policy } from '@/lib/api';

type PolicyStatusCardProps = {
  policy: Policy | null;
  loading: boolean;
  onLoadPolicy: () => void;
};

export function PolicyStatusCard({ policy, loading, onLoadPolicy }: PolicyStatusCardProps) {
  const active = policy && policy.status.toLowerCase() === 'active';
  const statusLabel = active ? 'Active policy' : policy ? policy.status : 'Inactive';

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Policy status</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{statusLabel}</h2>
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300'}`}>
          {active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="mt-6 grid gap-4 rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-300">
        <div className="flex items-center justify-between">
          <span>Premium</span>
          <strong className="text-white">{policy ? `${policy.premium} INR` : '—'}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Coverage</span>
          <strong className="text-white">{policy ? `${policy.coverage} INR` : '—'}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>End date</span>
          <strong className="text-white">{policy ? policy.endDate.split('T')[0] : '—'}</strong>
        </div>
      </div>
      <button
        type="button"
        onClick={onLoadPolicy}
        disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Refresh policy
      </button>
    </section>
  );
}
