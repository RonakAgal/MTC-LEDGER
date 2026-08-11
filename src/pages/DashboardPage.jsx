import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { 
  Sun, Moon, UtensilsCrossed, TrendingUp, TrendingDown, DollarSign, 
  Wallet, CalendarDays, UserPlus, PlusCircle, CreditCard, ChevronRight, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    todayLunchCount: 0,
    todayDinnerCount: 0,
    todayTiffinIncome: 0,
    todayExpenses: 0,
    todayProfit: 0,
    totalPendingPayments: 0,
    upcomingCateringCount: 0
  });

  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentHour = new Date().getHours();
  const isMorning = currentHour < 16;

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    const data = await dataService.getDashboardMetrics();
    setMetrics(data);

    // Load customers with pending dues
    const customers = await dataService.getCustomers();
    const dues = [];
    for (const c of customers) {
      const lData = await dataService.getCustomerLedger(c.id);
      if (lData.pendingBalance > 0) {
        dues.push({
          customer: c,
          pendingBalance: lData.pendingBalance,
          billingCycle: c.billingCycle || 'monthly'
        });
      }
    }
    setPendingCustomers(dues);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Greeting Card */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 shadow-lg border border-slate-700/50 relative overflow-hidden"
      >
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs mb-0.5">
              {isMorning ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-300" />}
              <span>{isMorning ? t('goodMorning') : t('goodEvening')}</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {t('appTitle')}
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              {lang === 'hi' ? 'आज का डिजिटल बहीखाता' : "Today's Digital Register Overview"}
            </p>
          </div>

          <button
            onClick={() => navigate('/summary')}
            className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-2 rounded-xl backdrop-blur-md active-press transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'आज का हिसाब' : "Summary"}</span>
          </button>
        </div>
      </motion.div>

      {/* Main KPI Row: Today's Lunch & Dinner */}
      <div className="grid grid-cols-2 gap-3">
        {/* Lunch Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/tiffin?meal=lunch')}
          className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-2xl p-3.5 shadow-sm active-press cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
              🌅 {t('todayLunch')}
            </span>
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              {metrics.todayLunchCount} {lang === 'hi' ? 'कन्फर्म' : 'Confirmed'}
            </span>
          </div>
          <div className="text-2xl font-black text-amber-950">
            {metrics.todayLunchCount} <span className="text-xs font-semibold text-amber-800">tiffins</span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-amber-700 flex items-center justify-between border-t border-amber-200/60 pt-1.5">
            <span>{lang === 'hi' ? 'एंट्री करें' : 'Confirm Lunch'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>

        {/* Dinner Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          onClick={() => navigate('/tiffin?meal=dinner')}
          className="bg-gradient-to-br from-indigo-50 to-blue-50/60 border border-indigo-200/80 rounded-2xl p-3.5 shadow-sm active-press cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1">
              🌆 {t('todayDinner')}
            </span>
            <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              {metrics.todayDinnerCount} {lang === 'hi' ? 'कन्फर्म' : 'Confirmed'}
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-950">
            {metrics.todayDinnerCount} <span className="text-xs font-semibold text-indigo-800">tiffins</span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-indigo-700 flex items-center justify-between border-t border-indigo-200/60 pt-1.5">
            <span>{lang === 'hi' ? 'एंट्री करें' : 'Confirm Dinner'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </motion.div>
      </div>

      {/* Financial Summary 3-Grid (Income, Expense, Profit) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {lang === 'hi' ? 'आज का वित्तीय हिसाब' : "Today's Financial Metrics"}
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            Auto Calculated
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Income */}
          <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block truncate">
              {t('todayIncome')}
            </span>
            <div className="text-base font-black text-emerald-900 mt-0.5">
              ₹{metrics.todayTiffinIncome.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Expense */}
          <div className="bg-rose-50/70 border border-rose-200/70 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold text-rose-800 uppercase block truncate">
              {t('todayExpense')}
            </span>
            <div className="text-base font-black text-rose-900 mt-0.5">
              ₹{metrics.todayExpenses.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Profit */}
          <div className="bg-sky-50/70 border border-sky-200/70 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold text-sky-800 uppercase block truncate">
              {t('todayProfit')}
            </span>
            <div className={`text-base font-black mt-0.5 ${metrics.todayProfit >= 0 ? 'text-sky-900' : 'text-red-700'}`}>
              ₹{metrics.todayProfit.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Collection Due Widget (आज किनसे पैसा लेना है) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {lang === 'hi' ? 'आज किनसे पैसा लेना है (Collection Due)' : "Today's Payment Due List"}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                {pendingCustomers.length} {lang === 'hi' ? 'ग्राहकों का बकाया बाकी है' : 'customers have pending dues'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/more/payments')}
            className="text-[11px] font-extrabold text-amber-700 hover:text-amber-800 flex items-center gap-0.5 active-press"
          >
            <span>{lang === 'hi' ? 'सब देखें' : 'View All'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingCustomers.length === 0 ? (
          <div className="py-4 text-center text-xs font-semibold text-emerald-600 bg-emerald-50/60 rounded-xl border border-emerald-200">
            🎉 {lang === 'hi' ? 'सभी ग्राहकों का हिसाब चुकता है!' : 'All customer accounts are clear!'}
          </div>
        ) : (
          <div className="space-y-2">
            {pendingCustomers.slice(0, 4).map((item) => (
              <div
                key={item.customer.id}
                className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900">{item.customer.name}</span>
                    <span className="text-[9px] font-black uppercase bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                      {item.billingCycle === 'weekly' ? '7 Days' : item.billingCycle === 'fortnightly' ? '15 Days' : 'Monthly'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    📱 {item.customer.mobile} {item.customer.area ? `• 📍 ${item.customer.area}` : ''}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className="text-[10px] text-amber-800 uppercase block font-bold">Due</span>
                    <span className="text-sm font-black text-amber-950">₹{item.pendingBalance}</span>
                  </div>

                  {item.customer.mobile && (
                    <a
                      href={`https://wa.me/91${item.customer.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `नमस्ते ${item.customer.name} जी,\n\nMTC-LEDGER se aapka (${item.billingCycle === 'weekly' ? 'Weekly 7-Day' : item.billingCycle === 'fortnightly' ? '15-Day' : 'Monthly'}) tiffin bill balance ₹${item.pendingBalance} baaki hai.\n\nKripya UPI / Cash dwara bhugtan karein.\nDhanyawad!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs flex items-center justify-center shadow-xs active-press transition"
                      title="Send WhatsApp Reminder"
                    >
                      💬
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending & Catering Alerts Banner */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pending Payments */}
        <div 
          onClick={() => navigate('/more/payments')}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex items-center justify-between active-press cursor-pointer hover:border-amber-300"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {t('pendingPayments')}
            </span>
            <div className="text-lg font-black text-amber-600 mt-0.5">
              ₹{metrics.totalPendingPayments.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        {/* Upcoming Catering */}
        <div 
          onClick={() => navigate('/catering')}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex items-center justify-between active-press cursor-pointer hover:border-purple-300"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {t('upcomingCatering')}
            </span>
            <div className="text-lg font-black text-purple-700 mt-0.5">
              {metrics.upcomingCateringCount} {t('orders')}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          {t('quickActions')}
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          {/* + Customer */}
          <button
            onClick={() => navigate('/customers?action=add')}
            className="flex flex-col items-center justify-center py-3 px-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs active-press transition shadow-xs"
          >
            <UserPlus className="w-5 h-5 mb-1 text-emerald-600" />
            <span>{t('addCustomer')}</span>
          </button>

          {/* 🍱 Lunch */}
          <button
            onClick={() => navigate('/tiffin?meal=lunch')}
            className="flex flex-col items-center justify-center py-3 px-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold text-xs active-press transition shadow-xs"
          >
            <UtensilsCrossed className="w-5 h-5 mb-1 text-amber-600" />
            <span>{t('lunchBtn')}</span>
          </button>

          {/* 🍱 Dinner */}
          <button
            onClick={() => navigate('/tiffin?meal=dinner')}
            className="flex flex-col items-center justify-center py-3 px-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 font-bold text-xs active-press transition shadow-xs"
          >
            <UtensilsCrossed className="w-5 h-5 mb-1 text-indigo-600" />
            <span>{t('dinnerBtn')}</span>
          </button>

          {/* + Expense */}
          <button
            onClick={() => navigate('/more/expenses?action=add')}
            className="flex flex-col items-center justify-center py-3 px-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold text-xs active-press transition shadow-xs"
          >
            <PlusCircle className="w-5 h-5 mb-1 text-rose-600" />
            <span>{t('addExpense')}</span>
          </button>

          {/* + Catering */}
          <button
            onClick={() => navigate('/catering?action=add')}
            className="flex flex-col items-center justify-center py-3 px-2 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 font-bold text-xs active-press transition shadow-xs"
          >
            <CalendarDays className="w-5 h-5 mb-1 text-purple-600" />
            <span>{t('addCatering')}</span>
          </button>

          {/* 💰 Payment */}
          <button
            onClick={() => navigate('/more/payments?action=receive')}
            className="flex flex-col items-center justify-center py-3 px-2 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 font-bold text-xs active-press transition shadow-xs"
          >
            <CreditCard className="w-5 h-5 mb-1 text-teal-600" />
            <span>{t('receivePayment')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
