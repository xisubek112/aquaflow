/**
 * Admin Dashboard View
 * Key metrics, financial summaries, warehouse counters, and status cards
 */

import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { DashboardStats } from '../../types/index.js';
import {
  PackageCheck,
  Truck,
  RotateCcw,
  AlertTriangle,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Warehouse,
  CheckCircle,
  XCircle,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getDashboardStats();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Bugungi buyurtmalar',
      value: stats.ordersToday,
      sub: `${stats.deliveredToday} ta yetkazildi`,
      icon: <PackageCheck className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50 text-sky-900 border-sky-200',
      action: () => onNavigateTab('orders'),
    },
    {
      title: 'Bugun yetkazilgan',
      value: stats.deliveredToday,
      sub: 'Muvaffaqiyatli topshirildi',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      action: () => onNavigateTab('orders'),
    },
    {
      title: 'Jarayondagi buyurtmalar',
      value: stats.inProgressOrders,
      sub: `${stats.unassignedOrdersCount} ta tasdiqlash/biriktirishda`,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      action: () => onNavigateTab('orders'),
    },
    {
      title: 'Bekor qilingan',
      value: stats.cancelledOrders,
      sub: 'Buyurtmalar bekor qilingan',
      icon: <XCircle className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 text-rose-900 border-rose-200',
      action: () => onNavigateTab('orders'),
    },
    {
      title: 'Jami mijozlar',
      value: stats.totalCustomers,
      sub: 'Faol suv iste\'molchilari',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 text-blue-900 border-blue-200',
      action: () => onNavigateTab('customers'),
    },
    {
      title: 'Faol haydovchilar',
      value: stats.activeDrivers,
      sub: 'Marshrutda va navbatchilikda',
      icon: <Truck className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 text-teal-900 border-teal-200',
      action: () => onNavigateTab('drivers'),
    },
    {
      title: 'Ombordagi to\'la suvlar',
      value: `${stats.totalFullBottles} ta`,
      sub: '19L va 10L tayyor mahsulot',
      icon: <Warehouse className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      action: () => onNavigateTab('warehouse'),
    },
    {
      title: 'Ombordagi bo\'sh idishlar',
      value: `${stats.totalEmptyBottles} ta`,
      sub: 'Tozalash va to\'ldirishga tayyor',
      icon: <RotateCcw className="w-5 h-5 text-cyan-600" />,
      bg: 'bg-cyan-50 text-cyan-900 border-cyan-200',
      action: () => onNavigateTab('warehouse'),
    },
    {
      title: 'Shikastlangan idishlar',
      value: `${stats.totalDamagedBottles} ta`,
      sub: `${stats.activeIssuesCount} ta ko'rib chiqilayotgan muammo`,
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      bg: 'bg-red-50 text-red-900 border-red-200',
      action: () => onNavigateTab('warehouse'),
    },
    {
      title: 'Bugungi tushum',
      value: formatUZS(stats.revenueToday),
      sub: 'To\'langan buyurtmalar',
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      action: () => onNavigateTab('reports'),
    },
    {
      title: 'Oylik tushum (Oktyabr)',
      value: formatUZS(stats.revenueThisMonth),
      sub: 'Jami sof aylanma',
      icon: <TrendingUp className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50 text-sky-900 border-sky-200',
      action: () => onNavigateTab('reports'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 text-white rounded-2xl p-6 shadow-lg shadow-sky-600/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Admin Boshqaruv Paneli</h1>
          <p className="text-sky-100 text-sm mt-1">
            Bugungi suv yetkazib berish, ombor qoldiqlari va haydovchilar harakati tahlili
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab('warehouse')}
            className="px-4 py-2 bg-white text-sky-800 text-xs font-semibold rounded-xl hover:bg-sky-50 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Warehouse className="w-4 h-4 text-sky-600" />
            Omborga kirim
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('drivers')}
            className="px-4 py-2 bg-sky-500/80 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl border border-sky-300/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            Haydovchilar GPS
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('reports')}
            className="px-4 py-2 bg-sky-500/80 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl border border-sky-300/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            Oylik hisobot
          </button>
        </div>
      </div>

      {/* Grid of Key Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <div
            key={i}
            onClick={c.action}
            className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md hover:border-sky-300 ${c.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{c.title}</span>
              <div className="p-2 rounded-lg bg-white/80 shadow-xs">{c.icon}</div>
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight">{c.value}</div>
            <div className="mt-1 flex items-center justify-between text-xs opacity-75">
              <span>{c.sub}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </div>
          </div>
        ))}
      </div>

      {/* Operations Overview & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Orders Pipeline Status */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-sky-100 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Bugungi Buyurtmalar Holati</h3>
              <p className="text-xs text-slate-500">Barcha faol va yakunlangan buyurtmalar balansi</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Barchasini ko'rish &rarr;
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Topshirilgan (Muvaffaqiyatli)</span>
                <span className="font-bold text-emerald-600">{stats.deliveredToday} / {stats.ordersToday}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.ordersToday ? (stats.deliveredToday / stats.ordersToday) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Yo'lda va yetkazilmoqda</span>
                <span className="font-bold text-sky-600">{stats.inProgressOrders} ta</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.ordersToday ? (stats.inProgressOrders / stats.ordersToday) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Yangi / Tasdiqlanmagan</span>
                <span className="font-bold text-amber-600">{stats.unassignedOrdersCount} ta</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.ordersToday ? (stats.unassignedOrdersCount / stats.ordersToday) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Jami 18.9L Yetkazildi</span>
              <span className="text-base font-bold text-slate-800">53 ta</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Qaytarilgan bo'sh idish</span>
              <span className="text-base font-bold text-teal-700">51 ta</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Qaytarilish darajasi</span>
              <span className="text-base font-bold text-emerald-600">96.2%</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Ombor & Idishlar Alert */}
        <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-base">Ombor Zaxirasi Holati</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Idishlar va suv zaxiralari avtomatik balansi
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-xs">
                <span className="text-slate-700 font-medium">To'la 19L suv zaxirasi:</span>
                <span className="font-bold text-sky-900">{stats.totalFullBottles} dona</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-700 font-medium">Ombordagi bo'sh idishlar:</span>
                <span className="font-bold text-slate-900">{stats.totalEmptyBottles} dona</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs">
                <span className="text-rose-700 font-medium">Shikastlangan / Yaroqsiz:</span>
                <span className="font-bold text-rose-800">{stats.totalDamagedBottles} dona</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('warehouse')}
            className="w-full mt-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Ombor boshqaruviga o'tish
          </button>
        </div>
      </div>
    </div>
  );
};
