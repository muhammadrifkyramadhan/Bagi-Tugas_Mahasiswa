import { User, Group, Task, NotificationItem, ActivityLog, CampusLocation } from '../types';

// Simple SHA-256 for secure client password hashing
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'SIM_TUGAS_SALT_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial Campus Locations for Geofence Alerts
export const DEFAULT_CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'loc-1',
    name: 'Gedung Lab Komputer & Informatika',
    latitude: -6.2088,
    longitude: 106.8456,
    radiusMeters: 250,
    description: 'Pusat praktikum pemrograman, database, dan presentasi proyek tugas.'
  },
  {
    id: 'loc-2',
    name: 'Perpustakaan Pusat & Co-Working Space',
    latitude: -6.2095,
    longitude: 106.8470,
    radiusMeters: 200,
    description: 'Ruang belajar bersama dan diskusi kelompok mahasiswa.'
  },
  {
    id: 'loc-3',
    name: 'Gedung Kuliah Bersama (GKB Lantai 3)',
    latitude: -6.2075,
    longitude: 106.8445,
    radiusMeters: 300,
    description: 'Ruang kelas perkuliahan Rekayasa Perangkat Lunak.'
  }
];

// Seed Users
export const SEED_USERS: User[] = [
  {
    id: 'usr-dosen',
    nim: '198003152005011002',
    name: 'Prof. Dr. Ir. Hendra Wijaya, M.T.',
    email: 'hendra.wijaya@universitas.ac.id',
    role: 'DOSEN',
    phone: '081234567890',
    major: 'Teknik Informatika',
    classGroup: 'Koordinator RPL',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // admin123
    securityQuestion: 'Nama hewan peliharaan pertama?',
    securityAnswer: 'kucing'
  },
  {
    id: 'usr-ketua',
    nim: '220101042',
    name: 'Muhammad Rifky Ramadhan',
    email: 'muhammadrifkyramadhan434@gmail.com',
    role: 'KETUA',
    phone: '087811223344',
    major: 'Teknik Informatika',
    classGroup: 'IF-22-B',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    securityQuestion: 'Kota kelahiran ibu kandung?',
    securityAnswer: 'bandung'
  },
  {
    id: 'usr-anggota-1',
    nim: '220101055',
    name: 'Siti Aisyah',
    email: 'siti.aisyah@student.ac.id',
    role: 'ANGGOTA',
    phone: '081399887766',
    major: 'Teknik Informatika',
    classGroup: 'IF-22-B',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    securityQuestion: 'Nama sekolah dasar Anda?',
    securityAnswer: 'sdn1'
  },
  {
    id: 'usr-anggota-2',
    nim: '220101078',
    name: 'Budi Santoso',
    email: 'budi.santoso@student.ac.id',
    role: 'ANGGOTA',
    phone: '085211447788',
    major: 'Teknik Informatika',
    classGroup: 'IF-22-B',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    securityQuestion: 'Makanan favorit masa kecil?',
    securityAnswer: 'bakso'
  },
  {
    id: 'usr-anggota-3',
    nim: '220101090',
    name: 'Dian Kusuma Wardani',
    email: 'dian.kusuma@student.ac.id',
    role: 'ANGGOTA',
    phone: '089655443322',
    major: 'Teknik Informatika',
    classGroup: 'IF-22-B',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    securityQuestion: 'Warna favorit Anda?',
    securityAnswer: 'biru'
  }
];

