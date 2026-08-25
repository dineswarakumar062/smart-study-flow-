export type ActiveTab = 'dashboard' | 'notes' | 'tasks' | 'schedule' | 'timer' | 'profile' | 'settings';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePreset = 'candy' | 'glacier';

export interface StudentProfile {
  name: string;
  major: string;
  academicYear: string;
  targetGpa: string;
  weeklyGoalHours: number;
  email: string;
  bio: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string or YYYY-MM-DD
  dueTime?: string; // Optional time string e.g. "14:30" or "02:30 PM"
  priority: TaskPriority;
  completed: boolean;
  subject?: string;
  subtasks?: SubTask[];
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  subject: string;
  category?: 'general' | 'important';
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  id: string;
  subjectName: string;
  code?: string;
  instructor: string;
  location: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  color: string;
}

export interface FocusSession {
  id: string;
  subject: string;
  durationMinutes: number;
  completedAt: string;
  type: 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch';
}

export type TimerColorTheme = 'orange' | 'cyan' | 'purple' | 'emerald' | 'rose';

export interface CustomTimerItem {
  id: string;
  name: string;
  durationMinutes: number;
  subject?: string;
  type: 'focus' | 'shortBreak' | 'longBreak' | 'custom';
  colorTheme: TimerColorTheme;
  createdAt: string;
}

export interface AlarmItem {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
  repeat: 'once' | 'daily';
  createdAt: string;
}

export interface AppSettings {
  themeMode: ThemeMode;
  themePreset: ThemePreset;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  alarmVolume: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  autoSync: boolean;
  deviceSyncId: string;
}
