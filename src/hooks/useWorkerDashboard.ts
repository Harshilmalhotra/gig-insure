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

export const useWorkerDashboard = () => {
  const [userId, setUserId] = useState('worker-123');
  const [quote, setQuote] = useState<api.Quote | null>(null);
  const [policy, setPolicy] = useState<api.Policy | null>(null);
  const [telemetry, setTelemetry] = useState<api.HeartbeatPayload>(defaultTelemetry);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

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
      const message = error instanceof Error ? error.message : 'Something went wrong';
      showToast(message, 'error');
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
      showToast(result ? 'Active policy loaded successfully.' : 'No active policy found.', 'info');
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
      showToast('Telemetry submitted successfully.');
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

  const scoreBreakdown = useMemo<api.RiskBreakdown>(() => {
    if (quote?.breakdown) {
      return quote.breakdown;
    }

    const motion = telemetry.motion === 'moving' ? 0.28 : 0.08;
    const gpsConsistency = telemetry.gpsPattern === 'smooth' ? 0.26 : 0.06;
    const ordersRate = Math.min(0.3, (telemetry.ordersPerHour / 6) * 0.3);
    const weather = Math.max(0, 1 - (motion + gpsConsistency + ordersRate));

    return {
      motion,
      gpsConsistency,
      ordersRate,
      weather,
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
    trustScore,
    trustLevel,
    scoreBreakdown,
    loadQuote,
    loadPolicy,
    purchasePolicy,
    submitHeartbeat,
  };
};
