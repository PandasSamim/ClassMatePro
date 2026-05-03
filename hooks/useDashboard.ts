import { useState, useCallback, useRef, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export interface DashboardMetrics {
  totalFeesCollected: number;
  totalDues: number;
  totalStudents: number;
  attendancePercentage: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ClassSeries {
  className: string;
  data: ChartDataPoint[];
  color: string;
}

export interface AttendanceBreakdown {
  grade: string;
  percentage: number;
}

export const useDashboard = () => {
  const db = useSQLiteContext();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalFeesCollected: 0,
    totalDues: 0,
    totalStudents: 0,
    attendancePercentage: 0,
  });
  const [chartData, setChartData] = useState<ClassSeries[]>([]);
  const [attendanceBreakdown, setAttendanceBreakdown] = useState<AttendanceBreakdown[]>([]);
  
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const fetchBaseMetrics = useCallback(async (year?: number, month?: number) => {
    setLoadingMetrics(true);
    try {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const targetMonthKey = (year && month) ? `${year}-${String(month).padStart(2, '0')}` : currentMonthKey;

      const [studentsResult, feesResult] = await Promise.all([
        db.getAllAsync<{ status: string }>('SELECT status FROM students'),
        db.getAllAsync<{ paid_amount: number, due_amount: number }>(
          `SELECT paid_amount, due_amount FROM fees WHERE month <= ?`, [targetMonthKey]
        )
      ]);

      const totalStudents = studentsResult.length;
      const totalCollected = feesResult.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
      const totalDues = feesResult.reduce((sum, f) => sum + (f.due_amount || 0), 0);

      const attendanceStats = await db.getFirstAsync<{ total: number, present: number }>(`
        SELECT COUNT(*) as total, SUM(CASE WHEN LOWER(status) = 'present' THEN 1 ELSE 0 END) as present
        FROM attendance 
        WHERE date >= date('now', '-30 days') AND LOWER(status) != 'dayoff'
      `);

      setMetrics({
        totalFeesCollected: totalCollected,
        totalDues: totalDues,
        totalStudents,
        attendancePercentage: (attendanceStats?.total || 0) > 0 ? (attendanceStats!.present / attendanceStats!.total) * 100 : 0,
      });
    } catch (error) {
      console.error('Failed to fetch base metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  }, [db]);

  const fetchChartData = useCallback(async (year?: number, month?: number) => {
    setLoadingCharts(true);
    try {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      let startDateKey = (year && month) ? `${year}-${String(Math.max(1, month - 2)).padStart(2, '0')}` : `${now.getFullYear()}-01`;
      let endDateKey = (year && month) ? `${year}-${String(Math.min(12, month + 2)).padStart(2, '0')}` : currentMonthKey;

      const rawChartResult = await db.getAllAsync<{ month: string, class_name: string, amount: number }>(`
        SELECT 
          f.month, 
          c.name as class_name, 
          SUM(f.paid_amount) as amount 
        FROM fees f
        JOIN students s ON f.student_id = s.id
        JOIN classes c ON s.class_id = c.id
        WHERE f.month BETWEEN ? AND ?
        GROUP BY f.month, c.name
        ORDER BY f.month ASC
      `, [startDateKey, endDateKey]);

      const classMap: { [key: string]: ChartDataPoint[] } = {};
      rawChartResult.forEach(row => {
        if (!classMap[row.class_name]) classMap[row.class_name] = [];
        classMap[row.class_name].push({ label: row.month.split('-')[1], value: row.amount });
      });

      const colors = ['#1a56db', '#7e22ce', '#059669', '#d97706', '#dc2626', '#2563eb'];
      const processedSeries = Object.keys(classMap).map((className, idx) => ({
        className,
        data: classMap[className],
        color: colors[idx % colors.length]
      }));

      setChartData(processedSeries);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoadingCharts(false);
    }
  }, [db]);

  const fetchAttendanceBreakdown = useCallback(async () => {
    setLoadingAttendance(true);
    try {
      const breakdownResult = await db.getAllAsync<AttendanceBreakdown>(`
        SELECT 
          c.name as grade,
          (SUM(CASE WHEN LOWER(a.status) = 'present' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) as percentage
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN classes c ON s.class_id = c.id
        WHERE a.date >= date('now', '-30 days') AND LOWER(a.status) != 'dayoff'
        GROUP BY c.id
        ORDER BY percentage DESC
      `);
      setAttendanceBreakdown(breakdownResult);
    } catch (error) {
      console.error('Failed to fetch attendance breakdown:', error);
    } finally {
      setLoadingAttendance(false);
    }
  }, [db]);

  const fetchMetrics = useCallback(async (range: string = '90d', year?: number, month?: number) => {
    await fetchBaseMetrics(year, month);
    fetchChartData(year, month);
    fetchAttendanceBreakdown();
  }, [fetchBaseMetrics, fetchChartData, fetchAttendanceBreakdown]);

  return {
    metrics,
    chartData,
    attendanceBreakdown,
    loadingMetrics,
    loadingCharts,
    loadingAttendance,
    fetchMetrics,
    fetchBaseMetrics,
    fetchChartData,
    fetchAttendanceBreakdown
  };
};
