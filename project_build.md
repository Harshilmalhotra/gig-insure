1. FINAL SYSTEM OVERVIEW (EXECUTION-READY)

You are building a hybrid signal-driven insurance system:

REAL SIGNALS (GPS + Weather + Motion)
        +
SIMULATED SIGNALS (orders, demand, fraud)
        ↓
DECISION ENGINE (backend)
        ↓
UI (Worker + Admin + Simulator)
🧱 2. SYSTEM COMPONENTS (WITH RESPONSIBILITIES)
1️⃣ Worker App (Next.js)
Purpose:

Simulate a real delivery partner lifecycle

Responsibilities:
Capture real device signals
Display insurance lifecycle
Show payout decisions
2️⃣ Admin + Simulation Dashboard (Next.js)
Purpose:
Control system behavior
Simulate platform + fraud + demand
3️⃣ Backend (NestJS)
Purpose:
Single source of truth
All decisions (NO logic in frontend)
4️⃣ External APIs
MUST USE:
Weather API (OpenWeather)
5️⃣ Mock Platform Layer

Simulates:

Swiggy/Zomato worker profile
Orders
earnings
🧠 3. REAL DATA IMPLEMENTATION (VERY IMPORTANT)

You asked for:

live GPS, live weather, accelerometer

Here is EXACTLY how to do it.

📍 A. LIVE GPS LOCATION (Worker App)
Use:

Browser API:

navigator.geolocation.watchPosition(...)
Send to backend every 5–10 sec:
{
  "lat": 12.9716,
  "lng": 77.5946,
  "accuracy": 10,
  "timestamp": 1710000000
}
Backend stores:
locationHistory: [
  { lat, lng, timestamp }
]
Derived signal:
speed = distance / time

Used for:

fraud detection (teleportation)
🌦️ B. LIVE WEATHER DATA (CRITICAL)
Backend fetches:
GET https://api.openweathermap.org/data/2.5/weather?lat=...&lon=...
Response used:
{
  "rain": { "1h": 25 },
  "main": { "temp": 310 },
  "weather": [{ "main": "Rain" }]
}
Convert to:
weatherState = {
  rainfall: 25,
  temperature: 37,
  condition: "rain"
}
Store in backend:
DO NOT call API from frontend
📱 C. MOTION / ACCELEROMETER
Use:
window.addEventListener("devicemotion", ...)
Extract:
acceleration = {
  x, y, z
}
Derive:
motionState =
  if variance > threshold → "moving"
  else → "static"
Send:
{
  "motion": "moving"
}
⚠️ IMPORTANT

Desktop doesn’t support motion well.

👉 Add fallback:

if (!motionAvailable) {
  motion = simulationInput
}
🧠 4. SIMULATED DATA (CONTROLLED)
A. MOCK PLATFORM DATA
API:
POST /mock/platform-data
Response:
{
  "avgDailyEarnings": 1200,
  "ordersPerHour": 3,
  "rating": 4.6,
  "consistencyScore": 0.8
}
Controlled via simulation dashboard
B. DEMAND + ORDERS

From simulation:

{
  "ordersPerHour": 1,
  "demand": "low"
}
C. FRAUD SIGNALS

Simulation sets:

{
  "gpsPattern": "spoofed",
  "motionOverride": "static"
}
🔁 5. COMPLETE DATA FLOW (LOW LEVEL)
LOOP (EVERY 5–10s)
Worker App →
  sends:
    GPS
    motion
    (simulated orders)

Backend →
  fetches:
    weather

Backend →
  merges:
    worker state + weather + simulation
⚙️ 6. BACKEND DECISION PIPELINE (IMPLEMENTABLE)
STEP 1: Trigger Engine
if (weather.rainfall > 20) trigger = "RAIN"
if (ordersPerHour < 1) trigger = "DEMAND_CRASH"
STEP 2: Policy Check
if (!policyActive) return NO_PAYOUT
STEP 3: Fraud Engine
gpsAnomaly =
  if speed > 120km/h → high

motionAnomaly =
  if motion === "static" AND GPS changing → high

behaviorAnomaly =
  if orders = 0 but "active" → high
STEP 4: Activity Score
activityScore =
  0.4 * motionScore +
  0.3 * routeScore +
  0.3 * behaviorScore
STEP 5: Claim Creation
if (trigger) createClaim()
STEP 6: Payout
if (fraudScore < 0.6) {
  payout = coverage * activityScore
}
🎛️ 7. SIMULATION DASHBOARD (DETAILED FEATURES)
Worker Controls
Orders/hr slider
Earnings multiplier
Force motion state
GPS spoof toggle
Environment Controls
Rain override (if not using API)
Temperature
AQI
Demand
Fraud Controls
spoof GPS
freeze motion
multi-user attack
Scenario Buttons
Normal
Heavy Rain
Heatwave
Demand Crash
Fraud Attack
👨‍💼 8. ADMIN DASHBOARD (DETAILED)
A. Metrics
totalPremium
totalPayout
lossRatio = payout / premium
B. Claims Table
{
  claimId,
  userId,
  trigger,
  payout,
  fraudScore,
  status
}
C. Fraud View
anomaly distribution
flagged clusters
⚠️ 9. WEATHER STRATEGY (FINAL ANSWER)
Use BOTH:
Default:
REAL API
Fallback:
simulation
Add toggle:
Use Real Weather ✅
Use Simulated Weather ⬜
🧩 10. FINAL SYSTEM BEHAVIOR
REAL:
GPS
Weather
(optional motion)
SIMULATED:
orders
earnings
demand
fraud
🚨 FINAL EXECUTION RULE

Your system must always answer:

Given:
  location + weather + activity + behavior

Decide:
  payout or not