"use client";

import { useState } from "react";
import axios from "axios";
import { 
  CloudRain, 
  TrendingDown, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Play, 
  Activity,
  Globe,
  RefreshCw,
  Box,
  Layers,
  ArrowRight
} from "lucide-react";

const API_BASE = "http://localhost:3005/admin";

export default function ScenarioEngine() {
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarios = [
    { 
      id: "HEAVY_RAIN", 
      title: "Monsoon Blast", 
      desc: "Simulate 60mm rainfall with demand surge. Triggers global monsoon payouts.", 
      icon: <CloudRain size={32} className="text-blue-500" />,
      color: "blue"
    },
    { 
      id: "DEMAND_CRASH", 
      title: "Platform Crash", 
      desc: "Simulate 80% drop in order volume across all platforms. Triggers demand-based payouts.", 
      icon: <TrendingDown size={32} className="text-amber-500" />,
      color: "amber"
    },
    { 
      id: "FRAUD_ATTACK", 
      title: "Fraud Offensive", 
      desc: "Inject 25 coordinate-synced GPS spoofing agents in Chennai South cluster.", 
      icon: <ShieldAlert size={32} className="text-rose-500" />,
      color: "rose"
    },
    { 
      id: "PLATFORM_OUTAGE", 
      title: "Protocol Failure", 
      desc: "Simulate global API outage. Triggers stability-based protection settlements.", 
      icon: <Zap size={32} className="text-rose-600" />,
      color: "rose"
    }
  ];

  const triggerScenario = async (id) => {
    setLoading(true);
    setActiveScenario(id);
    try {
      await axios.post(`${API_BASE}/simulation/scenario`, { scenario: id });
      alert(`Scenario ${id} initialized across the network core.`);
    } catch (err) {
      alert("Scenario injection failed: Communication with the simulation oracle lost.");
    }
    setLoading(false);
  };

  const resetSystem = async () => {
    setLoading(true);
    setActiveScenario("RESET");
    try {
      await axios.post(`${API_BASE}/simulation/scenario`, { scenario: "NORMAL" });
      alert("System state reset to nominal baseline.");
    } catch (err) {
      alert("Protocol Error: Unable to purge simulation state.");
    }
    setLoading(false);
    setActiveScenario(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fadeIn duration-1000">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-blue-600/10 px-6 py-2 rounded-full border border-blue-500/20 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">
           <Layers size={14} className="animate-pulse" /> Automated Scenario Engine
        </div>
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter">One-Click Reality</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
           Execute predefined global stress tests. Each scenario triggers a chain reaction across the backend, worker app, and admin dashboard.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {scenarios.map(scen => (
            <div 
               key={scen.id} 
               onClick={() => triggerScenario(scen.id)}
               className={`group p-10 rounded-[50px] border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-3xl relative overflow-hidden flex flex-col justify-between h-96 ${
                  activeScenario === scen.id ? 'bg-blue-600/10 border-blue-500/40 ring-4 ring-blue-500/10 scale-105' : 'bg-[#111] border-white/5 hover:border-white/10'
               }`}
            >
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full -mr-24 -mt-24 group-hover:bg-blue-500/10 transition-all duration-1000" />
               
               <div className="relative z-10 space-y-8">
                  <div className={`p-6 bg-white/5 rounded-3xl border border-white/10 w-fit shadow-xl shadow-black/50 group-hover:scale-110 transition-transform`}>
                     {scen.icon}
                  </div>
                  <div>
                     <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">{scen.title}</h2>
                     <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">{scen.desc}</p>
                  </div>
               </div>

               <div className="relative z-10 flex items-center justify-between mt-8 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest border border-white/5 px-2 py-1 rounded-lg">Impact: High</span>
                     <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest border border-blue-500/10 px-2 py-1 rounded-lg">Auto-payout</span>
                  </div>
                  <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl shadow-blue-600/20">
                     {activeScenario === scen.id && loading ? <Activity className="animate-spin" size={24} /> : <Play size={24} />}
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="pt-12 text-center">
         <button 
            onClick={resetSystem}
            disabled={loading}
            className="inline-flex items-center gap-4 px-12 py-6 bg-black border-2 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/5 text-emerald-500 rounded-full font-black uppercase tracking-[0.4em] text-[12px] transition-all shadow-2xl hover:shadow-emerald-500/20 active:scale-[0.98]"
         >
            {activeScenario === "RESET" && loading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            Purge State & Reset Reality
         </button>
      </div>

      <div className="bg-[#111] p-12 rounded-[50px] border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all duration-1000" />
         <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
            <Box size={24} className="text-blue-500 shrink-0" /> Execution Pipeline
         </h2>
         <div className="relative border-l border-white/10 ml-3 space-y-12 pb-4">
            <PipelineStep 
               step="1" 
               title="Update Simulation State" 
               desc="Backend state is updated with the selected environmental parameters."
            />
            <PipelineStep 
               step="2" 
               title="Trigger Decision Engine" 
               desc="Network-wide oracles evaluate active policies against the new reality."
            />
            <PipelineStep 
               step="3" 
               title="Propagate Changes" 
               desc="Worker app UI reacts instantly through high-frequency polling/WS."
            />
            <PipelineStep 
               step="4" 
               title="Settle Parametric Claims" 
               desc="Claims ledger is populated and payouts are initiated automatically."
            />
         </div>
      </div>
    </div>
  );
}

function PipelineStep({ step, title, desc }) {
  return (
    <div className="relative pl-12 group/step">
       <div className="absolute -left-4 top-0 w-8 h-8 bg-black border-2 border-white/10 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 group-hover/step:border-blue-600 group-hover/step:text-blue-500 group-hover/step:scale-110 transition-all z-10 shadow-lg">
          {step}
       </div>
       <div className="absolute -left-1 top-4 w-4 h-0.5 bg-white/10 group-hover/step:bg-blue-600 transition-colors" />
       <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover/step:text-blue-500 transition-colors">{title}</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-lg font-medium">{desc}</p>
       </div>
    </div>
  );
}
