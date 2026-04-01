# Frontend Overview

This project uses a dedicated Next.js frontend in `frontend/` to simulate the insurance decision engine.

## Main files

- `frontend/src/app/page.tsx` — the primary UI page for the decision engine.
- `frontend/src/app/layout.tsx` — root layout and metadata.
- `frontend/src/app/globals.css` — global dark theme and component styling.

## How it works

The frontend is a client-side React app using the Next.js App Router. It renders a controlled simulation dashboard for:

- loading insurance quotes
- checking active policies
- purchasing a 7-day policy
- sending worker telemetry

The page is implemented as a `use client` component and maintains local state for:

- `userId` — the worker identifier
- `quote` — latest quote response from the backend
- `policy` — active policy state
- `premium` / `coverage` — purchase inputs
- `telemetry` — simulated worker signals
- `message` — UI feedback notifications

## Backend integration

The frontend calls the backend decision engine on these endpoints:

- `GET /insurance/quote/:userId`
- `GET /insurance/policy/active/:userId`
- `POST /insurance/policy/purchase`
- `POST /insurance/worker/heartbeat`

The target backend URL is configured through the environment variable:

- `NEXT_PUBLIC_BACKEND_URL`

If not set, it defaults to `http://localhost:3001`.

## UI flows

1. Enter a worker ID and click **Load quote** to request a premium quote.
2. Click **Check policy** to fetch the currently active policy for the worker.
3. Adjust premium and coverage values, then click **Purchase policy** to create a 7-day policy.
4. Use the telemetry controls and **Submit heartbeat** to send a simulated worker heartbeat to the decision engine.

## Run the frontend

From the root of the repo:

```powershell
cd frontend
npm install
npm run dev
```

Then open the app in your browser at:

- `http://localhost:3000`

## Notes

- The frontend is designed for simulation and controlled testing scenarios.
- The dashboard shows quote risk scores, policy summaries, and claim details returned by the backend.
- The UI is styled with CSS in `frontend/src/app/globals.css` and uses modern card panels with responsive layout.
