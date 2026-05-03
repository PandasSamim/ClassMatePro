import { useState, useCallback, useEffect, useRef } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export interface Class {
  id: number;
  name: string;
  teacher_name: string;
  monthly_fees: number;
  student_count?: number;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  class_id: number;
  status: string;
  phone: string;
  guardian_name: string;
  guardian_phone: string;
  avatar_url?: string;
  class_name?: string;
  name?: string;
  roll_number?: string;
  enrollment_date?: string;
  created_at?: string;
}

export const useStudents = () => {
  const db = useSQLiteContext();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await db.getAllAsync<Class>(`
        SELECT c.*, COUNT(s.id) as student_count 
        FROM classes c 
        LEFT JOIN students s ON c.id = s.class_id 
        GROUP BY c.id
      `);
      setClasses(result);
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to fetch classes:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [db]);

  const fetchStudents = useCallback(async (classId?: number, searchQuery?: string, limit: number = 20, offset: number = 0) => {
    setLoading(true);
    try {
      let query = `
        SELECT s.*, c.name as class_name 
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
      `;
      const params: any[] = [];
      
      if (classId) {
        query += ` WHERE s.class_id = ?`;
        params.push(classId);
      }
      
      if (searchQuery) {
        query += classId ? ` AND` : ` WHERE`;
        query += ` (s.first_name LIKE ? OR s.last_name LIKE ?)`;
        params.push(`%${searchQuery}%`, `%${searchQuery}%`);
      }

      query += ` ORDER BY s.first_name ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const result = await db.getAllAsync<Student>(query, params);
      const formatted = result.map(s => ({
        ...s,
        name: `${s.first_name} ${s.last_name}`,
        roll_number: `2024-${String(s.id).padStart(3, '0')}`
      }));

      setStudents(prev => offset === 0 ? formatted : [...prev, ...formatted]);
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to fetch students:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [db]);

  const fetchStudentById = useCallback(async (id: number): Promise<Student | null> => {
    if (!id || isNaN(id)) return null;
    try {
      const result = await db.getFirstAsync<Student>(`
        SELECT s.*, c.name as class_name 
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE s.id = ?
      `, [id]);
      return result ? {
        ...result,
        name: `${result.first_name} ${result.last_name}`,
        roll_number: `2024-${String(result.id).padStart(3, '0')}`
      } : null;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to fetch student:', error);
      }
      return null;
    }
  }, [db]);

  const addStudent = useCallback(async (student: Omit<Student, 'id'>) => {
    try {
      const { first_name, last_name, class_id, status, phone, guardian_name, guardian_phone, avatar_url, enrollment_date } = student;
      const creationDate = enrollment_date || new Date().toISOString();
      const result = await db.runAsync(`
        INSERT INTO students (first_name, last_name, class_id, status, phone, guardian_name, guardian_phone, avatar_url, enrollment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [first_name, last_name, class_id, status || 'Enrolled', phone, guardian_name, guardian_phone, avatar_url || null, creationDate]);
      
      await fetchStudents(class_id);
      await fetchClasses();
      return result.lastInsertRowId;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to add student:', error);
      }
      return false;
    }
  }, [db, fetchStudents, fetchClasses]);

  const addClass = useCallback(async (name: string, teacherName: string, monthlyFees: number = 0) => {
    try {
      await db.runAsync(`
        INSERT INTO classes (name, teacher_name, monthly_fees) VALUES (?, ?, ?)
      `, [name, teacherName, monthlyFees]);
      await fetchClasses();
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to add class:', error);
      }
      return false;
    }
  }, [db, fetchClasses]);

  const updateStudent = useCallback(async (id: number, student: Partial<Student>) => {
    try {
      const fields = Object.keys(student).filter(key => key !== 'id' && key !== 'class_name' && key !== 'name' && key !== 'roll_number');
      if (fields.length === 0) return true;
      const query = `UPDATE students SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
      const params = [...fields.map(f => (student as any)[f]), id];
      await db.runAsync(query, params);
      await fetchStudents();
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to update student:', error);
      }
      return false;
    }
  }, [db, fetchStudents]);

  const deleteStudent = useCallback(async (id: number) => {
    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM attendance WHERE student_id = ?', [id]);
        await db.runAsync('DELETE FROM fees WHERE student_id = ?', [id]);
        await db.runAsync('DELETE FROM results WHERE student_id = ?', [id]);
        await db.runAsync('DELETE FROM students WHERE id = ?', [id]);
      });
      await fetchStudents();
      await fetchClasses();
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to delete student:', error);
      }
      return false;
    }
  }, [db, fetchStudents, fetchClasses]);

  const deleteClass = useCallback(async (id: number) => {
    try {
      await db.withTransactionAsync(async () => {
        const classStudents = await db.getAllAsync<{id: number}>('SELECT id FROM students WHERE class_id = ?', [id]);
        for (const student of classStudents) {
          await db.runAsync('DELETE FROM attendance WHERE student_id = ?', [student.id]);
          await db.runAsync('DELETE FROM fees WHERE student_id = ?', [student.id]);
          await db.runAsync('DELETE FROM results WHERE student_id = ?', [student.id]);
        }
        await db.runAsync('DELETE FROM students WHERE class_id = ?', [id]);
        await db.runAsync('DELETE FROM classes WHERE id = ?', [id]);
      });
      await fetchClasses();
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('closed resource')) {
        console.error('Failed to delete class:', error);
      }
      return false;
    }
  }, [db, fetchClasses]);

  // Initial data fetch
  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      fetchClasses();
      fetchStudents();
      hasFetched.current = true;
    }
  }, [fetchClasses, fetchStudents]);

  return {
    classes,
    students,
    loading,
    fetchClasses,
    fetchStudents,
    fetchStudentById,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteClass,
    addClass,
  };
};
