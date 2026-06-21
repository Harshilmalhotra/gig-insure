'use client';
import AdminNav from '@/components/AdminNav';
import { useState } from 'react';
import { Search, Filter, Check, X, Eye, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const ALL_CLAIMS = [
  { id:'CLM-4521', worker:'Ramesh Kumar',  platform:'Swiggy',  trigger:'Heavy Rain',      amt:425,  powi:87, status:'pending',  date:'2 Apr 2026',  zone:'Delhi NCR' },
  { id:'CLM-4519', worker:'Priya Sharma',  platform:'Zomato',  trigger:'Demand Crash',    amt:310,  powi:62, status:'review',   date:'1 Apr 2026',  zone:'Mumbai' },
  { id:'CLM-4517', worker:'Ahmed Raza',    platform:'Blinkit', trigger:'App Outage',      amt:500,  powi:91, status:'approved', date:'31 Mar 2026', zone:'Bangalore' },
  { id:'CLM-4512', worker:'Sonia Mehta',   platform:'Swiggy',  trigger:'Heavy Rain',      amt:0,    powi:19, status:'flagged',  date:'30 Mar 2026', zone:'Delhi NCR' },
  { id:'CLM-4508', worker:'Kiran Tiwari',  platform:'Zepto',   trigger:'Heat Wave',       amt:280,  powi:76, status:'approved', date:'29 Mar 2026', zone:'Hyderabad' },
  { id:'CLM-4501', worker:'Deepak Verma',  platform:'Zomato',  trigger:'Demand Crash',    amt:0,    powi:22, status:'rejected', date:'28 Mar 2026', zone:'Delhi NCR' },
  { id:'CLM-4489', worker:'Meena Joshi',   platform:'Swiggy',  trigger:'Heavy Rain',      amt:450,  powi:88, status:'approved', date:'27 Mar 2026', zone:'Pune' },
  { id:'CLM-4472', worker:'Ravi Patel',    platform:'Blinkit', trigger:'App Outage',      amt:500,  powi:79, status:'pending',  date:'26 Mar 2026', zone:'Ahmedabad' },
];

const STATUS_BADGE: Record<string, string> = {
  approved: 'badge-green',
  pending:  'badge-blue',
  review:   'badge-yellow',
  flagged:  'badge-red',
  rejected: 'badge-red',
};

export default function ClaimsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [claims, setClaims] = useState(ALL_CLAIMS);

  const filtered = claims.filter(c => {
    const s = search.toLowerCase();
    const matchS = !s || c.worker.toLowerCase().includes(s) || c.id.toLowerCase().includes(s) || c.trigger.toLowerCase().includes(s);
    const matchF = filter === 'all' || c.status === filter;
    return matchS && matchF;
  });

  function updateStatus(id: string, status: string) {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }

  return (
    <AdminNav>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Claims Management</h1>
          <p className="text-gray-500 text-sm mt-1">{claims.length} total claims</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total',    val: claims.length,                                        color: 'text-indigo-400' },
            { label: 'Pending',  val: claims.filter(c => c.status === 'pending').length,    color: 'text-indigo-400' },
            { label: 'Review',   val: claims.filter(c => c.status === 'review').length,     color: 'text-yellow-400' },
            { label: 'Flagged',  val: claims.filter(c => c.status === 'flagged').length,    color: 'text-red-400' },
            { label: 'Approved', val: claims.filter(c => c.status === 'approved').length,   color: 'text-green-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card p-4">
              <div className={`text-2xl font-bold font-mono ${color}`}>{val}</div>
              <div className="text-xs text-gray-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#0c0c1a] border border-[#1a1a2e] rounded-xl px-3 py-2.5 flex-1 max-w-xs">
            <Search size={14} className="text-gray-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search worker, ID, trigger..."
              className="bg-transparent text-sm text-white outline-none w-full placeholder:text-gray-700" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'review', 'flagged', 'approved', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize',
                  filter === f
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-[#0c0c1a] border-[#1a1a2e] text-gray-500 hover:text-white')}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#11111f] border-b border-[#1a1a2e]">
                <tr>
                  {['Claim ID', 'Worker', 'Platform', 'Trigger', 'Amount', 'PoWI', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="th px-4 first:pl-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="table-row">
                    <td className="td pl-6 font-mono text-indigo-400 text-xs">{c.id}</td>
                    <td className="td">
                      <div className="text-sm font-medium text-white">{c.worker}</div>
                      <div className="text-[10px] text-gray-600">{c.zone}</div>
                    </td>
                    <td className="td text-gray-500 text-xs">{c.platform}</td>
                    <td className="td text-gray-400 text-xs">{c.trigger}</td>
                    <td className="td font-mono font-semibold text-white">₹{c.amt}</td>
                    <td className="td">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${c.powi > 70 ? 'bg-green-400' : c.powi > 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${c.powi}%` }} />
                        </div>
                        <span className="font-mono text-xs text-gray-400">{c.powi}%</span>
                      </div>
                    </td>
                    <td className="td text-gray-600 text-xs font-mono">{c.date}</td>
                    <td className="td"><span className={STATUS_BADGE[c.status]}>{c.status}</span></td>
                    <td className="td pr-6">
                      {(c.status === 'pending' || c.status === 'review') && (
                        <div className="flex gap-1.5">
                          <button onClick={() => updateStatus(c.id, 'approved')}
                            className="w-7 h-7 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center transition-colors"
                            title="Approve">
                            <Check size={13} />
                          </button>
                          <button onClick={() => updateStatus(c.id, 'rejected')}
                            className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors"
                            title="Reject">
                            <X size={13} />
                          </button>
                        </div>
                      )}
                      {c.status === 'flagged' && (
                        <button onClick={() => updateStatus(c.id, 'review')}
                          className="text-xs text-yellow-400 hover:text-yellow-300 font-medium">
                          Escalate
                        </button>
                      )}
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
