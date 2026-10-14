/**
 * Warehouse & Stock Management (Ombor Boshqaruvi)
 * Handles full bottles, empty bottles, damaged containers, receipts, and inventory audit
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Warehouse,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Edit2,
  Archive,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Product, StockMovement } from '../../types/index.js';

export const WarehouseManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [stocks, setStocks] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any | null>(null);

  // Form states
  const [receiptForm, setReceiptForm] = useState({
    productId: '',
    quantity: 100,
    notes: 'Zavoddan yangi partiya',
  });

  const [inventoryForm, setInventoryForm] = useState({
    productId: '',
    actualFull: 0,
    actualEmpty: 0,
    actualDamaged: 0,
    notes: 'Oy oxiri inventarizatsiya natijasi',
  });

  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    code: '',
    volumeLiters: 18.9,
    unitPrice: 20000,
    minStockAlert: 100,
    description: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stocksRes, prodsRes, movRes] = await Promise.all([
        api.getWarehouseStocks(),
        api.getProducts(),
        api.getStockMovements(),
      ]);

      if (stocksRes.success) setStocks(stocksRes.stocks);
      if (prodsRes.success) setProducts(prodsRes.products);
      if (movRes.success) setMovements(movRes.movements);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptForm.productId || receiptForm.quantity <= 0) return;
    try {
      const res = await api.recordStockReceipt(
        receiptForm.productId,
        receiptForm.quantity,
        receiptForm.notes,
        currentUser?.id || 'usr_admin'
      );
      if (res.success) {
        setShowReceiptModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleInventoryAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.productId) return;
    try {
      const res = await api.recordInventoryAdjustment({
        productId: inventoryForm.productId,
        actualFull: inventoryForm.actualFull,
        actualEmpty: inventoryForm.actualEmpty,
        actualDamaged: inventoryForm.actualDamaged,
        notes: inventoryForm.notes,
        adminId: currentUser?.id || 'usr_admin',
      });
      if (res.success) {
        setShowInventoryModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (productForm.id) {
        await api.updateProduct(productForm.id, productForm);
      } else {
        await api.createProduct({
          ...productForm,
          adminId: currentUser?.id,
        });
      }
      setShowProductModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    }
  };

  const openInventoryModalForStock = (stock: any) => {
    setSelectedStock(stock);
    setInventoryForm({
      productId: stock.productId,
      actualFull: stock.fullBottles,
      actualEmpty: stock.emptyBottles,
      actualDamaged: stock.damagedBottles,
      notes: 'Haqiqiy sanash natijasi',
    });
    setShowInventoryModal(true);
  };

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  const filteredStocks = stocks.filter(s =>
    s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.productCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Ombor va Idishlar Zaxirasi</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Toshkent Markaziy Suv Zavod Ombori • To'la suvlar, bo'sh idishlar va shikastlanganlar hisobi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setProductForm({
                id: '',
                name: '',
                code: `WTR-${Math.floor(Math.random() * 900 + 100)}`,
                volumeLiters: 18.9,
                unitPrice: 20000,
                minStockAlert: 100,
                description: '',
              });
              setShowProductModal(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Yangi mahsulot
          </button>

          <button
            type="button"
            onClick={() => {
              setReceiptForm({
                productId: stocks[0]?.productId || '',
                quantity: 200,
                notes: 'Zavoddan kirim',
              });
              setShowReceiptModal(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-sm shadow-sky-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4" />
            Omborga suv kirimi
          </button>
        </div>
      </div>

      {/* Stock Cards / Tables */}
      <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Mahsulot nomi yoki kodi bo'yicha izlash..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Mahsulot</th>
                <th className="py-3 px-4">Birlik narxi</th>
                <th className="py-3 px-4 text-center">To'la suvlar</th>
                <th className="py-3 px-4 text-center">Band qilingan (Zaxira)</th>
                <th className="py-3 px-4 text-center">Mavjud erkin</th>
                <th className="py-3 px-4 text-center">Bo'sh idishlar</th>
                <th className="py-3 px-4 text-center">Shikastlangan</th>
                <th className="py-3 px-4 text-center">Holat</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStocks.map((stock) => {
                const freeStock = stock.fullBottles - stock.reservedBottles;
                const isAlert = freeStock <= stock.minStockAlert;
                return (
                  <tr key={stock.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{stock.productName}</div>
                      <div className="text-[11px] text-slate-400">
                        Kod: {stock.productCode} {stock.volumeLiters > 0 ? `• ${stock.volumeLiters}L` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {formatUZS(stock.unitPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-900 text-sm">{stock.fullBottles}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                        {stock.reservedBottles} ta
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-bold text-sm ${freeStock <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {freeStock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 font-semibold text-[11px] border border-cyan-200">
                        {stock.emptyBottles} ta
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {stock.damagedBottles > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[11px] border border-rose-200">
                          {stock.damagedBottles} ta
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isAlert ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Kam qoldi (&le;{stock.minStockAlert})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Yetarli
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openInventoryModalForStock(stock)}
                          className="px-2.5 py-1 text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-sky-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          title="Inventarizatsiya"
                        >
                          <ClipboardList className="w-3.5 h-3.5 inline mr-1" />
                          Sanash
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

      {/* Stock Movements Audit History */}
      <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-base">Ombor Harakatlari Tarixi (Stock Movements)</h3>
          </div>
          <span className="text-xs text-slate-500">Oxirgi amallar va dalolatnomalar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Vaqt</th>
                <th className="py-2.5 px-3">Operatsiya turi</th>
                <th className="py-2.5 px-3">Mahsulot</th>
                <th className="py-2.5 px-3 text-center">Miqdor</th>
                <th className="py-2.5 px-3">Mas'ul xodim</th>
                <th className="py-2.5 px-3">Izoh / Hujjat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map(m => {
                const prod = products.find(p => p.id === m.productId);
                let badgeClass = 'bg-slate-100 text-slate-700';
                let label: string = m.type;

                if (m.type === 'INCOMING') {
                  badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  label = 'Omborga kirim (+)';
                } else if (m.type === 'OUTGOING_ORDER') {
                  badgeClass = 'bg-sky-50 text-sky-700 border-sky-200';
                  label = 'Yetkazib berish chiqimi (-)';
                } else if (m.type === 'CONTAINER_RETURN') {
                  badgeClass = 'bg-cyan-50 text-cyan-800 border-cyan-200';
                  label = 'Bo\'sh idish qaytishi';
                } else if (m.type === 'DAMAGE_WRITE_OFF') {
                  badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                  label = 'Shikastlangan hisobdan chiqarish';
                } else if (m.type === 'INVENTORY_ADJUST') {
                  badgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
                  label = 'Inventarizatsiya to\'g\'rilash';
                }

                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(m.timestamp).toLocaleDateString('uz-UZ')} {new Date(m.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badgeClass}`}>
                        {label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {prod?.name || 'Mahsulot'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                      {m.quantity} dona
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {m.operatorName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {m.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Omborga Kirim */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Omborga Yangi Suv Kirimi</h3>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockReceipt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mahsulotni tanlang</label>
                <select
                  value={receiptForm.productId}
                  onChange={e => setReceiptForm({ ...receiptForm, productId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.volumeLiters}L)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kirim miqdori (dona)</label>
                <input
                  type="number"
                  min="1"
                  value={receiptForm.quantity}
                  onChange={e => setReceiptForm({ ...receiptForm, quantity: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Partiya / Dalolatnoma izohi</label>
                <input
                  type="text"
                  value={receiptForm.notes}
                  onChange={e => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                  placeholder="Masalan: Chirchiq zavodidan 2-reys"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  Kirimni tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inventarizatsiya (Sanash) */}
      {showInventoryModal && selectedStock && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Ombor Inventarizatsiyasi</h3>
              </div>
              <button onClick={() => setShowInventoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-purple-50 rounded-xl text-xs text-purple-900">
              <div className="font-bold">{selectedStock.productName}</div>
              <div className="text-[11px] text-purple-700 mt-0.5">
                Amaldagi to'la: {selectedStock.fullBottles} ta | Bo'sh: {selectedStock.emptyBottles} ta | Shikastlangan: {selectedStock.damagedBottles} ta
              </div>
            </div>

            <form onSubmit={handleInventoryAdjust} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Haqiqiy to'la suvlar soni</label>
                <input
                  type="number"
                  min="0"
                  value={inventoryForm.actualFull}
                  onChange={e => setInventoryForm({ ...inventoryForm, actualFull: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Haqiqiy bo'sh idishlar soni</label>
                <input
                  type="number"
                  min="0"
                  value={inventoryForm.actualEmpty}
                  onChange={e => setInventoryForm({ ...inventoryForm, actualEmpty: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shikastlangan/yaroqsiz idishlar</label>
                <input
                  type="number"
                  min="0"
                  value={inventoryForm.actualDamaged}
                  onChange={e => setInventoryForm({ ...inventoryForm, actualDamaged: Number(e.target.value) })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inventarizatsiya izohi</label>
                <input
                  type="text"
                  value={inventoryForm.notes}
                  onChange={e => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInventoryModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
                >
                  Qoldiqlarni saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Yangi / Tahrirlash Mahsulot */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {productForm.id ? 'Mahsulotni tahrirlash' : 'Yangi Mahsulot Qo\'shish'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mahsulot nomi</label>
                <input
                  type="text"
                  placeholder="AquaFlow 18.9L Suv"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kodi</label>
                  <input
                    type="text"
                    value={productForm.code}
                    onChange={e => setProductForm({ ...productForm, code: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hajmi (litr)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={productForm.volumeLiters}
                    onChange={e => setProductForm({ ...productForm, volumeLiters: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Narxi (so'm)</label>
                  <input
                    type="number"
                    value={productForm.unitPrice}
                    onChange={e => setProductForm({ ...productForm, unitPrice: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min zaxira ogohlantirish</label>
                  <input
                    type="number"
                    value={productForm.minStockAlert}
                    onChange={e => setProductForm({ ...productForm, minStockAlert: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tavsif</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
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
