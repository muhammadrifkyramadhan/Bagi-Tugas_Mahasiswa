import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types';
import { getGoogleCalendarUrl } from '../utils/calendar';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Users,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CalendarPlus,
  Radio,
  Layers,
  Activity
} from 'lucide-react';

interface DashboardViewProps {
  onSelectTask: (task: Task) => void;
  onNavigate: (view: any) => void;
  onOpenCreateTask: () => void;
  onOpenExportModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTask,
  onNavigate,
  onOpenCreateTask,
  onOpenExportModal
}) => {
  const { activeGroup, groupTasks, activities } = useApp();
  const { currentUser } = useAuth();

  if (!activeGroup) return null;

  // Metrics
  const totalTasks = groupTasks.length;
  const doneTasks = groupTasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = groupTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = groupTasks.filter(t => t.status === 'IN_REVIEW').length;
  const revisionTasks = groupTasks.filter(t => t.status === 'REVISION').length;

  // Calculate overall group progress percentage based on task weights
  const totalWeight = groupTasks.reduce((acc, t) => acc + (t.weight || 0), 0) || 1;
  const completedWeight = groupTasks
    .filter(t => t.status === 'DONE')
    .reduce((acc, t) => acc + (t.weight || 0), 0);
  const overallProgress = Math.round((completedWeight / totalWeight) * 100);

  // Deadlines approaching (< 3 days or today)
  const now = new Date();
  const upcomingDeadlines = groupTasks
    .filter(t => t.status !== 'DONE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Member contribution breakdown
  const memberContributions = activeGroup.members.map(member => {
    const assigned = groupTasks.filter(t => t.assignedTo.includes(member.userId));
    const finished = assigned.filter(t => t.status === 'DONE');
    const memberTotalWeight = assigned.reduce((acc, t) => acc + (t.weight || 0), 0);
    const memberDoneWeight = finished.reduce((acc, t) => acc + (t.weight || 0), 0);
    const memberProgress = memberTotalWeight > 0 ? Math.round((memberDoneWeight / memberTotalWeight) * 100) : 0;

    return {
      member,
      assignedCount: assigned.length,
      finishedCount: finished.length,
      totalWeight: memberTotalWeight,
      progress: memberProgress
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Academic Problem Context & Solution */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-6 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sistem Monitoring Tugas Kelompok Terintegrasi</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser?.name}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Pembagian tugas kini transparan, terstruktur, dan terpantau secara real-time. Tidak ada lagi tugas rancu di grup WhatsApp, anggota lupa deadline, atau ketimpangan kontribusi dalam kelompok!
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateTask}
              className="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              + Buat Tugas Baru
            </button>
            <button
              onClick={() => onNavigate('kanban')}
              className="px-4 py-2 bg-indigo-900/60 hover:bg-indigo-900/80 text-white rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>Buka Papan Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenExportModal}
              className="px-4 py-2 bg-indigo-900/60 hover:bg-indigo-900/80 text-white rounded-xl text-xs font-bold border border-white/20 transition-all"
            >
              Ekspor Laporan PDF/Excel
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Tugas</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalTasks}</div>
          <div className="mt-1 text-[10px] text-slate-400">Modul terdistribusi</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Tugas Selesai</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{doneTasks}</div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold">{overallProgress}% Progres Tim</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Dikerjakan</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{inProgressTasks}</div>
          <div className="mt-1 text-[10px] text-slate-400">Sedang diproses PIC</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">Siap Review</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{inReviewTasks}</div>
          <div className="mt-1 text-[10px] text-purple-600 font-semibold">Menunggu ACC Ketua</div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Perlu Revisi</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{revisionTasks}</div>
          <div className="mt-1 text-[10px] text-rose-500 font-semibold">Tindakan perbaikan</div>
        </div>
      </div>

      {/* Main Grid: Workload Contribution & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Workload & Individual Contribution Progress */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Workload Progress Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Distribusi Beban & Performa Anggota
                </h3>
                <p className="text-xs text-slate-400">
                  Dosen dan Ketua dapat memantau kontribusi nyata setiap mahasiswa
                </p>
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Lihat Analitik Detail →
              </button>
            </div>

            <div className="space-y-4">
              {memberContributions.map(({ member, assignedCount, finishedCount, totalWeight, progress }) => (
                <div key={member.userId} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {member.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            member.role === 'KETUA' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {member.nim} • {member.specialization || 'Anggota'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                        {progress}%
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {finishedCount}/{assignedCount} Tugas ({totalWeight}% Beban)
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress === 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-indigo-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Evaluation Card if available */}
          {activeGroup.evaluation && (
            <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold text-sm text-purple-950 dark:text-purple-200">
                    Evaluasi Resmi Dosen Pengampu
                  </h3>
                </div>
                <span className="text-xl font-black text-purple-700 dark:text-purple-300">
                  {activeGroup.evaluation.score}/100
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic mb-3">
                "{activeGroup.evaluation.notes}"
              </p>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Dievaluasi oleh: <strong>{activeGroup.evaluation.lecturerName}</strong> pada {new Date(activeGroup.evaluation.evaluationDate).toLocaleDateString('id-ID')}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Upcoming Deadlines & Activity Feed */}
        <div className="space-y-6">
          
          {/* Deadlines Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                Tenggat Waktu Terdekat
              </h3>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Kalender →
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Semua tugas telah diselesaikan!
                </div>
              ) : (
                upcomingDeadlines.map(task => {
                  const isToday = task.dueDate === new Date().toISOString().split('T')[0];
                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                        isToday
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                            {task.title}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            PIC: {task.assignedNames.join(', ')}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          isToday
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {task.dueDate}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-medium">
                          Jam: {task.dueTime || '23:59'} WIB
                        </span>
                        <a
                          href={getGoogleCalendarUrl(task, activeGroup)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                          title="Tambahkan ke Google Calendar"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          <span>Google Cal</span>
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Activity Stream Feed */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Aktivitas Terkini Tim
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">Belum ada aktivitas tercatat</div>
              ) : (
                activities.slice(0, 7).map(act => (
                  <div key={act.id} className="text-xs pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{act.userName}</span>: {act.action}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
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
