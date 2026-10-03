import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus } from '../types';
import { getGoogleCalendarUrl } from '../utils/calendar';
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  CalendarPlus,
  Plus,
  Award
} from 'lucide-react';

interface ListViewProps {
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
}

export const ListView: React.FC<ListViewProps> = ({
  onSelectTask,
  onOpenCreateTask
}) => {
  const { activeGroup, groupTasks, updateTaskStatus } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'dueDate' | 'priority' | 'weight' | 'title'>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  if (!activeGroup) return null;

  const filteredTasks = useMemo(() => {
    return groupTasks
      .filter(t => {
        const matchSearch =
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.assignedNames.some(name => name.toLowerCase().includes(search.toLowerCase()));
        const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === 'dueDate') {
          valA = new Date(a.dueDate).getTime();
          valB = new Date(b.dueDate).getTime();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [groupTasks, search, statusFilter, sortField, sortAsc]);

  const handleSort = (field: 'dueDate' | 'priority' | 'weight' | 'title') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari tugas atau nama penanggung jawab..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="TODO">Belum Dikerjakan</option>
              <option value="IN_PROGRESS">Sedang Dikerjakan</option>
              <option value="IN_REVIEW">Menunggu Review</option>
              <option value="REVISION">Perlu Revisi</option>
              <option value="DONE">Selesai</option>
            </select>
          </div>

          <button
            onClick={onOpenCreateTask}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors ml-auto md:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Tugas & Rincian</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Penanggung Jawab (PIC)</th>
                <th
                  onClick={() => handleSort('weight')}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Bobot</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th
                  onClick={() => handleSort('dueDate')}
                  className="py-3 px-4 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Deadline</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Subtask</th>
                <th className="py-3 px-4 text-center">Nilai Dosen</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    Tidak ada tugas yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const completedSubs = task.subtasks.filter(s => s.completed).length;
                  const isToday = task.dueDate === new Date().toISOString().split('T')[0];

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Title & Priority */}
                      <td className="py-3 px-4 min-w-[220px]">
                        <div className="flex items-start gap-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${
                              task.priority === 'MENDESAK' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                              task.priority === 'TINGGI' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                              task.priority === 'SEDANG' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                              {task.title}
                            </p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {task.description || 'Tidak ada deskripsi rinci'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PIC */}
                      <td className="py-3 px-4 min-w-[150px]">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {task.assignedNames.join(', ')}
                          </span>
                        </div>
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {task.weight}%
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                            task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                            task.status === 'IN_REVIEW' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                            task.status === 'REVISION' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {task.status === 'DONE' ? 'Selesai' :
                           task.status === 'IN_PROGRESS' ? 'Sedang Dikerjakan' :
                           task.status === 'IN_REVIEW' ? 'Menunggu Review' :
                           task.status === 'REVISION' ? 'Perlu Revisi' : 'Belum Mulai'}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Calendar className={`w-3.5 h-3.5 ${isToday ? 'text-rose-500' : 'text-slate-400'}`} />
                          <span className={isToday ? 'text-rose-600 font-bold' : ''}>{task.dueDate}</span>
                          <span className="text-[10px] text-slate-400">({task.dueTime || '23:59'})</span>
                        </div>
                      </td>

                      {/* Subtasks */}
                      <td className="py-3 px-4 text-center whitespace-nowrap text-slate-500">
                        {task.subtasks.length > 0 ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {completedSubs}/{task.subtasks.length}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Lecturer Score */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {task.score !== undefined ? (
                          <span className="font-extrabold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            {task.score}/100
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <a
                          href={getGoogleCalendarUrl(task, activeGroup)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-bold hover:bg-blue-100 transition-colors"
                          title="Tambah ke Google Calendar"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          <span>Google Cal</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
