/**
 * Bottle QR / Barcode Asset Passport & Lifecycle Tracker
 * Tracks wash/sanitization cycles, quality grades, and current container custody
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  QrCode,
  Search,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Calendar,
  X,
  RefreshCw
} from 'lucide-react';
import { BottleAsset } from '../../types/index.js';

interface BottleTrackerProps {
  onClose?: () => void;
}

export const BottleTrackerModal: React.FC<BottleTrackerProps> = ({ onClose }) => {
  const [bottles, setBottles] = useState<BottleAsset[]>([]);
  const [searchBarcode, setSearchBarcode] = useState('');
  const [selectedBottle, setSelectedBottle] = useState<BottleAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sanitizeSuccess, setSanitizeSuccess] = useState(false);

  const loadBottles = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBottles();
      if (res.success) {
        setBottles(res.bottles);
        if (!selectedBottle && res.bottles.length > 0) {
          setSelectedBottle(res.bottles[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBottles();
  }, []);

  const handleScanOrSearch = async (code: string) => {
    if (!code.trim()) return;
    try {
      const res = await api.scanBottle(code.trim());
      if (res.success && res.bottle) {
        setSelectedBottle(res.bottle);
      } else {
        alert('Idish topilmadi');
      }
    } catch (err: any) {
      alert(err.message || 'Idish topilmadi');
    }
  };

  const handleSanitize = async (barcode: string) => {
    try {
      const res = await api.sanitizeBottle(barcode);
      if (res.success) {
        setSelectedBottle(res.bottle);
        setSanitizeSuccess(true);
        setTimeout(() => setSanitizeSuccess(false), 3000);
        loadBottles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'EXCELLENT':
        return { label: 'A\'lo (Yangi)', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'GOOD':
        return { label: 'Yaxshi (Ishlatilmoqda)', cls: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'INSPECTION_NEEDED':
        return { label: 'Tekshiruv zarur (Eskirgan)', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'REJECT':
        return { label: 'Yaroqsiz / Chiqit', cls: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { label: grade, cls: 'bg-slate-100 text-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Polikarbonat Idishlar QR / Barcode Pasporti</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Har bir 18.9L idishning foydalanish sikllari (yuvishlar soni), kimda turgani va texnik holati nazorati
          </p>
        </div>

        {/* Barcode Search / Scanner simulator */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Barcode: BTL-19L-00841..."
              value={searchBarcode}
              onChange={e => setSearchBarcode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScanOrSearch(searchBarcode)}
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono w-48 sm:w-60"
            />
          </div>
          <button
            type="button"
            onClick={() => handleScanOrSearch(searchBarcode || 'BTL-19L-00841')}
            className="px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors cursor-pointer"
          >
            Skanerlash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Selected Bottle Detailed Passport Card */}
        {selectedBottle && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-sky-100 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-sky-900 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                  {selectedBottle.barcode}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  18.9L Standart Polikarbonat Idish
                </h3>
                <span className="text-xs text-slate-400 font-mono">Seriya: {selectedBottle.serialNumber}</span>
              </div>

              <div>
                {(() => {
                  const badge = getGradeBadge(selectedBottle.qualityGrade);
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Lifecycle Progress Bar */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Foydalanish va yuvish sikllari:</span>
                <span className="font-mono font-bold text-sky-800">
                  {selectedBottle.cyclesCount} / {selectedBottle.maxCycles} sikl ({Math.round((selectedBottle.cyclesCount / selectedBottle.maxCycles) * 100)}%)
                </span>
              </div>

              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    selectedBottle.cyclesCount > 50
                      ? 'bg-rose-500'
                      : selectedBottle.cyclesCount > 35
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(selectedBottle.cyclesCount / selectedBottle.maxCycles) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Qolgan resurs: {selectedBottle.maxCycles - selectedBottle.cyclesCount} ta to'ldirish</span>
                <span>Standart xizmat muddati: 60 sikl</span>
              </div>
            </div>

            {/* Passport Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Joriy joylashuv:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedBottle.currentHolderName}</span>
                <span className="text-[10px] text-sky-700 font-semibold">{selectedBottle.currentHolderType}</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Zararsizlantirilgan vaqti:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {new Date(selectedBottle.lastSanitizedAt).toLocaleDateString('uz-UZ')}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Dezinfeksiya o'tgan</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Ishlab chiqarilgan:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedBottle.productionDate}</span>
                <span className="text-[10px] text-slate-500">Oziq-ovqat polikarbonati</span>
              </div>
            </div>

            {/* Sanitize action */}
            {sanitizeSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Idish yuvildi, dezinfeksiya qilindi va sikl hisoblagichi oshirildi!
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => handleSanitize(selectedBottle.barcode)}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Yuvish va zararsizlantirishni qayd etish (+1 sikl)
              </button>
            </div>
          </div>
        )}

        {/* Right: Quick Catalog of Tagged Bottles */}
        <div className="bg-white rounded-2xl border border-sky-100 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Tizimdagi Idishlar ({bottles.length})
            </span>
            <button onClick={loadBottles} className="text-slate-400 hover:text-sky-600 p-1">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto">
            {bottles.map(b => (
              <div
                key={b.id}
                onClick={() => setSelectedBottle(b)}
                className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  selectedBottle?.id === b.id
                    ? 'bg-sky-50 border-sky-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-sky-900">{b.barcode}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    b.status === 'IN_WAREHOUSE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'WITH_CUSTOMER'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {b.status === 'IN_WAREHOUSE' ? 'Omborda' : b.status === 'WITH_CUSTOMER' ? 'Mijozda' : b.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{b.currentHolderName}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Sikl: {b.cyclesCount}/{b.maxCycles} • {b.qualityGrade}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
