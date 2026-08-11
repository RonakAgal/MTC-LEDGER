import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { 
  CalendarDays, Plus, Search, MapPin, Users, Phone, Clock, 
  CreditCard, CheckCircle2, X, ChevronRight, Utensils, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CateringPage() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'cancelled' | 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Order Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    eventName: '',
    eventType: 'Birthday',
    eventDate: new Date().toISOString().split('T')[0],
    eventTime: '19:00',
    venue: '',
    plates: '',
    ratePerPlate: '',
    pooriKg: '',
    ratePerKg: '',
    menu: '',
    extraCharges: 0,
    discount: 0,
    advancePaid: 0,
    notes: ''
  });

  // Receive Payment Modal State
  const [payTarget, setPayTarget] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('upi');
  const [payNotes, setPayNotes] = useState('');

  const [toast, setToast] = useState('');

  useEffect(() => {
    loadOrders();
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const loadOrders = async () => {
    setLoading(true);
    const list = await dataService.getCateringOrders();
    setOrders(list);
    setLoading(false);
  };

  // Calculations for Add Form
  const plateSubtotal = (Number(formData.plates) || 0) * (Number(formData.ratePerPlate) || 0);
  const kgSubtotal = (Number(formData.pooriKg) || 0) * (Number(formData.ratePerKg) || 0);
  const subtotal = plateSubtotal + kgSubtotal;
  const totalAmount = Math.max(0, subtotal + (Number(formData.extraCharges) || 0) - (Number(formData.discount) || 0));
  const balanceDue = Math.max(0, totalAmount - (Number(formData.advancePaid) || 0));

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobile || !formData.eventName) return;

    await dataService.addCateringOrder({
      ...formData,
      subtotal,
      totalAmount,
      balanceDue,
      status: 'confirmed'
    });

    setShowAddModal(false);
    setToast(lang === 'hi' ? 'कैटरिंग बुकिंग सहेजी गई!' : 'Catering order saved successfully.');
    setTimeout(() => setToast(''), 3000);
    loadOrders();
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payTarget || !payAmount || Number(payAmount) <= 0) return;

    await dataService.addCateringPayment(
      payTarget.id,
      Number(payAmount),
      payMode,
      payNotes,
      new Date().toISOString().split('T')[0]
    );

    setPayTarget(null);
    setPayAmount('');
    setPayNotes('');
    setToast(lang === 'hi' ? 'कैटरिंग भुगतान दर्ज हुआ!' : 'Catering payment recorded.');
    setTimeout(() => setToast(''), 3000);
    loadOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await dataService.updateCateringStatus(orderId, newStatus);
    setToast(lang === 'hi' ? 'ऑर्डर स्थिति अपडेट हुई!' : 'Catering order status updated.');
    setTimeout(() => setToast(''), 3000);
    loadOrders();
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.mobile.includes(searchTerm);

    if (activeTab === 'upcoming') {
      return matchesSearch && (o.status === 'confirmed' || o.status === 'preparing' || o.status === 'inquiry');
    }
    if (activeTab === 'completed') {
      return matchesSearch && o.status === 'completed';
    }
    if (activeTab === 'cancelled') {
      return matchesSearch && o.status === 'cancelled';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-3 pb-24">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-4 right-4 z-50 bg-purple-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-purple-500 font-bold text-xs max-w-md mx-auto"
          >
            <CheckCircle2 className="w-5 h-5 text-purple-300 shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {t('cateringOrders')}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {orders.length} {t('orders')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md active-press transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addCateringOrder')}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search catering by customer or event name..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Catering Tabs (Upcoming, Completed, Cancelled, Calendar) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
          {['upcoming', 'completed', 'cancelled', 'calendar'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 rounded-lg capitalize transition active-press ${
                activeTab === tab
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'upcoming' ? t('upcoming') : tab === 'completed' ? t('completed') : tab === 'cancelled' ? t('cancelled') : 'Calendar'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View Tab */}
      {activeTab === 'calendar' ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            🗓️ Catering Booking Calendar View
          </h3>

          <div className="space-y-2">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-extrabold text-purple-950 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-purple-700" />
                    <span>{ord.eventDate} ({ord.eventTime})</span>
                  </div>
                  <div className="font-bold text-slate-800 mt-0.5">{ord.customerName} - {ord.eventName}</div>
                  <div className="text-[11px] text-slate-500">{ord.plates} Plates • ₹{ord.totalAmount} Total</div>
                </div>

                <span className="text-[10px] font-extrabold bg-purple-200 text-purple-900 px-2 py-1 rounded-lg uppercase">
                  {ord.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Catering Orders List */
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-500">
              Loading catering orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <AlertCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No catering orders found.</p>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <motion.div
                key={ord.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      {ord.eventName}
                    </h3>
                    <p className="text-xs font-bold text-purple-700 flex items-center gap-1 mt-0.5">
                      👤 {ord.customerName} • 📱 {ord.mobile}
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={ord.status}
                    onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                    className="text-[11px] font-extrabold bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 uppercase text-slate-800"
                  >
                    <option value="inquiry">Inquiry</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Event Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
                    <span>{ord.eventDate} ({ord.eventTime})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>{ord.plates} Plates (@₹{ord.ratePerPlate})</span>
                  </div>
                  {Number(ord.pooriKg) > 0 && (
                    <div className="col-span-2 font-bold text-amber-900 bg-amber-100/60 px-2 py-1 rounded-lg flex items-center justify-between border border-amber-200">
                      <span>🌾 Poori Quantity: {ord.pooriKg} KG</span>
                      <span>@ ₹{ord.ratePerKg || 0}/KG</span>
                    </div>
                  )}
                  {ord.venue && (
                    <div className="col-span-2 flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      <span>{ord.venue}</span>
                    </div>
                  )}
                </div>

                {ord.menu && (
                  <p className="text-xs text-slate-700 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                    <strong className="text-amber-900">Menu:</strong> {ord.menu}
                  </p>
                )}

                {/* Billing Summary Row */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-1 border-t border-slate-100">
                  <div className="bg-slate-100 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase block">{t('totalAmount')}</span>
                    ₹{ord.totalAmount}
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl text-emerald-900">
                    <span className="text-[10px] text-emerald-700 uppercase block">{t('advancePaid')}</span>
                    ₹{ord.advancePaid}
                  </div>
                  <div className="bg-amber-50 p-2 rounded-xl text-amber-900">
                    <span className="text-[10px] text-amber-700 uppercase block">{t('balanceDue')}</span>
                    ₹{ord.balanceDue}
                  </div>
                </div>

                {/* Action Buttons */}
                {ord.balanceDue > 0 && (
                  <button
                    onClick={() => setPayTarget(ord)}
                    className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active-press transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{t('receivePayment')} (Balance: ₹{ord.balanceDue})</span>
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Add Catering Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {t('addCateringOrder')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">{t('customerName')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Sanjay Kapoor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('mobileNumber')} *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('eventName')} *</label>
                <input
                  type="text"
                  required
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  placeholder="e.g. Birthday Party Dinner"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">{t('eventDate')} *</label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('eventTime')}</label>
                  <input
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('venue')}</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Community Hall, Sector 7"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">
                    {t('plates')} ({lang === 'hi' ? 'ऐच्छिक' : 'Optional'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.plates}
                    onChange={(e) => setFormData({ ...formData, plates: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">
                    {t('ratePerPlate')} ({lang === 'hi' ? 'ऐच्छिक' : 'Optional'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.ratePerPlate}
                    onChange={(e) => setFormData({ ...formData, ratePerPlate: e.target.value })}
                    placeholder="e.g. 200"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              {/* Poori (KG) & Bulk Order Fields (Optional) */}
              <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 space-y-2">
                <div className="text-xs font-extrabold text-amber-900 flex items-center justify-between">
                  <span>🌾 {lang === 'hi' ? 'पूड़ी (किलो में) / KG ऑर्डर (ऐच्छिक)' : 'Poori (in KG) / Bulk Order (Optional)'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 text-[11px] font-semibold mb-1">
                      {lang === 'hi' ? 'पूड़ी मात्रा (KG)' : 'Poori Quantity (KG)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.pooriKg}
                      onChange={(e) => setFormData({ ...formData, pooriKg: e.target.value })}
                      placeholder="e.g. 15 kg"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-[11px] font-semibold mb-1">
                      {lang === 'hi' ? 'रेट प्रति KG (₹)' : 'Rate Per KG (₹)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ratePerKg}
                      onChange={(e) => setFormData({ ...formData, ratePerKg: e.target.value })}
                      placeholder="e.g. 300"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('menu')}</label>
                <textarea
                  rows="2"
                  value={formData.menu}
                  onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                  placeholder="Paneer Butter Masala, Dal Makhani, Naan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">{t('extraCharges')}</label>
                  <input
                    type="number"
                    value={formData.extraCharges}
                    onChange={(e) => setFormData({ ...formData, extraCharges: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('discount')}</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('advancePaid')}</label>
                  <input
                    type="number"
                    value={formData.advancePaid}
                    onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              {/* Automatic Financial Breakdown Display */}
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 space-y-1 font-bold">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-purple-900 text-sm">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-amber-800 text-xs">
                  <span>Balance Due:</span>
                  <span>₹{balanceDue}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs active-press"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-700 text-white font-bold rounded-xl text-xs active-press shadow-md"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Receive Catering Payment Modal */}
      {payTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 w-full max-w-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Catering Payment
                </h3>
                <p className="text-xs text-purple-700 font-bold">{payTarget.eventName}</p>
              </div>
              <button
                onClick={() => setPayTarget(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs font-semibold">
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 flex justify-between">
                <span>Remaining Balance:</span>
                <span className="font-black">₹{payTarget.balanceDue}</span>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('amount')} *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={payTarget.balanceDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
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
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayTarget(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs active-press"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-700 text-white font-bold rounded-xl text-xs active-press shadow-md"
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
