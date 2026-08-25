import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, Clock, MapPin, Plus, Trash2, User, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ClassSchedule } from '../../types';

const days: ClassSchedule['dayOfWeek'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getMonday = () => {
  const date = new Date();
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - mondayOffset);
  return date;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const Schedule: React.FC = () => {
  const { schedule, addClass, updateClass, deleteClass } = useApp();
  const currentDay = days[(new Date().getDay() + 6) % 7];
  const [selectedDay, setSelectedDay] = useState<ClassSchedule['dayOfWeek']>(currentDay);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [location, setLocation] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<ClassSchedule['dayOfWeek']>(currentDay);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');

  const weekDates = useMemo(() => {
    const monday = getMonday();
    return days.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return { day, date };
    });
  }, []);

  const selectedDate = weekDates.find(item => item.day === selectedDay)?.date ?? new Date();
  const selectedClasses = schedule.filter(item => item.dayOfWeek === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const openAddClassModal = () => {
    setEditingClassId(null);
    setSubjectName(''); setCode(''); setInstructor(''); setLocation('');
    setDayOfWeek(selectedDay); setStartTime('10:00'); setEndTime('11:30');
    setShowClassModal(true);
  };

  const openEditClassModal = (item: ClassSchedule) => {
    setEditingClassId(item.id); setSubjectName(item.subjectName); setCode(item.code || '');
    setInstructor(item.instructor); setLocation(item.location); setDayOfWeek(item.dayOfWeek);
    setStartTime(item.startTime); setEndTime(item.endTime); setShowClassModal(true);
  };

  const handleSaveClassSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!subjectName.trim() || startTime >= endTime) return;
    const details = { subjectName: subjectName.trim(), code: code.trim(), instructor: instructor.trim() || 'TBA', location: location.trim() || 'TBA', dayOfWeek, startTime, endTime };
    if (editingClassId) updateClass(editingClassId, details);
    else {
      const colors = ['#4338ca', '#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#0284c7'];
      addClass({ ...details, color: colors[schedule.length % colors.length] });
    }
    setSelectedDay(dayOfWeek); setShowClassModal(false);
  };

  return (
    <div className="schedule-page mx-auto min-h-full max-w-5xl px-4 pb-28 pt-6 sm:px-8 sm:pb-10 sm:pt-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{getGreeting()}</p>
          <h1 className="mt-1 max-w-[18ch] text-4xl font-black leading-[1.02] tracking-tight text-slate-950 dark:text-white sm:text-5xl">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(selectedDate)}</h1>
        </div>
        <button type="button" onClick={() => setSelectedDay(currentDay)} aria-label="Jump to today" className="glass-icon-button mt-1 h-14 w-14 rounded-full"><CalendarDays className="h-6 w-6" /></button>
      </div>

      <button type="button" onClick={() => setSelectedDay(currentDay)} className="glass-dark-button mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"><ChevronLeft className="h-4 w-4" />Back to today</button>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8">
        {weekDates.map(({ day, date }) => <button key={day} type="button" onClick={() => setSelectedDay(day)} className={`date-pill shrink-0 ${selectedDay === day ? 'date-pill-active' : ''}`}><span>{day.slice(0, 3).toUpperCase()}</span><strong>{date.getDate()}</strong></button>)}
      </div>

      {selectedClasses.length === 0 ? (
        <div className="flex min-h-[31rem] flex-col items-center justify-center text-center">
          <div className="schedule-empty-icon liquid-glass-panel flex h-36 w-36 items-center justify-center rounded-[2rem]"><CalendarDays className="h-14 w-14 text-slate-500 dark:text-slate-300" /></div>
          <h2 className="mt-8 text-2xl font-black text-slate-950 dark:text-white">No classes on this day</h2>
          <p className="mt-3 max-w-sm text-base font-semibold leading-relaxed text-slate-500 dark:text-slate-400">Add a course with its weekly schedule and sessions will appear here automatically.</p>
          <button type="button" onClick={openAddClassModal} className="glass-dark-button mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm"><Plus className="h-5 w-5" />Add Course</button>
        </div>
      ) : (
        <section className="mt-10 space-y-4">
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Your day</p><h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{selectedClasses.length} {selectedClasses.length === 1 ? 'class' : 'classes'}</h2></div><button type="button" onClick={openAddClassModal} className="glass-primary-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm"><Plus className="h-4 w-4" />Add Course</button></div>
          <div className="space-y-3">{selectedClasses.map(item => <article key={item.id} style={{ borderRightColor: item.color, borderRightWidth: '5px' }} className="schedule-card liquid-glass-panel flex items-center justify-between gap-4 rounded-3xl p-5"><div className="min-w-0"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300"><Clock className="h-4 w-4" />{item.startTime} – {item.endTime}</div><h3 className="mt-2 truncate text-xl font-black text-slate-950 dark:text-white">{item.subjectName}</h3><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400"><span>{item.code || 'Course'}</span><span><MapPin className="mr-1 inline h-3.5 w-3.5" />{item.location}</span><span><User className="mr-1 inline h-3.5 w-3.5" />{item.instructor}</span></div></div><div className="flex shrink-0 items-center gap-1"><button type="button" onClick={() => openEditClassModal(item)} aria-label={`Edit ${item.subjectName}`} className="glass-icon-button"><Edit2 className="h-4 w-4" /></button><button type="button" onClick={() => deleteClass(item.id)} aria-label={`Delete ${item.subjectName}`} className="glass-icon-button text-rose-500"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>
        </section>
      )}

      <button type="button" onClick={openAddClassModal} aria-label="Add course" className="glass-fab"><Plus className="h-7 w-7" /></button>

      {showClassModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/28 p-4"><div className="liquid-glass-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] p-6 shadow-2xl sm:p-8"><h3 className="text-2xl font-black text-slate-950 dark:text-white">{editingClassId ? 'Edit course' : 'Add course'}</h3><form onSubmit={handleSaveClassSubmit} className="mt-6 space-y-4"><div><label className="glass-label">Course name</label><input required value={subjectName} onChange={event => setSubjectName(event.target.value)} className="glass-input" placeholder="e.g. Operating Systems" /></div><div className="grid grid-cols-2 gap-4"><div><label className="glass-label">Course code</label><input value={code} onChange={event => setCode(event.target.value)} className="glass-input" placeholder="CS 320" /></div><div><label className="glass-label">Instructor</label><input value={instructor} onChange={event => setInstructor(event.target.value)} className="glass-input" placeholder="Dr. Taylor" /></div></div><div><label className="glass-label">Location</label><input value={location} onChange={event => setLocation(event.target.value)} className="glass-input" placeholder="Lecture Hall 4B" /></div><div className="grid grid-cols-3 gap-3"><div><label className="glass-label">Day</label><select value={dayOfWeek} onChange={event => setDayOfWeek(event.target.value as ClassSchedule['dayOfWeek'])} className="glass-input">{days.map(day => <option key={day}>{day}</option>)}</select></div><div><label className="glass-label">Start</label><input required type="time" value={startTime} onChange={event => setStartTime(event.target.value)} className="glass-input" /></div><div><label className="glass-label">End</label><input required type="time" value={endTime} onChange={event => setEndTime(event.target.value)} className="glass-input" /></div></div><div className="flex justify-end gap-3 pt-3"><button type="button" onClick={() => setShowClassModal(false)} className="glass-secondary-button">Cancel</button><button type="submit" className="glass-primary-button">{editingClassId ? 'Save changes' : 'Add course'}</button></div></form></div></div>}
    </div>
  );
};
