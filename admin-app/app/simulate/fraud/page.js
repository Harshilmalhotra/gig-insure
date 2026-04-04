"use client";

import { useState } from "react";
import axios from "axios";
import { 
  ShieldAlert, 
  MapPin, 
  Zap, 
  Trash2,
  Play,
  Activity,
  Maximize2,
  Users,
  Target,
  Globe,
  Settings
} from "lucide-react";

import { API_BASE } from "../../config";

export default function FraudControl() {
  const [params, setParams] = useState({
    gpsSpoof: false,
    motionMismatch: false,
    bulkUsers: 1,
    targetZone: "Chennai South"
  });
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/simulation/scenario`, { scenario: "FRAUD_ATTACK" });
      alert("Network Integrity Compromised: Fraud cluster simulation active.");
    } catch (err) {
      alert("Trigger Failed: Anomaly engine reject signal.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fadeIn duration-1000">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-rose-600/10 px-6 py-2 rounded-full border border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-[0.3em]">
           <ShieldAlert size={14} className="animate-pulse" /> Security Stress Engine
        </div>
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Fraud Injection</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Simulate coordinated fraud attacks to test the PoWI network's detection and automated mitigation protocols.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-[#111] p-10 rounded-[50px] border border-white/5 shadow-3xl hover:border-rose-500/20 transition-all group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-rose-500/10 transition-all duration-1000" />
            <h2 className="text-xl font-black text-rose-500 uppercase tracking-widest mb-8 flex items-center gap-3">
               <Target size={20} /> Anomaly Profiles
            </h2>
            <div className="space-y-6">
               <ToggleOption 
                  label="GPS Spoofing" 
                  description="Inject coordinate jumps and static GPS signatures." 
                  active={params.gpsSpoof}
                  onClick={() => setParams({...params, gpsSpoof: !params.gpsSpoof})}
               />
               <ToggleOption 
                  label="Motion Sensor Sync" 
                  description="Simulated motion mismatch with active delivery states." 
                  active={params.motionMismatch}
                  onClick={() => setParams({...params, motionMismatch: !params.motionMismatch})}
               />
               <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500">
                     <span>Attack Magnitude</span>
                     <span className="text-rose-500">{params.bulkUsers} Agents</span>
                  </div>
                  <input 
                     type="range" min="1" max="100" value={params.bulkUsers} 
                     onChange={e => setParams({...params, bulkUsers: parseInt(e.target.value)})}
                     className="w-full h-2 bg-black/60 rounded-full appearance-none cursor-pointer accent-rose-600 ring-2 ring-rose-500/10"
                  />
               </div>
            </div>
         </div>

         <div className="flex flex-col gap-8">
            <div className="bg-[#111] p-10 rounded-[50px] border border-white/5 shadow-2xl flex-1 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-rose-500/10 transition-all duration-1000" />
               <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                  <Globe size={20} className="text-blue-500" /> Regional Target
               </h2>
               <div className="space-y-6">
                  <div className="space-y-3 group/select">
                     <label className="text-[10px] font-black uppercase text-slate-600 group-hover/select:text-blue-500 transition-colors tracking-widest">Target Deployment Zone</label>
                     <select 
                        value={params.targetZone}
                        onChange={e => setParams({...params, targetZone: e.target.value})}
                        className="w-full bg-black/40 border border-white/5 rounded-3xl p-5 text-sm font-bold text-slate-300 focus:border-blue-500/50 outline-none transition-all ring-4 ring-white/[0.01]"
                     >
                        <option value="Chennai South">Chennai South (Cluster Demo)</option>
                        <option value="Mumbai West">Mumbai West</option>
                        <option value="Pune Central">Pune Central</option>
                        <option value="Bangalore East">Bangalore East</option>
                     </select>
                  </div>
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                     <p className="text-[10px] leading-relaxed text-blue-300 font-medium italic">
                        Selecting a zone will congregate all simulated spoofed agents in a single coordinate cluster for advanced forensic analysis testing.
                     </p>
                  </div>
               </div>
            </div>

            <button 
               onClick={handleTrigger}
               disabled={loading}
               className={`w-full py-8 rounded-[40px] font-black text-xl uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(239,68,68,0.2)] bg-rose-600 hover:bg-rose-500 active:scale-[0.98] ${
                  loading ? 'opacity-50 grayscale' : ''
               }`}
            >
               {loading ? <Activity className="animate-spin" /> : <Play size={24} />}
               Execute Attack
            </button>
         </div>
      </div>

      <div className="bg-[#111] p-10 rounded-[50px] border border-white/5 relative overflow-hidden group shadow-2xl">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
               <Settings size={20} className="text-slate-500" /> Active Simulation Payloads
            </h2>
            <button className="text-[10px] font-black text-slate-500 uppercase hover:text-rose-500 transition-colors flex items-center gap-2">
               <Trash2 size={14} /> Purge Network
            </button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PayloadCard 
               label="GPS_SYNC_OFFSET" 
               status="INERT" 
               value="0.00ms"
            />
            <PayloadCard 
               label="MOTION_ERR_PROB" 
               status="INERT" 
               value="0%"
            />
            <PayloadCard 
               label="COORDINATED_CLUSTER" 
               status="READY" 
               value="INACTIVE"
            />
         </div>
      </div>
    </div>
  );
}

function ToggleOption({ label, description, active, onClick }) {
  return (
    <div 
       onClick={onClick}
       className={`p-6 rounded-3xl border cursor-pointer transition-all flex justify-between items-center group/tog ${
          active ? 'bg-rose-500/10 border-rose-500/40 shadow-lg' : 'bg-black/40 border-white/5 hover:border-white/10'
       }`}
    >
       <div className="space-y-1">
          <div className={`text-sm font-black uppercase tracking-widest transition-colors ${active ? 'text-rose-500' : 'text-slate-300'}`}>{label}</div>
          <div className="text-[10px] text-slate-600 font-bold max-w-[200px] leading-tight italic">{description}</div>
       </div>
       <div className={`w-12 h-6 rounded-full border relative transition-colors ${active ? 'bg-rose-600 border-rose-500' : 'bg-black border-white/10'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${active ? 'left-7 bg-white shadow-lg' : 'left-1 bg-slate-800'}`} />
       </div>
    </div>
  );
}

function PayloadCard({ label, status, value }) {
  return (
    <div className="p-6 bg-black/40 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all flex flex-col items-center gap-4 group/p">
       <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover/p:text-blue-500 transition-colors">{label}</div>
       <div className="text-xl font-black text-white font-mono tracking-tighter">{value}</div>
       <div className={`text-[9px] font-black uppercase tracking-tighter px-3 py-1 rounded-full border ${
          status === 'READY' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' : 'text-slate-700 bg-black/40 border-white/5'
       }`}>
          {status}
       </div>
    </div>
  );
}
