# Gig-Insure API Documentation

This document provides a guide for frontend developers to integrate with the Gig-Insure backend.

**Base URL**: `http://127.0.0.1:3001` (CORS enabled)

---

## 🔑 1. Authentication & Worker Registration

### Register Worker profile
Extracts a mock profile (rating, earnings history) from Swiggy/Zomato and creates a user in the database.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
```json
{
  "email": "harshil@example.com",
  "name": "Harshil Malhotra",
  "platform": "Swiggy"
}
```

---

## 🛡️ 2. Insurance & Policy Management (Worker UI)

### Get Premium Quote
Calculates a dynamic premium based on current "weather" and the worker's history.

- **URL**: `/insurance/quote/:userId`
- **Method**: `GET`
- **Response**:
```json
{
  "userId": "uuid",
  "basePremium": 20,
  "riskScore": 0.45,
  "totalPremium": 65,
  "currency": "INR"
}
```

### Purchase Policy
Activates insurance coverage for the next 7 days.

- **URL**: `/insurance/policy/purchase`
- **Method**: `POST`
- **Body**:
```json
{
  "userId": "uuid",
  "premium": 65,
  "coverage": 5000
}
```

### Get Active Policy
Fetches current policy status for a worker.

- **URL**: `/insurance/policy/active/:userId`
- **Method**: `GET`

### Worker Heartbeat (PoWI Telemetry)
Sends live signals to the decision engine. If an active policy exists and the simulation environment (Rain/Heat) matches a trigger, a claim is automatically generated based on these scores.

- **URL**: `/insurance/worker/heartbeat`
- **Method**: `POST`
- **Body**:
```json
{
  "userId": "uuid",
  "ordersPerHour": 2,
  "motion": "moving",    // "moving" or "idle"
  "gpsPattern": "smooth", // "smooth" or "anomaly"
  "earnings": 450
}
```

---

## 👨‍💼 3. Admin & Simulation API

### Update Simulation Reality
Force global environmental factors. This affects ALL users' risk and claims.

- **URL**: `/admin/simulation/environment`
- **Method**: `POST`
- **Body**:
```json
{
  "rain": 50,
  "temperature": 28,
  "aqi": 80,
  "demandLevel": "high", // "low", "medium", "high"
  "platformStatus": "online" // "online", "outage"
}
```

### Get Platform Metrics
Summary analytics for the admin dashboard.

- **URL**: `/admin/metrics`
- **Method**: `GET`

### Get Claims List
Real-time feed of all generated insurance claims.

- **URL**: `/admin/claims`
- **Method**: `GET`

---

## 🏗️ Status Codes
| Code | Meaning |
| :--- | :--- |
| `201` | Created successfully. |
| `200` | Fetch Successful. |
| `400` | Bad Request (Check your body params). |
| `500` | Backend Engine Error (Check your logs). |
