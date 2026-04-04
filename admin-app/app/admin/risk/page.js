"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Map as MapIcon, 
  MapPin, 
  Activity, 
  TrendingUp, 
  Users, 
  ShieldAlert,
  ShieldCheck,
  Zap,
  Package,
  TrendingDown,
  CloudRain,
  Thermometer,
  Zap as WindIcon
} from "lucide-react";

import { API_BASE } from "../../config";

export default function RiskMap() {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res = await axios.get(`${API_BASE}/risk/zones`);
        setZones(res.data);
        if (res.data.length > 0 && !selectedZone) {
          setSelectedZone(res.data[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };
    fetchRisk();
    const interval = setInterval(fetchRisk, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center bg-[#111] p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MapIcon className="text-blue-500" /> Geographic Risk Map
          </h1>
          <p className="text-slate-500 text-sm">Zone-based parametric exposure analysis</p>
        </div>
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 px-4 group">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse ring-4 ring-rose-500/10" />
             <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Active Alerts</span>
          </div>
          <div className="flex items-center gap-2 px-4">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l border-white/10 pl-4 ml-2">Total Zones: {zones.length}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-8 min-h-0">
        <div className="flex-1 bg-[#111] rounded-[40px] border border-white/5 relative overflow-hidden group shadow-2xl">
           {/* Grid Map Representation */}
           <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 p-8 gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
              {zones.length > 0 ? [...Array(24)].map((_, i) => {
                const zone = zones[i % zones.length];
                const isSelected = selectedZone?.id === zone.id;
                const riskColor = 
                  zone.risk === 'HIGH' ? 'bg-rose-500/20 border-rose-500/40 text-rose-500' : 
                  zone.risk === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 
                  'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';

                return (
                  <div 
                    key={i}
                    onClick={() => setSelectedZone(zone)}
                    className={`rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group/card relative ${
                      isSelected ? 'ring-4 ring-blue-500/30 scale-105 z-10' : 'hover:scale-[1.02]'
                    } ${riskColor}`}
                  >
                     <div className={`p-2 rounded-xl bg-black/40 border border-white/5 shadow-lg`}>
                        <MapPin size={16} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-tighter text-center">{zone.name.split(' ')[1] || zone.name}</span>
                     {zone.risk === 'HIGH' && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20 animate-pulse" />
                     )}
                  </div>
                );
              }) : (
                <div className="col-span-6 row-span-4 flex items-center justify-center text-slate-500 italic">No geographic risk data available.</div>
              )}
           </div>
           
           {/* Scan Overlay Effect */}
           <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500/20 after:animate-scan" />
        </div>

        <aside className="w-[380px] bg-[#111] rounded-[40px] border border-white/5 overflow-y-auto p-10 space-y-10 shadow-2xl relative border-t-blue-500/20 border-t-2">
           {selectedZone ? (
             <>
               <header>
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 px-1">Selected Sector</div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedZone.name}</h2>
                  <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase ring-4 ${
                    selectedZone.risk === 'HIGH' ? 'bg-rose-500/5 border-rose-500/30 text-rose-500 ring-rose-500/5' : 'bg-emerald-500/5 border-emerald-500/30 text-emerald-500 ring-emerald-500/5'
                  }`}>
                    {selectedZone.risk} Risk Profile
                  </div>
               </header>

               <section className="grid grid-cols-2 gap-4">
                  <StatBox label="Active Rain" value={`${selectedZone.rain}mm`} icon={<CloudRain size={16} className="text-blue-500"/>} trend="UP" />
                  <StatBox label="Payout Prob" value="84%" icon={<TrendingUp size={16} className="text-amber-500"/>} trend="UP" />
               </section>

               <section className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Environmental Delta</h4>
                  <div className="space-y-4">
                     <ParamItem label="Temperature" value="34.2°C" icon={<Thermometer size={14}/>} color="rose" />
                     <ParamItem label="Air Quality" value="Moderate" icon={<WindIcon size={14}/>} color="amber" />
                     <ParamItem label="Delivery Density" value="HIGH" icon={<Users size={14}/>} color="blue" />
                  </div>
               </section>

               <section className="p-6 bg-blue-600/5 border border-blue-600/10 rounded-3xl group/action">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase mb-4 flex items-center justify-between">
                     Sector Insights <Zap size={14} className="group-hover/action:text-yellow-400 transition-colors" />
                  </h4>
                  <p className="text-[11px] leading-relaxed text-blue-300 font-medium">
                     High rain intensity + demand surge detected. Parametric claim generation is highly likely in the next 15 minutes. Recommend premium adjustment for new policies.
                  </p>
               </section>
             </>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-600 italic text-center p-8">
                Select a sector on the grid map to view environmental risk decomposition.
             </div>
           )}
        </aside>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, trend }) {
  return (
    <div className="p-5 bg-black/40 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all group">
      <div className="flex justify-between items-center mb-2">
        <div className="p-2 bg-white/5 rounded-xl border border-white/10">{icon}</div>
        <div className={`text-[12px] font-black ${trend === 'UP' ? 'text-rose-500' : 'text-emerald-500'}`}>
          {trend === 'UP' ? '▲' : '▼'}
        </div>
      </div>
      <div className="text-sm font-black text-slate-500 uppercase tracking-tighter mb-1">{label}</div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function ParamItem({ label, value, icon, color }) {
  const colors = {
    rose: "text-rose-400 bg-rose-500/10",
    amber: "text-amber-400 bg-amber-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10"
  };
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors[color]} border border-white/5 transition-transform group-hover:scale-110`}>{icon}</div>
          <span className="text-[11px] font-black text-slate-500 uppercase">{label}</span>
       </div>
       <span className="text-[12px] font-bold text-white font-mono">{value}</span>
    </div>
  );
}
