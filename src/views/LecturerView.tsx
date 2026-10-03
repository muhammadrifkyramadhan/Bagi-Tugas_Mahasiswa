import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Group, Task } from '../types';
import {
  GraduationCap,
  Award,
  CheckCircle,
  FileText,
  Star,
  Layers,
  Users,
  Search,
  Check,
  Building,
  Calendar
} from 'lucide-react';

interface LecturerViewProps {
  onSelectTask: (task: Task) => void;
  onOpenExportModal: () => void;
}

export const LecturerView: React.FC<LecturerViewProps> = ({
  onSelectTask,
  onOpenExportModal
}) => {
  const {
    groups,
    activeGroup,
    setActiveGroupId,
    tasks,
    groupTasks,
    evaluateGroupByLecturer
  } = useApp();
  const { currentUser, switchUser } = useAuth();

  const isLecturer = currentUser?.role === 'DOSEN';

  // Rubric form state for active group
  const [rubricCollab, setRubricCollab] = useState<number>(
    activeGroup?.evaluation?.rubric.collaborativeEffort || 5
  );
  const [rubricDeadline, setRubricDeadline] = useState<number>(
    activeGroup?.evaluation?.rubric.deadlinePunctuality || 4
  );
  const [rubricQuality, setRubricQuality] = useState<number>(
    activeGroup?.evaluation?.rubric.qualityOfWork || 5
  );
  const [rubricDoc, setRubricDoc] = useState<number>(
    activeGroup?.evaluation?.rubric.systemDocumentation || 4
  );
  const [finalScore, setFinalScore] = useState<number>(
    activeGroup?.evaluation?.score || 88
  );
  const [evalNotes, setEvalNotes] = useState<string>(
    activeGroup?.evaluation?.notes || 'Pembagian peran sudah sangat proporsional. Dokumentasi antarmuka dan basis data sangat rapi. Terus pertahankan kecepatan penyelesaian tugas.'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!activeGroup) return null;

  const handleSaveGroupEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    evaluateGroupByLecturer(activeGroup.id, Number(finalScore), evalNotes.trim(), {
      collaborativeEffort: rubricCollab,
      deadlinePunctuality: rubricDeadline,
      qualityOfWork: rubricQuality,
      systemDocumentation: rubricDoc
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Lecturer Role Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 text-xs font-bold mb-2">
            <GraduationCap className="w-4 h-4 text-purple-300" />
            <span>Portal Pengawasan & Asesmen Dosen Pengampu</span>
          </div>
          <h2 className="text-xl font-black">
            {isLecturer ? currentUser?.name : 'Prof. Dr. Ir. Hendra Wijaya, M.T.'}
          </h2>
          <p className="text-xs text-purple-200 mt-0.5">
            NIP: 198003152005011002 • Koordinator Mata Kuliah: Rekayasa Perangkat Lunak (IF-22-B)
          </p>
        </div>

        {!isLecturer && (
          <button
            onClick={() => switchUser('usr-dosen')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            Aktifkan Peran Dosen (Beri Nilai)
          </button>
        )}
      </div>

      {/* Course Groups Selector */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Audit Semua Kelompok Mahasiswa di Kelas {activeGroup.classSection}</span>
          </h3>
          <span className="text-xs text-slate-400">{groups.length} Kelompok Terdaftar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map(grp => {
            const grpTasks = tasks.filter(t => t.groupId === grp.id);
            const doneCount = grpTasks.filter(t => t.status === 'DONE').length;
            const progress = grpTasks.length > 0 ? Math.round((doneCount / grpTasks.length) * 100) : 0;
            const isSelected = grp.id === activeGroup.id;

            return (
              <div
                key={grp.id}
                onClick={() => setActiveGroupId(grp.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {grp.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                    {grp.code}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2.5">
                  {grp.description}
                </p>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Progres Tugas:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{progress}% ({doneCount}/{grpTasks.length})</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{grp.members.length} Mahasiswa</span>
                  {grp.evaluation ? (
                    <span className="font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Nilai: {grp.evaluation.score}/100
                    </span>
                  ) : (
                    <span className="text-amber-500 font-medium">Belum Dinilai</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Group Evaluation & Task Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Task Review & Progress Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Daftar Tugas & Modul: {activeGroup.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Klik tugas untuk memeriksa berkas pengerjaan, link Figma/Drive, atau memberi skor modul
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {groupTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        task.status === 'IN_REVIEW' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                        task.status === 'REVISION' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                        'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {task.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Bobot: {task.weight}%
                      </span>
                    </div>

                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {task.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      PIC: {task.assignedNames.join(', ')} • Deadline: {task.dueDate}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {task.score !== undefined ? (
                      <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400 block">
                        {task.score}/100
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-lg">
                        Beri Nilai
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Formal Group Rubric Assessment Form */}
        <div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Rubrik Penilaian Kelompok
                </h3>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Nilai & Evaluasi resmi berhasil diterbitkan ke mahasiswa!</span>
              </div>
            )}

            <form onSubmit={handleSaveGroupEvaluation} className="space-y-4 text-xs">
              
              {/* Rubric 1: Kerja Sama */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    1. Kerja Sama & Kolaborasi Tim (1-5)
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{rubricCollab}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rubricCollab}
                  onChange={e => setRubricCollab(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Rubric 2: Ketepatan Waktu */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    2. Ketepatan Waktu Deadline (1-5)
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{rubricDeadline}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rubricDeadline}
                  onChange={e => setRubricDeadline(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Rubric 3: Kualitas Pengerjaan */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    3. Kualitas Teknis & Hasil Modul (1-5)
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{rubricQuality}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rubricQuality}
                  onChange={e => setRubricQuality(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Rubric 4: Dokumentasi */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    4. Dokumentasi & Spesifikasi SRS (1-5)
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{rubricDoc}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={rubricDoc}
                  onChange={e => setRubricDoc(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Final Grade Number */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nilai Akhir Kelompok (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={finalScore}
                  onChange={e => setFinalScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Official Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Evaluasi / Masukan Dosen
                </label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={e => setEvalNotes(e.target.value)}
                  placeholder="Tuliskan ulasan menyeluruh untuk kelompok ini..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Publikasikan Nilai</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
