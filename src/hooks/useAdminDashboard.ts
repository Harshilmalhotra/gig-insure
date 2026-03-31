import { useEffect, useState } from 'react';
import * as api from '@/lib/api';

export type Toast = {
  message: string;
  type: 'success' | 'error' | 'info';
};

const defaultEnvironment: api.AdminEnvironmentPayload = {
  rain: 18,
  temperature: 28,
  aqi: 48,
  demandLevel: 'medium',
  platformStatus: 'NORMAL',
};

const defaultWorkerOverride: api.WorkerOverridePayload = {
  forcedOrdersPerHour: null,
  forcedMotion: null,
  forcedGpsPattern: null,
};

export const useAdminDashboard = () => {
  const [workerId, setWorkerId] = useState('worker-123');
  const [environment, setEnvironment] = useState<api.AdminEnvironmentPayload>(defaultEnvironment);
  const [workerOverride, setWorkerOverride] = useState<api.WorkerOverridePayload>(defaultWorkerOverride);
  const [users, setUsers] = useState<api.AdminWorker[]>([]);
  const [metrics, setMetrics] = useState<api.AdminMetrics | null>(null);
  const [claims, setClaims] = useState<api.AdminClaimRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
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
      const message = error instanceof Error ? error.message : 'Unexpected admin error';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshAdminData = async () => {
    setDataLoading(true);
    try {
      const [usersResponse, metricsResponse, claimsResponse] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminMetrics(),
        api.getAdminClaims(),
      ]);
      setUsers(usersResponse);
      setMetrics(metricsResponse);
      setClaims(claimsResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load admin data';
      showToast(message, 'error');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    void refreshAdminData();
  }, []);

  const applyEnvironment = async () => {
    await safeAction(async () => {
      await api.updateEnvironment(environment);
      showToast('Environment simulation updated.');
      await refreshAdminData();
    });
  };

  const applyWorkerOverride = async () => {
    if (!workerId.trim()) {
      showToast('Please enter a worker ID to override.', 'error');
      return;
    }

    await safeAction(async () => {
      await api.updateWorkerSimulation(workerId, workerOverride);
      showToast('Worker override applied successfully.');
      await refreshAdminData();
    });
  };

  return {
    workerId,
    setWorkerId,
    environment,
    setEnvironment,
    workerOverride,
    setWorkerOverride,
    users,
    metrics,
    claims,
    loading,
    dataLoading,
    toast,
    refreshAdminData,
    applyEnvironment,
    applyWorkerOverride,
  };
};
