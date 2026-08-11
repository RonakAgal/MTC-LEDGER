// Pure Firestore Data Service Layer (Zero LocalStorage Usage)
import { db } from '../config/firebase';
import { 
  collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where 
} from 'firebase/firestore';

// Clean single user details record as requested (1 customer only)
const SINGLE_INITIAL_CUSTOMER = [
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
    startDate: new Date().toISOString().split('T')[0],
    notes: 'Primary Customer',
    status: 'active',
    pauseFrom: '',
    pauseUntil: '',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_SETTINGS = {
  brandName: 'MTC-LEDGER',
  tagline: 'Tiffin & Catering Digital Register',
  phone: '9876543210',
  address: 'Shop 12, Main Market',
  defaultLunchPrice: 80,
  defaultDinnerPrice: 80,
  deliveryCharge: 0,
  logoPreset: 'tiffin-box',
  quickLoginEnabled: true
};

export const dataService = {
  // --- SETTINGS ---
  async getSettings() {
    try {
      const q = query(collection(db, 'settings'));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      }
    } catch (err) {
      console.warn("Firestore getSettings error", err);
    }
    return DEFAULT_SETTINGS;
  },

  async updateSettings(patch) {
    const current = await this.getSettings();
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'settings', 'config'), updated);
    } catch (e) {
      console.error("Firestore updateSettings error", e);
    }
    return updated;
  },

  // --- CUSTOMERS ---
  async getCustomers() {
    try {
      const q = query(collection(db, 'customers'));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      // If collection is empty, seed 1 single customer in Firestore
      try {
        await setDoc(doc(db, 'customers', SINGLE_INITIAL_CUSTOMER[0].id), SINGLE_INITIAL_CUSTOMER[0]);
      } catch (e) {
        console.warn("Firestore customer seed warning", e);
      }
      return SINGLE_INITIAL_CUSTOMER;
    } catch (err) {
      console.error("Firestore getCustomers error", err);
      return SINGLE_INITIAL_CUSTOMER;
    }
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
    try {
      await setDoc(doc(db, 'customers', newCust.id), newCust);
    } catch (e) {
      console.error("Firestore addCustomer error", e);
    }
    return newCust;
  },

  async updateCustomer(id, patch) {
    const patchData = { ...patch, updatedAt: new Date().toISOString() };
    try {
      await updateDoc(doc(db, 'customers', id), patchData);
    } catch (e) {
      console.error("Firestore updateCustomer error", e);
    }
    const all = await this.getCustomers();
    return all.find(c => c.id === id);
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
    try {
      let q;
      if (dateStr) {
        q = query(collection(db, 'daily_tiffin'), where('date', '==', dateStr));
      } else {
        q = query(collection(db, 'daily_tiffin'));
      }
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.error("Firestore getDailyTiffinsByDate error", e);
    }
    return [];
  },

  async saveDailyTiffinConfirmations(dateStr, meal, confirmationList) {
    const promises = confirmationList.map(async (item) => {
      const rec = {
        id: `tif-${item.customerId}-${dateStr}-${meal}`,
        customerId: item.customerId,
        customerName: item.customerName,
        date: dateStr,
        meal: meal,
        status: item.status,
        quantity: Number(item.quantity) || 1,
        priceAtTime: Number(item.priceAtTime) || 0,
        amount: item.status === 'confirmed' ? (Number(item.quantity) * Number(item.priceAtTime)) : 0,
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'daily_tiffin', rec.id), rec);
      } catch (e) {
        console.error("Firestore saveDailyTiffin error", e);
      }
      return rec;
    });
    return Promise.all(promises);
  },

  // --- EXPENSES ---
  async getExpenses() {
    try {
      const q = query(collection(db, 'expenses'));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.error("Firestore getExpenses error", e);
    }
    return [];
  },

  async addExpense(expenseData) {
    const newExp = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'expenses', newExp.id), newExp);
    } catch (e) {
      console.error("Firestore addExpense error", e);
    }
    return newExp;
  },

  async deleteExpense(id) {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (e) {
      console.error("Firestore deleteExpense error", e);
    }
    return true;
  },

  // --- PAYMENTS & CUSTOMER LEDGER ---
  async getPayments() {
    try {
      const q = query(collection(db, 'payments'));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.error("Firestore getPayments error", e);
    }
    return [];
  },

  async addPayment(paymentData) {
    const newPay = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'payments', newPay.id), newPay);
    } catch (e) {
      console.error("Firestore addPayment error", e);
    }
    return newPay;
  },

  // --- CATERING ORDERS ---
  async getCateringOrders() {
    try {
      const q = query(collection(db, 'catering_orders'));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.error("Firestore getCateringOrders error", e);
    }
    return [];
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
    try {
      await setDoc(doc(db, 'catering_orders', newCat.id), newCat);
    } catch (e) {
      console.error("Firestore addCateringOrder error", e);
    }
    return newCat;
  },

  async addCateringPayment(orderId, paymentAmount, paymentMode, notes, dateStr) {
    const orders = await this.getCateringOrders();
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

    try {
      await setDoc(doc(db, 'catering_orders', orderId), updatedOrder);
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
    } catch (e) {
      console.error("Firestore addCateringPayment error", e);
    }

    return updatedOrder;
  },

  async updateCateringStatus(orderId, newStatus) {
    try {
      await updateDoc(doc(db, 'catering_orders', orderId), { status: newStatus, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.error("Firestore updateCateringStatus error", e);
    }
    const orders = await this.getCateringOrders();
    return orders.find(o => o.id === orderId);
  },

  // --- BUSINESS COMPUTATION CALCULATORS ---
  async getCustomerLedger(customerId) {
    const allTiffins = await this.getDailyTiffinsByDate('');
    const allPayments = await this.getPayments();

    const custTiffins = allTiffins.filter(t => t.customerId === customerId && t.status === 'confirmed');
    const custPayments = allPayments.filter(p => p.customerId === customerId);

    const totalBilled = custTiffins.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalPaid = custPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pendingBalance = Math.max(0, totalBilled - totalPaid);

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
    const allCustomers = await this.getCustomers();
    const allTiffins = await this.getDailyTiffinsByDate('');
    const allExpenses = await this.getExpenses();
    const allPayments = await this.getPayments();
    const allCatering = await this.getCateringOrders();

    const todayTiffins = allTiffins.filter(t => t.date === todayStr && t.status === 'confirmed');
    const todayLunchCount = todayTiffins.filter(t => t.meal === 'lunch').reduce((sum, t) => sum + t.quantity, 0);
    const todayDinnerCount = todayTiffins.filter(t => t.meal === 'dinner').reduce((sum, t) => sum + t.quantity, 0);
    const todayTiffinIncome = todayTiffins.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const todayExpenses = allExpenses
      .filter(e => e.date === todayStr)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const todayProfit = todayTiffinIncome - todayExpenses;

    let totalPendingPayments = 0;
    for (const cust of allCustomers) {
      const custTiffins = allTiffins.filter(t => t.customerId === cust.id && t.status === 'confirmed');
      const custPayments = allPayments.filter(p => p.customerId === cust.id);
      const billed = custTiffins.reduce((s, t) => s + (Number(t.amount) || 0), 0);
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
