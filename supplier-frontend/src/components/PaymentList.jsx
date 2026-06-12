import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  SUCCESS:  { label: 'Success',  bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: '✓' },
  PENDING:  { label: 'Pending',  bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   icon: '⏳' },
  FAILED:   { label: 'Failed',   bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400',     icon: '✕' },
  REFUNDED: { label: 'Refunded', bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-400',  icon: '↩' },
};

const METHOD_CONFIG = {
  CARD:   { icon: '💳', label: 'Card',   bg: 'bg-blue-50',   text: 'text-blue-700'  },
  UPI:    { icon: '📲', label: 'UPI',    bg: 'bg-green-50',  text: 'text-green-700' },
  WALLET: { icon: '👛', label: 'Wallet', bg: 'bg-amber-50',  text: 'text-amber-700' },
  NET:    { icon: '🏦', label: 'NetBanking', bg: 'bg-slate-100', text: 'text-slate-600' },
};

function getMethodConfig(payment) {
  const raw = (payment.paymentMethod || payment.method || '').toUpperCase();
  if (raw.includes('CARD')) return METHOD_CONFIG.CARD;
  if (raw.includes('UPI'))  return METHOD_CONFIG.UPI;
  if (raw.includes('WALLET') || raw.includes('PAYTM') || raw.includes('PHONEPE')) return METHOD_CONFIG.WALLET;
  if (raw.includes('NET') || raw.includes('BANK')) return METHOD_CONFIG.NET;
  return METHOD_CONFIG.CARD; // default
}

function PaymentCard({ payment }) {
  const status = payment.status || 'PENDING';
  const scfg   = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const mcfg   = getMethodConfig(payment);
  const date   = new Date(payment.paymentDate || Date.now());
  const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white group">
      <div className="flex items-center gap-4">

        {/* Method icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${mcfg.bg}`}>
          {mcfg.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-semibold text-slate-800">
              Order <span className="font-mono">#{payment.orderId}</span>
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${scfg.bg} ${scfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${scfg.dot}`}></span>
              {scfg.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 text-xs text-slate-400">
            <span className={`font-medium ${mcfg.text}`}>{mcfg.label}</span>
            {payment.transactionId && (
              <span className="font-mono truncate max-w-[160px]">TXN: {payment.transactionId}</span>
            )}
            <span>{dateStr} · {timeStr}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <p className={`text-lg font-bold ${status === 'REFUNDED' ? 'text-purple-600' : status === 'FAILED' ? 'text-red-400' : 'text-slate-800'}`}>
            {status === 'REFUNDED' ? '−' : ''}${payment.amount?.toFixed(2) ?? '—'}
          </p>
          {status === 'REFUNDED' && (
            <p className="text-xs text-purple-500 mt-0.5">Refunded</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('ALL');

  const loadPayments = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user    = userStr ? JSON.parse(userStr) : null;
      if (!user?.id) { setPayments([]); return; }

      const ordersRes   = await API.get(`/orders/user/${user.id}`);
      const orderIds    = new Set(ordersRes.data.map(o => o.id));
      const paymentsRes = await API.get('/payments');
      setPayments(paymentsRes.data.filter(p => orderIds.has(p.orderId)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  const FILTERS = ['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'];
  const visible  = filter === 'ALL' ? payments : payments.filter(p => (p.status || 'PENDING') === filter);

  const totalSpent    = payments.filter(p => p.status === 'SUCCESS').reduce((s,p) => s+(p.amount||0), 0);
  const totalRefunded = payments.filter(p => p.status === 'REFUNDED').reduce((s,p) => s+(p.amount||0), 0);
  const successRate   = payments.length ? Math.round((payments.filter(p=>p.status==='SUCCESS').length / payments.length)*100) : 0;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? `All (${payments.length})` : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button
          onClick={loadPayments}
          className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary strip */}
      {payments.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-400 mb-0.5">Total paid</p>
            <p className="text-base font-semibold text-blue-600">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-400 mb-0.5">Refunded</p>
            <p className="text-base font-semibold text-purple-600">${totalRefunded.toFixed(2)}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-400 mb-0.5">Success rate</p>
            <p className="text-base font-semibold text-emerald-600">{successRate}%</p>
          </div>
        </div>
      )}

      {/* Payment cards */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-sm font-medium text-slate-500">
            {filter === 'ALL' ? "No payments yet." : `No ${filter.toLowerCase()} payments.`}
          </p>
          {filter === 'ALL' && <p className="text-xs mt-1">Place an order to see payment history.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(payment => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentList;