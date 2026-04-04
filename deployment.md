# 🚀 Rozgaar Raksha: Deployment Guide

This document provides step-by-step instructions for deploying the Rozgaar Raksha platform using **Vercel** and **Neon**.

---

## 1. Database Setup (Neon)

Your database is already initialized and seeded! 

**Your Connection String:**
`postgresql://neondb_owner:npg_Gh9nwqeuDv4a@ep-cool-hall-am8xxkh5.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require`

> [!IMPORTANT]
> This URL is already added to your local `backend/.env`. If you need to reset the database at any point, run:
> ```bash
> cd backend
> npx prisma db push
> node prisma/seed.js
> ```

---

## 2. Backend Configuration (Vercel)

The backend is adapted to run as a **Serverless Function** on Vercel.

### Steps:
1. Create a new project in Vercel and select your GitHub repository.
2. Set **Root Directory** to `backend`.
3. Add these **Environment Variables**:
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_Gh9nwqeuDv4a@ep-cool-hall-am8xxkh5.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - `PORT`: `3005`
   - `NODE_ENV`: `production`
4. **Deploy**. Once finished, copy the **Deployment URL** (e.g., `https://rozgaar-backend.vercel.app`).

---

## 3. Frontend Configuration (Worker & Admin)

I have centralized the API URLs so you don't have to edit every file.

### Where to find the configuration:
- **Worker App**: `worker/app/config.js`
- **Admin App**: `admin-app/app/config.js`

### How it works:
Both apps use the `NEXT_PUBLIC_API_URL` environment variable. 
- **Locally**: It defaults to `http://localhost:3005`.
- **Production**: It uses whatever URL you set in the Vercel dashboard.

### Steps for Vercel:
1. Create a new project for the **Worker App** (Root: `worker`).
2. Add this **Environment Variable**:
   - `NEXT_PUBLIC_API_URL`: (Paste your Backend URL from Step 2)
3. Create a new project for the **Admin App** (Root: `admin-app`).
4. Add the same **Environment Variable**:
   - `NEXT_PUBLIC_API_URL`: (Paste your Backend URL from Step 2)

---

## 🛠️ Maintenance & Testing

### Local testing against Cloud DB
You can run your local backend against the Neon DB by keeping the `DATABASE_URL` in your `.env`.

### Viewing Data
Use Prisma Studio to view your live cloud data:
```bash
cd backend
npx prisma studio
```
