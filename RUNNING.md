# Running Gig-Insure

This repository contains the Backend and Admin Dashboard for the Gig-Insure parametric insurance system.

## 🚀 Quick Start

### 1. Backend Setup
The backend is a NestJS application using Prisma with SQLite.

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```
- **Port**: `3001` (CORS enabled)
- **Database**: `prisma/dev.db` (SQLite)

### 2. Admin App Setup
The admin app is a Next.js application for simulation and monitoring.

```bash
cd admin-app
npm install
npm run dev
```
- **URL**: `http://localhost:3000`

---

## 🛠️ Simulation Guide
1. Open the Admin Dashboard at `localhost:3000`.
2. Go to the **Simulation** tab.
3. Select a Quick Scenario (e.g., **Monsoon Blast**).
4. Click **Update Reality**.
5. The backend will now treat the environment as "Rainy".
6. Any "Worker Heartbeat" sent to the backend (`POST /insurance/worker/heartbeat`) while a policy is active will now automatically trigger a Claim.

---

## 🏗️ Tech Stack
- **Backend**: NestJS, Prisma, SQLite, OpenWeather API integration.
- **Frontend**: Next.js 15, Tailwind CSS v4, Lucide Icons, Recharts, Framer Motion.
- **Insurance Engine**: Rule-based Trigger, Fraud (PoWI), and Activity scoring engines.
