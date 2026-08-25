import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { TaskPriority, TaskItem, NoteItem } from '../../types';
import { 
  FileText, 
  CheckSquare, 
  Plus, 
  Pin, 
  Trash2, 
  Tag, 
  Calendar as CalendarIcon, 
  Sparkles,
  Edit2,
  Maximize2,
  X,
  BookOpen,
  ListPlus
} from 'lucide-react';

type TaskFilter = 'all' | 'high' | 'overdue' | 'completed';

const getCardAccent = (value: string) => {
  const palette = ['#4f46e5', '#10b981', '#8b5cf6', '#f59e0b', '#0ea5e9', '#ec4899'];
  return palette[Math.abs([...value].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % palette.length];
};

const isOverdue = (dueDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

export const NotesAndTasks: React.FC = () => {
  const { 
    notes, 
    addNote, 
    updateNote, 
    deleteNote, 
    togglePinNote, 
    tasks, 
    addTask,
    updateTask, 
    toggleTask, 
    deleteTask,
    toggleSubtask,
    addSubtask
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'tasks'>('notes');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState('');

  // Full Page Reader Modal state
  const [fullPageNote, setFullPageNote] = useState<NoteItem | null>(null);

  // New Note Modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('Data Structures');
  const [noteTags, setNoteTags] = useState('notes, cs');
  const [noteContent, setNoteContent] = useState('');

  // Task Modal state (Add / Edit)
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskSubject, setTaskSubject] = useState('Data Structures');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('high');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Notes keep subject filtering; tasks use the four focused status categories below.
  const filteredNotes = notes.filter(n => {
    const matchesSubject = filterSubject === 'all' || n.subject === filterSubject;
    return matchesSubject;
  });

  const filteredTasks = tasks
    .filter(task => {
      if (taskFilter === 'high') return task.priority === 'high' && !task.completed;
      if (taskFilter === 'overdue') return isOverdue(task.dueDate) && !task.completed;
      if (taskFilter === 'completed') return task.completed;
      return true;
    })
    .sort((a, b) => Number(a.completed) - Number(b.completed) || a.dueDate.localeCompare(b.dueDate));

  const subjects = Array.from(new Set([...notes.map(n => n.subject), ...tasks.map(t => t.subject).filter(Boolean)]))
    .filter((subject): subject is string => Boolean(subject));

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    addNote({
      title: noteTitle.trim(),
      subject: noteSubject,
      tags: noteTags.split(',').map(t => t.trim()).filter(Boolean),
      content: noteContent || 'Start typing your study notes here...',
      isPinned: false,
    });
    setNoteTitle('');
    setNoteContent('');
    setShowNoteModal(false);
  };

  const openAddTaskModal = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskSubject('Data Structures');
    setTaskPriority('high');
    setTaskDueDate(new Date().toISOString().split('T')[0]);
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskSubject(task.subject || 'Data Structures');
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate.split('T')[0]);
    setShowTaskModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: taskTitle.trim(),
        description: taskDesc,
        subject: taskSubject,
        priority: taskPriority,
        dueDate: new Date(taskDueDate).toISOString(),
      });
    } else {
      addTask({
        title: taskTitle.trim(),
        description: taskDesc,
        subject: taskSubject,
        priority: taskPriority,
        dueDate: new Date(taskDueDate).toISOString(),
        completed: false,
      });
    }

    setShowTaskModal(false);
  };

  const handleToggleTaskCheck = (id: string) => {
    toggleTask(id);
  };

  const handleAddSubtask = (taskId: string) => {
    if (!subtaskTitle.trim()) return;
    addSubtask(taskId, subtaskTitle);
    setSubtaskTitle('');
    setAddingSubtaskFor(null);
  };

  return (
    <div className="tasks-page p-3 sm:p-8 max-w-7xl mx-auto space-y-5">
      
      {/* =========================================================================
          SLIDING SEGMENTED NAVIGATION TOGGLE (Liquid Orange Sliding Pill)
          ========================================================================= */}
      <div className="flex flex-col items-center justify-center space-y-4">
        
        {/* Floating Sliding Pill Control */}
        <div className="relative flex items-center p-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md max-w-xs w-full">
          {/* Animated Liquid Orange Sliding Background Indicator */}
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full liquid-orange-pill text-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              activeSubTab === 'notes' ? 'translate-x-0' : 'translate-x-[calc(100%+6px)]'
            }`}
          />

          <button
            onClick={() => setActiveSubTab('notes')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black transition-colors ${
              activeSubTab === 'notes' ? 'text-white drop-shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black transition-colors ${
              activeSubTab === 'tasks' ? 'text-white drop-shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>To-Do ({tasks.length})</span>
          </button>
        </div>

        {/* Compact filters; task status filters replace the old subject/search controls. */}
        <div className="flex w-full max-w-4xl items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {(activeSubTab === 'tasks'
              ? (['all', 'high', 'overdue', 'completed'] as TaskFilter[]).map(filter => (
              <button key={filter} onClick={() => setTaskFilter(filter)} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${taskFilter === filter ? 'bg-[#4338ca] text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                {filter === 'high' ? 'High Priority' : filter[0].toUpperCase() + filter.slice(1)}
              </button>
            ))
              : [
                <button key="all" onClick={() => setFilterSubject('all')} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${filterSubject === 'all' ? 'bg-[#4338ca] text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>All</button>,
                ...subjects.map(subj => (
              <button
                key={subj}
                onClick={() => setFilterSubject(subj)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterSubject === subj
                    ? 'bg-[#4338ca] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {subj}
              </button>
            ))
              ])}
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN CONTENT: Notes Grid vs Tasks To-Do List
          ========================================================================= */}
      {activeSubTab === 'notes' ? (
        /* NOTES GRID VIEW WITH FULL PAGE READER OVERLAY */
        <div className="space-y-6">
          {filteredNotes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center text-slate-400 space-y-3 border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto opacity-60" />
              <p className="font-bold text-base text-slate-800 dark:text-slate-200">No study notes found!</p>
              <p className="text-xs">Click "+ Create Note" above to write your lecture summary.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setFullPageNote(n)}
                  style={{ borderLeftColor: getCardAccent(n.subject), borderLeftWidth: '5px' }}
                  className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 bouncy-hover cursor-pointer flex flex-col justify-between space-y-4 group shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-black px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                        {n.subject}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePinNote(n.id); }}
                          className={`p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 ${n.isPinned ? 'text-amber-500' : 'text-slate-400'}`}
                          title={n.isPinned ? 'Unpin Note' : 'Pin Note'}
                        >
                          <Pin className="w-4 h-4 fill-current" />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNote(n.id); }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {n.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-mono opacity-90">
                      {n.content.replace(/[#*`$]/g, '')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {n.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setFullPageNote(n); }}
                      className="flex items-center gap-1 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline group-hover:translate-x-1 transition-transform"
                    >
                      <span>Open Note</span>
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TASKS TO-DO LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span>Assignments & Action Items</span>
            </h3>
            <span className="text-xs font-black text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50">
              {tasks.filter(t => t.completed).length} / {tasks.length} Completed
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Sparkles className="w-10 h-10 text-indigo-600 mx-auto opacity-50" />
              <p className="font-bold text-base text-slate-800 dark:text-slate-200">No tasks found!</p>
            </div>
          ) : (
              <div className="space-y-2">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  style={{ borderLeftColor: getCardAccent(t.subject || t.priority), borderLeftWidth: '5px' }}
                  className="task-card p-3 sm:p-4 rounded-2xl bg-white/72 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-all border border-indigo-100/80 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggleTaskCheck(t.id)}
                      className="mt-1 w-5 h-5 rounded-md border-2 border-indigo-600 text-indigo-600 focus:ring-indigo-600 cursor-pointer accent-indigo-600 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className={`font-bold text-slate-900 dark:text-white text-base ${t.completed ? 'line-through opacity-50' : ''}`}>
                          {t.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 text-xs font-black rounded-lg uppercase tracking-wider ${
                            t.priority === 'high' 
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60' 
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60'
                          }`}>
                            {t.priority}
                          </span>

                          <button
                            onClick={() => openEditTaskModal(t)}
                            aria-label={`Edit ${t.title}`}
                            className="glass-icon-button h-8 w-8 p-1.5 text-slate-400 hover:text-indigo-600"
                            title="Edit Task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteTask(t.id)}
                            aria-label={`Delete ${t.title}`}
                            className="glass-icon-button h-8 w-8 p-1.5 text-slate-400 hover:text-rose-500"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {t.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        {t.subject && (
                          <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                            {t.subject}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-medium">
                          <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subtasks if present */}
                  {t.subtasks && t.subtasks.length > 0 && (
                    <div className="task-subtasks ml-9 pt-2 border-t border-indigo-100 dark:border-slate-700 space-y-1">
                      {t.subtasks.map(sub => (
                        <label key={sub.id} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => toggleSubtask(t.id, sub.id)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 accent-indigo-600"
                          />
                          <span className={sub.completed ? 'line-through text-slate-400' : ''}>
                            {sub.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {addingSubtaskFor === t.id ? (
                    <div className="ml-9 flex items-center gap-2">
                      <input
                        autoFocus
                        value={subtaskTitle}
                        onChange={(event) => setSubtaskTitle(event.target.value)}
                        onKeyDown={(event) => { if (event.key === 'Enter') handleAddSubtask(t.id); }}
                        placeholder="Subtask name"
                        className="glass-input py-2 text-xs"
                      />
                      <button type="button" onClick={() => handleAddSubtask(t.id)} className="glass-primary-button shrink-0 rounded-full px-3 py-2 text-xs">Add</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setAddingSubtaskFor(t.id); setSubtaskTitle(''); }} className="task-add-subtask ml-9 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black">
                      <ListPlus className="h-3.5 w-3.5" /> Add subtask
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={activeSubTab === 'notes' ? () => setShowNoteModal(true) : openAddTaskModal}
        aria-label={activeSubTab === 'notes' ? 'Create note' : 'Add task'}
        className="tasks-fab glass-fab"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* FULL PAGE NOTE READER & EDITOR OVERLAY MODAL */}
      {fullPageNote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full h-[90vh] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {fullPageNote.subject}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-headline line-clamp-1">
                  {fullPageNote.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePinNote(fullPageNote.id)}
                  className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 ${fullPageNote.isPinned ? 'text-amber-500' : 'text-slate-400'}`}
                  title="Toggle Pin"
                >
                  <Pin className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={() => setFullPageNote(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Note Editor Body */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-4">
              <input
                type="text"
                value={fullPageNote.title}
                onChange={(e) => {
                  const updated = { ...fullPageNote, title: e.target.value };
                  setFullPageNote(updated);
                  updateNote(fullPageNote.id, { title: e.target.value });
                }}
                className="text-3xl font-black text-slate-900 dark:text-white font-headline bg-transparent border-none focus:outline-none w-full"
                placeholder="Note Title..."
              />

              <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                {fullPageNote.tags.map(t => (
                  <span key={t} className="text-xs text-indigo-600 font-bold flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    <Tag className="w-3 h-3" />
                    #{t}
                  </span>
                ))}
                <span className="text-xs text-slate-400 ml-auto">
                  Updated {new Date(fullPageNote.updatedAt).toLocaleString()}
                </span>
              </div>

              <textarea
                value={fullPageNote.content}
                onChange={(e) => {
                  const updated = { ...fullPageNote, content: e.target.value };
                  setFullPageNote(updated);
                  updateNote(fullPageNote.id, { content: e.target.value });
                }}
                className="w-full min-h-[500px] bg-transparent text-slate-800 dark:text-slate-200 text-base leading-relaxed border-none focus:outline-none resize-none font-mono"
                placeholder="Type your markdown notes here..."
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setFullPageNote(null)}
                className="px-6 py-2.5 rounded-2xl bg-[#4338ca] text-white font-black text-sm shadow-md hover:bg-[#3730a3]"
              >
                Close & Save Note
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Create Note */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-headline">Create New Lecture Note</h3>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Graph Algorithms Overview"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-4 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                  <input
                    type="text"
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-4 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-4 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Content</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={5}
                  placeholder="Write initial note summary..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-4 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none resize-none font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#4338ca] text-white text-sm font-black shadow-md hover:bg-[#3730a3]"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-headline">
              {editingTaskId ? 'Edit Assignment' : 'Add New Assignment'}
            </h3>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Prepare for Linear Algebra Midterm"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-4 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <input
                  type="text"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Optional details or subtask instructions"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-4 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                  <input
                    type="text"
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-4 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-3 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none font-bold"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl py-2.5 px-2 text-sm border border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#4338ca] text-white text-sm font-black shadow-md hover:bg-[#3730a3]"
                >
                  {editingTaskId ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
