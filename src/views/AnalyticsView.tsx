import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Award,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  FileText,
  UserCheck,
  Scale
} from 'lucide-react';

interface AnalyticsViewProps {
  onOpenExportModal: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onOpenExportModal }) => {
  const { activeGroup, groupTasks } = useApp();

  if (!activeGroup) return null;

  // General metrics
  const totalTasks = groupTasks.length;
  const completedTasks = groupTasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = groupTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length;
  const revisionTasks = groupTasks.filter(t => t.status === 'REVISION').length;

  const totalWeight = groupTasks.reduce((acc, t) => acc + (t.weight || 0), 0) || 1;
  const completedWeight = groupTasks
    .filter(t => t.status === 'DONE')
    .reduce((acc, t) => acc + (t.weight || 0), 0);
  const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

  // Member-level deep analytics
  const memberAnalytics = activeGroup.members.map(member => {
    const assigned = groupTasks.filter(t => t.assignedTo.includes(member.userId));
    const done = assigned.filter(t => t.status === 'DONE');
    const memberTotalWeight = assigned.reduce((acc, t) => acc + (t.weight || 0), 0);
    const memberDoneWeight = done.reduce((acc, t) => acc + (t.weight || 0), 0);
    const progress = memberTotalWeight > 0 ? Math.round((memberDoneWeight / memberTotalWeight) * 100) : 0;

    // Check revisions
    const revisionsCount = assigned.reduce((acc, t) => acc + t.revisions.length, 0);

    // Scores from Dosen
    const scoredTasks = assigned.filter(t => t.score !== undefined);
    const avgScore = scoredTasks.length > 0
      ? Math.round(scoredTasks.reduce((acc, t) => acc + (t.score || 0), 0) / scoredTasks.length)
      : null;

    // Workload share of total project
    const workloadShare = Math.round((memberTotalWeight / totalWeight) * 100);

    return {
      member,
      assignedCount: assigned.length,
      doneCount: done.length,
      totalWeight: memberTotalWeight,
      workloadShare,
      progress,
      revisionsCount,
      avgScore
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Dashboard Analitik Kinerja & Kontribusi Kelompok</span>
          </h2>
          <p className="text-xs text-slate-400">
            Audit pembagian tugas, beban kerja proporsional, dan ketepatan waktu anggota
          </p>
        </div>

        <button
          onClick={onOpenExportModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Ekspor Laporan Analitik</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400">Penyelesaian Keseluruhan</span>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {completionPercentage}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400">Kapasitas Tugas Selesai</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {completedTasks} / {totalTasks}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{completedWeight}% dari 100% total bobot</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400">Tugas Sedang Dikerjakan</span>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {inProgressTasks}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Dalam pengerjaan & review</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400">Tingkat Kualitas & Revisi</span>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {revisionTasks}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Modul sedang disempurnakan</p>
        </div>
      </div>

      {/* Workload Distribution Visual Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Proporsi Beban Kerja Tim (Workload Fairness)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Menilai apakah pembagian beban tugas sudah merata dan adil antar mahasiswa
            </p>
          </div>
        </div>

        {/* Stacked Workload Bar */}
        <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
          {memberAnalytics.map((item, idx) => {
            const colors = [
              'bg-indigo-600',
              'bg-blue-500',
              'bg-emerald-500',
              'bg-amber-500',
              'bg-purple-500'
            ];
            return (
              <div
                key={item.member.userId}
                title={`${item.member.name}: ${item.workloadShare}%`}
                className={`h-full ${colors[idx % colors.length]} transition-all duration-500 hover:opacity-90`}
                style={{ width: `${Math.max(item.workloadShare, 5)}%` }}
              ></div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-1 text-xs">
          {memberAnalytics.map((item, idx) => {
            const dotColors = [
              'bg-indigo-600',
              'bg-blue-500',
              'bg-emerald-500',
              'bg-amber-500',
              'bg-purple-500'
            ];
            return (
              <div key={item.member.userId} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`}></span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.member.name}:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{item.workloadShare}% Beban</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Scorecard Table */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>Matriks Rapor Performa Individual Anggota</span>
          </h3>
          <span className="text-xs text-slate-400">
            {activeGroup.members.length} Mahasiswa
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th className="py-3 px-4">Nama & NIM Mahasiswa</th>
                <th className="py-3 px-4">Peran & Spesialisasi</th>
                <th className="py-3 px-4 text-center">Beban Alokasi</th>
                <th className="py-3 px-4 text-center">Tugas Diselesaikan</th>
                <th className="py-3 px-4 text-center">Progres Selesai</th>
                <th className="py-3 px-4 text-center">Catatan Revisi</th>
                <th className="py-3 px-4 text-center">Rata-rata Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {memberAnalytics.map(item => (
                <tr key={item.member.userId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {item.member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{item.member.name}</p>
                        <p className="text-[10px] text-slate-400">{item.member.nim}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.member.specialization || item.member.role}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                    {item.totalWeight}% ({item.assignedCount} Tugas)
                  </td>

                  <td className="py-3 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.doneCount} / {item.assignedCount} Tugas
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">{item.progress}%</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {item.revisionsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                        {item.revisionsCount} Kali
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold">0 (Bagus)</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {item.avgScore !== null ? (
                      <span className="font-extrabold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {item.avgScore}/100
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Belum dinilai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
