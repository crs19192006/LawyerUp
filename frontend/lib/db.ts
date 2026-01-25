import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import path from "path";

let dbInstance: Database.Database | null = null;

function initDatabase(db: Database.Database) {
  // Users table stores hashed passwords for real auth.
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      assigned_lawyer_id TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty_score INTEGER NOT NULL,
      complexity_tag TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (client_id) REFERENCES users(id),
      FOREIGN KEY (assigned_lawyer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS case_documents (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      file_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES cases(id),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS case_student_assignments (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      lawyer_id TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES cases(id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (lawyer_id) REFERENCES users(id)
    );
  `);
}

export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "nyayaconnect.db");
  dbInstance = new Database(dbPath);
  initDatabase(dbInstance);
  return dbInstance;
}