// Seed Groups
export const SEED_GROUPS: Group[] = [
  {
    id: 'grp-rpl-04',
    code: 'RPL-K04',
    name: 'Kelompok 4 - Garuda Dev Team',
    courseName: 'Rekayasa Perangkat Lunak',
    classSection: 'IF-22-B (Semester 5)',
    lecturerName: 'Prof. Dr. Ir. Hendra Wijaya, M.T.',
    lecturerNip: '198003152005011002',
    description: 'Pengembangan Sistem Informasi Pembagian dan Monitoring Tugas Kelompok Mahasiswa Berbasis Web untuk menyelesaikan masalah koordinasi yang berantakan di WhatsApp.',
    createdAt: '2026-09-15T08:00:00.000Z',
    createdBy: 'usr-ketua',
    members: [
      {
        userId: 'usr-ketua',
        name: 'Muhammad Rifky Ramadhan',
        nim: '220101042',
        role: 'KETUA',
        email: 'muhammadrifkyramadhan434@gmail.com',
        specialization: 'Project Manager & Fullstack Dev',
        joinedAt: '2026-09-15T08:00:00.000Z'
      },
      {
        userId: 'usr-anggota-1',
        name: 'Siti Aisyah',
        nim: '220101055',
        role: 'ANGGOTA',
        email: 'siti.aisyah@student.ac.id',
        specialization: 'UI/UX Designer & Frontend',
        joinedAt: '2026-09-16T09:30:00.000Z'
      },
      {
        userId: 'usr-anggota-2',
        name: 'Budi Santoso',
        nim: '220101078',
        role: 'ANGGOTA',
        email: 'budi.santoso@student.ac.id',
        specialization: 'Backend Developer & Database',
        joinedAt: '2026-09-16T10:15:00.000Z'
      },
      {
        userId: 'usr-anggota-3',
        name: 'Dian Kusuma Wardani',
        nim: '220101090',
        role: 'ANGGOTA',
        email: 'dian.kusuma@student.ac.id',
        specialization: 'QA Tester & Technical Writer',
        joinedAt: '2026-09-17T14:20:00.000Z'
      }
    ],
    evaluation: {
      lecturerId: 'usr-dosen',
      lecturerName: 'Prof. Dr. Ir. Hendra Wijaya, M.T.',
      score: 88,
      notes: 'Pembagian peran sudah sangat proporsional. Dokumentasi antarmuka dan basis data sangat rapi. Terus pertahankan kecepatan penyelesaian tugas.',
      evaluationDate: '2026-10-01T10:00:00.000Z',
      rubric: {
        collaborativeEffort: 5,
        deadlinePunctuality: 4,
        qualityOfWork: 5,
        systemDocumentation: 4
      }
    }
  },
  {
    id: 'grp-rpl-02',
    code: 'RPL-K02',
    name: 'Kelompok 2 - CyberNexus Team',
    courseName: 'Rekayasa Perangkat Lunak',
    classSection: 'IF-22-B (Semester 5)',
    lecturerName: 'Prof. Dr. Ir. Hendra Wijaya, M.T.',
    lecturerNip: '198003152005011002',
    description: 'Sistem Informasi Manajemen Inventaris Laboratorium Berbasis Web.',
    createdAt: '2026-09-16T11:00:00.000Z',
    createdBy: 'usr-anggota-2',
    members: [
      {
        userId: 'usr-anggota-2',
        name: 'Budi Santoso',
        nim: '220101078',
        role: 'KETUA',
        email: 'budi.santoso@student.ac.id',
        specialization: 'Ketua Tim & Backend',
        joinedAt: '2026-09-16T11:00:00.000Z'
      }
    ]
  }
];

