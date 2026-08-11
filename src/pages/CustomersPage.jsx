import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { 
  Users, Search, UserPlus, Phone, MapPin, PauseCircle, PlayCircle, 
  ChevronRight, X, Calendar, DollarSign, FileText, CheckCircle2,
  Mic, MicOff 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomersPage() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'paused' | 'inactive' | 'all'
  const [loading, setLoading] = useState(true);

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToast(lang === 'hi' ? 'आवाज़ से खोजें (Voice Search) उपलब्ध नहीं है' : 'Voice Search not supported in browser.');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setToast(lang === 'hi' ? '🎙️ बोलिए... (Listening...)' : '🎙️ Speak customer name...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript.replace(/\./g, ''));
        setIsListening(false);
        setToast(`🔍 "${transcript}"`);
        setTimeout(() => setToast(''), 2500);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Voice search error", e);
      setIsListening(false);
    }
  };

  // Add Customer Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    area: '',
    landmark: '',
    lunchPrice: 80,
    dinnerPrice: 80,
    defaultQty: 1,
    billingCycle: 'daily', // 'daily' | 'single' | 'weekly' | 'fortnightly' | 'monthly'
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Pause Customer Modal state
  const [pauseTarget, setPauseTarget] = useState(null);
  const [pauseFrom, setPauseFrom] = useState(new Date().toISOString().split('T')[0]);
  const [pauseUntil, setPauseUntil] = useState('');

  const [toast, setToast] = useState('');

  useEffect(() => {
    loadCustomers();
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const loadCustomers = async () => {
    setLoading(true);
    const list = await dataService.getCustomers();
    setCustomers(list);
    setLoading(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return;

    await dataService.addCustomer(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      mobile: '',
      address: '',
      area: '',
      landmark: '',
      lunchPrice: 80,
      dinnerPrice: 80,
      defaultQty: 1,
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    });

    setToast(lang === 'hi' ? 'नया ग्राहक सफलतापूर्वक जोड़ा गया!' : 'Customer added successfully.');
    setTimeout(() => setToast(''), 3000);
    loadCustomers();
  };

  const handlePauseSubmit = async (e) => {
    e.preventDefault();
    if (!pauseTarget || !pauseFrom || !pauseUntil) return;

    await dataService.pauseCustomer(pauseTarget.id, pauseFrom, pauseUntil);
    setPauseTarget(null);
    setToast(lang === 'hi' ? 'ग्राहक टिफिन रोक दिया गया (Paused).' : 'Customer paused successfully.');
    setTimeout(() => setToast(''), 3000);
    loadCustomers();
  };

  const handleUnpause = async (id) => {
    await dataService.unpauseCustomer(id);
    setToast(lang === 'hi' ? 'ग्राहक पुनः चालू (Active) हो गया!' : 'Customer resumed successfully.');
    setTimeout(() => setToast(''), 3000);
    loadCustomers();
  };

  // Filtering
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.mobile.includes(searchTerm) ||
                          (c.area && c.area.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && c.status === statusFilter;
  });

  return (
    <div className="space-y-3 pb-20">
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
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {t('customers')}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {customers.length} {t('totalCustomers')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md active-press transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('addCustomer')}</span>
          </button>
        </div>

        {/* Search Bar with Voice Mic Audio Button */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchCustomer')}
            className="w-full pl-9 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />

          <div className="absolute right-2 top-1.5 flex items-center gap-1">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-lg text-white text-xs font-bold transition-all active-press flex items-center justify-center ${
                isListening
                  ? 'bg-rose-600 animate-pulse ring-2 ring-rose-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-xs'
              }`}
              title={lang === 'hi' ? 'बोलकर खोजें (Voice Search)' : 'Voice Search (Speak Name)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 animate-bounce" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
          {['active', 'paused', 'inactive', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`py-1.5 rounded-lg capitalize transition active-press ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st === 'active' ? t('active') : st === 'paused' ? t('paused') : st === 'inactive' ? t('inactive') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">
          {lang === 'hi' ? 'ग्राहक सूची लोड हो रही है...' : 'Loading customer list...'}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <p className="text-xs font-bold text-slate-600">
            {lang === 'hi' ? 'कोई ग्राहक नहीं मिला' : 'No customers found matching filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCustomers.map((cust) => (
            <motion.div
              key={cust.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(`/customers/${cust.id}`)}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 hover:border-emerald-300 active-press cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {cust.name}
                  </h3>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    cust.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : cust.status === 'paused' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cust.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {cust.mobile}
                  </span>
                  {cust.area && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {cust.area}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 pt-0.5">
                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Lunch: ₹{cust.lunchPrice}
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Dinner: ₹{cust.dinnerPrice}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {cust.status === 'paused' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnpause(cust.id);
                    }}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active-press"
                    title={t('unpause')}
                  >
                    <PlayCircle className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPauseTarget(cust);
                    }}
                    className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 active-press"
                    title={t('pauseCustomer')}
                  >
                    <PauseCircle className="w-4 h-4" />
                  </button>
                )}

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {t('addCustomer')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">{t('customerName')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('mobileNumber')} *</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('address')}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House No, Apartment, Street"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">{t('area')}</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Area / Sector"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('landmark')}</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="Near Temple / Bank"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">{t('lunchPrice')} *</label>
                  <input
                    type="number"
                    required
                    value={formData.lunchPrice}
                    onChange={(e) => setFormData({ ...formData, lunchPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('dinnerPrice')} *</label>
                  <input
                    type="number"
                    required
                    value={formData.dinnerPrice}
                    onChange={(e) => setFormData({ ...formData, dinnerPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('defaultQty')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.defaultQty}
                    onChange={(e) => setFormData({ ...formData, defaultQty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('startDate')}</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('notes')}</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Preferences, extra roti, less oil..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs active-press shadow-md"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Pause Customer Modal */}
      {pauseTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 w-full max-w-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {t('pauseCustomer')}
                </h3>
                <p className="text-xs text-amber-700 font-bold">{pauseTarget.name}</p>
              </div>
              <button
                onClick={() => setPauseTarget(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePauseSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">{t('pauseFrom')} *</label>
                <input
                  type="date"
                  required
                  value={pauseFrom}
                  onChange={(e) => setPauseFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('pauseUntil')} *</label>
                <input
                  type="date"
                  required
                  value={pauseUntil}
                  onChange={(e) => setPauseUntil(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <p className="text-[11px] text-slate-500 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                {lang === 'hi'
                  ? 'रोक (Pause) के दौरान यह ग्राहक दैनिक लंच/डिनर सूची में दिखाई नहीं देगा और कोई चार्ज नहीं लगेगा।'
                  : 'During pause, customer will not appear in daily lunch/dinner register and no charges will apply.'}
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPauseTarget(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs active-press"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl text-xs active-press shadow-md"
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
