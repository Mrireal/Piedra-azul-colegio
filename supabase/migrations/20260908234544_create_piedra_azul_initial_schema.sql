/*
# Create initial schema for Colegio Tecnico Profesional Piedra Azul - Área PIE

## Descripción General
Este migration crea el esquema inicial para un sistema de pictogramas
para el área PIE (Programa de Integración Escolar) del Colegio Técnico
Profesional Piedra Azul. El sistema está diseñado para niños con
Necesidades Educativas Especiales (NEE) y utiliza pictogramas visuales
inspirados en ARASAAC.

## Aplicación single-tenant (sin login)
Esta es una aplicación de uso interno en el liceo sin pantalla de login.
Las políticas permiten acceso anon + authenticated a todas las tablas.

## Nuevas Tablas

### 1. students (estudiantes)
- `id` (uuid, primary key)
- `name` (text, nombre del estudiante)
- `grade` (text, curso/grado del estudiante)
- `avatar_url` (text, URL del avatar/foto del estudiante)
- `notes` (text, notas del educador sobre el estudiante)
- `created_at` (timestamp)

### 2. boards (tableros de comunicación)
- `id` (uuid, primary key)
- `name` (text, nombre del tablero)
- `student_id` (uuid, foreign key a students, nullable para tableros compartidos)
- `color` (text, color del tablero para identificación visual)
- `created_at` (timestamp)

### 3. board_items (elementos de los tableros)
- `id` (uuid, primary key)
- `board_id` (uuid, foreign key a boards)
- `pictogram_id` (int, ID del pictograma en ARASAAC)
- `pictogram_text` (text, texto del pictograma)
- `pictogram_url` (text, URL de la imagen del pictograma)
- `position` (int, posición del pictograma en el tablero)
- `created_at` (timestamp)

### 4. schedules (horarios visuales)
- `id` (uuid, primary key)
- `name` (text, nombre del horario)
- `student_id` (uuid, foreign key a students, nullable)
- `created_at` (timestamp)

### 5. schedule_items (actividades del horario)
- `id` (uuid, primary key)
- `schedule_id` (uuid, foreign key a schedules)
- `pictogram_id` (int, ID del pictograma en ARASAAC)
- `pictogram_text` (text, texto de la actividad)
- `pictogram_url` (text, URL de la imagen)
- `time_label` (text, etiqueta de hora, ej: "8:00 AM")
- `position` (int, posición en el horario)
- `completed` (boolean, si la actividad fue completada)
- `created_at` (timestamp)

## Seguridad
- RLS habilitado en todas las tablas.
- Políticas de acceso público (anon + authenticated) porque es una
  aplicación de uso interno sin autenticación.
*/

-- ============ students ============
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade text,
  avatar_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);

-- ============ boards ============
CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  color text DEFAULT 'sky',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_boards" ON boards;
CREATE POLICY "anon_select_boards" ON boards FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_boards" ON boards;
CREATE POLICY "anon_insert_boards" ON boards FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_boards" ON boards;
CREATE POLICY "anon_update_boards" ON boards FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_boards" ON boards;
CREATE POLICY "anon_delete_boards" ON boards FOR DELETE
  TO anon, authenticated USING (true);

-- ============ board_items ============
CREATE TABLE IF NOT EXISTS board_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  pictogram_id int,
  pictogram_text text NOT NULL,
  pictogram_url text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE board_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_board_items" ON board_items;
CREATE POLICY "anon_select_board_items" ON board_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_board_items" ON board_items;
CREATE POLICY "anon_insert_board_items" ON board_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_board_items" ON board_items;
CREATE POLICY "anon_update_board_items" ON board_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_board_items" ON board_items;
CREATE POLICY "anon_delete_board_items" ON board_items FOR DELETE
  TO anon, authenticated USING (true);

-- ============ schedules ============
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_schedules" ON schedules;
CREATE POLICY "anon_select_schedules" ON schedules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_schedules" ON schedules;
CREATE POLICY "anon_insert_schedules" ON schedules FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_schedules" ON schedules;
CREATE POLICY "anon_update_schedules" ON schedules FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_schedules" ON schedules;
CREATE POLICY "anon_delete_schedules" ON schedules FOR DELETE
  TO anon, authenticated USING (true);

-- ============ schedule_items ============
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

ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_schedule_items" ON schedule_items;
CREATE POLICY "anon_select_schedule_items" ON schedule_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_schedule_items" ON schedule_items;
CREATE POLICY "anon_insert_schedule_items" ON schedule_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_schedule_items" ON schedule_items;
CREATE POLICY "anon_update_schedule_items" ON schedule_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_schedule_items" ON schedule_items;
CREATE POLICY "anon_delete_schedule_items" ON schedule_items FOR DELETE
  TO anon, authenticated USING (true);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_boards_student_id ON boards(student_id);
CREATE INDEX IF NOT EXISTS idx_board_items_board_id ON board_items(board_id);
CREATE INDEX IF NOT EXISTS idx_schedules_student_id ON schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_schedule_id ON schedule_items(schedule_id);