"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Archive, 
  MapPin, 
  Activity, 
  Clock, 
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Package,
  TrendingDown,
  CloudRain
} from "lucide-react";

import { API_BASE } from "../../config";

export default function ClaimsEngine() {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await axios.get(`${API_BASE}/claims`);
        setClaims(res.data);
        if (res.data.length > 0 && !selectedClaim) {
          setSelectedClaim(res.data[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };
    fetchClaims();
    const interval = setInterval(fetchClaims, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-120px)] flex gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="mb-6 flex justify-between items-center bg-[#111] p-6 rounded-3xl border border-white/5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Archive className="text-blue-500" /> Claims Engine
            </h1>
            <p className="text-slate-500 text-sm">Reviewing live parametric settlements</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 transition-all"><Search size={18}/></button>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 transition-all"><Filter size={18}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#111] rounded-3xl border border-white/5">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#111] border-b border-white/5 text-[10px] uppercase font-black text-slate-500">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Event Trigger</th>
                <th className="px-6 py-4 text-right">Settlement</th>
                <th className="px-6 py-4 text-center">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {claims.map(claim => (
                <tr 
                  key={claim.id} 
                  onClick={() => setSelectedClaim(claim)}
                  className={`cursor-pointer transition-all ${
                    selectedClaim?.id === claim.id ? "bg-blue-600/10" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-mono text-slate-500">#{claim.id.slice(0, 8)}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{new Date(claim.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-sm">{claim.user.name}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-black tracking-tight">{claim.user.platform} · {claim.user.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TriggerIcon type={claim.triggerType} />
                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-300">{claim.triggerType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-lg text-emerald-400">₹{claim.payoutAmount.toFixed(0)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <StatusBadge status={claim.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Inspector Panel */}
      <aside className="w-[400px] flex shrink-0 flex-col bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        {selectedClaim ? (
          <>
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-blue-600/5 to-transparent">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Claim Inspector</h3>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-black text-white">₹{selectedClaim.payoutAmount.toFixed(0)}</div>
                <StatusBadge status={selectedClaim.status} large />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Trigger Analysis */}
              <section className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-blue-400 flex items-center gap-2">
                  <Activity size={14}/> Forensic Analysis
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <InspectorCard label="Trigger" value={selectedClaim.triggerType} subValue="Parametric Hit" />
                  <InspectorCard label="Loss Est" value={`₹${(selectedClaim.payoutAmount * 1.25).toFixed(0)}`} subValue="Direct Revenue" />
                </div>
                <div className="mt-4 space-y-2">
                   <InspectorSignal label="Rainfall Data" value="+28mm (Threshold 20mm)" status="TRIGGERED" />
                   <InspectorSignal label="Demand Signal" value="3.2 (Drop: 1.2)" status="NORMAL" />
                </div>
              </section>

              {/* PoWI Validation */}
              <section className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-2">
                  <ShieldCheck size={14}/> PoWI Intelligence
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Activity Score</span>
                    <span className={`text-[10px] font-black ${selectedClaim.activityScore > 0.7 ? "text-emerald-500" : "text-amber-500"}`}>
                      {(selectedClaim.activityScore * 100).toFixed(0)}% VALID
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Fraud Score</span>
                    <span className={`text-[10px] font-black ${selectedClaim.fraudScore < 0.3 ? "text-blue-400" : "text-rose-500"}`}>
                      {(selectedClaim.fraudScore * 100).toFixed(0)}% RISK
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 italic leading-relaxed">
                  Decentralized sensors confirmed motion at {new Date(selectedClaim.createdAt).toLocaleTimeString()} with smooth GPS telemetry.
                </p>
              </section>

              {/* Verdict */}
              <section className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                 <h4 className="text-[10px] font-black uppercase text-white mb-2 underline overline decoration-blue-500 underline-offset-4">Settlement Hash</h4>
                 <div className="font-mono text-[9px] text-slate-500 break-all leading-normal">
                   0x{selectedClaim.id.replace(/-/g, "")}
                 </div>
              </section>
            </div>

            <div className="p-6 border-t border-white/5 bg-[#181818]">
               <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
                 Execute Transfer <ArrowRight size={16}/>
               </button>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-600 italic p-12 text-center text-sm">
            Select a claim from the engine to view deep signal decomposition.
          </div>
        )}
      </aside>
    </div>
  );
}

function StatusBadge({ status, large }) {
  const sizeClass = large ? "px-4 py-2 text-xs" : "px-3 py-1 text-[9px]";
  if (status === 'PAID') return <span className={`${sizeClass} font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full uppercase tracking-widest`}>Paid</span>;
  if (status === 'REJECTED') return <span className={`${sizeClass} font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full uppercase tracking-widest`}>Fraud</span>;
  return <span className={`${sizeClass} font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full uppercase tracking-widest`}>Pending</span>;
}

function TriggerIcon({ type }) {
  if (type === 'RAIN') return <CloudRain className="w-3.5 h-3.5 text-blue-400" />;
  if (type === 'HEAT') return <TrendingDown className="w-3.5 h-3.5 text-rose-400 rotate-180" />;
  if (type === 'DEMAND_CRASH') return <TrendingDown className="w-3.5 h-3.5 text-amber-400" />;
  if (type === 'OUTAGE') return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
  return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
}

function InspectorCard({ label, value, subValue }) {
  return (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="text-[9px] font-black text-slate-600 uppercase mb-1">{label}</div>
      <div className="text-lg font-black text-white">{value}</div>
      <div className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">{subValue}</div>
    </div>
  );
}

function InspectorSignal({ label, value, status }) {
  return (
    <div className="flex justify-between items-center text-[10px] p-2 hover:bg-white/[0.02] rounded-lg group">
       <span className="text-slate-500 font-bold">{label}</span>
       <div className="flex items-center gap-2">
         <span className="text-slate-400 font-mono">{value}</span>
         <span className={`font-black tracking-widest ${status === 'TRIGGERED' ? 'text-blue-500' : 'text-slate-700'}`}>
           {status}
         </span>
       </div>
    </div>
  );
}
