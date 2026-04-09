'use client';
import AdminNav from '@/components/AdminNav';
import { Users, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';

const lossData = [
  { month: 'Nov', premiums: 72000, payouts: 44000 },
  { month: 'Dec', premiums: 84000, payouts: 52000 },
  { month: 'Jan', premiums: 96000, payouts: 58000 },
  { month: 'Feb', premiums: 112000, payouts: 71000 },
  { month: 'Mar', premiums: 128000, payouts: 65000 },
  { month: 'Apr', premiums: 134000, payouts: 70000 },
];

const fraudTrend = [
  { day: 'Mon', rate: 3.2 },
  { day: 'Tue', rate: 2.8 },
  { day: 'Wed', rate: 4.1 },
  { day: 'Thu', rate: 3.5 },
  { day: 'Fri', rate: 2.9 },
  { day: 'Sat', rate: 5.2 },
  { day: 'Sun', rate: 3.8 },
];

const RECENT_CLAIMS = [
  { id: 'CLM-4521', worker: 'Ramesh K.',  trigger: 'Heavy Rain',      amt: '₹425', powi: '87%', status: 'PAID',    sc: 'badge-green' },
  { id: 'CLM-4519', worker: 'Priya S.',   trigger: 'Demand Crash',    amt: '₹310', powi: '62%', status: 'REVIEW',  sc: 'badge-yellow' },
  { id: 'CLM-4517', worker: 'Ahmed R.',   trigger: 'App Outage',      amt: '₹500', powi: '91%', status: 'PAID',    sc: 'badge-green' },
  { id: 'CLM-4512', worker: 'Sonia M.',   trigger: 'Heavy Rain',      amt: '₹0',   powi: '19%', status: 'FLAGGED', sc: 'badge-red' },
  { id: 'CLM-4508', worker: 'Kiran T.',   trigger: 'Heat Wave',       amt: '₹280', powi: '76%', status: 'PAID',    sc: 'badge-green' },
];

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c0c1a] border border-[#1a1a2e] rounded-xl px-3 py-2.5 text-xs">
      <div className="text-gray-500 mb-1.5 font-semibold">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="text-white font-mono font-semibold">₹{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function LineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c0c1a] border border-[#1a1a2e] rounded-xl px-3 py-2 text-xs">
      <div className="text-gray-500">{label}</div>
      <div className="text-yellow-400 font-mono font-bold">{payload[0].value}%</div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminNav>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">System Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Live · 2 Apr 2026</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-green-400 bg-green-400/8 border border-green-400/20 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            All systems operational
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Workers',  val: '2,841', icon: Users,         delta: '+124 today',      color: 'text-indigo-400' },
            { label: 'Active Policies', val: '1,209', icon: Shield,         delta: '42.5% of users',  color: 'text-indigo-400' },
            { label: 'Loss Ratio',      val: '52.2%', icon: TrendingUp,     delta: '-3.1% vs last mo',color: 'text-green-400' },
            { label: 'Fraud Rate',      val: '3.8%',  icon: AlertTriangle,  delta: '+0.4% today',     color: 'text-yellow-400' },
          ].map(({ label, val, icon: Icon, delta, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <Icon size={16} className={color} />
                <span className="text-[10px] text-gray-600">{delta}</span>
              </div>
              <div className={`text-2xl font-bold font-mono ${color}`}>{val}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-white">Premiums vs Payouts</h3>
            <p className="text-xs text-gray-600 mt-0.5 mb-5">6-month view (₹)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={lossData} barGap={3}>
                <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="premiums" name="Premiums" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="payouts"  name="Payouts"  fill="#f97316" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-white">Fraud Rate — This Week</h3>
            <p className="text-xs text-gray-600 mt-0.5 mb-5">% of claims flagged by engine</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={fraudTrend}>
                <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} />
                <Tooltip content={<LineTooltip />} />
                <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claims table */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Recent Claims</h3>
            <a href="/claims" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#1a1a2e]">
                <tr>
                  {['Claim ID', 'Worker', 'Trigger', 'Amount', 'PoWI', 'Status'].map(h => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_CLAIMS.map(({ id, worker, trigger, amt, powi, status, sc }) => (
                  <tr key={id} className="table-row">
                    <td className="td font-mono text-indigo-400 text-xs">{id}</td>
                    <td className="td text-gray-300">{worker}</td>
                    <td className="td text-gray-500 text-xs">{trigger}</td>
                    <td className="td font-mono font-bold text-white">{amt}</td>
                    <td className="td font-mono text-gray-400">{powi}</td>
                    <td className="td"><span className={sc}>{status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminNav>
  );
}
