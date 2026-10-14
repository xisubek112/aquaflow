/**
 * Customers Management (Mijozlar Boshqaruvi)
 * Customer records, container balance debt, financial status, addresses, and order history
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  Users,
  Plus,
  Phone,
  MapPin,
  RotateCcw,
  DollarSign,
  Archive,
  ArchiveRestore,
  Search,
  ExternalLink,
  History,
  X
} from 'lucide-react';

export const CustomersManagement: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomerLedger, setSelectedCustomerLedger] = useState<any[] | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '+998 ',
    companyName: '',
    addressLine: '',
    district: 'Yunusobod',
    notes: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCustomers();
      if (res.success) setCustomers(res.customers);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleArchive = async (customerId: string) => {
    try {
      await api.toggleCustomerArchive(customerId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addCustomer(form);
      setShowAddModal(false);
      setForm({
        name: '',
        phone: '+998 ',
        companyName: '',
        addressLine: '',
        district: 'Yunusobod',
        notes: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    }
  };

  const viewLedger = async (customerId: string, customerName: string) => {
    setSelectedCustomerName(customerName);
    try {
      const res = await api.getCustomerLedger(customerId);
      if (res.success) {
        setSelectedCustomerLedger(res.ledger);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.profile?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Mijozlar va Idishlar Balansi</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Barcha mijozlar, bo'sh idish qarzdorligi, manzillar va buyurtma tarixi
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-sm shadow-sky-200 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi mijoz qo'shish
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Ism, kompaniya yoki telefon bo'yicha izlash..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Mijoz / Tashkilot</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Manzil</th>
                <th className="py-3 px-4 text-center">Bo'sh idish qarzdorligi</th>
                <th className="py-3 px-4 text-center">Moliyaviy balans</th>
                <th className="py-3 px-4 text-center">Jami buyurtmalar</th>
                <th className="py-3 px-4 text-center">Holat</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(customer => {
                const isArchived = customer.profile?.isArchived;
                const defaultAddr = customer.addresses?.find((a: any) => a.isDefault) || customer.addresses?.[0];
                const bottlesBalance = customer.profile?.emptyBottlesBalance || 0;

                return (
                  <tr key={customer.id} className={`hover:bg-sky-50/40 transition-colors ${isArchived ? 'opacity-50 bg-slate-50' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{customer.name}</div>
                      {customer.profile?.companyName && (
                        <div className="text-[11px] text-sky-700 font-medium">{customer.profile.companyName}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {customer.phone}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      {defaultAddr ? (
                        <span title={defaultAddr.addressLine}>
                          {defaultAddr.district ? `${defaultAddr.district}, ` : ''}{defaultAddr.addressLine}
                        </span>
                      ) : (
                        <span className="text-slate-400">Kiritilmagan</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1 border ${
                        bottlesBalance > 0
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <RotateCcw className="w-3 h-3" />
                        {bottlesBalance} dona
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      {customer.profile?.financialBalance !== undefined && customer.profile.financialBalance < 0 ? (
                        <span className="font-bold text-rose-600">{formatUZS(customer.profile.financialBalance)}</span>
                      ) : (
                        <span className="text-slate-700">{formatUZS(customer.profile?.financialBalance || 0)}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {customer.ordersCount || 0} ta
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isArchived ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isArchived ? 'Arxivlangan' : 'Faol'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => viewLedger(customer.id, customer.name)}
                          className="px-2.5 py-1 text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          title="Idishlar harakati tarixi"
                        >
                          <History className="w-3.5 h-3.5 inline mr-1" />
                          Tarix
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleArchive(customer.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title={isArchived ? 'Arxivdan chiqarish' : 'Arxivlash'}
                        >
                          {isArchived ? <ArchiveRestore className="w-4 h-4 text-emerald-600" /> : <Archive className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Container Ledger Modal */}
      {selectedCustomerLedger && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedCustomerName}</h3>
                <p className="text-xs text-slate-500">Bo'sh idishlar balansi va topshirish/qaytarish tarixi</p>
              </div>
              <button onClick={() => setSelectedCustomerLedger(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {selectedCustomerLedger.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Hozircha idishlar harakati mavjud emas</p>
              ) : (
                selectedCustomerLedger.map(entry => (
                  <div key={entry.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        entry.transactionType === 'RETURNED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {entry.transactionType === 'RETURNED' ? 'Bo\'sh idish qaytarildi (-)' : 'Suv bilan berildi (+)'}
                      </span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {new Date(entry.timestamp).toLocaleDateString('uz-UZ')} {new Date(entry.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs mt-1">{entry.notes}</p>
                    <div className="text-right text-[11px] font-bold text-slate-900 mt-1">
                      Qoldiq idishlar: {entry.balanceAfter} dona
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Yangi Mijoz Qo'shish</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mijoz Ismi / Mas'ul shaxs</label>
                <input
                  type="text"
                  placeholder="Ali Valiyev"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kompaniya / Korxona nomi (ixtiyoriy)</label>
                <input
                  type="text"
                  placeholder="Artel / IT Park / Xususiy"
                  value={form.companyName}
                  onChange={e => setForm({ ...form, companyName: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon raqami</label>
                <input
                  type="text"
                  placeholder="+998 90 123 45 67"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tuman</label>
                  <select
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Yunusobod">Yunusobod</option>
                    <option value="Mirzo Ulug'bek">Mirzo Ulug'bek</option>
                    <option value="Chilonzor">Chilonzor</option>
                    <option value="Yashnobod">Yashnobod</option>
                    <option value="Shayxontohur">Shayxontohur</option>
                    <option value="Yakkasaroy">Yakkasaroy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manzil tavsifi</label>
                  <input
                    type="text"
                    placeholder="12-mavze, 4-uy"
                    value={form.addressLine}
                    onChange={e => setForm({ ...form, addressLine: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qo'shimcha izoh / Domofon</label>
                <input
                  type="text"
                  placeholder="3-qavat, lift bor"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
