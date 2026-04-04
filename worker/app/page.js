"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  MapPin, 
  Activity, 
  CheckCircle, 
  User, 
  ArrowUpRight, 
  Zap, 
  TrendingUp, 
  Lock,
  ChevronRight,
  Loader2,
  LogOut,
  Smartphone,
  ChevronLeft,
  Star,
  Coins,
  ShieldCheck,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// Config
const API_BASE = "http://127.0.0.1:3001";

// Cookie helpers
const getCookie = (n) => {
  if (typeof document === 'undefined') return null;
  const v = `; ${document.cookie}`;
  const p = v.split(`; ${name}=`);
  return p.length === 2 ? p.pop().split(';').shift() : null;
};
const setCookie = (n, v) => {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
  document.cookie = `${n}=${v};expires=${d.toUTCString()};path=/`;
};
const delCookie = (n) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export default function WorkerApp() {
  const [user, setUser] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);
  const [quote, setQuote] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQuotePopup, setShowQuotePopup] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // 'home', 'login', 'signup_identity', 'signup_sensors', 'signup_platform', 'signup_analysis', 'dashboard'
  const [flow, setFlow] = useState("home");
  const [formData, setFormData] = useState({ name: "", phone: "", password: "", platform: "" });
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const [permissions, setPermissions] = useState({ gps: false, motion: false });
  const [coords, setCoords] = useState({ lat: 19.07, lon: 72.87 });

  // Inspiration Data from Platform
  const [platformData, setPlatformData] = useState(null);
  const [fetchingPlatform, setFetchingPlatform] = useState(false);

  // Session Restore
  useEffect(() => {
    const id = getCookie("gig_user_id");
    if (id) {
       axios.get(`${API_BASE}/auth/worker/${id}`).then(res => {
         if (res.data) {
           setUser(res.data);
           setIsOnline(true);
           setFlow("dashboard");
         }
       }).catch(() => delCookie("gig_user_id")).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handlePlatformSelect = async (p) => {
     setFormData({ ...formData, platform: p });
     setFetchingPlatform(true);
     setPlatformData(null);
     try {
        const res = await axios.post(`${API_BASE}/mock/fetch-platform-data`, { platform: p });
        setPlatformData(res.data);
     } catch (e) {
        console.error("Platform fetch failed");
     } finally {
        setFetchingPlatform(false);
     }
  };

  const handleSignupFinal = async () => {
    setFlow("signup_analysis");
    try {
      await new Promise(r => setTimeout(r, 1000)); // Cool delay
      const res = await axios.post(`${API_BASE}/auth/register`, formData);
      setUser(res.data);
      setCookie("gig_user_id", res.data.id);
      setIsOnline(true);
      
      const qr = await axios.get(`${API_BASE}/insurance/quote/${res.data.id}?lat=${coords.lat}&lon=${coords.lon}`);
      setQuote(qr.data);
      
      setFlow("dashboard");
      setTimeout(() => setShowQuotePopup(true), 2000);
    } catch (e) {
      alert("Signup failed. DB might be out of sync or phone number exists.");
      setFlow("signup_platform");
    }
  };

  const addLog = (m, t) => setLogs(p => [{ id: Date.now(), msg: m, type: t, time: new Date().toLocaleTimeString() }, ...p.slice(0, 4)]);

  // Dashboard signals
  useEffect(() => {
    let int;
    if (flow === "dashboard" && user) {
       int = setInterval(async () => {
         try {
           const res = await axios.post(`${API_BASE}/insurance/worker/heartbeat`, {
             userId: user.id, phone: user.phone, ordersPerHour: 3.5, motion: "moving", gpsPattern: "smooth", lat: coords.lat, lon: coords.lon
           });
           if (res.data.payoutProcessed) addLog(`Payout: ₹${res.data.payoutAmount} in account!`, "success");
           addLog("Pulse: Syncing with PostgreSQL...", "success");
         } catch (e) {}
       }, 8000);
    }
    return () => clearInterval(int);
  }, [flow, user, coords]);

  const handleLogout = () => {
    delCookie("gig_user_id");
    setUser(null);
    setFlow("home");
  };

  if (loading && flow !== "signup_analysis") return <div className="mobile-container flex items-center justify-center bg-black"><Loader2 className="w-8 h-8 text-[#00d2ff] animate-spin" /></div>;

  return (
    <div className="mobile-container overflow-hidden bg-black text-white">
      <AnimatePresence mode="wait">
        
        {/* HOMEPAGE */}
        {flow === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-8 flex flex-col justify-center gap-12">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#00d2ff10] border border-[#00d2ff20] rounded-2xl flex items-center justify-center shadow-lg"><Shield className="w-8 h-8 text-[#00d2ff] animate-pulse" /></div>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">Gig<span className="text-[#00d2ff] block">Pulse.</span></h1>
              <p className="text-zinc-500 text-sm font-medium pr-10">Instant income protection for the modern workforce. Zero paperwork, automated claims.</p>
            </div>
            <div className="space-y-4">
              <button onClick={() => setFlow("signup_identity")} className="neon-button w-full py-5 text-base font-bold flex justify-between px-8">Join the Network <ChevronRight className="w-5 h-5"/></button>
              <button onClick={() => setFlow("login")} className="w-full py-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold flex items-center justify-center gap-2">Worker Login <Smartphone className="w-4 h-4"/></button>
            </div>
          </motion.div>
        )}

        {/* LOGIN: Phone-based */}
        {flow === "login" && (
          <motion.div key="login" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="h-full p-8 flex flex-col gap-10">
            <button onClick={() => setFlow("home")} className="p-3 bg-zinc-900 rounded-2xl w-fit"><ChevronLeft className="w-5 h-5 text-zinc-400" /></button>
            <div className="space-y-2"><h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Sign In</h2><p className="text-zinc-500 text-sm">Enter mobile and password to resume sync.</p></div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await axios.post(`${API_BASE}/auth/login`, loginData);
                setUser(res.data);
                setCookie("gig_user_id", res.data.id);
                setIsOnline(true);
                setFlow("dashboard");
              } catch(e) { alert("Invalid credentials."); }
            }} className="space-y-5">
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">+91</span><input type="tel" placeholder="Mobile Number" className="input-field py-4 pl-14" value={loginData.phone} onChange={e => setLoginData({...loginData, phone: e.target.value})} /></div>
              <input type="password" placeholder="Password" className="input-field py-4" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
              <button className="neon-button w-full py-5 mt-4">Authorized Login</button>
            </form>
          </motion.div>
        )}

        {/* SIGNUP: Identity */}
        {flow === "signup_identity" && (
          <motion.div key="s1" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="h-full p-8 flex flex-col gap-10 text-left">
            <button onClick={() => setFlow("home")} className="p-3 bg-zinc-900 rounded-2xl w-fit"><ChevronLeft className="w-5 h-5 text-zinc-400" /></button>
            <div className="space-y-2"><h2 className="text-3xl font-black text-white">Create Identity</h2><p className="text-zinc-500 text-sm">Establish your secure profile on our PostgreSQL node.</p></div>
            <div className="space-y-4">
              <input type="text" placeholder="Worker Full Name" className="input-field py-4" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">+91</span><input type="tel" placeholder="Mobile Number" className="input-field py-4 pl-14" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <input type="password" placeholder="Set Access Password" className="input-field py-4" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <button onClick={() => setFlow("signup_sensors")} disabled={!formData.name || !formData.phone || !formData.password} className="neon-button w-full py-5 disabled:opacity-20 mt-6">Agree & Continue</button>
          </motion.div>
        )}

        {/* SIGNUP: Sensors */}
        {flow === "signup_sensors" && (
          <motion.div key="s2" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="h-full p-8 flex flex-col gap-10">
            <button onClick={() => setFlow("signup_identity")} className="p-3 bg-zinc-900 rounded-2xl w-fit"><ChevronLeft className="w-5 h-5 text-zinc-400" /></button>
            <div className="space-y-2"><h2 className="text-3xl font-black text-white">Hardware Pairing</h2><p className="text-zinc-500 text-sm">GigPulse uses live telemetry to settle claims without paperwork.</p></div>
            <div className="space-y-4">
               <button onClick={() => setPermissions(p => ({...p, gps: true}))} className={`w-full p-6 bg-zinc-900/50 rounded-3xl border-2 transition-all ${permissions.gps ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-800"} flex items-center justify-between`}>
                 <MapPin className={permissions.gps ? "text-emerald-500" : "text-[#00d2ff]"} /><span className="text-xs font-black uppercase flex-1 px-4 text-left">Live Geolocation</span>{permissions.gps && <CheckCircle className="text-emerald-500 w-5 h-5" />}
               </button>
               <button onClick={() => setPermissions(p => ({...p, motion: true}))} className={`w-full p-6 bg-zinc-900/50 rounded-3xl border-2 transition-all ${permissions.motion ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-800"} flex items-center justify-between`}>
                 <Activity className={permissions.motion ? "text-emerald-500" : "text-[#00d2ff]"} /><span className="text-xs font-black uppercase flex-1 px-4 text-left">Motion Sensor</span>{permissions.motion && <CheckCircle className="text-emerald-500 w-5 h-5" />}
               </button>
            </div>
            <button onClick={() => setFlow("signup_platform")} disabled={!permissions.gps || !permissions.motion} className="neon-button w-full py-5 disabled:opacity-20 mt-10">Pair Devices</button>
          </motion.div>
        )}

        {/* SIGNUP: Ecosystem (The Inspiration Platform Fetch) */}
        {flow === "signup_platform" && (
          <motion.div key="s3" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="h-full p-8 flex flex-col gap-6 overflow-y-auto">
            <button onClick={() => setFlow("signup_sensors")} className="p-3 bg-zinc-900 rounded-2xl w-fit"><ChevronLeft className="w-5 h-5 text-zinc-400" /></button>
            <div className="space-y-2"><h2 className="text-3xl font-black text-white">Platform Sync</h2><p className="text-zinc-500 text-sm">Connect your delivery account to pulse historical trust scores.</p></div>
            <div className="space-y-4">
              {["Swiggy", "Zomato"].map(p => (
                <div key={p} className="space-y-3">
                  <button onClick={() => handlePlatformSelect(p)} className={`w-full p-6 rounded-3xl border-2 transition-all text-left ${formData.platform === p ? "border-[#00d2ff] bg-[#00d2ff10]" : "border-zinc-800 bg-zinc-900/40"}`}>
                    <div className="flex justify-between items-center"><span className={`text-xl font-black ${formData.platform === p ? "text-white" : "text-zinc-700"}`}>{p}</span><ArrowUpRight className={formData.platform === p ? "text-[#00d2ff]" : "text-zinc-800"} /></div>
                  </button>
                  {formData.platform === p && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-zinc-900/80 rounded-3xl border border-white/5 space-y-4 shadow-xl">
                      {fetchingPlatform ? (<div className="flex items-center gap-3 py-4 text-[#00d2ff]"><Loader2 className="animate-spin w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Fetching Platform Persona...</span></div>) : platformData ? (
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1"><p className="text-[8px] font-black text-zinc-500 uppercase">Daily Average</p><p className="text-lg font-black text-white">₹{platformData.avgDailyEarnings}</p></div>
                           <div className="space-y-1"><p className="text-[8px] font-black text-zinc-500 uppercase">Orders/HR</p><p className="text-lg font-black text-white">{platformData.ordersPerHour}</p></div>
                           <div className="space-y-1"><p className="text-[8px] font-black text-zinc-500 uppercase">Rating</p><p className="text-lg font-black text-white">{platformData.rating}<Star className="inline ml-1 w-3 h-3 text-amber-500" /></p></div>
                           <div className="space-y-1"><p className="text-[8px] font-black text-zinc-500 uppercase">Trust Score</p><p className="text-lg font-black text-emerald-400">{(platformData.consistencyScore * 100).toFixed(0)}%</p></div>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleSignupFinal} disabled={!platformData} className="neon-button w-full py-5 mt-4 uppercase font-black italic shadow-[0_0_50px_-10px_rgba(0,210,255,0.4)]">Verify & Finalize Account</button>
          </motion.div>
        )}

        {/* ANALYSIS PHASE */}
        {flow === "signup_analysis" && (
          <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full p-8 flex flex-col items-center justify-center text-center gap-10">
             <div className="relative"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-40 h-40 border-4 border-dashed border-[#00d2ff20] rounded-full" /><ShieldCheck className="w-16 h-16 text-[#00d2ff] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" /></div>
             <h3 className="text-2xl font-black uppercase italic text-white leading-none">Syncing Platform Identity<br/>to PostgreSQL...</h3>
          </motion.div>
        )}

        {/* DASHBOARD */}
        {flow === "dashboard" && user && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col pt-10">
            <header className="flex items-center justify-between px-8 mb-8">
               <div className="flex items-center gap-3 text-left">
                 <div className="w-12 h-12 rounded-2xl bg-[#00d2ff05] border border-white/10 flex items-center justify-center shadow-inner"><User className="text-zinc-500 w-5 h-5" /></div>
                 <div><h2 className="font-bold text-lg text-white">{user.name}</h2><p className="text-[#00d2ff] text-[10px] font-black uppercase tracking-widest">{user.platform} ID · {(user.phone)}</p></div>
               </div>
               <button onClick={handleLogout} className="p-3 bg-zinc-900 rounded-full text-zinc-600 hover:text-red-400"><LogOut className="w-4 h-4"/></button>
            </header>
            <div className="px-8 space-y-6 flex-1 overflow-y-auto pb-10 text-left">
               <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-5 space-y-1"><p className="text-[9px] font-black text-zinc-500 uppercase">Earning Potential</p><p className="text-2xl font-black italic text-white">₹{user.baseEarnings}</p></div>
                  <div className="glass p-5 space-y-1"><p className="text-[9px] font-black text-zinc-500 uppercase">Behavioral Match</p><p className="text-2xl font-black italic text-emerald-400">{(user.consistencyScore * 100).toFixed(0)}%</p></div>
               </div>
               <div className="glass p-6 space-y-4">
                 <div className="flex flex-col gap-4">
                    {logs.map(l => (
                      <div key={l.id} className="flex items-center gap-3"><div className={`w-1 h-1 rounded-full ${l.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} /><p className="text-[10px] text-zinc-400 font-medium">{l.msg}</p><span className="text-[8px] text-zinc-700 ml-auto font-black">{l.time}</span></div>
                    ))}
                    {logs.length === 0 && <p className="text-[10px] text-zinc-600 italic">Starting telemetry sequence...</p>}
                 </div>
               </div>
            </div>
            
            <AnimatePresence>
               {showQuotePopup && quote && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="glass w-full max-w-sm p-8 border-2 border-[#00d2ff20] shadow-[0_0_100px_rgba(0,210,255,0.1)] space-y-8 relative">
                       <div className="absolute -top-4 -right-4 bg-[#00d2ff] text-black text-[10px] font-black px-4 py-2 rounded-full uppercase italic animate-bounce shadow-lg">High Risk Delta</div>
                       <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Risk Profile<br/>Synchronized.</h3>
                       <div className="space-y-4 border-t border-white/5 pt-6">
                          <div className="flex justify-between items-center text-zinc-500 text-[10px] font-black uppercase"><span>Daily Premium</span><span className="text-3xl font-black text-[#00d2ff] font-mono">₹{quote.totalPremium}</span></div>
                       </div>
                       <button onClick={() => {
                         axios.post(`${API_BASE}/insurance/policy/purchase`, { userId: user.id, premium: quote.totalPremium, coverage: 5000 }).then(() => {
                           addLog("Policy Active: DB Seeded.", "success");
                           setShowQuotePopup(false);
                         });
                       }} className="neon-button w-full py-5 text-lg font-black uppercase italic tracking-widest shadow-[0_0_40px_rgba(0,210,255,0.3)]">Activate Shield</button>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
