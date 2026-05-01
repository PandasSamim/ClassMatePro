import * as SQLite from 'expo-sqlite';

// Open the database synchronously
const dbName = 'classmatepro.db';

export const getDb = () => {
  return SQLite.openDatabaseSync(dbName);
};

export const initDatabase = () => {
  const db = getDb();
  
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      teacher_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      class_id INTEGER NOT NULL,
      status TEXT DEFAULT 'Enrolled',
      phone TEXT,
      guardian_name TEXT,
      guardian_phone TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes (id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL, -- 'present', 'absent', 'late'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id)
    );

    CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      month TEXT NOT NULL, -- e.g., 'October 2023'
      amount REAL NOT NULL,
      status TEXT NOT NULL, -- 'paid', 'due', 'waived'
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students (id)
    );
  `);

  // Check if we need to seed initial data
  const hasClasses = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM classes;');
  
  if (hasClasses && hasClasses.count === 0) {
    seedDatabase(db);
  }
};

const seedDatabase = (db: SQLite.SQLiteDatabase) => {
  try {
    db.execSync(`
      BEGIN TRANSACTION;
      
      -- Insert Classes
      INSERT INTO classes (id, name, teacher_name) VALUES (1, 'Class 10A', 'Mr. Anderson');
      INSERT INTO classes (id, name, teacher_name) VALUES (2, 'Class 10B', 'Mrs. Smith');
      INSERT INTO classes (id, name, teacher_name) VALUES (3, 'Class 11A', 'Ms. Davis');
      INSERT INTO classes (id, name, teacher_name) VALUES (4, 'Class 12 - Honors', 'Dr. Wilson');

      -- Insert Students
      INSERT INTO students (id, first_name, last_name, class_id, status, phone, guardian_name, guardian_phone) 
      VALUES (1, 'Emma', 'Carter', 1, 'Enrolled', '555-0101', 'John Carter', '555-0102');
      
      INSERT INTO students (id, first_name, last_name, class_id, status, phone, guardian_name, guardian_phone) 
      VALUES (2, 'James', 'Davis', 1, 'Enrolled', '555-0201', 'Mary Davis', '555-0202');
      
      INSERT INTO students (id, first_name, last_name, class_id, status, phone, guardian_name, guardian_phone) 
      VALUES (3, 'Sophia', 'Foster', 1, 'Absent', '555-0301', 'Robert Foster', '555-0302');
      
      INSERT INTO students (id, first_name, last_name, class_id, status, phone, guardian_name, guardian_phone, avatar_url) 
      VALUES (4, 'Sarah', 'Jenkins', 1, 'Enrolled', '555-123-4567', 'Michael Jenkins', '555-987-6543', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbVpIbpb_xLJDJ11yYoPzwtvkAfJhunSP1IDyFWu0lWXX8fMXIhGABNec_YzylmPaKc3t1mVTiR7HCiWTvPnrCe0yQpPv6iXeE5NU4MJK6uDa5UXEgsgvpaIzhdMnQaX32qJ8c3aQqnvbF1imyNZNHS9sjq7zjmi4hCH6MMZOWxZ6mVB2UUe9islPFPQmkuTIFY9SUK6CSG0K1dB-chsyDsLdgPGyMl-eo9VWHJNEVtNITIBY3uMBoGkHOjn1OQMrTLIkJ6TG2g24');

      -- Insert Attendance for Sarah Jenkins (Student 4)
      -- Just a few mock entries for stats
      INSERT INTO attendance (student_id, date, status) VALUES (4, '2023-10-01', 'present');
      INSERT INTO attendance (student_id, date, status) VALUES (4, '2023-10-02', 'present');
      INSERT INTO attendance (student_id, date, status) VALUES (4, '2023-10-03', 'absent');
      
      -- Insert Fees
      INSERT INTO fees (student_id, month, amount, status, due_date) VALUES (4, 'November 2023', 450.00, 'due', '2023-11-15');
      INSERT INTO fees (student_id, month, amount, status, due_date) VALUES (4, 'October 2023', 450.00, 'due', '2023-10-15');
      INSERT INTO fees (student_id, month, amount, status, due_date) VALUES (4, 'September 2023', 450.00, 'waived', '2023-09-15');
      INSERT INTO fees (student_id, month, amount, status, due_date) VALUES (4, 'August 2023', 150.00, 'paid', '2023-08-15');

      -- Add some global fees for Dashboard metrics mock
      INSERT INTO fees (student_id, month, amount, status) VALUES (1, 'October 2023', 450.00, 'paid');
      INSERT INTO fees (student_id, month, amount, status) VALUES (2, 'October 2023', 450.00, 'paid');
      INSERT INTO fees (student_id, month, amount, status) VALUES (3, 'October 2023', 450.00, 'due');

      COMMIT;
    `);
    console.log('Database seeded successfully');
  } catch (error) {
    db.execSync('ROLLBACK;');
    console.error('Error seeding database:', error);
  }
};