// Helper to get formatted date string offsets
const getOffsetDate = (days: number, timeStr = '23:59'): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// Seed Tasks for Kelompok 4
export const SEED_TASKS: Task[] = [
  {
    id: 'tsk-001',
    groupId: 'grp-rpl-04',
    title: 'Analisis Kebutuhan Pengguna & Wawancara Dosen',
    description: 'Mengidentifikasi masalah nyata pembagian tugas mahasiswa di WhatsApp, menyusun daftar use case, functional requirements, dan non-functional requirements.',
    assignedTo: ['usr-ketua', 'usr-anggota-3'],
    assignedNames: ['Muhammad Rifky Ramadhan', 'Dian Kusuma Wardani'],
    status: 'DONE',
    priority: 'TINGGI',
    weight: 15,
    dueDate: getOffsetDate(-6),
    dueTime: '17:00',
    completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    subtasks: [
      { id: 'sub-1', title: 'Wawancara dengan Dosen Pengampu', completed: true },
      { id: 'sub-2', title: 'Kuesioner masalah WhatsApp kelompok', completed: true },
      { id: 'sub-3', title: 'Penyusunan dokumen Software Requirements Spec (SRS)', completed: true }
    ],
    attachments: [
      {
        id: 'att-1',
        title: 'Dokumen_SRS_SIM_Tugas_v1.0.pdf',
        url: 'https://drive.google.com/file/d/sample-srs-doc',
        type: 'drive',
        submittedBy: 'Dian Kusuma Wardani',
        submittedAt: new Date(Date.now() - 5 * 86400000).toISOString()
      }
    ],
    revisions: [],
    comments: [
      {
        id: 'com-1',
        userId: 'usr-dosen',
        userName: 'Prof. Dr. Ir. Hendra Wijaya, M.T.',
        userRole: 'DOSEN',
        comment: 'Analisis kebutuhan sudah mencakup 3 aktor utama (Ketua, Anggota, Dosen). Sangat bagus.',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        isLecturerNote: true
      }
    ],
    score: 92,
    lecturerFeedback: 'Dokumen SRS rapi dan terstruktur sesuai standar IEEE.'
  },
  {
    id: 'tsk-002',
    groupId: 'grp-rpl-04',
    title: 'Desain Antarmuka UI/UX (Figma) & Design System',
    description: 'Membuat wireframe, high-fidelity mockups untuk Dashboard Mahasiswa, Papan Kanban, Analitik Kontribusi, Dark Mode, dan Ruang Evaluasi Dosen.',
    assignedTo: ['usr-anggota-1'],
    assignedNames: ['Siti Aisyah'],
    status: 'IN_REVIEW',
    priority: 'TINGGI',
    weight: 20,
    dueDate: getOffsetDate(1),
    dueTime: '20:00',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    subtasks: [
      { id: 'sub-4', title: 'Moodboard & Color Palette (Dark & Light Mode)', completed: true },
      { id: 'sub-5', title: 'Komponen UI Card, Badge, Modal, Form', completed: true },
      { id: 'sub-6', title: 'Prototype alur review tugas & revisi', completed: true },
      { id: 'sub-7', title: 'Responsive mobile & tablet preview', completed: false }
    ],
    attachments: [
      {
        id: 'att-2',
        title: 'Figma Prototype SIM-Tugas 2026',
        url: 'https://www.figma.com/file/sample-sim-tugas-ui',
        type: 'link',
        submittedBy: 'Siti Aisyah',
        submittedAt: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ],
    revisions: [],
    comments: [
      {
        id: 'com-2',
        userId: 'usr-anggota-1',
        userName: 'Siti Aisyah',
        userRole: 'ANGGOTA',
        comment: 'Halo Mas Rifky, link Figma sudah siap ditinjau. Tinggal sedikit penyesuaian di tablet view.',
        createdAt: new Date(Date.now() - 11 * 3600000).toISOString()
      },
      {
        id: 'com-3',
        userId: 'usr-ketua',
        userName: 'Muhammad Rifky Ramadhan',
        userRole: 'KETUA',
        comment: 'Keren banget desainnya! Kontras dark mode-nya nyaman di mata. Sedang saya cek keseluruhan.',
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
      }
    ]
  },
  {
    id: 'tsk-003',
    groupId: 'grp-rpl-04',
    title: 'Perancangan Skema Database Relasional & ERD',
    description: 'Menyusun tabel Users, Groups, Tasks, Subtasks, Revisions, dan Notifications dengan integritas referensial dan indeks query yang optimal.',
    assignedTo: ['usr-anggota-2'],
    assignedNames: ['Budi Santoso'],
    status: 'IN_PROGRESS',
    priority: 'SEDANG',
    weight: 20,
    dueDate: getOffsetDate(2),
    dueTime: '23:59',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    subtasks: [
      { id: 'sub-8', title: 'Conceptual Data Model (CDM)', completed: true },
      { id: 'sub-9', title: 'Physical Data Model (PDM) & Normalisasi 3NF', completed: true },
      { id: 'sub-10', title: 'Data Dictionary & Constraint Foreign Key', completed: false }
    ],
    attachments: [
      {
        id: 'att-3',
        title: 'Skema_ERD_Database_v2.png',
        url: 'https://draw.io/sample-erd-diagram',
        type: 'file',
        submittedBy: 'Budi Santoso',
        submittedAt: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ],
    revisions: [],
    comments: []
  },
  {
    id: 'tsk-004',
    groupId: 'grp-rpl-04',
    title: 'Implementasi Autentikasi, Enkripsi, & Role Permission',
    description: 'Membangun logika login, register dengan SHA-256 hashing, pemulihan password via pertanyaan keamanan, dan kontrol hak akses Ketua vs Anggota vs Dosen.',
    assignedTo: ['usr-ketua', 'usr-anggota-2'],
    assignedNames: ['Muhammad Rifky Ramadhan', 'Budi Santoso'],
    status: 'REVISION',
    priority: 'MENDESAK',
    weight: 25,
    dueDate: getOffsetDate(0), // Today!
    dueTime: '18:00',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    subtasks: [
      { id: 'sub-11', title: 'Form Login & Register dengan Validasi', completed: true },
      { id: 'sub-12', title: 'Simulasi Enkripsi SHA-256 Client-Side', completed: true },
      { id: 'sub-13', title: 'Fitur Lupa Password & Reset', completed: true },
      { id: 'sub-14', title: 'Pencegahan akses endpoint tanpa role sesuai', completed: false }
    ],
    attachments: [
      {
        id: 'att-4',
        title: 'Pull Request #12: Auth & Role Security',
        url: 'https://github.com/garuda-dev/sim-tugas/pull/12',
        type: 'github',
        submittedBy: 'Budi Santoso',
        submittedAt: new Date(Date.now() - 10 * 3600000).toISOString()
      }
    ],
    revisions: [
      {
        id: 'rev-1',
        requestedBy: 'Muhammad Rifky Ramadhan',
        requestedByRole: 'KETUA',
        requestedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        note: 'Mohon perbaiki pengecekan role saat Dosen login, pastikan tab Evaluasi otomatis muncul di navbar. Serta perbaiki tombol reset password bila input NIM salah.',
        resolved: false
      }
    ],
    comments: [
      {
        id: 'com-4',
        userId: 'usr-ketua',
        userName: 'Muhammad Rifky Ramadhan',
        userRole: 'KETUA',
        comment: 'Tolong segera dicek catatan revisi ya Budi, deadline sore ini jam 18:00!',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
      }
    ]
  },
  {
    id: 'tsk-005',
    groupId: 'grp-rpl-04',
    title: 'Pengujian Sistem (Black Box Testing) & UAT Mahasiswa',
    description: 'Menyusun test cases untuk skenario pembagian tugas, notifikasi deadline otomatis, ekspor PDF/Excel, dan uji coba pada 5 mahasiswa.',
    assignedTo: ['usr-anggota-3'],
    assignedNames: ['Dian Kusuma Wardani'],
    status: 'TODO',
    priority: 'SEDANG',
    weight: 10,
    dueDate: getOffsetDate(4),
    dueTime: '21:00',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    subtasks: [
      { id: 'sub-15', title: 'Tabel Test Cases Black Box', completed: false },
      { id: 'sub-16', title: 'Uji Skenario Deadline < 24 Jam', completed: false },
      { id: 'sub-17', title: 'Rekap Form UAT Feedback', completed: false }
    ],
    attachments: [],
    revisions: [],
    comments: []
  },
  {
    id: 'tsk-006',
    groupId: 'grp-rpl-04',
    title: 'Penyusunan Laporan Proyek Akhir & Ekspor Berkas',
    description: 'Penyusunan bab 1 sampai bab 5, lampiran bukti kontribusi anggota, lembar pengesahan dosen, serta ekspor format PDF & Excel.',
    assignedTo: ['usr-ketua', 'usr-anggota-1', 'usr-anggota-2', 'usr-anggota-3'],
    assignedNames: ['Muhammad Rifky Ramadhan', 'Siti Aisyah', 'Budi Santoso', 'Dian Kusuma Wardani'],
    status: 'TODO',
    priority: 'TINGGI',
    weight: 10,
    dueDate: getOffsetDate(7),
    dueTime: '23:59',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    subtasks: [
      { id: 'sub-18', title: 'Bab I Pendahuluan & Latar Belakang Masalah WA', completed: true },
      { id: 'sub-19', title: 'Bab II Landasan Teori', completed: true },
      { id: 'sub-20', title: 'Bab III Analisis & Desain Sistem', completed: false },
      { id: 'sub-21', title: 'Bab IV Implementasi & Pengujian', completed: false },
      { id: 'sub-22', title: 'Bab V Kesimpulan & Saran', completed: false }
    ],
    attachments: [],
    revisions: [],
    comments: []
  }
];

// Seed Activity Logs
export const SEED_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    groupId: 'grp-rpl-04',
    userId: 'usr-ketua',
    userName: 'Muhammad Rifky Ramadhan',
    action: 'Membuat kelompok RPL-K04 "Garuda Dev Team"',
    timestamp: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'act-2',
    groupId: 'grp-rpl-04',
    userId: 'usr-anggota-3',
    userName: 'Dian Kusuma Wardani',
    action: 'Menyelesaikan tugas Analisis Kebutuhan Pengguna & Dokumen SRS',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    taskTitle: 'Analisis Kebutuhan Pengguna & Wawancara Dosen'
  },
  {
    id: 'act-3',
    groupId: 'grp-rpl-04',
    userId: 'usr-dosen',
    userName: 'Prof. Dr. Ir. Hendra Wijaya, M.T.',
    action: 'Memberikan nilai 92 dan feedback resmi dosen',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
    taskTitle: 'Analisis Kebutuhan Pengguna & Wawancara Dosen'
  },
  {
    id: 'act-4',
    groupId: 'grp-rpl-04',
    userId: 'usr-anggota-1',
    userName: 'Siti Aisyah',
    action: 'Mengunggah link hasil prototipe Figma dan mengajukan review',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    taskTitle: 'Desain Antarmuka UI/UX (Figma) & Design System'
  },
  {
    id: 'act-5',
    groupId: 'grp-rpl-04',
    userId: 'usr-ketua',
    userName: 'Muhammad Rifky Ramadhan',
    action: 'Mengajukan revisi untuk implementasi otentikasi role dosen',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    taskTitle: 'Implementasi Autentikasi, Enkripsi, & Role Permission'
  }
];

