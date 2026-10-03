import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Users,
  UserPlus,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Shield,
  Layers
} from 'lucide-react';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'create' | 'join' | 'add_member';
}

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'create'
}) => {
  const { activeGroup, createGroup, addMemberToGroup, joinGroupByCode } = useApp();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'add_member'>(defaultTab);

  // Form states for Create Group
  const [groupName, setGroupName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [classSection, setClassSection] = useState('IF-22-B');
  const [lecturerName, setLecturerName] = useState('Prof. Dr. Ir. Hendra Wijaya, M.T.');
  const [lecturerNip, setLecturerNip] = useState('198003152005011002');
  const [description, setDescription] = useState('');

  // Form states for Join Group
  const [joinCode, setJoinCode] = useState('');

  // Form states for Add Member
  const [memberNim, setMemberNim] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'KETUA' | 'ANGGOTA'>('ANGGOTA');
  const [memberSpec, setMemberSpec] = useState('Frontend & UI/UX');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !courseName.trim()) {
      setFeedback({ type: 'error', message: 'Nama kelompok dan mata kuliah wajib diisi.' });
      return;
    }

    const created = createGroup({
      name: groupName.trim(),
      courseName: courseName.trim(),
      classSection: classSection.trim(),
      description: description.trim(),
      lecturerName: lecturerName.trim(),
      lecturerNip: lecturerNip.trim()
    });

    setFeedback({
      type: 'success',
      message: `Kelompok "${created.name}" berhasil dibuat dengan kode: ${created.code}`
    });

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setFeedback({ type: 'error', message: 'Masukkan kode kelompok terlebih dahulu.' });
      return;
    }

    const res = joinGroupByCode(joinCode.trim());
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;
    if (!memberNim.trim() || !memberName.trim()) {
      setFeedback({ type: 'error', message: 'NIM dan nama anggota wajib diisi.' });
      return;
    }

    const res = addMemberToGroup(activeGroup.id, {
      nim: memberNim.trim(),
      name: memberName.trim(),
      email: memberEmail.trim() || `${memberNim.trim()}@student.ac.id`,
      role: memberRole,
      specialization: memberSpec.trim()
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setMemberNim('');
      setMemberName('');
      setMemberEmail('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Manajemen Kelompok Kuliah
              </h2>
              <p className="text-xs text-slate-400">
                Buat kelompok baru, join kode, atau undang anggota
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('create');
              setFeedback(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Buat Kelompok
          </button>
          <button
            onClick={() => {
              setActiveTab('join');
              setFeedback(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'join'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Gabung via Kode
          </button>
          {activeGroup && (
            <button
              onClick={() => {
                setActiveTab('add_member');
                setFeedback(null);
              }}
              className={`flex-1 py-3 text-center border-b-2 transition-colors ${
                activeTab === 'add_member'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Tambah Anggota
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {feedback && (
            <div
              className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* TAB 1: CREATE GROUP */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kelompok <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="Contoh: Kelompok 5 - Tim Alpha"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Kuliah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={e => setCourseName(e.target.value)}
                    placeholder="Contoh: Rekayasa Perangkat Lunak"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas / Semester
                  </label>
                  <input
                    type="text"
                    value={classSection}
                    onChange={e => setClassSection(e.target.value)}
                    placeholder="Contoh: IF-22-B"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    value={lecturerName}
                    onChange={e => setLecturerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIP Dosen
                  </label>
                  <input
                    type="text"
                    value={lecturerNip}
                    onChange={e => setLecturerNip(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Singkat Topik Proyek
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Jelaskan ruang lingkup tugas kelompok yang akan dikerjakan bersama..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all"
                >
                  Buat & Generate Kode Kelompok
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: JOIN GROUP */}
          {activeTab === 'join' && (
            <form onSubmit={handleJoinGroup} className="space-y-4 text-xs">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Masukkan Kode Undangan Kelompok
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Dapatkan kode (contoh: <code>RPL-K04</code>) dari Ketua Kelompok Anda.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ketik kode (misal: RPL-K04)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-mono font-bold text-sm tracking-widest text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all"
              >
                Gabung ke Kelompok
              </button>
            </form>
          )}

          {/* TAB 3: ADD MEMBER TO ACTIVE GROUP */}
          {activeTab === 'add_member' && activeGroup && (
            <form onSubmit={handleAddMember} className="space-y-3.5 text-xs">
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Tambahkan rekan mahasiswa ke dalam <strong>{activeGroup.name}</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIM Mahasiswa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={memberNim}
                    onChange={e => setMemberNim(e.target.value)}
                    placeholder="Contoh: 220101099"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Mahasiswa (Opsional)
                </label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  placeholder="mahasiswa@student.ac.id"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peran dalam Kelompok
                  </label>
                  <select
                    value={memberRole}
                    onChange={e => setMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ANGGOTA">Anggota Tim</option>
                    <option value="KETUA">Ketua Kelompok</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fokus / Spesialisasi
                  </label>
                  <input
                    type="text"
                    value={memberSpec}
                    onChange={e => setMemberSpec(e.target.value)}
                    placeholder="Contoh: Database, UI/UX, QA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all"
                >
                  Tambahkan Anggota
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
