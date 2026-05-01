import { useState, useCallback } from 'react';
import { getDb } from '../services/database';

export interface Fee {
  id: number;
  student_id: number;
  month: string;
  amount: number;
  status: string;
  due_date: string;
}

export const useFees = () => {
  const [fees, setFees] = useState<Fee[]>([]);

  const fetchFeesByStudent = useCallback(async (studentId: number) => {
    try {
      const db = getDb();
      const result = await db.getAllAsync<Fee>(`
        SELECT * FROM fees WHERE student_id = ? ORDER BY id DESC
      `, [studentId]);
      setFees(result);
    } catch (error) {
      console.error('Failed to fetch fees:', error);
    }
  }, []);

  const addOrUpdateFee = async (studentId: number, amount: number, month: string) => {
    try {
      const db = getDb();
      
      // Check if fee exists for this month
      const existing = await db.getFirstAsync<Fee>('SELECT * FROM fees WHERE student_id = ? AND month = ?', [studentId, month]);
      
      if (existing) {
        // Update to paid
        await db.runAsync('UPDATE fees SET amount = ?, status = ? WHERE id = ?', [amount, 'paid', existing.id]);
      } else {
        // Create new paid record
        await db.runAsync(`
          INSERT INTO fees (student_id, month, amount, status) VALUES (?, ?, ?, ?)
        `, [studentId, month, amount, 'paid']);
      }
      return true;
    } catch (error) {
      console.error('Failed to update fee:', error);
      return false;
    }
  };

  return {
    fees,
    fetchFeesByStudent,
    addOrUpdateFee
  };
};
