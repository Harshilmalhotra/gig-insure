'use client';

import { AdminAnalyticsPanel } from '@/components/AdminAnalyticsPanel';
import { AdminEnvironmentPanel } from '@/components/AdminEnvironmentPanel';
import { AdminWorkerOverridePanel } from '@/components/AdminWorkerOverridePanel';
import { ClaimsHistoryPanel } from '@/components/ClaimsHistoryPanel';
import { WorkersList } from '@/components/WorkersList';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export default function AdminDashboardPage() {
  const {
    workerId,
    environment,
    workerOverride,
    users,
    metrics,
    claims,
    loading,
    dataLoading,
    toast,
    setWorkerId,
    setEnvironment,
    setWorkerOverride,
    applyEnvironment,
    applyWorkerOverride,
  } = useAdminDashboard();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1240px] px-6 py-10 sm:px-8">
        <header className="mb-10 rounded-[36px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
          <p className="inline-flex rounded-full bg-sky-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-sky-300">
            Admin dashboard
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Manage simulations, worker overrides, and claims analytics.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Operate the admin control plane for simulated weather, demand, and worker telemetry overrides.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <AdminEnvironmentPanel
            environment={environment}
            onChange={setEnvironment}
            onApply={applyEnvironment}
            loading={loading}
          />
          <AdminWorkerOverridePanel
            workerId={workerId}
            overrideData={workerOverride}
            onWorkerIdChange={setWorkerId}
            onOverrideChange={setWorkerOverride}
            onApply={applyWorkerOverride}
            loading={loading}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <WorkersList users={users} loading={dataLoading} />
          <AdminAnalyticsPanel metrics={metrics} loading={dataLoading} />
        </div>

        <div className="mt-6">
          <ClaimsHistoryPanel claims={claims} loading={dataLoading} />
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
