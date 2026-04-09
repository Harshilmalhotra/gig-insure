'use client';
import AdminNav from '@/components/AdminNav';
import { useState } from 'react';
import { Play, RotateCcw, Sliders, CloudRain, Flame, TrendingDown, AlertTriangle, Sun, Wifi } from 'lucide-react';

const SCENARIOS = [
  { id: 'normal',       label: 'Normal Day',    icon: Sun,           colors: 'border-green-500/30 text-green-400 hover:bg-green-500/8' },
  { id: 'rain',         label: 'Heavy Rain',    icon: CloudRain,     colors: 'border-blue-500/30 text-blue-400 hover:bg-blue-500/8' },
  { id: 'heat',         label: 'Heat Wave',     icon: Flame,         colors: 'border-orange-500/30 text-orange-400 hover:bg-orange-500/8' },
  { id: 'demand_crash', label: 'Demand Crash',  icon: TrendingDown,  colors: 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/8' },
  { id: 'outage',       label: 'App Outage',    icon: Wifi,          colors: 'border-purple-500/30 text-purple-400 hover:bg-purple-500/8' },
  { id: 'fraud',        label: 'Fraud Attack',  icon: AlertTriangle, colors: 'border-red-500/30 text-red-400 hover:bg-red-500/8' },
];

function RangeSlider({ label, min, max, step = 1, unit = '', value, onChange }: {
  label: string; min: number; max: number; step?: number; unit?: string;
  value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-gray-500">{label}</span>
        <span className="text-indigo-400 font-mono font-bold">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-500"
        style={{ background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((value - min) / (max - min)) * 100}%, #1a1a2e ${((value - min) / (max - min)) * 100}%, #1a1a2e 100%)` }}
      />
      <div className="flex justify-between text-[9px] text-gray-700 mt-0.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

type LogEntry = { text: string; type: 'info' | 'warn' | 'ok' | 'err' };

export default function SimulationPage() {
  const [rain, setRain]       = useState(0);
  const [temp, setTemp]       = useState(28);
  const [aqi, setAqi]         = useState(120);
  const [orders, setOrders]   = useState(3.5);
  const [demand, setDemand]   = useState(100);
  const [motion, setMotion]   = useState<'moving' | 'idle'>('moving');
  const [gps, setGps]         = useState<'smooth' | 'jump'>('smooth');
  const [outage, setOutage]   = useState(false);
  const [running, setRunning] = useState(false);
  const [log, setLog]         = useState<LogEntry[]>([]);
  const [result, setResult]   = useState<null | 'approved' | 'flagged' | 'no-trigger'>(null);

  function applyScenario(id: string) {
    setLog([]); setResult(null);
    if (id === 'normal')       { setRain(0);  setTemp(28); setAqi(80);  setOrders(3.5); setDemand(100); setMotion('moving'); setGps('smooth'); setOutage(false); }
    if (id === 'rain')         { setRain(48); setTemp(22); setAqi(130); setOrders(0.9); setDemand(40);  setMotion('moving'); setGps('smooth'); setOutage(false); }
    if (id === 'heat')         { setRain(0);  setTemp(46); setAqi(220); setOrders(1.1); setDemand(55);  setMotion('moving'); setGps('smooth'); setOutage(false); }
    if (id === 'demand_crash') { setRain(0);  setTemp(30); setAqi(100); setOrders(0.2); setDemand(15);  setMotion('moving'); setGps('smooth'); setOutage(false); }
    if (id === 'outage')       { setRain(0);  setTemp(29); setAqi(110); setOrders(0.0); setDemand(0);   setMotion('moving'); setGps('smooth'); setOutage(true); }
    if (id === 'fraud')        { setRain(30); setTemp(24); setAqi(90);  setOrders(0.1); setDemand(30);  setMotion('idle');   setGps('jump');   setOutage(false); }
  }

  async function runSim() {
    setRunning(true); setLog([]); setResult(null);

    const isFraud = motion === 'idle' && gps === 'jump';
    const triggered = rain > 20 || temp > 42 || orders < 1 || outage || demand < 30;
    const triggers = [
      rain > 20 && `RAIN (${rain}mm > 20mm threshold)`,
      temp > 42 && `HEAT (${temp}°C > 42°C threshold)`,
      orders < 1 && `DEMAND_CRASH (${orders} orders/hr < 1.0 threshold)`,
      outage && 'PLATFORM_OUTAGE',
      demand < 30 && `DEMAND_INDEX (${demand}% < 30% threshold)`,
    ].filter(Boolean) as string[];

    const actScore = isFraud ? 0.18 : parseFloat((0.6 + Math.random() * 0.35).toFixed(3));
    const fraudScore = isFraud ? parseFloat((0.65 + Math.random() * 0.25).toFixed(3)) : parseFloat((0.05 + Math.random() * 0.2).toFixed(3));
    const payout = triggered && !isFraud ? Math.round(5000 * actScore) : 0;

    const steps: LogEntry[] = [
      { text: '[SIM_ENGINE] Initializing worker state injection...', type: 'info' },
      { text: `[ENVIRONMENT] rain=${rain}mm  temp=${temp}°C  AQI=${aqi}  demand=${demand}%`, type: 'info' },
      { text: `[WORKER_STATE] orders/hr=${orders}  motion=${motion}  gps_pattern=${gps}  platform_outage=${outage}`, type: 'info' },
      { text: triggered
          ? `[TRIGGER_ENGINE] ✓ Triggers detected: ${triggers.join(', ')}`
          : '[TRIGGER_ENGINE] — No trigger conditions met. No claim generated.', type: triggered ? 'warn' : 'info' },
      { text: `[ACTIVITY_SCORE] motion_component=0.40  route_component=0.30  behavior_component=0.30  → score=${actScore}`, type: 'info' },
      { text: `[FRAUD_ENGINE] gps_anomaly×0.40 + motion_anomaly×0.30 + behavior_anomaly×0.30 → fraud_score=${fraudScore}`, type: fraudScore > 0.35 ? 'warn' : 'ok' },
      {
        text: isFraud
          ? `[DECISION] ⚠ CLAIM FLAGGED — fraud_score=${fraudScore} exceeds 0.60 threshold → auto-block triggered`
          : triggered
            ? `[DECISION] ✓ CLAIM APPROVED — payout = ₹5000 × ${(actScore * 100).toFixed(1)}% = ₹${payout}`
            : '[DECISION] — No trigger event. Pipeline halted.',
        type: isFraud ? 'err' : triggered ? 'ok' : 'info',
      },
      { text: '[SIM_ENGINE] Simulation cycle complete.', type: 'info' },
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 430));
      setLog(prev => [...prev, step]);
    }

    setResult(isFraud ? 'flagged' : triggered ? 'approved' : 'no-trigger');
    setRunning(false);
  }

  const logColor = (type: LogEntry['type']) => ({
    err: 'text-red-400', ok: 'text-green-400', warn: 'text-yellow-400', info: 'text-gray-500',
  }[type]);

  return (
    <AdminNav>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Simulation Control</h1>
          <p className="text-gray-500 text-sm mt-1">Inject synthetic conditions and trace the full decision pipeline</p>
        </div>

        {/* Scenarios */}
        <div>
          <p className="text-[11px] text-gray-600 uppercase tracking-widest mb-3">Quick Scenarios</p>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => applyScenario(s.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all bg-[#0c0c1a] ${s.colors}`}>
                  <Icon size={13} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            <div className="card p-6 space-y-5">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Sliders size={15} className="text-indigo-400" /> Environment Parameters
              </h3>
              <RangeSlider label="Rainfall"    min={0}  max={120} unit="mm" value={rain}   onChange={setRain} />
              <RangeSlider label="Temperature" min={10} max={52}  unit="°C" value={temp}   onChange={setTemp} />
              <RangeSlider label="AQI Index"   min={0}  max={500}            value={aqi}    onChange={setAqi} />
              <RangeSlider label="Demand Index" min={0} max={100} unit="%"  value={demand} onChange={setDemand} />
            </div>

            <div className="card p-6 space-y-5">
              <h3 className="font-semibold text-white">Worker Behavior</h3>
              <RangeSlider label="Orders / hr" min={0} max={8} step={0.1} value={orders} onChange={setOrders} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-600 mb-2">Motion State</div>
                  <div className="flex rounded-xl overflow-hidden border border-[#1a1a2e]">
                    {(['moving', 'idle'] as const).map(m => (
                      <button key={m} onClick={() => setMotion(m)}
                        className={`flex-1 py-2 text-xs font-semibold capitalize transition-all ${
                          motion === m ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-300 bg-[#0c0c1a]'
                        }`}>{m}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-2">GPS Pattern</div>
                  <div className="flex rounded-xl overflow-hidden border border-[#1a1a2e]">
                    {(['smooth', 'jump'] as const).map(g => (
                      <button key={g} onClick={() => setGps(g)}
                        className={`flex-1 py-2 text-xs font-semibold capitalize transition-all ${
                          gps === g ? (g === 'jump' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white') : 'text-gray-600 hover:text-gray-300 bg-[#0c0c1a]'
                        }`}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-300">Platform Outage</div>
                  <div className="text-xs text-gray-700 mt-0.5">Simulate API downtime event</div>
                </div>
                <button onClick={() => setOutage(!outage)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${outage ? 'bg-red-500' : 'bg-[#1a1a2e]'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${outage ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Engine Pipeline Output</h3>
              <div className="flex gap-2">
                <button onClick={() => { setLog([]); setResult(null); }}
                  className="w-8 h-8 rounded-xl bg-[#11111f] hover:bg-[#1a1a2e] text-gray-500 hover:text-white flex items-center justify-center transition-colors">
                  <RotateCcw size={13} />
                </button>
                <button onClick={runSim} disabled={running}
                  className="btn-accent flex items-center gap-2 disabled:opacity-50 py-2 px-4 text-xs">
                  <Play size={12} fill="white" />
                  {running ? 'Running...' : 'Run Pipeline'}
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#04040c] rounded-xl p-4 font-mono text-xs min-h-[300px] max-h-[420px] overflow-y-auto border border-[#1a1a2e]">
              {log.length === 0
                ? <div className="text-gray-800 leading-relaxed">
                    {'// Adjust parameters above\n// Click "Run Pipeline" to trace\n// the full claim decision cycle'.split('\n').map((l, i) => <div key={i}>{l}</div>)}
                  </div>
                : log.map((entry, i) => (
                  <div key={i} className={`mb-1.5 leading-relaxed ${logColor(entry.type)}`}>
                    {entry.text}
                  </div>
                ))
              }
              {running && <span className="text-indigo-400 animate-blink">▌</span>}
            </div>

            {result && (
              <div className={`mt-4 p-4 rounded-xl border text-center text-sm font-semibold ${
                result === 'approved'   ? 'bg-green-500/8 border-green-500/25 text-green-400' :
                result === 'flagged'    ? 'bg-red-500/8 border-red-500/25 text-red-400' :
                'bg-[#11111f] border-[#1a1a2e] text-gray-500'
              }`}>
                {result === 'approved'   && '✓ Claim Approved — Payout Triggered'}
                {result === 'flagged'    && '⚠ Claim Flagged — Fraud Score Exceeded Threshold'}
                {result === 'no-trigger' && '— No trigger conditions met. No claim generated.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminNav>
  );
}
