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
      created_at TEXT NOT NULL,
      bpl_certificate_url TEXT,
      college TEXT,
      contact_number TEXT
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
      status_note TEXT,
      next_hearing_at TEXT,
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

  const userColumns = db
    .prepare("PRAGMA table_info(users)")
    .all() as Array<{ name: string }>;
  const columnNames = new Set(userColumns.map((column) => column.name));
  if (!columnNames.has("bpl_certificate_url")) {
    db.prepare("ALTER TABLE users ADD COLUMN bpl_certificate_url TEXT").run();
  }
  if (!columnNames.has("college")) {
    db.prepare("ALTER TABLE users ADD COLUMN college TEXT").run();
  }
  if (!columnNames.has("contact_number")) {
    db.prepare("ALTER TABLE users ADD COLUMN contact_number TEXT").run();
  }

  const caseColumns = db
    .prepare("PRAGMA table_info(cases)")
    .all() as Array<{ name: string }>;
  const caseColumnNames = new Set(caseColumns.map((column) => column.name));
  if (!caseColumnNames.has("status_note")) {
    db.prepare("ALTER TABLE cases ADD COLUMN status_note TEXT").run();
  }
  if (!caseColumnNames.has("next_hearing_at")) {
    db.prepare("ALTER TABLE cases ADD COLUMN next_hearing_at TEXT").run();
  }
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
