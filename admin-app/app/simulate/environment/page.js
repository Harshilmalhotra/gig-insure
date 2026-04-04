"use client";

import { useState } from "react";
import axios from "axios";
import { 
  CloudRain, 
  Thermometer, 
  Wind, 
  TrendingDown, 
  Activity, 
  Zap,
  Globe,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

const API_BASE = "http://localhost:3005/admin";

export default function EnvironmentControl() {
  const [params, setParams] = useState({
    rain: 0,
    temperature: 30,
    aqi: 50,
    demandLevel: "medium",
    platformStatus: "online"
  });
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/simulation/environment`, params);
      alert("Reality Shift Successful: Environment state has been propagated across the network.");
    } catch (err) {
      alert("Reality Shift Failed: Communication with the core simulation engine lost.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-1000">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-blue-600/10 px-6 py-2 rounded-full border border-blue-500/20 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">
           <Globe size={14} className="animate-spin-slow" /> Global Environment Controller
        </div>
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Modify Reality</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Adjust environmental parameters to trigger parametric claims and stress test the decision engine.
        </p>
      </header>

      <div className="bg-[#111] p-12 rounded-[50px] border border-white/5 shadow-3xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -mr-32 -mt-32" />
         
         <div className="space-y-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <SimSlider 
                  label="Rainfall Intensity" 
                  unit="mm" 
                  value={params.rain} 
                  min={0} max={100} 
                  onChange={v => setParams({...params, rain: v})} 
                  icon={<CloudRain size={24} className="text-blue-500" />} 
                  description="Above 30mm triggers monsoon payouts."
               />
               <SimSlider 
                  label="Ambient Temperature" 
                  unit="°C" 
                  value={params.temperature} 
                  min={10} max={50} 
                  onChange={v => setParams({...params, temperature: v})} 
                  icon={<Thermometer size={24} className="text-rose-500" />} 
                  description="Heatwave settlements trigger at extreme levels."
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <SimSlider 
                  label="Air Quality Index" 
                  unit="AQI" 
                  value={params.aqi} 
                  min={0} max={500} 
                  onChange={v => setParams({...params, aqi: v})} 
                  icon={<Wind size={24} className="text-amber-500" />} 
                  description="Affects health & insurance multiplier."
               />
               
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-lg shrink-0">
                        <TrendingDown size={24} className="text-emerald-500" />
                     </div>
                     <div className="flex-1">
                        <label className="text-sm font-black text-white uppercase tracking-widest block mb-1">Global Demand</label>
                        <select 
                           value={params.demandLevel}
                           onChange={e => setParams({...params, demandLevel: e.target.value})}
                           className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold text-slate-300 focus:border-blue-500/50 outline-none transition-all"
                        >
                           <option value="low">Low (Demand Crash Scenario)</option>
                           <option value="medium">Medium (Nominal Operations)</option>
                           <option value="high">High (Surge/High Stress)</option>
                        </select>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-lg shrink-0">
                        <Zap size={24} className="text-rose-600" />
                     </div>
                     <div className="flex-1">
                        <label className="text-sm font-black text-white uppercase tracking-widest block mb-1">Platform Status</label>
                        <select 
                           value={params.platformStatus}
                           onChange={e => setParams({...params, platformStatus: e.target.value})}
                           className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-bold text-slate-300 focus:border-blue-500/50 outline-none transition-all"
                        >
                           <option value="online">Protocol Stable (Online)</option>
                           <option value="outage">Critical Failure (Outage)</option>
                        </select>
                     </div>
                  </div>
               </div>
            </div>

            <button 
               onClick={handleApply}
               disabled={loading}
               className={`w-full py-6 rounded-[30px] font-black text-lg uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group/btn ${
                  loading ? 'bg-slate-800' : 'bg-blue-600 hover:bg-blue-500'
               }`}
            >
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-center duration-500" />
               {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
               Apply Reality Shift
            </button>
         </div>
      </div>

      <footer className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[40px] flex items-start gap-6">
         <div className="p-4 bg-rose-500/10 rounded-3xl border border-rose-500/20 shadow-xl shadow-rose-500/5">
            <AlertTriangle className="text-rose-500" size={28} />
         </div>
         <div className="space-y-2">
            <h4 className="text-rose-500 font-black uppercase text-sm tracking-widest">Protocol Warning</h4>
            <p className="text-rose-300/80 text-xs font-medium leading-relaxed italic max-w-xl">
               Changes made here are irreversible once propagated. High rain values will instantly trigger claim evaluations for all 128 active workers. Ensure the backend worker state is synced before applying.
            </p>
         </div>
      </footer>
    </div>
  );
}

function SimSlider({ label, unit, value, min, max, onChange, icon, description }) {
  return (
    <div className="space-y-6 group/slider">
       <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-lg group-hover/slider:scale-110 transition-transform">{icon}</div>
             <div>
                <label className="text-sm font-black text-white uppercase tracking-widest block mb-0.5">{label}</label>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">{description}</div>
             </div>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-2xl">
             <span className="text-xl font-black text-blue-500 font-mono tracking-tighter">{value}{unit}</span>
          </div>
       </div>
       <div className="relative group/range p-1 bg-black/40 rounded-full border border-white/5 ring-4 ring-white/[0.02]">
          <input 
            type="range" min={min} max={max} value={value} 
            onChange={e => onChange(parseInt(e.target.value))}
            className="w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer accent-blue-600 z-10"
          />
       </div>
    </div>
  );
}
