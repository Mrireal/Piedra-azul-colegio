export interface Student {
  id: string;
  name: string;
  grade: string | null;
  avatar_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Board {
  id: string;
  name: string;
  student_id: string | null;
  color: string;
  created_at: string;
}

export interface BoardItem {
  id: string;
  board_id: string;
  pictogram_id: number | null;
  pictogram_text: string;
  pictogram_url: string;
  position: number;
  created_at: string;
}

export interface Schedule {
  id: string;
  name: string;
  student_id: string | null;
  created_at: string;
}

export interface ScheduleItem {
  id: string;
  schedule_id: string;
  pictogram_id: number | null;
  pictogram_text: string;
  pictogram_url: string;
  time_label: string | null;
  position: number;
  completed: boolean;
  created_at: string;
}

export interface ArasaacPictogram {
  id: number;
  text: string;
  imageUrl: string;
  previewUrl: string;
}

export type PageView =
  | { name: 'home' }
  | { name: 'pictograms' }
  | { name: 'boards' }
  | { name: 'board-view'; boardId: string }
  | { name: 'board-create' }
  | { name: 'schedules' }
  | { name: 'schedule-view'; scheduleId: string }
  | { name: 'schedule-create' }
  | { name: 'students' };
