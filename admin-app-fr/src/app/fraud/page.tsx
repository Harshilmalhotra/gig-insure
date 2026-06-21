'use client';
import AdminNav from '@/components/AdminNav';
import { AlertTriangle, TrendingUp, Shield, Eye, Ban } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const FLAGGED = [
  { id:'WRK-087', name:'Sonia Mehta',  zone:'Delhi NCR', score:0.78, claims:4,  pattern:'GPS teleport + idle motion',    risk:'HIGH' },
  { id:'WRK-203', name:'Deepak Verma', zone:'Delhi NCR', score:0.85, claims:3,  pattern:'Claim during non-working hours', risk:'CRITICAL' },
  { id:'WRK-312', name:'Ravi Patel',   zone:'Ahmedabad', score:0.61, claims:6,  pattern:'Route anomaly on rain trigger',  risk:'MEDIUM' },
  { id:'WRK-441', name:'Suresh Das',   zone:'Kolkata',   score:0.72, claims:5,  pattern:'Stationary during demand claim', risk:'HIGH' },
];

const SCATTER_DATA = [
  { x: 12, y: 0.15, name: 'Normal cluster A' },
  { x: 14, y: 0.18, name: 'Normal' },
  { x: 11, y: 0.22, name: 'Normal' },
  { x: 15, y: 0.12, name: 'Normal' },
  { x: 13, y: 0.25, name: 'Normal' },
  { x: 9,  y: 0.19, name: 'Normal' },
  { x: 16, y: 0.21, name: 'Normal' },
  { x: 10, y: 0.17, name: 'Normal' },
  { x: 3,  y: 0.78, name: 'Fraud' },
  { x: 2,  y: 0.85, name: 'Fraud' },
  { x: 4,  y: 0.61, name: 'Fraud' },
  { x: 1,  y: 0.72, name: 'Fraud' },
];

function ScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0c0c1a] border border-[#1a1a2e] rounded-xl px-3 py-2 text-xs">
      <div className={d.name === 'Fraud' ? 'text-red-400 font-semibold' : 'text-gray-400'}>{d.name}</div>
      <div className="text-gray-500 mt-0.5">Claims: {d.x} · Fraud score: {d.y}</div>
    </div>
  );
}

export default function FraudPage() {
  return (
    <AdminNav>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time fraud detection engine output</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Flagged Today',    val: '7',     color: 'text-red-400',    icon: AlertTriangle },
            { label: 'Avg Fraud Score',  val: '0.74',  color: 'text-yellow-400', icon: TrendingUp },
            { label: 'Auto-Blocked',     val: '2',     color: 'text-red-400',    icon: Ban },
            { label: 'Under Review',     val: '5',     color: 'text-yellow-400', icon: Eye },
          ].map(({ label, val, color, icon: Icon }) => (
            <div key={label} className="card p-5">
              <Icon size={15} className={`${color} mb-3`} />
              <div className={`text-2xl font-bold font-mono ${color}`}>{val}</div>
              <div className="text-xs text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Scatter plot + signals */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-1">Fraud Cluster Map</h3>
            <p className="text-xs text-gray-600 mb-5">Claims count vs fraud score — red = anomaly</p>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart>
                <CartesianGrid stroke="#1a1a2e" strokeDasharray="3 3" />
                <XAxis dataKey="x" name="Claims" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: 'Claims', fill: '#555', fontSize: 10, position: 'insideBottom', offset: -2 }} />
                <YAxis dataKey="y" name="Fraud Score" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 1]} />
                <Tooltip content={<ScatterTooltip />} />
                <Scatter data={SCATTER_DATA.filter(d => d.name !== 'Fraud')} fill="#6366f1" opacity={0.6} />
                <Scatter data={SCATTER_DATA.filter(d => d.name === 'Fraud')} fill="#ef4444" opacity={0.85} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 justify-center">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Normal
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Anomaly
              </div>
            </div>
          </div>

          {/* Signal breakdown */}
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-5">Detection Signals</h3>
            <div className="space-y-4">
              {[
                { label: 'GPS Anomaly',           pct: 78, color: 'bg-red-400' },
                { label: 'Motion Anomaly',         pct: 65, color: 'bg-orange-400' },
                { label: 'Behavioral Anomaly',     pct: 52, color: 'bg-yellow-400' },
                { label: 'Timing Anomaly',         pct: 41, color: 'bg-purple-400' },
                { label: 'Order Pattern Anomaly',  pct: 33, color: 'bg-blue-400' },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-mono text-gray-300">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-3 bg-red-500/8 border border-red-500/20 rounded-xl">
              <div className="text-xs text-red-400 font-semibold">Engine Threshold</div>
              <div className="text-xs text-gray-500 mt-0.5">Claims with fraud score ≥ 0.60 are auto-flagged for review. Score ≥ 0.80 triggers auto-block.</div>
            </div>
          </div>
        </div>

        {/* Flagged workers */}
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-5">Flagged Workers</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#1a1a2e]">
                <tr>
                  {['Worker', 'Zone', 'Fraud Score', 'Claims', 'Pattern Detected', 'Risk', 'Action'].map(h => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FLAGGED.map(w => (
                  <tr key={w.id} className="table-row">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center text-xs font-bold text-red-400 flex-shrink-0">
                          {w.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{w.name}</div>
                          <div className="text-[10px] text-gray-600 font-mono">{w.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td text-gray-500 text-xs">{w.zone}</td>
                    <td className="td">
                      <span className={`font-mono font-bold text-sm ${w.score > 0.75 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {w.score.toFixed(2)}
                      </span>
                    </td>
                    <td className="td font-mono text-gray-400">{w.claims}</td>
                    <td className="td text-gray-500 text-xs max-w-[200px]">{w.pattern}</td>
                    <td className="td">
                      <span className={w.risk === 'CRITICAL' ? 'badge-red' : w.risk === 'HIGH' ? 'badge-red' : 'badge-yellow'}>
                        {w.risk}
                      </span>
                    </td>
                    <td className="td">
                      <div className="flex gap-2">
                        <button className="text-xs text-indigo-400 hover:text-indigo-300">Review</button>
                        <button className="text-xs text-red-400 hover:text-red-300">Block</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminNav>
  );
}
