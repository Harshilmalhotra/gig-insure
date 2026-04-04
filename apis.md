# Rozgaar Raksha API Documentation 🚀

This document provides a guide for frontend developers to integrate with the Rozgaar Raksha backend.

**Base URL**: `http://127.0.0.1:3001` (CORS enabled)

---

## 🔑 1. Authentication & Worker Registration

### Register Worker profile
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**: `{ "email": "string", "name": "string", "platform": "string" }`

---

## 🛡️ 2. Insurance & Policy Management (Worker UI)

### Get Premium Quote
- **URL**: `/insurance/quote/:userId`
- **Method**: `GET`

### Purchase Policy
- **URL**: `/insurance/policy/purchase`
- **Method**: `POST`
- **Body**: `{ "userId": "string", "premium": "number", "coverage": "number" }`

### Get Active Policy
- **URL**: `/insurance/policy/active/:userId`
- **Method**: `GET`

### Worker Heartbeat (PoWI Telemetry)
Sends live signals to the decision engine.
- **URL**: `/insurance/worker/heartbeat`
- **Method**: `POST`
- **Body**: `{ "userId": "string", "ordersPerHour": "number", "motion": "moving|idle", "gpsPattern": "smooth|anomaly", "earnings": "number" }`

---

## 👨‍💼 3. Admin & Simulation API 🎛️

### Force Global Environment
Simulate global weather/platform shifts.

- **URL**: `/admin/simulation/environment`
- **Method**: `POST`
- **Body**: 
```json
{
  "rain": 50,
  "temperature": 28,
  "aqi": 80,
  "demandLevel": "low|medium|high",
  "platformStatus": "online|outage",
  "isSimulated": true 
}
```

### Force Individual Worker State (FRAUD SIMULATION)
Forces behavior for a specific worker. Overrides their app's heartbeats.

- **URL**: `/admin/simulation/worker/:id`
- **Method**: `POST`
- **Body**: 
```json
{
  "forcedOrdersPerHour": 2,      
  "forcedMotion": "moving|idle",  
  "forcedGpsPattern": "smooth|anomaly" 
}
```

### Get All Workers
- **URL**: `/admin/users`
- **Method**: `GET`

### Advanced Analytics & Claims
- **URL**: `/admin/metrics`
- **Method**: `GET`
- **URL**: `/admin/claims`
- **Method**: `GET`
