WORKER APP — FINAL PRODUCT STRUCTURE

You should structure it into 5 core sections (tabs/pages):

1. Home (Live Work + Insurance Status)
2. Policy (Current + Renewal+ fake payment gateway click on pay to complete payemnt)
3. Claims (History + Status)
4. Activity (Signals + Transparency)
5. Profile (User + Platform data)
🧱 1. HOME (PRIMARY SCREEN — DEMO SCREEN)
🎯 Purpose

Show live insurance + live work + real-time protection

🔹 A. Current Work Status
Status: Active 🟢
Orders/hr: 3
Earnings Today: ₹850
🔹 B. Live Signals (REAL + SIMULATED)
📍 Location: Chennai (Live GPS)
🌧 Weather: Heavy Rain (Live API)
📉 Demand: Low (Simulated)
🚴 Movement: Moving (Sensor)
🔹 C. Insurance Status (CRITICAL)
Policy: Active ✅
Coverage: ₹5000
Expires in: 4 days
Weekly Premium: ₹84
🔹 D. Risk Indicator
Current Risk: HIGH ⚠️
Reason: Heavy Rain + Low Demand
🔹 E. Smart Insight (VERY HIGH VALUE)
⚠️ You are likely to lose ₹300 today due to disruptions
You are protected under your policy

👉 Judges LOVE this.

🧱 2. POLICY PAGE (INSURANCE MANAGEMENT)
🎯 Purpose

Show full policy lifecycle

🔹 A. Current Policy Card
Plan: Weekly Income Protection
Coverage: ₹5000
Premium Paid: ₹84
Start Date: Mar 20
End Date: Mar 27
Status: Active
🔹 B. Coverage Breakdown
Max Daily Payout: ₹1000
Covered Events:
✔ Rain
✔ Heat
✔ Demand crash
✔ Platform outage
🔹 C. Policy Timeline
Day 1 ───────────── Day 7
       ↑ Today
🔹 D. Renewal CTA
Policy expires in 2 days

[ Renew Policy ]
🔹 E. No Policy State
⚠️ No active coverage

[ Buy Weekly Insurance ]
🧱 3. CLAIMS PAGE (VERY IMPORTANT)
🎯 Purpose

Show history + transparency

🔹 A. Claims List

Each item:

Date: Mar 22
Trigger: Heavy Rain
Payout: ₹420
Status: Approved ✅
🔹 B. Claim Detail (on click)
Trigger: Rain (>25mm)
Income Loss: ₹500
Activity Score: 0.84
Fraud Score: 0.10
Final Payout: ₹420
Status: Approved
🔹 C. Status Types
Approved ✅
Flagged ⚠️
Under Review ⏳
Rejected ❌
🔹 D. Fraud Case Example
⚠️ Suspicious Activity Detected
Reason: Motion mismatch with GPS
Status: Under Review

👉 This demonstrates your PoWI system.

🧱 4. ACTIVITY PAGE (TRANSPARENCY — UNIQUE FEATURE)
🎯 Purpose

Show how system evaluates user

This is your differentiator.

🔹 A. Live Signals
GPS Accuracy: 10m
Speed: 25 km/h
Motion: Moving
Orders/hr: 2
🔹 B. Behavior Score
Consistency Score: 0.78
Activity Score: 0.82
🔹 C. Fraud Indicators
GPS Anomaly: Low
Motion Mismatch: None
Behavior Risk: Low
🔹 D. Trust Score
Trust Score: 85% ↑

Your consistent activity reduces your premium
Why this matters

No other team will show:

WHY payout happened
HOW fraud is detected

👉 This is a major differentiator

🧱 5. PROFILE PAGE
🎯 Purpose

Show worker identity + platform integration

🔹 A. User Info
Name: Ravi
City: Chennai
Platform: Swiggy
🔹 B. Platform Data (SIMULATED)
Avg Earnings: ₹1200/day
Orders/hr: 3
Rating: 4.6
🔹 C. Insurance Summary
Total Premium Paid: ₹320
Total Payout Received: ₹980
🔹 D. Settings
Enable/disable real weather
Data permissions (GPS)
⚙️ BACKGROUND FEATURES (NOT UI BUT CRITICAL)
🔁 1. Live Data Sync

Every 5–10 sec:

{
  lat,
  lng,
  motion,
  ordersPerHour,
  earnings
}
🌦️ 2. Weather Fetch
Backend fetches based on GPS
Worker app displays only
🔁 3. Auto Claim Trigger

No button.

Trigger → Claim → Payout
🔐 4. Policy Validation
if no policy → no payout
🎯 IDEAL USER FLOW (END-TO-END)
Login
→ Fetch platform data
→ Show premium
→ Buy policy
→ Start working
→ Rain happens
→ Orders drop
→ Claim auto-triggered
→ Fraud check
→ Payout shown
→ Claim saved in history
🧠 FINAL DESIGN PRINCIPLES
1. Insurance-first UI

Not:

generic dashboard
But:
policy, claims, coverage
2. Explainability

Always show:

why payout happened
why claim blocked
3. Real-time feel
live signals updating
status changing
🚨 FINAL CHECKLIST
MUST HAVE
 Current policy (with expiry)
 Claims history
 Claim detail breakdown
 Live work + signals
 Auto claim flow
 Payout display
HIGH IMPACT
 Trust score
 Fraud explanation
 Smart insights