import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plus, 
  Timer, 
  BookOpen, 
  Flame, 
  Sparkles,
  Calendar,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuickTaskModal } from '../tasks/QuickTaskModal';

export const Dashboard: React.FC = () => {
  const { 
    profile, 
    tasks, 
    toggleTask, 
    schedule, 
    sessions,
    setActiveTab, 
  } = useApp();
  const [quickTaskOpen, setQuickTaskOpen] = React.useState(false);

  const priorityTasks = tasks.filter(t => !t.completed);
  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const formatDueDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'No due date' : date.toISOString().split('T')[0];
  };

  // Find today's classes
  const days: Array<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const todayName = days[new Date().getDay()];
  const todayClasses = schedule.filter(c => c.dayOfWeek === todayName);
  const displayClasses = todayClasses.length > 0 ? todayClasses : schedule.slice(0, 3);

  const sessionDays = new Set(sessions.map(session => new Date(session.completedAt).toDateString()));
  let studyStreak = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    if (!sessionDays.has(date.toDateString())) break;
    studyStreak += 1;
  }

  const handleToggleTask = (id: string) => {
    toggleTask(id);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  // Helper for lecture type styling
  const getTypeBadge = (index: number, subjectName: string) => {
    const lower = subjectName.toLowerCase();
    if (lower.includes('lab') || lower.includes('algebra') || index === 1) {
      return {
        pill: 'LAB',
        code: `LAB #${index + 1}`,
        style: 'bg-purple-100/90 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60'
      };
    }
    if (lower.includes('wellness') || lower.includes('data') || lower.includes('seminar') || index === 0) {
      return {
        pill: 'SEMINAR',
        code: `SEM #${index + 1}`,
        style: 'bg-emerald-100/90 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
      };
    }
    return {
      pill: 'LECTURE',
      code: `LEC #${index + 1}`,
      style: 'bg-indigo-100/90 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60'
    };
  };

  return (
    <div className="dashboard-page p-3 sm:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      
      {/* =========================================================================
          1. HERO BANNER (Pixel Match with Royal Electric Indigo Gradient)
          ========================================================================= */}
      <div className="hero-banner-gradient text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/25">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-current" />
            <span>{profile.academicYear || 'Current academic term'}</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-headline">
            Welcome back, {profile.name.split(' ')[0] || 'Alex'}! 👋
          </h2>

          {/* Subtitle */}
          <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed">
            You have <span className="font-bold underline decoration-white/40">{displayClasses.length} classes</span> scheduled for today and <span className="font-bold underline decoration-white/40">{priorityTasks.length} pending tasks</span>. Stay focused and keep your streak!
          </p>
        </div>

        {/* Action Buttons inside Banner */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setQuickTaskOpen(true)}
            className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-slate-50 active:scale-95 px-5 py-3 rounded-2xl font-black text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Task</span>
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:scale-95 text-white px-5 py-3 rounded-2xl font-bold text-sm border border-white/30 backdrop-blur-md transition-all"
          >
            <Timer className="w-4 h-4" />
            <span>Start Focus</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. METRICS ROW: 4 STAT CARDS (Bright Icons & Crisp Labels)
          ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Study Streak */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/90 dark:bg-amber-950/70 text-amber-500 flex items-center justify-center shadow-xs shrink-0">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Study Streak</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-headline mt-0.5 block">
              {studyStreak} {studyStreak === 1 ? 'Day' : 'Days'}
            </span>
          </div>
        </div>

        {/* Card 2: Today's Classes */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100/90 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs shrink-0">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Today's Classes</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-headline mt-0.5 block">
              {displayClasses.length}
            </span>
          </div>
        </div>

        {/* Card 3: Tasks Done */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Tasks Done</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-headline mt-0.5 block">
              {completionRate}%
            </span>
          </div>
        </div>

        {/* Card 4: Target GPA */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-purple-100/90 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs shrink-0">
            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Target GPA</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-headline mt-0.5 block">
              {profile.targetGpa || '3.9'}
            </span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          3. MAIN CONTENT: Today's Schedule (Left) + Priority Tasks & Exam (Right)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column: Today's Schedule (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline">Today's Schedule</h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                {todayName}
              </span>
            </div>

            <button
              onClick={() => setActiveTab('schedule')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View Full Week →
            </button>
          </div>

          {/* Schedule List */}
          <div className="space-y-3.5">
            {displayClasses.map((item, idx) => {
              const badge = getTypeBadge(idx, item.subjectName);

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* High-Contrast Color Code Badge */}
                    <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-black text-xs leading-none shrink-0 ${badge.style}`}>
                      <span className="text-[10px] uppercase font-bold">{badge.code.split(' ')[0]}</span>
                      <span className="text-sm font-black mt-0.5">{badge.code.split(' ')[1]}</span>
                    </div>

                    {/* Class Details */}
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg font-headline truncate">
                        {item.subjectName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          {item.startTime} – {item.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.location}
                        </span>
                        <span className="truncate">
                          {item.instructor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Type Tag */}
                  <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shrink-0">
                    {badge.pill}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Priority Tasks & Upcoming Exam Card (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Priority Tasks Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-headline">Priority Tasks</h3>
              </div>
              <button
                onClick={() => setActiveTab('notes')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All ({priorityTasks.length})
              </button>
            </div>

            {priorityTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">All tasks completed! 🎉</p>
            ) : (
              <div className="space-y-3">
                {priorityTasks.slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all border border-slate-200/80 dark:border-slate-700 flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => handleToggleTask(t.id)}
                        className="mt-0.5 w-4 h-4 rounded-md border-2 border-indigo-600 text-indigo-600 focus:ring-indigo-600 cursor-pointer accent-indigo-600 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {t.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {t.subject || 'Operating Systems'} • Due {formatDueDate(t.dueDate)}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 shrink-0">
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
      <QuickTaskModal open={quickTaskOpen} onClose={() => setQuickTaskOpen(false)} />
    </div>
  );
};
