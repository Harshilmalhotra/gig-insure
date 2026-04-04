"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  ShieldCheck,
  Zap
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';

const API_BASE = "http://localhost:3005/admin";

export default function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, cRes] = await Promise.all([
          axios.get(`${API_BASE}/metrics`),
          axios.get(`${API_BASE}/claims`)
        ]);
        setMetrics(mRes.data);
        setClaims(cRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black text-white">System Overview</h1>
        <p className="text-slate-500 mt-1">Real-time health and financial metrics</p>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Users" value={metrics?.totalUsers} icon={<Users size={16}/>} color="blue" />
        <MetricCard label="Policies" value={metrics?.activePolicies} icon={<ShieldCheck size={16}/>} color="blue" />
        <MetricCard label="Premium" value={`₹${metrics?.totalPremiums}`} icon={<TrendingUp size={16}/>} color="emerald" />
        <MetricCard label="Payout" value={`₹${metrics?.totalPayouts}`} icon={<Zap size={16}/>} color="amber" />
        <MetricCard label="Loss Ratio" value={`${(metrics?.lossRatio * 100).toFixed(1)}%`} icon={<Activity size={16}/>} color="rose" />
        <MetricCard label="Fraud %" value={`${(metrics?.fraudRate * 100).toFixed(1)}%`} icon={<AlertCircle size={16}/>} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111] p-8 rounded-3xl border border-white/5 shadow-2xl">
          <h2 className="text-xl font-black mb-8 text-white">Premium vs Payout</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="n" stroke="#444" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis stroke="#444" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px'}} />
                <Line type="monotone" dataKey="p" stroke="#3b82f6" strokeWidth={3} dot={false} name="Premium" />
                <Line type="monotone" dataKey="pay" stroke="#f59e0b" strokeWidth={3} dot={false} name="Payout" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111] p-8 rounded-3xl border border-white/5 shadow-2xl">
          <h2 className="text-xl font-black mb-8 text-white">Claims Velocity</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={
                ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => ({
                  n: day,
                  v: claims.filter(c => {
                    const d = new Date(c.createdAt).getDay();
                    const dayMap = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5 };
                    return d === dayMap[day];
                  }).length
                }))
              }>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="n" stroke="#444" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis stroke="#444" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px'}} />
                <Bar dataKey="v" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-xl font-black text-white">Live Claims Ledger</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#181818] text-[10px] uppercase font-black text-slate-500">
            <tr>
              <th className="px-8 py-4">Time</th>
              <th className="px-8 py-4">User</th>
              <th className="px-8 py-4">Trigger</th>
              <th className="px-8 py-4">Payout</th>
              <th className="px-8 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {claims.slice(0, 5).map(claim => (
              <tr key={claim.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-4 text-xs text-slate-500">{new Date(claim.createdAt).toLocaleTimeString()}</td>
                <td className="px-8 py-4">
                  <div className="font-bold text-white">{claim.user.name}</div>
                  <div className="text-[10px] text-blue-500 font-black uppercase">{claim.user.platform}</div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[10px] font-black uppercase bg-white/5 px-2 py-1 rounded border border-white/10">{claim.triggerType}</span>
                </td>
                <td className="px-8 py-4 font-black text-emerald-400">₹{claim.payoutAmount.toFixed(0)}</td>
                <td className="px-8 py-4">
                   <StatusBadge status={claim.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }) {
  const colors = {
    blue: "text-blue-400 border-blue-500/20",
    emerald: "text-emerald-400 border-emerald-500/20",
    amber: "text-amber-400 border-amber-500/20",
    rose: "text-rose-400 border-rose-500/20",
  };
  return (
    <div className={`p-5 rounded-2xl bg-[#111] border ${colors[color]} shadow-xl`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
        <div className={colors[color]}>{icon}</div>
      </div>
      <div className="text-xl font-black text-white">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'PAID') return <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Paid</span>;
  if (status === 'REJECTED') return <span className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"/> Fraud</span>;
  return <span className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/> Pending</span>;
}
