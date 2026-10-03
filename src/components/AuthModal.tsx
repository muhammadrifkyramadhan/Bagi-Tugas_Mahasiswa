import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, resetPassword, users, switchUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regNim, setRegNim] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('ANGGOTA');
  const [regMajor, setRegMajor] = useState('Teknik Informatika');
  const [regQuestion, setRegQuestion] = useState('Kota kelahiran ibu kandung?');
  const [regAnswer, setRegAnswer] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot password form state
  const [forgotId, setForgotId] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Feedback state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await login(loginId, loginPassword);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => onClose(), 1000);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await register(
        {
          nim: regNim,
          name: regName,
          email: regEmail,
          role: regRole,
          major: regMajor,
          securityQuestion: regQuestion,
          securityAnswer: regAnswer
        },
        regPassword
      );
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => onClose(), 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await resetPassword(forgotId, forgotAnswer, newPassword);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => setMode('login'), 1500);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {mode === 'login' ? 'Masuk ke SIM-Tugas' : mode === 'register' ? 'Pendaftaran Akun Mahasiswa' : 'Pemulihan Kata Sandi'}
              </h2>
              <p className="text-xs text-slate-400">
                Autentikasi Terenkripsi SHA-256
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

        {/* Body */}
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

          {/* Quick Demo Credentials Accordion */}
          <div className="mb-4 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Login Cepat 1-Klik (Preset Akun):
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  switchUser('usr-ketua');
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate"
              >
                👑 Ketua
              </button>
              <button
                type="button"
                onClick={() => {
                  switchUser('usr-anggota-1');
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate"
              >
                👤 Anggota
              </button>
              <button
                type="button"
                onClick={() => {
                  switchUser('usr-dosen');
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 text-[11px] font-bold text-purple-700 dark:text-purple-300 truncate"
              >
                🎓 Dosen
              </button>
            </div>
          </div>

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NIM atau Email Kampus
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    placeholder="Contoh: 220101042 atau email@student.ac.id"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setFeedback(null);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi (default: admin123)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>{loading ? 'Memverifikasi...' : 'Masuk ke Akun'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Belum punya akun? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setFeedback(null);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Daftar Sekarang
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NIM / NIP Mahasiswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regNim}
                  onChange={e => setRegNim(e.target.value)}
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
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Nama Lengkap Sesuai KTM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Kampus <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="nama@student.ac.id"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Peran Akun
                  </label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ANGGOTA">Anggota Tim</option>
                    <option value="KETUA">Ketua Kelompok</option>
                    <option value="DOSEN">Dosen Pengampu</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Program Studi
                  </label>
                  <input
                    type="text"
                    value={regMajor}
                    onChange={e => setRegMajor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Security Question for Password Recovery */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                  🛡️ Pertanyaan Keamanan (Pemulihan Sandi)
                </span>
                <div>
                  <select
                    value={regQuestion}
                    onChange={e => setRegQuestion(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
                  >
                    <option value="Kota kelahiran ibu kandung?">Kota kelahiran ibu kandung?</option>
                    <option value="Nama hewan peliharaan pertama?">Nama hewan peliharaan pertama?</option>
                    <option value="Nama sekolah dasar Anda?">Nama sekolah dasar Anda?</option>
                    <option value="Makanan favorit masa kecil?">Makanan favorit masa kecil?</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={regAnswer}
                    onChange={e => setRegAnswer(e.target.value)}
                    placeholder="Jawaban verifikasi (rahasia)"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar Akun Baru'}
              </button>

              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Sudah punya akun? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFeedback(null);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Kembali ke Login
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Masukkan NIM atau Email Anda, lalu jawab pertanyaan keamanan untuk mereset kata sandi secara aman.
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NIM atau Email Terdaftar
                </label>
                <input
                  type="text"
                  value={forgotId}
                  onChange={e => setForgotId(e.target.value)}
                  placeholder="Contoh: 220101042"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jawaban Pertanyaan Keamanan
                </label>
                <input
                  type="text"
                  value={forgotAnswer}
                  onChange={e => setForgotAnswer(e.target.value)}
                  placeholder="Ketik jawaban yang didaftarkan saat registrasi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all"
              >
                {loading ? 'Memproses Reset...' : 'Perbarui Kata Sandi'}
              </button>

              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFeedback(null);
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Kembali ke Login
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
