import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Mail, ShieldCheck, Languages } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@tiffin.com');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-100 relative overflow-hidden">
      {/* Background Decorative Gradient Accents */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Unified Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 my-auto"
      >
        {/* Card Top Brand Header */}
        <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white p-6 text-center relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-100">
                Admin Access
              </span>
            </div>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/25 backdrop-blur-md active-press transition"
            >
              <Languages className="w-3 h-3" />
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>
          </div>

          <div className="w-16 h-16 bg-white/95 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-2.5 border border-white/30 overflow-hidden p-1 backdrop-blur-md">
            <img src="/logo.png" alt="MTC-LEDGER Logo" className="w-full h-full object-contain rounded-xl" />
          </div>

          <h1 className="text-xl font-black tracking-tight text-white">
            {t('loginTitle')}
          </h1>
          <p className="text-xs text-emerald-100/90 font-medium mt-0.5 max-w-xs mx-auto">
            {t('loginSub')}
          </p>
        </div>

        {/* Card Form Body */}
        <div className="p-6 space-y-4 bg-white">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t('emailLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
                  placeholder="admin@tiffin.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 active-press transition mt-2 tracking-wide"
            >
              {loading ? 'Authenticating...' : t('loginBtn')}
            </button>
          </form>

          <div className="text-center text-[10px] text-slate-400 font-semibold pt-2">
            MTC-LEDGER v1.0 • Safe & Secure Business App
          </div>
        </div>
      </motion.div>
    </div>
  );
}
