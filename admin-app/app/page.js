"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Settings, 
  AlertCircle, 
  Users, 
  CheckCircle2, 
  XCircle,
  CloudRain,
  Thermometer,
  Zap,
  Clock
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

const API_BASE = "http://127.0.0.1:3001/admin";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [metrics, setMetrics] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [envParams, setEnvParams] = useState({
    rain: 0,
    temperature: 30,
    aqi: 50,
    demandLevel: "medium",
    platformStatus: "online"
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5s refresh
    return () => clearInterval(interval);
  }, []);

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

  const handleSimulate = async () => {
    try {
      await axios.post(`${API_BASE}/simulation/environment`, envParams);
      alert("Simulation updated!");
    } catch (err) {
      alert("Failed to update simulation");
    }
  };

  const setScenario = (scenario) => {
    switch(scenario) {
      case 'monsoon': 
        setEnvParams({ rain: 60, temperature: 24, aqi: 150, demandLevel: "high", platformStatus: "online" });
        break;
      case 'heatwave': 
        setEnvParams({ rain: 0, temperature: 46, aqi: 250, demandLevel: "low", platformStatus: "online" });
        break;
      case 'outage': 
        setEnvParams({ rain: 10, temperature: 30, aqi: 50, demandLevel: "high", platformStatus: "outage" });
        break;
      default:
        setEnvParams({ rain: 0, temperature: 30, aqi: 50, demandLevel: "medium", platformStatus: "online" });
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-blue-500">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-slate-200">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
            Gig-Insure <span className="text-sm font-normal text-slate-500 uppercase tracking-widest mt-2 ml-2 border-l border-slate-700 pl-4">Admin Dashboard</span>
          </h1>
          <p className="text-slate-500 mt-2">Parametric hybrid-signal insurance monitoring system</p>
        </div>
        
        <div className="flex bg-[#121212] rounded-xl p-1 border border-white/5">
          {["analytics", "simulation", "claims"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab 
                  ? "bg-blue-600/20 text-blue-400 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] border border-blue-600/30" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard label="Active Policies" value={metrics?.activePolicies} icon={<Users className="w-5 h-5" />} color="blue" />
            <MetricCard label="Total Premiums" value={`₹${metrics?.totalPremiums}`} icon={<TrendingUp className="w-5 h-5" />} color="emerald" />
            <MetricCard label="Claims Processed" value={metrics?.totalClaims} icon={<Activity className="w-5 h-5" />} color="amber" />
            <MetricCard label="Loss Ratio" value={`${(metrics?.lossRatio * 100).toFixed(1)}%`} icon={<AlertCircle className="w-5 h-5" />} color="rose" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Revenue Growth
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[{n: 'Mon', v: 400}, {n: 'Tue', v: 700}, {n: 'Wed', v: 500}, {n: 'Thu', v: 900}, {n: 'Fri', v: 1200}]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="n" stroke="#555" axisLine={false} tickLine={false} />
                    <YAxis stroke="#555" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px'}} />
                    <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={3} dot={{fill: '#3b82f6', r: 4}} activeDot={{r: 8}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Claims distribution
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{n: 'Rain', v: 12}, {n: 'Heat', v: 5}, {n: 'Demand', v: 8}, {n: 'Outage', v: 3}]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="n" stroke="#555" axisLine={false} tickLine={false} />
                    <YAxis stroke="#555" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px'}} />
                    <Bar dataKey="v" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Tab */}
      {activeTab === "simulation" && (
        <div className="animate-in slide-in-from-bottom duration-500 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 shadow-2xl space-y-10">
            <h2 className="text-2xl font-black text-white">Environment Control</h2>
            
            <div className="space-y-8">
              <SimSlider label="Rainfall (mm)" value={envParams.rain} min={0} max={100} 
                onChange={(v) => setEnvParams({...envParams, rain: v})} icon={<CloudRain />} />
              <SimSlider label="Temperature (°C)" value={envParams.temperature} min={0} max={50} 
                onChange={(v) => setEnvParams({...envParams, temperature: v})} icon={<Thermometer />} />
              <SimSlider label="AQI Level" value={envParams.aqi} min={0} max={500} 
                onChange={(v) => setEnvParams({...envParams, aqi: v})} icon={<Activity />} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-bold text-slate-500 block mb-2">Demand Level</label>
                <select 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={envParams.demandLevel}
                  onChange={(e) => setEnvParams({...envParams, demandLevel: e.target.value})}
                >
                  <option value="low">Low (Demand Crash)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Surge)</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-slate-500 block mb-2">Platform Status</label>
                <select 
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm"
                  value={envParams.platformStatus}
                  onChange={(e) => setEnvParams({...envParams, platformStatus: e.target.value})}
                >
                  <option value="online">Online</option>
                  <option value="outage">Outage (Simulated)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-[0_0_20px_-5px_rgba(37,99,235,0.6)] transition-all active:scale-[0.98]"
            >
              Update Reality (Simulation)
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-600/10 to-transparent p-8 rounded-3xl border border-blue-500/10 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Scenarios
              </h3>
              <p className="text-slate-400 text-sm mb-6">Instantly trigger global environment shifts to test decision engines.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <ScenarioCard title="Monsoon Blast" desc="Heavy rain + Surge" icon="🌧️" onClick={() => setScenario('monsoon')} />
                <ScenarioCard title="Heat Extremis" desc="46°C + Low Air Quality" icon="🔥" onClick={() => setScenario('heatwave')} />
                <ScenarioCard title="Server Outage" desc="Mock platform failure" icon="⚠️" onClick={() => setScenario('outage')} />
                <ScenarioCard title="Reset Peace" desc="Normal operational" icon="🧘" onClick={() => setScenario('reset')} />
              </div>
            </div>

            <div className="bg-[#121212] p-8 rounded-3xl border border-white/5">
              <h3 className="font-bold text-white mb-4">Simulation Logic</h3>
              <ul className="text-sm text-slate-500 space-y-3">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> Rain &gt; 30mm triggers Monsoon payouts</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Activity score affects payout multiplier</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"/> Fraud scores &gt; 0.7 auto-reject claims</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === "claims" && (
        <div className="animate-in fade-in duration-500">
           <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-[#1a1a1a] text-slate-500 text-xs uppercase font-black">
                  <tr>
                    <th className="px-6 py-4">Claim ID</th>
                    <th className="px-6 py-4">User / Platform</th>
                    <th className="px-6 py-4">Trigger</th>
                    <th className="px-6 py-4">Payout</th>
                    <th className="px-6 py-4">Scores</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {claims.map(claim => (
                    <tr key={claim.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">#{claim.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{claim.user.name}</div>
                        <div className="text-xs text-blue-500 uppercase font-black">{claim.user.platform}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold border border-white/10 uppercase">
                          {claim.triggerType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-xl text-emerald-400">₹{parseFloat(claim.payoutAmount).toFixed(0)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 text-[10px] uppercase font-bold">
                          <span className={claim.activityScore > 0.7 ? "text-emerald-500" : "text-amber-500"}>Act: {claim.activityScore}</span>
                          <span className={claim.fraudScore < 0.3 ? "text-blue-500" : "text-rose-500"}>Frd: {claim.fraudScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={claim.status} />
                      </td>
                    </tr>
                  ))}
                  {claims.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-20 text-center text-slate-600 italic">No claims generated yet. Start a simulation!</td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, color }) {
  const colors = {
    blue: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    emerald: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
    amber: "bg-amber-600/20 text-amber-400 border-amber-600/30",
    rose: "bg-rose-600/20 text-rose-400 border-rose-600/30",
  };
  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-black uppercase tracking-widest opacity-80">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function SimSlider({ label, value, min, max, onChange, icon }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
          {icon}
          {label}
        </label>
        <span className="font-mono text-xl text-blue-500 font-bold">{value}</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
}

function ScenarioCard({ title, desc, icon, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="bg-black/40 hover:bg-black/60 border border-white/5 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold text-sm text-white mb-1">{title}</div>
      <div className="text-[10px] text-slate-500 leading-tight uppercase font-black">{desc}</div>
    </button>
  );
}

function StatusBadge({ status }) {
  if (status === 'PAID') return <span className="flex items-center gap-1.5 text-xs font-black text-emerald-500"><CheckCircle2 className="w-3 h-3" /> PAID</span>;
  if (status === 'REJECTED') return <span className="flex items-center gap-1.5 text-xs font-black text-rose-500"><XCircle className="w-3 h-3" /> FRAUD</span>;
  return <span className="flex items-center gap-1.5 text-xs font-black text-amber-500"><Clock className="w-3 h-3" /> PENDING</span>;
}
