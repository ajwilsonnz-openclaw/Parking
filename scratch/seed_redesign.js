try {
  const Database = require('better-sqlite3');
  const path = require('path');
  const fs = require('fs');

  const dbPath = path.join(process.cwd(), 'parking.sqlite');
  console.log('DB Path:', dbPath);

  const db = new Database(dbPath, { verbose: console.log });
  const sql = fs.readFileSync(path.join(process.cwd(), 'migrations', '0006_multisite_sections.sql'), 'utf8');

  db.exec(sql);
  console.log('Migration 0006 executed successfully!');

  const sections = db.prepare('SELECT * FROM sections').all();
  console.log('Sections:', sections);

  const carparks = db.prepare('SELECT * FROM carparks').all();
  console.log('Carparks count:', carparks.length);
} catch (e) {
  console.error('CRASH:', e.message, e.stack);
}
