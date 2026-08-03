import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Plus, TrendingUp, X } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const CATEGORY_PRESETS = ['Food', 'Fuel', 'Rent', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'];

function MoneyPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [credits, setCredits] = useState([]);
  const [tab, setTab] = useState('transactions');
  const [loading, setLoading] = useState(true);

  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState('INCOME');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState(CATEGORY_PRESETS[0]);
  const [txCustomCategory, setTxCustomCategory] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txNote, setTxNote] = useState('');

  const [showCrModal, setShowCrModal] = useState(false);
  const [crDirection, setCrDirection] = useState('i_owe');
  const [crAmount, setCrAmount] = useState('');
  const [crCounterparty, setCrCounterparty] = useState('');
  const [crDate, setCrDate] = useState(new Date().toISOString().slice(0, 10));
  const [crNote, setCrNote] = useState('');

  const fetchAll = async () => {
    if (!token) return;
    try {
      const [moneyData, creditData] = await Promise.all([
        apiFetch('/money', { method: 'GET' }, token),
        apiFetch('/money/credits', { method: 'GET' }, token),
      ]);
      setEntries(moneyData.filter(e => e.type === 'INCOME' || e.type === 'EXPENSE'));
      setCredits(creditData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }, [token]);

  const summary = useMemo(() => {
    const income = entries.filter((item) => item.type === 'INCOME').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = entries.filter((item) => item.type === 'EXPENSE').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const net = income - expenses;
    const creditTotal = credits.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { income, expenses, net, creditTotal };
  }, [credits, entries]);

  const totalBalance = useMemo(() => {
    const txBal = entries.reduce((acc, entry) => {
      if (entry.type === 'INCOME') return acc + Number(entry.amount);
      if (entry.type === 'EXPENSE') return acc - Number(entry.amount);
      return acc;
    }, 0);
    const crBal = credits.reduce((acc, entry) => {
      if (entry.direction === 'i_owe') return acc + Number(entry.amount);
      if (entry.direction === 'they_owe') return acc - Number(entry.amount);
      return acc;
    }, 0);
    return txBal + crBal;
  }, [entries, credits]);

  const chartData = useMemo(() => {
    const grouped = {};
    entries.forEach((item) => {
      const month = new Date(item.date).toLocaleDateString(undefined, { month: 'short' });
      if (!grouped[month]) grouped[month] = { label: month, income: 0, expense: 0 };
      if (item.type === 'INCOME') grouped[month].income += Number(item.amount || 0);
      if (item.type === 'EXPENSE') grouped[month].expense += Number(item.amount || 0);
    });
    return Object.values(grouped).slice(-6);
  }, [entries]);

  const handleAddTx = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/money', {
        method: 'POST',
        body: JSON.stringify({
          type: txType,
          amount: txAmount,
          category: txCategory === 'custom' ? txCustomCategory : txCategory,
          date: txDate,
          note: txNote
        })
      }, token);
      setShowTxModal(false);
      fetchAll();
      // Reset form
      setTxAmount('');
      setTxNote('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCr = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/money', {
        method: 'POST',
        body: JSON.stringify({
          type: 'CREDIT',
          direction: crDirection,
          amount: crAmount,
          counterparty: crCounterparty,
          date: crDate,
          note: crNote
        })
      }, token);
      setShowCrModal(false);
      fetchAll();
      // Reset form
      setCrAmount('');
      setCrCounterparty('');
      setCrNote('');
    } catch (err) {
      console.error(err);
    }
  };

  const markCreditPaid = async (id) => {
    try {
      await apiFetch(`/money/credits/${id}/paid`, { method: 'PUT' }, token);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16"><div className="skeleton h-72 rounded-3xl" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 relative">
      {/* Top Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Finance</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Money tracker</h1>
        </div>
        <Card className={`px-6 py-4 flex items-center justify-between min-w-[250px] ${totalBalance >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <div className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Balance</div>
          <div className={`text-3xl font-black ${totalBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            ${totalBalance.toFixed(2)}
          </div>
        </Card>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {['transactions', 'credits'].map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab === item ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {item}
            </button>
          ))}
        </div>
        <Button className="gap-2" onClick={() => tab === 'transactions' ? setShowTxModal(true) : setShowCrModal(true)}>
          <Plus className="h-4 w-4" /> Add {tab === 'transactions' ? 'transaction' : 'credit'}
        </Button>
      </div>

      {tab === 'transactions' ? (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card className="bg-emerald-50 border-emerald-100">
              <div className="mb-2 flex items-center justify-between text-sm text-emerald-700"><span>Total income</span><ArrowUpRight className="h-4 w-4" /></div>
              <div className="text-3xl font-black text-emerald-700">${summary.income.toFixed(2)}</div>
            </Card>
            <Card className="bg-rose-50 border-rose-100">
              <div className="mb-2 flex items-center justify-between text-sm text-rose-700"><span>Expenses</span><ArrowDownRight className="h-4 w-4" /></div>
              <div className="text-3xl font-black text-rose-700">${summary.expenses.toFixed(2)}</div>
            </Card>
            <Card className="bg-slate-900 text-white border-slate-800">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Net Cash Flow</span><TrendingUp className="h-4 w-4" /></div>
              <div className={`text-3xl font-black ${summary.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${summary.net.toFixed(2)}</div>
            </Card>
          </div>

          <Card className="mb-8 p-4 border-slate-200 shadow-sm">
            <div className="mb-4 text-lg font-bold text-slate-900">Cash flow overview</div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                  <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="space-y-4">
            {entries.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 font-medium">No transactions yet.</div> : entries.map((entry) => (
              <Card key={entry.id} className="flex items-center justify-between gap-4 p-5 hover:border-slate-300 transition-colors">
                <div>
                  <div className="text-lg font-bold text-slate-900">{entry.category}</div>
                  <div className="text-sm text-slate-500 font-medium">{entry.note || 'No note'} <span className="mx-2 text-slate-300">•</span> {entry.date}</div>
                </div>
                <div className={`text-xl font-black ${entry.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {entry.type === 'INCOME' ? '+' : '-'}${Number(entry.amount).toFixed(2)}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4 mt-8">
            {credits.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 font-medium">No active credits.</div> : credits.map((credit) => (
              <Card key={credit.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:border-slate-300 transition-colors">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">
                    {credit.direction === 'i_owe' ? 'I owe someone' : 'Someone owes me'}
                  </div>
                  <div className="text-xl font-bold text-slate-900">{credit.counterparty || 'Unspecified counterparty'}</div>
                  <div className="text-sm text-slate-500 font-medium">{credit.note || 'No note'} <span className="mx-2 text-slate-300">•</span> {credit.date}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-black ${credit.direction === 'they_owe' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${Number(credit.amount).toFixed(2)}
                  </div>
                  <Button variant="secondary" onClick={() => markCreditPaid(credit.id)} className="text-sm font-bold shadow-sm">Mark as Paid</Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Add Transaction</h2>
              <button onClick={() => setShowTxModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTx} className="space-y-5">
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button type="button" onClick={() => setTxType('INCOME')} className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${txType === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Income</button>
                <button type="button" onClick={() => setTxType('EXPENSE')} className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${txType === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Expense</button>
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Amount</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-400 font-bold">$</span>
                  </div>
                  <input type="number" required min="0.01" step="0.01" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} className="block w-full rounded-xl border-slate-200 bg-slate-50 pl-8 focus:border-primary-500 focus:ring-primary-500 p-3 outline-none focus:ring-2" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Category</label>
                <select value={txCategory} onChange={(e) => setTxCategory(e.target.value)} className="block w-full rounded-xl border-slate-200 bg-slate-50 p-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500">
                  {CATEGORY_PRESETS.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="custom">Custom...</option>
                </select>
                {txCategory === 'custom' && (
                  <input type="text" required placeholder="Enter custom category" value={txCustomCategory} onChange={(e) => setTxCustomCategory(e.target.value)} className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 p-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500" />
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Date</label>
                <input type="date" required value={txDate} onChange={(e) => setTxDate(e.target.value)} className="block w-full rounded-xl border-slate-200 bg-slate-50 p-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Note (Optional)</label>
                <input type="text" value={txNote} onChange={(e) => setTxNote(e.target.value)} className="block w-full rounded-xl border-slate-200 bg-slate-50 p-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500" placeholder="E.g. Groceries at Walmart" />
              </div>

              <Button type="submit" className="w-full py-3 text-base">Save Transaction</Button>
            </form>
          </div>
        </div>
      )}

      {/* Credit Modal */}
      {showCrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Add Credit</h2>
              <button onClick={() => setShowCrModal(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCr} className="space-y-5">
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button type="button" onClick={() => setCrDirection('i_owe')} className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${crDirection === 'i_owe' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>I owe someone</button>
                <button type="button" onClick={() => setCrDirection('they_owe')} className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${crDirection === 'they_owe' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Someone owes me</button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Counterparty Name</label>
                <input type="text" required value={crCounterparty} onChange={(e) => setCrCounterparty(e.target.value)} className="block w-full rounded-xl border-slate-200 bg-slate-50 p-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500" placeholder="E.g. John Doe" />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Amount</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-400 font-bold">$</span>
                  </div>
                  <input type="number" required min="0.01" step="0.01" value={crAmount} onChange={(e) => setCrAmount(e.target.value)} className="block w-full rounded-xl border-slate-200 bg-slate-50 pl-8 focus:border-primary-500 focus:ring-primary-500 p-3 outline-none focus:ring-2" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Date</label>
                <input type="date" required value={crDate} onChange={(e) => setCrDate(e.target.value)} className="block w-full rounded-xl border-slate-200 bg-slate-50 p-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Note (Optional)</label>
                <input type="text" value={crNote} onChange={(e) => setCrNote(e.target.value)} className="block w-full rounded-xl border-slate-200 bg-slate-50 p-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500" placeholder="E.g. Dinner split" />
              </div>

              <Button type="submit" className="w-full py-3 text-base">Save Credit</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoneyPage;
