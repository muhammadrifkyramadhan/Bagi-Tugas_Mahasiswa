import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Group, Task, NotificationItem, ActivityLog, TaskStatus, TaskPriority, TaskAttachment, GroupEvaluation } from '../types';
import { StorageManager, realtimeChannel, broadcastDataChange, DEFAULT_CAMPUS_LOCATIONS } from '../utils/storage';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Groups
  groups: Group[];
  activeGroup: Group | null;
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  createGroup: (groupData: { name: string; courseName: string; classSection: string; description: string; lecturerName: string; lecturerNip: string }) => Group;
  addMemberToGroup: (groupId: string, member: { nim: string; name: string; email: string; role: 'KETUA' | 'ANGGOTA'; specialization?: string }) => { success: boolean; message: string };
  joinGroupByCode: (code: string) => { success: boolean; message: string };
  
  // Tasks
  tasks: Task[];
  groupTasks: Task[];
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'revisions' | 'comments' | 'attachments'>) => Task;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus, note?: string) => void;
  requestRevision: (taskId: string, revisionNote: string) => void;
  resolveRevision: (taskId: string, revisionId: string) => void;
  addTaskAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id' | 'submittedAt' | 'submittedBy'>) => void;
  addTaskComment: (taskId: string, commentText: string, isLecturerNote?: boolean) => void;
  evaluateTaskByLecturer: (taskId: string, score: number, feedback: string) => void;
  evaluateGroupByLecturer: (groupId: string, score: number, notes: string, rubric: GroupEvaluation['rubric']) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  triggerPushNotification: (title: string, body: string) => void;

  // Location-based reminder
  triggerLocationReminder: (locationName: string) => void;
  userCoords: { lat: number; lng: number } | null;
  refreshUserLocation: () => void;

  // Activities
  activities: ActivityLog[];
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [groups, setGroups] = useState<Group[]>(() => StorageManager.getGroups());
  const [activeGroupId, setActiveGroupIdState] = useState<string>(() => StorageManager.getActiveGroupId());
  const [tasks, setTasks] = useState<Task[]>(() => StorageManager.getTasks());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageManager.getNotifications());
  const [activities, setActivities] = useState<ActivityLog[]>(() => StorageManager.getActivities());
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Sync state across browser tabs
  useEffect(() => {
    const channel = realtimeChannel;
    if (!channel) return;

    const onMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'TASKS_UPDATED') {
        setTasks(payload);
      } else if (type === 'GROUPS_UPDATED') {
        setGroups(payload);
      } else if (type === 'NOTIFICATIONS_UPDATED') {
        setNotifications(payload);
      } else if (type === 'ACTIVITIES_UPDATED') {
        setActivities(payload);
      } else if (type === 'ACTIVE_GROUP_CHANGED') {
        setActiveGroupIdState(payload);
      } else if (type === 'RESET_ALL') {
        setGroups(StorageManager.getGroups());
        setTasks(StorageManager.getTasks());
        setNotifications(StorageManager.getNotifications());
        setActivities(StorageManager.getActivities());
        setActiveGroupIdState(StorageManager.getActiveGroupId());
      }
    };

    channel.addEventListener('message', onMessage);
    return () => channel.removeEventListener('message', onMessage);
  }, []);

  const setActiveGroupId = (id: string) => {
    setActiveGroupIdState(id);
    StorageManager.setActiveGroupId(id);
  };

  const activeGroup = useMemo(() => {
    return groups.find(g => g.id === activeGroupId) || groups[0] || null;
  }, [groups, activeGroupId]);

  const groupTasks = useMemo(() => {
    if (!activeGroup) return [];
    return tasks.filter(t => t.groupId === activeGroup.id);
  }, [tasks, activeGroup]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Request browser push notification permission silently or trigger simulated banner
  const triggerPushNotification = useCallback((title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn('Native notification failed:', e);
      }
    }
  }, []);

  // Log activity helper
  const logActivity = useCallback((action: string, taskTitle?: string) => {
    if (!currentUser || !activeGroup) return;
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      groupId: activeGroup.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      timestamp: new Date().toISOString(),
      taskTitle
    };
    setActivities(prev => {
      const updated = [newLog, ...prev.slice(0, 49)];
      StorageManager.saveActivities(updated);
      return updated;
    });
  }, [currentUser, activeGroup]);

  // Add notification helper
  const addNotification = useCallback((
    title: string,
    message: string,
    type: NotificationItem['type'],
    taskId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false,
      taskId,
      groupId: activeGroup?.id
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      StorageManager.saveNotifications(updated);
      return updated;
    });

    triggerPushNotification(title, message);
  }, [activeGroup, triggerPushNotification]);

  // Check deadlines automatically every 60s
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      tasks.forEach(t => {
        if (t.status === 'DONE') return;
        const due = new Date(`${t.dueDate}T${t.dueTime || '23:59'}:00`);
        const diffMs = due.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // Within 24 hours warning
        if (diffHours > 0 && diffHours <= 24) {
          // Check if already notified recently
          const alreadyNotified = notifications.some(
            n => n.taskId === t.id && n.type === 'deadline' && (now.getTime() - new Date(n.createdAt).getTime() < 12 * 3600000)
          );
          if (!alreadyNotified) {
            addNotification(
              `⚠️ Deadline Mendekat (< 24 Jam): ${t.title}`,
              `Tugas "${t.title}" jatuh tempo pada ${t.dueDate} pukul ${t.dueTime || '23:59'}. Segera selesaikan dan upload hasil tugas!`,
              'deadline',
              t.id
            );
          }
        }
      });
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000);
    return () => clearInterval(interval);
  }, [tasks, notifications, addNotification]);

  // Location-based reminder simulator & geofence
  const refreshUserLocation = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        _err => {
          // Fallback coordinate near campus
          setUserCoords({ lat: -6.2088, lng: 106.8456 });
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const triggerLocationReminder = useCallback((locationName: string) => {
    // Find pending tasks for active group
    const pendingTasks = groupTasks.filter(t => t.status !== 'DONE');
    const urgentTask = pendingTasks.find(t => t.priority === 'MENDESAK' || t.priority === 'TINGGI') || pendingTasks[0];

    const title = `📍 Anda Tiba di ${locationName}!`;
    const message = urgentTask
      ? `Pengingat Lokasi Kampus: Tugas "${urgentTask.title}" memiliki tenggat pada ${urgentTask.dueDate}. Manfaatkan fasilitas ${locationName} untuk berkoordinasi dengan tim!`
      : `Pengingat Lokasi Kampus: Semua tugas di ${activeGroup?.name || 'kelompok'} sudah selesai. Tetap pantau pengumuman dosen!`;

    addNotification(title, message, 'location', urgentTask?.id);
  }, [groupTasks, activeGroup, addNotification]);

  // TASK OPERATIONS
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'revisions' | 'comments' | 'attachments'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      revisions: [],
      comments: [],
      attachments: []
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    StorageManager.saveTasks(updated);

    logActivity(`Membuat tugas baru "${newTask.title}" untuk ${newTask.assignedNames.join(', ')}`, newTask.title);
    addNotification(
      `📌 Tugas Baru Diberikan: ${newTask.title}`,
      `Ketua kelompok mengalokasikan tugas "${newTask.title}" (Bobot: ${newTask.weight}%). Deadline: ${newTask.dueDate}.`,
      'assignment',
      newTask.id
    );

    return newTask;
  };

  const updateTask = (taskId: string, patch: Partial<Task>) => {
    const updated = tasks.map(t => (t.id === taskId ? { ...t, ...patch } : t));
    setTasks(updated);
    StorageManager.saveTasks(updated);
    logActivity(`Memperbarui rincian tugas`, patch.title);
  };

  const deleteTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    StorageManager.saveTasks(updated);
    if (target) {
      logActivity(`Menghapus tugas "${target.title}"`, target.title);
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus, note?: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    let statusText = 'Belum Dimulai';
    if (newStatus === 'IN_PROGRESS') statusText = 'Sedang Dikerjakan';
    if (newStatus === 'IN_REVIEW') statusText = 'Menunggu Review';
    if (newStatus === 'REVISION') statusText = 'Perlu Revisi';
    if (newStatus === 'DONE') statusText = 'Selesai';

    const completedAt = newStatus === 'DONE' ? new Date().toISOString() : target.completedAt;

    const updated = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: newStatus,
            completedAt
          }
        : t
    );

    setTasks(updated);
    StorageManager.saveTasks(updated);

    const logMsg = note ? `Mengubah status menjadi [${statusText}]: "${note}"` : `Mengubah status tugas menjadi [${statusText}]`;
    logActivity(logMsg, target.title);

    addNotification(
      `🔄 Status Diperbarui: ${target.title}`,
      `${currentUser?.name || 'Anggota'} mengubah status tugas "${target.title}" menjadi ${statusText}.`,
      'status_change',
      target.id
    );
  };

  const requestRevision = (taskId: string, revisionNote: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target || !currentUser) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      requestedBy: currentUser.name,
      requestedByRole: currentUser.role,
      requestedAt: new Date().toISOString(),
      note: revisionNote,
      resolved: false
    };

    const updated = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: 'REVISION' as TaskStatus,
            revisions: [newRev, ...t.revisions]
          }
        : t
    );

    setTasks(updated);
    StorageManager.saveTasks(updated);

    logActivity(`Memberikan catatan revisi pada tugas`, target.title);
    addNotification(
      `📝 Revisi Diminta: ${target.title}`,
      `${currentUser.name} (${currentUser.role}): "${revisionNote}"`,
      'revision',
      target.id
    );
  };

  const resolveRevision = (taskId: string, revisionId: string) => {
    const updated = tasks.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        revisions: t.revisions.map(r => (r.id === revisionId ? { ...r, resolved: true } : r)),
        status: 'IN_REVIEW' as TaskStatus
      };
    });

    setTasks(updated);
    StorageManager.saveTasks(updated);
    logActivity(`Menyelesaikan revisi dan mengajukan kembali review tugas`);
  };

  const addTaskAttachment = (
    taskId: string,
    attachment: Omit<TaskAttachment, 'id' | 'submittedAt' | 'submittedBy'>
  ) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target || !currentUser) return;

    const newAtt: TaskAttachment = {
      ...attachment,
      id: `att-${Date.now()}`,
      submittedBy: currentUser.name,
      submittedAt: new Date().toISOString()
    };

    const updated = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            attachments: [...t.attachments, newAtt],
            status: t.status === 'TODO' ? 'IN_PROGRESS' : t.status
          }
        : t
    );

    setTasks(updated);
    StorageManager.saveTasks(updated);

    logActivity(`Mengunggah hasil tugas (${newAtt.title})`, target.title);
    addNotification(
      `📎 Hasil Tugas Baru Diunggah: ${target.title}`,
      `${currentUser.name} mengunggah berkas/link "${newAtt.title}".`,
      'status_change',
      target.id
    );
  };

  const addTaskComment = (taskId: string, commentText: string, isLecturerNote = false) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target || !currentUser) return;

    const newComment = {
      id: `com-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAvatar: currentUser.avatar,
      comment: commentText,
      createdAt: new Date().toISOString(),
      isLecturerNote
    };

    const updated = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            comments: [...t.comments, newComment]
          }
        : t
    );

    setTasks(updated);
    StorageManager.saveTasks(updated);
    logActivity(`Menulis komentar pada tugas`, target.title);
  };

  const evaluateTaskByLecturer = (taskId: string, score: number, feedback: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target || !currentUser) return;

    const updated = tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            score,
            lecturerFeedback: feedback,
            status: 'DONE' as TaskStatus,
            completedAt: t.completedAt || new Date().toISOString()
          }
        : t
    );

    setTasks(updated);
    StorageManager.saveTasks(updated);

    logActivity(`Dosen memberikan nilai ${score}/100 pada tugas "${target.title}"`, target.title);
    addNotification(
      `🎓 Nilai Dosen Diberikan: ${target.title}`,
      `${currentUser.name} memberikan nilai ${score}/100. Catatan: "${feedback}"`,
      'evaluation',
      target.id
    );
  };

  const evaluateGroupByLecturer = (
    groupId: string,
    score: number,
    notes: string,
    rubric: GroupEvaluation['rubric']
  ) => {
    if (!currentUser) return;

    const evaluation: GroupEvaluation = {
      lecturerId: currentUser.id,
      lecturerName: currentUser.name,
      score,
      notes,
      evaluationDate: new Date().toISOString(),
      rubric
    };

    const updated = groups.map(g => (g.id === groupId ? { ...g, evaluation } : g));
    setGroups(updated);
    StorageManager.saveGroups(updated);

    logActivity(`Dosen memberikan evaluasi menyeluruh untuk kelompok (Nilai: ${score})`);
    addNotification(
      `🎓 Evaluasi Akhir Kelompok Diberikan!`,
      `${currentUser.name} telah mengevaluasi kinerja kelompok dengan nilai akumulatif ${score}/100.`,
      'evaluation'
    );
  };

  // GROUP OPERATIONS
  const createGroup = (groupData: {
    name: string;
    courseName: string;
    classSection: string;
    description: string;
    lecturerName: string;
    lecturerNip: string;
  }): Group => {
    const newCode = `K${Math.floor(10 + Math.random() * 90)}-${groupData.courseName.substring(0, 3).toUpperCase()}`;
    const newGroup: Group = {
      id: `grp-${Date.now()}`,
      code: newCode,
      name: groupData.name,
      courseName: groupData.courseName,
      classSection: groupData.classSection,
      lecturerName: groupData.lecturerName,
      lecturerNip: groupData.lecturerNip,
      description: groupData.description,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'usr-ketua',
      members: currentUser
        ? [
            {
              userId: currentUser.id,
              name: currentUser.name,
              nim: currentUser.nim,
              role: 'KETUA',
              email: currentUser.email,
              specialization: 'Ketua Kelompok',
              joinedAt: new Date().toISOString()
            }
          ]
        : []
    };

    const updated = [...groups, newGroup];
    setGroups(updated);
    StorageManager.saveGroups(updated);
    setActiveGroupId(newGroup.id);

    logActivity(`Membuat kelompok baru "${newGroup.name}" (${newGroup.code})`);
    addNotification(`Kelompok Baru Dibuat`, `Kelompok "${newGroup.name}" berhasil dibuat dengan kode join: ${newGroup.code}`, 'status_change');

    return newGroup;
  };

  const addMemberToGroup = (
    groupId: string,
    member: { nim: string; name: string; email: string; role: 'KETUA' | 'ANGGOTA'; specialization?: string }
  ): { success: boolean; message: string } => {
    const target = groups.find(g => g.id === groupId);
    if (!target) return { success: false, message: 'Kelompok tidak ditemukan.' };

    if (target.members.some(m => m.nim.toLowerCase() === member.nim.trim().toLowerCase())) {
      return { success: false, message: 'Mahasiswa dengan NIM ini sudah tergabung dalam kelompok.' };
    }

    const newMember = {
      userId: `usr-${Date.now()}`,
      name: member.name.trim(),
      nim: member.nim.trim(),
      email: member.email.trim(),
      role: member.role,
      specialization: member.specialization || 'Anggota Tim',
      joinedAt: new Date().toISOString()
    };

    const updated = groups.map(g =>
      g.id === groupId ? { ...g, members: [...g.members, newMember] } : g
    );

    setGroups(updated);
    StorageManager.saveGroups(updated);
    logActivity(`Menambahkan anggota ${member.name} (NIM: ${member.nim}) ke kelompok`);

    return { success: true, message: `Berhasil menambahkan ${member.name} ke kelompok!` };
  };

  const joinGroupByCode = (code: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Silakan masuk terlebih dahulu.' };

    const target = groups.find(g => g.code.trim().toUpperCase() === code.trim().toUpperCase());
    if (!target) return { success: false, message: 'Kode kelompok tidak ditemukan.' };

    if (target.members.some(m => m.userId === currentUser.id || m.nim === currentUser.nim)) {
      setActiveGroupId(target.id);
      return { success: true, message: `Anda sudah tergabung dalam kelompok "${target.name}".` };
    }

    const newMember = {
      userId: currentUser.id,
      name: currentUser.name,
      nim: currentUser.nim,
      role: 'ANGGOTA' as const,
      email: currentUser.email,
      specialization: currentUser.major || 'Anggota Tim',
      joinedAt: new Date().toISOString()
    };

    const updated = groups.map(g =>
      g.id === target.id ? { ...g, members: [...g.members, newMember] } : g
    );

    setGroups(updated);
    StorageManager.saveGroups(updated);
    setActiveGroupId(target.id);

    logActivity(`Bergabung ke dalam kelompok ${target.name} menggunakan kode ${target.code}`);
    return { success: true, message: `Selamat! Anda berhasil bergabung ke ${target.name}.` };
  };

  // NOTIFICATION ACTIONS
  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    StorageManager.saveNotifications(updated);
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    StorageManager.saveNotifications(updated);
  };

  const resetAllDemoData = () => {
    StorageManager.resetToDefault();
    setGroups(StorageManager.getGroups());
    setTasks(StorageManager.getTasks());
    setNotifications(StorageManager.getNotifications());
    setActivities(StorageManager.getActivities());
    setActiveGroupIdState('grp-rpl-04');
  };

  return (
    <AppContext.Provider
      value={{
        groups,
        activeGroup,
        activeGroupId,
        setActiveGroupId,
        createGroup,
        addMemberToGroup,
        joinGroupByCode,
        tasks,
        groupTasks,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        requestRevision,
        resolveRevision,
        addTaskAttachment,
        addTaskComment,
        evaluateTaskByLecturer,
        evaluateGroupByLecturer,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        triggerPushNotification,
        triggerLocationReminder,
        userCoords,
        refreshUserLocation,
        activities,
        resetAllDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
