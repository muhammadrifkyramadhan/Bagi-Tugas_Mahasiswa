import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CalendarPlus,
  CheckCircle2,
  AlertTriangle,
  FileDown
} from 'lucide-react';

interface CalendarViewProps {
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectTask,
  onOpenCreateTask
}) => {
  const { activeGroup, groupTasks } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  if (!activeGroup) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Calendar calculations
  const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group tasks by date
  const tasksByDate = groupTasks.reduce((acc, t) => {
    acc[t.dueDate] = acc[t.dueDate] || [];
    acc[t.dueDate].push(t);
    return acc;
  }, {} as Record<string, Task[]>);

  // Selected date tasks
  const selectedTasks = tasksByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6">
      
      {/* Calendar Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Kalender Jadwal & Tenggat Waktu Tugas</span>
          </h2>
          <p className="text-xs text-slate-400">
            Terintegrasi langsung dengan Google Calendar untuk kemudahan penjadwalan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 min-w-[130px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Month Grid (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset days */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`blank-${i}`} className="h-20 sm:h-24 p-1.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 opacity-30"></div>
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTasks = tasksByDate[dateStr] || [];
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : isToday
                      ? 'border-amber-400 dark:border-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-amber-500 text-white'
                          : isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden mt-1">
                    {dayTasks.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        className={`text-[9px] font-semibold px-1 py-0.5 rounded truncate ${
                          t.status === 'DONE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[8px] font-bold text-slate-400 pl-1">
                        +{dayTasks.length - 2} lagi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Task Inspector Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Tugas Jatuh Tempo
                </h3>
                <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-0.5">
                  {selectedDateStr}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                {selectedTasks.length} Tugas
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
              {selectedTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic">
                  Tidak ada jadwal deadline pada tanggal ini.
                </div>
              ) : (
                selectedTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-500 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {task.title}
                      </p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Jam: {task.dueTime || '23:59'} WIB</span>
                      <span>Bobot: {task.weight}%</span>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      PIC: {task.assignedNames.join(', ')}
                    </div>

                    {/* Google Calendar Link Button */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <a
                        href={getGoogleCalendarUrl(task, activeGroup)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-[11px]"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Simpan ke Google Calendar</span>
                      </a>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          downloadIcsFile(task, activeGroup);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600"
                        title="Unduh .ics"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
