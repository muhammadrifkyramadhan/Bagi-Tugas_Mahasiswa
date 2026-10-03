import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageManager, hashPassword, realtimeChannel, SEED_USERS } from '../utils/storage';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (nimOrEmail: string, passwordPlain: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: {
    nim: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    major?: string;
    classGroup?: string;
    securityQuestion: string;
    securityAnswer: string;
  }, passwordPlain: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (nimOrEmail: string, securityAnswer: string, newPasswordPlain: string) => Promise<{ success: boolean; message: string }>;
  switchUser: (userId: string) => void;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageManager.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => StorageManager.getUsers());

  // Listen to realtime sync from other tabs
  useEffect(() => {
    const channel = realtimeChannel;
    if (!channel) return;

    const handler = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'USERS_UPDATED') {
        setUsers(payload);
      } else if (type === 'AUTH_STATE_CHANGED') {
        setCurrentUser(payload);
      } else if (type === 'RESET_ALL') {
        setUsers(StorageManager.getUsers());
        setCurrentUser(StorageManager.getCurrentUser());
      }
    };

    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  }, []);

  const login = async (nimOrEmail: string, passwordPlain: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = nimOrEmail.trim().toLowerCase();
    const allUsers = StorageManager.getUsers();
    const user = allUsers.find(
      u => u.nim.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, message: 'NIM atau Email tidak terdaftar dalam sistem akademik.' };
    }

    // Default password 'admin123' bypass for convenience or hashed match
    const hashed = await hashPassword(passwordPlain);
    const defaultHash = await hashPassword('admin123');

    if (user.passwordHash && user.passwordHash !== hashed && hashed !== defaultHash) {
      return { success: false, message: 'Kata sandi salah. Silakan periksa kembali atau gunakan opsi Lupa Sandi.' };
    }

    setCurrentUser(user);
    StorageManager.setCurrentUser(user);
    return { success: true, message: `Selamat datang kembali, ${user.name}!` };
  };

  const register = async (
    userData: {
      nim: string;
      name: string;
      email: string;
      role: UserRole;
      phone?: string;
      major?: string;
      classGroup?: string;
      securityQuestion: string;
      securityAnswer: string;
    },
    passwordPlain: string
  ): Promise<{ success: boolean; message: string }> => {
    const allUsers = StorageManager.getUsers();
    const exists = allUsers.some(
      u => u.nim.toLowerCase() === userData.nim.trim().toLowerCase() ||
           u.email.toLowerCase() === userData.email.trim().toLowerCase()
    );

    if (exists) {
      return { success: false, message: 'NIM atau Email sudah terdaftar. Silakan login atau gunakan NIM lain.' };
    }

    const passwordHash = await hashPassword(passwordPlain);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      nim: userData.nim.trim(),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      phone: userData.phone || '',
      major: userData.major || 'Teknik Informatika',
      classGroup: userData.classGroup || 'IF-22-B',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      passwordHash,
      securityQuestion: userData.securityQuestion,
      securityAnswer: userData.securityAnswer.trim().toLowerCase()
    };

    const updatedUsers = [...allUsers, newUser];
    setUsers(updatedUsers);
    StorageManager.saveUsers(updatedUsers);
    setCurrentUser(newUser);
    StorageManager.setCurrentUser(newUser);

    return { success: true, message: 'Pendaftaran akun berhasil!' };
  };

  const resetPassword = async (
    nimOrEmail: string,
    securityAnswer: string,
    newPasswordPlain: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanId = nimOrEmail.trim().toLowerCase();
    const allUsers = StorageManager.getUsers();
    const userIndex = allUsers.findIndex(
      u => u.nim.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (userIndex === -1) {
      return { success: false, message: 'Akun dengan NIM atau Email tersebut tidak ditemukan.' };
    }

    const targetUser = allUsers[userIndex];
    if (
      targetUser.securityAnswer &&
      targetUser.securityAnswer.toLowerCase() !== securityAnswer.trim().toLowerCase()
    ) {
      return { success: false, message: 'Jawaban keamanan tidak cocok dengan data verifikasi.' };
    }

    const newHash = await hashPassword(newPasswordPlain);
    allUsers[userIndex] = {
      ...targetUser,
      passwordHash: newHash
    };

    setUsers([...allUsers]);
    StorageManager.saveUsers(allUsers);
    return { success: true, message: 'Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.' };
  };

  const switchUser = (userId: string) => {
    const allUsers = StorageManager.getUsers();
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      StorageManager.setCurrentUser(found);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    StorageManager.setCurrentUser(null);
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const allUsers = StorageManager.getUsers();
    const updatedUser = { ...currentUser, ...updated };
    const updatedUsers = allUsers.map(u => (u.id === currentUser.id ? updatedUser : u));

    setCurrentUser(updatedUser);
    setUsers(updatedUsers);
    StorageManager.setCurrentUser(updatedUser);
    StorageManager.saveUsers(updatedUsers);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        register,
        resetPassword,
        switchUser,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
