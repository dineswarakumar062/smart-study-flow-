import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export type NotificationPermission = 'granted' | 'denied' | 'prompt' | 'unsupported';

export async function getNotificationPermission(): Promise<NotificationPermission> {
  try {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted' ? 'granted' : result.display === 'denied' ? 'denied' : 'prompt';
    }

    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission === 'default' ? 'prompt' : Notification.permission;
  } catch {
    return 'unsupported';
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    }

    if (typeof Notification === 'undefined') return false;
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

export async function sendTestNotification(): Promise<boolean> {
  const permission = await getNotificationPermission();
  if (permission !== 'granted') return false;

  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [{
          id: Math.floor(Math.random() * 100000) + 1,
          title: 'studyzflow Notifications Active! 🎓',
          body: 'You will receive alerts for focus timers and study alarms.',
          schedule: { at: new Date(Date.now() + 400) },
        }],
      });
      return true;
    }

    if (typeof Notification !== 'undefined') {
      new Notification('studyzflow Notifications Active! 🎓', {
        body: 'You will receive alerts for focus timers and study alarms.',
        icon: '/favicon.svg',
      });
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export async function notifyTimerComplete(subject: string): Promise<void> {
  if (Capacitor.isNativePlatform()) return;
  const permission = await getNotificationPermission();
  if (permission !== 'granted') return;

  try {
    new Notification('Focus session complete', {
      body: `${subject} focus time is finished. Take a short break.`,
      icon: '/favicon.svg',
      tag: 'studyflow-timer',
    });
  } catch {
    // Notification support can be unavailable in restricted webviews.
  }
}

export async function scheduleTimerNotification(id: number, subject: string, seconds: number): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || (await getNotificationPermission()) !== 'granted') return false;

  try {
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: 'Focus session complete',
        body: `${subject} focus time is finished. Take a short break.`,
        schedule: { at: new Date(Date.now() + Math.max(1, seconds) * 1000) },
      }],
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelTimerNotification(id: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch {
    // The notification may already have fired or been dismissed.
  }
}

const alarmNotificationId = (alarmId: string) => Math.abs([...alarmId].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7)) % 2147483647;

export async function scheduleAlarmNotification(alarmId: string, label: string, time: string, repeat: 'once' | 'daily'): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || (await getNotificationPermission()) !== 'granted') return false;
  const [hour, minute] = time.split(':').map(Number);
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
  try {
    await LocalNotifications.schedule({ notifications: [{ id: alarmNotificationId(alarmId), title: label || 'studzflow alarm', body: 'Your scheduled study alarm is ready.', schedule: repeat === 'daily' ? { on: { hour, minute } } : { at: next } }] });
    return true;
  } catch { return false; }
}

export async function cancelAlarmNotification(alarmId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try { await LocalNotifications.cancel({ notifications: [{ id: alarmNotificationId(alarmId) }] }); } catch { /* already cleared */ }
}
