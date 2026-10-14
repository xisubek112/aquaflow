/**
 * Application Header Component
 * Multi-role switcher, Real-time notifications, and Live clock
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  Droplets,
  Bell,
  CheckCircle2,
  Clock,
  Shield,
  Headphones,
  Truck,
  UserCheck,
  ChevronDown,
  Wifi,
  WifiOff,
  X,
  LogOut,
  Type,
  PhoneCall
} from 'lucide-react';
import { UserRole } from '../../types/index.js';
import { PWAInstallButton } from './PWAInstallButton.js';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    currentRole,
    switchUser,
    switchRole,
    logout,
    notifications,
    unreadNotifsCount,
    markNotificationAsRead
  } = useAuth();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLargeMode, setIsLargeMode] = useState(() => {
    return localStorage.getItem('aquaflow_large_mode') === 'true';
  });

  useEffect(() => {
    if (isLargeMode) {
      document.documentElement.classList.add('large-text-mode');
    } else {
      document.documentElement.classList.remove('large-text-mode');
    }
  }, [isLargeMode]);

  const toggleLargeMode = () => {
    const next = !isLargeMode;
    setIsLargeMode(next);
    localStorage.setItem('aquaflow_large_mode', String(next));
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format in Asia/Tashkent
      const formatted = new Intl.DateTimeFormat('uz-UZ', {
        timeZone: 'Asia/Tashkent',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now);
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Admin',
          icon: <Shield className="w-3.5 h-3.5 text-purple-600" />,
          classes: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'OPERATOR':
        return {
          label: 'Operator',
          icon: <Headphones className="w-3.5 h-3.5 text-blue-600" />,
          classes: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'DRIVER':
        return {
          label: 'Haydovchi',
          icon: <Truck className="w-3.5 h-3.5 text-emerald-600" />,
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'CUSTOMER':
        return {
          label: 'Mijoz',
          icon: <UserCheck className="w-3.5 h-3.5 text-amber-600" />,
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
        };
    }
  };

  const roleInfo = getRoleBadge(currentRole || 'CUSTOMER');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-200">
              <Droplets className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">AquaFlow</span>
                <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded uppercase">
                  Toshkent
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Suv Yetkazib Berish Boshqaruv Tizimi
              </p>
            </div>
          </div>

          {/* Right Area: Time, Notifications, Role Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Clock & Online Status */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-mono font-medium">{currentTime}</span>
              <span className="text-slate-300">|</span>
              {isOnline ? (
                <span className="flex items-center gap-1 text-emerald-600" title="Online rejim">
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Online</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-500" title="Offline - ma'lumotlar saqlanadi">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Offline</span>
                </span>
              )}
            </div>

            {/* Oson & Katta Shrift Rejimi (Katta yoshdagilar va yoshlar uchun qulaylik) */}
            <button
              type="button"
              onClick={toggleLargeMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isLargeMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Katta yoshdagilar va oson o'qish uchun shriftlarni kattalashtirish"
            >
              <Type className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">
                {isLargeMode ? 'Oson Rejim: Yoqiq' : 'Oson Rejim (Katta shrift)'}
              </span>
            </button>

            {/* Android APK & Mobil Ilova O'rnatish */}
            <PWAInstallButton variant="header" />

            {/* Quick Hotline for Seniors / Call Assistance */}
            <a
              href="tel:+998712000011"
              className="hidden lg:flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
              title="Tezkor telefon orqali yordam"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>+998 71 200-00-11</span>
            </a>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                title="Bildirishnomalar"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-sky-100 py-3 px-4 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">Bildirishnomalar</span>
                      {unreadNotifsCount > 0 && (
                        <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {unreadNotifsCount} ta yangi
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400">Yangi bildirishnomalar yo'q</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                            n.isRead
                              ? 'bg-white border-slate-100 text-slate-600'
                              : 'bg-sky-50/70 border-sky-200 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold mb-1">
                            <span className="text-sky-900">{n.title}</span>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-600">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher & Current User */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-sky-100 hover:border-sky-300 hover:bg-sky-50/50 transition-all cursor-pointer"
              >
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser?.name || 'Foydalanuvchi'}
                  </div>
                  <div className="text-[10px] text-slate-500">{currentUser?.phone}</div>
                </div>

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${roleInfo.classes}`}>
                  {roleInfo.icon}
                  <span>{roleInfo.label}</span>
                </div>

                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-sky-100 p-2 z-50">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Rolni tanlang (Demo almashish):
                  </div>

                  <div className="space-y-1">
                    {users.map(u => {
                      const isSelected = currentUser?.id === u.id;
                      const badge = getRoleBadge(u.role);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            switchUser(u);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50 border border-sky-200 text-sky-950 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.phone}</div>
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${badge.classes}`}>
                            {badge.icon}
                            {badge.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-slate-200 hover:border-rose-200"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
