import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavView } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { ExportModal } from './components/ExportModal';
import { LocationReminderModal } from './components/LocationReminderModal';
import { GroupModal } from './components/GroupModal';
import { AuthModal } from './components/AuthModal';

import { DashboardView } from './views/DashboardView';
import { KanbanView } from './views/KanbanView';
import { ListView } from './views/ListView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { LecturerView } from './views/LecturerView';
import { GroupView } from './views/GroupView';
import { Task } from './types';
import { RotateCcw, ShieldCheck, HeartHandshake } from 'lucide-react';

function MainApp() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalTab, setGroupModalTab] = useState<'create' | 'join' | 'add_member'>('create');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { resetAllDemoData, activeGroup } = useApp();
  const { currentUser } = useAuth();

  const handleOpenCreateTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleOpenAddMember = () => {
    setGroupModalTab('add_member');
    setIsGroupModalOpen(true);
  };

  const handleOpenCreateGroup = () => {
    setGroupModalTab('create');
    setIsGroupModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenCreateGroupModal={handleOpenCreateGroup}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Desktop Sidebar & Mobile Nav */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onOpenCreateTaskModal={handleOpenCreateTask}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenCreateGroupModal={handleOpenCreateGroup}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12">
          {currentView === 'dashboard' && (
            <DashboardView
              onSelectTask={handleSelectTask}
              onNavigate={setCurrentView}
              onOpenCreateTask={handleOpenCreateTask}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {currentView === 'kanban' && (
            <KanbanView
              onSelectTask={handleSelectTask}
              onOpenCreateTask={handleOpenCreateTask}
            />
          )}

          {currentView === 'list' && (
            <ListView
              onSelectTask={handleSelectTask}
              onOpenCreateTask={handleOpenCreateTask}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              onSelectTask={handleSelectTask}
              onOpenCreateTask={handleOpenCreateTask}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {currentView === 'lecturer' && (
            <LecturerView
              onSelectTask={handleSelectTask}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          )}

          {currentView === 'group' && (
            <GroupView
              onOpenAddMember={handleOpenAddMember}
              onOpenCreateGroup={handleOpenCreateGroup}
            />
          )}

          {/* Academic Footer Info */}
          <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                SIM-TUGAS • Sistem Informasi Pembagian & Monitoring Tugas Kelompok Mahasiswa
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (confirm('Muat ulang data sampel akademik simulasi?')) {
                    resetAllDemoData();
                  }
                }}
                className="hover:text-indigo-500 transition-colors flex items-center gap-1"
                title="Reset data ke setelan awal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data Demo</span>
              </button>
              <span>Kelas: {activeGroup?.classSection || 'IF-22-B'}</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Modals Container */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
        onEditTask={handleEditTask}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <LocationReminderModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        defaultTab={groupModalTab}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
