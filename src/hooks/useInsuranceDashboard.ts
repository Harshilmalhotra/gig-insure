import { useMemo, useState } from 'react';
import * as api from '@/lib/api';

export type Toast = {
  message: string;
  type: 'success' | 'error' | 'info';
};

const defaultTelemetry: api.HeartbeatPayload = {
  userId: 'worker-123',
  ordersPerHour: 1.2,
  motion: 'moving',
  gpsPattern: 'smooth',
  earnings: 850,
};

export const useInsuranceDashboard = () => {
  const [userId, setUserId] = useState('worker-123');
  const [quote, setQuote] = useState<api.Quote | null>(null);
  const [policy, setPolicy] = useState<api.Policy | null>(null);
  const [telemetry, setTelemetry] = useState<api.HeartbeatPayload>(defaultTelemetry);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [adminEnvironment, setAdminEnvironment] = useState<api.AdminEnvironmentPayload>({
    rain: 8,
    temperature: 30,
    aqi: 55,
    demandLevel: 'medium',
    platformStatus: 'NORMAL',
  });
  const [workerOverride, setWorkerOverride] = useState<api.WorkerOverridePayload>({
    forcedOrdersPerHour: null,
    forcedMotion: null,
    forcedGpsPattern: null,
  });

  const flushToast = () => setTimeout(() => setToast(null), 4000);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type });
    flushToast();
  };

  const safeAction = async (callback: () => Promise<void>) => {
    setLoading(true);
    try {
      await callback();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadQuote = async () => {
    await safeAction(async () => {
      const result = await api.getQuote(userId);
      setQuote(result);
      showToast('Quote loaded successfully.');
    });
  };

  const loadPolicy = async () => {
    await safeAction(async () => {
      const result = await api.getActivePolicy(userId);
      setPolicy(result);
      if (result) {
        showToast('Active policy loaded successfully.');
      } else {
        showToast('No active policy found for this worker.', 'info');
      }
    });
  };

  const purchasePolicy = async (premium: number, coverage: number) => {
    await safeAction(async () => {
      const result = await api.purchasePolicy(userId, premium, coverage);
      setPolicy(result);
      showToast('Policy purchased successfully.');
    });
  };

  const submitHeartbeat = async () => {
    await safeAction(async () => {
      await api.sendHeartbeat({ ...telemetry, userId });
      showToast('Worker heartbeat submitted. Backend decision engine processed telemetry.');
    });
  };

  const updateEnvironment = async () => {
    await safeAction(async () => {
      await api.updateEnvironment(adminEnvironment);
      showToast('Simulation environment updated.');
    });
  };

  const updateWorkerSimulation = async () => {
    await safeAction(async () => {
      await api.updateWorkerSimulation(userId, workerOverride);
      showToast('Worker override values applied successfully.');
    });
  };

  const trustScore = useMemo(() => {
    const base = quote ? Math.max(0, 100 - quote.riskScore * 80) : 70;
    const motion = telemetry.motion === 'moving' ? 8 : -15;
    const gps = telemetry.gpsPattern === 'smooth' ? 8 : -20;
    const demand = Math.min(16, telemetry.ordersPerHour * 4);
    return Math.max(0, Math.min(100, Math.round(base + motion + gps + demand)));
  }, [quote, telemetry]);

  const trustLevel = useMemo<'High' | 'Medium' | 'Low'>(() => {
    if (trustScore >= 70) return 'High';
    if (trustScore >= 40) return 'Medium';
    return 'Low';
  }, [trustScore]);

  const scoreBreakdown = useMemo(() => {
    if (quote?.breakdown) {
      return quote.breakdown;
    }
    return {
      motion: telemetry.motion === 'moving' ? 0.28 : 0.08,
      gpsConsistency: telemetry.gpsPattern === 'smooth' ? 0.26 : 0.06,
      ordersRate: Math.min(0.3, ((telemetry.ordersPerHour ?? 1) / 6) * 0.3),
      weather: Math.max(0, 1 - ((telemetry.motion === 'moving' ? 0.28 : 0.08) + (telemetry.gpsPattern === 'smooth' ? 0.26 : 0.06) + Math.min(0.3, ((telemetry.ordersPerHour ?? 1) / 6) * 0.3))),
    };
  }, [quote, telemetry]);

  return {
    loading,
    toast,
    userId,
    setUserId,
    quote,
    policy,
    telemetry,
    setTelemetry,
    adminEnvironment,
    setAdminEnvironment,
    workerOverride,
    setWorkerOverride,
    trustScore,
    trustLevel,
    scoreBreakdown,
    loadQuote,
    loadPolicy,
    purchasePolicy,
    submitHeartbeat,
    updateEnvironment,
    updateWorkerSimulation,
  };
};
