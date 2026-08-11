import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Utensils, Lock, Mail, ShieldCheck, Languages } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@tiffin.com');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginQuickAdmin } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickAdmin = () => {
    loginQuickAdmin();
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 justify-between">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-b from-emerald-600 via-emerald-700 to-teal-800 text-white pt-10 pb-14 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-8 bottom-0 w-24 h-24 bg-teal-400/20 rounded-full blur-lg pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Admin Access Only
            </span>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-md active-press"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>

        <div className="text-center mt-2">
          <div className="w-16 h-16 bg-white text-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3 border-2 border-emerald-300/40">
            <Utensils className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {t('loginTitle')}
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto">
            {t('loginSub')}
          </p>
        </div>
      </div>

      {/* Login Form Container Card */}
      <div className="px-6 -mt-8 flex-1 flex flex-col justify-between pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100"
        >
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t('emailLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder="admin@tiffin.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-700 active-press transition mt-2"
            >
              {loading ? 'Verifying...' : t('loginBtn')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">
                {lang === 'hi' ? 'या (OR)' : 'OR'}
              </span>
            </div>
          </div>

          {/* Quick Admin Button for Papa */}
          <button
            onClick={handleQuickAdmin}
            className="w-full py-3 bg-emerald-50 border-2 border-emerald-500/40 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 active-press transition"
          >
            <span>{t('quickDemoLogin')}</span>
          </button>
        </motion.div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-400 font-medium mt-6">
          Papa Ka Register v1.0 • Safe & Secure Business App
        </div>
      </div>
    </div>
  );
}
