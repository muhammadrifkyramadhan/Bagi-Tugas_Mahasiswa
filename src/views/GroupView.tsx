import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Copy,
  Check,
  UserPlus,
  Shield,
  Mail,
  GraduationCap,
  Calendar,
  Building,
  KeyRound
} from 'lucide-react';

interface GroupViewProps {
  onOpenAddMember: () => void;
  onOpenCreateGroup: () => void;
}

export const GroupView: React.FC<GroupViewProps> = ({
  onOpenAddMember,
  onOpenCreateGroup
}) => {
  const { activeGroup, groupTasks } = useApp();
  const { currentUser } = useAuth();

  const [copiedCode, setCopiedCode] = useState(false);

  if (!activeGroup) return null;

  const isLeader = currentUser?.role === 'KETUA';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeGroup.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Group Hero Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {activeGroup.courseName} • {activeGroup.classSection}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {activeGroup.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {activeGroup.description}
            </p>
          </div>

          {/* Join Code Display */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Kode Undangan Kelompok
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg tracking-widest text-slate-900 dark:text-slate-100">
                {activeGroup.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 text-indigo-600 transition-colors"
                title="Salin Kode Kelompok"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Course Info metadata row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div>
            <span className="text-slate-400 block text-[10px]">Dosen Pengampu:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{activeGroup.lecturerName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">NIP Dosen:</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{activeGroup.lecturerNip}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Beban Proyek:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{groupTasks.length} Modul Tugas</span>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Susunan Anggota Kelompok</span>
            </h3>
            <p className="text-xs text-slate-400">
              Setiap anggota memiliki peran dan tanggung jawab tugas yang terdokumentasi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddMember}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Anggota</span>
            </button>
          </div>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeGroup.members.map(member => {
            const memberTasks = groupTasks.filter(t => t.assignedTo.includes(member.userId));
            const completed = memberTasks.filter(t => t.status === 'DONE').length;

            return (
              <div
                key={member.userId}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  {member.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {member.name}
                    </p>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold shrink-0 ${
                        member.role === 'KETUA'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {member.role === 'KETUA' ? '👑 Ketua' : '👤 Anggota'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    NIM: <span className="font-mono text-slate-700 dark:text-slate-300">{member.nim}</span>
                  </p>

                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                    Spesialisasi: {member.specialization || 'Pengembang Sistem'}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{memberTasks.length} Tugas Ditugaskan</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {completed} Selesai
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
