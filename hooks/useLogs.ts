import { useCallback, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import {
  getHealthLogs,
  getHealthLogsByDate,
  updateHealthLog as updateHealthLogApi,
  deleteHealthLog as deleteHealthLogApi,
  getUserStats,
} from '../lib/supabase';
import { HealthLog } from '../types';

export function useLogs() {
  const {
    user,
    logs,
    stats,
    setLogs,
    updateLog,
    deleteLog,
    setStats,
  } = useAppStore();

  // Fetch logs on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchLogs();
      fetchStats();
    }
  }, [user?.id]);

  const fetchLogs = useCallback(
    async (limit = 50, offset = 0) => {
      if (!user) return;

      try {
        const fetchedLogs = await getHealthLogs(user.id, limit, offset);
        if (offset === 0) {
          setLogs(fetchedLogs);
        } else {
          setLogs([...logs, ...fetchedLogs]);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    },
    [user, logs, setLogs]
  );

  const fetchLogsByDate = useCallback(
    async (startDate: string, endDate: string) => {
      if (!user) return [];

      try {
        return await getHealthLogsByDate(user.id, startDate, endDate);
      } catch (error) {
        console.error('Error fetching logs by date:', error);
        return [];
      }
    },
    [user]
  );

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const fetchedStats = await getUserStats(user.id);
      setStats(fetchedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user, setStats]);

  const editLog = useCallback(
    async (id: string, updates: Partial<HealthLog>) => {
      try {
        const updatedLog = await updateHealthLogApi(id, updates);
        if (updatedLog) {
          updateLog(id, updatedLog);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error updating log:', error);
        return false;
      }
    },
    [updateLog]
  );

  const removeLog = useCallback(
    async (id: string) => {
      try {
        const success = await deleteHealthLogApi(id);
        if (success) {
          deleteLog(id);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error deleting log:', error);
        return false;
      }
    },
    [deleteLog]
  );

  // Get logs for a specific day
  const getLogsForDate = useCallback(
    (date: string) => {
      return logs.filter((log) => log.logged_at.startsWith(date));
    },
    [logs]
  );

  // Get today's logs
  const getTodaysLogs = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return getLogsForDate(today);
  }, [getLogsForDate]);

  // Group logs by date
  const getLogsGroupedByDate = useCallback(() => {
    const grouped: Record<string, HealthLog[]> = {};

    logs.forEach((log) => {
      const date = log.logged_at.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });

    // Sort dates in descending order
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map((date) => ({
      date,
      logs: grouped[date],
    }));
  }, [logs]);

  // Get category distribution
  const getCategoryDistribution = useCallback(() => {
    const distribution: Record<string, number> = {};

    logs.forEach((log) => {
      distribution[log.category] = (distribution[log.category] || 0) + 1;
    });

    return distribution;
  }, [logs]);

  return {
    logs,
    stats,
    fetchLogs,
    fetchLogsByDate,
    fetchStats,
    editLog,
    removeLog,
    getLogsForDate,
    getTodaysLogs,
    getLogsGroupedByDate,
    getCategoryDistribution,
  };
}
