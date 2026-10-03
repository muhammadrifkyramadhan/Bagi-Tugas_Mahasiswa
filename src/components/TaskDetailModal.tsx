import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, TaskPriority } from '../types';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import {
  X,
  Calendar,
  Clock,
  User as UserIcon,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileText,
  Link2,
  Send,
  MessageSquare,
  Award,
  ExternalLink,
  Edit,
  Trash2,
  Plus,
  CalendarPlus,
  Share2,
  Check
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEditTask: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEditTask
}) => {
  const {
    activeGroup,
    updateTask,
    deleteTask,
    updateTaskStatus,
    requestRevision,
    resolveRevision,
    addTaskAttachment,
    addTaskComment,
    evaluateTaskByLecturer
  } = useApp();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'details' | 'submissions' | 'revisions' | 'comments' | 'eval'>('details');

  // Submissions state
  const [attTitle, setAttTitle] = useState('');
  const [attUrl, setAttUrl] = useState('');
  const [attType, setAttType] = useState<'link' | 'drive' | 'github' | 'file'>('link');

  // Revision state
  const [revisionNote, setRevisionNote] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');

  // Lecturer score state
  const [lecturerScore, setLecturerScore] = useState<number>(task?.score || 85);
  const [lecturerFeedback, setLecturerFeedback] = useState<string>(task?.lecturerFeedback || '');

  if (!isOpen || !task) return null;

  const isLeader = currentUser?.role === 'KETUA';
  const isLecturer = currentUser?.role === 'DOSEN';
  const isAssignee = currentUser ? task.assignedTo.includes(currentUser.id) : false;

  // Toggle subtask
  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask(task.id, { subtasks: updatedSubtasks });
  };

  // Add submission attachment
  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attTitle.trim() || !attUrl.trim()) return;

    addTaskAttachment(task.id, {
      title: attTitle.trim(),
      url: attUrl.trim(),
      type: attType
    });

    setAttTitle('');
    setAttUrl('');
  };

  // Send comment
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addTaskComment(task.id, commentText.trim(), isLecturer);
    setCommentText('');
  };

  // Handle Request Revision
  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNote.trim()) return;
    requestRevision(task.id, revisionNote.trim());
    setRevisionNote('');
    setShowRevisionForm(false);
    setActiveTab('revisions');
  };

  // Handle Lecturer Grade
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    evaluateTaskByLecturer(task.id, Number(lecturerScore), lecturerFeedback.trim());
    setActiveTab('eval');
  };

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const progressPercent = task.subtasks.length > 0
    ? Math.round((completedSubtasks / task.subtasks.length) * 100)
    : task.status === 'DONE' ? 100 : 0;

  // Urgency styling
  const isUrgent = task.priority === 'MENDESAK' || task.priority === 'TINGGI';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  task.priority === 'MENDESAK' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                  task.priority === 'TINGGI' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                  task.priority === 'SEDANG' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  Prioritas {task.priority}
                </span>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Bobot {task.weight}%
                </span>

                {task.score !== undefined && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Nilai Dosen: {task.score}/100
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {task.title}
              </h2>
            </div>

            <div className="flex items-center gap-1">
              {(isLeader || isLecturer) && (
                <>
                  <button
                    onClick={() => {
                      onEditTask(task);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Edit Tugas"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
                        deleteTask(task.id);
                        onClose();
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Hapus Tugas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Status Bar & Calendar Actions */}
          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Status Tugas:</span>
              <select
                value={task.status}
                onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                className={`font-bold px-2.5 py-1 rounded-lg border text-xs focus:outline-none ${
                  task.status === 'DONE' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300' :
                  task.status === 'IN_REVIEW' ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300' :
                  task.status === 'REVISION' ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300' :
                  'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <option value="TODO">Belum Dimulai</option>
                <option value="IN_PROGRESS">Sedang Dikerjakan</option>
                <option value="IN_REVIEW">Menunggu Review Ketua</option>
                <option value="REVISION">Perlu Revisi</option>
                <option value="DONE">Selesai (Approved)</option>
              </select>
            </div>

            {/* Google Calendar & iCal Button */}
            <div className="flex items-center gap-2">
              <a
                href={getGoogleCalendarUrl(task, activeGroup || undefined)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 font-semibold transition-colors border border-blue-200 dark:border-blue-800"
                title="Tambahkan Pengingat Deadline ke Google Calendar Pribadi"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Google Calendar</span>
              </a>

              <button
                onClick={() => downloadIcsFile(task, activeGroup || undefined)}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Unduh Kalender .ics (Apple, Outlook)"
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Rincian & Subtask
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'submissions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Hasil Tugas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
              {task.attachments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'revisions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Catatan Revisi</span>
            {task.revisions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
                {task.revisions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Diskusi Tim</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800">
              {task.comments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('eval')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'eval'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Nilai Dosen</span>
            {task.score !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                ✓
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5 text-xs">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Penanggung Jawab (PIC):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {task.assignedNames.map((name, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium"
                      >
                        <UserIcon className="w-3 h-3 text-indigo-500" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Tenggat Waktu (Deadline):
                  </span>
                  <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{task.dueDate}</span>
                    <Clock className="w-3.5 h-3.5 text-indigo-500 ml-1" />
                    <span>{task.dueTime || '23:59'} WIB</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Deskripsi & Instruksi Pengerjaan
                </h4>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {task.description || 'Tidak ada deskripsi rinci untuk tugas ini.'}
                </div>
              </div>

              {/* Subtasks / Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    Checklist Subtask Pengerjaan ({completedSubtasks}/{task.subtasks.length})
                  </h4>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mb-3 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="space-y-1.5">
                  {task.subtasks.length === 0 ? (
                    <p className="text-slate-400 italic">Belum ada subtask yang ditambahkan.</p>
                  ) : (
                    task.subtasks.map(st => (
                      <div
                        key={st.id}
                        onClick={() => handleToggleSubtask(st.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border transition-colors ${
                          st.completed
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/60 text-slate-500 line-through'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        {st.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs">{st.title}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Action Banner for Leader & Assignee */}
              <div className="pt-2 flex flex-wrap gap-2 justify-end">
                {task.status !== 'DONE' && (isLeader || isLecturer) && (
                  <button
                    onClick={() => {
                      updateTaskStatus(task.id, 'DONE');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Setujui & Tandai Selesai
                  </button>
                )}

                {task.status !== 'REVISION' && (isLeader || isLecturer) && (
                  <button
                    onClick={() => {
                      setActiveTab('revisions');
                      setShowRevisionForm(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900 flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Minta Revisi
                  </button>
                )}

                {task.status !== 'IN_REVIEW' && isAssignee && (
                  <button
                    onClick={() => {
                      updateTaskStatus(task.id, 'IN_REVIEW');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Ajukan Review ke Ketua
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SUBMISSIONS & ATTACHMENTS */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Daftar Berkas & Tautan Hasil Tugas
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-3">
                  Anggota dapat mengunggah link Google Drive, Figma, GitHub Pull Request, atau dokumen laporan.
                </p>

                {task.attachments.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                    Belum ada lampiran hasil tugas yang diunggah.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {task.attachments.map(att => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center shrink-0">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                              {att.title}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              Oleh {att.submittedBy} • {new Date(att.submittedAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>

                        <a
                          href={att.url.startsWith('http') ? att.url : `https://${att.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors shrink-0"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Upload */}
              <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Upload / Tambah Bukti Hasil Tugas
                </h5>
                <form onSubmit={handleAddAttachment} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={attTitle}
                        onChange={e => setAttTitle(e.target.value)}
                        placeholder="Nama Dokumen / Hasil (contoh: Link Figma Mockup)"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <select
                        value={attType}
                        onChange={e => setAttType(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="link">Tautan Web / Figma</option>
                        <option value="drive">Google Drive / Docs</option>
                        <option value="github">GitHub Repo / PR</option>
                        <option value="file">Dokumen Berkas (PDF/ZIP)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={attUrl}
                      onChange={e => setAttUrl(e.target.value)}
                      placeholder="Masukkan URL / Tautan berkas (https://...)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Unggah Hasil
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: REVISIONS */}
          {activeTab === 'revisions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    Catatan Revisi dari Ketua / Dosen
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Memastikan kualitas dan kesesuaian tugas sebelum disetujui akhir.
                  </p>
                </div>
                {(isLeader || isLecturer) && (
                  <button
                    onClick={() => setShowRevisionForm(!showRevisionForm)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Catatan Revisi
                  </button>
                )}
              </div>

              {showRevisionForm && (
                <form onSubmit={handleSubmitRevision} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
                  <h5 className="font-bold text-rose-800 dark:text-rose-300">
                    Form Permintaan Revisi
                  </h5>
                  <textarea
                    rows={3}
                    value={revisionNote}
                    onChange={e => setRevisionNote(e.target.value)}
                    placeholder="Tuliskan poin-poin yang harus diperbaiki oleh anggota penanggung jawab..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRevisionForm(false)}
                      className="px-3 py-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
                    >
                      Kirim Revisi & Notifikasi
                    </button>
                  </div>
                </form>
              )}

              {task.revisions.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                  Tidak ada catatan revisi. Tugas berjalan sesuai rencana!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {task.revisions.map((rev, index) => (
                    <div
                      key={rev.id}
                      className={`p-3.5 rounded-xl border ${
                        rev.resolved
                          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-75'
                          : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            rev.resolved
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {rev.resolved ? '✓ Selesai Direvisi' : `Revisi #${task.revisions.length - index} (Perlu Tindakan)`}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            oleh <span className="font-semibold">{rev.requestedBy}</span> ({rev.requestedByRole})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.requestedAt).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {rev.note}
                      </p>

                      {!rev.resolved && (
                        <div className="mt-3 pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex justify-end">
                          <button
                            onClick={() => resolveRevision(task.id, rev.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Tandai Revisi Ini Telah Diperbaiki
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMMENTS & DISCUSSION */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {task.comments.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                    Belum ada pesan diskusi. Mulai koordinasi dengan tim di sini!
                  </div>
                ) : (
                  task.comments.map(c => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border ${
                        c.isLecturerNote
                          ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {c.userName}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            c.userRole === 'DOSEN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300' :
                            c.userRole === 'KETUA' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                          }`}>
                            {c.userRole}
                          </span>
                          {c.isLecturerNote && (
                            <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400">
                              (Catatan Dosen)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-snug">
                        {c.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment input */}
              <form onSubmit={handleSendComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Ketik pesan atau koordinasi terkait tugas ini..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: LECTURER EVALUATION */}
          {activeTab === 'eval' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-bold text-purple-900 dark:text-purple-300 text-sm">
                    Penilaian & Evaluasi Dosen Pengampu
                  </h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Dosen dapat memberikan evaluasi langsung terhadap hasil pengerjaan modul tugas ini untuk mengukur kualitas dan kontribusi mahasiswa.
                </p>

                {task.score !== undefined && (
                  <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Nilai Diberikan:</span>
                      <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        {task.score}/100
                      </span>
                    </div>
                    {task.lecturerFeedback && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Catatan Dosen:
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 italic">
                          "{task.lecturerFeedback}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Evaluasi untuk Dosen */}
              {isLecturer ? (
                <form onSubmit={handleSaveEvaluation} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3">
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">
                    Form Penilaian Dosen
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">
                        Skor Nilai (0 - 100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={lecturerScore}
                        onChange={e => setLecturerScore(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">
                      Catatan Evaluasi / Feedback Kinerja
                    </label>
                    <textarea
                      rows={3}
                      value={lecturerFeedback}
                      onChange={e => setLecturerFeedback(e.target.value)}
                      placeholder="Masukkan evaluasi detail, kekurangan, atau apresiasi atas kualitas kerja..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-colors"
                    >
                      Simpan Nilai & Publikasikan
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-400">
                  Hanya akun Dosen Pengampu yang memiliki hak asesmen untuk mengisi formulir penilaian ini.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
