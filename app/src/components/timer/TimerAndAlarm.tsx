import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Pause, RotateCcw, SkipForward, Award, Sparkles, Edit3, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cancelTimerNotification, notifyTimerComplete, scheduleTimerNotification } from '../../services/notifications';

export const TimerAndAlarm: React.FC = () => {
  const { settings, updateSettings, logSession, sessions, schedule } = useApp();

  type TimerMode = 'pomodoro' | 'shortBreak';
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isEditingDurations, setIsEditingDurations] = useState(false);

  // Local state for duration editing
  const [customFocusMins, setCustomFocusMins] = useState(settings.pomodoroMinutes);
  const [customShortBreakMins, setCustomShortBreakMins] = useState(settings.shortBreakMinutes);

  const getDuration = (m: TimerMode) => {
    switch (m) {
      case 'pomodoro': return settings.pomodoroMinutes * 60;
      case 'shortBreak': return settings.shortBreakMinutes * 60;
    }
  };

  const [timeLeft, setTimeLeft] = useState<number>(getDuration('pomodoro'));
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(schedule[0]?.subjectName || 'General Study');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationIdRef = useRef(0);

  // Update timer when settings or mode changes
  useEffect(() => {
    setTimeLeft(getDuration(mode));
    setIsRunning(false);
  }, [mode, settings.pomodoroMinutes, settings.shortBreakMinutes]);

  // Web Audio API Synthesizer Alarm Bell Chime
  const playAlarmSound = () => {
    if (!settings.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Play rich double chime
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.9);
      });
    } catch {
      // Ignore audio context errors
    }
  };

  // Timer Tick interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playAlarmSound();
            if (settings.notificationsEnabled) {
              void notifyTimerComplete(selectedSubject);
            }

            confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });

            // Log session if pomodoro
            if (mode === 'pomodoro') {
              logSession({
                subject: selectedSubject,
                durationMinutes: settings.pomodoroMinutes,
                type: 'pomodoro',
              });
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedSubject, settings.pomodoroMinutes]);

  const handleReset = () => {
    setIsRunning(false);
    if (notificationIdRef.current) void cancelTimerNotification(notificationIdRef.current);
    setTimeLeft(getDuration(mode));
  };

  const handleModeChange = (newMode: TimerMode) => {
    if (notificationIdRef.current) void cancelTimerNotification(notificationIdRef.current);
    setMode(newMode);
  };

  const handleRunToggle = async () => {
    if (isRunning) {
      if (notificationIdRef.current) await cancelTimerNotification(notificationIdRef.current);
      setIsRunning(false);
      return;
    }

    if (settings.notificationsEnabled) {
      notificationIdRef.current = Date.now() % 2147483647;
      await scheduleTimerNotification(notificationIdRef.current, selectedSubject, timeLeft);
    }
    setIsRunning(true);
  };

  const handleSaveDurations = () => {
    updateSettings({
      pomodoroMinutes: Math.min(120, Math.max(1, Number(customFocusMins) || 25)),
      shortBreakMinutes: Math.min(30, Math.max(1, Number(customShortBreakMins) || 5)),
    });
    setIsEditingDurations(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const maxSecs = getDuration(mode);
  const progressPercent = ((maxSecs - timeLeft) / maxSecs) * 100;

  const getIndicatorTransform = () => {
    switch (mode) {
      case 'pomodoro': return 'translate-x-0';
      case 'shortBreak': return 'translate-x-[calc(100%+4px)]';
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      
      {/* 3-Way Sliding Segmented Navigation Tabs (Liquid Orange Background Effect) */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        <div className="relative flex-1 flex items-center p-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          {/* Animated Liquid Orange Sliding Background Indicator */}
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-4px)] rounded-full liquid-orange-pill text-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${getIndicatorTransform()}`}
          />

          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`relative z-10 flex-1 flex items-center justify-center py-2.5 rounded-full font-black text-xs transition-colors ${
              mode === 'pomodoro'
                ? 'text-white drop-shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Focus ({settings.pomodoroMinutes}m)
          </button>

          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`relative z-10 flex-1 flex items-center justify-center py-2.5 rounded-full font-black text-xs transition-colors ${
              mode === 'shortBreak'
                ? 'text-white drop-shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Short ({settings.shortBreakMinutes}m)
          </button>

        </div>

        <button
          onClick={() => setIsEditingDurations(!isEditingDurations)}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 border border-slate-200 dark:border-slate-800 transition-colors shadow-xs"
          title="Edit Custom Durations"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Custom Duration Editor Overlay */}
      {isEditingDurations && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-4 shadow-xl">
          <h4 className="font-black text-sm text-slate-900 dark:text-white font-headline">Custom Timer Durations (Minutes)</h4>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Focus</label>
              <input
                type="number"
                min={1}
                max={120}
                value={customFocusMins}
                onChange={(e) => setCustomFocusMins(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold border border-slate-200 dark:border-slate-700 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-bold">Short Break</label>
              <input
                type="number"
                min={1}
                max={30}
                value={customShortBreakMins}
                onChange={(e) => setCustomShortBreakMins(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold border border-slate-200 dark:border-slate-700 focus:border-indigo-600"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditingDurations(false)}
              className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDurations}
              className="px-5 py-1.5 text-xs font-black bg-[#4338ca] text-white rounded-xl shadow-xs"
            >
              Save Durations
            </button>
          </div>
        </div>
      )}

      {/* Timer Circle Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-md mx-auto text-center space-y-8 relative overflow-hidden">
        
        {/* Subject Tag Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            Target Focus Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold rounded-2xl py-2 px-4 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="General Study">General Study</option>
            <option value="Data Structures">Data Structures</option>
            <option value="Linear Algebra">Linear Algebra</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="UI/UX Design">UI/UX Design</option>
          </select>
        </div>

        {/* Circular Ring Timer */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r="110"
              className="stroke-orange-500 transition-all duration-1000 ease-linear"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center space-y-1">
            <span className="text-5xl sm:text-6xl font-black font-headline tracking-tight text-slate-900 dark:text-white">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>{mode === 'pomodoro' ? 'Deep Focus Session' : 'Rest & Recharge'}</span>
            </span>
          </div>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={handleReset}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => void handleRunToggle()}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={() => handleModeChange(mode === 'pomodoro' ? 'shortBreak' : 'pomodoro')}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
            title="Skip Mode"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Completed Study Sessions Today */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-3xl mx-auto space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Completed Focus Sessions ({sessions.length})</span>
        </h3>

        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No focus sessions recorded yet today. Hit play above to begin!</p>
        ) : (
          <div className="space-y-2.5">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{s.subject}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <span className="font-black text-orange-600 font-headline text-base">
                  +{s.durationMinutes} mins
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
