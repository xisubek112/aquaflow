/**
 * System Audit Trail (Audit Jurnali)
 * Complete log of security, ordering, stock modifications, and role authorizations
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { ShieldCheck, Search, Filter, RefreshCw, Clock, User, Layers } from 'lucide-react';
import { AuditLog } from '../../types/index.js';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAuditLogs();
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

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">Tizim Xavfsizlik va Audit Jurnali</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Barcha foydalanuvchilarning buyurtmalar, ombor zaxiralari va topshirishlar bo'yicha amallari qaydlari
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
          title="Yangilash"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Amal, foydalanuvchi yoki tafsilot bo'yicha..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Vaqt (Asia/Tashkent)</th>
                <th className="py-3 px-4">Foydalanuvchi / Rol</th>
                <th className="py-3 px-4">Amal turi</th>
                <th className="py-3 px-4">Obyekt</th>
                <th className="py-3 px-4">Batafsil ma'lumot</th>
                <th className="py-3 px-4 font-mono">IP Manzil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {new Date(l.timestamp).toLocaleDateString('uz-UZ')} {new Date(l.timestamp).toLocaleTimeString('uz-UZ')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{l.userName}</span>
                    <span className="text-[10px] text-purple-700 font-bold">{l.userRole}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-800 text-[11px]">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {l.entity}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">
                    {l.details}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {l.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
