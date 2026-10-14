/**
 * Water Auto-Subscriptions Manager (Davriy Suv Obunalari)
 * Recurring weekly/monthly water contracts, automated delivery schedule, and MRR analytics
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  CalendarDays,
  Plus,
  Play,
  Pause,
  Repeat,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  X
} from 'lucide-react';
import { Subscription } from '../../types/index.js';

export const SubscriptionsManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    customerId: 'usr_customer_1',
    productId: 'prd_19l',
    quantity: 4,
    frequency: 'WEEKLY',
    deliveryDays: ['Dushanba', 'Payshanba'],
    timeSlot: '10:00 - 12:00',
    deliveryAddress: 'Yunusobod tumani, 11-mavze',
    paymentMethod: 'CLICK',
  });

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSubscriptions();
      if (res.success) setSubscriptions(res.subscriptions);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleToggleStatus = async (sub: Subscription) => {
    const nextStatus = sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.updateSubscriptionStatus(sub.id, nextStatus);
      loadSubscriptions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createSubscription(form);
      if (res.success) {
        setShowAddModal(false);
        loadSubscriptions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  const totalMRR = activeSubs.reduce((acc, curr) => acc + curr.monthlyAmount, 0);
  const totalWeeklyBottles = activeSubs.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Doyimiy Suv Obunalari (Auto-Subscriptions)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Idora va xonadonlar uchun rejalashtirilgan haftalik avtomatik suv yetkazish shartnomalari
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-sm shadow-sky-200 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi obuna qo'shish
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
          <div className="flex justify-between items-center text-xs opacity-90 font-medium">
            <span>Oylik Kafolatlangan Tushum (MRR)</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-2">{formatUZS(totalMRR)}</div>
          <span className="text-[11px] text-sky-100 mt-1 block">Faol obuna shartnomalaridan</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-sky-100 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase">
            <span>Faol Obunachilar</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{activeSubs.length} ta tashkilot/xonadon</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">100% yetkazib berish kafolati</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-sky-100 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase">
            <span>Haftalik Rejalangan Chiqim</span>
            <Repeat className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-900 mt-2">{totalWeeklyBottles * 2} dona 19L suv</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Avtomatik grafik asosida</span>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map(sub => {
          const isActive = sub.status === 'ACTIVE';
          return (
            <div
              key={sub.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isActive ? 'border-sky-200 hover:border-sky-400' : 'border-slate-200 bg-slate-50/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{sub.customerName}</h4>
                    <span className="text-xs text-slate-500 font-mono">{sub.customerPhone}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isActive ? 'Faol obuna' : 'To\'xtatilgan'}
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-sky-50/50 p-3 rounded-xl border border-sky-100 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mahsulot:</span>
                    <span className="font-bold text-slate-900">{sub.quantity}x {sub.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Davriylik:</span>
                    <span className="font-semibold text-sky-800">
                      {sub.frequency === 'TWICE_WEEKLY' ? 'Haftada 2 marta' : 'Haftada 1 marta'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Yetkazish kunlari:</span>
                    <span className="font-bold text-slate-800">{sub.deliveryDays.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Navbatdagi sana:</span>
                    <span className="font-mono font-bold text-emerald-700">{sub.nextDeliveryDate}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-sky-200 font-bold text-slate-900">
                    <span>Oylik to'lov:</span>
                    <span className="text-sky-700">{formatUZS(sub.monthlyAmount)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="truncate">{sub.deliveryAddress}</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">To'lov: {sub.paymentMethod}</span>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(sub)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isActive ? 'To\'xtatib turish' : 'Faollashtirish'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Yangi Suv Obunasi Rasmiylashtirish</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSub} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mijoz / Tashkilot</label>
                <select
                  value={form.customerId}
                  onChange={e => setForm({ ...form, customerId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="usr_customer_1">Ali Valiyev (+998 90 987 65 43)</option>
                  <option value="usr_customer_2">Artel Texnopark MCHJ (+998 71 200 00 11)</option>
                  <option value="usr_customer_3">Gulnoza Shokirova (+998 94 555 12 34)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bir reysdagi suv (dona)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Davriylik</label>
                  <select
                    value={form.frequency}
                    onChange={e => setForm({ ...form, frequency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="WEEKLY">Haftada 1 marta</option>
                    <option value="TWICE_WEEKLY">Haftada 2 marta</option>
                    <option value="MONTHLY">Oyda 1 marta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Yetkazib berish manzili</label>
                <input
                  type="text"
                  value={form.deliveryAddress}
                  onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                  placeholder="Yunusobod tumani, Bog'ishamol 45"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vaqt oralig'i</label>
                  <input
                    type="text"
                    value={form.timeSlot}
                    onChange={e => setForm({ ...form, timeSlot: e.target.value })}
                    placeholder="10:00 - 12:00"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">To'lov turi</label>
                  <select
                    value={form.paymentMethod}
                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="CLICK">Click</option>
                    <option value="PAYME">Payme</option>
                    <option value="BANK_TRANSFER">Bank o'tkazmasi</option>
                    <option value="CASH">Naqd pul</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  Obunani faollashtirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