// Seed Notifications
export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '⚠️ Deadline Mendekat Hari Ini!',
    message: 'Tugas "Implementasi Autentikasi, Enkripsi, & Role Permission" harus selesai sebelum jam 18:00.',
    type: 'deadline',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    read: false,
    taskId: 'tsk-004',
    groupId: 'grp-rpl-04'
  },
  {
    id: 'notif-2',
    title: '📝 Catatan Revisi Baru Diberikan',
    message: 'Ketua kelompok memberikan revisi pada tugas "Implementasi Autentikasi, Enkripsi, & Role Permission".',
    type: 'revision',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    read: false,
    taskId: 'tsk-004',
    groupId: 'grp-rpl-04'
  },
  {
    id: 'notif-3',
    title: '✨ Pengajuan Review Tugas Baru',
    message: 'Siti Aisyah mengajukan tugas "Desain Antarmuka UI/UX (Figma)" untuk direview ketua.',
    type: 'status_change',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    read: true,
    taskId: 'tsk-002',
    groupId: 'grp-rpl-04'
  },
  {
    id: 'notif-4',
    title: '🎓 Evaluasi Dosen Diterima',
    message: 'Prof. Dr. Ir. Hendra Wijaya memberikan nilai 92 untuk Analisis Kebutuhan Sistem.',
    type: 'evaluation',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    read: true,
    taskId: 'tsk-001',
    groupId: 'grp-rpl-04'
  }
];

