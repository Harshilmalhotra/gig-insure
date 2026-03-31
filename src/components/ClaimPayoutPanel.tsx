import { Claim, Policy } from '@/lib/api';

type ClaimPayoutPanelProps = {
  policy: Policy | null;
};

export function ClaimPayoutPanel({ policy }: ClaimPayoutPanelProps) {
  const claim = policy?.claims?.[0] ?? null;
  const status = claim?.status ?? 'No payouts yet';
  const amount = claim ? `${claim.payoutAmount.toFixed(0)} INR` : '—';
  const reason = claim?.triggerType ?? 'No active claim';

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Claims & payout</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Latest payout details</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-300">
        <div className="flex items-center justify-between">
          <span>Payout status</span>
          <strong className="text-white">{status}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Payout amount</span>
          <strong className="text-white">{amount}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Trigger reason</span>
          <strong className="text-white">{reason}</strong>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-400">
        This panel surfaces the most recent claim event and whether the worker’s policy has begun a payout cycle.
      </p>
    </section>
  );
}
