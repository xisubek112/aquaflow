/**
 * Staff & Fleet Management (Xodimlar: Haydovchilar & Operatorlar Boshqaruvi)
 * Full support for adding new drivers and new operators with passwords, vehicle profiles, shifts, and GPS
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { LeafletMap } from '../common/LeafletMap.js';
import {
  Truck,
  Headphones,
  Plus,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Star,
  ShieldAlert,
  Search,
  RefreshCw,
  X,
  Clock,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const DriversManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'DRIVERS' | 'OPERATORS'>('DRIVERS');

  // Drivers state
  const [drivers, setDrivers] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');

  // Operators state
  const [operators, setOperators] = useState<any[]>([]);
  const [showAddOperatorModal, setShowAddOperatorModal] = useState(false);
  const [operatorSearch, setOperatorSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  // Add Driver Form
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '+998 ',
    email: '',
    password: '',
    vehicleModel: 'Isuzu Labo Suv Tashiydigan',
    vehiclePlate: '',
  });

  // Add Operator Form
  const [operatorForm, setOperatorForm] = useState({
    name: '',
    phone: '+998 ',
    email: '',
    password: '',
    shift: 'DAY' as 'DAY' | 'NIGHT' | 'ALL_DAY',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [drvRes, issRes, oprRes] = await Promise.all([
        api.getDrivers(),
        api.getIssues(),
        api.getOperators(),
      ]);
      if (drvRes.success) setDrivers(drvRes.drivers);
      if (issRes.success) setIssues(issRes.issues);
      if (oprRes.success) setOperators(oprRes.operators);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Driver Status Toggle
  const handleToggleDriverStatus = async (driverId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await api.toggleDriverStatus(driverId, nextStatus);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    }
  };

  // Operator Status Toggle
  const handleToggleOperatorStatus = async (operatorId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await api.toggleOperatorStatus(operatorId, nextStatus);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    }
  };

  // Submit Add Driver
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addDriver({
        ...driverForm,
        adminId: currentUser?.id,
      });
      setShowAddDriverModal(false);
      setDriverForm({
        name: '',
        phone: '+998 ',
        email: '',
        password: '',
        vehicleModel: 'Isuzu Labo Suv Tashiydigan',
        vehiclePlate: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    }
  };

  // Submit Add Operator
  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addOperator({
        ...operatorForm,
        adminId: currentUser?.id,
      });
      setShowAddOperatorModal(false);
      setOperatorForm({
        name: '',
        phone: '+998 ',
        email: '',
        password: '',
        shift: 'DAY',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    }
  };

  // Filtered lists
  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
    d.phone.includes(driverSearch) ||
    d.profile?.vehiclePlate.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const filteredOperators = operators.filter(o =>
    o.name.toLowerCase().includes(operatorSearch.toLowerCase()) ||
    o.phone.includes(operatorSearch) ||
    o.email.toLowerCase().includes(operatorSearch.toLowerCase())
  );

  // Markers for Drivers GPS Map
  const mapMarkers = drivers.map(d => ({
    id: d.id,
    lat: d.profile?.currentLat || 41.311081,
    lng: d.profile?.currentLng || 69.240562,
    title: d.name,
    type: 'DRIVER' as const,
    details: `${d.profile?.vehicleModel || 'Avtomobil'} (${d.profile?.vehiclePlate}) • Tel: ${d.phone}`,
    status: d.profile?.status === 'ON_ROUTE' ? 'Yo\'lda' : 'Bo\'sh',
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner & Section Selector */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-sky-600" />
            <h2 className="text-xl font-bold text-slate-900">Xodimlar Boshqaruvi (Haydovchi va Operatorlar)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Yangi haydovchi yoki operator qo'shish, parollarini belgilash, navbatchilik va statuslarni nazorat qilish
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSection('DRIVERS')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'DRIVERS'
                ? 'bg-white text-sky-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Haydovchilar ({drivers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('OPERATORS')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'OPERATORS'
                ? 'bg-white text-sky-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Headphones className="w-4 h-4 text-blue-600" />
            <span>Operatorlar ({operators.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: DRIVERS MANAGEMENT */}
      {/* ======================================================== */}
      {activeSection === 'DRIVERS' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-sky-100 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Haydovchi ismi, raqami yoki avtomobili..."
                value={driverSearch}
                onChange={e => setDriverSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAddDriverModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Haydovchi Qo'shish</span>
            </button>
          </div>

          {/* Real-time Drivers GPS Map */}
          <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-slate-900 text-sm">Haydovchilarning Jonli GPS Joylashuvi</span>
              </div>
              <span className="text-xs text-slate-500">Toshkent shahar xaritasi</span>
            </div>
            <LeafletMap markers={mapMarkers} height="300px" zoom={12} />
          </div>

          {/* Drivers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map(driver => {
              const profile = driver.profile;
              const isBlocked = driver.status === 'BLOCKED';
              const driverIssues = issues.filter(i => i.driverId === driver.id);

              return (
                <div
                  key={driver.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                    isBlocked ? 'border-rose-200 bg-rose-50/20' : 'border-sky-100 hover:border-sky-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base border border-emerald-200">
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{driver.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                            <Phone className="w-3 h-3 text-sky-600" />
                            <span>{driver.phone}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isBlocked
                            ? 'bg-rose-100 text-rose-700 border-rose-300'
                            : profile?.status === 'ON_ROUTE'
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {isBlocked ? 'Bloklangan' : profile?.status === 'ON_ROUTE' ? 'Yo\'lda' : 'Bo\'sh'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Avtomobil:</span>
                        <span className="font-semibold text-slate-800">{profile?.vehicleModel || 'Labo'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Davlat raqami:</span>
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {profile?.vehiclePlate || '01 A 000 AA'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Login email:</span>
                        <span className="font-mono text-[11px] text-slate-700">{driver.email}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Bugun yetkazdi:</span>
                        <span className="font-bold text-emerald-700">{profile?.dailyDeliveredCount || 0} ta buyurtma</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Mijozlar bahosi:</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{profile?.rating || '5.0'}</span>
                        </div>
                      </div>
                    </div>

                    {driverIssues.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{driverIssues.length} ta shikastlangan idish yoki muammo qayd etilgan</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggleDriverStatus(driver.id, driver.status)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                        isBlocked
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {isBlocked ? 'Hisobni Faollashtirish' : 'Vaqtincha Bloklash'}
                    </button>
                    <a
                      href={`tel:${driver.phone}`}
                      className="p-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
                      title="Qo'ng'iroq qilish"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: OPERATORS MANAGEMENT */}
      {/* ======================================================== */}
      {activeSection === 'OPERATORS' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-sky-100 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Operator ismi, telefoni yoki emaili..."
                value={operatorSearch}
                onChange={e => setOperatorSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAddOperatorModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Operator Qo'shish</span>
            </button>
          </div>

          {/* Operators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOperators.map(operator => {
              const profile = operator.profile;
              const isBlocked = operator.status === 'BLOCKED';

              const getShiftLabel = (shift: string) => {
                switch (shift) {
                  case 'NIGHT': return 'Tungi smena (18:00 - 08:00)';
                  case 'ALL_DAY': return 'To\'liq kun (24 soat)';
                  default: return 'Kunduzgi smena (08:00 - 18:00)';
                }
              };

              return (
                <div
                  key={operator.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                    isBlocked ? 'border-rose-200 bg-rose-50/20' : 'border-sky-100 hover:border-sky-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-base border border-blue-200">
                          {operator.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{operator.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                            <Phone className="w-3 h-3 text-sky-600" />
                            <span>{operator.phone}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isBlocked
                            ? 'bg-rose-100 text-rose-700 border-rose-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {isBlocked ? 'Bloklangan' : 'Faol Operator'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email / Login:</span>
                        <span className="font-mono text-slate-800">{operator.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Ish smenasi:</span>
                        <span className="font-medium text-slate-800">{getShiftLabel(profile?.shift)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Boshqargan buyurtmalari:</span>
                        <span className="font-bold text-blue-700">{profile?.activeOrdersManaged || 0} ta</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Ruxsat darajasi:</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          To'liq Dispatcher
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggleOperatorStatus(operator.id, operator.status)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                        isBlocked
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {isBlocked ? 'Hisobni Faollashtirish' : 'Vaqtincha Bloklash'}
                    </button>
                    <a
                      href={`tel:${operator.phone}`}
                      className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                      title="Qo'ng'iroq qilish"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW DRIVER */}
      {/* ======================================================== */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Yangi Haydovchi Qo'shish</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDriverModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Haydovchi F.I.Sh</label>
                <input
                  type="text"
                  placeholder="Masalan: Dilshod Ergashev"
                  value={driverForm.name}
                  onChange={e => setDriverForm({ ...driverForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefon raqami (Login sifatida ishlatiladi)</label>
                <input
                  type="text"
                  placeholder="+998 90 123 45 67"
                  value={driverForm.phone}
                  onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (Ixtiyoriy)</label>
                  <input
                    type="email"
                    placeholder="driver@aquaflow.uz"
                    value={driverForm.email}
                    onChange={e => setDriverForm({ ...driverForm, email: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tizimga kirish paroli</label>
                  <input
                    type="text"
                    placeholder="Standart: driver123"
                    value={driverForm.password}
                    onChange={e => setDriverForm({ ...driverForm, password: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Avtomobil modeli</label>
                  <input
                    type="text"
                    placeholder="Isuzu Labo"
                    value={driverForm.vehicleModel}
                    onChange={e => setDriverForm({ ...driverForm, vehicleModel: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Davlat raqami</label>
                  <input
                    type="text"
                    placeholder="01 A 777 BA"
                    value={driverForm.vehiclePlate}
                    onChange={e => setDriverForm({ ...driverForm, vehiclePlate: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDriverModal(false)}
                  className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Haydovchini Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD NEW OPERATOR */}
      {/* ======================================================== */}
      {showAddOperatorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sky-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Yangi Operator Qo'shish</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOperatorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOperator} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operator F.I.Sh</label>
                <input
                  type="text"
                  placeholder="Masalan: Nilufar Karimova"
                  value={operatorForm.name}
                  onChange={e => setOperatorForm({ ...operatorForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefon raqami (Login sifatida ishlatiladi)</label>
                <input
                  type="text"
                  placeholder="+998 90 987 65 43"
                  value={operatorForm.phone}
                  onChange={e => setOperatorForm({ ...operatorForm, phone: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (Ixtiyoriy)</label>
                  <input
                    type="email"
                    placeholder="operator@aquaflow.uz"
                    value={operatorForm.email}
                    onChange={e => setOperatorForm({ ...operatorForm, email: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tizimga kirish paroli</label>
                  <input
                    type="text"
                    placeholder="Standart: operator123"
                    value={operatorForm.password}
                    onChange={e => setOperatorForm({ ...operatorForm, password: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ish Smenasi</label>
                <select
                  value={operatorForm.shift}
                  onChange={e => setOperatorForm({ ...operatorForm, shift: e.target.value as any })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="DAY">Kunduzgi smena (08:00 - 18:00)</option>
                  <option value="NIGHT">Tungi smena (18:00 - 08:00)</option>
                  <option value="ALL_DAY">To'liq kunlik navbatchilik (24 soat)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddOperatorModal(false)}
                  className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Operatorni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
