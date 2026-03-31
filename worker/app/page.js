"use client";

import { useEffect, useState } from "react";

const DEFAULT_LAT = 28.6139;
const DEFAULT_LON = 77.209;

export default function Home() {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        setLoading(true);
        const response = await fetch(`/api/weather?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}`);
        const body = await response.json();

        if (!response.ok || !body.success) {
          throw new Error(body.error ?? "Failed to load weather");
        }

        setPayload(body.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-semibold">GigInsure Weather API Layer</h1>
      <p className="text-sm opacity-80">
        This page calls the internal weather API, computes trigger flags, and renders risk cards.
      </p>

      {loading && <p>Loading weather...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && payload && (
        <>
          <section className="rounded-md border border-black/10 p-5 dark:border-white/20">
            <h2 className="mb-3 text-xl font-semibold">Weather Snapshot</h2>
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p>
                Source: <strong>{payload.source}</strong>
              </p>
              <p>
                Provider: <strong>{payload.meta.provider}</strong>
              </p>
              <p>
                Condition: <strong>{payload.weather.condition}</strong>
              </p>
              <p>
                Description: <strong>{payload.weather.description}</strong>
              </p>
              <p>
                Temperature: <strong>{payload.weather.temperatureC} C</strong>
              </p>
              <p>
                Rainfall: <strong>{payload.weather.rainfallMm} mm</strong>
              </p>
              <p>
                Cache hit: <strong>{String(payload.meta.cacheHit)}</strong>
              </p>
              <p>
                Fallback used: <strong>{String(payload.meta.fallbackUsed)}</strong>
              </p>
            </div>
          </section>

          <section className="rounded-md border border-black/10 p-5 dark:border-white/20">
            <h2 className="mb-1 text-xl font-semibold">Risk Flags</h2>
            <p className="mb-4 text-sm opacity-80">
              Active flags: <strong>{payload.riskFlags.activeFlags.length}</strong>
            </p>

            <div className="space-y-2">
              {payload.riskFlags.flags.map((flag) => (
                <div
                  key={flag.key}
                  className={`rounded-md border p-3 ${
                    flag.triggered
                      ? "border-red-400 bg-red-50 text-red-800 dark:border-red-600/70 dark:bg-red-950/30 dark:text-red-200"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/70 dark:bg-emerald-950/30 dark:text-emerald-200"
                  }`}
                >
                  <p className="font-medium">
                    {flag.title} · {flag.severity}
                  </p>
                  <p className="text-sm">Status: {flag.triggered ? "TRIGGERED" : "CLEAR"}</p>
                  <p className="text-xs opacity-80">{flag.reason}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-black/10 p-5 dark:border-white/20">
            <h2 className="mb-3 text-xl font-semibold">Raw Normalized Payload</h2>
            <pre className="overflow-auto rounded bg-black/80 p-3 text-xs text-white">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </section>
        </>
      )}
    </main>
  );
}
