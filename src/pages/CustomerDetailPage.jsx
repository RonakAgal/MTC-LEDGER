import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { 
  ArrowLeft, Phone, MapPin, Calendar, CreditCard, FileText, 
  PauseCircle, PlayCircle, Edit3, DollarSign, CheckCircle2, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [ledgerData, setLedgerData] = useState({
    totalBilled: 0,
    totalPaid: 0,
    pendingBalance: 0,
    history: [],
    lunchCount: 0,
    dinnerCount: 0,
    totalTiffins: 0
  });

  const [loading, setLoading] = useState(true);

  // Receive Payment Modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('cash');
  const [payNotes, setPayNotes] = useState('');

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const [toast, setToast] = useState('');

  useEffect(() => {
    loadCustomerDetails();
  }, [id]);

  const loadCustomerDetails = async () => {
    setLoading(true);
    const customers = await dataService.getCustomers();
    const target = customers.find(c => c.id === id);

    if (target) {
      setCustomer(target);
      setEditForm(target);
      const lData = await dataService.getCustomerLedger(target.id);
      setLedgerData(lData);
    }
    setLoading(false);
  };

  const handleReceivePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    await dataService.addPayment({
      customerId: customer.id,
      customerName: customer.name,
      amount: Number(payAmount),
      paymentMode: payMode,
      date: new Date().toISOString().split('T')[0],
      notes: payNotes,
      type: 'tiffin_payment'
    });

    setShowPayModal(false);
    setPayAmount('');
    setPayNotes('');
    setToast(lang === 'hi' ? 'भुगतान दर्ज किया गया!' : 'Payment received successfully.');
    setTimeout(() => setToast(''), 3000);
    loadCustomerDetails();
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    await dataService.updateCustomer(customer.id, editForm);
    setShowEditModal(false);
    setToast(lang === 'hi' ? 'ग्राहक जानकारी अपडेट हुई!' : 'Customer details updated.');
    setTimeout(() => setToast(''), 3000);
    loadCustomerDetails();
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs font-semibold text-slate-500">
        {lang === 'hi' ? 'लोड हो रहा है...' : 'Loading customer profile...'}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-12 text-center text-xs font-semibold text-slate-500 space-y-3">
        <p>{lang === 'hi' ? 'ग्राहक नहीं मिला।' : 'Customer not found.'}</p>
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
        >
          {lang === 'hi' ? 'वापस जाएँ' : 'Back to Customers'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
      {/* Toast Alert */}
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

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/customers')}
            className="flex items-center gap-1 text-slate-600 text-xs font-bold hover:text-slate-900 active-press"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'वापस' : 'Back'}</span>
          </button>

          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
            customer.status === 'active' 
              ? 'bg-emerald-100 text-emerald-800' 
              : customer.status === 'paused' 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {customer.status}
          </span>
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-900">
            {customer.name}
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mt-1">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {customer.mobile}
            </span>
            {customer.area && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {customer.area}
              </span>
            )}
          </div>
        </div>

        {customer.address && (
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 font-medium">
            📍 {customer.address} {customer.landmark ? `(Near ${customer.landmark})` : ''}
          </p>
        )}

        {/* Pricing Info Row */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-1">
          <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-900">
            <span className="text-[10px] uppercase text-amber-700 block">Lunch</span>
            ₹{customer.lunchPrice}
          </div>
          <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-200 text-indigo-900">
            <span className="text-[10px] uppercase text-indigo-700 block">Dinner</span>
            ₹{customer.dinnerPrice}
          </div>
          <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 text-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block">Default Qty</span>
            {customer.defaultQty}
          </div>
        </div>
      </div>

      {/* Monthly Summary Metrics Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
            {t('thisMonth')} {lang === 'hi' ? 'का बहीखाता' : 'Summary'}
          </h3>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-emerald-300">
            Confirmed Only
          </span>
        </div>

        {/* Counts Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/10 p-2 rounded-xl">
            <span className="text-[10px] text-slate-300 block">Lunch</span>
            <span className="text-lg font-black text-amber-300">{ledgerData.lunchCount}</span>
          </div>
          <div className="bg-white/10 p-2 rounded-xl">
            <span className="text-[10px] text-slate-300 block">Dinner</span>
            <span className="text-lg font-black text-indigo-300">{ledgerData.dinnerCount}</span>
          </div>
          <div className="bg-white/10 p-2 rounded-xl">
            <span className="text-[10px] text-slate-300 block">Total Tiffins</span>
            <span className="text-lg font-black text-emerald-300">{ledgerData.totalTiffins}</span>
          </div>
        </div>

        {/* Billing Financial Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/80 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">{t('totalBill')}</span>
            <span className="text-sm font-black text-white">₹{ledgerData.totalBilled}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">{t('paid')}</span>
            <span className="text-sm font-black text-emerald-400">₹{ledgerData.totalPaid}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">{t('pending')}</span>
            <span className="text-sm font-black text-amber-400">₹{ledgerData.pendingBalance}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setShowPayModal(true)}
          className="py-3 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md active-press transition"
        >
          <CreditCard className="w-4 h-4" />
          <span>{t('receivePayment')}</span>
        </button>

        <button
          onClick={() => setShowEditModal(true)}
          className="py-3 px-2 bg-white text-slate-800 border border-slate-200 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs hover:border-slate-300 active-press transition"
        >
          <Edit3 className="w-4 h-4 text-slate-600" />
          <span>{t('edit')}</span>
        </button>

        <button
          onClick={() => navigate(`/more/ledger?customerId=${customer.id}`)}
          className="py-3 px-2 bg-white text-slate-800 border border-slate-200 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xs hover:border-slate-300 active-press transition"
        >
          <FileText className="w-4 h-4 text-slate-600" />
          <span>{t('viewLedger')}</span>
        </button>
      </div>

      {/* Customer Recent Statement History */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {lang === 'hi' ? 'हाल का लेन-देन इतिहास (Recent Ledger)' : 'Recent Ledger History'}
        </h3>

        {ledgerData.history.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            {lang === 'hi' ? 'कोई लेन-देन रिकॉर्ड नहीं है।' : 'No transaction records found.'}
          </div>
        ) : (
          <div className="space-y-2">
            {ledgerData.history.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{item.description}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                </div>

                <div className="text-right font-black">
                  {item.debit > 0 && (
                    <span className="text-slate-900 block">+₹{item.debit}</span>
                  )}
                  {item.credit > 0 && (
                    <span className="text-emerald-600 block">-₹{item.credit}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receive Payment Modal */}
      {showPayModal && (
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
                <p className="text-xs text-emerald-700 font-bold">{customer.name}</p>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceivePayment} className="space-y-3 text-xs font-semibold">
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 flex justify-between">
                <span>{t('pending')} Balance:</span>
                <span className="font-black">₹{ledgerData.pendingBalance}</span>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('amount')} *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount received"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          ? 'bg-emerald-600 text-white shadow-xs'
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
                  placeholder="e.g. PhonePe / Cash received by Rahul"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs active-press"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs active-press shadow-md"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Customer Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {t('edit')} Customer Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">{t('customerName')}</label>
                <input
                  type="text"
                  required
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('mobileNumber')}</label>
                <input
                  type="tel"
                  required
                  value={editForm.mobile || ''}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">{t('lunchPrice')} (₹)</label>
                  <input
                    type="number"
                    value={editForm.lunchPrice || 80}
                    onChange={(e) => setEditForm({ ...editForm, lunchPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('dinnerPrice')} (₹)</label>
                  <input
                    type="number"
                    value={editForm.dinnerPrice || 80}
                    onChange={(e) => setEditForm({ ...editForm, dinnerPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  {lang === 'hi' ? 'ऑर्डर / भुगतान प्रकार (Billing Type)' : 'Billing / Order Type'}
                </label>
                <select
                  value={editForm.billingCycle || 'daily'}
                  onChange={(e) => setEditForm({ ...editForm, billingCycle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option value="daily">🍱 Daily / Per Tiffin (रोजाना)</option>
                  <option value="single">⚡ Single Day / 1-Day (1-दिन)</option>
                  <option value="weekly">📅 7 Days (Weekly / साप्ताहिक)</option>
                  <option value="fortnightly">📅 15 Days (Bi-Weekly / 15-दिन)</option>
                  <option value="monthly">📅 30 Days (Monthly / मासिक)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('status')}</label>
                <select
                  value={editForm.status || 'active'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium capitalize"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs active-press"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs active-press shadow-md"
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
