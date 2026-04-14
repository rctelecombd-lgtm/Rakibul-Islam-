
import React from 'react';
import { AdminTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  siteName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, siteName }) => {
  const navItems = [
    { id: AdminTab.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { id: AdminTab.SETTINGS, label: 'Site Control', icon: '⚙️' },
    { id: AdminTab.USERS, label: 'User Management', icon: '👥' },
    { id: AdminTab.PREVIEW, label: 'Public Preview', icon: '👁️' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full transition-all duration-300 ease-in-out z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">
            A
          </div>
          <span className="text-xl font-bold tracking-tight truncate">{siteName || "AdminPro"}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">John Admin</p>
              <p className="text-xs text-slate-500 truncate">Super Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md bg-white/80">
          <h1 className="text-lg font-semibold text-slate-800">
            {navItems.find(n => n.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-green-500 flex items-center justify-center text-[10px] text-white">4</div>
            </div>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              🔔
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
              Log out
            </button>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
