/**
 * Driver Mobile-Optimized Application Interface
 * Touch-friendly delivery workflow, GPS live tracking, electronic signature, and incident reporting
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { LeafletMap } from '../common/LeafletMap.js';
import { SignaturePad } from '../common/SignaturePad.js';
import {
  Truck,
  CheckCircle2,
  Clock,
  Navigation,
  Phone,
  AlertTriangle,
  Camera,
  RotateCcw,
  MapPin,
  ChevronRight,
  Send,
  Upload,
  Smartphone,
  Maximize2,
  Check,
  X,
  FileCheck2,
  Layers,
  ArrowRight,
  Fuel
} from 'lucide-react';
import { Order, IssueType } from '../../types/index.js';
import { PWAInstallButton } from '../common/PWAInstallButton.js';

export const DriverApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mobile frame simulator toggle for desktop
  const [mobileFrame, setMobileFrame] = useState(true);

  // Workflow Dialogs
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Delivery submission form
  const [deliveryForm, setDeliveryForm] = useState({
    deliveredBottles: 0,
    emptyBottlesCollected: 0,
    damagedBottlesReported: 0,
    discrepancyReason: '',
    signatureImage: '',
  });

  // Issue reporting form
  const [issueForm, setIssueForm] = useState({
    issueType: 'DAMAGED_BOTTLE' as IssueType,
    quantityAffected: 1,
    notes: '',
    photoUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
  });

  // Vehicle & Fuel Expense form
  const [expenseForm, setExpenseForm] = useState({
    category: 'FUEL_METAN',
    amount: 65000,
    odometerKm: 142950,
    notes: 'Metan gaz to\'ldirish',
  });

  // Driver GPS coordinates
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 41.3284,
    lng: 69.2812,
  });

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await api.addDriverExpense({
        driverId: currentUser.id,
        ...expenseForm,
      });
      if (res.success) {
        setShowExpenseModal(false);
        showFeedback('Yoqilg\'i xarajati muvaffaqiyatli saqlandi!');
      }
    } catch (e: any) {
      showFeedback(e.message || 'Xatolik', true);
    }
  };

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await api.getOrders({ role: 'DRIVER', userId: currentUser.id });
      if (res.success) {
        setOrders(res.orders);
        // Set first non-delivered order as active if none selected
        if (!activeOrder && res.orders.length > 0) {
          const inProgress = res.orders.find((o: Order) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED');
          setActiveOrder(inProgress || res.orders[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Request browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentCoords(coords);
          if (currentUser) {
            api.updateDriverLocation(currentUser.id, coords.lat, coords.lng);
          }
        },
        err => console.log('Geolocation note: using default Tashkent route coords', err)
      );
    }
  }, [currentUser]);

  // Recalculate distance to active order
  useEffect(() => {
    if (activeOrder && currentCoords) {
      const dist = calculateDistance(
        currentCoords.lat,
        currentCoords.lng,
        activeOrder.lat,
        activeOrder.lng
      );
      setDistanceKm(dist);

      // Pre-fill delivery form planned quantity
      setDeliveryForm(prev => ({
        ...prev,
        deliveredBottles: activeOrder.totalQuantity,
        emptyBottlesCollected: activeOrder.totalQuantity,
        damagedBottlesReported: 0,
        discrepancyReason: '',
        signatureImage: '',
      }));
    }
  }, [activeOrder, currentCoords]);

  // Haversine formula for distance
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Workflow Action 1: Accept Order
  const handleAcceptOrder = async () => {
    if (!activeOrder || !currentUser) return;
    try {
      const res = await api.driverAccept(activeOrder.id, currentUser.id);
      if (res.success) {
        showFeedback(`${activeOrder.orderNumber} qabul qilindi!`);
        setActiveOrder(res.order);
        loadData();
      }
    } catch (err: any) {
      showFeedback(err.message, true);
    }
  };

  // Workflow Action 2: Depart
  const handleDepart = async () => {
    if (!activeOrder || !currentUser) return;
    try {
      const res = await api.driverDepart(activeOrder.id, currentUser.id);
      if (res.success) {
        showFeedback('Yo\'lga chiqildi! Mijozga xabar berildi.');
        setActiveOrder(res.order);
        loadData();
      }
    } catch (err: any) {
      showFeedback(err.message, true);
    }
  };

  // Workflow Action 3: Arrive at destination
  const handleArrive = async () => {
    if (!activeOrder || !currentUser) return;
    try {
      const res = await api.driverArrive(activeOrder.id, currentUser.id, currentCoords.lat, currentCoords.lng);
      if (res.success) {
        showFeedback('Manzilga yetib kelindi! Topshirish oynasi ochilmoqda.');
        setActiveOrder(res.order);
        setShowDeliveryModal(true);
        loadData();
      }
    } catch (err: any) {
      showFeedback(err.message, true);
    }
  };

  // Workflow Action 4: Report Issue
  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !currentUser) return;
    try {
      const res = await api.reportIssue({
        orderId: activeOrder.id,
        driverId: currentUser.id,
        issueType: issueForm.issueType,
        quantityAffected: issueForm.quantityAffected,
        notes: issueForm.notes,
        photoUrls: [issueForm.photoUrl],
        lat: currentCoords.lat,
        lng: currentCoords.lng,
      });

      if (res.success) {
        setShowIssueModal(false);
        showFeedback('Muammo operatorga yuborildi!');
        loadData();
      }
    } catch (err: any) {
      showFeedback(err.message || 'Xatolik', true);
    }
  };

  // Workflow Action 5: Complete Delivery with Signature & Bottle Reconciliation
  const handleCompleteDeliveryWithSignature = async (sigDataUrl: string) => {
    if (!activeOrder || !currentUser) return;

    if (deliveryForm.deliveredBottles < activeOrder.totalQuantity && !deliveryForm.discrepancyReason.trim()) {
      showFeedback('Yetkazilgan miqdor kam bo\'lsa, sababi kiritilishi shart!', true);
      return;
    }

    try {
      const res = await api.completeDelivery({
        orderId: activeOrder.id,
        driverId: currentUser.id,
        deliveredBottles: deliveryForm.deliveredBottles,
        emptyBottlesCollected: deliveryForm.emptyBottlesCollected,
        damagedBottlesReported: deliveryForm.damagedBottlesReported,
        discrepancyReason: deliveryForm.discrepancyReason,
        signatureImage: sigDataUrl,
        deliveryLat: currentCoords.lat,
        deliveryLng: currentCoords.lng,
      });

      if (res.success) {
        setShowDeliveryModal(false);
        showFeedback(res.offlineQueued ? res.message : 'Buyurtma to\'liq topshirildi va elektron imzo saqlandi!');
        loadData();
        // find next pending order
        const remaining = orders.filter(o => o.id !== activeOrder.id && o.orderStatus !== 'DELIVERED');
        if (remaining.length > 0) {
          setActiveOrder(remaining[0]);
        }
      }
    } catch (err: any) {
      showFeedback(err.message || 'Xatolik', true);
    }
  };

  const completedToday = orders.filter(o => o.orderStatus === 'DELIVERED').length;
  const pendingOrders = orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED');

  return (
    <div className="space-y-4">
      {/* Toast */}
      {actionSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="fixed top-20 right-4 z-50 bg-rose-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {actionError}
        </div>
      )}

      {/* Frame Mode Switcher for Desktop */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-sky-100 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Smartphone className="w-4 h-4 text-sky-600" />
          <span>Haydovchi Mobil Ilovasi (Android & iPhone)</span>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton variant="compact" />
          <button
            type="button"
            onClick={() => setMobileFrame(!mobileFrame)}
            className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            {mobileFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            {mobileFrame ? "Keng ko'rinish" : "Mobil ramka"}
          </button>
        </div>
      </div>

      {/* Application Container (Mobile Frame or Full Responsive) */}
      <div className={mobileFrame ? 'max-w-md mx-auto bg-slate-900 p-3 rounded-[40px] shadow-2xl border-4 border-slate-700' : 'w-full'}>
        <div className={`bg-slate-50 min-h-[680px] flex flex-col justify-between ${mobileFrame ? 'rounded-[32px] overflow-hidden' : 'rounded-2xl p-4'}`}>
          {/* Mobile Top Header */}
          <div className="bg-sky-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-sky-200 uppercase font-bold tracking-wider">AquaFlow Driver</span>
                <h3 className="font-bold text-base">{currentUser?.name || 'Haydovchi'}</h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-sky-200 block">Bugun topshirildi:</span>
                <span className="text-base font-black text-white">{completedToday} ta</span>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-sky-500/60 text-center text-xs">
              <div className="bg-sky-700/60 p-2 rounded-lg">
                <span className="text-[10px] text-sky-200 block">Navbatdagi</span>
                <span className="font-bold">{pendingOrders.length} ta</span>
              </div>
              <div className="bg-sky-700/60 p-2 rounded-lg">
                <span className="text-[10px] text-sky-200 block">Jami suvlar</span>
                <span className="font-bold">
                  {pendingOrders.reduce((acc, o) => acc + o.totalQuantity, 0)} dona
                </span>
              </div>
              <div className="bg-sky-700/60 p-2 rounded-lg">
                <span className="text-[10px] text-sky-200 block">GPS</span>
                <span className="font-bold text-emerald-300">Faol</span>
              </div>
            </div>
          </div>

          {/* Active Order Details & Actions */}
          <div className="p-4 flex-1 space-y-4 overflow-y-auto">
            {activeOrder ? (
              <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-sm space-y-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {activeOrder.orderNumber}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1">{activeOrder.customerName}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {activeOrder.orderStatus}
                  </span>
                </div>

                {/* Delivery items badge */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-xs">
                  <div className="p-2 rounded-lg bg-sky-600 text-white font-bold">
                    {activeOrder.totalQuantity}x
                  </div>
                  <div>
                    <div className="font-bold text-sky-950">
                      {activeOrder.items[0]?.productName || '18.9L Suv'}
                    </div>
                    <div className="text-[11px] text-sky-700">
                      To'lov: {activeOrder.paymentMethod} • {activeOrder.paymentStatus}
                    </div>
                  </div>
                </div>

                {/* Address & Navigation */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{activeOrder.deliveryAddress}</span>
                  </div>

                  {activeOrder.customerNote && (
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-800 text-[11px] italic">
                      Izoh: "{activeOrder.customerNote}"
                    </div>
                  )}

                  {distanceKm !== null && (
                    <div className="text-[11px] font-semibold text-slate-500">
                      📍 Masofa: taxminan <span className="text-sky-700 font-bold">{distanceKm} km</span>
                    </div>
                  )}
                </div>

                {/* Interactive Leaflet Map for Order */}
                <LeafletMap
                  markers={[
                    {
                      id: 'driver_pin',
                      lat: currentCoords.lat,
                      lng: currentCoords.lng,
                      title: 'Sizning joylashuvingiz',
                      type: 'DRIVER',
                    },
                    {
                      id: activeOrder.id,
                      lat: activeOrder.lat,
                      lng: activeOrder.lng,
                      title: activeOrder.customerName,
                      type: 'DESTINATION',
                      details: activeOrder.deliveryAddress,
                    }
                  ]}
                  center={[activeOrder.lat, activeOrder.lng]}
                  zoom={13}
                  height="160px"
                />

                {/* Direct Call Button */}
                <a
                  href={`tel:${activeOrder.customerPhone}`}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Mijozga qo'ng'iroq qilish ({activeOrder.customerPhone})
                </a>

                {/* Big Action Workflow Buttons */}
                <div className="space-y-2 pt-2">
                  {activeOrder.orderStatus === 'ASSIGNED' && (
                    <button
                      type="button"
                      onClick={handleAcceptOrder}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Buyurtmani qabul qilish
                    </button>
                  )}

                  {activeOrder.orderStatus === 'ACCEPTED' && (
                    <button
                      type="button"
                      onClick={handleDepart}
                      className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Navigation className="w-5 h-5" />
                      Yo'lga chiqish
                    </button>
                  )}

                  {activeOrder.orderStatus === 'ON_THE_WAY' && (
                    <button
                      type="button"
                      onClick={handleArrive}
                      className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-5 h-5" />
                      Manzilga yetib keldim
                    </button>
                  )}

                  {(activeOrder.orderStatus === 'ARRIVED' || activeOrder.orderStatus === 'ON_THE_WAY' || activeOrder.orderStatus === 'ACCEPTED') && (
                    <button
                      type="button"
                      onClick={() => setShowDeliveryModal(true)}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileCheck2 className="w-5 h-5" />
                      Suvlarni topshirish (Imzo olish)
                    </button>
                  )}

                  {/* Driver Fast Tools: Fuel Expense & Issue Reporting */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowExpenseModal(true)}
                      className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Fuel className="w-4 h-4 text-amber-600" />
                      Yoqilg'i / Xarajat
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowIssueModal(true)}
                      className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Muammo bildirish
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800">Hozirda biriktirilgan buyurtma yo'q</h4>
                <p className="text-xs text-slate-500 mt-1">Yangi buyurtmalar tushganda operator biriktiradi</p>
              </div>
            )}

            {/* List of Other Assigned Orders */}
            {orders.length > 1 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Barcha biriktirilgan buyurtmalar ({orders.length})
                </span>
                {orders.map(o => (
                  <div
                    key={o.id}
                    onClick={() => setActiveOrder(o)}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      activeOrder?.id === o.id
                        ? 'bg-sky-50 border-sky-300 font-semibold'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-slate-900 font-bold">{o.orderNumber} - {o.customerName}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-[200px]">{o.deliveryAddress}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sky-700">{o.totalQuantity} ta</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 inline ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Suvlarni topshirish & Elektron Imzo */}
      {showDeliveryModal && activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sky-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Suvni Topshirish Jarayoni</h3>
                <span className="font-mono text-xs text-sky-700">{activeOrder.orderNumber} • {activeOrder.customerName}</span>
              </div>
              <button onClick={() => setShowDeliveryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Quantities checklist */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Buyurtma qilingan:
                  </label>
                  <span className="font-bold text-slate-900 text-sm">{activeOrder.totalQuantity} dona suv</span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Haqiqatda topshirildi:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={activeOrder.totalQuantity}
                    value={deliveryForm.deliveredBottles}
                    onChange={e => setDeliveryForm({ ...deliveryForm, deliveredBottles: Number(e.target.value) })}
                    className="w-full font-bold text-slate-900 p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              {/* If partial delivery discrepancy */}
              {deliveryForm.deliveredBottles < activeOrder.totalQuantity && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900 block">
                    Diqqat: Topshirilgan miqdor buyurtmadan kam ({deliveryForm.deliveredBottles}/{activeOrder.totalQuantity})
                  </span>
                  <label className="block text-[11px] text-amber-800">Farq sababini yozing (majburiy):</label>
                  <input
                    type="text"
                    placeholder="Mijoz 2 ta olmadi / idish sig'madi..."
                    value={deliveryForm.discrepancyReason}
                    onChange={e => setDeliveryForm({ ...deliveryForm, discrepancyReason: e.target.value })}
                    className="w-full p-2 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              )}

              {/* Empty & Damaged Containers Return Counters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200">
                  <label className="block text-[11px] font-semibold text-cyan-900 mb-1">
                    Qaytarilgan bo'sh idishlar:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={deliveryForm.emptyBottlesCollected}
                    onChange={e => setDeliveryForm({ ...deliveryForm, emptyBottlesCollected: Number(e.target.value) })}
                    className="w-full font-bold text-slate-900 p-2 bg-white border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                  <label className="block text-[11px] font-semibold text-rose-900 mb-1">
                    Shikastlangan idishlar:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={deliveryForm.damagedBottlesReported}
                    onChange={e => setDeliveryForm({ ...deliveryForm, damagedBottlesReported: Number(e.target.value) })}
                    className="w-full font-bold text-slate-900 p-2 bg-white border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Electronic Signature Pad */}
              <div>
                <span className="font-bold text-slate-900 block mb-1">Mijoz Elektron Imzosi (E-Imzo):</span>
                <p className="text-[11px] text-slate-500 mb-2">
                  Mijoz suvlarni va bo'sh idishlar sonini tasdiqlab ekranga imzo chekishi shart.
                </p>

                <SignaturePad
                  title={`${activeOrder.customerName} imzosi`}
                  onSave={sig => handleCompleteDeliveryWithSignature(sig)}
                  onCancel={() => setShowDeliveryModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Muammo haqida xabar berish */}
      {showIssueModal && activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">Muammo Haqida Xabar Berish</h3>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportIssue} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Muammo turi</label>
                <select
                  value={issueForm.issueType}
                  onChange={e => setIssueForm({ ...issueForm, issueType: e.target.value as IssueType })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                >
                  <option value="DAMAGED_BOTTLE">Idish shikastlangan / yorilgan</option>
                  <option value="SHORTAGE">Idish / suv yetishmaydi</option>
                  <option value="WATER_QUALITY">Suv sifati bilan bog'liq e'tiroz</option>
                  <option value="WRONG_ADDRESS">Mijoz manzili noto'g'ri</option>
                  <option value="CUSTOMER_NOT_FOUND">Mijoz topilmadi / telefon olmadi</option>
                  <option value="CUSTOMER_REJECTED">Mijoz buyurtmani qabul qilmadi</option>
                  <option value="PAYMENT_ISSUE">To'lov bilan muammo</option>
                  <option value="VEHICLE_BREAKDOWN">Transport buzildi / tirbandlik</option>
                  <option value="OTHER">Boshqa muammo</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ta'sirlangan idishlar miqdori</label>
                <input
                  type="number"
                  min="0"
                  value={issueForm.quantityAffected}
                  onChange={e => setIssueForm({ ...issueForm, quantityAffected: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batafsil izoh</label>
                <textarea
                  rows={2}
                  placeholder="Ikkita bo'sh idishning yuqori qismi yorilgan..."
                  value={issueForm.notes}
                  onChange={e => setIssueForm({ ...issueForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Surat biriktirish (Kamera / Galereya)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Demo snapshot switcher
                      setIssueForm({
                        ...issueForm,
                        photoUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
                      });
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1 font-medium text-slate-700"
                  >
                    <Camera className="w-4 h-4 text-sky-600" />
                    Kamera bilan olish
                  </button>
                </div>
                {issueForm.photoUrl && (
                  <img
                    src={issueForm.photoUrl}
                    alt="Biriktirilgan rasm"
                    className="w-full h-28 object-cover rounded-lg border border-slate-200 mt-2"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Operatorga yuborish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Yoqilg'i va Xarajat qayd etish */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Yoqilg'i / Xarajat Qayd Etish</h3>
              </div>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Xarajat toifasi</label>
                <select
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="FUEL_METAN">Metan gaz (AGNKS)</option>
                  <option value="FUEL_BENZIN">Benzin / Yoqilg'i</option>
                  <option value="CAR_WASH">Avtoyuvish va tozalash</option>
                  <option value="TIRE_REPAIR">Shina ta'mirlash / Balansirovka</option>
                  <option value="OTHER">Boshqa xarajat</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Summa (so'm)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Spidometr / Odometer (km)</label>
                <input
                  type="number"
                  value={expenseForm.odometerKm}
                  onChange={e => setExpenseForm({ ...expenseForm, odometerKm: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Izoh / Chek raqami</label>
                <input
                  type="text"
                  placeholder="Chig'atoy AGNKS 24 kub..."
                  value={expenseForm.notes}
                  onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
                >
                  Xarajatni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
