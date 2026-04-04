"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, 
  Activity, 
  Clock, 
  Zap, 
  ShieldCheck, 
  ShieldAlert,
  Search,
  Settings,
  X,
  Play
} from "lucide-react";

const API_BASE = "http://localhost:3005/admin";

export default function WorkerStateSimulation() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users`);
        setWorkers(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };
    fetchWorkers();
    const interval = setInterval(fetchWorkers, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex justify-between items-center bg-[#111] p-8 rounded-[40px] border border-white/5 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-amber-500/10 transition-all duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
           <div className="p-5 bg-amber-600 shadow-2xl shadow-amber-600/30 rounded-3xl border border-amber-400/30">
              <Users size={32} className="text-white ring-4 ring-white/10" />
           </div>
           <div className="flex-1">
              <div className="text-[11px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Worker Integrity Controller</div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Modify Agent Behavior</h1>
              <p className="text-slate-500 mt-2 font-medium">Injection points for forced behavioral states and GPS patterns.</p>
           </div>
           <div className="flex gap-2">
              <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-slate-400 transition-all text-[11px] font-black uppercase tracking-widest"><Search size={16}/> Filter Registry</button>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {workers.map(worker => {
            const lastState = worker.workerStates?.[0];
            const hasOverrides = worker.forcedOrdersPerHour !== null || worker.forcedMotion !== null || worker.forcedGpsPattern !== null;
            
            return (
               <div key={worker.id} className={`group p-8 rounded-[40px] border transition-all hover:scale-[1.02] shadow-2xl cursor-pointer relative overflow-hidden ${
                  hasOverrides ? 'bg-amber-500/5 border-amber-500/30 ring-4 ring-amber-500/10' : 'bg-[#111] border-white/5 hover:border-blue-500/30'
               }`} onClick={() => setSelectedWorker(worker)}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all" />
                  
                  <div className="relative z-10 space-y-6">
                     <div className="flex justify-between items-start">
                        <div>
                           <h2 className="text-xl font-black text-white uppercase tracking-tighter">{worker.name}</h2>
                           <div className="text-[10px] text-zinc-500 font-black uppercase flex items-center gap-2 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> {worker.platform} · {worker.phone}
                           </div>
                        </div>
                        {hasOverrides && (
                           <div className="p-2 bg-amber-600/20 rounded-xl border border-amber-500/30 animate-pulse">
                              <Zap size={14} className="text-amber-500" />
                           </div>
                        )}
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <WorkerStat label="Order/Hr" value={lastState?.ordersPerHour || 0} unit="req" color="blue" />
                        <WorkerStat label="Motion" value={lastState?.motion || "IDLE"} unit="" color="emerald" />
                     </div>

                     <div className="pt-4 border-t border-white/5 flex justify-between items-center group-hover:px-2 transition-all">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                           <Clock size={12} /> Last Heartbeat: {lastState?.timestamp ? new Date(lastState.timestamp).toLocaleTimeString() : "N/A"}
                        </div>
                        <button className="p-2 bg-white/5 hover:bg-black rounded-xl border border-white/10 text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                           <Settings size={14} />
                        </button>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>

      {selectedWorker && (
         <WorkerOverrideModal 
            worker={selectedWorker} 
            onClose={() => setSelectedWorker(null)} 
            onSave={() => setSelectedWorker(null)}
         />
      )}
    </div>
  );
}

function WorkerOverrideModal({ worker, onClose, onSave }) {
  const [data, setData] = useState({
    forcedOrdersPerHour: worker.forcedOrdersPerHour ?? null,
    forcedMotion: worker.forcedMotion ?? null,
    forcedGpsPattern: worker.forcedGpsPattern ?? null
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/simulation/worker/${worker.id}`, data);
      onSave();
    } catch (e) {
      alert("Failed to inject simulation overrides.");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-[#111] border border-white/10 p-12 rounded-[50px] w-full max-w-lg shadow-[0_0_100px_rgba(37,99,235,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 space-y-10">
             <header className="flex justify-between items-center">
                <div>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Modify Agent Behavior</h3>
                   <p className="text-slate-500 text-sm font-medium mt-1">Injecting behavioral state for worker: <span className="text-blue-500 font-bold uppercase tracking-widest">{worker.name}</span></p>
                </div>
                <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-500/10 rounded-2xl border border-white/10 text-slate-400 hover:text-rose-500 transition-all"><X size={20}/></button>
             </header>

             <div className="space-y-8">
                <OverrideSelect 
                   label="Forced Orders per Hour"
                   value={data.forcedOrdersPerHour ?? ""}
                   onChange={v => setData({...data, forcedOrdersPerHour: v === "" ? null : parseFloat(v)})}
                   options={[
                      { label: "Live System Behavior (Default)", value: "" },
                      { label: "0.0 (Global Demand Crash Trigger)", value: "0" },
                      { label: "0.5 (Severe Lag/Delay)", value: "0.5" },
                      { label: "1.2 (Normal Operations)", value: "1.2" },
                      { label: "8.0 (Extreme Peak Mode)", value: "8" },
                   ]}
                />

                <OverrideSelect 
                   label="Forced Motion State"
                   value={data.forcedMotion ?? ""}
                   onChange={v => setData({...data, forcedMotion: v === "" ? null : v})}
                   options={[
                      { label: "Live Sensor Feed", value: "" },
                      { label: "Static (Simulated Fraud Attack)", value: "static" },
                      { label: "High-Frequency Motion (Active Delivery)", value: "moving" },
                   ]}
                />

                <OverrideSelect 
                   label="GPS Integrity Pattern"
                   value={data.forcedGpsPattern ?? ""}
                   onChange={v => setData({...data, forcedGpsPattern: v === "" ? null : v})}
                   options={[
                      { label: "Valid & Smooth History", value: "" },
                      { label: "Anomaly Detected (GPS Spoofing)", value: "anomaly" },
                      { label: "Discontinuous/Jump (Teleport Fraud)", value: "teleport" },
                   ]}
                />
             </div>

             <div className="flex gap-4 pt-4">
                <button onClick={onClose} className="flex-1 py-5 bg-white/5 hover:bg-white/10 font-black text-[12px] uppercase tracking-widest rounded-[24px] text-slate-500 transition-all">Cancel Signal</button>
                <button onClick={save} disabled={saving} className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/30 font-black text-[12px] uppercase tracking-widest rounded-[24px] text-white flex items-center justify-center gap-3 transition-all">
                   {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <Play size={16} />}
                   {saving ? 'Transmitting...' : 'Inject Signals'}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

function OverrideSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-3 group/select">
       <label className="text-[10px] font-black uppercase text-slate-600 group-hover/select:text-blue-500 transition-colors tracking-widest">{label}</label>
       <select 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="w-full bg-black/40 border border-white/5 rounded-3xl p-5 text-sm font-bold text-slate-300 focus:border-blue-500/50 outline-none transition-all ring-4 ring-white/[0.01] hover:bg-black/60"
       >
          {options.map(opt => (
             <option key={opt.value} value={opt.value} className="bg-[#111]">{opt.label}</option>
          ))}
       </select>
    </div>
  );
}

function WorkerStat({ label, value, unit, color }) {
  const colors = {
    blue: "text-blue-500",
    emerald: "text-emerald-500",
    rose: "text-rose-500"
  };
  return (
    <div className="p-4 bg-black/40 rounded-3xl border border-white/5 text-center">
       <div className="text-[9px] font-black uppercase text-slate-600 tracking-tighter mb-1">{label}</div>
       <div className={`text-lg font-black ${colors[color]}`}>{value}<span className="text-[10px] ml-0.5 opacity-50 uppercase">{unit}</span></div>
    </div>
  );
}
