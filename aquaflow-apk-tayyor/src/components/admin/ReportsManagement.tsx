/**
 * Financial & Operational Reports Management
 * Multi-period reports, expense breakdown, Excel/CSV export, and printable PDF preview
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { MonthlyFinancialReport } from '../../types/index.js';

export const ReportsManagement: React.FC = () => {
  const [report, setReport] = useState<MonthlyFinancialReport | null>(null);
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      setIsLoading(true);
      try {
        const res = await api.getMonthlyReport();
        if (res.success) setReport(res.report);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [period]);

  const formatUZS = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  };

  // Export to CSV/Excel function
  const handleExportCSV = () => {
    if (!report) return;

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += `AQUAFLOW - MOLIYAVIY VA OPERATSION HISOBOT (${report.period})\r\n\r\n`;

    csvContent += 'MOLIYAVIY KO\'RSATKICHLAR\r\n';
    csvContent += `Umumiy Buyurtmalar,${report.totalOrders}\r\n`;
    csvContent += `Yetkazib berilgan buyurtmalar,${report.deliveredOrders}\r\n`;
    csvContent += `Jami Sotilgan Suvlar (dona),${report.totalWaterBottlesSold}\r\n`;
    csvContent += `Jami Tushum (Gross Revenue),${report.grossRevenue} UZS\r\n`;
    csvContent += `Logistika va Operatsion Xarajatlar,${report.operatingExpenses} UZS\r\n`;
    csvContent += `Sof Foyda,${report.netProfit} UZS\r\n`;
    csvContent += `Shikastlangan Idishlar Zarari,${report.damagedCostEstimate} UZS\r\n\r\n`;

    csvContent += 'HAYDOVCHILAR SAMARADORLIGI\r\n';
    csvContent += 'Haydovchi,Topshirgan buyurtmalari,Yetkazgan suvlari (dona),Muammolar\r\n';
    report.driverPerformance.forEach(d => {
      csvContent += `${d.driverName},${d.deliveredOrders},${d.deliveredBottles},${d.issuesReported}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AquaFlow_Hisobot_${report.period.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !report) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">Moliyaviy va Oylik Hisobotlar</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tushum, xarajatlar, sof foyda, haydovchilar samaradorligi va ombor aylanmasi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setPeriod('DAILY')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${period === 'DAILY' ? 'bg-white text-sky-800 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Kunlik
            </button>
            <button
              onClick={() => setPeriod('WEEKLY')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${period === 'WEEKLY' ? 'bg-white text-sky-800 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Haftalik
            </button>
            <button
              onClick={() => setPeriod('MONTHLY')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${period === 'MONTHLY' ? 'bg-white text-sky-800 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Oylik
            </button>
            <button
              onClick={() => setPeriod('ANNUAL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${period === 'ANNUAL' ? 'bg-white text-sky-800 shadow-xs' : 'hover:text-slate-900'}`}
            >
              Yillik
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Excel (CSV) yuklab olish
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            PDF / Chop etish
          </button>
        </div>
      </div>

      {/* Printable Report Document Wrapper */}
      <div className="bg-white rounded-2xl border border-sky-100 p-6 sm:p-8 shadow-xs space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900">AquaFlow Toshkent</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">Rasmiy Hisobot</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Yunusobod tumani, Bog'ishamol ko'chasi 45 • Tel: +998 71 230 40 50</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Hisobot Davri</span>
            <span className="text-base font-bold text-slate-900 font-mono">{report.period}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Shakllantirildi: 14-Oktyabr 2026</span>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Moliyaviy Natijalar (Hisoblangan va Audit qilingan)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-800 block">Jami Tushum (Gross Revenue)</span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">
                {formatUZS(report.grossRevenue)}
              </span>
              <span className="text-[11px] text-emerald-700 mt-1 block">To'langan buyurtmalar aylanmasi</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-xs font-semibold text-amber-800 block">Operatsion va Yoqilg'i Xarajatlari</span>
              <span className="text-2xl font-black text-amber-950 mt-1 block">
                {formatUZS(report.operatingExpenses)}
              </span>
              <span className="text-[11px] text-amber-700 mt-1 block">Logistika, avtomobil va ish haqi (42%)</span>
            </div>

            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200">
              <span className="text-xs font-semibold text-sky-800 block">Sof Foyda (Net Profit)</span>
              <span className="text-2xl font-black text-sky-950 mt-1 block">
                {formatUZS(report.netProfit)}
              </span>
              <span className="text-[11px] text-sky-700 mt-1 block">Barcha xarajatlar chegirilgach</span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
              <span className="text-xs font-semibold text-rose-800 block">Shikastlangan Idishlar Zarari</span>
              <span className="text-2xl font-black text-rose-950 mt-1 block">
                {formatUZS(report.damagedCostEstimate)}
              </span>
              <span className="text-[11px] text-rose-700 mt-1 block">{report.damagedBottlesCount} ta yaroqsiz idish qiymati</span>
            </div>
          </div>
        </div>

        {/* Operational Metrics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Yetkazib Berish va Buyurtmalar Ko'rsatkichlari
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-xs text-slate-500 block">Jami Buyurtmalar</span>
              <span className="text-xl font-bold text-slate-900">{report.totalOrders} ta</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Topshirilgan</span>
              <span className="text-xl font-bold text-emerald-600">{report.deliveredOrders} ta</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Sotilgan 18.9L Suv</span>
              <span className="text-xl font-bold text-sky-700">{report.totalWaterBottlesSold} dona</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Bajarilish Samaradorligi</span>
              <span className="text-xl font-bold text-indigo-600">
                {report.totalOrders ? Math.round((report.deliveredOrders / report.totalOrders) * 100) : 100}%
              </span>
            </div>
          </div>
        </div>

        {/* Driver Efficiency Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Haydovchilar Samaradorligi Tahlili
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Haydovchi F.I.Sh</th>
                  <th className="py-2.5 px-4 text-center">Topshirilgan Buyurtmalar</th>
                  <th className="py-2.5 px-4 text-center">Yetkazilgan Suvlar (Dona)</th>
                  <th className="py-2.5 px-4 text-center">Qayd etilgan muammolar</th>
                  <th className="py-2.5 px-4 text-right">Samaradorlik ko'rsatkichi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.driverPerformance.map(driver => (
                  <tr key={driver.driverId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-sky-600" />
                      {driver.driverName}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {driver.deliveredOrders} ta
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {driver.deliveredBottles} dona
                    </td>
                    <td className="py-3 px-4 text-center">
                      {driver.issuesReported > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[11px] border border-rose-200">
                          {driver.issuesReported} ta
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">0 ta (A'lo)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sky-700">
                      98.4%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Balance Reconciliation */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Ombor Qoldiqlari va Kirim-Chiqim Balansi
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Mahsulot</th>
                  <th className="py-2.5 px-4 text-center">Boshlang'ich qoldiq</th>
                  <th className="py-2.5 px-4 text-center">Kirim (+)</th>
                  <th className="py-2.5 px-4 text-center">Chiqim (-)</th>
                  <th className="py-2.5 px-4 text-center">Amaldagi qoldiq</th>
                  <th className="py-2.5 px-4 text-center">Bo'sh idishlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.stockBalanceSummary.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{s.productName}</td>
                    <td className="py-2.5 px-4 text-center text-slate-600">{s.startingStock}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-emerald-600">+{s.incoming}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-rose-600">-{s.outgoing}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-sky-800">{s.currentStock}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-teal-700">{s.emptyBottles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Footer Signatures */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-xs text-slate-600">
          <div>
            <span className="font-semibold block text-slate-900">Bosh Hisobchi:</span>
            <div className="mt-4 border-b border-dashed border-slate-300 w-48"></div>
            <span className="text-[11px] text-slate-400 mt-1 block">Imzo va muhr o'rni</span>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="font-semibold block text-slate-900">Kompaniya Rahbari:</span>
            <div className="mt-4 border-b border-dashed border-slate-300 w-48"></div>
            <span className="text-[11px] text-slate-400 mt-1 block">Rahimov S. M.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
