import { useState, useCallback } from 'react';
import { getDb } from '../services/database';

export interface DashboardMetrics {
  totalFeesCollected: number;
  totalDues: number;
  totalStudents: number;
  attendancePercentage: number;
}

export const useDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalFeesCollected: 0,
    totalDues: 0,
    totalStudents: 0,
    attendancePercentage: 0,
  });

  const fetchMetrics = useCallback(async () => {
    try {
      const db = getDb();
      
      const studentsQuery = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM students');
      const totalStudents = studentsQuery?.count || 0;

      const feesCollectedQuery = await db.getFirstAsync<{ total: number }>("SELECT SUM(amount) as total FROM fees WHERE status = 'paid'");
      const totalFeesCollected = feesCollectedQuery?.total || 0;

      const duesQuery = await db.getFirstAsync<{ total: number }>("SELECT SUM(amount) as total FROM fees WHERE status = 'due'");
      const totalDues = duesQuery?.total || 0;

      const attendanceQuery = await db.getFirstAsync<{ present: number, total: number }>(`
        SELECT 
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
          COUNT(*) as total
        FROM attendance
      `);
      
      let attendancePercentage = 0;
      if (attendanceQuery && attendanceQuery.total > 0) {
        attendancePercentage = (attendanceQuery.present / attendanceQuery.total) * 100;
      }

      setMetrics({
        totalFeesCollected,
        totalDues,
        totalStudents,
        attendancePercentage,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    }
  }, []);

  return {
    metrics,
    fetchMetrics,
  };
};
