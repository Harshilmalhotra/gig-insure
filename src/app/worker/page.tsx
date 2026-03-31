'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ExplainableAiPanel } from '@/components/ExplainableAiPanel';
import { PolicyStatusCard } from '@/components/PolicyStatusCard';
import { QuoteCard } from '@/components/QuoteCard';
import { RiskGauge } from '@/components/RiskGauge';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { TrustBadge } from '@/components/TrustBadge';
import { ClaimPayoutPanel } from '@/components/ClaimPayoutPanel';
import { useWorkerDashboard } from '@/hooks/useWorkerDashboard';

export default function WorkerDashboardPage() {
  const {
    loading,
    toast,
    quote,
    policy,
    telemetry,
    trustScore,
    trustLevel,
    scoreBreakdown,
    loadQuote,
    loadPolicy,
    purchasePolicy,
    submitHeartbeat,
    setTelemetry,
  } = useWorkerDashboard();

  const [premium, setPremium] = useState('1200');
  const [coverage, setCoverage] = useState('5000');

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1240px] px-6 py-10 sm:px-8">
        <header className="mb-10 rounded-[36px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
          <p className="inline-flex rounded-full bg-sky-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-sky-300">
            Worker dashboard
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Gig worker telemetry, risk and policy control.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            A focused worker experience for risk, trust, active policy status, and quote management.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <RiskGauge score={quote?.riskScore ?? 0} />
            <ExplainableAiPanel breakdown={scoreBreakdown} riskScore={quote?.riskScore ?? 0} />
            <TelemetryPanel telemetry={telemetry} lastUpdated={new Date().toLocaleTimeString()} />
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Telemetry</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Heartbeat updates</h2>
                </div>
                <button
                  type="button"
                  onClick={submitHeartbeat}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowRight size={18} />
                  Submit heartbeat
                </button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-400">
                  Orders per hour
                  <input
                    type="number"
                    value={telemetry.ordersPerHour}
                    onChange={(event) => setTelemetry({ ...telemetry, ordersPerHour: Number(event.target.value) })}
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-400">
                  Earnings
                  <input
                    type="number"
                    value={telemetry.earnings}
                    onChange={(event) => setTelemetry({ ...telemetry, earnings: Number(event.target.value) })}
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Trust score</p>
                  <h2 className="mt-3 text-4xl font-semibold text-white">{trustScore}</h2>
                </div>
                <TrustBadge score={trustScore} level={trustLevel} />
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400">
                Trust score combines quote risk, motion validation, GPS consistency, and order velocity to rank the worker’s reliability.
              </p>
            </div>

            <PolicyStatusCard policy={policy} loading={loading} onLoadPolicy={loadPolicy} />
            <QuoteCard
              quote={quote}
              policy={policy}
              premium={premium}
              coverage={coverage}
              loading={loading}
              onLoadQuote={loadQuote}
              onPurchase={() => purchasePolicy(Number(premium), Number(coverage))}
              setPremium={setPremium}
              setCoverage={setCoverage}
            />
            <ClaimPayoutPanel policy={policy} />
          </div>
        </div>

        {toast ? (
          <div className="fixed bottom-6 right-6 z-50 rounded-3xl border border-white/10 bg-slate-950/95 px-5 py-4 shadow-2xl shadow-slate-950/40">
            <p className="text-sm text-white">{toast.message}</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
