// Data Service Layer supporting Firestore with resilient LocalStorage fallback
import { db } from '../config/firebase';
import { 
  collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy 
} from 'firebase/firestore';

const STORAGE_KEYS = {
  CUSTOMERS: 'papa_register_customers',
  TIFFINS: 'papa_register_tiffins',
  EXPENSES: 'papa_register_expenses',
  PAYMENTS: 'papa_register_payments',
  CATERING: 'papa_register_catering',
  SETTINGS: 'papa_register_settings'
};

// Initial Seed Data for immediate demonstration & Papa testing
const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    address: 'Flat 302, Green Valley Apartments',
    area: 'Civil Lines',
    landmark: 'Near Bus Stand',
    lunchPrice: 80,
    dinnerPrice: 80,
    defaultQty: 1,
    startDate: '2026-08-01',
    notes: 'Less spicy food preferred',
    status: 'active', // active | paused | inactive
    pauseFrom: '',
    pauseUntil: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust-2',
    name: 'Priya Verma',
    mobile: '9812345678',
    address: 'House 45, Sector 4',
    area: 'Raja Park',
    landmark: 'Behind SBI Bank',
    lunchPrice: 70,
    dinnerPrice: 90,
    defaultQty: 1,
    startDate: '2026-08-01',
    notes: 'No garlic on Tuesdays',
    status: 'active',
    pauseFrom: '',
    pauseUntil: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust-3',
    name: 'Amit Patel',
    mobile: '9988776655',
    address: 'B-12, Royal Plaza',
    area: 'Station Road',
    landmark: 'Opposite Metro Gate 2',
    lunchPrice: 90,
    dinnerPrice: 90,
    defaultQty: 2,
    startDate: '2026-08-05',
    notes: 'Takes 2 tiffins for office colleagues',
    status: 'active',
    pauseFrom: '',
    pauseUntil: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust-4',
    name: 'Sunita Gupta',
    mobile: '9765432109',
    address: 'C-88, Shanti Nagar',
    area: 'Shanti Nagar',
    landmark: 'Near Temple',
    lunchPrice: 75,
    dinnerPrice: 75,
    defaultQty: 1,
    startDate: '2026-08-02',
    notes: '',
    status: 'paused',
    pauseFrom: '2026-08-10',
    pauseUntil: '2026-08-18',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust-5',
    name: 'Vikram Singh',
    mobile: '9898989898',
    address: 'Shop 14, Main Market',
    area: 'Main Market',
    landmark: 'Clock Tower',
    lunchPrice: 85,
    dinnerPrice: 85,
    defaultQty: 1,
    startDate: '2026-07-15',
    notes: 'Monthly billing on 1st',
    status: 'active',
    pauseFrom: '',
    pauseUntil: '',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    amount: 750,
    category: 'Sabzi',
    description: 'Fresh vegetables from Mandi (Aloo, Gobi, Tamatar)',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'cash',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp-2',
    amount: 400,
    category: 'Doodh',
    description: '10 Liters Amul Gold Milk',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'upi',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_CATERING = [
  {
    id: 'cat-1',
    customerName: 'Sanjay Kapoor',
    mobile: '9876001122',
    eventName: 'Birthday Party Dinner',
    eventType: 'Birthday',
    eventDate: '2026-08-15',
    eventTime: '19:30',
    venue: 'Community Hall, Sector 7',
    plates: 120,
    ratePerPlate: 250,
    menu: 'Paneer Butter Masala, Dal Makhani, Mix Veg, Butter Naan, Gulab Jamun',
    extraCharges: 1000,
    discount: 1000,
    subtotal: 30000,
    totalAmount: 30000,
    advancePaid: 10000,
    balanceDue: 20000,
    status: 'confirmed', // inquiry | confirmed | preparing | completed | cancelled
    notes: 'Deliver hot by 7:15 PM',
    payments: [
      { id: 'p-1', amount: 10000, date: '2026-08-08', paymentMode: 'upi', notes: 'Advance Booking' }
    ],
    createdAt: new Date().toISOString()
  }
];

// Helper to get local data
const getLocal = (key, defaultVal) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    console.error(`Error reading ${key} from local storage`, e);
    return defaultVal;
  }
};

