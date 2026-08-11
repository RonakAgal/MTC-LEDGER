import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { 
  Sun, Moon, CheckCircle2, XCircle, Plus, Minus, Calendar, 
  Check, AlertCircle, RefreshCw, Search, Mic, MicOff, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseISO } from 'date-fns';

export default function DailyTiffinPage() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected meal tab: 'lunch' | 'dinner'
  const activeMeal = searchParams.get('meal') || 'lunch';

  // Date selection (default today YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [activeCustomers, setActiveCustomers] = useState([]);
  const [confirmations, setConfirmations] = useState({}); // { customerId: { status: 'confirmed'|'skipped', quantity: number } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Search & Voice Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate, activeMeal]);

  const setMealTab = (meal) => {
    setSearchParams({ meal });
  };

  const loadData = async () => {
    setLoading(true);
    // 1. Fetch all customers
    const allCust = await dataService.getCustomers();

    // Filter active customers who are NOT on pause today
    const validCustomers = allCust.filter(c => {
      if (c.status === 'inactive') return false;
      if (c.status === 'paused' && c.pauseFrom && c.pauseUntil) {
        try {
          const targetDate = parseISO(selectedDate);
          const pFrom = parseISO(c.pauseFrom);
          const pUntil = parseISO(c.pauseUntil);
          if (targetDate >= pFrom && targetDate <= pUntil) {
            return false; // Customer is on pause today
          }
        } catch (e) {
          console.warn("Pause date parse error", e);
        }
      }
      return true;
    });

    setActiveCustomers(validCustomers);

    // 2. Fetch existing confirmations for this date
    const existingRecords = await dataService.getDailyTiffinsByDate(selectedDate);
    const mealRecords = existingRecords.filter(r => r.meal === activeMeal);

    const initialConfirmMap = {};
    validCustomers.forEach(c => {
      const existing = mealRecords.find(r => r.customerId === c.id);
      const defaultPrice = activeMeal === 'lunch' ? (c.lunchPrice || 80) : (c.dinnerPrice || 80);

      if (existing) {
        initialConfirmMap[c.id] = {
          status: existing.status,
          quantity: existing.quantity || c.defaultQty || 1,
          customPrice: existing.priceAtTime || defaultPrice
        };
      } else {
        initialConfirmMap[c.id] = {
          status: null,
          quantity: c.defaultQty || 1,
          customPrice: defaultPrice
        };
      }
    });

    setConfirmations(initialConfirmMap);
    setLoading(false);
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToastMessage(lang === 'hi' ? 'आवाज से खोजें (Voice Search) सपोर्टेड नहीं है' : 'Voice Search not supported in browser.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setToastMessage(lang === 'hi' ? '🎙️ बोलिए... (Listening...)' : '🎙️ Speak customer name...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript.replace(/\./g, ''));
        setIsListening(false);
        setToastMessage(`🔍 "${transcript}"`);
        setTimeout(() => setToastMessage(''), 2500);
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

  const handleStatusToggle = (customerId, newStatus) => {
    setConfirmations(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        status: prev[customerId]?.status === newStatus ? null : newStatus
      }
    }));
  };

  const handleQtyChange = (customerId, delta) => {
    setConfirmations(prev => {
      const currentQty = prev[customerId]?.quantity || 1;
      const newQty = Math.max(1, currentQty + delta);
      return {
        ...prev,
        [customerId]: {
          ...prev[customerId],
          quantity: newQty
        }
      };
    });
  };

  const handleCustomPriceChange = (customerId, newPrice) => {
    setConfirmations(prev => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        customPrice: newPrice
      }
    }));
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    const confirmationList = activeCustomers
      .filter(c => confirmations[c.id]?.status !== null && confirmations[c.id]?.status !== undefined)
      .map(c => {
        const conf = confirmations[c.id];
        const defaultPrice = activeMeal === 'lunch' ? (c.lunchPrice || 80) : (c.dinnerPrice || 80);
        const price = Number(conf.customPrice) >= 0 ? Number(conf.customPrice) : defaultPrice;
        return {
          customerId: c.id,
          customerName: c.name,
          status: conf.status,
          quantity: conf.quantity,
          priceAtTime: price,
          amount: conf.status === 'confirmed' ? (conf.quantity * price) : 0
        };
      });

    await dataService.saveDailyTiffinConfirmations(selectedDate, activeMeal, confirmationList);
    setSaving(false);

    const msg = activeMeal === 'lunch' 
      ? (lang === 'hi' ? 'लंच एंट्री सफलतापूर्वक सहेजी गई!' : 'Lunch entries saved successfully.')
      : (lang === 'hi' ? 'डिनर एंट्री सफलतापूर्वक सहेजी गई!' : 'Dinner entries saved successfully.');
    
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Calculations for sticky bottom bar
  const confirmedCount = Object.values(confirmations).filter(c => c.status === 'confirmed').length;
  const skippedCount = Object.values(confirmations).filter(c => c.status === 'skipped').length;
  const totalCustomers = activeCustomers.length;

  // Filtered customer list by Search Term
  const filteredCustomers = activeCustomers.filter(cust => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      cust.name.toLowerCase().includes(term) ||
      cust.mobile.includes(term) ||
      (cust.area && cust.area.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-3 pb-28">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-4 right-4 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-500 font-bold text-xs max-w-md mx-auto"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date Header, Meal Selector & Voice Search Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 space-y-3">
        {/* Date Selector Row */}
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200/80">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? 'दिनांक चुनिए:' : 'Date:'}</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Meal Tabs (🌅 LUNCH vs 🌆 DINNER) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setMealTab('lunch')}
            className={`py-2.5 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all duration-150 active-press ${
              activeMeal === 'lunch'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>🌅 {lang === 'hi' ? 'आज का लंच' : 'LUNCH'}</span>
          </button>

          <button
            onClick={() => setMealTab('dinner')}
            className={`py-2.5 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all duration-150 active-press ${
              activeMeal === 'dinner'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>🌆 {lang === 'hi' ? 'आज का डिनर' : 'DINNER'}</span>
          </button>
        </div>

        {/* Customer Search Bar with Voice Mic Audio Button */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'hi' ? 'नाम, मोबाइल या इलाका से खोजें...' : 'Search customer by name or area...'}
            className="w-full pl-9 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
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
      </div>

      {/* Customer Confirmation List */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
          <p>{lang === 'hi' ? 'ग्राहक सूची लोड हो रही है...' : 'Loading active customer register...'}</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-xs font-bold text-slate-700">
            {searchTerm 
              ? (lang === 'hi' ? `"${searchTerm}" नाम का कोई ग्राहक नहीं मिला` : `No customers matching "${searchTerm}"`)
              : (lang === 'hi' ? 'कोई सक्रिय ग्राहक उपलब्ध नहीं है' : 'No active customers found for this date.')}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
            >
              {lang === 'hi' ? 'खोज साफ़ करें (Clear Search)' : 'Clear Search'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((cust) => {
            const conf = confirmations[cust.id] || { status: null, quantity: cust.defaultQty || 1 };
            const currentPrice = activeMeal === 'lunch' ? (cust.lunchPrice || 80) : (cust.dinnerPrice || 80);
            const totalItemAmount = conf.quantity * currentPrice;

            const isConfirmed = conf.status === 'confirmed';
            const isSkipped = conf.status === 'skipped';

            return (
              <motion.div
                key={cust.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                  isConfirmed 
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-1 ring-emerald-400/50' 
                    : isSkipped 
                    ? 'border-rose-300 bg-rose-50/10 opacity-75' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header: Customer Name & Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                      {cust.name}
                    </h4>
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>📱 {cust.mobile}</span>
                      {cust.area && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600">{cust.area}</span>}
                    </div>
                  </div>

                  {/* Editable Rate Per Tiffin Input Box */}
                  <div className="text-right flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 pl-1">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={conf.customPrice ?? currentPrice}
                      onChange={(e) => handleCustomPriceChange(cust.id, e.target.value)}
                      title="Change rate for today (1-day special rate)"
                      className="w-14 px-1 py-0.5 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] font-bold text-slate-500 pr-1">/{activeMeal === 'lunch' ? 'Lunch' : 'Dinner'}</span>
                  </div>
                </div>

                {/* Stepper Quantity row */}
                <div className="flex items-center justify-between my-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600">
                    {lang === 'hi' ? 'टिफिन संख्या (Quantity):' : 'Quantity:'}
                  </span>

                  <div className="flex items-center space-x-3 bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button
                      onClick={() => handleQtyChange(cust.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center shadow-xs active-press hover:bg-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-sm font-black text-slate-900 px-1.5 min-w-[20px] text-center">
                      {conf.quantity}
                    </span>

                    <button
                      onClick={() => handleQtyChange(cust.id, 1)}
                      className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shadow-xs active-press hover:bg-emerald-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Large Action Buttons (YES ✅ / NO ❌) */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => handleStatusToggle(cust.id, 'confirmed')}
                    className={`py-3 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all active-press ${
                      isConfirmed
                        ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-600'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isConfirmed ? 'text-white' : 'text-emerald-600'}`} />
                    <span>{t('yes')}</span>
                    {isConfirmed && <span className="text-[10px] font-extrabold bg-emerald-800 px-1.5 py-0.5 rounded text-white ml-0.5">₹{totalItemAmount}</span>}
                  </button>

                  <button
                    onClick={() => handleStatusToggle(cust.id, 'skipped')}
                    className={`py-3 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all active-press ${
                      isSkipped
                        ? 'bg-rose-600 text-white shadow-lg ring-2 ring-rose-600'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <XCircle className={`w-4 h-4 ${isSkipped ? 'text-white' : 'text-rose-600'}`} />
                    <span>{t('no')}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Sticky Floating Bottom Summary & Confirmation Card */}
      <div className="fixed bottom-16 left-0 right-0 z-30 px-3 pb-1.5 pointer-events-none">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-2xl p-3 space-y-2 pointer-events-auto">
          {/* Summary Pill Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Confirmed Pill */}
            <div className="flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 py-1 px-1.5 rounded-xl text-[11px] font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{lang === 'hi' ? 'कन्फर्म' : 'Confirmed'}</span>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md ml-0.5 min-w-[18px]">
                {confirmedCount}
              </span>
            </div>

            {/* Skipped Pill */}
            <div className="flex items-center justify-center gap-1.5 bg-rose-50 border border-rose-200/80 text-rose-800 py-1 px-1.5 rounded-xl text-[11px] font-extrabold">
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{lang === 'hi' ? 'नहीं चाहिए' : 'Skipped'}</span>
              <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md ml-0.5 min-w-[18px]">
                {skippedCount}
              </span>
            </div>

            {/* Total Pill */}
            <div className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 py-1 px-1.5 rounded-xl text-[11px] font-extrabold">
              <span>{lang === 'hi' ? 'कुल' : 'Total'}</span>
              <span className="bg-slate-800 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md ml-0.5 min-w-[18px]">
                {totalCustomers}
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmSave}
            disabled={saving || totalCustomers === 0}
            className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active-press transition-all duration-150 ${
              activeMeal === 'lunch'
                ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-600/20'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span className="tracking-wide">
              {saving
                ? 'Saving...'
                : activeMeal === 'lunch'
                ? (lang === 'hi' ? '🍱 आज का लंच हिसाब सहेजें' : 'Confirm & Save Lunch')
                : (lang === 'hi' ? '🌆 आज का डिनर हिसाब सहेजें' : 'Confirm & Save Dinner')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
