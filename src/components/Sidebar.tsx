import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  Calendar,
  PieChart,
  GraduationCap,
  Users2,
  FileDown,
  PlusCircle,
  Radio,
  Sparkles
} from 'lucide-react';

export type NavView = 'dashboard' | 'kanban' | 'list' | 'calendar' | 'analytics' | 'lecturer' | 'group';

interface SidebarProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  onOpenCreateTaskModal: () => void;
  onOpenExportModal: () => void;
  onOpenCreateGroupModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onOpenCreateTaskModal,
  onOpenExportModal,
  onOpenCreateGroupModal
}) => {
  const { currentUser } = useAuth();
  const { activeGroup, groupTasks } = useApp();

  const isLeader = currentUser?.role === 'KETUA';
  const isLecturer = currentUser?.role === 'DOSEN';

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Ringkasan', icon: LayoutDashboard },
    { id: 'kanban', label: 'Papan Kanban', icon: KanbanSquare, badge: groupTasks.length },
    { id: 'list', label: 'Daftar Tugas', icon: ListTodo },
    { id: 'calendar', label: 'Kalender & Deadline', icon: Calendar },
    { id: 'analytics', label: 'Analitik Kontribusi', icon: PieChart },
    { id: 'lecturer', label: 'Ruang Evaluasi Dosen', icon: GraduationCap, highlight: isLecturer },
    { id: 'group', label: 'Anggota & Kelompok', icon: Users2, badge: activeGroup?.members.length }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 min-h-[calc(100vh-4rem)]">
        
        {/* Quick Action Button for Team Leader / Member */}
        <div className="mb-4">
          <button
            onClick={onOpenCreateTaskModal}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Tugas Baru</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as NavView)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-500' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Export & Realtime Info Footer */}
        <div className="mt-auto pt-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onOpenExportModal}
            className="w-full py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-2 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Unduh Proyek (VS Code / ZIP)</span>
          </button>

          {/* Real-time Indicator */}
          <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                Sinkron Real-time
              </span>
            </div>
            <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1 px-2 flex justify-around items-center">
        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as NavView)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-[55px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button
          onClick={() => onViewChange('lecturer')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentView === 'lecturer'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <GraduationCap className="w-4 h-4 mb-0.5" />
          <span>Dosen</span>
        </button>
      </div>
    </>
  );
};
