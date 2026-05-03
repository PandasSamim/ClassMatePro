import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'classmatepro.db';

export async function clearDatabase(db: SQLite.SQLiteDatabase) {
  try {
    console.log('Clearing all database data...');
    await db.runAsync('DELETE FROM attendance');
    await db.runAsync('DELETE FROM fees');
    await db.runAsync('DELETE FROM results');
    await db.runAsync('DELETE FROM students');
    await db.runAsync('DELETE FROM classes');
    await db.runAsync('DELETE FROM settings');
    await db.runAsync("DELETE FROM sqlite_sequence WHERE name IN ('attendance', 'fees', 'results', 'students', 'classes', 'settings')");
    return true;
  } catch (error) {
    console.error('Clear failed:', error);
    return false;
  }
}

export async function resetAndSeed(db: SQLite.SQLiteDatabase) {
  try {
    console.log('Resetting database...');
    await db.runAsync('DELETE FROM attendance');
    await db.runAsync('DELETE FROM fees');
    await db.runAsync('DELETE FROM results');
    await db.runAsync('DELETE FROM students');
    await db.runAsync('DELETE FROM classes');
    await db.runAsync('DELETE FROM settings');
    
    // Reset auto-increment counters
    await db.runAsync("DELETE FROM sqlite_sequence WHERE name IN ('attendance', 'fees', 'results', 'students', 'classes', 'settings')");

    await seedDatabase(db, true); // Force seed
    return true;
  } catch (error) {
    console.error('Reset failed:', error);
    return false;
  }
}

export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  console.log('Database migration started...');
  
  // Give the native bridge a tiny moment to settle
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    // Basic table creation
    await db.runAsync("CREATE TABLE IF NOT EXISTS classes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, teacher_name TEXT, monthly_fees REAL DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    await db.runAsync("CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, class_id INTEGER NOT NULL, status TEXT DEFAULT 'Enrolled', phone TEXT, guardian_name TEXT, guardian_phone TEXT, avatar_url TEXT, enrollment_date TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE)");
    
    // Indices
    try {
      await db.runAsync("CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id)");
      await db.runAsync("CREATE INDEX IF NOT EXISTS idx_students_status ON students(status)");
    } catch (e) {
      console.warn('Index creation skipped or already exists');
    }

    // Other tables
    await db.runAsync("CREATE TABLE IF NOT EXISTS attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE)");
    await db.runAsync(`CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      student_id INTEGER NOT NULL, 
      month TEXT NOT NULL, 
      total_amount REAL NOT NULL, 
      paid_amount REAL DEFAULT 0,
      due_amount REAL NOT NULL,
      attendance_rate REAL DEFAULT 0,
      status TEXT NOT NULL, 
      due_date TEXT, 
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
      FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
    )`);
    await db.runAsync("CREATE TABLE IF NOT EXISTS results (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, subject TEXT NOT NULL, marks INTEGER NOT NULL, total_marks INTEGER DEFAULT 100, term TEXT NOT NULL, date TEXT NOT NULL, FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE)");
    await db.runAsync("CREATE TABLE IF NOT EXISTS class_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id INTEGER NOT NULL, month TEXT NOT NULL, total_expected INTEGER DEFAULT 0, UNIQUE(class_id, month), FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE)");
    await db.runAsync("CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, admin_name TEXT NOT NULL, admin_email TEXT, admin_avatar TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");

    try {
      const tableInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(classes)');
      const hasMonthlyFees = tableInfo.some(col => col.name === 'monthly_fees');
      if (!hasMonthlyFees) {
        await db.runAsync('ALTER TABLE classes ADD COLUMN monthly_fees REAL DEFAULT 0');
      }

      const studentInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(students)');
      const hasEnrollmentDate = studentInfo.some(col => col.name === 'enrollment_date');
      if (!hasEnrollmentDate) {
        console.log('Adding enrollment_date to students table...');
        await db.runAsync('ALTER TABLE students ADD COLUMN enrollment_date TEXT');
        // Set default enrollment date to created_at for existing students
        await db.runAsync('UPDATE students SET enrollment_date = created_at WHERE enrollment_date IS NULL');
      }

      const settingsInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(settings)');
      const hasAvatar = settingsInfo.some(col => col.name === 'admin_avatar');
      if (!hasAvatar) {
        console.log('Migrating settings table to new schema...');
        await db.runAsync('DROP TABLE IF EXISTS settings');
        await db.runAsync("CREATE TABLE settings (id INTEGER PRIMARY KEY AUTOINCREMENT, admin_name TEXT NOT NULL, admin_email TEXT, admin_avatar TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
      }

      const feesInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(fees)');
      const hasPaidAmount = feesInfo.some(col => col.name === 'paid_amount');
      if (!hasPaidAmount) {
        console.log("Migrating fees table to new schema...");
        await db.runAsync('ALTER TABLE fees RENAME TO fees_old');
        await db.runAsync(`CREATE TABLE fees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          month TEXT NOT NULL,
          total_amount REAL NOT NULL, 
          paid_amount REAL DEFAULT 0,
          due_amount REAL NOT NULL,
          attendance_rate REAL DEFAULT 0,
          status TEXT CHECK(status IN ('paid', 'due', 'partial', 'waived')) DEFAULT 'due',
          due_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(student_id, month),
          FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
        )`);

        // Migrate and transform data
        const oldFees = await db.getAllAsync<{id: number, student_id: number, month: string, amount: number, status: string, due_date: string, created_at: string}>('SELECT * FROM fees_old');
        
        const monthMap: {[key: string]: string} = {
          'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
          'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12'
        };

        for (const fee of oldFees) {
          let monthKey = fee.month;
          // If it's in 'Month YYYY' format, convert it
          if (fee.month.includes(' ')) {
            const parts = fee.month.split(' ');
            if (parts.length === 2) {
              const m = monthMap[parts[0].toLowerCase()];
              const y = parts[1];
              if (m && y) monthKey = `${y}-${m}`;
            }
          }

          const paid = fee.status === 'paid' ? fee.amount : 0;
          const due = fee.status === 'paid' ? 0 : fee.amount;
          
          try {
            await db.runAsync(`INSERT INTO fees (student_id, month, total_amount, paid_amount, due_amount, status, due_date, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
              [fee.student_id, monthKey, fee.amount, paid, due, fee.status, fee.due_date, fee.created_at]
            );
          } catch (e) {
            console.warn(`Skipping duplicate migration for ${fee.student_id} - ${monthKey}`);
          }
        }
        await db.runAsync('DROP TABLE fees_old');
        console.log("Migration complete.");
      }

      // Final cleanup: convert any remaining legacy month formats to YYYY-MM
      const legacyFees = await db.getAllAsync<{id: number, month: string, student_id: number}>(
        "SELECT id, month, student_id FROM fees WHERE month LIKE '% %' OR month LIKE 'Invalid%'"
      );
      if (legacyFees.length > 0) {
        console.log(`Found ${legacyFees.length} legacy records, cleaning up...`);
        const monthMap: {[key: string]: string} = {
          'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
          'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12'
        };
        for (const fee of legacyFees) {
          let cleanMonth = fee.month.replace('Invalid Date ', '');
          let newKey = cleanMonth;

          if (cleanMonth.includes(' ')) {
            const parts = cleanMonth.split(' ');
            if (parts.length === 2) {
              const m = monthMap[parts[0].toLowerCase()];
              const y = parts[1];
              if (m && y) newKey = `${y}-${m}`;
            }
          }

          if (newKey !== fee.month) {
            try {
              // Try to update to new format
              await db.runAsync('UPDATE fees SET month = ? WHERE id = ?', [newKey, fee.id]);
            } catch (e) {
              // If unique constraint fails (already exists), delete the duplicate
              console.warn(`Duplicate found for ${fee.student_id} - ${newKey}, merging...`);
              await db.runAsync('DELETE FROM fees WHERE id = ?', [fee.id]);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Migration check failed, skipping', e);
    }
    
    console.log('Database migration successful');
  } catch (error) {
    console.error('Critical migration error:', error);
  }
}

async function seedDatabase(db: SQLite.SQLiteDatabase, force: boolean = false) {
  try {
    if (!force) {
      const classCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM classes');
      if (classCount && classCount.count > 0) {
        console.log('Database already has data, skipping seed');
        return;
      }
    }

    console.log('Seeding mock data...');

    // 1. Create Classes
    await db.runAsync("INSERT INTO classes (name, teacher_name, monthly_fees) VALUES ('Class 10-A', 'Mr. John Smith', 150)");
    await db.runAsync("INSERT INTO classes (name, teacher_name, monthly_fees) VALUES ('Class 9-B', 'Ms. Sarah Wilson', 120)");

    // 2. Create Students
    // Alex: Perfect Attendance
    await db.runAsync(`INSERT INTO students (first_name, last_name, class_id, status, phone, guardian_name, guardian_phone) 
      VALUES ('Alex', 'Johnson', 1, 'Active', '555-0101', 'Robert Johnson', '555-0102')`);
    
    // Emily: Low Attendance (to test Waived logic)
    await db.runAsync(`INSERT INTO students (first_name, last_name, class_id, status, phone, guardian_name, guardian_phone) 
      VALUES ('Emily', 'Davis', 1, 'Active', '555-0201', 'Mary Davis', '555-0202')`);
    
    // Michael: Normal Attendance
    await db.runAsync(`INSERT INTO students (first_name, last_name, class_id, status, phone, guardian_name, guardian_phone) 
      VALUES ('Michael', 'Brown', 2, 'Active', '555-0301', 'Linda Brown', '555-0302')`);

    // 3. Create Attendance Records for the last 20 days
    const today = new Date();
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Alex: Present every day
      await db.runAsync('INSERT INTO attendance (student_id, date, status) VALUES (1, ?, "present")', [dateStr]);

      // Emily: Present only on 1 day (5% attendance -> should trigger waive)
      const emilyStatus = i === 10 ? 'present' : 'absent';
      await db.runAsync('INSERT INTO attendance (student_id, date, status) VALUES (2, ?, ?)', [dateStr, emilyStatus]);

      // Michael: Mixed
      const michaelStatus = i % 3 === 0 ? 'absent' : 'present';
      await db.runAsync('INSERT INTO attendance (student_id, date, status) VALUES (3, ?, ?)', [dateStr, michaelStatus]);
    }

    // 4. Add some results
    await db.runAsync("INSERT INTO results (student_id, subject, marks, total_marks, term, date) VALUES (1, 'Mathematics', 95, 100, 'First Term', ?)", [today.toISOString().split('T')[0]]);
    await db.runAsync("INSERT INTO results (student_id, subject, marks, total_marks, term, date) VALUES (1, 'Physics', 88, 100, 'First Term', ?)", [today.toISOString().split('T')[0]]);

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}
