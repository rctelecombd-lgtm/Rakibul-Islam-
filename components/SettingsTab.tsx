
import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { analyzeSettings } from '../services/geminiService';

interface SettingsTabProps {
  settings: SiteSettings;
  onUpdate: (newSettings: SiteSettings) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    onUpdate(localSettings);
    setIsSaving(false);
    alert("Settings updated successfully!");
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeSettings(localSettings);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Site Configuration</h2>
          <p className="text-slate-500">Manage your system preferences without writing a single line of code.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAiAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-semibold transition-all flex items-center gap-2 border border-indigo-100 disabled:opacity-50"
          >
            {isAnalyzing ? '✨ Analyzing...' : '✨ AI Analysis'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-indigo-900 text-indigo-100 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <span className="text-6xl">✨</span>
          </div>
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            AI Insights & Recommendations
          </h3>
          <p className="whitespace-pre-wrap leading-relaxed opacity-90">{aiAnalysis}</p>
          <button 
            onClick={() => setAiAnalysis(null)}
            className="mt-4 text-xs underline opacity-50 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Branding */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xl">🏷️</div>
            <h3 className="text-lg font-bold text-slate-800">Site Branding</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Site Display Name</label>
              <input
                type="text"
                value={localSettings.siteName}
                onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                placeholder="Enter site name..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Global Controls */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 text-xl">⚡</div>
            <h3 className="text-lg font-bold text-slate-800">Core Switches</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="font-semibold text-slate-800">Maintenance Mode</p>
                <p className="text-xs text-slate-500">Block public access to the site.</p>
              </div>
              <button
                onClick={() => setLocalSettings({ ...localSettings, maintenanceMode: !localSettings.maintenanceMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${localSettings.maintenanceMode ? 'bg-red-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="font-semibold text-slate-800">User Registration</p>
                <p className="text-xs text-slate-500">Allow new users to create accounts.</p>
              </div>
              <button
                onClick={() => setLocalSettings({ ...localSettings, registrationEnabled: !localSettings.registrationEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${localSettings.registrationEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.registrationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Financial Control */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 text-xl">💰</div>
            <h3 className="text-lg font-bold text-slate-800">Financial Configuration</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Global Currency Symbol</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  {localSettings.currencySymbol}
                </span>
                <input
                  type="text"
                  value={localSettings.currencySymbol}
                  onChange={(e) => setLocalSettings({ ...localSettings, currencySymbol: e.target.value })}
                  placeholder="$"
                  maxLength={3}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Recharge Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={localSettings.minRechargeAmount}
                  onChange={(e) => setLocalSettings({ ...localSettings, minRechargeAmount: Number(e.target.value) })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsTab;
