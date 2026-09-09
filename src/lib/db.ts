import { PGlite } from '@electric-sql/pglite';

const db = new PGlite('idb://piedra-azul-pie');

let initialized = false;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade text,
  avatar_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  color text DEFAULT 'sky',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS board_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  pictogram_id int,
  pictogram_text text NOT NULL,
  pictogram_url text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  pictogram_id int,
  pictogram_text text NOT NULL,
  pictogram_url text NOT NULL,
  time_label text,
  position int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
`;

export async function initDB(): Promise<void> {
  if (initialized) return;
  await db.exec(SCHEMA);
  initialized = true;
}

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  await initDB();
  const result = await db.query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(sql: string, params?: unknown[]): Promise<void> {
  await initDB();
  await db.query(sql, params);
}
