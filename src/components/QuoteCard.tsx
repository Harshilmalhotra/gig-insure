import { ArrowRight, RefreshCcw } from 'lucide-react';
import { Quote, Policy } from '@/lib/api';

type QuoteCardProps = {
  quote: Quote | null;
  policy: Policy | null;
  premium: string;
  coverage: string;
  loading: boolean;
  onLoadQuote: () => void;
  onPurchase: () => void;
  setPremium: (value: string) => void;
  setCoverage: (value: string) => void;
};

export function QuoteCard({
  quote,
  policy,
  premium,
  coverage,
  loading,
  onLoadQuote,
  onPurchase,
  setPremium,
  setCoverage,
}: QuoteCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Quote</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Protect your next shift</h2>
        </div>
        <button
          type="button"
          onClick={onLoadQuote}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={16} />
          Load quote
        </button>
      </div>
      <div className="mt-6 grid gap-4 rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-300">
        <div className="flex items-center justify-between">
          <span>Base premium</span>
          <strong className="text-white">{quote ? `${quote.basePremium} ${quote.currency}` : '−'}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Risk score</span>
          <strong className="text-white">{quote ? `${Math.round(quote.riskScore * 100)}%` : '−'}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Total premium</span>
          <strong className="text-white">{quote ? `${quote.totalPremium} ${quote.currency}` : '−'}</strong>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-400">
          Premium amount
          <input
            className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
            type="number"
            min={0}
            value={premium}
            onChange={(event) => setPremium(event.target.value)}
            placeholder="e.g. 1200"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-400">
          Coverage amount
          <input
            className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
            type="number"
            min={100}
            value={coverage}
            onChange={(event) => setCoverage(event.target.value)}
            placeholder="e.g. 5000"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={onPurchase}
        disabled={loading || !quote || !premium || !coverage}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ArrowRight size={18} />
        Purchase policy
      </button>
      {policy ? (
        <p className="mt-4 text-sm text-slate-400">Last policy loaded: {policy.status} until {policy.endDate.split('T')[0]}</p>
      ) : null}
    </section>
  );
}
