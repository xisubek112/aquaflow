/**
 * SMS & Telegram Notification Gateway (Xabarnomalar Markazi)
 * Real-time SMS and Telegram notification log and direct dispatch simulator
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  MessageSquare,
  Send,
  Phone,
  CheckCircle2,
  Clock,
  SendHorizonal,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { SmsNotification } from '../../types/index.js';

export const SmsGatewayModal: React.FC = () => {
  const [logs, setLogs] = useState<SmsNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [form, setForm] = useState({
    recipientPhone: '+998 90 987 65 43',
    recipientName: 'Ali Valiyev',
    channel: 'SMS',
    title: 'Buyurtma eslatmasi',
    message: 'AquaFlow: Hurmatli mijoz, buyurtmangiz tayyorlanmoqda.',
  });

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSmsLogs();
      if (res.success) setLogs(res.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.sendSmsNotice(form);
      if (res.success) {
        setShowSendModal(false);
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3000);
        loadLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const applyTemplate = (type: string) => {
    switch (type) {
      case 'CONFIRM':
        setForm(prev => ({
          ...prev,
          title: 'Buyurtma tasdiqlandi',
          message: 'AquaFlow: Buyurtmangiz tasdiqlandi! Haydovchi zaxirani yuklab yo\'lga chiqmoqda.',
        }));
        break;
      case 'ON_ROUTE':
        setForm(prev => ({
          ...prev,
          title: 'Haydovchi yo\'lda',
          message: 'AquaFlow: Haydovchimiz Jasurbek (+998973456789) Isuzu 01 A 777 BA mashinasida manzilingiz sari yo\'lga chiqdi.',
        }));
        break;
      case 'BOTTLE_REMINDER':
        setForm(prev => ({
          ...prev,
          title: 'Bo\'sh idish eslatmasi',
          message: 'AquaFlow: Iltimos navbatdagi suv yetkazib berilishida avvalgi bo\'sh idishlarni topshirishga tayyorlab qo\'ying. Rahmat!',
        }));
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">SMS va Telegram Xabarnomalar Shlyuzi</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mijozlar va haydovchilarga jo'natilgan xabarlar jurnali, shablonlar va to'g'ridan-to'g'ri SMS yuborish
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSendModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-sm shadow-sky-200 flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          Yangi xabar yuborish
        </button>
      </div>

      {sendSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Xabar muvaffaqiyatli jo'natildi va yetkazildi!
        </div>
      )}

      {/* Outgoing Messages Table */}
      <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Jo'natilgan Xabarlar Tarixi ({logs.length})
          </span>
          <button onClick={loadLogs} className="text-slate-400 hover:text-sky-600 p-1">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Vaqt</th>
                <th className="py-3 px-4">Kanal</th>
                <th className="py-3 px-4">Qabul qiluvchi</th>
                <th className="py-3 px-4">Xabar mazmuni</th>
                <th className="py-3 px-4 text-center">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(log.sentAt).toLocaleDateString('uz-UZ')} {new Date(log.sentAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.channel === 'TELEGRAM'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {log.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <div>{log.recipientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.recipientPhone}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">
                    <span className="font-semibold text-slate-900 block text-[11px]">{log.title}</span>
                    <p className="line-clamp-2 mt-0.5 text-[11px] leading-relaxed">{log.message}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Yetkazildi
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Message Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">SMS / Telegram Xabari Yuborish</h3>
              </div>
              <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-3.5 text-xs">
              {/* Quick Template Buttons */}
              <div>
                <span className="block font-semibold text-slate-500 text-[11px] uppercase mb-1.5">
                  Tezkor shablonlar:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTemplate('CONFIRM')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 rounded-lg text-[11px] font-medium transition-colors"
                  >
                    Tasdiqlash
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('ON_ROUTE')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 rounded-lg text-[11px] font-medium transition-colors"
                  >
                    Haydovchi yo'lda
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('BOTTLE_REMINDER')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 rounded-lg text-[11px] font-medium transition-colors"
                  >
                    Bo'sh idish eslatmasi
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kanal</label>
                  <select
                    value={form.channel}
                    onChange={e => setForm({ ...form, channel: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="SMS">SMS Gateway</option>
                    <option value="TELEGRAM">Telegram Bot</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qabul qiluvchi ismi</label>
                  <input
                    type="text"
                    value={form.recipientName}
                    onChange={e => setForm({ ...form, recipientName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefon raqami</label>
                <input
                  type="text"
                  value={form.recipientPhone}
                  onChange={e => setForm({ ...form, recipientPhone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mavzu / Sarlavha</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Xabar matni</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Yuborish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
