// Location: ClassMatePro/hooks/useFees.ts
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';

export interface Fee {
  id: number;
  student_id: number;
  month: string; // Internal format: YYYY-MM
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  attendance_rate: number;
  status: 'paid' | 'partial' | 'due' | 'waived';
  due_date?: string;
  created_at: string;
}

export const useFees = () => {
  const db = useSQLiteContext();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFeesByStudent = useCallback(async (studentId: number, limit: number = 4, offset: number = 0) => {
    setLoading(true);
    try {
      // 1. Strictly ignore and hide the current month in the UI.
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // 3. Paginated transaction history records (including current month)
      const result = await db.getAllAsync<Fee>(`
        SELECT * FROM fees 
        WHERE student_id = ?
        ORDER BY month DESC
        LIMIT ? OFFSET ?
      `, [studentId, limit, offset]);

      console.log(`[Fee Fetch] Student ${studentId} loaded ${result.length} records at offset ${offset}.`);
      
      if (offset === 0) {
        setFees(result);
      } else {
        setFees(prev => [...prev, ...result]);
      }
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to fetch fees:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [db]);

  const fetchAllFeesByStudent = useCallback(async (studentId: number) => {
    try {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const result = await db.getAllAsync<Fee>(`
        SELECT * FROM fees 
        WHERE student_id = ?
        ORDER BY month DESC
      `, [studentId]);

      return result;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to fetch all fees:', error);
      }
      return [];
    }
  }, [db]);

  const processPayment = useCallback(async (feeId: number, amountPaid: number) => {
    try {
      const fee = await db.getFirstAsync<Fee>('SELECT * FROM fees WHERE id = ?', [feeId]);
      if (!fee) return false;

      const newPaidAmount = fee.paid_amount + amountPaid;
      const newDueAmount = Math.max(0, fee.total_amount - newPaidAmount);
      let newStatus: Fee['status'] = 'partial';

      if (newDueAmount === 0) {
        newStatus = 'paid';
      } else if (newPaidAmount === 0) {
        newStatus = 'due';
      }

      await db.runAsync(`
        UPDATE fees 
        SET paid_amount = ?, due_amount = ?, status = ? 
        WHERE id = ?
      `, [newPaidAmount, newDueAmount, newStatus, feeId]);

      await fetchFeesByStudent(fee.student_id);
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Payment failed:', error);
      }
      return false;
    }
  }, [db, fetchFeesByStudent]);

  const isCalculating = useRef<number | null>(null);

  const deduplicateFees = async (studentId: number) => {
    try {
      const allFees = await db.getAllAsync<Fee>('SELECT * FROM fees WHERE student_id = ?', [studentId]);
      const monthMap: { [key: string]: string } = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
        'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12'
      };

      const seen = new Map<string, Fee>();
      const toDelete: number[] = [];

      for (const fee of allFees) {
        let key = fee.month;
        if (key.includes(' ')) {
          const parts = key.split(' ');
          if (parts.length === 2) {
            const m = monthMap[parts[0].toLowerCase()];
            const y = parts[1];
            if (m && y) key = `${y}-${m}`;
          }
        }

        if (seen.has(key)) {
          const original = seen.get(key)!;
          const totalPaid = original.paid_amount + fee.paid_amount;
          const totalExpected = Math.max(original.total_amount, fee.total_amount);
          const newDue = Math.max(0, totalExpected - totalPaid);
          const newStatus = newDue === 0 ? 'paid' : (totalPaid > 0 ? 'partial' : original.status);

          await db.runAsync(`
            UPDATE fees SET month = ?, paid_amount = ?, due_amount = ?, total_amount = ?, status = ? WHERE id = ?
          `, [key, totalPaid, newDue, totalExpected, newStatus, original.id]);

          toDelete.push(fee.id);
        } else {
          seen.set(key, fee);
          if (key !== fee.month) {
            await db.runAsync('UPDATE fees SET month = ? WHERE id = ?', [key, fee.id]);
          }
        }
      }

      if (toDelete.length > 0) {
        const ids = toDelete.join(',');
        await db.runAsync(`DELETE FROM fees WHERE id IN (${ids})`);
      }
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Deduplication failed:', error);
      }
    }
  };

  const calculateFees = useCallback(async (studentId: number) => {
    if (isCalculating.current === studentId) return;
    try {
      isCalculating.current = studentId;

      await fetchFeesByStudent(studentId);
      await deduplicateFees(studentId);

      const student = await db.getFirstAsync<{ created_at: string, monthly_fees: number }>(`
        SELECT s.created_at, c.monthly_fees 
        FROM students s
        JOIN classes c ON s.class_id = c.id
        WHERE s.id = ?
      `, [studentId]);

      if (!student) {
        console.log(`[Fee Calc] Student ${studentId} not found.`);
        return;
      }

      // BULLETPROOF DATE PARSING
      let enrollmentDate: Date;
      try {
        if (!student.created_at) {
          enrollmentDate = new Date();
        } else if (!isNaN(Number(student.created_at))) {
          enrollmentDate = new Date(Number(student.created_at));
        } else {
          enrollmentDate = new Date(student.created_at.replace(' ', 'T'));
        }

        if (isNaN(enrollmentDate.getTime())) {
          enrollmentDate = new Date();
        }
      } catch (err) {
        console.error(`[Fee Calc] Date parse error for student ${studentId}:`, err);
        enrollmentDate = new Date();
      }

      console.log(`[Fee Calc] Processing student ${studentId}. Official Join Date:`, enrollmentDate.toISOString());

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const enrollmentMonthKey = `${enrollmentDate.getFullYear()}-${String(enrollmentDate.getMonth() + 1).padStart(2, '0')}`;

      // Cleanup pre-enrollment ghost records
      await db.runAsync(`
        DELETE FROM fees 
        WHERE student_id = ? 
        AND month < ? 
        AND paid_amount = 0
      `, [studentId, enrollmentMonthKey]);

      const existingFees = await db.getAllAsync<Fee>('SELECT * FROM fees WHERE student_id = ?', [studentId]);

      const attendanceSummaries = await db.getAllAsync<{ month_key: string, present: number, total: number, expected: number }>(`
        SELECT 
          strftime('%Y-%m', a.date) as month_key,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
          COUNT(*) as total,
          COALESCE(cs.total_expected, 0) as expected
        FROM attendance a
        LEFT JOIN students s ON a.student_id = s.id
        LEFT JOIN class_sessions cs ON s.class_id = cs.class_id AND strftime('%Y-%m', a.date) = cs.month
        WHERE a.student_id = ?
        GROUP BY month_key
      `, [studentId]);

      const summariesMap = new Map(attendanceSummaries.map(s => [s.month_key, s]));
      const monthMap: { [key: string]: string } = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
        'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12'
      };

      const standardizedFeesMap = new Map(existingFees.map(f => {
        let key = f.month;
        if (key.includes(' ')) {
          const parts = key.split(' ');
          if (parts.length === 2) {
            const m = monthMap[parts[0].toLowerCase()];
            const y = parts[1];
            if (m && y) key = `${y}-${m}`;
          }
        }
        return [key, f];
      }));

      // 2. Begin checking from exact Join Date up until the previous month
      let dateCursor = new Date(enrollmentDate.getFullYear(), enrollmentDate.getMonth(), 1);
      const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);

      let calculationCount = 0;

      await db.withTransactionAsync(async () => {
        while (dateCursor < startOfCurrentMonth) {
          const year = dateCursor.getFullYear();
          const month = dateCursor.getMonth();
          const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

          const stats = summariesMap.get(monthKey);
          const existing = standardizedFeesMap.get(monthKey);

          if (!existing || existing.status !== 'paid') {
            calculationCount++;
            const presentDays = stats?.present || 0;
            const expectedDays = stats?.expected || 0;
            const totalDaysInLog = stats?.total || 0;

            const baseDays = expectedDays > 0 ? expectedDays : totalDaysInLog;
            let attendanceRate = baseDays > 0 ? (presentDays / baseDays) : 0;

            let totalAmount = student.monthly_fees;
            let status: Fee['status'] = 'due';

            // 2b. If attendance is less than 10%, waive it. (If >10%, they pay).
            if (attendanceRate < 0.1) {
              status = 'waived';
              // Note: We intentionally DO NOT set totalAmount = 0 here anymore
              // so it still shows the class fee in the UI.
            }

            if (existing) {
              const paid = existing.paid_amount || 0;
              let due = Math.max(0, totalAmount - paid);

              let currentStatus: Fee['status'] = status;
              if (status === 'waived') {
                due = 0; // Force due amount to 0
                currentStatus = 'waived';
              } else if (paid > 0) {
                currentStatus = due === 0 ? 'paid' : 'partial';
              } else {
                currentStatus = due === 0 ? 'paid' : 'due';
              }

              await db.runAsync(`
                UPDATE fees 
                SET total_amount = ?, due_amount = ?, attendance_rate = ?, status = ? 
                WHERE id = ?
              `, [totalAmount, due, attendanceRate, currentStatus, existing.id]);
            } else {
              // If it's waived, they owe 0. Otherwise, they owe the full amount.
              const initialDue = status === 'waived' ? 0 : totalAmount;

              await db.runAsync(`
                INSERT INTO fees (student_id, month, total_amount, paid_amount, due_amount, attendance_rate, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `, [studentId, monthKey, totalAmount, 0, initialDue, attendanceRate, status]);
            }
          }
          dateCursor.setMonth(dateCursor.getMonth() + 1);
        }
      });

      console.log(`[Fee Calc] Finished loop. Processed ${calculationCount} historic months for student ${studentId}.`);
      await fetchFeesByStudent(studentId);
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Fee calculation error:', error);
      }
    } finally {
      isCalculating.current = null;
    }
  }, [db, fetchFeesByStudent]);

  const manualOverrideFee = useCallback(async (feeId: number, newTotal: number) => {
    try {
      const fee = await db.getFirstAsync<Fee>('SELECT * FROM fees WHERE id = ?', [feeId]);
      if (!fee) return false;

      const newDue = Math.max(0, newTotal - fee.paid_amount);
      const newStatus = newDue === 0 ? 'paid' : (fee.paid_amount > 0 ? 'partial' : 'due');

      await db.runAsync(`
        UPDATE fees 
        SET total_amount = ?, due_amount = ?, status = ? 
        WHERE id = ?
      `, [newTotal, newDue, newStatus, feeId]);

      await fetchFeesByStudent(fee.student_id);
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Override failed:', error);
      }
      return false;
    }
  }, [db, fetchFeesByStudent]);

  const addOrUpdateFee = useCallback(async (studentId: number, totalAmount: number, monthKey: string) => {
    try {
      // monthKey might be "January 2024", we need "2024-01"
      let standardizedKey = monthKey;
      if (monthKey.includes(' ')) {
        const parts = monthKey.split(' ');
        const monthMap: { [key: string]: string } = {
          'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
          'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12'
        };
        const m = monthMap[parts[0].toLowerCase()];
        const y = parts[1];
        if (m && y) standardizedKey = `${y}-${m}`;
      }

      const existing = await db.getFirstAsync<Fee>('SELECT * FROM fees WHERE student_id = ? AND month = ?', [studentId, standardizedKey]);
      
      if (existing) {
        const newDue = Math.max(0, totalAmount - existing.paid_amount);
        const newStatus = newDue === 0 ? 'paid' : (existing.paid_amount > 0 ? 'partial' : 'due');
        
        await db.runAsync(`
          UPDATE fees SET total_amount = ?, due_amount = ?, status = ? WHERE id = ?
        `, [totalAmount, newDue, newStatus, existing.id]);
      } else {
        await db.runAsync(`
          INSERT INTO fees (student_id, month, total_amount, paid_amount, due_amount, attendance_rate, status)
          VALUES (?, ?, ?, 0, ?, 0, 'due')
        `, [studentId, standardizedKey, totalAmount, totalAmount]);
      }
      
      await fetchFeesByStudent(studentId);
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Add/Update fee failed:', error);
      }
      return false;
    }
  }, [db, fetchFeesByStudent]);

  return {
    fees,
    fetchFeesByStudent,
    fetchAllFeesByStudent,
    processPayment,
    manualOverrideFee,
    addOrUpdateFee,
    calculateFees
  };
};