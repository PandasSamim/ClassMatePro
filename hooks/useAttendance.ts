import { useState, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export interface AttendanceRecord {
  id: number;
  student_id: number;
  date: string;
  status: string;
  student_name?: string;
}

export interface MonthlyAttendanceSummary {
  student_id: number;
  student_name: string;
  attended: number;
  total_sessions: number;
  percentage: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'dayOff' | null;

export const useAttendance = () => {
  const db = useSQLiteContext();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendanceByDate = useCallback(async (date: string, classId?: number, limit: number = 30, offset: number = 0) => {
    if (!date) return;
    setLoading(true);
    try {
      let query = `
        SELECT a.*, s.first_name || ' ' || s.last_name as student_name 
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.date = ?
      `;
      const params: any[] = [date];
      if (classId && !isNaN(classId)) {
        query += ` AND s.class_id = ?`;
        params.push(classId);
      }
      
      query += ` ORDER BY s.first_name ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const result = await db.getAllAsync<AttendanceRecord>(query, params);
      setAttendance(prev => offset === 0 ? result : [...prev, ...result]);
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to fetch attendance:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [db]);

  const markAttendance = useCallback(async (studentId: number, date: string, status: string) => {
    if (!studentId || isNaN(studentId) || !date) return false;
    try {
      const existing = await db.getFirstAsync<AttendanceRecord>(
        'SELECT * FROM attendance WHERE student_id = ? AND date = ?', 
        [studentId, date]
      );
      if (existing) {
        await db.runAsync('UPDATE attendance SET status = ? WHERE id = ?', [status, existing.id]);
      } else {
        await db.runAsync('INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)', [studentId, date, status]);
      }
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to mark attendance:', error);
      }
      return false;
    }
  }, [db]);

  const markAllStatus = useCallback(async (studentIds: number[], date: string, status: string) => {
    if (!studentIds.length || !date) return false;
    try {
      await db.withTransactionAsync(async () => {
        for (const id of studentIds) {
          if (!id || isNaN(id)) continue;
          const existing = await db.getFirstAsync<AttendanceRecord>(
            'SELECT * FROM attendance WHERE student_id = ? AND date = ?', [id, date]
          );
          if (existing) {
            await db.runAsync('UPDATE attendance SET status = ? WHERE id = ?', [status, existing.id]);
          } else {
            await db.runAsync('INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)', [id, date, status]);
          }
        }
      });
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error(`Failed to mark all ${status}:`, error);
      }
      return false;
    }
  }, [db]);

  const fetchStudentStats = useCallback(async (studentId: number, startDate: string, endDate: string) => {
    if (!studentId || isNaN(studentId)) return { present: 0, total: 0 };
    try {
      const result = await db.getAllAsync<AttendanceRecord>(
        'SELECT status FROM attendance WHERE student_id = ? AND date BETWEEN ? AND ?',
        [studentId, startDate, endDate]
      );
      const total = result.length;
      const present = result.filter(a => a.status === 'present').length;
      return { present, total };
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to fetch student stats:', error);
      }
      return { present: 0, total: 0 };
    }
  }, [db]);

  const getMonthlyExpectedSessions = useCallback(async (classId?: number, month?: string): Promise<number> => {
    if (!month) month = new Date().toISOString().slice(0, 7);
    try {
      if (classId) {
        const result = await db.getFirstAsync<{ total_expected: number }>(
          'SELECT total_expected FROM class_sessions WHERE class_id = ? AND month = ?',
          [classId, month]
        );
        return result?.total_expected || 0;
      } else {
        const result = await db.getFirstAsync<{ max_expected: number }>(
          'SELECT MAX(total_expected) as max_expected FROM class_sessions WHERE month = ?',
          [month]
        );
        return result?.max_expected || 0;
      }
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to fetch expected sessions:', error);
      }
      return 0;
    }
  }, [db]);

  const setMonthlyExpectedSessions = useCallback(async (classId: number, month: string, total: number) => {
    try {
      await db.runAsync(`
        INSERT INTO class_sessions (class_id, month, total_expected)
        VALUES (?, ?, ?)
        ON CONFLICT(class_id, month) DO UPDATE SET total_expected = excluded.total_expected
      `, [classId, month, total]);
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to save expected sessions:', error);
      }
      return false;
    }
  }, [db]);

  const fetchClassMonthlySummary = useCallback(async (classId: number | undefined, month: string): Promise<MonthlyAttendanceSummary[]> => {
    setLoading(true);
    try {
      let totalSessions = await getMonthlyExpectedSessions(classId, month);
      
      if (totalSessions === 0) {
        const sessionsQuery = `
          SELECT COUNT(DISTINCT a.date) as count 
          FROM attendance a
          JOIN students s ON a.student_id = s.id
          WHERE strftime('%Y-%m', a.date) = ?
          ${classId ? 'AND s.class_id = ?' : ''}
        `;
        const sessionsResult = await db.getFirstAsync<{ count: number }>(
          sessionsQuery, 
          classId ? [month, classId] : [month]
        );
        totalSessions = sessionsResult?.count || 0;
      }
      
      let query = `
        SELECT 
          s.id as student_id,
          s.first_name || ' ' || s.last_name as student_name,
          COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), 0) as attended
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id AND strftime('%Y-%m', a.date) = ?
      `;
      
      const params: any[] = [month];
      if (classId) {
        query += ` WHERE s.class_id = ?`;
        params.push(classId);
      }
      
      query += ` GROUP BY s.id`;
      
      const result = await db.getAllAsync<{ 
        student_id: number, 
        student_name: string, 
        attended: number 
      }>(query, params);
 
      return result.map(r => ({
        ...r,
        total_sessions: totalSessions,
        percentage: totalSessions > 0 ? (r.attended / totalSessions) * 100 : 0
      }));
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to fetch monthly summary:', error);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [db, getMonthlyExpectedSessions]);

  return {
    attendance,
    loading,
    fetchAttendanceByDate,
    markAttendance,
    markAllStatus,
    fetchStudentStats,
    getMonthlyExpectedSessions,
    setMonthlyExpectedSessions,
    fetchClassMonthlySummary,
    dailyAttendance: attendance,
    fetchDailyAttendance: fetchAttendanceByDate,
    bulkMarkAttendance: markAllStatus,
  };
};
