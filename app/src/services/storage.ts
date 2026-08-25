import type { StudentProfile, TaskItem, NoteItem, ClassSchedule, FocusSession, AppSettings } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'studyflow_profile',
  TASKS: 'studyflow_tasks',
  NOTES: 'studyflow_notes',
  SCHEDULE: 'studyflow_schedule',
  SESSIONS: 'studyflow_sessions',
  SETTINGS: 'studyflow_settings',
};

const localChangeListeners = new Set<() => void>();

export const defaultProfile: StudentProfile = {
  name: 'Alex Vance',
  major: 'Computer Science',
  academicYear: 'Junior (Year 3)',
  targetGpa: '3.9',
  weeklyGoalHours: 25,
  email: 'alex.vance@university.edu',
  bio: 'Passionate CS student focusing on Algorithms, Data Structures & Machine Learning.',
};

export const defaultSettings: AppSettings = {
  themeMode: 'light',
  themePreset: 'candy',
  soundEnabled: true,
  notificationsEnabled: false,
  alarmVolume: 80,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  autoSync: true,
  deviceSyncId: 'device_' + Math.random().toString(36).substring(2, 9),
};

export const defaultTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Finish BST & Binary Tree Assignment',
    description: 'Implement AVL rotation methods and pass all unit tests in Java.',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: 'high',
    completed: false,
    subject: 'Data Structures',
    subtasks: [
      { id: 'sub-1', title: 'Implement insert and delete node', completed: true },
      { id: 'sub-2', title: 'Implement rebalance rotations', completed: false },
      { id: 'sub-3', title: 'Write unit test suite', completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Review Linear Algebra Chapter 4',
    description: 'Eigenvalues, Eigenvectors, and Matrix Diagonalization formulas.',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    priority: 'medium',
    completed: false,
    subject: 'Mathematics',
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Submit Operating Systems Lab 2',
    description: 'Process scheduling simulation with Round Robin & Priority Queue.',
    dueDate: new Date(Date.now() + 259200000).toISOString(),
    priority: 'high',
    completed: true,
    subject: 'Operating Systems',
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Read UX Research Paper on Microinteractions',
    description: 'Summarize key takeaways for Design project.',
    dueDate: new Date(Date.now() + 345600000).toISOString(),
    priority: 'low',
    completed: false,
    subject: 'UI/UX Design',
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
];

export const defaultNotes: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Data Structures: Tree & Graph Algorithms',
    content: `# Binary Search Trees & Graphs

Key Properties:
- Inorder traversal of BST gives sorted key sequence.
- Time Complexity: O(log N) average for search/insert, O(N) worst case if unbalanced.
- AVL Trees use height balance factor (-1, 0, +1) to ensure strictly O(log N).

## Graph Search Strategy
- **BFS**: Queue based, shortest path in unweighted graphs.
- **DFS**: Stack/Recursion based, topological sorting.
`,
    subject: 'Data Structures',
    tags: ['algorithms', 'midterm', 'cs'],
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'note-2',
    title: 'Linear Algebra Quick Reference Sheet',
    content: `# Eigenvalues and Diagonalization

$$A v = \\lambda v$$

1. Find characteristic equation: \\det(A - \\lambda I) = 0
2. Solve for eigenvalues \\lambda_1, \\lambda_2
3. Find nullspace of (A - \\lambda I) for eigenvectors.
`,
    subject: 'Mathematics',
    tags: ['math', 'exam-prep'],
    isPinned: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const defaultSchedule: ClassSchedule[] = [
  {
    id: 'class-1',
    subjectName: 'Data Structures & Algorithms',
    code: 'CS 301',
    instructor: 'Dr. Robert Chen',
    location: 'Lecture Hall 4B',
    dayOfWeek: 'Monday',
    startTime: '10:00',
    endTime: '11:30',
    color: '#e040a0',
  },
  {
    id: 'class-2',
    subjectName: 'Linear Algebra',
    code: 'MATH 240',
    instructor: 'Prof. Sarah Jenkins',
    location: 'Science Center 102',
    dayOfWeek: 'Monday',
    startTime: '13:00',
    endTime: '14:30',
    color: '#7c52aa',
  },
  {
    id: 'class-3',
    subjectName: 'Operating Systems',
    code: 'CS 320',
    instructor: 'Dr. Michael Taylor',
    location: 'Tech Lab 3A',
    dayOfWeek: 'Tuesday',
    startTime: '09:00',
    endTime: '10:30',
    color: '#0096cc',
  },
  {
    id: 'class-4',
    subjectName: 'UI/UX Design Studio',
    code: 'DES 110',
    instructor: 'Elena Rostova',
    location: 'Design Building 204',
    dayOfWeek: 'Wednesday',
    startTime: '11:00',
    endTime: '13:00',
    color: '#fdb45d',
  },
  {
    id: 'class-5',
    subjectName: 'Data Structures & Algorithms',
    code: 'CS 301',
    instructor: 'Dr. Robert Chen',
    location: 'Lecture Hall 4B',
    dayOfWeek: 'Wednesday',
    startTime: '10:00',
    endTime: '11:30',
    color: '#e040a0',
  },
  {
    id: 'class-6',
    subjectName: 'Database Systems',
    code: 'CS 340',
    instructor: 'Prof. Alan Turing',
    location: 'Hall B',
    dayOfWeek: 'Thursday',
    startTime: '14:00',
    endTime: '15:30',
    color: '#0096cc',
  },
];

export const defaultSessions: FocusSession[] = [
  {
    id: 'sess-1',
    subject: 'Data Structures',
    durationMinutes: 25,
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    type: 'pomodoro',
  },
  {
    id: 'sess-2',
    subject: 'Linear Algebra',
    durationMinutes: 50,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    type: 'pomodoro',
  },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isObjectArray = (value: unknown): value is Record<string, unknown>[] =>
  Array.isArray(value) && value.every(isRecord);

function readStored<T>(key: string, fallback: T, validate: (value: unknown) => boolean): T {
  const data = localStorage.getItem(key);
  if (!data) return fallback;

  try {
    const parsed: unknown = JSON.parse(data);
    return validate(parsed) ? parsed as T : fallback;
  } catch {
    return fallback;
  }
}

// Helper functions for LocalStorage
export const storage = {
  getProfile: (): StudentProfile => {
    return {
      ...defaultProfile,
      ...readStored(STORAGE_KEYS.PROFILE, defaultProfile, isRecord),
    };
  },
  saveProfile: (profile: StudentProfile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    notifySync();
  },
  getTasks: (): TaskItem[] => {
    return readStored(STORAGE_KEYS.TASKS, defaultTasks, isObjectArray) as TaskItem[];
  },
  saveTasks: (tasks: TaskItem[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    notifySync();
  },
  getNotes: (): NoteItem[] => {
    return readStored(STORAGE_KEYS.NOTES, defaultNotes, isObjectArray) as NoteItem[];
  },
  saveNotes: (notes: NoteItem[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    notifySync();
  },
  getSchedule: (): ClassSchedule[] => {
    return readStored(STORAGE_KEYS.SCHEDULE, defaultSchedule, isObjectArray) as ClassSchedule[];
  },
  saveSchedule: (schedule: ClassSchedule[]) => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    notifySync();
  },
  getSessions: (): FocusSession[] => {
    return readStored(STORAGE_KEYS.SESSIONS, defaultSessions, isObjectArray) as FocusSession[];
  },
  saveSessions: (sessions: FocusSession[]) => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    notifySync();
  },
  getSettings: (): AppSettings => {
    return {
      ...defaultSettings,
      ...readStored(STORAGE_KEYS.SETTINGS, defaultSettings, isRecord),
    };
  },
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    notifySync();
  },
  getAllData: () => ({
    profile: storage.getProfile(),
    tasks: storage.getTasks(),
    notes: storage.getNotes(),
    schedule: storage.getSchedule(),
    sessions: storage.getSessions(),
    settings: storage.getSettings(),
  }),
  exportAllData: () => {
    return JSON.stringify({
      ...storage.getAllData(),
      exportTimestamp: new Date().toISOString(),
    }, null, 2);
  },
  importAllData: (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!isRecord(parsed)) return false;

      const hasInvalidSection =
        (parsed.profile !== undefined && !isRecord(parsed.profile)) ||
        (parsed.tasks !== undefined && !isObjectArray(parsed.tasks)) ||
        (parsed.notes !== undefined && !isObjectArray(parsed.notes)) ||
        (parsed.schedule !== undefined && !isObjectArray(parsed.schedule)) ||
        (parsed.sessions !== undefined && !isObjectArray(parsed.sessions)) ||
        (parsed.settings !== undefined && !isRecord(parsed.settings));

      if (hasInvalidSection) return false;

      if (parsed.profile) storage.saveProfile({ ...defaultProfile, ...parsed.profile });
      if (parsed.tasks) storage.saveTasks(parsed.tasks as TaskItem[]);
      if (parsed.notes) storage.saveNotes(parsed.notes as NoteItem[]);
      if (parsed.schedule) storage.saveSchedule(parsed.schedule as ClassSchedule[]);
      if (parsed.sessions) storage.saveSessions(parsed.sessions as FocusSession[]);
      if (parsed.settings) storage.saveSettings({ ...defaultSettings, ...parsed.settings });
      notifySync();
      return true;
    } catch {
      return false;
    }
  }
};

export const subscribeToLocalChanges = (listener: () => void) => {
  localChangeListeners.add(listener);
  return () => localChangeListeners.delete(listener);
};

// Cross-tab real-time broadcast channel
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('studyflow_sync_channel')
  : null;

function notifySync() {
  localChangeListeners.forEach(listener => listener());
  if (syncChannel) {
    syncChannel.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
  }
}

export function subscribeToSync(onSync: () => void) {
  if (syncChannel) {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SYNC_UPDATE') {
        onSync();
      }
    };
    syncChannel.addEventListener('message', handler);
    return () => syncChannel.removeEventListener('message', handler);
  }
  return () => {};
}
