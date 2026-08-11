import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, X, Languages, LogOut, Utensils, Home, Sun, 
  Users, CalendarDays, PlusCircle, CreditCard, FileText, 
  BarChart3, Sparkles, Settings, ChevronRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileLayout() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <Outlet />;
  }

  const currentDateFormatted = format(new Date(), 'EEEE, dd MMMM yyyy');

  const sideNavItems = [
    { to: '/dashboard', label: lang === 'hi' ? 'डैशबोर्ड (Dashboard)' : 'Dashboard', icon: Home, color: 'text-emerald-600 bg-emerald-50' },
    { to: '/tiffin', label: lang === 'hi' ? 'दैनिक टिफिन रजिस्टर (Daily Register)' : 'Daily Tiffin Register', icon: Sun, color: 'text-amber-600 bg-amber-50' },
    { to: '/customers', label: lang === 'hi' ? 'ग्राहक रजिस्टर (Customers)' : 'Customers Directory', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { to: '/catering', label: lang === 'hi' ? 'कैटरिंग आर्डर (Catering)' : 'Catering Orders', icon: CalendarDays, color: 'text-purple-600 bg-purple-50' },
    { to: '/more/expenses', label: lang === 'hi' ? 'खर्चा रजिस्टर (Expenses)' : 'Daily Expenses', icon: PlusCircle, color: 'text-rose-600 bg-rose-50' },
    { to: '/more/payments', label: lang === 'hi' ? 'भुगतान एवं बाकी (Payments)' : 'Payments & Pending', icon: CreditCard, color: 'text-teal-600 bg-teal-50' },
    { to: '/more/ledger', label: lang === 'hi' ? 'ग्राहक बहीखाता (Ledger)' : 'Customer Ledger', icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
    { to: '/more/reports', label: lang === 'hi' ? 'रिपोर्ट्स एवं डाउनलोड (Reports)' : 'Reports & Export', icon: BarChart3, color: 'text-emerald-700 bg-emerald-100' },
    { to: '/summary', label: lang === 'hi' ? 'आज का हिसाब (Summary)' : "Today's Summary", icon: Sparkles, color: 'text-amber-700 bg-amber-100' },
    { to: '/more/settings', label: lang === 'hi' ? 'सेटिंग्स एवं ब्रांड (Settings)' : 'Business Settings', icon: Settings, color: 'text-slate-700 bg-slate-100' },
  ];

  return (
    <div className="mobile-container flex flex-col min-h-screen bg-slate-50 pb-20 relative">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-3 py-2.5 shadow-md">
        <div className="flex items-center justify-between">
          {/* Top Left Clickable Logo & Brand Area */}
          <div 
            onClick={() => navigate('/more')}
            className="flex items-center space-x-2 cursor-pointer active-press group"
            title="Click to open Full Screen Menu Page"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner transition overflow-hidden p-0.5">
              <img src="/logo.png" alt="MTC-LEDGER Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h1 className="text-sm font-black leading-tight tracking-tight flex items-center gap-1">
                {t('appTitle')}
                <span className="bg-emerald-950/60 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-white/20">
                  MENU ↗
                </span>
              </h1>
              <p className="text-[10px] text-emerald-100 font-medium">
                {currentDateFormatted}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-2 py-1.5 rounded-lg backdrop-blur-sm border border-white/20 active-press transition"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Side Navigation Drawer (स्लाइडिंग साइड मेन्यू) */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Sliding Drawer Container */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-4/5 max-w-xs bg-white shadow-2xl flex flex-col justify-between border-r border-slate-200"
            >
              {/* Drawer Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold overflow-hidden p-0.5 border border-white/20">
                      <img src="/logo.png" alt="MTC-LEDGER Logo" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <div>
                      <h2 className="text-base font-black leading-tight">{t('appTitle')}</h2>
                      <p className="text-[10px] text-emerald-200 font-medium">Tiffin & Catering Digital Manager</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1 rounded-full text-white/80 hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-bold">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-1">
                  {lang === 'hi' ? 'मुख्य मेन्यू (Navigation)' : 'Main Menu'}
                </p>

                {sideNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <button
                      key={item.to}
                      onClick={() => {
                        navigate(item.to);
                        setDrawerOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between transition active-press ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
                <button
                  onClick={toggleLanguage}
                  className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800 active-press"
                >
                  <div className="flex items-center space-x-2">
                    <Languages className="w-4 h-4 text-emerald-600" />
                    <span>{t('language')}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] uppercase">
                    {lang === 'en' ? 'English' : 'हिंदी'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 px-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-between text-xs font-bold active-press"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </div>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Screen Content */}
      <main className="flex-1 px-3 py-3 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Fixed Navigation */}
      <BottomNav />
    </div>
  );
}
