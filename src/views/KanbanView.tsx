import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, TaskPriority } from '../types';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Link2,
  User,
  ArrowRight,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface KanbanViewProps {
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  onSelectTask,
  onOpenCreateTask
}) => {
  const { activeGroup, groupTasks, updateTaskStatus } = useApp();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  if (!activeGroup) return null;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return groupTasks.filter(task => {
      const matchSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchAssignee =
        selectedAssignee === 'ALL' || task.assignedTo.includes(selectedAssignee);

      const matchPriority =
        selectedPriority === 'ALL' || task.priority === selectedPriority;

      return matchSearch && matchAssignee && matchPriority;
    });
  }, [groupTasks, searchQuery, selectedAssignee, selectedPriority]);

  const columns: { id: TaskStatus; title: string; color: string; bg: string }[] = [
    { id: 'TODO', title: 'Belum Dikerjakan', color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800' },
    { id: 'IN_PROGRESS', title: 'Sedang Dikerjakan', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-900/60' },
    { id: 'IN_REVIEW', title: 'Menunggu Review', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/60 dark:border-purple-900/60' },
    { id: 'REVISION', title: 'Perlu Revisi', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/60' },
    { id: 'DONE', title: 'Selesai', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/60' }
  ];

  const handleNextStatus = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const order: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const currentIndex = order.indexOf(task.status);
    if (currentIndex !== -1 && currentIndex < order.length - 1) {
      updateTaskStatus(task.id, order[currentIndex + 1]);
    }
  };

  const handlePrevStatus = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const order: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const currentIndex = order.indexOf(task.status);
    if (currentIndex > 0) {
      updateTaskStatus(task.id, order[currentIndex - 1]);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama tugas atau penanggung jawab..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Filter by Member */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedAssignee}
              onChange={e => setSelectedAssignee(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Anggota</option>
              {activeGroup.members.map(m => (
                <option key={m.userId} value={m.userId}>
                  {m.name} ({m.nim})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Priority */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="MENDESAK">🔴 Mendesak</option>
            <option value="TINGGI">🟠 Tinggi</option>
            <option value="SEDANG">🟡 Sedang</option>
            <option value="RENDAH">🟢 Rendah</option>
          </select>

          <button
            onClick={onOpenCreateTask}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors ml-auto md:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tugas</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-3 flex flex-col max-h-[calc(100vh-14rem)] ${col.bg}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-xs ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                    {colTasks.length}
                  </span>
                </div>

                {col.id === 'TODO' && (
                  <button
                    onClick={onOpenCreateTask}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Tambah Tugas ke Belum Dikerjakan"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Task Cards List */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-400 italic">
                    Tidak ada tugas
                  </div>
                ) : (
                  colTasks.map(task => {
                    const completedSubs = task.subtasks.filter(s => s.completed).length;
                    const hasPendingRevision = task.revisions.some(r => !r.resolved);

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/80 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        {/* Badges row */}
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              task.priority === 'MENDESAK'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : task.priority === 'TINGGI'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : task.priority === 'SEDANG'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {task.priority}
                          </span>

                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {task.weight}%
                          </span>
                        </div>

                        {/* Task Title */}
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {task.title}
                        </h4>

                        {/* Pending Revision Alert Badge */}
                        {hasPendingRevision && (
                          <div className="mt-2 p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-1.5 text-[10px] text-rose-700 dark:text-rose-300 font-bold">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Perlu Revisi Ketua</span>
                          </div>
                        )}

                        {/* Subtask & Attachments info */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                          {task.subtasks.length > 0 ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-slate-400" />
                              <span>{completedSubs}/{task.subtasks.length} Subtask</span>
                            </span>
                          ) : (
                            <span>Modul Utama</span>
                          )}

                          {task.attachments.length > 0 && (
                            <span className="flex items-center gap-1 text-indigo-500 font-semibold">
                              <Link2 className="w-3 h-3" />
                              <span>{task.attachments.length} Berkas</span>
                            </span>
                          )}
                        </div>

                        {/* Assignee & Deadline Row */}
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {task.assignedNames.slice(0, 3).map((name, i) => (
                              <div
                                key={i}
                                title={name}
                                className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
                              >
                                {name.substring(0, 1).toUpperCase()}
                              </div>
                            ))}
                            {task.assignedNames.length > 3 && (
                              <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                                +{task.assignedNames.length - 3}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{task.dueDate.substring(5)}</span>
                          </div>
                        </div>

                        {/* Status Shift Buttons */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                          {task.status !== 'TODO' && (
                            <button
                              type="button"
                              onClick={e => handlePrevStatus(e, task)}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Kembalikan Status"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          <div className="flex-1"></div>
                          {task.status !== 'DONE' && (
                            <button
                              type="button"
                              onClick={e => handleNextStatus(e, task)}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-[10px] font-bold transition-colors"
                              title="Lanjutkan ke Status Berikutnya"
                            >
                              <span>Lanjut</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
