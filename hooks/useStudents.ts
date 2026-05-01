import { useState, useCallback, useEffect } from 'react';
import { getDb } from '../services/database';

export interface Class {
  id: number;
  name: string;
  teacher_name: string;
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
}

export const useStudents = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      const db = getDb();
      const result = await db.getAllAsync<Class>(`
        SELECT c.*, COUNT(s.id) as student_count 
        FROM classes c 
        LEFT JOIN students s ON c.id = s.class_id 
        GROUP BY c.id
      `);
      setClasses(result);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  }, []);

  const fetchStudents = useCallback(async (classId?: number, searchQuery?: string) => {
    try {
      const db = getDb();
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

      const result = await db.getAllAsync<Student>(query, params);
      setStudents(result);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  }, []);

  const fetchStudentById = async (id: number): Promise<Student | null> => {
    try {
      const db = getDb();
      const result = await db.getFirstAsync<Student>(`
        SELECT s.*, c.name as class_name 
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE s.id = ?
      `, [id]);
      return result;
    } catch (error) {
      console.error('Failed to fetch student:', error);
      return null;
    }
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    try {
      const db = getDb();
      await db.runAsync(`
        INSERT INTO students (first_name, last_name, class_id, status, phone, guardian_name, guardian_phone, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        student.first_name, 
        student.last_name, 
        student.class_id, 
        student.status || 'Enrolled', 
        student.phone, 
        student.guardian_name, 
        student.guardian_phone,
        student.avatar_url
      ]);
      await fetchStudents();
      await fetchClasses();
      return true;
    } catch (error) {
      console.error('Failed to add student:', error);
      return false;
    }
  };

  const addClass = async (name: string, teacherName: string) => {
    try {
      const db = getDb();
      await db.runAsync(`
        INSERT INTO classes (name, teacher_name) VALUES (?, ?)
      `, [name, teacherName]);
      await fetchClasses();
      return true;
    } catch (error) {
      console.error('Failed to add class:', error);
      return false;
    }
  };

  return {
    classes,
    students,
    loading,
    fetchClasses,
    fetchStudents,
    fetchStudentById,
    addStudent,
    addClass,
  };
};
