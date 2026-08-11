import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { 
  FileText, Download, Printer, ArrowLeft, Calendar, 
  DollarSign, TrendingUp, Filter, CheckCircle2 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportsPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [reportType, setReportType] = useState('daily'); // 'daily' | 'monthly' | 'customer' | 'expense'
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    generateReport();
  }, [reportType, selectedMonth]);

  const generateReport = async () => {
    setLoading(true);
    const customers = await dataService.getCustomers();
    const expenses = await dataService.getExpenses();
    const payments = await dataService.getPayments();
    const catering = await dataService.getCateringOrders();

    if (reportType === 'customer') {
      const rows = [];
      for (const c of customers) {
        const lData = await dataService.getCustomerLedger(c.id);
        rows.push({
          Customer: c.name,
          Mobile: c.mobile,
          LunchCount: lData.lunchCount,
          DinnerCount: lData.dinnerCount,
          TotalTiffins: lData.totalTiffins,
          TotalBill: `₹${lData.totalBilled}`,
          PaidAmount: `₹${lData.totalPaid}`,
          PendingAmount: `₹${lData.pendingBalance}`
        });
      }
      setReportData(rows);
    } else if (reportType === 'expense') {
      const filtered = expenses.filter(e => e.date.startsWith(selectedMonth));
      const rows = filtered.map(e => ({
        Date: e.date,
        Category: e.category,
        Description: e.description || '-',
        PaymentMode: e.paymentMode.toUpperCase(),
        Amount: `₹${e.amount}`
      }));
      setReportData(rows);
    } else {
      // Daily / Monthly business summary
      const rows = [
        { Metric: 'Total Active Customers', Value: customers.filter(c => c.status === 'active').length },
        { Metric: 'Total Expenses Recorded', Value: `₹${expenses.reduce((s, e) => s + Number(e.amount), 0)}` },
        { Metric: 'Total Customer Payments Received', Value: `₹${payments.reduce((s, p) => s + Number(p.amount), 0)}` },
        { Metric: 'Total Catering Advance Received', Value: `₹${catering.reduce((s, c) => s + Number(c.advancePaid), 0)}` }
      ];
      setReportData(rows);
    }

    setLoading(false);
  };

  const exportPDF = () => {
    window.print();
    setToast('Print / Save PDF dialog opened!');
    setTimeout(() => setToast(''), 3000);
  };

  const exportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `Papa_Register_${reportType}_${selectedMonth}.xlsx`);
      setToast('Excel exported successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      console.error("Excel export error", e);
    }
  };

  return (
    <div className="space-y-3 pb-24">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-4 right-4 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-500 font-bold text-xs max-w-md mx-auto"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/more')}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 active-press mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {t('reports')}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {lang === 'hi' ? 'व्यापार रिपोर्ट्स एवं PDF/Excel एक्सपोर्ट' : 'Business Analytics & File Export'}
              </p>
            </div>
          </div>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
          {['daily', 'monthly', 'customer', 'expense'].map((rt) => (
            <button
              key={rt}
              onClick={() => setReportType(rt)}
              className={`py-1.5 rounded-lg capitalize transition active-press ${
                reportType === rt
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {rt}
            </button>
          ))}
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-600">Select Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
          />
        </div>

        {/* Action Export Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportPDF}
            className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active-press transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('exportPDF')}</span>
          </button>

          <button
            onClick={exportExcel}
            className="py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active-press transition"
          >
            <FileText className="w-4 h-4" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>
      </div>

      {/* Report Table Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Report Data Preview
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs font-semibold text-slate-500">
            Generating report...
          </div>
        ) : reportData.length === 0 ? (
          <div className="py-8 text-center text-xs font-semibold text-slate-400">
            No data available for selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  {Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="py-2 px-2">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {Object.values(row).map((val, valIdx) => (
                      <td key={valIdx} className="py-2.5 px-2">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
