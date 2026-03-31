export type RiskBreakdown = {
  motion: number;
  gpsConsistency: number;
  ordersRate: number;
  weather: number;
};

export type Quote = {
  userId: string;
  basePremium: number;
  riskScore: number;
  totalPremium: number;
  currency: string;
  breakdown?: RiskBreakdown;
};

export type Claim = {
  id: string;
  triggerType: string;
  payoutAmount: number;
  activityScore: number;
  fraudScore: number;
  status: string;
  createdAt: string;
};

export type Policy = {
  id: string;
  userId: string;
  premium: number;
  coverage: number;
  endDate: string;
  status: string;
  claims: Claim[];
};

export type HeartbeatPayload = {
  userId: string;
  ordersPerHour: number;
  motion: 'moving' | 'idle';
  gpsPattern: 'smooth' | 'anomaly';
  earnings: number;
};

export type AdminEnvironmentPayload = {
  rain: number;
  temperature: number;
  aqi: number;
  demandLevel: 'low' | 'medium' | 'high' | 'critical';
  platformStatus: 'NORMAL' | 'OUTAGE';
};

export type WorkerOverridePayload = {
  forcedOrdersPerHour: number | null;
  forcedMotion: 'moving' | 'idle' | null;
  forcedGpsPattern: 'smooth' | 'anomaly' | null;
};

export type AdminWorker = {
  id: string;
  trustScore: number;
  status: string;
  role?: string;
  lastSeen?: string;
};

export type AdminMetrics = {
  claims: number;
  payouts: number;
  fraudFlags: number;
  activeWorkers: number;
};

export type AdminClaimRecord = {
  id: string;
  workerId: string;
  triggerType: string;
  status: string;
  payoutAmount: number;
  createdAt: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  const text = await response.text();
  if (!text) {
    return undefined as unknown as T;
  }

  return JSON.parse(text) as T;
};

const normalizeBreakdown = (riskScore: number, telemetry?: Partial<HeartbeatPayload>): RiskBreakdown => {
  const motion = telemetry?.motion === 'moving' ? 0.28 : 0.08;
  const gpsConsistency = telemetry?.gpsPattern === 'smooth' ? 0.26 : 0.06;
  const ordersRate = Math.min(0.3, ((telemetry?.ordersPerHour ?? 1) / 6) * 0.3);
  const weather = Math.max(0, 1 - (motion + gpsConsistency + ordersRate));
  const total = motion + gpsConsistency + ordersRate + weather;

  return {
    motion: motion / total,
    gpsConsistency: gpsConsistency / total,
    ordersRate: ordersRate / total,
    weather: weather / total,
  };
};

export const getQuote = async (userId: string): Promise<Quote> => {
  const result = await parseJson<Quote>(
    await fetch(`${BASE_URL}/insurance/quote/${encodeURIComponent(userId)}`),
  );

  return {
    ...result,
    breakdown: result.breakdown ?? normalizeBreakdown(result.riskScore),
  };
};

export const getActivePolicy = async (userId: string): Promise<Policy | null> => {
  const response = await fetch(`${BASE_URL}/insurance/policy/active/${encodeURIComponent(userId)}`);
  if (response.status === 404) {
    return null;
  }

  return parseJson<Policy>(response);
};

export const purchasePolicy = async (userId: string, premium: number, coverage: number): Promise<Policy> => {
  return parseJson<Policy>(
    await fetch(`${BASE_URL}/insurance/policy/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, premium, coverage }),
    }),
  );
};

export const sendHeartbeat = async (payload: HeartbeatPayload): Promise<void> => {
  await parseJson<void>(
    await fetch(`${BASE_URL}/insurance/worker/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
};

export const updateEnvironment = async (payload: AdminEnvironmentPayload) => {
  return parseJson(
    await fetch(`${BASE_URL}/admin/simulation/environment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
};

export const updateWorkerSimulation = async (userId: string, payload: WorkerOverridePayload) => {
  return parseJson(
    await fetch(`${BASE_URL}/admin/simulation/worker/${encodeURIComponent(userId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
};

export const getAdminUsers = async (): Promise<AdminWorker[]> => {
  return parseJson<AdminWorker[]>(await fetch(`${BASE_URL}/admin/users`));
};

export const getAdminMetrics = async (): Promise<AdminMetrics> => {
  return parseJson<AdminMetrics>(await fetch(`${BASE_URL}/admin/metrics`));
};

export const getAdminClaims = async (): Promise<AdminClaimRecord[]> => {
  return parseJson<AdminClaimRecord[]>(await fetch(`${BASE_URL}/admin/claims`));
};
