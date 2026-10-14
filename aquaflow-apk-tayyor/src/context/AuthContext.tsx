/**
 * AuthContext: Role-Based Access Control, Login/Password Authentication, and Customer Registration
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Notification } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  currentRole: UserRole | null;
  loginWithCredentials: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    addressLine: string;
    district?: string;
    companyName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  notifications: Notification[];
  unreadNotifsCount: number;
  refreshNotifications: () => void;
  markNotificationAsRead: (id: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial users & restore saved session
  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await api.getUsers();
        if (data.success && data.users.length > 0) {
          setUsers(data.users);
          const savedUserId = localStorage.getItem('aquaflow_user_id');
          if (savedUserId) {
            const savedUser = data.users.find((u: User) => u.id === savedUserId);
            if (savedUser) {
              setCurrentUser(savedUser);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  // Load notifications for current user/role
  const refreshNotifications = async () => {
    if (!currentUser) return;
    try {
      const data = await api.getNotifications(currentUser.role, currentUser.id);
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Login with login/phone and password
  const loginWithCredentials = async (identifier: string, password: string) => {
    try {
      const res = await api.loginWithPassword(identifier, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('aquaflow_user_id', res.user.id);
        return { success: true };
      }
      return { success: false, error: res.error || 'Kirishda xatolik yuz berdi' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server bilan bog\'lanishda xatolik' };
    }
  };

  // Register customer
  const registerCustomer = async (data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    addressLine: string;
    district?: string;
    companyName?: string;
  }) => {
    try {
      const res = await api.registerCustomer(data);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('aquaflow_user_id', res.user.id);
        // Refresh users list
        const updatedUsers = await api.getUsers();
        if (updatedUsers.success) {
          setUsers(updatedUsers.users);
        }
        return { success: true };
      }
      return { success: false, error: res.error || 'Ro\'yxatdan o\'tishda xatolik' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server bilan bog\'lanishda xatolik' };
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aquaflow_user_id');
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('aquaflow_user_id', user.id);
  };

  const switchRole = (role: UserRole) => {
    const userForRole = users.find(u => u.role === role);
    if (userForRole) {
      switchUser(userForRole);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        currentRole: currentUser?.role || null,
        loginWithCredentials,
        registerCustomer,
        logout,
        switchUser,
        switchRole,
        notifications,
        unreadNotifsCount,
        refreshNotifications,
        markNotificationAsRead,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
