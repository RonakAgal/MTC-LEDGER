import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, CreditCard, FileText, BarChart3, Sparkles, 
  Settings, LogOut, ChevronRight, ShieldCheck, Languages 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MoreMenuPage() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      to: '/more/expenses',
      title: lang === 'hi' ? 'खर्चा रजिस्टर (Expenses)' : 'Expenses',
      desc: lang === 'hi' ? 'रोज के व्यापार खर्चे सहेजें' : 'Manage daily business expenses',
      icon: PlusCircle,
      color: 'bg-rose-50 border-rose-200 text-rose-700'
    },
    {
      to: '/more/payments',
      title: lang === 'hi' ? 'भुगतान एवं बाकी (Payments)' : 'Payments & Pending',
      desc: lang === 'hi' ? 'ग्राहकों का बाकी हिसाब देखें' : 'Receive payments and view pending',
      icon: CreditCard,
      color: 'bg-teal-50 border-teal-200 text-teal-700'
    },
    {
      to: '/more/ledger',
      title: lang === 'hi' ? 'ग्राहक खाता (Ledger)' : 'Customer Ledger',
      desc: lang === 'hi' ? 'ग्राहक का सम्पूर्ण बहीखाता' : 'Individual customer statements',
      icon: FileText,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    },
    {
      to: '/more/reports',
      title: lang === 'hi' ? 'रिपोर्ट्स एवं डाउनलोड (Reports)' : 'Reports & Export',
      desc: lang === 'hi' ? 'PDF और Excel एक्सपोर्ट करें' : 'Daily/Monthly reports with PDF/Excel',
      icon: BarChart3,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    },
    {
      to: '/summary',
      title: lang === 'hi' ? 'आज का दिनभर का हिसाब (Summary)' : "Today's Business Summary",
      desc: lang === 'hi' ? 'कुल आमदनी, खर्चा एवं शुद्ध लाभ' : 'Daily net profit and payment split',
      icon: Sparkles,
      color: 'bg-amber-50 border-amber-200 text-amber-800'
    },
    {
      to: '/more/settings',
      title: lang === 'hi' ? 'व्यापार सेटिंग्स एवं ब्रांड (Settings)' : 'Business Settings & Branding',
      desc: lang === 'hi' ? 'ब्रांड का नाम, लोगो, और डिफ़ॉल्ट टिफिन रेट सेट करें' : 'Configure Brand Name, Logo & Default Prices',
      icon: Settings,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    }
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
        <h2 className="text-base font-extrabold text-slate-900">
          {lang === 'hi' ? 'अधिक विकल्प (More Menu)' : 'More Options'}
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          {lang === 'hi' ? 'खर्चा, भुगतान, रिपोर्ट एवं बहीखाता कंट्रोल center' : 'Complete financial controls and reports'}
        </p>
      </div>

      {/* Grid of Menu Options */}
      <div className="space-y-2.5">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(item.to)}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 hover:border-slate-300 active-press cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400" />
            </motion.div>
          );
        })}
      </div>

      {/* Settings / Controls Box */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          System Controls
        </h3>

        {/* Toggle Language */}
        <button
          onClick={toggleLanguage}
          className="w-full py-3 px-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800 active-press"
        >
          <div className="flex items-center space-x-2">
            <Languages className="w-4 h-4 text-emerald-600" />
            <span>{t('language')}</span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">
            {lang === 'en' ? 'English' : 'हिंदी'}
          </span>
        </button>

        {/* Admin Logout */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full py-3 px-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs font-bold text-rose-700 active-press"
        >
          <div className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </div>
        </button>
      </div>
    </div>
  );
}
