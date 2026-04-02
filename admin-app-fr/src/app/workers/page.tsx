'use client';
import AdminNav from '@/components/AdminNav';
import { useState } from 'react';
import { Search, Users, TrendingUp, Shield, Star } from 'lucide-react';
import clsx from 'clsx';

const WORKERS = [
  { id:'WRK-001', name:'Ramesh Kumar',  platform:'Swiggy',  zone:'Delhi NCR',   trust:82, claims:12, earnings:'₹1,24,000', status:'active',  rating:4.5 },
  { id:'WRK-012', name:'Priya Sharma',  platform:'Zomato',  zone:'Mumbai',      trust:74, claims:8,  earnings:'₹98,000',  status:'active',  rating:4.3 },
  { id:'WRK-034', name:'Ahmed Raza',    platform:'Blinkit', zone:'Bangalore',   trust:91, claims:18, earnings:'₹1,56,000', status:'active',  rating:4.7 },
  { id:'WRK-087', name:'Sonia Mehta',   platform:'Swiggy',  zone:'Delhi NCR',   trust:28, claims:4,  earnings:'₹42,000',  status:'flagged', rating:3.8 },
  { id:'WRK-156', name:'Kiran Tiwari',  platform:'Zepto',   zone:'Hyderabad',   trust:67, claims:9,  earnings:'₹87,000',  status:'active',  rating:4.1 },
  { id:'WRK-203', name:'Deepak Verma',  platform:'Zomato',  zone:'Delhi NCR',   trust:21, claims:3,  earnings:'₹31,000',  status:'blocked', rating:3.2 },
  { id:'WRK-267', name:'Meena Joshi',   platform:'Swiggy',  zone:'Pune',        trust:88, claims:15, earnings:'₹1,12,000', status:'active',  rating:4.6 },
  { id:'WRK-312', name:'Ravi Patel',    platform:'Blinkit', zone:'Ahmedabad',   trust:55, claims:6,  earnings:'₹64,000',  status:'active',  rating:4.0 },
  { id:'WRK-441', name:'Suresh Das',    platform:'Zomato',  zone:'Kolkata',     trust:19, claims:5,  earnings:'₹28,000',  status:'blocked', rating:3.1 },
  { id:'WRK-519', name:'Lakshmi Nair',  platform:'Zepto',   zone:'Chennai',     trust:79, claims:11, earnings:'₹1,01,000', status:'active',  rating:4.4 },
];

const STATUS_BADGE: Record<string, string> = {
  active:  'badge-green',
  flagged: 'badge-yellow',
  blocked: 'badge-red',
};

const STATUS_AVATAR: Record<string, string> = {
  active:  'bg-indigo-500/10 text-indigo-400',
  flagged: 'bg-yellow-500/10 text-yellow-400',
  blocked: 'bg-red-500/10 text-red-400',
};

export default function WorkersPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = WORKERS.filter(w => {
    const s = search.toLowerCase();
    const matchS = !s || w.name.toLowerCase().includes(s) || w.id.toLowerCase().includes(s) || w.zone.toLowerCase().includes(s) || w.platform.toLowerCase().includes(s);
    const matchF = filter === 'all' || w.status === filter;
    return matchS && matchF;
  });

  return (
    <AdminNav>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Workers</h1>
          <p className="text-gray-500 text-sm mt-1">{WORKERS.length} registered workers across all platforms</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Workers',    val: WORKERS.length,                                       icon: Users,     color: 'text-indigo-400' },
            { label: 'Active',           val: WORKERS.filter(w => w.status === 'active').length,    icon: TrendingUp, color: 'text-green-400' },
            { label: 'Flagged/Blocked',  val: WORKERS.filter(w => w.status !== 'active').length,   icon: Shield,    color: 'text-red-400' },
            { label: 'Avg Trust Score',  val: Math.round(WORKERS.reduce((a, w) => a + w.trust, 0) / WORKERS.length), icon: Star, color: 'text-indigo-400' },
          ].map(({ label, val, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <Icon size={15} className={`${color} mb-3`} />
              <div className={`text-2xl font-bold font-mono ${color}`}>{val}</div>
              <div className="text-xs text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#0c0c1a] border border-[#1a1a2e] rounded-xl px-3 py-2.5 flex-1 max-w-sm">
            <Search size={14} className="text-gray-600" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, ID, zone, platform..."
              className="bg-transparent text-sm text-white outline-none w-full placeholder:text-gray-700" />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'flagged', 'blocked'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all',
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
                  {['Worker', 'Platform', 'Zone', 'Trust Score', 'Claims', 'Total Earned', 'Rating', 'Status'].map(h => (
                    <th key={h} className="th px-4 first:pl-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => (
                  <tr key={w.id} className="table-row cursor-pointer">
                    <td className="td pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${STATUS_AVATAR[w.status]}`}>
                          {w.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{w.name}</div>
                          <div className="text-[10px] text-gray-600 font-mono">{w.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td text-gray-500 text-xs">{w.platform}</td>
                    <td className="td text-gray-500 text-xs">{w.zone}</td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${w.trust > 70 ? 'bg-green-400' : w.trust > 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${w.trust}%` }} />
                        </div>
                        <span className={clsx('text-xs font-mono font-bold', w.trust > 70 ? 'text-green-400' : w.trust > 40 ? 'text-yellow-400' : 'text-red-400')}>
                          {w.trust}
                        </span>
                      </div>
                    </td>
                    <td className="td font-mono text-gray-400">{w.claims}</td>
                    <td className="td font-mono text-white text-xs font-semibold">{w.earnings}</td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-mono text-gray-300">{w.rating}</span>
                      </div>
                    </td>
                    <td className="td pr-6">
                      <span className={STATUS_BADGE[w.status]}>{w.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm">No workers match your search</div>
            </div>
          )}
        </div>
      </div>
    </AdminNav>
  );
}
