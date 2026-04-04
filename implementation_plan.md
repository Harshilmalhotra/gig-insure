# Gig-Insure Implementation Plan

This plan outlines the phase-wise development of the Gig-Insure hybrid parametric insurance system, specifically focusing on the `backend` and `admin-app`.

## 🏗️ Architecture Overview
- **Backend**: Node.js + Express + Prisma (PostgreSQL)
- **Admin App**: Next.js (Tailwind CSS + Lucide Icons)
- **External Integration**: OpenWeather API (current weather)
- **Internal Integration**: Mock Platform Layer (Swiggy/Zomato sim)

---

## 📅 Phase 1: Backend Foundation & Database
**Goal**: Set up the core structure, database, and mock integrations.

### 1.1 Database Schema (Prisma)
- **User**: Name, Platform (Swiggy/Zomato), baseline earnings/rating.
- **Policy**: userId, coverage, premium, startDate, endDate, status (ACTIVE, EXPIRED).
- **WorkerState**: userId, timestamp, ordersPerHour, motion, gpsPattern, earnings, active (is driver working?).
- **EnvironmentState**: rain, temperature, AQI, demandLevel, platformStatus (simulated vs real).
- **Claim**: policyId, userId, triggerType, payoutAmount, fraudScore, status (PENDING, PAID, REJECTED).

### 1.2 Mock Platform Layer (`/mock`)
- **Service**: `MockPlatformService.js`
- Generates baseline data for signup (rating, consistency score, avg daily earnings).

### 1.3 Weather Service
- **Service**: `WeatherService.js`
- Connects to OpenWeather API.
- Implements fallback to simulated weather if API fails or simulation "forced weather" is active.

---

## 📅 Phase 2: Core Insurance Engine & APIs
**Goal**: Implement the "Decision Engines" and functional APIs.

### 2.1 Risk & Premium Engine
- `calculateRiskScore()`: Combines weather, zone, and behavior risks.
- `calculatePremium()`: Base + (Risk * Earnings) - Discounts.

### 2.2 Functional APIs
- `POST /api/auth/register`: Signup worker, trigger mock platform fetch.
- `GET /api/insurance/quote`: Get current premium quote for a user.
- `POST /api/policy/purchase`: Create a new policy record.
- `GET /api/policy/status/:userId`: Fetch active policy details.

### 2.3 Live Monitoring & decision engines
- `POST /api/worker/heartbeat`: Receives current state (simulated from Admin/Worker app).
- **Trigger Engine**: Logic to detect "Rain", "Demand Crash", "Heat", etc.
- **Fraud Engine (PoWI)**: Detects anomalies in GPS/Motion.
- **Claim Engine**: Automatically creates a claim if a Trigger occurs during an Active Policy.
- **Payout Engine**: Calculates actual payout based on Activity Score and Fraud Score.

---

## 📅 Phase 3: Admin Dashboard & Simulator (`admin-app`)
**Goal**: Build a high-end interface to control the simulation and view system health.

### 3.1 Simulation Dashboard (Simulator)
- **Controls**:
    - **Environment**: Rain (mm), Temp (°C), Demand (High/Low), Platform Up/Down toggle.
    - **Worker Behavior**: Set Orders/hr, Force Motion (Moving/Idle), Toggle GPS Anomaly (Fraud testing).
- **Preset Scenarios**:
    - `Scenario: Heavy Monsoon`: (Rain=50, Demand=High, Outage=Potential).
    - `Scenario: Heatwave`: (Temp=44, Activity=Decreased).
    - `Scenario: Bulk Fraud`: (Multiple workers reporting zero motion but active GPS).

### 3.2 Insurance Admin Dashboard (Analytics)
- **Key Metrics**:
    - **Loss Ratio**: Payouts vs Premiums.
    - **Active Policies**: Real-time counter.
    - **Fraud Alerts**: Notifications of high PoWI anomaly scores.
- **Tables**:
    - **Claims Feed**: Real-time feed of auto-generated claims and their status.
    - **Worker Monitoring**: List of active workers and their current risk scores.

### 3.3 Integration
- Admin app communicates with `POST /api/admin/simulate` to update the global/individual environment state in backend.

---

## 🛠️ Detailed API Specification

### Worker APIs
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register worker, trigger mock platform fetch. |
| `/api/insurance/quote` | `GET` | Return premium based on current sim/weather state. |
| `/api/policy/purchase` | `POST` | Create policy. |
| `/api/worker/heartbeat` | `POST` | Send current telemetry (GPS, Motion, Orders). |

### Admin/Simulation APIs
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/admin/simulation/environment` | `POST` | Force weather/demand values globally. |
| `/api/admin/simulation/worker/:id` | `POST` | Force behavior for a specific worker (e.g. mock fraud). |
| `/api/admin/metrics` | `GET` | Fetch system-wide insurance metrics (Loss ratio, etc). |
| `/api/admin/claims` | `GET` | List all claims for payout monitoring. |

---

## 🎨 Design Aesthetics (Admin App)
- **Theme**: Dark/Glassmorphism.
- **Color Palette**: Deep Blue/Purple (Insurance Trust), Electric Neon Blue (Tech/Gig), Amber (Risk Alerts), Emerald (Payouts).
- **Components**:
    - Real-time "Trigger" notification toasts.
    - Linear charts for Loss Ratio monitoring.
    - Dynamic "Risk Meter" for individual workers.

---

---

## 📅 Phase 4: Worker Mobile App (`worker`)
**Goal**: Create a beautiful, responsive mobile web app for gig workers.

### 4.1 Onboarding & Registration
- **Screen**: Simple, clean registration with name, email, and platform selection (Swiggy/Zomato).
- **Functionality**: `POST /auth/register` to create a profile and fetch initial mock platform data.

### 4.2 Worker Dashboard
- **Profile Summary**: Displays avg earnings, ratings, and platform consistency.
- **Active Policy Card**: 
    - Shows "No Active Policy" if none exists.
    - Shows Coverage (₹), Premium (₹), and Expiry Date if active.
- **Insurance Quote**:
    - "Get Protected" CTA.
    - Fetches current premium quote based on live environment risk.
    - Purchase flow with success animations.

### 4.3 Proof of Work Simulation (DEMO TOOL)
- **Telemetry Controls**:
    - **Status**: Online/Offline toggle (starts/stops heartbeats).
    - **Motion**: Moving / Idle toggle.
    - **GPS**: Smooth / Anomaly toggle (for fraud testing).
    - **Orders/hr**: Slider to adjust simulated productivity.
- **Heartbeat Loop**: Sends `POST /insurance/worker/heartbeat` every 10 seconds while Online.

### 4.4 Real-time Trigger & Claim Status
- **Claim Alerts**: Shows active triggers (e.g., "⚠️ HEAVY RAIN DETECTED").
- **Payout Notification**: Confirms when a claim has been automatically processed and paid out.

### 🖌️ Design Aesthetics (Worker App)
- **Theme**: Light/Dark mode compatible, default to Sleek Dark.
- **Mobile-First**: Optimized for small screens (390px - 450px).
- **Colors**: 
    - **Brand**: Neon Cerulean (Trust + Tech).
    - **Success**: Emerald Green.
    - **Warning**: Amber Glow.
- **UX**: Glassmorphic cards, smooth spring animations, and haptic-feedback-like visual cues.

---

## 🚀 Next Steps
1. Implement Phase 4 in `worker` directory.
2. Ensure API connectivity with `backend`.
3. Standardize layouts for mobile responsiveness.
