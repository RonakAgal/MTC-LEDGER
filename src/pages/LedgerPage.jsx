import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { FileText, ArrowLeft, User, Search, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LedgerPage() {
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [selectedCustId, setSelectedCustId] = useState(searchParams.get('customerId') || '');
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustId) {
      loadLedger(selectedCustId);
    }
  }, [selectedCustId]);

  const loadCustomers = async () => {
    const list = await dataService.getCustomers();
    setCustomers(list);
    if (!selectedCustId && list.length > 0) {
      setSelectedCustId(list[0].id);
    }
    setLoading(false);
  };

  const loadLedger = async (cId) => {
    const data = await dataService.getCustomerLedger(cId);
    setLedgerData(data);
  };

  const currentCust = customers.find(c => c.id === selectedCustId);

  return (
    <div className="space-y-3 pb-24">
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
              {t('viewLedger')}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {lang === 'hi' ? 'ग्राहक का सम्पूर्ण डिजिटल खाता' : 'Detailed Customer Statement & History'}
            </p>
          </div>
        </div>

        {/* Customer Select Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            {t('customerName')}:
          </label>
          <select
            value={selectedCustId}
            onChange={(e) => setSelectedCustId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Statement Card */}
      {ledgerData && currentCust && (
        <div className="space-y-3">
          {/* Summary Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex justify-between items-start border-b border-slate-700 pb-2">
              <div>
                <h3 className="text-base font-black text-white">{currentCust.name}</h3>
                <p className="text-xs text-slate-400 font-medium">📱 {currentCust.mobile}</p>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE LEDGER
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">{t('totalBill')}</span>
                <span className="text-sm font-black text-white">₹{ledgerData.totalBilled}</span>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">{t('paid')}</span>
                <span className="text-sm font-black text-emerald-400">₹{ledgerData.totalPaid}</span>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">{t('pending')}</span>
                <span className="text-sm font-black text-amber-400">₹{ledgerData.pendingBalance}</span>
              </div>
            </div>
          </div>

          {/* Month Filter & Export Tools */}
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Month:</span>
              <input
                type="month"
                defaultValue={new Date().toISOString().slice(0, 7)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 active-press shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF / Print</span>
              </button>
              {currentCust.mobile && (
                <a
                  href={`https://wa.me/91${currentCust.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hello ${currentCust.name},\nYour Tiffin Bill Summary:\nTotal Billed: ₹${ledgerData.totalBilled}\nTotal Paid: ₹${ledgerData.totalPaid}\nPending Balance: ₹${ledgerData.pendingBalance}\nThank you! - Papa Ka Register`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 active-press shadow-xs"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Statement Rows */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Date-wise Statement Log ({ledgerData.history.length} Entries)
            </h4>

            {ledgerData.history.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No statement history recorded for this customer.
              </div>
            ) : (
              ledgerData.history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{item.description}</span>
                    <span className="text-[10px] text-slate-400 font-medium">📅 {item.date}</span>
                  </div>

                  <div className="text-right font-black">
                    {item.debit > 0 && (
                      <span className="text-rose-600 block">+₹{item.debit} (Bill)</span>
                    )}
                    {item.credit > 0 && (
                      <span className="text-emerald-600 block">-₹{item.credit} (Paid)</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
