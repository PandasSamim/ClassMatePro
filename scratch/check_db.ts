import * as SQLite from 'expo-sqlite';

async function checkAttendance() {
  const db = await SQLite.openDatabaseAsync('classmatepro.db');
  const result = await db.getAllAsync('SELECT status, COUNT(*) as count FROM attendance GROUP BY status');
  console.log('Attendance breakdown:', JSON.stringify(result, null, 2));
  
  const allData = await db.getAllAsync('SELECT * FROM attendance LIMIT 10');
  console.log('Sample attendance data:', JSON.stringify(allData, null, 2));
}

checkAttendance().catch(console.error);
