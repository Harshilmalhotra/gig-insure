import { AdminClaimRecord } from '@/lib/api';

type ClaimsHistoryPanelProps = {
  claims: AdminClaimRecord[];
  loading: boolean;
};

export function ClaimsHistoryPanel({ claims, loading }: ClaimsHistoryPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Claims</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Recent claim history</h2>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-3xl bg-slate-900/80 p-5 text-slate-400">Loading claim history…</div>
        ) : claims.length ? (
          claims.slice(0, 6).map((claim) => (
            <div key={claim.id} className="rounded-3xl bg-slate-900/80 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-400">{new Date(claim.createdAt).toLocaleDateString()}</p>
                  <p className="mt-2 text-base font-semibold text-white">{claim.triggerType}</p>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <p>Status: {claim.status}</p>
                  <p>Payout: {claim.payoutAmount.toFixed(0)} INR</p>
                  <p>Worker: {claim.workerId}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl bg-slate-900/80 p-5 text-slate-400">No claim history available.</div>
        )}
      </div>
    </section>
  );
}