// Helper to set local data
const setLocal = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error writing ${key} to local storage`, e);
  }
};

const DEFAULT_SETTINGS = {
  brandName: 'Papa Ka Register',
  tagline: 'Tiffin & Catering Digital Register',
  phone: '9876543210',
  address: 'Shop 12, Main Market',
  defaultLunchPrice: 80,
  defaultDinnerPrice: 80,
  deliveryCharge: 0,
  logoPreset: 'tiffin-box',
  quickLoginEnabled: true
};

// Ensure default data exists
if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
  setLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
}
if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
  setLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
}
if (!localStorage.getItem(STORAGE_KEYS.CATERING)) {
  setLocal(STORAGE_KEYS.CATERING, INITIAL_CATERING);
}
if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
  setLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export const dataService = {
  // --- SETTINGS ---
  async getSettings() {
    return getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  async updateSettings(patch) {
    const current = getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    setLocal(STORAGE_KEYS.SETTINGS, updated);

    try {
      await setDoc(doc(db, 'settings', 'config'), updated);
    } catch (e) {
      console.warn("Firestore settings sync skipped", e);
    }
    return updated;
  },

  // --- CUSTOMERS ---
  async getCustomers() {
    try {
      // Try firestore first
      const q = query(collection(db, 'customers'));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const firestoreDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLocal(STORAGE_KEYS.CUSTOMERS, firestoreDocs);
        return firestoreDocs;
      }
    } catch (err) {
      console.warn("Firestore offline/unavailable, using local data", err);
    }
    return getLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  async addCustomer(customerData) {
    const newCust = {
      ...customerData,
      id: `cust-${Date.now()}`,
      status: 'active',
      pauseFrom: '',
      pauseUntil: '',
      createdAt: new Date().toISOString()
    };
    
    // Save to local
    const customers = getLocal(STORAGE_KEYS.CUSTOMERS, []);
    const updated = [newCust, ...customers];
    setLocal(STORAGE_KEYS.CUSTOMERS, updated);

    // Try firestore sync
    try {
      await setDoc(doc(db, 'customers', newCust.id), newCust);
    } catch (e) {
      console.warn("Firestore sync skipped", e);
    }
    return newCust;
  },

  async updateCustomer(id, patch) {
    const customers = getLocal(STORAGE_KEYS.CUSTOMERS, []);
    const updated = customers.map(c => c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c);
    setLocal(STORAGE_KEYS.CUSTOMERS, updated);

    try {
      await updateDoc(doc(db, 'customers', id), patch);
    } catch (e) {
      console.warn("Firestore sync skipped", e);
    }
    return updated.find(c => c.id === id);
  },

  async pauseCustomer(id, pauseFrom, pauseUntil) {
    return this.updateCustomer(id, {
      status: 'paused',
      pauseFrom,
      pauseUntil
    });
  },

  async unpauseCustomer(id) {
    return this.updateCustomer(id, {
      status: 'active',
      pauseFrom: '',
      pauseUntil: ''
    });
  },

  // --- DAILY TIFFIN CONFIRMATIONS ---
  async getDailyTiffinsByDate(dateStr) {
    // Returns array of tiffin records for specific YYYY-MM-DD
    const allTiffins = getLocal(STORAGE_KEYS.TIFFINS, []);
    return allTiffins.filter(t => t.date === dateStr);
  },

  async saveDailyTiffinConfirmations(dateStr, meal, confirmationList) {
    // meal = 'lunch' | 'dinner'
    // confirmationList = array of { customerId, customerName, status ('confirmed'|'skipped'), quantity, priceAtTime, amount }
    const allTiffins = getLocal(STORAGE_KEYS.TIFFINS, []);
    
    // Filter out previous records for this date and meal to avoid duplicates
    const remaining = allTiffins.filter(t => !(t.date === dateStr && t.meal === meal));
    
    const newRecords = confirmationList.map(item => ({
      id: `tif-${item.customerId}-${dateStr}-${meal}`,
      customerId: item.customerId,
      customerName: item.customerName,
      date: dateStr,
      meal: meal,
      status: item.status, // 'confirmed' | 'skipped'
      quantity: Number(item.quantity) || 1,
      priceAtTime: Number(item.priceAtTime) || 0,
      amount: item.status === 'confirmed' ? (Number(item.quantity) * Number(item.priceAtTime)) : 0,
      createdAt: new Date().toISOString()
    }));

    const updatedAll = [...remaining, ...newRecords];
    setLocal(STORAGE_KEYS.TIFFINS, updatedAll);

    // Sync each record to Firestore asynchronously
    newRecords.forEach(async (rec) => {
      try {
        await setDoc(doc(db, 'daily_tiffin', rec.id), rec);
      } catch (e) {
        console.warn("Firestore daily tiffin sync skipped", e);
      }
    });

    return newRecords;
  },

  // --- EXPENSES ---
  async getExpenses() {
    return getLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  },

  async addExpense(expenseData) {
    const newExp = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const current = getLocal(STORAGE_KEYS.EXPENSES, []);
    const updated = [newExp, ...current];
    setLocal(STORAGE_KEYS.EXPENSES, updated);

    try {
      await setDoc(doc(db, 'expenses', newExp.id), newExp);
    } catch (e) {
      console.warn("Firestore expense sync skipped", e);
    }
    return newExp;
  },

  async deleteExpense(id) {
    const current = getLocal(STORAGE_KEYS.EXPENSES, []);
    const updated = current.filter(e => e.id !== id);
    setLocal(STORAGE_KEYS.EXPENSES, updated);

    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (e) {
      console.warn("Firestore delete expense skipped", e);
    }
    return true;
  },

  // --- PAYMENTS & CUSTOMER LEDGER ---
  async getPayments() {
    return getLocal(STORAGE_KEYS.PAYMENTS, []);
  },

  async addPayment(paymentData) {
    const newPay = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const current = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const updated = [newPay, ...current];
    setLocal(STORAGE_KEYS.PAYMENTS, updated);

    try {
      await setDoc(doc(db, 'payments', newPay.id), newPay);
    } catch (e) {
      console.warn("Firestore payment sync skipped", e);
    }
    return newPay;
  },

  // --- CATERING ORDERS ---
  async getCateringOrders() {
    return getLocal(STORAGE_KEYS.CATERING, INITIAL_CATERING);
  },

  async addCateringOrder(cateringData) {
    const newCat = {
      ...cateringData,
      id: `cat-${Date.now()}`,
      payments: cateringData.advancePaid > 0 ? [
        { id: `p-${Date.now()}`, amount: Number(cateringData.advancePaid), date: cateringData.eventDate, paymentMode: 'cash', notes: 'Advance Booking' }
      ] : [],
      createdAt: new Date().toISOString()
    };
    const current = getLocal(STORAGE_KEYS.CATERING, []);
    const updated = [newCat, ...current];
    setLocal(STORAGE_KEYS.CATERING, updated);

    try {
      await setDoc(doc(db, 'catering_orders', newCat.id), newCat);
    } catch (e) {
      console.warn("Firestore catering sync skipped", e);
    }
    return newCat;
  },

  async addCateringPayment(orderId, paymentAmount, paymentMode, notes, dateStr) {
    const orders = getLocal(STORAGE_KEYS.CATERING, []);
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return null;

    const newPaymentItem = {
      id: `cat-pay-${Date.now()}`,
      amount: Number(paymentAmount),
      date: dateStr || new Date().toISOString().split('T')[0],
      paymentMode,
      notes: notes || 'Installment Payment'
    };

    const newAdvanceTotal = (Number(targetOrder.advancePaid) || 0) + Number(paymentAmount);
    const newBalance = Math.max(0, (Number(targetOrder.totalAmount) || 0) - newAdvanceTotal);

    const updatedOrder = {
      ...targetOrder,
      advancePaid: newAdvanceTotal,
      balanceDue: newBalance,
      payments: [...(targetOrder.payments || []), newPaymentItem],
      updatedAt: new Date().toISOString()
    };

    const updatedList = orders.map(o => o.id === orderId ? updatedOrder : o);
    setLocal(STORAGE_KEYS.CATERING, updatedList);

    // Also add to global payments collection for income tracking
    await this.addPayment({
      customerId: '',
      customerName: targetOrder.customerName,
      amount: Number(paymentAmount),
      paymentMode,
      date: dateStr || new Date().toISOString().split('T')[0],
      notes: `Catering Payment - ${targetOrder.eventName}`,
      type: 'catering_payment',
      referenceId: orderId
    });

    return updatedOrder;
  },

  async updateCateringStatus(orderId, newStatus) {
    const orders = getLocal(STORAGE_KEYS.CATERING, []);
    const updatedList = orders.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o);
    setLocal(STORAGE_KEYS.CATERING, updatedList);
    return updatedList.find(o => o.id === orderId);
  },

  // --- BUSINESS COMPUTATION CALCULATORS ---
  async getCustomerLedger(customerId) {
    const allTiffins = getLocal(STORAGE_KEYS.TIFFINS, []);
    const allPayments = getLocal(STORAGE_KEYS.PAYMENTS, []);

    const custTiffins = allTiffins.filter(t => t.customerId === customerId && t.status === 'confirmed');
    const custPayments = allPayments.filter(p => p.customerId === customerId);

    const totalBilled = custTiffins.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalPaid = custPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pendingBalance = Math.max(0, totalBilled - totalPaid);

    // Combine transactions chronologically
    const history = [
      ...custTiffins.map(t => ({
        id: t.id,
        type: 'tiffin',
        date: t.date,
        meal: t.meal,
        description: `${t.meal === 'lunch' ? '🌅 Lunch' : '🌆 Dinner'} x ${t.quantity} (@₹${t.priceAtTime})`,
        debit: t.amount,
        credit: 0
      })),
      ...custPayments.map(p => ({
        id: p.id,
        type: 'payment',
        date: p.date,
        meal: '',
        description: `💰 Payment Received (${p.paymentMode.toUpperCase()}) ${p.notes ? `- ${p.notes}` : ''}`,
        debit: 0,
        credit: p.amount
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      totalBilled,
      totalPaid,
      pendingBalance,
      history,
      lunchCount: custTiffins.filter(t => t.meal === 'lunch').reduce((sum, t) => sum + t.quantity, 0),
      dinnerCount: custTiffins.filter(t => t.meal === 'dinner').reduce((sum, t) => sum + t.quantity, 0),
      totalTiffins: custTiffins.reduce((sum, t) => sum + t.quantity, 0)
    };
  },

  async getDashboardMetrics() {
    const todayStr = new Date().toISOString().split('T')[0];
    const allCustomers = getLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    const allTiffins = getLocal(STORAGE_KEYS.TIFFINS, []);
    const allExpenses = getLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const allPayments = getLocal(STORAGE_KEYS.PAYMENTS, []);
    const allCatering = getLocal(STORAGE_KEYS.CATERING, INITIAL_CATERING);

    const todayTiffins = allTiffins.filter(t => t.date === todayStr && t.status === 'confirmed');
    const todayLunchCount = todayTiffins.filter(t => t.meal === 'lunch').reduce((sum, t) => sum + t.quantity, 0);
    const todayDinnerCount = todayTiffins.filter(t => t.meal === 'dinner').reduce((sum, t) => sum + t.quantity, 0);

    const todayTiffinIncome = todayTiffins.reduce((sum, t) => sum + t.amount, 0);

    const todayExpenses = allExpenses
      .filter(e => e.date === todayStr)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const todayProfit = todayTiffinIncome - todayExpenses;

    // Calculate total pending customer payments
    let totalPendingPayments = 0;
    for (const cust of allCustomers) {
      const custTiffins = allTiffins.filter(t => t.customerId === cust.id && t.status === 'confirmed');
      const custPayments = allPayments.filter(p => p.customerId === cust.id);
      const billed = custTiffins.reduce((s, t) => s + t.amount, 0);
      const paid = custPayments.reduce((s, p) => s + Number(p.amount), 0);
      const pending = Math.max(0, billed - paid);
      totalPendingPayments += pending;
    }

    const upcomingCateringCount = allCatering.filter(c => c.status === 'confirmed' || c.status === 'preparing').length;

    return {
      todayLunchCount,
      todayDinnerCount,
      todayTiffinIncome,
      todayExpenses,
      todayProfit,
      totalPendingPayments,
      upcomingCateringCount
    };
  }
};
