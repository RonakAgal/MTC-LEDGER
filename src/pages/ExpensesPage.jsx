import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { 
  PlusCircle, Trash2, ArrowLeft, Calendar, Tag, CreditCard, 
  CheckCircle2, X, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EXPENSE_CATEGORIES = [
  'Sabzi', 'Doodh', 'Gas', 'Oil', 'Rice', 'Dal', 
  'Flour', 'Masala', 'Packing', 'Petrol', 'Delivery', 
  'Labour', 'Salary', 'Electricity', 'Rent', 'Other'
];

export default function ExpensesPage() {
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Sabzi',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'cash'
  });

  const [toast, setToast] = useState('');

  useEffect(() => {
    loadExpenses();
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
    }
  }, [selectedDate, searchParams]);

  const loadExpenses = async () => {
    setLoading(true);
    const list = await dataService.getExpenses();
    setExpenses(list);
    setLoading(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    const finalCategory = formData.category === 'Other' && customCategory.trim() 
      ? customCategory.trim() 
      : formData.category;

    await dataService.addExpense({
      ...formData,
      category: finalCategory,
      amount: Number(formData.amount)
    });

    setShowAddModal(false);
    setCustomCategory('');
    setFormData({
      amount: '',
      category: 'Sabzi',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'cash'
    });

    setToast(lang === 'hi' ? 'खर्चा जोड़ा गया!' : 'Expense added successfully.');
    setTimeout(() => setToast(''), 3000);
    loadExpenses();
  };

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'hi' ? 'क्या आप इस खर्चे को हटाना चाहते हैं?' : 'Are you sure you want to delete this expense entry?')) {
      await dataService.deleteExpense(id);
      setToast(lang === 'hi' ? 'खर्चा हटा दिया गया!' : 'Expense deleted.');
      setTimeout(() => setToast(''), 3000);
      loadExpenses();
    }
  };

  const filteredExpenses = expenses.filter(e => e.date === selectedDate);
  const totalExpenseToday = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-3 pb-24">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-4 right-4 z-50 bg-rose-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-rose-500 font-bold text-xs max-w-md mx-auto"
          >
            <CheckCircle2 className="w-5 h-5 text-rose-300 shrink-0" />
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
                {t('todayExpense')}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {lang === 'hi' ? 'दैनिक व्यापार खर्चे' : 'Daily Business Expenses'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md active-press transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addExpense')}</span>
          </button>
        </div>

        {/* Date Row & Today's Total */}
        <div className="flex items-center justify-between bg-rose-50 p-2.5 rounded-xl border border-rose-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-rose-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
            />
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">{t('totalExpenseToday')}</span>
            <span className="text-base font-black text-rose-950">₹{totalExpenseToday.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Expense List */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-500">
          Loading expenses...
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">
            {lang === 'hi' ? 'इस तिथि के लिए कोई खर्चा नहीं जोड़ा गया है।' : 'No expense recorded for this date.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((exp) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {exp.category}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-slate-500">
                    ({exp.paymentMode})
                  </span>
                </div>
                {exp.description && (
                  <p className="text-xs text-slate-600 font-medium">
                    {exp.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm font-black text-rose-700">
                  ₹{exp.amount}
                </span>

                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 active-press transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 w-full max-w-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {t('addExpense')}
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
                <label className="block text-slate-700 mb-1">{t('amount')} *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 700"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('category')} *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {formData.category === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1"
                >
                  <label className="block text-slate-700 text-xs font-bold">
                    {lang === 'hi' ? 'कस्टम कैटगरी नाम (Custom Category Name) *' : 'Custom Category Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Mandi Auto, Dahi, Pooja Goods"
                    className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-xl text-sm font-bold text-rose-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-slate-700 mb-1">{t('paymentMode')}</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                  {['cash', 'upi', 'bank'].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMode: pm })}
                      className={`py-2 rounded-lg font-bold uppercase transition ${
                        formData.paymentMode === pm
                          ? 'bg-rose-600 text-white shadow-xs'
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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Mandi Vegetables (Aloo, Tamatar)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
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
                  className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl text-xs active-press shadow-md"
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
