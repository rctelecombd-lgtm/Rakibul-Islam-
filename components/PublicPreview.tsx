
import React from 'react';
import { SiteSettings } from '../types';

interface PublicPreviewProps {
  settings: SiteSettings;
}

const PublicPreview: React.FC<PublicPreviewProps> = ({ settings }) => {
  if (settings.maintenanceMode) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-12 bg-white rounded-3xl shadow-2xl border border-slate-200 text-center animate-in zoom-in duration-300">
        <div className="text-6xl mb-6">🛠️</div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Under Maintenance</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          {settings.siteName} is currently undergoing scheduled maintenance to improve our services. We'll be back shortly!
        </p>
        <div className="flex justify-center gap-4">
          <div className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-400 uppercase tracking-wider">
            Admin Access Only
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <nav className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg"></div>
          <span className="text-xl font-black text-slate-900 tracking-tight">{settings.siteName}</span>
        </div>
        <div className="flex gap-4">
          <button className="text-slate-600 font-medium hover:text-indigo-600">Home</button>
          <button className="text-slate-600 font-medium hover:text-indigo-600">Features</button>
          {settings.registrationEnabled ? (
            <button className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
              Sign Up
            </button>
          ) : (
            <button className="px-5 py-2 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
              Log In
            </button>
          )}
        </div>
      </nav>

      <div className="text-center py-20 px-6 bg-indigo-600 rounded-[3rem] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Welcome to {settings.siteName}</h1>
        <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          The ultimate platform for modern digital assets. Start your journey today with as little as {settings.currencySymbol}{settings.minRechargeAmount}.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-xl shadow-black/20 hover:scale-105 transition-transform">
            Get Started
          </button>
          <button className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black hover:bg-indigo-400 transition-all border border-indigo-400">
            Learn More
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-8 bg-white rounded-3xl border border-slate-100 hover:shadow-xl transition-shadow group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              {i === 1 ? '🚀' : i === 2 ? '🛡️' : '⚡'}
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">Feature {i}</h4>
            <p className="text-slate-500 leading-relaxed">
              Experience lightning fast performance and top-tier security with our custom optimized infrastructure.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicPreview;
