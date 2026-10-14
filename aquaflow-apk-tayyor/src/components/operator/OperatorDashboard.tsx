/**
 * Operator Dashboard & Order Dispatching Center
 * Order verification, stock checking, driver assignment, incident resolution, and live dispatch
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { LeafletMap } from '../common/LeafletMap.js';
import {
  PackageCheck,
  Check,
  X,
  Truck,
  AlertTriangle,
  Clock,
  Phone,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ArrowRight,
  ShieldAlert,
  Send,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { Order, OrderStatus, IssueStatus } from '../../types/index.js';

export const OperatorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'ON_THE_WAY' | 'DELIVERED' | 'ISSUES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Issues review modal
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [issueResponseText, setIssueResponseText] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordRes, drvRes, stkRes, issRes] = await Promise.all([
        api.getOrders(),
        api.getDrivers(),
        api.getWarehouseStocks(),
        api.getIssues(),
      ]);

      if (ordRes.success) setOrders(ordRes.orders);
      if (drvRes.success) setDrivers(drvRes.drivers);
      if (stkRes.success) setStocks(stkRes.stocks);
      if (issRes.success) setIssues(issRes.issues);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Flash message helper
  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // 1. Confirm Order (Atomic Stock Check)
  const handleConfirmOrder = async (order: Order) => {
    try {
      const res = await api.confirmOrder(order.id, currentUser?.id || 'usr_operator');
      if (res.success) {
        showMessage(`${order.orderNumber} buyurtmasi tasdiqlandi va zaxira band qilindi!`);
        loadData();
        if (selectedOrder?.id === order.id) {
          setSelectedOrder(res.order);
        }
      }
    } catch (err: any) {
      showMessage(err.message || 'Xatolik yuz berdi', true);
    }
  };

  // 2. Reject Order
  const handleRejectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !rejectReason.trim()) return;
    try {
      const res = await api.rejectOrder(selectedOrder.id, currentUser?.id || 'usr_operator', rejectReason);
      if (res.success) {
        setShowRejectModal(false);
        setRejectReason('');
        showMessage(`${selectedOrder.orderNumber} bekor qilindi`);
        loadData();
      }
    } catch (err: any) {
      showMessage(err.message || 'Xatolik', true);
    }
  };

  // 3. Assign Driver
  const handleAssignDriver = async () => {
    if (!selectedOrder || !selectedDriverId) return;
    try {
      const res = await api.assignOrder(selectedOrder.id, selectedDriverId, currentUser?.id || 'usr_operator');
      if (res.success) {
        setShowAssignModal(false);
        showMessage(`${selectedOrder.orderNumber} haydovchiga biriktirildi va bildirishnoma yuborildi!`);
        loadData();
        if (selectedOrder) {
          setSelectedOrder(res.order);
        }
      }
    } catch (err: any) {
      showMessage(err.message || 'Xatolik', true);
    }
  };

  // 4. Respond to Issue
  const handleResolveIssue = async (status: IssueStatus) => {
    if (!selectedIssue) return;
    try {
      const res = await api.respondToIssue(
        selectedIssue.id,
        issueResponseText || 'Muammo operator tomonidan ko\'rib chiqildi',
        status,
        currentUser?.name
      );
      if (res.success) {
        setSelectedIssue(null);
        setIssueResponseText('');
        showMessage('Muammo holati yangilandi');
        loadData();
      }
    } catch (err: any) {
      showMessage(err.message || 'Xatolik', true);
    }
  };

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Yangi (Kutilmoqda)', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'CONFIRMED':
        return { label: 'Tasdiqlangan', cls: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'ASSIGNED':
        return { label: 'Haydovchiga biriktirilgan', cls: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'ACCEPTED':
        return { label: 'Haydovchi qabul qildi', cls: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'ON_THE_WAY':
        return { label: 'Haydovchi yo\'lda', cls: 'bg-cyan-100 text-cyan-800 border-cyan-300' };
      case 'ARRIVED':
        return { label: 'Manzilga yetib keldi', cls: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'DELIVERED':
        return { label: 'To\'liq topshirildi', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'PARTIALLY_DELIVERED':
        return { label: 'Qisman topshirildi', cls: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'ISSUE_REPORTED':
        return { label: 'Muammo qayd etildi', cls: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'CANCELLED':
        return { label: 'Bekor qilingan', cls: 'bg-slate-200 text-slate-700 border-slate-300' };
      default:
        return { label: status, cls: 'bg-slate-100 text-slate-700' };
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return o.orderStatus === 'PENDING';
    if (activeTab === 'CONFIRMED') return o.orderStatus === 'CONFIRMED';
    if (activeTab === 'ASSIGNED') return o.orderStatus === 'ASSIGNED' || o.orderStatus === 'ACCEPTED';
    if (activeTab === 'ON_THE_WAY') return o.orderStatus === 'ON_THE_WAY' || o.orderStatus === 'ARRIVED';
    if (activeTab === 'DELIVERED') return o.orderStatus === 'DELIVERED' || o.orderStatus === 'PARTIALLY_DELIVERED';
    return true;
  });

  // Calculate summary counts
  const pendingCount = orders.filter(o => o.orderStatus === 'PENDING').length;
  const inProgressCount = orders.filter(o => ['CONFIRMED', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED'].includes(o.orderStatus)).length;
  const deliveredCount = orders.filter(o => o.orderStatus === 'DELIVERED' || o.orderStatus === 'PARTIALLY_DELIVERED').length;
  const activeIssues = issues.filter(i => i.status === 'NEW' || i.status === 'UNDER_REVIEW');

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
      {actionSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="fixed top-20 right-6 z-50 bg-rose-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {actionError}
        </div>
      )}

      {/* Top Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('PENDING')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
              : 'bg-white hover:bg-amber-50/60 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex justify-between items-center text-xs opacity-90 font-medium">
            <span>Yangi buyurtmalar</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-1">{pendingCount} ta</div>
        </div>

        <div
          onClick={() => setActiveTab('ASSIGNED')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'ASSIGNED'
              ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
              : 'bg-white hover:bg-sky-50/60 border-sky-200 text-sky-900'
          }`}
        >
          <div className="flex justify-between items-center text-xs opacity-90 font-medium">
            <span>Jarayonda / Yo'lda</span>
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-1">{inProgressCount} ta</div>
        </div>

        <div
          onClick={() => setActiveTab('DELIVERED')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'DELIVERED'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
              : 'bg-white hover:bg-emerald-50/60 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex justify-between items-center text-xs opacity-90 font-medium">
            <span>Bugun yetkazildi</span>
            <Check className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-1">{deliveredCount} ta</div>
        </div>

        <div
          onClick={() => setActiveTab('ISSUES')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'ISSUES'
              ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
              : 'bg-white hover:bg-rose-50/60 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex justify-between items-center text-xs opacity-90 font-medium">
            <span>Muammolar</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-1">{activeIssues.length} ta</div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'ISSUES' ? (
        /* Driver Issues Incident Feed */
        <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-base">Haydovchilardan Kelgan Muammolar va Dalolatnomalar</h3>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.length === 0 ? (
              <p className="text-center col-span-2 text-xs text-slate-400 py-10">Hech qanday muammo qayd etilmagan</p>
            ) : (
              issues.map(iss => (
                <div key={iss.id} className="p-4 rounded-xl border border-rose-100 bg-rose-50/20 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-rose-700">{iss.issueNumber}</span>
                      <span className="text-xs text-slate-500 ml-2 font-medium">Buyurtma: {iss.orderNumber}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      iss.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : iss.status === 'UNDER_REVIEW'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {iss.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700">
                    <p className="font-semibold text-slate-900">Mijoz: {iss.customerName} ({iss.customerPhone})</p>
                    <p className="text-slate-600 mt-0.5">Haydovchi: {iss.driverName} ({iss.driverPhone})</p>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="font-semibold text-slate-800">Muammo turi: <span className="text-rose-600">{iss.issueType}</span></div>
                    <p className="text-slate-600 mt-1 italic">"{iss.notes}"</p>
                    {iss.quantityAffected > 0 && (
                      <p className="text-slate-700 mt-1 font-medium">Ta'sirlangan miqdor: {iss.quantityAffected} ta</p>
                    )}
                  </div>

                  {iss.photoUrls && iss.photoUrls.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Biriktirilgan surat:</span>
                      <img
                        src={iss.photoUrls[0]}
                        alt="Muammo rasmi"
                        className="w-full h-36 object-cover rounded-lg border border-slate-200 shadow-xs"
                      />
                    </div>
                  )}

                  {iss.operatorResponse && (
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-900">
                      <span className="font-bold">Operator javobi:</span> {iss.operatorResponse}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIssue(iss);
                        setIssueResponseText(iss.operatorResponse || '');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Javob berish / Hal qilish
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Orders Management Table */
        <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-xs">
          {/* Tabs & Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'ALL' ? 'bg-white text-sky-800 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Barchasi ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'PENDING' ? 'bg-white text-sky-800 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Yangi ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('CONFIRMED')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'CONFIRMED' ? 'bg-white text-sky-800 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Tasdiqlangan
              </button>
              <button
                onClick={() => setActiveTab('ASSIGNED')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'ASSIGNED' ? 'bg-white text-sky-800 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Biriktirilgan
              </button>
              <button
                onClick={() => setActiveTab('ON_THE_WAY')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'ON_THE_WAY' ? 'bg-white text-sky-800 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Yo'lda
              </button>
              <button
                onClick={() => setActiveTab('DELIVERED')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'DELIVERED' ? 'bg-white text-sky-800 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Topshirildi
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buyurtma, mijoz, manzil..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Buyurtma</th>
                  <th className="py-3 px-4">Mijoz va Telefon</th>
                  <th className="py-3 px-4">Mahsulot va Miqdor</th>
                  <th className="py-3 px-4">Yetkazish Manzili</th>
                  <th className="py-3 px-4">To'lov</th>
                  <th className="py-3 px-4 text-center">Holat</th>
                  <th className="py-3 px-4">Haydovchi</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => {
                  const badge = getStatusBadge(order.orderStatus);
                  const isPending = order.orderStatus === 'PENDING';
                  const isConfirmed = order.orderStatus === 'CONFIRMED';
                  const isAssigned = order.orderStatus === 'ASSIGNED' || order.orderStatus === 'ACCEPTED';

                  return (
                    <tr key={order.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-900">
                        {order.orderNumber}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {order.deliveryTimeSlot}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-sky-600" />
                          {order.customerPhone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{order.totalQuantity} dona suv</div>
                        <div className="text-[11px] text-slate-500 font-mono">{formatUZS(order.totalAmount)}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        <div className="flex items-center gap-1" title={order.deliveryAddress}>
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">{order.deliveryAddress}</span>
                        </div>
                        {order.customerNote && (
                          <div className="text-[10px] text-amber-700 italic truncate mt-0.5">
                            "{order.customerNote}"
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{order.paymentMethod}</span>
                        <div className="text-[10px] text-slate-400">{order.paymentStatus}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {order.assignedDriverName ? (
                          <div className="font-medium text-slate-900">
                            {order.assignedDriverName}
                            <div className="text-[10px] text-slate-400">{order.assignedDriverPhone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Biriktirilmagan</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleConfirmOrder(order)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Zaxirani tekshirish va tasdiqlash"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Tasdiqlash
                            </button>
                          )}

                          {(isPending || isConfirmed || isAssigned) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder(order);
                                setSelectedDriverId(order.assignedDriverId || drivers[0]?.id || '');
                                setShowAssignModal(true);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="Driverga biriktirish yoki almashtirish"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              {order.assignedDriverId ? 'Almashtirish' : 'Driverga berish'}
                            </button>
                          )}

                          {isPending && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowRejectModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Buyurtmani rad etish"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Tafsilotlar"
                          >
                            <Eye className="w-4 h-4" />
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
      )}

      {/* Modal: Driverga Biriktirish */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Buyurtmani Haydovchiga Biriktirish ({selectedOrder.orderNumber})
                </h3>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-sky-50 rounded-xl text-xs text-sky-900">
              <div className="font-bold">Mijoz: {selectedOrder.customerName}</div>
              <div>Manzil: {selectedOrder.deliveryAddress}</div>
              <div>Suv miqdori: {selectedOrder.totalQuantity} dona • Vaqt: {selectedOrder.deliveryTimeSlot}</div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-slate-700">Mavjud Haydovchilar ro'yxati</label>
              {drivers.map(drv => {
                const isSelected = selectedDriverId === drv.id;
                const isBlocked = drv.status === 'BLOCKED';

                return (
                  <div
                    key={drv.id}
                    onClick={() => !isBlocked && setSelectedDriverId(drv.id)}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/80 shadow-xs'
                        : isBlocked
                        ? 'border-slate-200 bg-slate-50 opacity-40 cursor-not-allowed'
                        : 'border-slate-200 hover:border-sky-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{drv.name}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{drv.phone} • {drv.profile?.vehicleModel} ({drv.profile?.vehiclePlate})</div>
                      <div className="text-[10px] text-sky-700 mt-0.5">
                        Joriy faol buyurtmalar: {drv.profile?.activeOrdersCount || 0} ta
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isBlocked
                          ? 'bg-rose-100 text-rose-700'
                          : drv.profile?.status === 'ON_ROUTE'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isBlocked ? 'Bloklangan' : drv.profile?.status === 'ON_ROUTE' ? 'Marshrutda' : 'Bo\'sh'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleAssignDriver}
                disabled={!selectedDriverId}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm cursor-pointer disabled:bg-slate-300"
              >
                Biriktirish va Haydovchiga yuborish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Buyurtmani Rad Etish */}
      {showRejectModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Buyurtmani Rad Etish ({selectedOrder.orderNumber})</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rad etish sababini kiritish majburiy
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Masalan: Omborda suv tugagan, yoki manzilga yetkazib berish xizmati qamrovi yetmaydi..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Orqaga
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                >
                  Rad etishni tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Order Detail & Delivery Map */}
      {selectedOrder && !showAssignModal && !showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-sky-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="font-mono text-base font-bold text-sky-900">{selectedOrder.orderNumber}</span>
                <span className="text-xs text-slate-500 ml-2">Tafsilotlar va Manzil Xaritasi</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Map */}
              <LeafletMap
                markers={[
                  {
                    id: selectedOrder.id,
                    lat: selectedOrder.lat,
                    lng: selectedOrder.lng,
                    title: selectedOrder.customerName,
                    type: 'DESTINATION',
                    details: selectedOrder.deliveryAddress,
                    status: selectedOrder.orderStatus,
                  }
                ]}
                center={[selectedOrder.lat, selectedOrder.lng]}
                zoom={14}
                height="220px"
              />

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Mijoz:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</span>
                  <div className="text-slate-600 font-mono">{selectedOrder.customerPhone}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Yetkazish vaqti:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedOrder.deliveryTimeSlot}</span>
                  <div className="text-slate-600">Holat: {selectedOrder.orderStatus}</div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Buyurtma tarkibi:</span>
                <div className="space-y-1">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span>{it.productName} ({it.quantity} dona)</span>
                      <span className="font-mono font-bold text-slate-900">{formatUZS(it.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200 mt-2">
                  <span>Jami to'lov:</span>
                  <span>{formatUZS(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {selectedOrder.assignedDriverName && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <span className="text-indigo-900 font-semibold block">Biriktirilgan Haydovchi:</span>
                  <div className="font-bold text-indigo-950 mt-0.5">{selectedOrder.assignedDriverName}</div>
                  <div className="text-indigo-700 font-mono text-[11px]">{selectedOrder.assignedDriverPhone}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue Response */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">{selectedIssue.issueNumber} - Muammoga javob</h3>
              <button onClick={() => setSelectedIssue(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-900">
                <div className="font-bold">{selectedIssue.issueType}: {selectedIssue.notes}</div>
                <div className="text-[11px] text-rose-700 mt-1">Haydovchi: {selectedIssue.driverName}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operator ko'rsatmasi / Izoh</label>
                <textarea
                  rows={3}
                  value={issueResponseText}
                  onChange={e => setIssueResponseText(e.target.value)}
                  placeholder="Yangi idish berildi, yoki dalolatnoma tuzildi..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleResolveIssue('UNDER_REVIEW')}
                  className="px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl"
                >
                  Ko'rib chiqilmoqda
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveIssue('RESOLVED')}
                  className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Hal qilindi deb yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
