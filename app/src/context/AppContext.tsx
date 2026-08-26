import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  ActiveTab, 
  StudentProfile, 
  TaskItem, 
  NoteItem, 
  ClassSchedule, 
  FocusSession, 
  AlarmItem,
  AppSettings,
  ThemeMode,
  ThemePreset
} from '../types';
import { storage, subscribeToSync } from '../services/storage';
import { cancelAlarmNotification, scheduleAlarmNotification } from '../services/notifications';
import {
  firebaseConfigured,
  subscribeToFirebaseAuth,
  startFirebaseRealtimeSync,
  signInToFirebase,
  createFirebaseAccount,
  signOutOfFirebase,
  uploadDeviceDataToCloud,
  downloadCloudDataToDevice,
  safeMergeCloudAndDevice,
  type FirebaseSyncUser,
} from '../services/firebaseSync';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: StudentProfile;
  updateProfile: (updated: Partial<StudentProfile>) => void;
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updated: Partial<TaskItem>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  notes: NoteItem[];
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updated: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  schedule: ClassSchedule[];
  addClass: (item: Omit<ClassSchedule, 'id'>) => void;
  batchAddClasses: (items: Omit<ClassSchedule, 'id'>[]) => void;
  updateClass: (id: string, updated: Partial<ClassSchedule>) => void;
  deleteClass: (id: string) => void;
  sessions: FocusSession[];
  logSession: (session: Omit<FocusSession, 'id' | 'completedAt'>) => void;
  alarms: AlarmItem[];
  addAlarm: (alarm: Omit<AlarmItem, 'id' | 'createdAt'>) => void;
  updateAlarm: (id: string, updated: Partial<AlarmItem>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  settings: AppSettings;
  updateSettings: (updated: Partial<AppSettings>) => void;
  toggleThemeMode: () => void;
  setThemePreset: (preset: ThemePreset) => void;
  lastSyncTime: string;
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastCloudUpload: string | null;
  lastCloudDownload: string | null;
  triggerSync: () => void;
  uploadToCloud: () => Promise<{ success: boolean; message: string }>;
  downloadFromCloud: () => Promise<{ success: boolean; message: string }>;
  safeMergeSync: () => Promise<{ success: boolean; message: string }>;
  exportData: () => string;
  importData: (json: string) => boolean;
  firebaseConfigured: boolean;
  firebaseUser: FirebaseSyncUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState<StudentProfile>(storage.getProfile);
  const [tasks, setTasks] = useState<TaskItem[]>(storage.getTasks);
  const [notes, setNotes] = useState<NoteItem[]>(storage.getNotes);
  const [schedule, setSchedule] = useState<ClassSchedule[]>(storage.getSchedule);
  const [sessions, setSessions] = useState<FocusSession[]>(storage.getSessions);
  const [alarms, setAlarms] = useState<AlarmItem[]>(storage.getAlarms);
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings);

  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastCloudUpload, setLastCloudUpload] = useState<string | null>(storage.getLastCloudUpload());
  const [lastCloudDownload, setLastCloudDownload] = useState<string | null>(storage.getLastCloudDownload());
  const [firebaseUser, setFirebaseUser] = useState<FirebaseSyncUser | null>(null);

  // Reload state from storage
  const reloadAllFromStorage = () => {
    setSyncStatus('syncing');
    setProfile(storage.getProfile());
    setTasks(storage.getTasks());
    setNotes(storage.getNotes());
    setSchedule(storage.getSchedule());
    setSessions(storage.getSessions());
    setAlarms(storage.getAlarms());
    setSettings(storage.getSettings());
    setLastCloudUpload(storage.getLastCloudUpload());
    setLastCloudDownload(storage.getLastCloudDownload());
    setLastSyncTime(new Date().toLocaleTimeString());
    setTimeout(() => setSyncStatus('synced'), 300);
  };

  const uploadToCloud = async () => {
    setSyncStatus('syncing');
    const result = await uploadDeviceDataToCloud();
    if (result.success) {
      setLastCloudUpload(storage.getLastCloudUpload());
      setSyncStatus('synced');
    } else {
      setSyncStatus('offline');
    }
    return result;
  };

  const downloadFromCloud = async () => {
    setSyncStatus('syncing');
    const result = await downloadCloudDataToDevice();
    if (result.success) {
      reloadAllFromStorage();
      setLastCloudDownload(storage.getLastCloudDownload());
      setSyncStatus('synced');
    } else {
      setSyncStatus('offline');
    }
    return result;
  };

  const safeMergeSync = async () => {
    setSyncStatus('syncing');
    const result = await safeMergeCloudAndDevice();
    if (result.success) {
      reloadAllFromStorage();
      setLastCloudUpload(storage.getLastCloudUpload());
      setLastCloudDownload(storage.getLastCloudDownload());
      setSyncStatus('synced');
    } else {
      setSyncStatus('offline');
    }
    return result;
  };

  // Subscribe to real-time sync updates
  useEffect(() => {
    const unsubscribe = subscribeToSync(() => {
      reloadAllFromStorage();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => subscribeToFirebaseAuth(setFirebaseUser), []);

  // Handle HTML document Theme classes
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.themeMode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }

    root.setAttribute('data-theme-preset', settings.themePreset);
  }, [settings.themeMode, settings.themePreset]);

  const updateProfile = (updated: Partial<StudentProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };

  const addTask = (item: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...item,
      id: 'task_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    storage.saveTasks(updated);
  };

  const updateTask = (id: string, updated: Partial<TaskItem>) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, ...updated } : t);
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId && t.subtasks) {
        const updatedSubtasks = t.subtasks.map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    });
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const addSubtask = (taskId: string, title: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const updatedTasks = tasks.map(task => task.id === taskId
      ? {
          ...task,
          subtasks: [
            ...(task.subtasks || []),
            { id: `sub_${Date.now()}`, title: cleanTitle, completed: false },
          ],
        }
      : task
    );
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const addNote = (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      ...note,
      id: 'note_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    storage.saveNotes(updated);
  };

  const updateNote = (id: string, updated: Partial<NoteItem>) => {
    const updatedNotes = notes.map(n => 
      n.id === id 
        ? { ...n, ...updated, updatedAt: new Date().toISOString() } 
        : n
    );
    setNotes(updatedNotes);
    storage.saveNotes(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    storage.saveNotes(updatedNotes);
  };

  const togglePinNote = (id: string) => {
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
    setNotes(updatedNotes);
    storage.saveNotes(updatedNotes);
  };

  const addClass = (item: Omit<ClassSchedule, 'id'>) => {
    const newClass: ClassSchedule = {
      ...item,
      id: 'class_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    };
    const updated = [...schedule, newClass];
    setSchedule(updated);
    storage.saveSchedule(updated);
  };

  const batchAddClasses = (items: Omit<ClassSchedule, 'id'>[]) => {
    if (!items || items.length === 0) return;
    const newClasses: ClassSchedule[] = items.map((item, idx) => ({
      ...item,
      id: 'class_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).slice(2, 7),
    }));
    const updated = [...schedule, ...newClasses];
    setSchedule(updated);
    storage.saveSchedule(updated);
  };

  const updateClass = (id: string, updated: Partial<ClassSchedule>) => {
    const updatedSchedule = schedule.map(c => c.id === id ? { ...c, ...updated } : c);
    setSchedule(updatedSchedule);
    storage.saveSchedule(updatedSchedule);
  };

  const deleteClass = (id: string) => {
    const updatedSchedule = schedule.filter(c => c.id !== id);
    setSchedule(updatedSchedule);
    storage.saveSchedule(updatedSchedule);
  };

  const logSession = (session: Omit<FocusSession, 'id' | 'completedAt'>) => {
    const newSession: FocusSession = {
      ...session,
      id: 'session_' + Date.now(),
      completedAt: new Date().toISOString(),
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    storage.saveSessions(updated);
  };

  const addAlarm = (alarm: Omit<AlarmItem, 'id' | 'createdAt'>) => {
    const newAlarm: AlarmItem = { ...alarm, id: `alarm_${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...alarms, newAlarm];
    setAlarms(updated);
    storage.saveAlarms(updated);
    if (newAlarm.enabled) void scheduleAlarmNotification(newAlarm.id, newAlarm.label, newAlarm.time, newAlarm.repeat);
  };

  const updateAlarm = (id: string, updatedFields: Partial<AlarmItem>) => {
    const current = alarms.find(alarm => alarm.id === id);
    const updated = alarms.map(alarm => alarm.id === id ? { ...alarm, ...updatedFields } : alarm);
    setAlarms(updated);
    storage.saveAlarms(updated);
    void cancelAlarmNotification(id);
    const next = updated.find(alarm => alarm.id === id);
    if (next?.enabled) void scheduleAlarmNotification(id, next.label, next.time, next.repeat);
    else if (current) void cancelAlarmNotification(current.id);
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
    storage.saveAlarms(alarms.filter(alarm => alarm.id !== id));
    void cancelAlarmNotification(id);
  };

  const toggleAlarm = (id: string) => {
    const current = alarms.find(alarm => alarm.id === id);
    if (current) updateAlarm(id, { enabled: !current.enabled });
  };

  const updateSettings = (updated: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updated };
    newSettings.pomodoroMinutes = Math.min(120, Math.max(1, Number(newSettings.pomodoroMinutes) || 25));
    newSettings.shortBreakMinutes = Math.min(30, Math.max(1, Number(newSettings.shortBreakMinutes) || 5));
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const toggleThemeMode = () => {
    const nextMode: ThemeMode = settings.themeMode === 'dark' ? 'light' : 'dark';
    updateSettings({ themeMode: nextMode });
  };

  const setThemePreset = (preset: ThemePreset) => {
    updateSettings({ themePreset: preset });
  };

  const triggerSync = () => {
    reloadAllFromStorage();
  };

  const exportData = () => {
    return storage.exportAllData();
  };

  const importData = (json: string): boolean => {
    const ok = storage.importAllData(json);
    if (ok) reloadAllFromStorage();
    return ok;
  };

  useEffect(() => startFirebaseRealtimeSync((remoteData) => {
    if (storage.importAllData(remoteData)) reloadAllFromStorage();
  }, setSyncStatus), []);

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      profile,
      updateProfile,
      tasks,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      toggleSubtask,
      addSubtask,
      notes,
      addNote,
      updateNote,
      deleteNote,
      togglePinNote,
      schedule,
      addClass,
      batchAddClasses,
      updateClass,
      deleteClass,
      sessions,
      logSession,
      alarms,
      addAlarm,
      updateAlarm,
      deleteAlarm,
      toggleAlarm,
      settings,
      updateSettings,
      toggleThemeMode,
      setThemePreset,
      lastSyncTime,
      syncStatus,
      lastCloudUpload,
      lastCloudDownload,
      triggerSync,
      uploadToCloud,
      downloadFromCloud,
      safeMergeSync,
      exportData,
      importData,
      firebaseConfigured,
      firebaseUser,
      signIn: async (email, password) => { await signInToFirebase(email, password); },
      createAccount: async (email, password) => { await createFirebaseAccount(email, password); },
      signOut: signOutOfFirebase,
      mobileMenuOpen,
      setMobileMenuOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
