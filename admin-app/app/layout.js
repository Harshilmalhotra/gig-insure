"use client";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Archive, 
  Map as MapIcon, 
  UserSquare, 
  CloudRain, 
  Zap, 
  AlertTriangle, 
  PlayCircle,
  Users,
  Activity,
  History,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const API_BASE = "http://localhost:3005/admin";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [events, setEvents] = useState([]);
  const [env, setEnv] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/events`);
        setEvents(res.data.claims || []);
        setEnv(res.data.currentEnvironment);
      } catch (e) { console.error(e); }
    };
    fetchEvents();
    const int = setInterval(fetchEvents, 5000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    document.title = "Rozgaar Raksha Admin";
  }, []);

  const navItems = [
    { name: "Overview", path: "/admin/overview", icon: <LayoutDashboard size={18} />, group: "CORE" },
    { name: "Claims Engine", path: "/admin/claims", icon: <Archive size={18} />, group: "CORE" },
    { name: "Fraud Intel", path: "/admin/fraud", icon: <ShieldCheck size={18} />, group: "CORE" },
    { name: "Risk Map", path: "/admin/risk", icon: <MapIcon size={18} />, group: "CORE" },
    { name: "Policies", path: "/admin/policies", icon: <UserSquare size={18} />, group: "CORE" },
    
    { name: "Environment", path: "/simulate/environment", icon: <CloudRain size={18} />, group: "SIMULATION" },
    { name: "Worker State", path: "/simulate/worker", icon: <Users size={18} />, group: "SIMULATION" },
    { name: "Fraud Control", path: "/simulate/fraud", icon: <Zap size={18} />, group: "SIMULATION" },
    { name: "Scenarios", path: "/simulate/scenarios", icon: <PlayCircle size={18} />, group: "SIMULATION" },
  ];

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark bg-[#080808] text-slate-300`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-[240px] flex-shrink-0 bg-[#111] border-r border-white/5 flex flex-col">
            <div className="p-6">
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="text-blue-500" /> Rozgaar Raksha Admin
              </h1>
              <div className="mt-2 flex items-center gap-2 text-[10px] uppercase font-bold text-emerald-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Live
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
              {["CORE", "SIMULATION"].map(group => (
                <div key={group} className="mb-8">
                  <div className="px-3 mb-2 text-[10px] font-black text-slate-600 tracking-widest uppercase">{group}</div>
                  <div className="space-y-1">
                    {navItems.filter(i => i.group === group).map(item => (
                      <Link 
                        key={item.path} 
                        href={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          pathname === item.path 
                            ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" 
                            : "hover:bg-white/5 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            
            <div className="p-4 border-t border-white/5 mt-auto">
              <button 
                onClick={async () => {
                  try {
                    await axios.post(`${API_BASE}/simulation/reset`);
                    alert("Simulation stopped. All overrides cleared.");
                    window.location.reload();
                  } catch (e) { console.error(e); }
                }}
                className="w-full py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={14} /> Stop Simulation
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-[#080808] p-8">
            {children}
          </main>

          {/* Right Panel: Live Feed */}
          <aside className="w-[320px] flex-shrink-0 bg-[#111] border-l border-white/5 flex flex-col p-6 overflow-y-auto">
            <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
              <Activity className="w-4 h-4 text-blue-500" /> Live Events
            </h3>

            <div className="space-y-4 mb-10 text-xs">
              {events.length > 0 ? events.map(event => (
                <div key={event.id} className="p-3 bg-white/5 rounded-xl border border-white/5 border-l-2 border-l-blue-500">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-200">Claim Created</span>
                    <span className="text-[10px] text-slate-500">{new Date(event.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-400">User #{event.userId.slice(0, 4)} → {event.triggerType}</div>
                  <div className="mt-1 flex items-center gap-2 font-black text-blue-400">
                    ₹{event.payoutAmount.toFixed(0)} <span className="text-[9px] px-1 bg-blue-500/10 border border-blue-500/20 rounded uppercase">{event.status}</span>
                  </div>
                </div>
              )) : (
                <div className="text-slate-600 italic">No events recorded...</div>
              )}
            </div>

            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Alerts
            </h3>
            <div className="space-y-2 mb-10">
              <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl text-[11px] text-rose-300 font-bold">
                No critical fraud clusters detected
              </div>
            </div>

            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <History className="w-4 h-4 text-amber-500" /> System Signals
            </h3>
            <div className="space-y-3">
              <SignalItem label="Rain" value={env?.rain ? `${env.rain}mm` : 'N/A'} color="blue" />
              <SignalItem label="Demand" value={env?.demandLevel || 'MEDIUM'} color="amber" />
              <SignalItem label="System" value={env?.platformStatus || 'ONLINE'} color="emerald" />
            </div>
          </aside>
        </div>
      </body>
    </html>
  );
}

function SignalItem({ label, value, color }) {
  const colors = {
    blue: "text-blue-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    rose: "text-rose-400"
  };
  return (
    <div className="flex justify-between items-center text-[11px] font-black uppercase">
      <span className="text-slate-500">{label}</span>
      <span className={colors[color]}>{value}</span>
    </div>
  );
}
