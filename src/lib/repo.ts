import { query, queryOne, execute } from './db';
import type { Student, Board, BoardItem, Schedule, ScheduleItem } from './types';

// ============ Students ============

export async function getStudents(): Promise<Student[]> {
  return query<Student>('SELECT * FROM students ORDER BY name ASC');
}

export async function createStudent(data: { name: string; grade: string | null; notes: string | null }): Promise<Student> {
  return queryOne<Student>(
    'INSERT INTO students (name, grade, notes) VALUES ($1, $2, $3) RETURNING *',
    [data.name, data.grade, data.notes]
  ) as Promise<Student>;
}

export async function updateStudent(id: string, data: { name: string; grade: string | null; notes: string | null }): Promise<void> {
  await execute(
    'UPDATE students SET name = $1, grade = $2, notes = $3 WHERE id = $4',
    [data.name, data.grade, data.notes, id]
  );
}

export async function deleteStudent(id: string): Promise<void> {
  await execute('DELETE FROM students WHERE id = $1', [id]);
}

// ============ Boards ============

export async function getBoards(): Promise<Board[]> {
  return query<Board>('SELECT * FROM boards ORDER BY created_at DESC');
}

export async function createBoard(data: { name: string; color: string }): Promise<Board> {
  return queryOne<Board>(
    'INSERT INTO boards (name, color) VALUES ($1, $2) RETURNING *',
    [data.name, data.color]
  ) as Promise<Board>;
}

export async function deleteBoard(id: string): Promise<void> {
  await execute('DELETE FROM boards WHERE id = $1', [id]);
}

// ============ Board Items ============

export async function getBoardItems(boardId: string): Promise<BoardItem[]> {
  return query<BoardItem>('SELECT * FROM board_items WHERE board_id = $1 ORDER BY position ASC', [boardId]);
}

export async function addBoardItem(data: {
  boardId: string;
  pictogramId: number;
  pictogramText: string;
  pictogramUrl: string;
  position: number;
}): Promise<BoardItem> {
  return queryOne<BoardItem>(
    'INSERT INTO board_items (board_id, pictogram_id, pictogram_text, pictogram_url, position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [data.boardId, data.pictogramId, data.pictogramText, data.pictogramUrl, data.position]
  ) as Promise<BoardItem>;
}

export async function deleteBoardItem(id: string): Promise<void> {
  await execute('DELETE FROM board_items WHERE id = $1', [id]);
}

// ============ Schedules ============

export async function getSchedules(): Promise<Schedule[]> {
  return query<Schedule>('SELECT * FROM schedules ORDER BY created_at DESC');
}

export async function createSchedule(data: { name: string }): Promise<Schedule> {
  return queryOne<Schedule>(
    'INSERT INTO schedules (name) VALUES ($1) RETURNING *',
    [data.name]
  ) as Promise<Schedule>;
}

export async function deleteSchedule(id: string): Promise<void> {
  await execute('DELETE FROM schedules WHERE id = $1', [id]);
}

// ============ Schedule Items ============

export async function getScheduleItems(scheduleId: string): Promise<ScheduleItem[]> {
  return query<ScheduleItem>('SELECT * FROM schedule_items WHERE schedule_id = $1 ORDER BY position ASC', [scheduleId]);
}

export async function addScheduleItem(data: {
  scheduleId: string;
  pictogramId: number;
  pictogramText: string;
  pictogramUrl: string;
  timeLabel: string | null;
  position: number;
}): Promise<ScheduleItem> {
  return queryOne<ScheduleItem>(
    'INSERT INTO schedule_items (schedule_id, pictogram_id, pictogram_text, pictogram_url, time_label, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [data.scheduleId, data.pictogramId, data.pictogramText, data.pictogramUrl, data.timeLabel, data.position]
  ) as Promise<ScheduleItem>;
}

export async function deleteScheduleItem(id: string): Promise<void> {
  await execute('DELETE FROM schedule_items WHERE id = $1', [id]);
}

export async function toggleScheduleItemCompleted(id: string, completed: boolean): Promise<void> {
  await execute('UPDATE schedule_items SET completed = $1 WHERE id = $2', [completed, id]);
}
