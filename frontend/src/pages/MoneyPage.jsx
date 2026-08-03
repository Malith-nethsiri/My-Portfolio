import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Plus, TrendingUp } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

function MoneyPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [credits, setCredits] = useState([]);
  const [tab, setTab] = useState('transactions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const [moneyData, creditData] = await Promise.all([
          apiFetch('/money', { method: 'GET' }, token),
          apiFetch('/money/credits', { method: 'GET' }, token),
        ]);
        setEntries(moneyData);
        setCredits(creditData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const summary = useMemo(() => {
    const income = entries.filter((item) => item.type === 'INCOME').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = entries.filter((item) => item.type === 'EXPENSE').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const net = income - expenses;
    const creditTotal = credits.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { income, expenses, net, creditTotal };
  }, [credits, entries]);

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

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16"><div className="skeleton h-72 rounded-3xl" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Finance</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Money tracker</h1>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add entry</Button>
      </div>

      <div className="mb-8 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {['transactions', 'credits'].map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === item ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {item}
          </button>
        ))}
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
            <Card className="bg-slate-900 text-white">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-200"><span>Net</span><TrendingUp className="h-4 w-4" /></div>
              <div className="text-3xl font-black text-white">${summary.net.toFixed(2)}</div>
            </Card>
          </div>

          <Card className="mb-8 p-4">
            <div className="mb-4 text-lg font-bold text-slate-900">Cash flow overview</div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="space-y-4">
            {entries.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No transactions yet.</div> : entries.map((entry) => (
              <Card key={entry.id} className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-bold text-slate-900">{entry.category}</div>
                  <div className="text-sm text-slate-500">{entry.note || 'No note'} · {entry.date}</div>
                </div>
                <div className={`text-lg font-bold ${entry.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {entry.type === 'INCOME' ? '+' : '-'}${Number(entry.amount).toFixed(2)}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <Card className="mb-8 p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Credit balance</div>
            <div className="mt-2 text-4xl font-black text-slate-900">${summary.creditTotal.toFixed(2)}</div>
          </Card>
          <div className="space-y-4">
            {credits.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No active credits.</div> : credits.map((credit) => (
              <Card key={credit.id} className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-bold text-slate-900">{credit.counterparty || 'Unspecified counterparty'}</div>
                  <div className="text-sm text-slate-500">{credit.note || 'No note'} · {credit.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-lg font-bold ${Number(credit.amount) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${Number(credit.amount).toFixed(2)}
                  </div>
                  <Button variant="secondary" className="text-xs">Mark as Paid</Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MoneyPage;
