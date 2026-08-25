import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sun, 
  Moon, 
  Palette, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Download, 
  Upload, 
  Clock, 
  Smartphone, 
  Laptop,
  CheckCircle2,
  Bell,
  BellOff,
  Cloud,
  LogIn,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getNotificationPermission, requestNotificationPermission, type NotificationPermission } from '../../services/notifications';

export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    setThemePreset, 
    syncStatus, 
    triggerSync, 
    lastSyncTime,
    exportData,
    importData
    , firebaseConfigured,
    firebaseUser,
    signIn,
    createAccount,
    signOut
  } = useApp();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('prompt');
  const [syncEmail, setSyncEmail] = useState('');
  const [syncPassword, setSyncPassword] = useState('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  useEffect(() => {
    void getNotificationPermission().then(setNotificationPermission);
  }, []);

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : await getNotificationPermission());
    updateSettings({ notificationsEnabled: granted });
  };

  const handleCloudAuth = async (create: boolean) => {
    setSyncBusy(true);
    setSyncError(null);
    try {
      if (create) await createAccount(syncEmail, syncPassword);
      else await signIn(syncEmail, syncPassword);
      setSyncPassword('');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to connect to Firebase.');
    } finally {
      setSyncBusy(false);
    }
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportStatus('Data imported successfully! All records updated.');
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } else {
        setImportStatus('Failed to import backup JSON. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-page p-3 sm:p-8 max-w-4xl mx-auto space-y-5">
      
      {/* 1. Theme & Appearance Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <span>Theme & Visual Styling</span>
        </h3>

        {/* Dark / Light Mode Options */}
        <div className="space-y-3">
          <label className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            Color Scheme Mode
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => updateSettings({ themeMode: 'light' })}
              className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border-2 font-black text-sm transition-all ${
                settings.themeMode === 'light'
                  ? 'bg-indigo-50/90 text-indigo-700 border-indigo-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span>Light Theme</span>
            </button>

            <button
              onClick={() => updateSettings({ themeMode: 'dark' })}
              className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border-2 font-black text-sm transition-all ${
                settings.themeMode === 'dark'
                  ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <span>Dark Theme</span>
            </button>
          </div>
        </div>

        {/* Design Theme Preset Selector */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            Aesthetic Palette Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Royal Indigo Theme Choice */}
            <div
              onClick={() => setThemePreset('candy')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 ${
                settings.themePreset === 'candy'
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 dark:text-white text-base font-headline">Royal Indigo & Blue</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#4338ca]"></span>
                  <span className="w-4 h-4 rounded-full bg-[#3b82f6]"></span>
                  <span className="w-4 h-4 rounded-full bg-[#f97316]"></span>
                  <span className="w-4 h-4 rounded-full bg-[#10b981]"></span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Clean academic layout with rich royal electric indigo banner, orange sliding effects, and color-coded class badges.
              </p>
            </div>

            {/* Sapphire Blue Theme Choice */}
            <div
              onClick={() => setThemePreset('glacier')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 ${
                settings.themePreset === 'glacier'
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 dark:text-white text-base font-headline">Sapphire Minimal</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#2563eb]"></span>
                  <span className="w-4 h-4 rounded-full bg-[#0284c7]"></span>
                  <span className="w-4 h-4 rounded-full bg-[#f8fafc] border border-slate-300"></span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Cool cerulean blue with high-contrast slate cards and subtle focus accents.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Pomodoro Timer & Audio Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <span>Timer & Alarm Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Focus Duration (mins)</label>
            <input
              type="number"
              min={1}
              max={120}
              value={settings.pomodoroMinutes}
              onChange={(e) => updateSettings({ pomodoroMinutes: Number(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-4 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none font-black shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Short Break (mins)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.shortBreakMinutes}
              onChange={(e) => updateSettings({ shortBreakMinutes: Number(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-4 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none font-black shadow-xs"
            />
          </div>

        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="font-black text-slate-900 dark:text-white text-sm block">Timer Completion Chime</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Harmonic synthesizer chime notification when focus timer finishes</span>
          </div>

          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-3.5 rounded-2xl transition-all ${
              settings.soundEnabled 
                ? 'bg-[#4338ca] text-white shadow-xs' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="min-w-0">
            <span className="font-black text-slate-900 dark:text-white text-sm block">Timer notifications</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Show a notification when a focus session finishes, including on Android.</span>
          </div>
          <button
            type="button"
            onClick={enableNotifications}
            className="glass-primary-button inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs"
          >
            {settings.notificationsEnabled && notificationPermission === 'granted' ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            <span>{settings.notificationsEnabled && notificationPermission === 'granted' ? 'Enabled' : 'Enable'}</span>
          </button>
        </div>

        {notificationPermission === 'denied' && (
          <p role="alert" className="text-xs font-bold text-rose-600">Notifications are blocked. Allow them in your device or browser settings, then try again.</p>
        )}
      </div>

      {/* 3. Cloud synchronization & backup */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <span>Cloud Sync & Backup</span>
          </h3>

          <span className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border ${firebaseUser ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
            <span className={`w-2 h-2 rounded-full ${firebaseUser ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
            {firebaseUser ? 'Live sync active' : 'Not connected'}
          </span>
        </div>

        {!firebaseConfigured ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            Add the Firebase web configuration to the app environment before enabling cloud sync.
          </p>
        ) : firebaseUser ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-indigo-50/70 p-4 dark:bg-indigo-950/30">
            <div className="min-w-0"><span className="block text-xs font-bold text-slate-500">Signed in as</span><span className="block truncate text-sm font-black text-slate-900 dark:text-white">{firebaseUser.email}</span></div>
            <button type="button" onClick={() => void signOut()} className="glass-secondary-button inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs"><LogOut className="h-4 w-4" />Sign out</button>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Use the same account on Android and PC. Changes will sync automatically when either device reconnects.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input value={syncEmail} onChange={event => setSyncEmail(event.target.value)} type="email" placeholder="Email" className="glass-input" />
              <input value={syncPassword} onChange={event => setSyncPassword(event.target.value)} type="password" placeholder="Password (6+ characters)" className="glass-input" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={syncBusy || !syncEmail || syncPassword.length < 6} onClick={() => void handleCloudAuth(false)} className="glass-primary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs"><LogIn className="h-4 w-4" />Sign in</button>
              <button type="button" disabled={syncBusy || !syncEmail || syncPassword.length < 6} onClick={() => void handleCloudAuth(true)} className="glass-secondary-button rounded-full px-4 py-2 text-xs">Create account</button>
            </div>
            {syncError && <p role="alert" className="text-xs font-bold text-rose-600">{syncError}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white text-sm block">Device Sync Session</span>
              <span className="text-xs text-slate-500 font-mono">{settings.deviceSyncId}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white text-sm block">Last Sync Event</span>
              <span className="text-xs text-slate-500 font-medium">{lastSyncTime}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            onClick={triggerSync}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-black text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Export Backup JSON</span>
            </button>

            <label className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importStatus && (
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mt-2 p-3 rounded-2xl bg-indigo-50 border border-indigo-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>

    </div>
  );
};
