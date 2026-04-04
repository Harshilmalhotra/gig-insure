"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  ShieldAlert, 
  MapPin, 
  Activity, 
  TrendingUp, 
  Users, 
  AlertCircle,
  Zap,
  Target,
  Share2
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const API_BASE = "http://localhost:3005/admin";

export default function FraudIntelligence() {
  const [fraudStats, setFraudStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/fraud/stats`);
        setFraudStats(res.data);
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

  const pieData = [
    { name: 'Low Risk', value: fraudStats?.distribution.lowRisk, color: '#3b82f6' },
    { name: 'Medium Risk', value: fraudStats?.distribution.mediumRisk, color: '#f59e0b' },
    { name: 'High Risk', value: fraudStats?.distribution.highRisk, color: '#ef4444' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <ShieldAlert className="text-rose-500" /> Fraud Intelligence
        </h1>
        <p className="text-slate-500 mt-1">PoWI-based anomaly detection & network clusters</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#111] p-8 rounded-3xl border border-white/5">
           <h2 className="text-lg font-black text-white mb-8 flex items-center gap-2">
             <TrendingUp className="w-4 h-4 text-rose-500" /> Fraud Trend (Anomalies/Hr)
           </h2>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={fraudStats?.hourlyStats || []}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                 <XAxis dataKey="n" stroke="#444" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                 <YAxis stroke="#444" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                 <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px'}} />
                 <Bar dataKey="v" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-[#111] p-8 rounded-3xl border border-white/5 flex flex-col">
           <h2 className="text-lg font-black text-white mb-8 flex items-center gap-2">
             <Target className="w-4 h-4 text-blue-400" /> Distribution
           </h2>
           <div className="flex-1 min-h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px'}} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-4 space-y-2">
              {pieData.map(item => (
                <div key={item.name} className="flex justify-between items-center text-[10px] uppercase font-black">
                  <span className="text-slate-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: item.color}} /> {item.name}
                  </span>
                  <span className="text-white">{item.value} users</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="bg-rose-500/5 border border-rose-500/10 p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-rose-500/20 transition-all duration-1000" />
         <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="p-6 bg-rose-500/10 rounded-3xl border border-rose-500/20 shadow-xl shadow-rose-500/10 ring-4 ring-rose-500/5 animate-pulse">
               <Share2 size={48} className="text-rose-500" />
            </div>
            <div className="flex-1 space-y-6">
               <div>
                  <h2 className="text-3xl font-black text-rose-500 uppercase tracking-tighter mb-2">Cluster Detection: Active Danger Zone</h2>
                  <p className="text-rose-300 text-lg font-bold">25+ Users flagged in <span className="bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">Chennai South</span> within 10 minutes</p>
               </div>
               <div className="flex flex-wrap gap-4">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex-1 backdrop-blur-sm">
                     <div className="text-[10px] font-black text-rose-400 uppercase mb-1">Pattern Detected</div>
                     <div className="text-sm font-bold text-white uppercase italic">GPS Spoof + Static Motion Sync</div>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex-1 backdrop-blur-sm">
                     <div className="text-[10px] font-black text-rose-400 uppercase mb-1">Impact Level</div>
                     <div className="text-sm font-bold text-white uppercase italic">CRITICAL - System-wide lockout</div>
                  </div>
               </div>
               <button className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-rose-500/30 active:scale-[0.98]">
                  Deploy Network Counter-Measures
               </button>
            </div>
         </div>
      </div>

      <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#181818]/50">
          <h2 className="text-xl font-black text-white">Flagged Claims Forensic</h2>
          <span className="text-[10px] font-black bg-rose-500/20 text-rose-500 px-3 py-1 rounded-full border border-rose-500/30 uppercase tracking-wide">Under Investigation</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#181818] text-[10px] uppercase font-black text-slate-500">
            <tr>
              <th className="px-8 py-4">User</th>
              <th className="px-8 py-4">Anomaly Signal</th>
              <th className="px-8 py-4">Risk Score</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {fraudStats?.recentFlagged.map(claim => (
              <tr key={claim.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-4">
                  <div className="font-bold text-white text-sm">{claim.user.name}</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-black">{claim.user.phone}</div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/20 italic">
                    {claim.fraudScore > 0.8 ? 'GPS Teleport detected' : 'Motion mismatch sensors'}
                  </span>
                </td>
                <td className="px-8 py-4">
                   <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{width: `${claim.fraudScore * 100}%`}} />
                   </div>
                </td>
                <td className="px-8 py-4 text-right">
                   <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase underline underline-offset-4 decoration-2">Inspect Deep</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
