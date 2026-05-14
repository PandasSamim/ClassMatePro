import * as SQLite from 'expo-sqlite';

async function checkFees() {
  const db = await SQLite.openDatabaseAsync('classmatepro.db');
  const students = await db.getAllAsync('SELECT id, first_name, enrollment_date FROM students');
  console.log('Students:', JSON.stringify(students, null, 2));
  
  const fees = await db.getAllAsync('SELECT * FROM fees');
  console.log('Fees:', JSON.stringify(fees, null, 2));
  
  const classes = await db.getAllAsync('SELECT * FROM classes');
  console.log('Classes:', JSON.stringify(classes, null, 2));
}

checkFees();
