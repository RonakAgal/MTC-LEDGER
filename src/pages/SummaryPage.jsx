import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { 
  Sparkles, ArrowLeft, Sun, Moon, TrendingUp, TrendingDown, 
  DollarSign, Wallet, CreditCard, CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SummaryPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    todayLunchCount: 0,
    todayDinnerCount: 0,
    todayTiffinIncome: 0,
    todayExpenses: 0,
    todayProfit: 0,
    totalPendingPayments: 0,
    cashReceived: 0,
    upiReceived: 0,
    bankReceived: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    const metrics = await dataService.getDashboardMetrics();
    const payments = await dataService.getPayments();
    const todayStr = new Date().toISOString().split('T')[0];

    const todayPayments = payments.filter(p => p.date === todayStr);
    const cash = todayPayments.filter(p => p.paymentMode === 'cash').reduce((s, p) => s + Number(p.amount), 0);
    const upi = todayPayments.filter(p => p.paymentMode === 'upi').reduce((s, p) => s + Number(p.amount), 0);
    const bank = todayPayments.filter(p => p.paymentMode === 'bank').reduce((s, p) => s + Number(p.amount), 0);

    setSummary({
      ...metrics,
      cashReceived: cash,
      upiReceived: upi,
      bankReceived: bank
    });
    setLoading(false);
  };

  const totalTiffinsToday = summary.todayLunchCount + summary.todayDinnerCount;

  return (
    <div className="space-y-3 pb-24">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 active-press mr-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t('todaySummary')}</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {lang === 'hi' ? 'आज का दिनभर का व्यापार रिपोर्ट' : 'Complete Daily Business & Profit Calculation'}
            </p>
          </div>
        </div>
      </div>

      {/* Net Profit Big Banner Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 shadow-xl border border-slate-700/60 space-y-3 text-center"
      >
        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
          {t('netProfit')} (Total Income - Expenses)
        </span>

        <div className="text-3xl font-black tracking-tight text-white mt-1">
          ₹{summary.todayProfit.toLocaleString('en-IN')}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/80 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">{t('todayIncome')}</span>
            <span className="font-extrabold text-emerald-400 text-sm">₹{summary.todayTiffinIncome}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">{t('todayExpense')}</span>
            <span className="font-extrabold text-rose-400 text-sm">₹{summary.todayExpenses}</span>
          </div>
        </div>
      </motion.div>

      {/* Tiffin Breakdown Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          🍱 Today's Tiffin Count Breakdown
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">Lunch</span>
            <span className="text-lg font-black text-amber-950">{summary.todayLunchCount}</span>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200">
            <span className="text-[10px] font-bold text-indigo-800 uppercase block">Dinner</span>
            <span className="text-lg font-black text-indigo-950">{summary.todayDinnerCount}</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total</span>
            <span className="text-lg font-black text-emerald-950">{totalTiffinsToday}</span>
          </div>
        </div>
      </div>

      {/* Payment Modes Collected Today */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          💳 Payment Received Mode Breakdown Today
        </h3>

        <div className="space-y-2 text-xs font-semibold">
          <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span>Cash (नकद) 💵</span>
            <span className="font-black text-slate-900">₹{summary.cashReceived}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span>UPI (GooglePay / PhonePe) 📱</span>
            <span className="font-black text-slate-900">₹{summary.upiReceived}</span>
          </div>
          <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span>Bank Transfer 🏦</span>
            <span className="font-black text-slate-900">₹{summary.bankReceived}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
