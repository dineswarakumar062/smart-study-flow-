import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { TaskPriority } from '../../types';
import { useApp } from '../../context/AppContext';

interface QuickTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export const QuickTaskModal: React.FC<QuickTaskModalProps> = ({ open, onClose }) => {
  const { addTask } = useApp();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  if (!open) return null;

  const resetAndClose = () => {
    setTitle('');
    setSubject('');
    setPriority('high');
    setDueDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      subject: subject.trim() || undefined,
      priority,
      dueDate: new Date(`${dueDate}T12:00:00`).toISOString(),
      completed: false,
    });
    resetAndClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/28 p-4" role="dialog" aria-modal="true" aria-labelledby="quick-task-title">
      <div className="liquid-glass-panel w-full max-w-lg rounded-[2rem] p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Quick capture</p>
            <h3 id="quick-task-title" className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Add a new task</h3>
          </div>
          <button type="button" onClick={resetAndClose} aria-label="Close new task dialog" className="glass-icon-button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="quick-task-name" className="glass-label">Task title</label>
            <input id="quick-task-name" autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Review chapter 5" className="glass-input" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label htmlFor="quick-task-subject" className="glass-label">Subject</label>
              <input id="quick-task-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Optional" className="glass-input" />
            </div>
            <div>
              <label htmlFor="quick-task-priority" className="glass-label">Priority</label>
              <select id="quick-task-priority" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className="glass-input">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="quick-task-date" className="glass-label">Due date</label>
              <input id="quick-task-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="glass-input" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={resetAndClose} className="glass-secondary-button">Cancel</button>
            <button type="submit" className="glass-primary-button">Save task</button>
          </div>
        </form>
      </div>
    </div>
  );
};
