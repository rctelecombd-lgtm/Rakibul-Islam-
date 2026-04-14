import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, SystemConfig, User } from '../types';
import { ShieldCheck, User as UserIcon, Smartphone, Mail, Lock, Key, Calendar, Fingerprint, ArrowLeft, Eye, EyeOff, ShieldAlert, ChevronRight, Hash, XCircle, CheckCircle2, HelpCircle, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LoginProps {
  onLogin: (identifier: string, password?: string) => void;
  onSignUp: (userData: Partial<User>) => Promise<boolean | undefined> | boolean | undefined;
  onResetPassword: (identifier: string, dob: string, mobile: string, newPassword: string) => boolean;
  systemConfig: SystemConfig;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignUp, onResetPassword, systemConfig }) => {
  const [view, setView] = useState<'USER_LOGIN' | 'ADMIN_LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD'>('USER_LOGIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Forgot Password Fields
  const [forgotData, setForgotData] = useState({
    identifier: '',
    dob: '',
    mobile: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sign up fields
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    username: '',
    password: '',
    dob: '',
    nid: ''
  });

  const handleLoginClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaVerified) {
      toast.error("অনুগ্রহ করে ক্যাপচা পূরণ করুন।");
      return;
    }
    if (!identifier) {
      toast.error("ইউজারনেম অথবা ইমেইল দিন।");
      return;
    }
    
    if (view === 'ADMIN_LOGIN') {
      onLogin(identifier);
    } else {
      if (!password) {
        toast.error("পাসওয়ার্ড দিন।");
        return;
      }
      onLogin(identifier, password);
    }
  };

  const handleSignUpClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemConfig.isRegistrationEnabled) {
      toast.error("বর্তমানে নতুন রেজিস্ট্রেশন বন্ধ আছে।");
      return;
    }
    if (!isCaptchaVerified) {
      toast.error("অনুগ্রহ করে ক্যাপচা পূরণ করুন।");
      return;
    }
    if (signupData.mobile.length !== 11) {
      toast.error("মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে।");
      return;
    }
    if (signupData.nid && (signupData.nid.length < 10 || signupData.nid.length > 17)) {
      toast.error("এনআইডি নম্বর ১০ থেকে ১৭ সংখ্যার মধ্যে হতে হবে।");
      return;
    }
    if (signupData.password.length < 8) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    const success = await onSignUp(signupData);
    if (success) {
      setView('USER_LOGIN');
      setIdentifier(signupData.email);
      setPassword(signupData.password);
      setIsCaptchaVerified(false);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaVerified) {
      toast.error("ক্যাপচা ভেরিফিকেশন প্রয়োজন।");
      return;
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      toast.error("পাসওয়ার্ড দুটি মিলছে না!");
      return;
    }
    const success = onResetPassword(forgotData.identifier, forgotData.dob, forgotData.mobile, forgotData.newPassword);
    if (success) {
      setView('USER_LOGIN');
      setIsCaptchaVerified(false);
    }
  };

  const switchView = (newView: typeof view) => {
    setView(newView);
    setIsCaptchaVerified(false);
    setIdentifier('');
    setPassword('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-inter relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

      <motion.div 
        layout
        className={`w-full ${view === 'SIGNUP' ? 'max-w-4xl' : 'max-w-md'} relative z-10`}
      >
        {/* Main Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden relative group">
          {/* Top Accent Line */}
          <motion.div 
            layoutId="accent-line"
            className={`absolute top-0 left-0 w-full h-1.5 transition-all duration-700 ${
              view === 'SIGNUP' ? 'bg-emerald-500' : 
              view === 'ADMIN_LOGIN' ? 'bg-rose-500' : 
              view === 'FORGOT_PASSWORD' ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
          />
          
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {view === 'USER_LOGIN' && (
                <motion.div 
                  key="user-login"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center mb-10">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl mb-6 shadow-2xl shadow-indigo-500/20 ring-1 ring-white/20"
                    >
                      {systemConfig.siteLogo ? (
                        <img src={systemConfig.siteLogo} className="w-12 h-12 object-contain" alt="Site Logo" />
                      ) : (
                        <Shield className="w-10 h-10 text-white" />
                      )}
                    </motion.div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
                      {systemConfig.siteName || "Secure Access"}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">আপনার ডিজিটাল যাত্রা শুরু করুন</p>
                  </div>

                  <form onSubmit={handleLoginClick} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">আইডেন্টিফায়ার</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <UserIcon className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input 
                          type="text" 
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="w-full bg-slate-950/50 border border-slate-800 pl-12 pr-5 py-4 rounded-2xl text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all font-medium"
                          placeholder="Username or Email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">পাসওয়ার্ড</label>
                         <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors">পাসওয়ার্ড ভুলে গেছেন?</button>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950/50 border border-slate-800 pl-12 pr-14 py-4 rounded-2xl text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all font-medium"
                          placeholder="••••••••"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            id="captcha-user" 
                            checked={isCaptchaVerified}
                            onChange={(e) => setIsCaptchaVerified(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer appearance-none checked:bg-indigo-500 transition-all" 
                          />
                          {isCaptchaVerified && <ShieldCheck className="absolute w-3 h-3 text-white left-1 pointer-events-none" />}
                        </div>
                        <label htmlFor="captcha-user" className="text-xs font-bold text-slate-400 cursor-pointer select-none">আমি রোবট নই</label>
                      </div>
                      <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" className="w-6 h-6 opacity-30 grayscale invert" alt="reCAPTCHA" />
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 group"
                    >
                      লগইন করুন
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    <div className="flex flex-col gap-4 pt-6 border-t border-slate-800/50">
                      <button 
                        type="button"
                        onClick={() => switchView('ADMIN_LOGIN')}
                        className="flex items-center justify-center gap-2 py-4 bg-slate-950/50 text-indigo-400 rounded-2xl hover:bg-slate-900 transition-all text-[10px] font-black uppercase tracking-widest border border-slate-800"
                      >
                        <ShieldAlert className="w-4 h-4" /> Admin Access
                      </button>
                      
                      {systemConfig.isMaintenanceMode ? (
                        <div className="flex items-center justify-center gap-2 py-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">সিস্টেম মেইনটেন্যান্স চলছে</p>
                        </div>
                      ) : systemConfig.isRegistrationEnabled ? (
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-xs text-slate-500 font-medium">অ্যাকাউন্ট নেই?</p>
                          <button 
                            type="button"
                            onClick={() => switchView('SIGNUP')} 
                            className="text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            নতুন অ্যাকাউন্ট তৈরি করুন
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 py-3 bg-slate-950/50 rounded-2xl border border-slate-800">
                          <XCircle className="w-4 h-4 text-rose-500" />
                          <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">রেজিস্ট্রেশন বন্ধ আছে</p>
                        </div>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}

              {view === 'ADMIN_LOGIN' && (
                <motion.div 
                  key="admin-login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <button onClick={() => switchView('USER_LOGIN')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">ফিরে যান</span>
                  </button>

                  <div className="text-center mb-10">
                    <motion.div 
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="inline-flex items-center justify-center w-24 h-24 bg-slate-950 rounded-[2.5rem] mb-6 shadow-2xl ring-1 ring-white/10 relative overflow-hidden group"
                    >
                      <Fingerprint className="w-12 h-12 text-rose-500 relative z-10" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Administrator</h2>
                    <p className="text-slate-500 text-sm font-medium">Secure Forensic Access</p>
                  </div>

                  <form onSubmit={handleLoginClick} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Admin ID</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <Key className="w-5 h-5 text-slate-500 group-focus-within:text-rose-400 transition-colors" />
                        </div>
                        <input 
                          type="text" 
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 pl-14 pr-5 py-5 rounded-3xl text-white placeholder-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all font-black text-lg tracking-widest"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="captcha-admin" 
                          checked={isCaptchaVerified}
                          onChange={(e) => setIsCaptchaVerified(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500 cursor-pointer appearance-none checked:bg-rose-500 transition-all" 
                        />
                        <label htmlFor="captcha-admin" className="text-xs font-bold text-slate-500 cursor-pointer select-none">ভেরিফাই করুন</label>
                      </div>
                      <ShieldCheck className={`w-6 h-6 transition-all ${isCaptchaVerified ? 'text-rose-500 scale-110' : 'text-slate-800'}`} />
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-6 bg-rose-600 text-white font-black rounded-3xl shadow-2xl shadow-rose-900/40 hover:bg-rose-500 transition-all text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3"
                    >
                      <Lock className="w-5 h-5" /> Authorize
                    </motion.button>
                  </form>
                </motion.div>
              )}

              {view === 'FORGOT_PASSWORD' && (
                 <motion.div 
                   key="forgot-password"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.4 }}
                 >
                    <button onClick={() => switchView('USER_LOGIN')} className="flex items-center gap-2 text-slate-500 hover:text-amber-400 mb-8 transition-colors group">
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      <span className="text-xs font-black uppercase tracking-widest">ফিরে যান</span>
                    </button>

                    <div className="text-center mb-10">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 rounded-[2rem] mb-6 ring-1 ring-amber-500/20">
                        <HelpCircle className="w-10 h-10 text-amber-500" />
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-tighter mb-2">পাসওয়ার্ড রিসেট</h2>
                      <p className="text-slate-500 text-sm font-medium">আপনার তথ্য যাচাই করুন</p>
                    </div>

                    <form onSubmit={handleResetSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">ইউজারনেম / ইমেইল</label>
                        <input required value={forgotData.identifier} onChange={e => setForgotData({...forgotData, identifier: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-bold" placeholder="Username or Email" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">জন্ম তারিখ</label>
                          <input required type="date" value={forgotData.dob} onChange={e => setForgotData({...forgotData, dob: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">মোবাইল নম্বর</label>
                          <input required maxLength={11} value={forgotData.mobile} onChange={e => setForgotData({...forgotData, mobile: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono" placeholder="01XXXXXXXXX" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">নতুন পাসওয়ার্ড</label>
                        <input required type="password" value={forgotData.newPassword} onChange={e => setForgotData({...forgotData, newPassword: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" placeholder="••••••••" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">পাসওয়ার্ড নিশ্চিত করুন</label>
                        <input required type="password" value={forgotData.confirmPassword} onChange={e => setForgotData({...forgotData, confirmPassword: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" placeholder="••••••••" />
                      </div>

                      <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="captcha-forgot" checked={isCaptchaVerified} onChange={(e) => setIsCaptchaVerified(e.target.checked)} className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/50 cursor-pointer appearance-none checked:bg-amber-500 transition-all" />
                          <label htmlFor="captcha-forgot" className="text-xs font-bold text-slate-400 cursor-pointer select-none">ভেরিফাই করুন</label>
                        </div>
                        <ShieldCheck className={`w-6 h-6 transition-all ${isCaptchaVerified ? 'text-amber-500' : 'text-slate-800'}`} />
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full py-5 bg-amber-500 text-white font-black rounded-2xl shadow-xl shadow-amber-900/20 hover:bg-amber-400 transition-all text-xs uppercase tracking-[0.2em]"
                      >
                        পাসওয়ার্ড আপডেট করুন
                      </motion.button>
                    </form>
                 </motion.div>
              )}

              {view === 'SIGNUP' && (
                <motion.div 
                  key="signup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                      <button type="button" onClick={() => switchView('USER_LOGIN')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 mb-4 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">ফিরে যান</span>
                      </button>
                      <h2 className="text-4xl font-black text-white tracking-tighter">নতুন অ্যাকাউন্ট</h2>
                      <p className="text-slate-500 text-sm font-medium mt-1">সঠিক তথ্য দিয়ে ফরমটি পূরণ করুন</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 px-6 py-4 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <div className="text-left">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Security Level</p>
                        <p className="text-xs font-bold text-white">High Encryption</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSignUpClick} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">পুরো নাম</label>
                          <div className="grid grid-cols-2 gap-3">
                            <input required value={signupData.firstName} onChange={e => setSignupData({...signupData, firstName: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" placeholder="First Name" />
                            <input required value={signupData.lastName} onChange={e => setSignupData({...signupData, lastName: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" placeholder="Last Name" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">মোবাইল নম্বর</label>
                          <div className="relative group">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-emerald-400 transition-colors" />
                            <input required type="tel" maxLength={11} value={signupData.mobile} onChange={e => setSignupData({...signupData, mobile: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 pl-12 pr-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono" placeholder="01XXXXXXXXX" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">ইমেইল ঠিকানা</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-emerald-400 transition-colors" />
                            <input required type="email" value={signupData.email} onChange={e => setSignupData({...signupData, email: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 pl-12 pr-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" placeholder="example@mail.com" />
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">অ্যাকাউন্ট ডিটেইলস</label>
                          <div className="grid grid-cols-2 gap-3">
                            <input required value={signupData.username} onChange={e => setSignupData({...signupData, username: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold" placeholder="Username" />
                            <input required type="password" minLength={8} value={signupData.password} onChange={e => setSignupData({...signupData, password: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 px-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" placeholder="Password" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">জন্ম তারিখ</label>
                          <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-emerald-400 transition-colors" />
                            <input required type="date" value={signupData.dob} onChange={e => setSignupData({...signupData, dob: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 pl-12 pr-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">এনআইডি নম্বর (ঐচ্ছিক)</label>
                          <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-emerald-400 transition-colors" />
                            <input value={signupData.nid} onChange={e => setSignupData({...signupData, nid: e.target.value})} className="w-full bg-slate-950/50 border border-slate-800 pl-12 pr-5 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono" placeholder="NID Number" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1 w-full p-5 bg-slate-950/50 rounded-[2rem] border border-slate-800 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              id="captcha-signup" 
                              checked={isCaptchaVerified} 
                              onChange={(e) => setIsCaptchaVerified(e.target.checked)} 
                              className="w-6 h-6 rounded-lg border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer appearance-none checked:bg-emerald-500 transition-all" 
                            />
                            {isCaptchaVerified && <ShieldCheck className="absolute w-4 h-4 text-white left-1 pointer-events-none" />}
                          </div>
                          <label htmlFor="captcha-signup" className="text-sm font-bold text-slate-400 cursor-pointer select-none">আমি রোবট নই</label>
                        </div>
                        <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" className="w-8 h-8 opacity-30 grayscale invert" alt="reCAPTCHA" />
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full md:w-auto px-12 py-5 bg-emerald-600 text-white font-black rounded-[2rem] shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 group"
                      >
                        রেজিস্ট্রেশন নিশ্চিত করুন
                        <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-950/80 border-t border-slate-800/50 text-center">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">
              Secure Identity Authorization Matrix v7.0
            </p>
          </div>
        </div>
        
        {/* Bottom Support Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-slate-500 font-medium">
            সাহায্য প্রয়োজন? <a href={`mailto:${systemConfig.supportEmail}`} className="text-indigo-400 hover:underline font-bold">সাপোর্ট টিমের সাথে যোগাযোগ করুন</a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
