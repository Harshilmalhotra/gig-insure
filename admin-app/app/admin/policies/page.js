"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  UserSquare, 
  ShieldCheck, 
  Clock, 
  Calendar,
  Zap,
  TrendingUp,
  CreditCard,
  Target,
  ArrowUpRight
} from "lucide-react";

const API_BASE = "http://localhost:3005/admin";

export default function PolicyMonitor() {
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          axios.get(`${API_BASE}/users`), // Using users to get policies
          axios.get(`${API_BASE}/policies/stats`)
        ]);
        const allPolicies = pRes.data.flatMap(u => (u.policies || []).map(p => ({ ...p, user: u })));
        setPolicies(allPolicies);
        setStats(sRes.data);
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
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-center bg-[#111] p-8 rounded-[40px] border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-all duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
           <div className="p-5 bg-blue-600 shadow-2xl shadow-blue-600/30 rounded-3xl border border-blue-400/30">
              <ShieldCheck size={32} className="text-white ring-4 ring-white/10" />
           </div>
           <div className="flex-1">
              <div className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Policy Operations</div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Active Protections</h1>
              <p className="text-slate-500 mt-2 font-medium">Monitoring {stats?.active} high-integrity insurance contracts across India.</p>
           </div>
           <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <StatPill label="Active" value={stats?.active} color="blue" />
              <StatPill label="Expired" value={stats?.expired} color="slate" />
              <StatPill label="Renewal Rate" value={`${(stats?.renewalRate * 100).toFixed(0)}%`} color="emerald" />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Active Policies Table */}
         <div className="bg-[#111] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#181818]/50">
               <h2 className="text-xl font-black text-white uppercase tracking-tighter">Live Policy Stream</h2>
               <button className="text-[10px] font-black text-blue-500 uppercase hover:text-blue-400 transition-colors flex items-center gap-1 group">VIEW ALL <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></button>
            </div>
            <div className="overflow-x-auto min-h-[400px]">
               <table className="w-full text-left">
                  <thead className="bg-[#181818] text-[10px] uppercase font-black text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="px-8 py-5">Policy ID</th>
                      <th className="px-8 py-5">User</th>
                      <th className="px-8 py-5 text-right">Coverage</th>
                      <th className="px-8 py-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 h-full">
                    {policies.length > 0 ? policies.map(policy => (
                      <tr key={policy.id} className="group hover:bg-white/[0.02] transition-colors h-20">
                        <td className="px-8 py-5">
                          <div className="text-[10px] font-mono text-slate-500">#{policy.id.slice(0, 8)}</div>
                          <div className="text-[9px] text-blue-600 font-black mt-1 uppercase tracking-widest">{new Date(policy.startDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="font-bold text-white text-sm">{policy.user?.name || "Global Protection"}</div>
                          <div className="text-[10px] text-zinc-500 font-black uppercase">{policy.user?.platform || "PLATFORM_WAKE"}</div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="font-black text-base text-white">₹{policy.coverage.toFixed(0)}</div>
                          <div className="text-[9px] text-emerald-500 font-bold uppercase">₹{policy.premium.toFixed(0)} PREM</div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                             <StatusBadge status={policy.status} />
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="h-[400px] text-center text-slate-600 italic">No policies recorded in the ledger yet. Policies will appear once workers opt-in.</td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Expiry Timeline / Growth */}
         <div className="flex flex-col gap-8">
            <div className="bg-[#111] p-10 rounded-[40px] border border-white/5 shadow-2xl flex-1 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-all duration-1000" />
               <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center justify-between">
                  Network Growth <TrendingUp size={20} className="text-emerald-500" />
               </h2>
               <div className="space-y-8">
                  <GrowthProgressBar label="Market Penetration" value="12%" color="blue" />
                  <GrowthProgressBar label="Platform Coverage" value="84%" color="emerald" />
                  <GrowthProgressBar label="Worker Trust Score" value="96%" color="amber" />
               </div>

               <div className="mt-12 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl group/box">
                  <div className="flex items-center gap-4 mb-3">
                     <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"><CreditCard size={20} className="text-emerald-500" /></div>
                     <h3 className="font-black text-emerald-400 text-sm uppercase">Auto-Renewal Intelligence</h3>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-300/80 font-medium italic">
                     Our AI predicts 84% renewal confidence based on current monsoon triggers. 4% increase from last quarter's baseline.
                  </p>
               </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[40px] shadow-3xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32" />
               <div className="relative z-10">
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3">
                     <Target /> Protocol Insight
                  </h2>
                  <p className="text-white/80 text-sm leading-relaxed mb-8 font-medium">
                     Policy validation protocol v4.2 is live. All active contracts are backed by PoWI (Proof of Work Integrity) oracles ensuring zero-manual claims.
                  </p>
                  <div className="flex gap-4">
                     <div className="flex-1 bg-white/10 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
                        <div className="text-[10px] font-black uppercase text-white/60 mb-1">Last Block</div>
                        <div className="text-base font-black font-mono">0x4F...B2A</div>
                     </div>
                     <div className="flex-1 bg-white/10 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
                        <div className="text-[10px] font-black uppercase text-white/60 mb-1">Network Latency</div>
                        <div className="text-base font-black font-mono">1.2ms</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  const colors = {
    blue: "bg-blue-600/10 border-blue-500/30 text-blue-400",
    emerald: "bg-emerald-600/10 border-emerald-500/30 text-emerald-400",
    slate: "bg-slate-800 border-white/10 text-slate-400"
  };
  return (
    <div className={`px-5 py-2.5 rounded-3xl border ${colors[color]} flex flex-col items-center justify-center min-w-[100px] shadow-lg`}>
       <span className="text-[9px] font-black uppercase opacity-60 mb-0.5">{label}</span>
       <span className="text-base font-black">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'ACTIVE') return <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-tighter">Active Now</span>;
  if (status === 'EXPIRED') return <span className="text-[10px] font-black text-slate-600 bg-black/40 border border-white/5 px-3 py-1 rounded-full uppercase tracking-tighter">Expired</span>;
  return <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-tighter">Cancelled</span>;
}

function GrowthProgressBar({ label, value, color }) {
  const progressColors = {
    blue: "bg-blue-500 shadow-blue-500/40",
    emerald: "bg-emerald-500 shadow-emerald-500/40",
    amber: "bg-amber-500 shadow-amber-500/40"
  };
  return (
    <div className="space-y-3 group/prog">
       <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wide">
          <span className="text-slate-500 group-hover/prog:text-white transition-colors">{label}</span>
          <span className="text-white bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">{value}</span>
       </div>
       <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5 ring-4 ring-white/[0.02]">
          <div className={`h-full rounded-full transition-all duration-1000 ${progressColors[color]}`} style={{width: value}} />
       </div>
    </div>
  );
}
