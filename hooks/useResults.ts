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

export interface GradingRule {
  id: number;
  min_percentage: number;
  grade_symbol: string;
}

export function useResults() {
  const db = useSQLiteContext();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [gradingRules, setGradingRules] = useState<GradingRule[]>([]);

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

  const fetchGradingRules = useCallback(async () => {
    try {
      const data = await db.getAllAsync<GradingRule>(
        'SELECT * FROM grading_rules ORDER BY min_percentage DESC'
      );
      
      // If no rules exist, return defaults and optionally seed them
      if (data.length === 0) {
        const defaults = [
          { id: 1, min_percentage: 90, grade_symbol: 'A+' },
          { id: 2, min_percentage: 80, grade_symbol: 'A' },
          { id: 3, min_percentage: 70, grade_symbol: 'B' },
          { id: 4, min_percentage: 60, grade_symbol: 'C' },
          { id: 5, min_percentage: 50, grade_symbol: 'D' },
          { id: 6, min_percentage: 0, grade_symbol: 'F' },
        ];
        setGradingRules(defaults);
        return defaults;
      }

      setGradingRules(data);
      return data;
    } catch (error) {
      console.error('Fetch grading rules failed:', error);
      return [];
    }
  }, [db]);

  const updateGradingRules = useCallback(async (rules: Omit<GradingRule, 'id'>[]) => {
    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM grading_rules');
        for (const rule of rules) {
          await db.runAsync(
            'INSERT INTO grading_rules (min_percentage, grade_symbol) VALUES (?, ?)',
            [rule.min_percentage, rule.grade_symbol]
          );
        }
      });
      await fetchGradingRules();
      return true;
    } catch (error) {
      console.error('Update grading rules failed:', error);
      return false;
    }
  }, [db, fetchGradingRules]);

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

  const updateResult = useCallback(async (id: number, studentId: number, subject: string, marks: number, totalMarks: number, term: string) => {
    try {
      await db.runAsync(
        'UPDATE results SET subject = ?, marks = ?, total_marks = ?, term = ? WHERE id = ?',
        [subject, marks, totalMarks, term, id]
      );
      await fetchResultsByStudent(studentId);
      return true;
    } catch (error) {
      console.error('Update result failed:', error);
      return false;
    }
  }, [db, fetchResultsByStudent]);

  const deleteResult = useCallback(async (id: number, studentId: number) => {
    try {
      await db.runAsync('DELETE FROM results WHERE id = ?', [id]);
      await fetchResultsByStudent(studentId);
      return true;
    } catch (error) {
      console.error('Delete result failed:', error);
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
    gradingRules,
    fetchResultsByStudent,
    fetchGradingRules,
    updateGradingRules,
    addResult,
    updateResult,
    deleteResult,
    bulkAddResults
  };
}
