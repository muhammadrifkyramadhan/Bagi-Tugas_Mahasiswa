import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bell,
  Sun,
  Moon,
  Users,
  MapPin,
  LogOut,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  FileText,
  Plus,
  Award
} from 'lucide-react';

interface NavbarProps {
  onOpenLocationModal: () => void;
  onOpenCreateGroupModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLocationModal,
  onOpenCreateGroupModal,
  onOpenAuthModal
}) => {
  const { currentUser, logout } = useAuth();
  const {
    groups,
    activeGroup,
    setActiveGroupId,
    notifications,
    unreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead
  } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-blue-400">
                SIM-TUGAS
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                MAHASISWA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Sistem Pembagian & Monitoring Tugas Kelompok
            </p>
          </div>
        </div>

        {/* Group Selector */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowGroupMenu(!showGroupMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px] sm:max-w-[200px]">
                {activeGroup?.name || 'Pilih Kelompok'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {activeGroup?.code}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showGroupMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Daftar Kelompok Kuliah
                </div>
                {groups.map(grp => (
                  <button
                    key={grp.id}
                    onClick={() => {
                      setActiveGroupId(grp.id);
                      setShowGroupMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors ${
                      grp.id === activeGroup?.id ? 'bg-indigo-50/70 dark:bg-slate-700 font-semibold text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="truncate">{grp.name}</p>
                      <p className="text-[10px] text-slate-400">{grp.courseName} - {grp.classSection}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      {grp.code}
                    </span>
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-1 px-2">
                  <button
                    onClick={() => {
                      setShowGroupMenu(false);
                      onOpenCreateGroupModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Buat / Gabung Kelompok
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Location Reminder Button */}
          <button
            onClick={onOpenLocationModal}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Pengingat Berbasis Lokasi Kampus"
          >
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="sr-only">Pengingat Lokasi</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Ganti ke mode ${theme === 'light' ? 'gelap' : 'terang'}`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifikasi Otomatis"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Pusat Notifikasi
                    </span>
                    {unreadNotificationCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-full">
                        {unreadNotificationCount} baru
                      </span>
                    )}
                  </div>
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Belum ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 ${
                          !notif.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {notif.type === 'deadline' && (
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            )}
                            {notif.type === 'revision' && (
                              <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                            )}
                            {notif.type === 'status_change' && (
                              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                            )}
                            {notif.type === 'evaluation' && (
                              <Award className="w-4 h-4 text-purple-500 shrink-0" />
                            )}
                            {notif.type === 'location' && (
                              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                            {notif.type === 'assignment' && (
                              <Plus className="w-4 h-4 text-indigo-500 shrink-0" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 inline-block">
                              {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mt-1"></span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Login */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[120px] truncate leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 capitalize">
                    {currentUser.role.toLowerCase()}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400">{currentUser.nim}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar dari Sistem
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
            >
              Masuk / Daftar
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
