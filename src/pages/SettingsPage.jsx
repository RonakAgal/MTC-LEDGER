import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { 
  ArrowLeft, Store, DollarSign, ShieldCheck, Save, CheckCircle2, 
  Sparkles, Phone, MapPin, Sliders, RefreshCw, KeyRound, Lock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_PRESETS = [
  { id: 'tiffin-box', emoji: '🍱', label: 'Tiffin Box' },
  { id: 'chef-papa', emoji: '👨‍🍳', label: 'Papa Chef' },
  { id: 'catering-pot', emoji: '🥘', label: 'Catering Pot' },
  { id: 'store-register', emoji: '🏬', label: 'Digital Store' }
];

export default function SettingsPage() {
  const { lang, t } = useLanguage();
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    brandName: 'MTC-LEDGER',
    tagline: 'Tiffin & Catering Digital Management',
    phone: '9876543210',
    address: 'Shop 12, Main Market',
    defaultLunchPrice: 80,
    defaultDinnerPrice: 80,
    deliveryCharge: 0,
    logoPreset: 'tiffin-box'
  });

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Password reset state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await dataService.getSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await dataService.updateSettings(settings);
    setToast(lang === 'hi' ? 'सेटिंग्स सफलतापूर्वक सहेजी गईं!' : 'Settings updated successfully!');
    setTimeout(() => setToast(''), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPwdError(lang === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError(lang === 'hi' ? 'दोनों पासवर्ड समान होने चाहिए।' : 'Passwords do not match.');
      return;
    }

    setPwdLoading(true);
    const res = await changePassword(newPassword);
    setPwdLoading(false);

    if (res.success) {
      setPwdSuccess(lang === 'hi' ? 'पासवर्ड सफलतापूर्वक बदल दिया गया है!' : 'Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(''), 4000);
    } else {
      setPwdError(res.error || 'Failed to update password.');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs font-semibold text-slate-500">
        Loading settings...
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

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/more')}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 active-press mr-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">
              {lang === 'hi' ? 'व्यापार सेटिंग्स एवं ब्रांड' : 'Business Settings & Branding'}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {lang === 'hi' ? 'ब्रांड नाम, टिफिन रेट और पासवर्ड बदलें' : 'Customize Brand Name, Default Tiffin Prices & Password'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        {/* Business Branding Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 text-xs font-semibold">
          <div className="flex items-center space-x-2 text-slate-900 font-extrabold border-b border-slate-100 pb-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? '1. व्यापार ब्रांडिंग (Business Identity)' : '1. Business Branding'}</span>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">
              {lang === 'hi' ? 'ब्रांड / दुकान का नाम (Brand Name) *' : 'Brand Name *'}
            </label>
            <input
              type="text"
              required
              value={settings.brandName || ''}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
              placeholder="e.g. MTC-LEDGER / Maa Annapurna Tiffin"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">
              {lang === 'hi' ? 'टैगलाइन / सब-टाइटल (Tagline)' : 'Tagline / Subtitle'}
            </label>
            <input
              type="text"
              value={settings.tagline || ''}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              placeholder="e.g. Shuddh & Swadist Ghar Ka Khana"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 mb-1">
                {lang === 'hi' ? 'फ़ोन / WhatsApp नंबर' : 'Phone / WhatsApp'}
              </label>
              <input
                type="tel"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">
                {lang === 'hi' ? 'शहर / पता (City/Address)' : 'City / Address'}
              </label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>
          </div>

          {/* Logo Preset Picker */}
          <div>
            <label className="block text-slate-700 mb-1.5">
              {lang === 'hi' ? 'ब्रांड लोगो चुनें (App Logo Icon)' : 'Brand Logo Icon Preset'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {LOGO_PRESETS.map((lp) => (
                <button
                  key={lp.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, logoPreset: lp.id })}
                  className={`p-2.5 rounded-xl border text-center transition active-press ${
                    settings.logoPreset === lp.id
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl block">{lp.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-600 block mt-1">{lp.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Default Tiffin Pricing Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 text-xs font-semibold">
          <div className="flex items-center space-x-2 text-slate-900 font-extrabold border-b border-slate-100 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? '2. डिफ़ॉल्ट टिफिन रेट (Default Tiffin Prices)' : '2. Default Tiffin Prices'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 mb-1">
                {lang === 'hi' ? 'डिफ़ॉल्ट लंच रेट (₹)' : 'Default Lunch Price (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={settings.defaultLunchPrice || ''}
                onChange={(e) => setSettings({ ...settings, defaultLunchPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">
                {lang === 'hi' ? 'डिफ़ॉल्ट डिनर रेट (₹)' : 'Default Dinner Price (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={settings.defaultDinnerPrice || ''}
                onChange={(e) => setSettings({ ...settings, defaultDinnerPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">
              {lang === 'hi' ? 'डिफ़ॉल्ट पैकिंग/डिलीवरी चार्ज (₹)' : 'Default Delivery Charge (₹)'}
            </label>
            <input
              type="number"
              min="0"
              value={settings.deliveryCharge || 0}
              onChange={(e) => setSettings({ ...settings, deliveryCharge: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            />
          </div>
        </div>

        {/* Security & Password Reset Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 text-xs font-semibold">
          <div className="flex items-center space-x-2 text-slate-900 font-extrabold border-b border-slate-100 pb-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? '3. पासवर्ड बदलें / रिसेट करें (Reset Admin Password)' : '3. Admin Password Reset'}</span>
          </div>

          {pwdError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">
              {pwdError}
            </div>
          )}

          {pwdSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pwdSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 mb-1">
              {lang === 'hi' ? 'नया पासवर्ड दर्ज करें (New Password) *' : 'New Password *'}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">
              {lang === 'hi' ? 'नया पासवर्ड पुनः दर्ज करें (Confirm Password) *' : 'Confirm New Password *'}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handlePasswordChange}
            disabled={pwdLoading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 active-press transition"
          >
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>{pwdLoading ? 'Updating Password...' : (lang === 'hi' ? 'पासवर्ड अपडेट करें (Update Password)' : 'Update Admin Password')}</span>
          </button>

          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-bold mt-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Firebase Cloud Sync: Active</span>
            </div>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">ONLINE</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active-press transition"
        >
          <Save className="w-4 h-4" />
          <span>{lang === 'hi' ? 'सेटिंग्स सहेजें (Save Settings)' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
}
