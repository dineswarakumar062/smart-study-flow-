import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sun, 
  Moon, 
  Palette, 
  RefreshCw, 
  Download, 
  Upload, 
  Smartphone, 
  Laptop,
  CheckCircle2,
  AlertCircle,
  Cloud,
  LogIn,
  LogOut,
  Bell,
  BellRing,
  BellOff,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendTestNotification, 
  type NotificationPermission 
} from '../../services/notifications';

export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    syncStatus, 
    triggerSync, 
    lastSyncTime,
    exportData,
    importData,
    firebaseConfigured,
    firebaseUser,
    signIn,
    createAccount,
    signOut
  } = useApp();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('prompt');
  const [testAlertSent, setTestAlertSent] = useState(false);
  const [syncEmail, setSyncEmail] = useState('');
  const [syncPassword, setSyncPassword] = useState('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  useEffect(() => {
    void getNotificationPermission().then(setNotificationPermission);
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    const current = granted ? 'granted' : await getNotificationPermission();
    setNotificationPermission(current);
    updateSettings({ notificationsEnabled: granted });

    if (granted) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      await sendTestNotification();
      setTestAlertSent(true);
      setTimeout(() => setTestAlertSent(false), 4000);
    }
  };

  const handleSendTestNotification = async () => {
    const sent = await sendTestNotification();
    if (sent) {
      setTestAlertSent(true);
      setTimeout(() => setTestAlertSent(false), 4000);
    } else {
      alert('Unable to send test notification. Please verify notification permission is allowed in your device settings.');
    }
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
    a.download = `studyzflow_Backup_${new Date().toISOString().split('T')[0]}.json`;
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
      </div>

      {/* 2. Notifications & Reminders Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <span>Notifications & Alerts</span>
          </h3>

          <span className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border ${
            notificationPermission === 'granted' && settings.notificationsEnabled
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : notificationPermission === 'denied'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              notificationPermission === 'granted' && settings.notificationsEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`} />
            {notificationPermission === 'granted' && settings.notificationsEnabled 
              ? 'Active' 
              : notificationPermission === 'denied' 
              ? 'Blocked' 
              : 'Not Enabled'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          Stay on top of your study routines with alerts for focus timer completion, scheduled study alarms, and priority academic deadlines.
        </p>

        {testAlertSent && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Test alert sent! Check your notification bar or screen banner.</span>
          </div>
        )}

        {notificationPermission === 'denied' && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Notifications are blocked</span>
              Please allow notifications for studyzflow in your device settings or browser permissions, then refresh this page.
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {notificationPermission !== 'granted' ? (
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#4338ca] hover:bg-[#3730a3] active:scale-95 text-white font-black text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4 stroke-[2.5]" />
              <span>Enable Notifications</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all border ${
                  settings.notificationsEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {settings.notificationsEnabled ? <Bell className="w-4 h-4 text-emerald-600" /> : <BellOff className="w-4 h-4" />}
                <span>{settings.notificationsEnabled ? 'Notifications On' : 'Notifications Muted'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestNotification}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 font-black text-xs transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Alert</span>
              </button>
            </>
          )}
        </div>
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
              <label className="text-xs font-bold text-slate-500">
                Email
                <input type="email" value={syncEmail} onChange={event => setSyncEmail(event.target.value)} className="glass-input mt-1" placeholder="student@example.edu" />
              </label>
              <label className="text-xs font-bold text-slate-500">
                Password
                <input type="password" value={syncPassword} onChange={event => setSyncPassword(event.target.value)} className="glass-input mt-1" placeholder="••••••••" />
              </label>
            </div>
            {syncError && <p role="alert" className="text-xs font-bold text-rose-600">{syncError}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" disabled={syncBusy || !syncEmail || !syncPassword} onClick={() => void handleCloudAuth(false)} className="glass-primary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs disabled:opacity-50">
                <LogIn className="h-4 w-4" />{syncBusy ? 'Connecting...' : 'Sign in'}
              </button>
              <button type="button" disabled={syncBusy || !syncEmail || !syncPassword} onClick={() => void handleCloudAuth(true)} className="glass-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs disabled:opacity-50">
                Create cloud account
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs font-semibold text-slate-500">
            {lastSyncTime ? `Last synced: ${new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not synced in this session'}
          </div>
          <button
            type="button"
            disabled={!firebaseUser || syncStatus === 'syncing'}
            onClick={() => void triggerSync()}
            className="glass-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync now'}</span>
          </button>
        </div>
      </div>

      {/* 4. Manual Local Data Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <span>Manual Data Backup & Restore</span>
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          Export an offline JSON snapshot of your entire workspace (classes, assignments, notes, timers, focus logs) or restore from a previously saved file.
        </p>

        {importStatus && (
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#4338ca] text-white hover:bg-[#3730a3] font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Backup (.JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2.5 p-4 rounded-2xl border-2 border-dashed border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50 font-black text-sm cursor-pointer transition-all">
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Import Backup (.JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 5. Cross-Platform Information */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <span>Platform & Android Integration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white text-sm block">Capacitor Android Shell</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Native alarms, local notifications, Android 14 edge-to-edge support, and responsive touch layout.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 dark:text-white text-sm block">Web Application</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full offline localStorage support, rich markdown notes, 3D spherical liquid timer, and responsive dashboards.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
