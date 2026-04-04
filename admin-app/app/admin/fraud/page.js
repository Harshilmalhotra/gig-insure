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

import { API_BASE } from "../../config";

export default function FraudIntelligence() {
  const [fraudStats, setFraudStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [resolving, setResolving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fraud/stats`);
      setFraudStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id, status, notes) => {
    setResolving(true);
    try {
      await axios.post(`${API_BASE}/claims/${id}/resolve`, { status, notes });
      await fetchData();
      setSelectedReview(null);
    } catch (e) {
      alert("Resolution failed");
    } finally {
      setResolving(false);
    }
  };

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

      {/* REVIEW MODAL */}
      {selectedReview && (
        <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <div>
                    <h3 className="text-xl font-black text-white uppercase italic">Forensic Review</h3>
                    <p className="text-[10px] font-black text-rose-500 uppercase">Claim ID: {selectedReview.id.slice(0,8)}</p>
                 </div>
                 <button onClick={() => setSelectedReview(null)} className="p-3 bg-zinc-900 rounded-2xl hover:bg-zinc-800 text-zinc-500 transition-colors">Close</button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="aspect-video bg-black rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 relative group overflow-hidden">
                       {selectedReview.evidenceUrl ? (
                          <video 
                            src={selectedReview.evidenceUrl} 
                            controls 
                            autoPlay 
                            className="absolute inset-0 w-full h-full object-contain bg-black z-20"
                          />
                       ) : (
                          <>
                             <div className="absolute inset-0 bg-rose-500/10 opacity-50" />
                             <Share2 className="text-white/20 w-12 h-12 relative z-10" />
                             <p className="text-[10px] font-black text-white/40 uppercase relative z-10 tracking-widest">Evidence Video Unavailable</p>
                             <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 w-[40%]" />
                             </div>
                          </>
                       )}
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                       <p className="text-[8px] font-black text-slate-500 uppercase">System Flag</p>
                       <p className="text-xs font-bold text-rose-400 italic">"GPS Coordinates displaced +0.4km without IMU motion sync"</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase">Worker</span>
                          <span className="text-xs font-bold text-white">{selectedReview.user.name}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase">Platform</span>
                          <span className="text-xs font-bold text-blue-500 uppercase tracking-tighter">{selectedReview.user.platform}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase">Fraud Score</span>
                          <span className="text-xs font-black text-rose-500">{(selectedReview.fraudScore * 100).toFixed(0)}%</span>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-3">
                       <button 
                        disabled={resolving}
                        onClick={() => handleResolve(selectedReview.id, 'PAID', 'Review confirmed authentic behavior.')}
                        className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                       >
                         Approve Payout (₹{selectedReview.payoutAmount})
                       </button>
                       <button 
                        disabled={resolving}
                        onClick={() => handleResolve(selectedReview.id, 'REJECTED', 'Fraud detected. Profile flagged.')}
                        className="w-full py-4 bg-rose-500 text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
                       >
                         Deny Claim
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

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
              <th className="px-8 py-4">Status</th>
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
                  <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${
                        claim.status === 'PAID' ? 'bg-emerald-500' :
                        claim.status === 'FLAGGED' ? 'bg-rose-500 animate-pulse' :
                        claim.status === 'PENDING_REVIEW' ? 'bg-blue-500 animate-bounce' : 'bg-zinc-500'
                     }`} />
                     <span className={`text-[10px] font-black uppercase ${
                        claim.status === 'PAID' ? 'text-emerald-500' :
                        claim.status === 'FLAGGED' ? 'text-rose-500' :
                        claim.status === 'PENDING_REVIEW' ? 'text-blue-500' : 'text-zinc-500'
                     }`}>
                        {claim.status}
                     </span>
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                   {(claim.status === 'FLAGGED' || claim.status === 'PENDING_REVIEW') ? (
                     <button 
                      onClick={() => setSelectedReview(claim)}
                      className="px-4 py-1.5 bg-blue-500 text-black text-[10px] font-black rounded-lg uppercase hover:bg-blue-400 transition-colors"
                     >
                        Review Proof
                     </button>
                   ) : (
                     <span className="text-[10px] font-black text-zinc-600 uppercase italic">Resolved</span>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
