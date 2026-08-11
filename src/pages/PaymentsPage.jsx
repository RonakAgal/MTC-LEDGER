import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { 
  CreditCard, Search, ArrowLeft, DollarSign, Wallet, 
  CheckCircle2, X, Phone, User 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentsPage() {
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [customerBalances, setCustomerBalances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cycleFilter, setCycleFilter] = useState('all'); // 'all' | 'weekly' | 'fortnightly' | 'monthly'
  const [loading, setLoading] = useState(true);

  // Modal State
  const [targetCust, setTargetCust] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('upi');
  const [payNotes, setPayNotes] = useState('');

  const [toast, setToast] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const customers = await dataService.getCustomers();
    const balances = [];

    for (const c of customers) {
      const lData = await dataService.getCustomerLedger(c.id);
      balances.push({
        customer: c,
        totalBilled: lData.totalBilled,
        totalPaid: lData.totalPaid,
        pendingBalance: lData.pendingBalance,
        billingCycle: c.billingCycle || 'monthly'
      });
    }

    setCustomerBalances(balances);
    setLoading(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!targetCust || !payAmount || Number(payAmount) <= 0) return;

    await dataService.addPayment({
      customerId: targetCust.customer.id,
      customerName: targetCust.customer.name,
      amount: Number(payAmount),
      paymentMode: payMode,
      date: new Date().toISOString().split('T')[0],
      notes: payNotes,
      type: 'tiffin_payment'
    });

    setTargetCust(null);
    setPayAmount('');
    setPayNotes('');
    setToast(lang === 'hi' ? 'भुगतान दर्ज हुआ!' : 'Payment received successfully.');
    setTimeout(() => setToast(''), 3000);
    loadData();
  };

  const filteredBalances = customerBalances.filter(item => {
    const matchesSearch = item.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.customer.mobile.includes(searchTerm);
    if (cycleFilter === 'all') return matchesSearch && item.pendingBalance > 0;
    return matchesSearch && item.pendingBalance > 0 && item.billingCycle === cycleFilter;
  });

  const totalPendingAll = customerBalances.reduce((sum, item) => sum + item.pendingBalance, 0);

  return (
    <div className="space-y-3 pb-24">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-4 right-4 z-50 bg-teal-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-teal-500 font-bold text-xs max-w-md mx-auto"
          >
            <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />
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
                {t('pendingPayments')}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {lang === 'hi' ? 'साप्ताहिक, 15-दिन एवं मासिक भुगतान रिमाइंडर' : 'Weekly, 15-Day & Monthly Payment Reminders'}
              </p>
            </div>
          </div>

          <div className="text-right bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">{t('pending')}</span>
            <span className="text-sm font-black text-amber-950">₹{totalPendingAll.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchCustomer')}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Billing Cycle Filter Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[10px] font-bold">
          {[
            { id: 'all', label: 'All Pending' },
            { id: 'weekly', label: 'Weekly (7D)' },
            { id: 'fortnightly', label: '15 Days' },
            { id: 'monthly', label: 'Monthly' }
          ].map((cTab) => (
            <button
              key={cTab.id}
              onClick={() => setCycleFilter(cTab.id)}
              className={`py-1.5 rounded-lg capitalize transition active-press ${
                cycleFilter === cTab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cTab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Balances List */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">
          Calculating balances...
        </div>
      ) : filteredBalances.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <p className="text-xs font-bold text-slate-600">No pending balances found for selected cycle.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredBalances.map((item) => (
            <motion.div
              key={item.customer.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {item.customer.name}
                    </h3>
                    <span className="text-[9px] font-black uppercase bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                      {item.billingCycle === 'daily' ? 'Daily (Per Day)' : item.billingCycle === 'single' ? 'Single Order' : item.billingCycle === 'weekly' ? 'Weekly (7D)' : item.billingCycle === 'fortnightly' ? '15 Days' : 'Monthly'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    📱 {item.customer.mobile} {item.customer.area ? `• 📍 ${item.customer.area}` : ''}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase block">{t('pending')}</span>
                  <span className={`text-base font-black ${item.pendingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    ₹{item.pendingBalance}
                  </span>
                </div>
              </div>

              {/* Financial Row */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200/70 font-semibold text-slate-600">
                <div>{t('totalBill')}: ₹{item.totalBilled}</div>
                <div>{t('paid')}: ₹{item.totalPaid}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTargetCust(item)}
                  className="py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active-press transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t('receivePayment')}</span>
                </button>

                {item.customer.mobile && (
                  <a
                    href={`https://wa.me/91${item.customer.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `नमस्ते ${item.customer.name} जी,\n\nMTC-LEDGER se aapka (${item.billingCycle === 'daily' ? 'Daily Tiffin' : item.billingCycle === 'single' ? 'Single Day Order' : item.billingCycle === 'weekly' ? 'Weekly 7-Day' : item.billingCycle === 'fortnightly' ? '15-Day' : 'Monthly'}) tiffin bill balance ₹${item.pendingBalance} baaki hai.\n\nKripya UPI / Cash dwara bhugtan karein.\nDhanyawad!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active-press transition"
                  >
                    <span>💬 WhatsApp Reminder</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment Entry Modal */}
      {targetCust && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 w-full max-w-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {t('receivePayment')}
                </h3>
                <p className="text-xs text-teal-700 font-bold">{targetCust.customer.name}</p>
              </div>
              <button
                onClick={() => setTargetCust(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs font-semibold">
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 flex justify-between">
                <span>Current Pending:</span>
                <span className="font-black">₹{targetCust.pendingBalance}</span>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('amount')} *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('paymentMode')}</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                  {['cash', 'upi', 'bank'].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPayMode(pm)}
                      className={`py-2 rounded-lg font-bold uppercase transition ${
                        payMode === pm
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('notes')}</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Optional note / UPI reference"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setTargetCust(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs active-press"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl text-xs active-press shadow-md"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
