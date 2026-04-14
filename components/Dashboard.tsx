
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SiteSettings } from '../types';

const data = [
  { name: 'Mon', active: 4000, revenue: 2400 },
  { name: 'Tue', active: 3000, revenue: 1398 },
  { name: 'Wed', active: 2000, revenue: 9800 },
  { name: 'Thu', active: 2780, revenue: 3908 },
  { name: 'Fri', active: 1890, revenue: 4800 },
  { name: 'Sat', active: 2390, revenue: 3800 },
  { name: 'Sun', active: 3490, revenue: 4300 },
];

interface DashboardProps {
  settings: SiteSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ settings }) => {
  const stats = [
    { label: 'Total Revenue', value: `${settings.currencySymbol}12,840`, change: '+12.5%', icon: '📈' },
    { label: 'Active Users', value: '1,240', change: '+5.2%', icon: '👥' },
    { label: 'New Signups', value: '42', change: '-2.1%', icon: '✨' },
    { label: 'Avg Recharge', value: `${settings.currencySymbol}24.50`, change: '+0.4%', icon: '💳' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Activity Analytics</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
