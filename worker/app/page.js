"use client";

import React, { useState, useEffect, useRef } from "react";
import { Shield, MapPin, Activity, CheckCircle, User, ArrowUpRight, Zap, TrendingUp, Lock, ChevronRight, Loader2, LogOut, Smartphone, ChevronLeft, ChevronUp, ChevronDown, Star, Coins, ShieldCheck, Hash, CloudRain, Thermometer, AlertCircle, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import { API_BASE } from "./config";

// Cookie helpers
const getCookie = (n) => {
  if (typeof document === 'undefined') return null;
  const v = `; ${document.cookie}`;
  const p = v.split(`; ${n}=`);
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
  const [loading, setLoading] = useState(true);
  const [showQuotePopup, setShowQuotePopup] = useState(false);
  const [logs, setLogs] = useState([]);
  const [flow, setFlow] = useState("home");
  const [formData, setFormData] = useState({ name: "", phone: "", password: "", platform: "" });
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const [permissions, setPermissions] = useState({ gps: false, motion: false });
  const [coords, setCoords] = useState({ lat: 19.07, lon: 72.87 });
  const [platformData, setPlatformData] = useState(null);
  const [fetchingPlatform, setFetchingPlatform] = useState(false);
  const [motionState, setMotionState] = useState("static");
  const [isOnline, setIsOnline] = useState(false);
  const [weather, setWeather] = useState({ temp: 32, rain: 0, platformStatus: "online" });

  // Dynamic Location Resolver
  const getNodeName = (l) => {
    if (l.lat > 18 && l.lat < 20) return "Mumbai Node";
    if (l.lat > 12 && l.lat < 14) return "Chennai Node";
    return "Edge Node";
  };
  const getSubNode = (l) => {
    if (l.lat > 18 && l.lat < 20) return "Mumbai West";
    if (l.lat > 12 && l.lat < 14) return "Chennai Central";
    return "Roaming";
  };

  // UI STATE
  const [activeTab, setActiveTab] = useState("home");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [activeDisruption, setActiveDisruption] = useState(null);
  const [latestDecisionMessage, setLatestDecisionMessage] = useState(null);
  const [claimFlowStep, setClaimFlowStep] = useState(null); // null, 'triggered', 'analyzing', 'verifying', 'settled'
  const [showFraudDemo, setShowFraudDemo] = useState(false);
  const [uploadingClaim, setUploadingClaim] = useState(null);
  const [claimExplanationById, setClaimExplanationById] = useState({});

  // --- Liveness Challenge State ---
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [videoChunks, setVideoChunks] = useState([]);
  const [videoBlob, setVideoBlob] = useState(null);
  const [challengeStep, setChallengeStep] = useState(0);

  const [challengeDir, setChallengeDir] = useState([]); // Array of directions like ['LEFT', 'RIGHT', 'UP']
  const [challengeStatus, setChallengeStatus] = useState('idle'); // idle, scanning, complete

  const getClaimAIMeta = (claim) => {
    try {
      if (!claim?.adminNotes) return null;
      const parsed = JSON.parse(claim.adminNotes);
      return parsed?.aiDecisionMeta || null;
    } catch {
      return null;
    }
  };

  // --- DATA FETCHING ---
  const refreshData = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE}/auth/worker/${user.id}`);
      setUser(res.data);
      const active = res.data.policies?.find(p => p.status === 'ACTIVE');
      if (active) setActivePolicy(active);
    } catch (e) {
      console.error("Refresh failed");
    }
  };

  // Session Restore
  useEffect(() => {
    const id = getCookie("gig_user_id");
    if (id) {
       axios.get(`${API_BASE}/auth/worker/${id}`).then(res => {
         if (res.data) {
           setUser(res.data);
           setIsOnline(true);
           setFlow("dashboard");
           setPermissions({ gps: true, motion: true }); // Enable sensors for restored session
           // Initial policy check
           const active = res.data.policies?.find(p => p.status === 'ACTIVE');
           if (active) setActivePolicy(active);
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
      await new Promise(r => setTimeout(r, 1000));
      const res = await axios.post(`${API_BASE}/auth/register`, formData);
      setUser(res.data);
      setCookie("gig_user_id", res.data.id);
      setIsOnline(true);
      const qr = await axios.get(`${API_BASE}/insurance/quote/${res.data.id}?lat=${coords.lat}&lon=${coords.lon}`);
      setQuote(qr.data);
      setFlow("dashboard");
      setTimeout(() => setShowQuotePopup(true), 2000);
    } catch (e) {
      alert("Signup failed.");
      setFlow("signup_platform");
    }
  };

  // --- LIVE TELEMETRY LOGIC ---
  useEffect(() => {
    if (!permissions.gps || flow !== "dashboard") return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => console.error("GPS Watch failed", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [permissions.gps, flow]);

  useEffect(() => {
    if (!permissions.motion || flow !== "dashboard") return;
    const handleMotion = (e) => {
      const accel = e.accelerationIncludingGravity;
      const totalAccel = Math.abs(accel?.x || 0) + Math.abs(accel?.y || 0) + Math.abs(accel?.z || 0);
      setMotionState(totalAccel > 15 ? "moving" : "static");
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [permissions.motion, flow]);

  const addLog = (m, t) => setLogs(p => [{ id: Date.now(), msg: m, type: t, time: new Date().toLocaleTimeString() }, ...p.slice(0, 4)]);

  // Pulse Loop
  useEffect(() => {
    let int;
    if (flow === "dashboard" && user) {
       int = setInterval(async () => {
         try {
           const res = await axios.post(`${API_BASE}/insurance/worker/heartbeat`, {
             userId: user.id, phone: user.phone, ordersPerHour: 3.5, motion: motionState, gpsPattern: "smooth", lat: coords.lat, lon: coords.lon, language: "en"
           });
            if (res.data?.decision?.explanation?.message) {
              setLatestDecisionMessage(res.data.decision.explanation.message);
            }
            if (res.data.isOverridden) {
               addLog("Telemetry Shield Active: Admin Override", "info");
            }

            if (res.data.activeTrigger) {
              setActiveDisruption(res.data.disruptionDetails);
            } else {
              setActiveDisruption(null);
            }

            if (res.data.weather) {
              setWeather(res.data.weather);
            }

            if (res.data.payoutProcessed) {
              setClaimFlowStep('triggered');
              addLog(`Trigger: ${res.data.activeTrigger}!`, "success");
              
              // Animated Flow Sequence
              setTimeout(() => setClaimFlowStep('analyzing'), 1500);
              setTimeout(() => setClaimFlowStep('verifying'), 3000);
              setTimeout(() => {
                setClaimFlowStep('settled');
                refreshData();
              }, 4500);
              setTimeout(() => setClaimFlowStep(null), 8000);
            }
          } catch (e) {}
       }, 5000);
    }
    return () => { if (int) clearInterval(int); };
  }, [flow, user, motionState, coords, permissions]);

  useEffect(() => {
    if (!selectedClaim) return;
    const aiMeta = getClaimAIMeta(selectedClaim);
    if (aiMeta?.dynamicMessage) return;
    axios
      .get(`${API_BASE}/insurance/claims/${selectedClaim.id}/explanation?lang=en`)
      .then((res) => {
        setClaimExplanationById((prev) => ({
          ...prev,
          [selectedClaim.id]: res.data?.explanation || null,
        }));
      })
      .catch(() => {});
  }, [selectedClaim]);

  // --- HACKATHON DEMO SHORTCUT ---
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Ctrl/Cmd + Shift + F -> Force Fraud Claim
      if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (!user) return;
        
        try {
           // 1. Ensure Policy Exists
           if (user.policies?.length === 0) {
              await axios.post(`${API_BASE}/insurance/policy/purchase`, { userId: user.id, premium: 350, coverage: 1500 });
           }
           
           // 2. Override Environment to heavy Rain
           await axios.post(`${API_BASE}/admin/simulation/environment`, { rain: 60, temperature: 30, aqi: 50, demandLevel: 'medium', platformStatus: 'online' });
           
           // 3. Override Worker State to Flagged GPS Anomaly
           await axios.post(`${API_BASE}/admin/simulation/worker/${user.id}`, { forcedOrdersPerHour: null, forcedMotion: "static", forcedGpsPattern: "anomaly" });
           
           // 4. Update UI
           setActiveTab("claims");
           addLog("Demo Sequence Auto-Injected!", "success");
           refreshData();
        } catch (err) {
           console.error("Demo shortcut failed", err);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  // --- Liveness Challenge logic here ---
  useEffect(() => {
    if (uploadingClaim) {
      // 1. Initial Challenge Steps
      const dirs = ['LEFT', 'RIGHT', 'UP', 'LEFT'].sort(() => Math.random() - 0.5);
      setChallengeDir(dirs);
      setChallengeStep(0);
      setChallengeStatus('scanning');
      setVideoChunks([]);
      setVideoBlob(null);

      // 2. Start Camera and Recording
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
          
          const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
          mediaRecorder.ondataavailable = (e) => {
             if (e.data.size > 0) {
               setVideoChunks((prev) => [...prev, e.data]);
             }
          };
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start(100); // collect chunk every 100ms
        })
        .catch(err => {
          console.error("Camera access denied", err);
          alert("Camera required for Fraud Verification.");
        });
    } else {
      // Stop Camera
      if (videoRef.current && videoRef.current.srcObject) {
         const tracks = videoRef.current.srcObject.getTracks();
         tracks.forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
         mediaRecorderRef.current.stop();
      }
      setChallengeStatus('idle');
    }
  }, [uploadingClaim]);

  // Create block when recording completes
  useEffect(() => {
    if (challengeStatus === 'complete' && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setTimeout(() => {
         // Create blob from chunks (this runs after ondataavailable finishes firing)
         setVideoChunks((currentChunks) => {
            const blob = new Blob(currentChunks, { type: 'video/mp4' });
            setVideoBlob(blob);
            return currentChunks;
         });
      }, 500);
    }
  }, [challengeStatus]);


  // Handle Logout (from original)
  const handleLogout = () => {
    delCookie("gig_user_id");
    setUser(null);
    setFlow("home");
  };

  if (loading && flow !== "signup_analysis") 
    return <div className="mobile-container flex items-center justify-center bg-black"><Loader2 className="w-8 h-8 text-[#00d2ff] animate-spin" /></div>;

  return (
    <div className="mobile-container overflow-hidden bg-black text-white flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          
          {/* 1. HOMEPAGE & AUTH FLOWS (Omitted for brevity, kept same as before but nested in AnimatePresence) */}
          {flow === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full p-8 flex flex-col justify-center gap-12">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-[#00d2ff10] border border-[#00d2ff20] rounded-2xl flex items-center justify-center shadow-lg"><Shield className="w-8 h-8 text-[#00d2ff] animate-pulse" /></div>
                <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">Rozgaar<span className="text-[#00d2ff] block">Raksha.</span></h1>
                <p className="text-zinc-500 text-sm font-medium pr-10">Instant income protection for the modern workforce. Zero paperwork, automated claims.</p>
              </div>
              <div className="space-y-4">
                <button onClick={() => setFlow("signup_identity")} className="neon-button w-full py-5 text-base font-bold flex justify-between px-8">Join the Network <ChevronRight className="w-5 h-5"/></button>
                <button onClick={() => setFlow("login")} className="w-full py-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold flex items-center justify-center gap-2">Worker Login <Smartphone className="w-4 h-4"/></button>
              </div>
            </motion.div>
          )}

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

          {/* ... Other signup phases kept same ... */}
          {flow === "signup_identity" && (
            <motion.div key="s1" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="h-full p-8 flex flex-col gap-10">
              <button onClick={() => setFlow("home")} className="p-3 bg-zinc-900 rounded-2xl w-fit"><ChevronLeft className="w-5 h-5 text-zinc-400" /></button>
              <div className="space-y-2"><h2 className="text-3xl font-black text-white">Create Identity</h2><p className="text-zinc-500 text-sm">Establish your secure profile on our PostgreSQL node.</p></div>
              <div className="space-y-4">
                <input type="text" placeholder="Worker Full Name" className="input-field py-4" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">+91</span><input type="tel" placeholder="Mobile Number" className="input-field py-4 pl-14" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                <input type="password" placeholder="Set Password" className="input-field py-4" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <button onClick={() => setFlow("signup_sensors")} disabled={!formData.name} className="neon-button w-full py-5 mt-6">Agree & Continue</button>
            </motion.div>
          )}

          {flow === "signup_sensors" && (
            <motion.div key="s2" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="h-full p-8 flex flex-col gap-10">
              <div className="space-y-2"><h2 className="text-3xl font-black text-white">Hardware Pairing</h2><p className="text-zinc-500 text-sm">Rozgaar Raksha uses live telemetry to settle claims instantly.</p></div>
              <div className="space-y-4">
                 <button onClick={() => setPermissions(p => ({...p, gps: true}))} className={`w-full p-6 bg-zinc-900/50 rounded-3xl border-2 ${permissions.gps ? "border-emerald-500" : "border-zinc-800"} flex items-center justify-between`}>
                    <MapPin className="text-[#00d2ff]" /><span className="text-xs font-black uppercase flex-1 px-4 text-left">Live GPS</span> {permissions.gps && <CheckCircle className="text-emerald-500" />}
                 </button>
                 <button onClick={() => setPermissions(p => ({...p, motion: true}))} className={`w-full p-6 bg-zinc-900/50 rounded-3xl border-2 ${permissions.motion ? "border-emerald-500" : "border-zinc-800"} flex items-center justify-between`}>
                    <Activity className="text-[#00d2ff]" /><span className="text-xs font-black uppercase flex-1 px-4 text-left">Motion Sensor</span> {permissions.motion && <CheckCircle className="text-emerald-500" />}
                 </button>
              </div>
              <button onClick={() => setFlow("signup_platform")} disabled={!permissions.gps} className="neon-button w-full py-5 mt-10">Pair Devices</button>
            </motion.div>
          )}

          {flow === "signup_platform" && (
            <motion.div key="s3" initial={{ x: "100%" }} animate={{ x: 0 }} className="h-full p-8 flex flex-col gap-6 overflow-y-auto">
              <div className="space-y-2"><h2 className="text-3xl font-black text-white">Platform Sync</h2><p className="text-zinc-500 text-sm">Connect your delivery account for trust profiling.</p></div>
              {["Swiggy", "Zomato"].map(p => (
                <button key={p} onClick={() => handlePlatformSelect(p)} className={`w-full p-6 rounded-3xl border-2 ${formData.platform === p ? "border-[#00d2ff] bg-[#00d2ff10]" : "border-zinc-800"} text-left`}>
                   <div className="flex justify-between items-center font-black text-xl">{p} <ArrowUpRight /></div>
                   {formData.platform === p && platformData && (
                     <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="text-[10px] uppercase text-zinc-500">Earnings: ₹{platformData.avgDailyEarnings}</div>
                        <div className="text-[10px] uppercase text-zinc-500">Rating: {platformData.rating}</div>
                     </div>
                   )}
                </button>
              ))}
              <button onClick={handleSignupFinal} disabled={!platformData} className="neon-button w-full py-5 mt-4">Finalize Sync</button>
            </motion.div>
          )}

          {flow === "signup_analysis" && (
            <div className="h-full flex flex-col items-center justify-center gap-10">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="w-24 h-24 border-4 border-dashed border-[#00d2ff] rounded-full" />
               <h3 className="text-xl font-black uppercase italic">Syncing Database...</h3>
            </div>
          )}

          {/* 🧩 5-TAB DASHBOARD EXPERIENCE */}
          {flow === "dashboard" && user && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
              
              {/* TAB 1: HOME (Live Status + Risk) */}
              {activeTab === "home" && (
                <div className="p-8 pb-32 space-y-8 text-left animate-in fade-in transition-all">
                  <header className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none text-white">Active<br/>Raksha.</h2>
                      <p className="text-[10px] font-black text-zinc-500 mt-2 uppercase tracking-widest">{user.name} · {user.platform}</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black rounded-full uppercase">Active 🟢</div>
                  </header>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="glass p-5 rounded-3xl space-y-1">
                       <div className="flex justify-between items-center mb-2">
                          <p className="text-[8px] font-black text-zinc-500 uppercase">Coverage</p>
                          < ShieldCheck className="w-3 h-3 text-emerald-500" />
                       </div>
                       <p className="text-2xl font-black italic text-emerald-400">₹{activePolicy?.coverage || 5000}</p>
                       <p className="text-[7px] font-bold text-zinc-600 uppercase">Settled: ₹{user.claims?.reduce((acc, c) => acc + (c.status === 'PAID' ? c.payoutAmount : 0), 0).toFixed(0)}</p>
                     </div>
                     <div className="glass p-5 rounded-3xl space-y-1 relative overflow-hidden group">
                       <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                       <p className="text-[8px] font-black text-zinc-500 uppercase">Live GPS Signal</p>
                       <p className="text-sm font-black italic">{coords.lat.toFixed(4)}°N</p>
                       <p className="text-[8px] font-bold text-blue-500 flex items-center gap-1 uppercase tracking-widest"><MapPin className="w-2 h-2" /> {getNodeName(coords)}</p>
                     </div>
                   </div>

                   {/* LIVE TELEMETRY GRID */}
                   <div className="grid grid-cols-3 gap-3">
                      <div className="glass p-4 rounded-3xl flex flex-col items-center gap-2 border-white/5">
                         <Activity className={`w-5 h-5 ${motionState === 'moving' ? 'text-emerald-500' : 'text-zinc-600'}`} />
                         <div className="text-center">
                            <p className="text-[7px] font-black text-zinc-500 uppercase">Motion</p>
                            <p className="text-[10px] font-black uppercase text-white">{motionState}</p>
                         </div>
                      </div>
                      <div className="glass p-4 rounded-3xl flex flex-col items-center gap-2 border-white/5">
                         <CloudRain className={`w-5 h-5 ${weather.rain > 0 ? 'text-blue-500' : 'text-zinc-600'}`} />
                         <div className="text-center">
                            <p className="text-[7px] font-black text-zinc-500 uppercase">Cloud</p>
                            <p className="text-[10px] font-black uppercase text-white">{weather.rain}mm</p>
                         </div>
                      </div>
                      <div className="glass p-4 rounded-3xl flex flex-col items-center gap-2 border-white/5">
                         <Thermometer className={`w-5 h-5 ${weather.temp > 35 ? 'text-rose-500' : 'text-zinc-600'}`} />
                         <div className="text-center">
                            <p className="text-[7px] font-black text-zinc-500 uppercase">Temp</p>
                            <p className="text-[10px] font-black uppercase text-white">{weather.temp}°C</p>
                         </div>
                      </div>
                   </div>

                  {/* 🔥 GAME CHANGER: LIVE DISRUPTION BANNER */}
                  {activeDisruption && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 rounded-4xl bg-orange-500/10 border-2 border-orange-500/30 shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]">
                       <div className="flex justify-between items-center mb-4">
                          <div className="flex gap-2 items-center text-orange-500 font-black uppercase italic text-xs">
                             <AlertCircle className="w-4 h-4 animate-pulse" /> Disruption Detected
                          </div>
                          <span className="text-[9px] font-black bg-orange-500 text-black px-2 py-0.5 rounded-full uppercase">Zone Impact: {activeDisruption.zoneImpact}</span>
                       </div>
                       <h3 className="text-2xl font-black italic uppercase text-white leading-tight">Income Drop: ₹{activeDisruption.estimatedLoss}</h3>
                       <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-wide">{activeDisruption.reason}</p>
                    </motion.div>
                  )}

                  {/* 🔥 MOST IMPORTANT: AUTO-CLAIM EXECUTION OVERLAY */}
                  {claimFlowStep && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed inset-x-8 bottom-32 z-[300] bg-blue-600 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.4)]">
                       <div className="space-y-6">
                          <div className="flex justify-between items-center">
                             <h4 className="text-white font-black italic uppercase text-lg">Auto-Settle Active</h4>
                             <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                          </div>
                          
                          <div className="space-y-3">
                             <div className={`flex items-center gap-3 text-xs font-bold ${['triggered', 'analyzing', 'verifying', 'settled'].includes(claimFlowStep) ? 'text-white' : 'text-white/30'}`}>
                                <CheckCircle className={['analyzing', 'verifying', 'settled'].includes(claimFlowStep) ? 'text-emerald-300' : 'text-white/20'} /> Claim Auto-Triggered
                             </div>
                             <div className={`flex items-center gap-3 text-xs font-bold ${['analyzing', 'verifying', 'settled'].includes(claimFlowStep) ? 'text-white' : 'text-white/30'}`}>
                                <CheckCircle className={['verifying', 'settled'].includes(claimFlowStep) ? 'text-emerald-300' : 'text-white/20'} /> Analyzing PoWI Signals
                             </div>
                             <div className={`flex items-center gap-3 text-xs font-bold ${['verifying', 'settled'].includes(claimFlowStep) ? 'text-white' : 'text-white/30'}`}>
                                <CheckCircle className={['settled'].includes(claimFlowStep) ? 'text-emerald-300' : 'text-white/20'} /> Verify Integrity Node
                             </div>
                          </div>

                          {claimFlowStep === 'settled' && (
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="pt-4 border-t border-white/20">
                               <p className="text-[10px] font-black uppercase text-blue-200 mb-1">Settlement Paid</p>
                               <p className="text-3xl font-black italic text-white leading-none">₹{logs.find(l => l.msg.includes("Trigger:"))?.msg.split("!")[0].split(": ").pop() || "Settle"}</p>
                            </motion.div>
                          )}
                       </div>
                    </motion.div>
                  )}

                  {/* Dynamic Risk Indicator */}
                  {(() => {
                    const hasRecentTrigger = logs.some(l => l.msg.includes("Trigger:"));
                    return (
                      <div className={`p-6 rounded-4xl border-2 transition-all ${hasRecentTrigger ? "border-red-500 bg-red-500/5 shadow-[0_0_50px_-20px_rgba(239,68,68,0.4)]" : "border-blue-500/30 bg-blue-500/5"}`}>
                        <div className="flex justify-between items-start mb-4">
                          <ShieldCheck className={hasRecentTrigger ? "text-red-500" : "text-blue-500"} />
                          <div className="text-right">
                            <p className="text-[8px] font-black text-zinc-500 uppercase">System Status</p>
                            <p className={`text-xs font-black uppercase italic ${hasRecentTrigger ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                              {hasRecentTrigger ? "High Risk Delta" : "Safe Zone"}
                            </p>
                          </div>
                        </div>
                        <h3 className="text-lg font-black text-white italic uppercase">{hasRecentTrigger ? "Loss Mitigation Active" : "Income Guard Active"}</h3>
                        <div className="flex items-center gap-2 mt-4 text-[9px] font-bold text-zinc-400">
                          {hasRecentTrigger ? <AlertCircle className="w-3 h-3 text-red-500" /> : <CheckCircle className="w-3 h-3 text-emerald-500" />}
                          {hasRecentTrigger ? "Active disruption detected in this sector." : "Automatic Claim Settlement Enabled"}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="glass p-6 rounded-4xl space-y-4">
                    <h4 className="text-[10px] font-black text-[#00d2ff] uppercase tracking-[4px]">Smart Insights</h4>
                    <div className="flex gap-4 items-center">
                      <Zap className="text-yellow-500 w-8 h-8" />
                      <p className="text-xs font-medium text-zinc-300 leading-relaxed">
                        {activeDisruption 
                          ? `Active Disruption: ${activeDisruption.event}. Payout logic initiated to bridge the ${activeDisruption.zoneImpact} income gap.` 
                          : `The environment is stable. Your policy protects you from sudden drops in order volume due to rain or demand shifts.`}
                      </p>
                    </div>
                    {latestDecisionMessage && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Claim Decision Summary</p>
                        <p className="text-[10px] font-bold text-zinc-200 leading-relaxed">{latestDecisionMessage}</p>
                      </div>
                    )}
                  </div>

                  {/* 🔥 TRIGGER TIMELINE (STORYTELLING) */}
                  <div className="space-y-4 pt-4">
                     <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">Operational Timeline</h4>
                     <div className="relative pl-6 space-y-8 border-l border-zinc-800 ml-4">
                        <div className="relative">
                           <div className="absolute -left-[29px] top-0 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                           <p className="text-[8px] font-black text-zinc-500 uppercase">1:15 PM</p>
                           <p className="text-[10px] font-bold text-white mt-1">Telemetry Sync: 100% Signal Integrity</p>
                        </div>
                        <div className="relative">
                           <div className="absolute -left-[29px] top-0 w-3 h-3 bg-zinc-800 rounded-full" />
                           <p className="text-[8px] font-black text-zinc-500 uppercase">1:22 PM</p>
                           <p className="text-[10px] font-bold text-zinc-400 mt-1">Zone Alert: Cluster X reports low demand</p>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {/* TAB 2: POLICY (Management) */}
              {activeTab === "policy" && (
                <div className="p-8 pb-32 space-y-8 animate-in slide-in-from-right transition-all">
                  <h2 className="text-3xl font-black text-white italic uppercase">Policy Vault</h2>
                  
                  {activePolicy ? (
                    <div className="space-y-6">
                      <div className="bg-linear-to-br from-blue-600 to-blue-900 p-8 rounded-4xl shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-all" />
                         <div className="space-y-1 mb-8">
                            <p className="text-[10px] font-black uppercase text-blue-100/50 letter-spacing-[2px]">Weekly Income Guard</p>
                            <h3 className="text-4xl font-black italic uppercase text-white">Active</h3>
                         </div>
                         <div className="grid grid-cols-2 gap-8 mb-8">
                            <div><p className="text-[8px] font-black uppercase text-blue-100/40">Coverage</p><p className="text-xl font-bold">₹{activePolicy.coverage}</p></div>
                            <div><p className="text-[8px] font-black uppercase text-blue-100/40">Daily Premium</p><p className="text-xl font-bold">₹{activePolicy.premium}</p></div>
                         </div>
                         <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                            <p className="text-[9px] font-black uppercase text-blue-200/60">
                               Expires in {Math.ceil((new Date(activePolicy.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                            </p>
                            <span className="text-[8px] font-bold text-white/40">#{activePolicy.id.slice(0,8)}</span>
                         </div>
                      </div>

                        <div className="pt-8 space-y-4">
                           <div className="flex justify-between items-center text-[8px] font-black uppercase text-zinc-500 tracking-widest px-1">
                              <span>Day 1</span>
                              <span>Day 7 (Expiry)</span>
                           </div>
                           <div className="h-1 w-full bg-zinc-900 rounded-full relative overflow-hidden">
                              <div className="absolute left-0 top-0 h-full bg-blue-500 w-[60%]" />
                              <div className="absolute left-[60%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-blue-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                           </div>
                           <p className="text-[10px] font-bold text-center text-zinc-400">
                             Coverage is active. {Math.ceil((new Date(activePolicy.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining.
                           </p>
                        </div>
                      </div>
                  ) : (
                    <div className="p-12 text-center space-y-6">
                       <Lock className="w-16 h-16 mx-auto text-zinc-800" />
                       <p className="text-zinc-600 font-bold">No active policy found on this worker node.</p>
                       <button onClick={() => setShowQuotePopup(true)} className="neon-button px-10 py-4">View Available Plans</button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CLAIMS (History + Transparency) */}
              {activeTab === "claims" && (
                <div className="p-8 pb-32 space-y-8 animate-in slide-in-from-right text-left">
                  <h2 className="text-3xl font-black text-white italic uppercase">Ledger.</h2>
                  <div className="space-y-4">
                    {user.claims?.length > 0 ? user.claims.map(claim => (
                      <div key={claim.id} className="space-y-2">
                        {(() => {
                          const aiMeta = getClaimAIMeta(claim);
                          const explanation = aiMeta?.dynamicMessage || claimExplanationById[claim.id];
                          if (!explanation) return null;
                          return (
                            <div className="px-4 py-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-[10px] font-bold text-zinc-300 leading-relaxed">
                              {explanation}
                            </div>
                          );
                        })()}
                        <button 
                          onClick={() => setSelectedClaim(claim)}
                          className={`w-full glass p-6 rounded-4xl flex justify-between items-center group active:scale-[0.98] transition-all ${claim.status === 'FLAGGED' ? 'border-red-500/50 bg-red-500/5' : ''}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className={`text-[10px] font-black uppercase ${claim.status === 'FLAGGED' ? 'text-red-500' : 'text-blue-500'}`}>{claim.triggerType}</p>
                              {claim.status === 'FLAGGED' && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
                            </div>
                            <p className="text-xs font-bold text-zinc-400">{new Date(claim.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black italic text-white">₹{claim.payoutAmount}</p>
                            <p className={`text-[8px] font-black uppercase ${
                              claim.status === 'PAID' ? 'text-emerald-500' : 
                              claim.status === 'FLAGGED' ? 'text-red-500' : 
                              claim.status === 'PENDING_REVIEW' ? 'text-blue-400' : 'text-amber-500'
                            }`}>
                              {claim.status === 'PAID' ? 'Settled ✅' : 
                               claim.status === 'FLAGGED' ? 'Action Required ⚠️' : 
                               claim.status === 'PENDING_REVIEW' ? 'Reviewing ⏳' : 'Reviewing ⏳'}
                            </p>
                          </div>
                        </button>
                        {claim.status === 'FLAGGED' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadingClaim(claim);
                            }}
                            className="w-full py-3 bg-red-500 text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                          >
                            <Smartphone className="w-3 h-3" /> Record Video Proof
                          </button>
                        )}
                      </div>
                    )) : (
                      <div className="p-20 text-center text-zinc-800 italic">No automated claims processed yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: ACTIVITY (PoWI Transparency) */}
              {activeTab === "activity" && (
                <div className="p-8 pb-32 space-y-8 animate-in slide-in-from-right text-left">
                   <h2 className="text-3xl font-black text-white italic uppercase">Signals.</h2>
                   <div className="space-y-6">
                      <div className="glass p-8 rounded-[2.5rem] space-y-6">
                         <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live Activity Metrics</h4>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1"><p className="text-[8px] font-bold text-zinc-600">GPS</p><p className="text-xs font-black">{coords.lat.toFixed(3)}, {coords.lon.toFixed(3)}</p></div>
                            <div className="space-y-1"><p className="text-[8px] font-bold text-zinc-600">PoWI Motion</p><p className="text-xs font-black uppercase text-emerald-400">{motionState}</p></div>
                            <div className="space-y-1"><p className="text-[8px] font-bold text-zinc-600">Integrity</p><p className="text-xs font-black uppercase text-blue-500">Smooth</p></div>
                         </div>
                      </div>

                      <div className="glass p-8 rounded-4xl space-y-6 bg-linear-to-br from-emerald-500/10 to-transparent border-emerald-500/10">
                         <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Behavior Score</h4>
                            <Star className="text-amber-500 w-4 h-4" />
                         </div>
                         <div className="text-5xl font-black italic text-white flex items-end gap-2">
                            {(user.consistencyScore * 100).toFixed(0)}<span className="text-sm text-zinc-500 mb-2 uppercase">%</span>
                         </div>
                         <p className="text-xs font-medium text-zinc-400 pr-10 leading-relaxed">
                            Your consistent work activity is reducing your monthly premiums by <span className="text-emerald-400 italic">₹120</span>.
                         </p>

                         <div className="pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
                            <div className="space-y-1 text-center"><p className="text-[8px] font-bold text-zinc-600 uppercase">GPS Anomaly</p><p className="text-[10px] font-black text-emerald-500">{showFraudDemo ? "DETECTION" : "Low"}</p></div>
                            <div className="space-y-1 text-center"><p className="text-[8px] font-bold text-zinc-600 uppercase">Motion Gap</p><p className="text-[10px] font-black text-emerald-500">{showFraudDemo ? "MISMATCH" : "None"}</p></div>
                            <div className="space-y-1 text-center"><p className="text-[8px] font-bold text-zinc-600 uppercase">Trust Signal</p><p className="text-[10px] font-black text-blue-400">{showFraudDemo ? "Flagged" : "Strong"}</p></div>
                         </div>
                       </div>

                       {/* 🔥 FRAUD SCENARIO TOGGLE */}
                       <div className={`p-8 rounded-4xl border-2 transition-all ${showFraudDemo ? "border-red-500 bg-red-500/10" : "bg-zinc-900/50 border-zinc-800"}`}>
                          <div className="flex justify-between items-center mb-6">
                             <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Fraud Simulation Node</h4>
                             <button onClick={() => setShowFraudDemo(!showFraudDemo)} className={`w-12 h-6 rounded-full transition-all relative ${showFraudDemo ? "bg-red-500" : "bg-zinc-700"}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showFraudDemo ? "left-7" : "left-1"}`} />
                             </button>
                          </div>
                          {showFraudDemo && (
                            <div className="space-y-4">
                               <p className="text-red-400 text-xs font-black uppercase animate-pulse">Suspicious Activity Detected</p>
                               <div className="text-[10px] font-bold text-zinc-400 leading-relaxed">
                                  Reason: Displacement detected in GPS node without corresponding IMU motion. Potential device detachment.
                               </div>
                               <p className="text-[9px] font-bold bg-white text-black px-3 py-1 rounded w-fit uppercase">Claims Restricted 🔒</p>
                            </div>
                          )}
                          {!showFraudDemo && <p className="text-[10px] font-bold text-zinc-600 italic">Toggle to test PoWI fraud detection engine.</p>}
                       </div>
                   </div>
                </div>
              )}

              {/* TAB 5: PROFILE */}
              {activeTab === "profile" && (
                <div className="p-8 pb-32 space-y-10 animate-in fade-in text-left">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl font-black text-blue-500 shadow-2xl">
                         {user.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                         <h2 className="text-2xl font-black text-white">{user.name}</h2>
                         <p className="text-[10px] font-black text-zinc-500 uppercase">{user.phone} · {getNodeName(coords)}</p>
                      </div>
                   </div>

                   <ul className="space-y-2">
                      <li className="p-5 bg-zinc-900/50 rounded-2xl flex justify-between items-center"><span className="text-xs font-bold text-zinc-400">Primary Platform</span><span className="text-xs font-black text-blue-400">{user.platform}</span></li>
                      <li className="p-5 bg-zinc-900/50 rounded-2xl flex justify-between items-center"><span className="text-xs font-bold text-zinc-400">Node Location</span><span className="text-xs font-black text-zinc-200">{getSubNode(coords)}</span></li>
                      
                      <li className="p-6 glass border-emerald-500/10 bg-linear-to-r from-emerald-500/5 to-transparent rounded-3xl grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[8px] font-black text-zinc-500 uppercase">Total Premiums Paid</p>
                             <p className="text-lg font-black italic text-zinc-200">₹{user.policies?.reduce((acc, p) => acc + p.premium, 0) || 0}</p>
                          </div>
                          <div className="space-y-1 text-right">
                             <p className="text-[8px] font-black text-zinc-500 uppercase">Total Payouts Received</p>
                             <p className="text-lg font-black italic text-emerald-400">₹{user.claims?.reduce((acc, c) => acc + (c.status === 'PAID' ? c.payoutAmount : 0), 0) || 0}</p>
                          </div>
                       </li>

                      <li className="p-5 bg-zinc-900/50 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-red-500/10 transition-colors" onClick={handleLogout}><span className="text-xs font-bold text-red-500">Deauthorize Device</span><LogOut className="w-4 h-4 text-red-500" /></li>
                   </ul>

                    {(() => {
                        const totalRecovered = user.claims?.reduce((acc, c) => acc + (c.status === 'PAID' ? c.payoutAmount : 0), 0) || 0;
                        return (
                          <div className="glass p-8 rounded-4xl border-emerald-500/20 bg-emerald-500/5 mb-6">
                            <h4 className="text-[10px] font-black text-emerald-500 uppercase mb-4 tracking-[2px]">Impact Statement</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center"><span className="text-xs font-bold text-zinc-500">Without Rozgaar Raksha</span><span className="text-xs font-black text-red-500">Lost ₹{totalRecovered.toFixed(0)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-xs font-bold text-zinc-500">With Rozgaar Raksha</span><span className="text-xs font-black text-emerald-500">₹{totalRecovered.toFixed(0)} Recovered</span></div>
                            </div>
                          </div>
                        );
                    })()}

                    <div className="glass p-8 rounded-4xl border-zinc-800 border bg-zinc-900/40">
                       <h4 className="text-[10px] font-black text-zinc-600 uppercase mb-4 tracking-[4px]">Ecosystem Settings</h4>
                       <div className="flex justify-between items-center py-3 border-b border-white/5"><span className="text-xs font-bold text-zinc-400">Real Weather Sync</span><input type="checkbox" checked readOnly className="accent-blue-500 w-4 h-4" /></div>
                       <div className="flex justify-between items-center py-3"><span className="text-xs font-bold text-zinc-400">Telemetry Handshake</span><input type="checkbox" checked readOnly className="accent-blue-500 w-4 h-4" /></div>
                    </div>
                </div>
              )}

              {/* BOTTOM NAVIGATION BAR */}
              <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-4 z-[100] safe-bottom">
                 {[
                   { id: "home", icon: <Zap className="w-5 h-5"/>, label: "Live" },
                   { id: "policy", icon: <Shield className="w-5 h-5"/>, label: "Policy" },
                   { id: "claims", icon: <Coins className="w-5 h-5"/>, label: "Claims" },
                   { id: "activity", icon: <Activity className="w-5 h-5"/>, label: "Signals" },
                   { id: "profile", icon: <User className="w-5 h-5"/>, label: "ID" }
                 ].map(t => (
                   <button 
                    key={t.id} 
                    onClick={() => setActiveTab(t.id)}
                    className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === t.id ? "text-[#00d2ff]" : "text-zinc-600"}`}
                   >
                     <div className={`p-2 rounded-xl transition-all ${activeTab === t.id ? "bg-[#00d2ff10]" : ""}`}>{t.icon}</div>
                     <span className="text-[8px] font-black uppercase tracking-widest">{t.label}</span>
                   </button>
                 ))}
              </nav>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- MODAL OVERLAYS --- */}
      <AnimatePresence>
         {/* Video Proof Upload Modal - NEW Liveness Version */}
         {uploadingClaim && (
           <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 z-500 bg-black p-8 flex flex-col gap-8">
              <div className="flex justify-between items-center mt-8">
                 <div>
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tight">Identity Guard.</h2>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[4px]">Liveness Verification</p>
                 </div>
                 <button onClick={() => setUploadingClaim(null)} className="p-3 bg-zinc-900 rounded-2xl"><ChevronLeft className="w-5 h-5 text-zinc-400" /></button>
              </div>
 
              <div className="flex-1 bg-zinc-900 rounded-[3rem] border-2 border-white/5 overflow-hidden relative flex flex-col items-center justify-center">
                 {/* LIVE CAMERA FEED */}
                 <video 
                   ref={videoRef} 
                   autoPlay 
                   playsInline 
                   muted 
                   className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.5]" 
                 />
                 
                 <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />

                 <div className="relative z-10 flex flex-col items-center gap-12 text-center px-12">
                   {challengeStatus === 'scanning' ? (
                     <div className="space-y-12 animate-in zoom-in duration-500">
                        {/* CHALLENGE ARROW */}
                        <div className="relative">
                           <div className="absolute inset-0 blur-3xl bg-white/20 animate-pulse rounded-full" />
                           <motion.div 
                             key={challengeStep}
                             initial={{ scale: 0.5, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl relative"
                           >
                              {challengeDir[challengeStep] === 'LEFT' && <ChevronLeft className="w-16 h-16 text-black" />}
                              {challengeDir[challengeStep] === 'RIGHT' && <ChevronRight className="w-16 h-16 text-black" />}
                              {challengeDir[challengeStep] === 'UP' && <ChevronUp className="w-16 h-16 text-black" />}
                              {challengeDir[challengeStep] === 'DOWN' && <ChevronDown className="w-16 h-16 text-black" />}
                           </motion.div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">
                              Pan {challengeDir[challengeStep]}
                           </h4>
                           <div className="flex gap-2 justify-center">
                              {challengeDir.map((_, i) => (
                                 <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i <= challengeStep ? "bg-white" : "bg-white/10"}`} />
                              ))}
                           </div>
                        </div>

                        <button 
                           onClick={() => {
                              if (challengeStep < challengeDir.length - 1) {
                                 setChallengeStep(challengeStep + 1);
                              } else {
                                 setChallengeStatus('complete');
                              }
                           }}
                           className="px-10 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-white/20 transition-all active:scale-95"
                        >
                           System Ready: Next Step
                        </button>
                     </div>
                   ) : (
                     <div className="space-y-6 animate-in fade-in duration-700">
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                           <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">Verification Ready</h4>
                        <p className="text-[10px] font-bold text-zinc-500 px-12 leading-relaxed uppercase">
                           Neural patterns collected. Panning sequence verified. You can now submit your forensic proof.
                        </p>
                     </div>
                   )}
                 </div>
              </div>
 
              <button 
                disabled={challengeStatus !== 'complete' || !videoBlob}
                onClick={async () => {
                  try {
                    const formData = new FormData();
                    formData.append('video', videoBlob, 'evidence.mp4');

                    await axios.post(`${API_BASE}/insurance/claims/${uploadingClaim.id}/evidence`, formData, {
                       headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    
                    refreshData();
                    setUploadingClaim(null);
                    addLog("Liveness Proof Verified", "info");
                  } catch (e) { alert("Forensic submission failed"); }
                }}
                className={`w-full py-6 font-black uppercase italic text-lg rounded-4xl shadow-2xl transition-all duration-500 ${
                   (challengeStatus === 'complete' && videoBlob)
                   ? "bg-white text-black active:scale-[0.98]" 
                   : "bg-zinc-900 text-zinc-600 opacity-50 cursor-not-allowed"
                }`}
              >
                Submit Forensic Proof
              </button>

           </motion.div>
         )}
         {/* Claim Detail Modal */}
         {selectedClaim && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-200 bg-black/98 backdrop-blur-2xl p-8 flex items-center justify-center">
              <div className="w-full max-w-sm space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Evidence Node #{selectedClaim.id.slice(0,6)}</p>
                       <h2 className="text-4xl font-black italic uppercase text-white">Settlement Details.</h2>
                    </div>
                    <button onClick={() => setSelectedClaim(null)} className="p-3 bg-zinc-900 rounded-2xl"><ChevronLeft className="w-5 h-5" /></button>
                 </div>

                 <div className="space-y-6">
                    {(() => {
                      const aiMeta = getClaimAIMeta(selectedClaim);
                      const dynamicExplanation = aiMeta?.dynamicMessage || claimExplanationById[selectedClaim.id];
                      if (!dynamicExplanation) return null;
                      return (
                        <div className="glass p-5 rounded-3xl bg-blue-500/5 border border-blue-500/20">
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2">AI Agent Summary</p>
                          <p className="text-[10px] font-bold text-zinc-200 leading-relaxed">{dynamicExplanation}</p>
                        </div>
                      );
                    })()}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-zinc-900 rounded-4xl border border-white/5 space-y-1">
                          <p className="text-[8px] font-black text-zinc-500 uppercase">Trigger Event</p>
                          <p className="text-xl font-bold uppercase">{selectedClaim.triggerType}</p>
                       </div>
                       <div className="p-6 bg-emerald-500/10 rounded-4xl border border-emerald-500/20 space-y-1">
                          <p className="text-[8px] font-black text-emerald-500 uppercase">Final Payout</p>
                          <p className="text-xl font-black text-white italic">₹{selectedClaim.payoutAmount}</p>
                       </div>
                    </div>

                    {/* 🔥 WHY THIS HAPPENED (EXPLAINABILITY) */}
                    <div className="glass p-8 rounded-4xl space-y-6 bg-blue-500/5">
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Decision Logic</h4>
                        <ul className="space-y-3">
                           <li className="flex items-center gap-3 text-[10px] font-bold text-zinc-300">
                             <CheckCircle className="text-emerald-500 w-3 h-3" /> 
                             {selectedClaim.triggerType === 'RAIN' ? 'Heavy precipitation (>25mm) confirmed' : 'Market orders dropped below threshold'}
                           </li>
                           <li className="flex items-center gap-3 text-[10px] font-bold text-zinc-300"><CheckCircle className="text-emerald-500 w-3 h-3" /> Valid active movement detected</li>
                           <li className="flex items-center gap-3 text-[10px] font-bold text-zinc-300"><CheckCircle className="text-emerald-500 w-3 h-3" /> Low fraud probability score</li>
                        </ul>
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-black uppercase text-zinc-500">
                           Engine Verification: Verified Node
                        </div>
                    </div>

                    <div className="glass p-8 rounded-4xl space-y-6">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Engine Scores</h4>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-zinc-400 uppercase">Activity Score (PoWI)</span><span className="text-xs font-black text-white">{selectedClaim.activityScore}</span></div>
                           <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-zinc-400 uppercase">Fraud Probability</span><span className="text-xs font-black text-blue-500">{selectedClaim.fraudScore}</span></div>
                           <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-zinc-400 uppercase">Settlement Logic</span><span className="text-[10px] font-black text-emerald-400 uppercase">Automated</span></div>
                        </div>
                    </div>
                 </div>

                 <p className="text-[10px] text-zinc-600 text-center pr-10">This claim was settled using hybrid environmental signals matched against your device telemetry.</p>
              </div>
           </motion.div>
         )}

         {/* Purchase Quote Modal */}
         {showQuotePopup && quote && (
           <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 z-200 bg-black/95 flex items-center justify-center p-6">
              <div className="glass w-full max-w-sm p-8 border-2 border-[#00d2ff30] space-y-8">
                 <h3 className="text-3xl font-black uppercase italic">Activate Guard</h3>
                 <div className="space-y-4 py-6 border-y border-white/5">
                    <div className="flex justify-between font-black uppercase text-[10px] text-zinc-500">Premium<span>₹{quote.totalPremium}</span></div>
                    <div className="flex justify-between font-black uppercase text-[10px] text-zinc-500">Coverage<span>₹5000</span></div>
                    <div className="flex justify-between font-black uppercase text-[10px] text-blue-400">Risk Forecast<span>{Math.round((quote?.model?.probabilityOfDisruption || quote?.riskScore || 0) * 100)}%</span></div>
                    <p className="text-[10px] font-bold text-zinc-400 leading-relaxed">Predicted Disruption Risk is continuously computed from weather, demand volatility, and disruption patterns.</p>
                 </div>
                 <button onClick={() => {
                   axios.post(`${API_BASE}/insurance/policy/purchase`, { userId: user.id, premium: quote.totalPremium, coverage: 5000 }).then(() => {
                     refreshData();
                     setShowQuotePopup(false);
                   });
                 }} className="neon-button w-full py-5">Initiate Shield</button>
                 <button onClick={() => setShowQuotePopup(false)} className="w-full text-xs font-black text-zinc-600 uppercase">Dismiss</button>
              </div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
