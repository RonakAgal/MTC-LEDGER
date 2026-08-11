import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, Users, CalendarDays } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function BottomNav() {
  const { lang } = useLanguage();

  const navItems = [
    {
      to: '/dashboard',
      label: lang === 'hi' ? 'होम' : 'Home',
      icon: Home
    },
    {
      to: '/tiffin',
      label: lang === 'hi' ? 'टिफिन' : 'Tiffin',
      icon: UtensilsCrossed
    },
    {
      to: '/customers',
      label: lang === 'hi' ? 'ग्राहक' : 'Customers',
      icon: Users
    },
    {
      to: '/catering',
      label: lang === 'hi' ? 'कैटरिंग' : 'Catering',
      icon: CalendarDays
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-150 active-press ${
                  isActive
                    ? 'text-emerald-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none truncate max-w-[68px]">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
