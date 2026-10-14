/**
 * AquaFlow - Water Delivery Management System (Suv Yetkazib Berish Boshqaruv Tizimi)
 * Main Application Shell & Role-Based Router
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/common/Header.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { WarehouseManagement } from './components/admin/WarehouseManagement.js';
import { DriversManagement } from './components/admin/DriversManagement.js';
import { CustomersManagement } from './components/admin/CustomersManagement.js';
import { ReportsManagement } from './components/admin/ReportsManagement.js';
import { AuditLogsView } from './components/admin/AuditLogsView.js';
import { OperatorDashboard } from './components/operator/OperatorDashboard.js';
import { DriverApp } from './components/driver/DriverApp.js';
import { CustomerPortal } from './components/customer/CustomerPortal.js';
import { AuthScreen } from './components/auth/AuthScreen.js';
import { SubscriptionsManager } from './components/features/SubscriptionsManager.js';
import { BottleTrackerModal } from './components/features/BottleTrackerModal.js';
import { SmsGatewayModal } from './components/features/SmsGatewayModal.js';
import { OfflineIndicator } from './components/common/OfflineIndicator.js';
import { PWAInstallButton } from './components/common/PWAInstallButton.js';
import {
  LayoutDashboard,
  Warehouse,
  ShoppingBag,
  Truck,
  Users,
  FileText,
  ShieldCheck,
  Menu,
  X,
  Droplets,
  CalendarDays,
  QrCode,
  MessageSquare
} from 'lucide-react';

const MainShell: React.FC = () => {
  const { currentRole, currentUser, isLoading } = useAuth();
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [operatorTab, setOperatorTab] = useState<string>('orders');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, display AuthScreen (Login with login/password or Customer Registration)
  if (!currentUser || !currentRole) {
    return <AuthScreen />;
  }

  // If DRIVER role is active: render mobile-friendly Driver App
  if (currentRole === 'DRIVER') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <DriverApp />
        </main>
      </div>
    );
  }

  // If CUSTOMER role is active: render Customer Portal
  if (currentRole === 'CUSTOMER') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <CustomerPortal />
        </main>
      </div>
    );
  }

  // Admin Navigation Items
  const adminNavItems = [
    { id: 'dashboard', label: 'Boshqaruv Paneli', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'orders', label: 'Buyurtmalar & Dispatch', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Doyimiy Obunalar', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'warehouse', label: 'Ombor & Idishlar', icon: <Warehouse className="w-4 h-4" /> },
    { id: 'bottles', label: 'QR Idish Pasporti', icon: <QrCode className="w-4 h-4" /> },
    { id: 'drivers', label: 'Haydovchi & Operatorlar', icon: <Truck className="w-4 h-4" /> },
    { id: 'customers', label: 'Mijozlar Balansi', icon: <Users className="w-4 h-4" /> },
    { id: 'sms', label: 'SMS & Telegram Shlyuz', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'reports', label: 'Oylik Hisobotlar', icon: <FileText className="w-4 h-4" /> },
    { id: 'audit', label: 'Xavfsizlik & Audit', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  // Operator Navigation Items
  const operatorNavItems = [
    { id: 'orders', label: 'Buyurtmalar & Dispatch', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Doyimiy Obunalar', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'warehouse', label: 'Ombor Qoldiqlari', icon: <Warehouse className="w-4 h-4" /> },
    { id: 'bottles', label: 'QR Idish Pasporti', icon: <QrCode className="w-4 h-4" /> },
    { id: 'drivers', label: 'Haydovchilar Xaritasi', icon: <Truck className="w-4 h-4" /> },
    { id: 'customers', label: 'Mijozlar Ro\'yxati', icon: <Users className="w-4 h-4" /> },
    { id: 'sms', label: 'SMS & Telegram Shlyuz', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const activeTab = currentRole === 'ADMIN' ? adminTab : operatorTab;
  const setActiveTab = currentRole === 'ADMIN' ? setAdminTab : setOperatorTab;
  const navItems = currentRole === 'ADMIN' ? adminNavItems : operatorNavItems;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Mobile Navigation Toggle Bar */}
        <div className="md:hidden flex items-center justify-between bg-white p-3.5 rounded-xl border border-sky-100 shadow-xs">
          <span className="font-bold text-xs text-slate-800">
            Bo'lim: {navItems.find(n => n.id === activeTab)?.label}
          </span>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={`${
            mobileSidebarOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 shrink-0 space-y-1.5`}
        >
          <div className="bg-white rounded-2xl border border-sky-100 p-3 shadow-xs">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {currentRole === 'ADMIN' ? 'Admin Bo\'limlari' : 'Operator Bo\'limlari'}
            </div>

            <nav className="space-y-1">
              {navItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm shadow-sky-200'
                        : 'text-slate-600 hover:bg-sky-50/60 hover:text-sky-900'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick System Badge */}
          <div className="hidden md:block p-4 bg-white/70 rounded-2xl border border-sky-100/70 text-xs space-y-2">
            <div className="flex items-center gap-2 text-sky-800 font-bold">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>AquaFlow v2.5 Pro</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Toshkent Suv Ta'minoti, Obunalar va Logistika boshqaruv platformasi.
            </p>
            <div className="pt-1">
              <PWAInstallButton variant="compact" className="w-full justify-center" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setAdminTab} />}
          {activeTab === 'orders' && <OperatorDashboard />}
          {activeTab === 'subscriptions' && <SubscriptionsManager />}
          {activeTab === 'warehouse' && <WarehouseManagement />}
          {activeTab === 'bottles' && <BottleTrackerModal />}
          {activeTab === 'drivers' && <DriversManagement />}
          {activeTab === 'customers' && <CustomersManagement />}
          {activeTab === 'sms' && <SmsGatewayModal />}
          {activeTab === 'reports' && <ReportsManagement />}
          {activeTab === 'audit' && <AuditLogsView />}
        </main>
      </div>

      {/* Connectivity Status Toast for PWA */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainShell />
    </AuthProvider>
  );
}
