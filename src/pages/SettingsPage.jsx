import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { 
  ArrowLeft, Store, DollarSign, ShieldCheck, Save, CheckCircle2, 
  Sparkles, Phone, MapPin, Sliders, RefreshCw 
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
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    brandName: 'Papa Ka Register',
    tagline: 'Tiffin & Catering Digital Management',
    phone: '9876543210',
    address: 'Shop 12, Main Market',
    defaultLunchPrice: 80,
    defaultDinnerPrice: 80,
    deliveryCharge: 0,
    logoPreset: 'tiffin-box',
    quickLoginEnabled: true
  });

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

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
              {lang === 'hi' ? 'ब्रांड नाम, टिफिन रेट और ऐप प्राथमिकताएं' : 'Customize Brand Name, Default Tiffin Prices & App Rules'}
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
              placeholder="e.g. Papa Ka Register / Maa Annapurna Tiffin"
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

        {/* Security & System Preferences Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 text-xs font-semibold">
          <div className="flex items-center space-x-2 text-slate-900 font-extrabold border-b border-slate-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'hi' ? '3. सुरक्षा एवं क्लाउड सिंक (Security & Cloud Sync)' : '3. Security & Cloud Preferences'}</span>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block">
                {lang === 'hi' ? 'Papa Single-Tap Quick Login' : 'Single-Tap Quick Login'}
              </span>
              <span className="text-[10px] text-slate-500">
                {lang === 'hi' ? '1-क्लिक में एडमिन लॉगिन चालू रखें' : 'Enable 1-tap fast sign in for Papa'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.quickLoginEnabled !== false}
              onChange={(e) => setSettings({ ...settings, quickLoginEnabled: e.target.checked })}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-bold">
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
