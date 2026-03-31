import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1080px] px-6 py-14 sm:px-8">
        <section className="rounded-[36px] border border-white/10 bg-slate-950/80 p-10 shadow-[0_30px_80px_rgba(0,0,0,0.18)] text-center">
          <p className="inline-flex rounded-full bg-sky-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-sky-300">
            GigInsure control plane
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Choose your dashboard
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Pick the worker view for telemetry, quotes, and policy management or the admin console for simulation controls and claims analytics.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Link href="/worker" className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 transition hover:border-sky-400">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Worker dashboard</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Worker view</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Monitor risk, trust, active policy status, and premium purchasing in a focused worker experience.
              </p>
            </Link>
            <Link href="/admin" className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 transition hover:border-sky-400">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Admin dashboard</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Admin console</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Control environment simulation, worker overrides, and review teams, metrics, and claims.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
