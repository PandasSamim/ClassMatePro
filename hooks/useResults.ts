import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

export interface StudentResult {
  id: number;
  student_id: number;
  subject: string;
  marks: number;
  total_marks: number;
  term: string;
  date: string;
}

export function useResults() {
  const db = useSQLiteContext();
  const [results, setResults] = useState<StudentResult[]>([]);

  const fetchResultsByStudent = useCallback(async (studentId: number) => {
    try {
      const data = await db.getAllAsync<StudentResult>(
        'SELECT * FROM results WHERE student_id = ? ORDER BY date DESC, subject ASC',
        [studentId]
      );
      setResults(data);
      return data;
    } catch (error) {
      console.error('Fetch results failed:', error);
      return [];
    }
  }, [db]);

  const addResult = useCallback(async (studentId: number, subject: string, marks: number, totalMarks: number, term: string) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      await db.runAsync(
        'INSERT INTO results (student_id, subject, marks, total_marks, term, date) VALUES (?, ?, ?, ?, ?, ?)',
        [studentId, subject, marks, totalMarks, term, date]
      );
      await fetchResultsByStudent(studentId);
      return true;
    } catch (error) {
      console.error('Add result failed:', error);
      return false;
    }
  }, [db, fetchResultsByStudent]);

  const bulkAddResults = useCallback(async (studentId: number, subjects: { subject: string, marks: number }[], totalMarks: number, term: string) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      for (const item of subjects) {
        await db.runAsync(
          'INSERT INTO results (student_id, subject, marks, total_marks, term, date) VALUES (?, ?, ?, ?, ?, ?)',
          [studentId, item.subject, item.marks, totalMarks, term, date]
        );
      }
      await fetchResultsByStudent(studentId);
      return true;
    } catch (error) {
      console.error('Bulk add results failed:', error);
      return false;
    }
  }, [db, fetchResultsByStudent]);

  return {
    results,
    fetchResultsByStudent,
    addResult,
    bulkAddResults
  };
}
