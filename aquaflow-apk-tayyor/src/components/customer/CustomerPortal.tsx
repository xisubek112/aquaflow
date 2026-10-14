/**
 * Customer Cabinet (Mijoz Kabineti)
 * Online water ordering, map pin-drop address picker, real-time tracking stepper, and bottle balance
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { LeafletMap } from '../common/LeafletMap.js';
import {
  Droplets,
  ShoppingBag,
  Plus,
  Minus,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  Truck,
  RotateCcw,
  Repeat,
  ArrowRight,
  ShieldCheck,
  Check,
  Package,
  Calendar,
  Sparkles,
  Send,
  Award,
  Activity,
  FileText
} from 'lucide-react';
import { Product, Order, PaymentMethod } from '../../types/index.js';
import { PWAInstallButton } from '../common/PWAInstallButton.js';

export const CustomerPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active view: 'ORDER' | 'HISTORY' | 'BALANCE' | 'QUALITY' | 'TELEGRAM'
  const [activeTab, setActiveTab] = useState<'ORDER' | 'HISTORY' | 'BALANCE' | 'QUALITY' | 'TELEGRAM'>('ORDER');

  // Cart / Order builder
  const [selectedProductId, setSelectedProductId] = useState<string>('prd_19l');
  const [quantity, setQuantity] = useState<number>(3);
  const [addressLine, setAddressLine] = useState<string>('Yunusobod tumani, 11-mavze, 24-uy, 42-xonadon');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 41.3653, lng: 69.2885 });
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>('Bugun (14:00 - 16:00)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CLICK');
  const [customerNote, setCustomerNote] = useState<string>('Domofon 42, 4-qavat');

  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState<Order | null>(null);

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        api.getProducts(),
        api.getOrders({ role: 'CUSTOMER', userId: currentUser.id }),
      ]);
      if (pRes.success) setProducts(pRes.products);
      if (oRes.success) setOrders(oRes.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedProduct) return;

    try {
      const res = await api.createOrder({
        customerId: currentUser.id,
        items: [{ productId: selectedProduct.id, quantity }],
        deliveryAddress: addressLine,
        lat: coords.lat,
        lng: coords.lng,
        deliveryTimeSlot,
        paymentMethod,
        customerNote,
      });

      if (res.success) {
        setOrderCreatedSuccess(res.order);
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  // Re-order in 1-click
  const handleReorder = async (prevOrder: Order) => {
    if (!currentUser) return;
    try {
      const res = await api.createOrder({
        customerId: currentUser.id,
        items: prevOrder.items.map(it => ({ productId: it.productId, quantity: it.quantity })),
        deliveryAddress: prevOrder.deliveryAddress,
        lat: prevOrder.lat,
        lng: prevOrder.lng,
        deliveryTimeSlot: 'Eng yaqin vaqtda',
        paymentMethod: prevOrder.paymentMethod,
        customerNote: prevOrder.customerNote,
      });

      if (res.success) {
        setOrderCreatedSuccess(res.order);
        setActiveTab('ORDER');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    }
  };

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'ASSIGNED':
      case 'ACCEPTED': return 3;
      case 'ON_THE_WAY': return 4;
      case 'ARRIVED': return 5;
      case 'DELIVERED':
      case 'PARTIALLY_DELIVERED': return 6;
      default: return 1;
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-sky-700 text-white rounded-2xl p-6 shadow-md shadow-sky-600/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-sky-200 font-bold block">AquaFlow Mijoz Kabineti</span>
          <h2 className="text-xl font-bold mt-0.5">Xush kelibsiz, {currentUser?.name}!</h2>
          <p className="text-xs text-sky-100 mt-1">
            Tabiiy zilol tog' suvi buyurtma qilish va yetkazib berilishini real vaqtda kuzatish
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 bg-white/20 backdrop-blur-md p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('ORDER'); setOrderCreatedSuccess(null); }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ORDER' ? 'bg-white text-sky-900 shadow-sm' : 'hover:bg-white/10 text-white'
            }`}
          >
            Suv buyurtma qilish
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'HISTORY' ? 'bg-white text-sky-900 shadow-sm' : 'hover:bg-white/10 text-white'
            }`}
          >
            Buyurtmalarim ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('BALANCE')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'BALANCE' ? 'bg-white text-sky-900 shadow-sm' : 'hover:bg-white/10 text-white'
            }`}
          >
            Bo'sh idishlar hisobi
          </button>
          <button
            onClick={() => setActiveTab('QUALITY')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'QUALITY' ? 'bg-white text-sky-900 shadow-sm' : 'hover:bg-white/10 text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Suv Sifati Pasporti</span>
          </button>
          <button
            onClick={() => setActiveTab('TELEGRAM')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TELEGRAM' ? 'bg-white text-sky-900 shadow-sm' : 'hover:bg-white/10 text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-300" />
            <span>Telegram Bot</span>
          </button>
        </div>
      </div>

      {/* Android APK & Mobil Ilova Banneri */}
      <PWAInstallButton variant="banner" />

      {/* Tab 1: Order Placing */}
      {activeTab === 'ORDER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {orderCreatedSuccess ? (
            /* Order Success Receipt Banner */
            <div className="lg:col-span-3 bg-white rounded-2xl border border-emerald-200 p-8 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                  Buyurtma Muvaffaqiyatli Qabul Qilindi!
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {orderCreatedSuccess.orderNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Operator buyurtmani tasdiqlashi bilan ombordan zaxira band qilinadi va haydovchi biriktiriladi.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mahsulot:</span>
                  <span className="font-bold text-slate-800">{orderCreatedSuccess.totalQuantity} dona suv</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Yetkazish manzili:</span>
                  <span className="font-medium text-slate-800">{orderCreatedSuccess.deliveryAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">To'lov usuli:</span>
                  <span className="font-bold text-sky-700">{orderCreatedSuccess.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
                  <span>Jami to'lov:</span>
                  <span>{formatUZS(orderCreatedSuccess.totalAmount)}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('HISTORY')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  Buyurtmani kuzatish
                </button>
                <button
                  type="button"
                  onClick={() => setOrderCreatedSuccess(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Yana buyurtma berish
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Product Select & Quantity */}
              <div className="lg:col-span-2 space-y-6">
                {/* 👵 Katta Yordamchi & Tezkor 1-Bosishli Buyurtma */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-amber-900 font-extrabold text-sm flex items-center gap-1.5">
                        ⚡ Tezkor & Oson Suv Buyurtmasi
                      </span>
                      <p className="text-xs text-amber-900/80 mt-0.5">
                        Katta yoshdagilar va tezkor buyurtma berishni istaganlar uchun qulay 1-bosishli tugmalar:
                      </p>
                    </div>
                    <a
                      href="tel:+998712000011"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-200/90 px-3 py-1.5 rounded-xl hover:bg-amber-300 w-fit"
                    >
                      📞 +998 71 200-00-11
                    </a>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { qty: 1, label: '1 ta Suv', price: '20,000 so\'m', rec: false },
                      { qty: 2, label: '2 ta Suv', price: '40,000 so\'m', rec: false },
                      { qty: 3, label: '3 ta Suv', price: '60,000 so\'m', rec: true },
                      { qty: 5, label: '5 ta Suv', price: '100,000 so\'m', rec: false },
                    ].map(item => (
                      <button
                        key={item.qty}
                        type="button"
                        onClick={() => {
                          setSelectedProductId('prd_19l');
                          setQuantity(item.qty);
                        }}
                        className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          quantity === item.qty && selectedProductId === 'prd_19l'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                            : 'border-amber-200 bg-white text-slate-800 hover:border-amber-400'
                        }`}
                      >
                        <div className="text-xl">💧</div>
                        <div className="font-extrabold text-sm">{item.label}</div>
                        <div className="text-xs text-slate-500 font-semibold">{item.price}</div>
                        {item.rec && (
                          <span className="text-[10px] text-emerald-700 font-bold uppercase mt-1 block">Tavsiya</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">1. Suv mahsulotini tanlang</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map(p => {
                      const isSelected = p.id === selectedProductId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProductId(p.id)}
                          className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer flex gap-3 ${
                            isSelected
                              ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-2 ring-sky-500/20'
                              : 'border-slate-200 hover:border-sky-200 bg-white'
                          }`}
                        >
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                          />
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.description}</p>
                            </div>
                            <div className="font-mono font-bold text-sky-800 text-xs mt-1">
                              {formatUZS(p.unitPrice)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quantity Counter */}
                  <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">Buyurtma miqdori:</span>
                      <span className="text-[11px] text-slate-500">Kamida 1 dona, o'rtacha xonadon uchun 2-4 dona</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-lg text-slate-900 w-8 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold hover:bg-sky-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delivery Address & Map Picker */}
                <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">2. Yetkazib berish manzili va Xarita</h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Aniq manzil, uy va xonadon
                    </label>
                    <input
                      type="text"
                      value={addressLine}
                      onChange={e => setAddressLine(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="Yunusobod tumani, 11-mavze, 24-uy, 42-xonadon"
                      required
                    />
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-1">
                      Xaritadan nuqtani belgilash (Geolokatsiya):
                    </span>
                    <LeafletMap
                      center={[coords.lat, coords.lng]}
                      markers={[
                        {
                          id: 'customer_selected',
                          lat: coords.lat,
                          lng: coords.lng,
                          title: 'Yetkazish manzili',
                          type: 'DESTINATION',
                        }
                      ]}
                      allowSelectLocation={true}
                      onLocationSelect={(lat, lng) => setCoords({ lat, lng })}
                      height="200px"
                      zoom={14}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kuryer / Haydovchi uchun izoh (Domofon, qavat)
                    </label>
                    <input
                      type="text"
                      value={customerNote}
                      onChange={e => setCustomerNote(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="Domofon 42, 4-qavat, lift bor"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary & Confirm Checkout */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">3. Yetkazish va To'lov</h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Yetkazish vaqti</label>
                    <select
                      value={deliveryTimeSlot}
                      onChange={e => setDeliveryTimeSlot(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="Bugun (10:00 - 12:00)">Bugun (10:00 - 12:00)</option>
                      <option value="Bugun (14:00 - 16:00)">Bugun (14:00 - 16:00)</option>
                      <option value="Bugun (17:00 - 19:00)">Bugun (17:00 - 19:00)</option>
                      <option value="Ertaga ertalab (09:00 - 12:00)">Ertaga ertalab (09:00 - 12:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">To'lov turi</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(['CLICK', 'PAYME', 'CASH', 'BANK_TRANSFER'] as PaymentMethod[]).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                            paymentMethod === m
                              ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {m === 'CASH' ? 'Naqd pul' : m === 'BANK_TRANSFER' ? 'O\'tkazma' : m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Birlik narxi:</span>
                      <span className="font-mono">{formatUZS(selectedProduct?.unitPrice || 20000)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Miqdor:</span>
                      <span className="font-bold">{quantity} dona</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Yetkazib berish:</span>
                      <span className="text-emerald-600 font-bold">Bepul (0 so'm)</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Jami to'lov:</span>
                      <span className="text-sky-700 font-mono">
                        {formatUZS((selectedProduct?.unitPrice || 20000) * quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Buyurtma berish
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Orders Tracking & History */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-1">Buyurtmalar Tarixi va Jonli Kuzatish</h3>
            <p className="text-xs text-slate-500 mb-4">
              Buyurtmangiz bosqichlari, haydovchi joylashuvi va yetkazib berish holati
            </p>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">Sizda hali buyurtmalar yo'q</p>
              ) : (
                orders.map(order => {
                  const step = getStepIndex(order.orderStatus);

                  return (
                    <div key={order.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                        <div>
                          <span className="font-mono text-xs font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            {new Date(order.createdAt).toLocaleDateString('uz-UZ')} {new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            Qayta buyurtma berish
                          </button>
                        </div>
                      </div>

                      {/* Live Tracking Stepper */}
                      <div className="py-2">
                        <div className="grid grid-cols-6 gap-1 text-center">
                          {[
                            { name: 'Qabul qilindi', idx: 1 },
                            { name: 'Tasdiqlandi', idx: 2 },
                            { name: 'Haydovchi tayinlandi', idx: 3 },
                            { name: 'Yo\'lda', idx: 4 },
                            { name: 'Yetib keldi', idx: 5 },
                            { name: 'Topshirildi', idx: 6 },
                          ].map(s => (
                            <div key={s.idx} className="flex flex-col items-center">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                  step >= s.idx
                                    ? 'bg-sky-600 text-white shadow-sm'
                                    : 'bg-slate-200 text-slate-400'
                                }`}
                              >
                                {step >= s.idx ? '✓' : s.idx}
                              </div>
                              <span className={`text-[10px] mt-1 line-clamp-1 ${step >= s.idx ? 'font-bold text-sky-900' : 'text-slate-400'}`}>
                                {s.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Driver info & Map if on route */}
                      {order.assignedDriverName && (
                        <div className="p-3 bg-white rounded-xl border border-sky-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-sky-600" />
                            <div>
                              <span className="text-slate-500">Haydovchi:</span>
                              <span className="font-bold text-slate-900 ml-1">{order.assignedDriverName}</span>
                            </div>
                          </div>
                          <a
                            href={`tel:${order.assignedDriverPhone}`}
                            className="font-mono font-semibold text-sky-700 hover:underline"
                          >
                            {order.assignedDriverPhone}
                          </a>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-slate-700 pt-1">
                        <span>{order.totalQuantity} dona suv • {order.deliveryAddress}</span>
                        <span className="font-bold text-slate-900">{formatUZS(order.totalAmount)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Empty Bottles Balance */}
      {activeTab === 'BALANCE' && (
        <div className="bg-white rounded-2xl border border-sky-100 p-6 shadow-xs max-w-xl mx-auto space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Bo'sh Idishlar Balansi</h3>
              <p className="text-xs text-slate-500">
                Sizning hisobingizdagi qaytarilishi kerak bo'lgan 18.9L polikarbonat idishlar
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white text-center shadow-md shadow-cyan-500/10">
            <span className="text-xs font-semibold text-cyan-100 block">Sizdagi bo'sh idishlar zaxirasi:</span>
            <div className="text-4xl font-black mt-1">4 dona</div>
            <p className="text-xs text-cyan-100 mt-2">
              Keyingi suv buyurtmasida haydovchiga topshirishingiz mumkin
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800 mb-1">Idishlar almashinuvi tartibi:</div>
            <p>• Suv yetkazilganda to'la idish topshiriladi va avvalgi bo'sh idish qaytarib olinadi.</p>
            <p>• Agar bo'sh idish topshirilmasa, qarzdorlik hisobingizda qayd etiladi.</p>
            <p>• Shikastlangan yoki yaroqsiz bo'lgan idishlar dalolatnoma asosida rasmiylashtiriladi.</p>
          </div>
        </div>
      )}

      {/* Tab 4: Suv Sifati & Laboratoriya Sertifikati */}
      {activeTab === 'QUALITY' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">AquaFlow Laboratoriya Sifat Pasporti</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      SanPiN 0283-10 Sertifikatlangan
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chorvoq tog' tizmasi, 180 metr chuqurlikdagi artezian buloq suvi
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block">Oxirgi tahlil sanasi:</span>
                <span className="text-xs font-bold text-slate-800">Bugun, 06:00 (Har kuni yangilanadi)</span>
              </div>
            </div>

            {/* Quality Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-center">
                <div className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">pH Ishqoriylik</div>
                <div className="text-2xl font-black text-sky-950 mt-1">7.4 pH</div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">✓ Ideal me'yor (6.5-8.5)</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Mineralizatsiya (TDS)</div>
                <div className="text-2xl font-black text-blue-950 mt-1">115 mg/L</div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">✓ Yengil tabiiy mineral</span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 text-center">
                <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Filtratsiya Bosqichi</div>
                <div className="text-2xl font-black text-teal-950 mt-1">7 Bosqich</div>
                <span className="text-[10px] text-teal-700 font-semibold block mt-1">Ozon + UV sterilizatsiya</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Mikrobiologiya</div>
                <div className="text-2xl font-black text-emerald-950 mt-1">0.00 %</div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">100% toza va xavfsiz</span>
              </div>
            </div>

            {/* Minerals Table */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Tabiiy Makro va Mikro Elementlar Tarkibi (1 Litrda):</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Kalsiy (Ca²⁺):</span>
                  <span className="font-bold text-slate-900">25 - 40 mg/l</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Magniy (Mg²⁺):</span>
                  <span className="font-bold text-slate-900">10 - 20 mg/l</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Kaliy (K⁺):</span>
                  <span className="font-bold text-slate-900">2 - 5 mg/l</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Natriy (Na⁺):</span>
                  <span className="font-bold text-slate-900">15 - 25 mg/l</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Gidrokarbonat:</span>
                  <span className="font-bold text-slate-900">120 - 180 mg/l</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Sulfatlar:</span>
                  <span className="font-bold text-slate-900">&lt; 15 mg/l</span>
                </div>
              </div>
            </div>

            {/* Certificate badge */}
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                O'zbekiston Respublikasi Sog'liqni Saqlash Vazirligi Davlat Sanitariya-Epidemiologiya xizmati tomonidan №UZ.SM.01.015.42187-raqamli Muvofiqlik Sertifikati berilgan.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Telegram Bot Simulator */}
      {activeTab === 'TELEGRAM' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Send className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">@AquaFlowDeliveryBot</h3>
                <p className="text-xs text-slate-500">
                  Telegram orqali 1-klikda lokatsiya yuborib suvga tezkor buyurtma bering
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>🤖 Telegram Bot Interfeysi</span>
                <span className="text-emerald-400">● Online (24/7)</span>
              </div>
              <p className="text-sky-300">
                /start - Xush kelibsiz! AquaFlow tizimidagi hisobingiz: {currentUser?.phone}
              </p>
              <p className="text-slate-300">
                1. 📍 Lokatsiya yuborish (GPS orqali avtomatik manzil aniqlash)<br/>
                2. 💧 Suv miqdorini tanlash (19L Premium, Pompa)<br/>
                3. 💳 To'lov: Naqd, Payme, Click yoki Uzum Bank
              </p>
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ORDER');
                  }}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-sans font-bold cursor-pointer"
                >
                  Buyurtma Formasini Ochish ➜
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-100 text-xs text-slate-600">
              💡 <strong>Eslatma:</strong> Telegram bot orqali berilgan har qanday buyurtma bevosita Operator kabinetiga tushadi va haydovchining mobil ilovasiga marshrut sifatida biriktiriladi.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