// Storage keys
const STORAGE_KEYS = {
  USERS: 'sim_tugas_users',
  CURRENT_USER: 'sim_tugas_current_user',
  GROUPS: 'sim_tugas_groups',
  TASKS: 'sim_tugas_tasks',
  ACTIVITIES: 'sim_tugas_activities',
  NOTIFICATIONS: 'sim_tugas_notifications',
  THEME: 'sim_tugas_theme',
  ACTIVE_GROUP: 'sim_tugas_active_group_id',
  CAMPUS_LOCATIONS: 'sim_tugas_campus_locations'
};

// Realtime Channel
export const realtimeChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('sim_tugas_realtime_sync')
  : null;

export function broadcastDataChange(type: string, payload?: any) {
  if (realtimeChannel) {
    realtimeChannel.postMessage({ type, payload, timestamp: Date.now() });
  }
}

// Local Storage Helpers
export const StorageManager = {
  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_USERS;
    }
  },

  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    broadcastDataChange('USERS_UPDATED', users);
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) {
      // Default to Ketua for easiest initial exploration
      const defaultUser = SEED_USERS[1];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_USERS[1];
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    broadcastDataChange('AUTH_STATE_CHANGED', user);
  },

  getGroups(): Group[] {
    const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(SEED_GROUPS));
      return SEED_GROUPS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_GROUPS;
    }
  },

  saveGroups(groups: Group[]) {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    broadcastDataChange('GROUPS_UPDATED', groups);
  },

  getTasks(): Task[] {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
      return SEED_TASKS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_TASKS;
    }
  },

  saveTasks(tasks: Task[]) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    broadcastDataChange('TASKS_UPDATED', tasks);
  },

  getActivities(): ActivityLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
      return SEED_ACTIVITIES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_ACTIVITIES;
    }
  },

  saveActivities(activities: ActivityLog[]) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    broadcastDataChange('ACTIVITIES_UPDATED', activities);
  },

  getNotifications(): NotificationItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_NOTIFICATIONS;
    }
  },

  saveNotifications(notifications: NotificationItem[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    broadcastDataChange('NOTIFICATIONS_UPDATED', notifications);
  },

  getActiveGroupId(): string {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_GROUP);
    return saved || 'grp-rpl-04';
  },

  setActiveGroupId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GROUP, id);
    broadcastDataChange('ACTIVE_GROUP_CHANGED', id);
  },

  getCampusLocations(): CampusLocation[] {
    const data = localStorage.getItem(STORAGE_KEYS.CAMPUS_LOCATIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CAMPUS_LOCATIONS, JSON.stringify(DEFAULT_CAMPUS_LOCATIONS));
      return DEFAULT_CAMPUS_LOCATIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_CAMPUS_LOCATIONS;
    }
  },

  resetToDefault() {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[1]));
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(SEED_GROUPS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GROUP, 'grp-rpl-04');
    broadcastDataChange('RESET_ALL');
  }
};
