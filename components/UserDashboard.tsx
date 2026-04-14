
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Category, Order, OrderStatus, Transaction, NewsItem, RechargeRequest, OrderFile, SystemConfig, ActivityLog } from '../types';
import { 
  Wallet, LogOut, History, Package, ChevronRight, CreditCard, 
  Download, Clock, Bell, ArrowUpRight, ArrowDownLeft, AlertCircle, 
  ShieldAlert, ShieldCheck, ImageIcon, Send, X, Timer, Copy, 
  CheckCircle2, Smartphone, ListPlus, DollarSign, ShoppingBag, 
  Eye, MessageSquare, Save, FileText, Hash, Filter, Calendar, 
  RotateCcw, User as UserIcon, HelpCircle, MessageCircle, Mail, 
  Zap, LayoutDashboard, Settings, MoreHorizontal, Activity, Camera, Trash2, Edit, List, FileWarning, Menu,
  Globe, Lock
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useTranslation } from '../translations';

interface UserDashboardProps {
  user: User;
  categories: Category[];
  orders: Order[];
  transactions: Transaction[];
  news: NewsItem[];
  rechargeRequests: RechargeRequest[];
  systemConfig: SystemConfig;
  activityLogs: ActivityLog[];
  onLogout: () => void;
  onPlaceOrder: (id: string, userData: Record<string, string>) => void;
  onUpdateUserComment: (id: string, comment: string) => void;
  onRequestRecharge: (amount: number, method: string, trxId: string) => void;
  isImpersonating?: boolean;
  onUpdateUserInfo: (userId: string, updates: Partial<User>) => void;
  onLogActivity: (action: string, details?: string) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  user, categories, orders, transactions, news, rechargeRequests, systemConfig, activityLogs,
  onLogout, onPlaceOrder, onUpdateUserComment, onRequestRecharge, isImpersonating, onUpdateUserInfo, onLogActivity
}) => {
  const { t } = useTranslation(user.language || 'bn');
  const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'recharge' | 'news' | 'profile' | 'transactions'>(user.isBlocked ? 'profile' : 'news');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState<Category | null>(null);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  
  const [rechargeAmt, setRechargeAmt] = useState('');
  const [rechargeMethod, setRechargeMethod] = useState('');
  const [rechargeTrxId, setRechargeTrxId] = useState('');
  const [showRechargeConfirm, setShowRechargeConfirm] = useState<{ amount: number, method: string, trxId: string } | null>(null);

  const [viewingFiles, setViewingFiles] = useState<Order | null>(null);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    mobile: user.mobile || '',
    dob: user.dob || '',
    nid: user.nid || '',
    username: user.username || '',
    password: user.password || '',
    language: user.language || 'bn'
  });

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (!isImpersonating) {
      onLogActivity(`Visited Tab: ${activeTab.toUpperCase()}`);
    }
  }, [activeTab]);

  useEffect(() => {
    if (user.isBlocked && activeTab !== 'profile') {
      setActiveTab('profile');
    }
  }, [user.isBlocked, activeTab]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("ছবির সাইজ ২ মেগাবাইটের কম হতে হবে।");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpdateUserInfo(user.id, { avatar: base64String });
      onLogActivity('Profile Avatar Updated');
      toast.success("প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!");
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    onUpdateUserInfo(user.id, { avatar: undefined });
    onLogActivity('Profile Avatar Removed');
    toast.success("প্রোফাইল ছবি মুছে ফেলা হয়েছে।");
  };

  const handleManualRecharge = () => {
    if (!rechargeAmt || !rechargeMethod || !rechargeTrxId) {
      toast.error("সবগুলো তথ্য প্রদান করুন।");
      return;
    }
    const amount = Number(rechargeAmt);
    if (isNaN(amount) || amount < systemConfig.minRecharge || amount > systemConfig.maxRecharge) {
      toast.error(`সঠিক পরিমাণ প্রদান করুন (৳${systemConfig.minRecharge} - ৳${systemConfig.maxRecharge})`);
      return;
    }
    setShowRechargeConfirm({ amount, method: rechargeMethod, trxId: rechargeTrxId });
  };

  const finalizeRecharge = () => {
    if (!showRechargeConfirm) return;
    onRequestRecharge(showRechargeConfirm.amount, showRechargeConfirm.method, showRechargeConfirm.trxId);
    setRechargeAmt('');
    setRechargeMethod('');
    setRechargeTrxId('');
    setShowRechargeConfirm(null);
  };

  const confirmOrder = () => {
    if (!showOrderModal) return;
    for (const field of showOrderModal.requiredFields) {
      if (field.required && !userInputs[field.id]) {
        toast.error(`${field.label} প্রদান করা আবশ্যক।`);
        return;
      }
    }
    onPlaceOrder(showOrderModal.id, userInputs);
    setShowOrderModal(null);
    setUserInputs({});
  };

  // Helper to check if 7 days passed since approval
  const isFileExpired = (approvalTime?: number) => {
    if (!approvalTime) return false;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - approvalTime) > sevenDays;
  };

  const activeCategories = categories.filter(c => c.isActive);

  const getStatusStyles = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.APPROVED: return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-600/10';
      case OrderStatus.CANCELLED: return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-600/10';
      case OrderStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-600/10';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10';
    }
  };

  const filteredOrders = useMemo(() => {
    return [...orders].reverse().filter(order => statusFilter === 'ALL' || order.status === statusFilter);
  }, [orders, statusFilter]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].reverse();
  }, [transactions]);

  const sortedRecharges = useMemo(() => {
    return [...rechargeRequests].reverse();
  }, [rechargeRequests]);

  return (
    <div className="flex h-screen bg-[#FAFAFB] font-inter text-slate-900 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster position="top-right" gutter={8} />
      
      {/* Sidebar Rail */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <>
            {/* Backdrop for mobile */}
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] md:hidden"
              />
            )}
            <motion.aside 
              initial={window.innerWidth < 768 ? { x: -300 } : false}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed md:relative w-64 bg-white border-r border-slate-200 h-full flex flex-col flex-shrink-0 z-[110] md:z-0 ${isSidebarOpen ? 'flex' : 'hidden md:flex'}`}
            >
              <div className="h-16 flex items-center px-6 gap-3 shrink-0 border-b border-slate-50">
                <motion.div 
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-900/10"
                >
                  <Zap className="w-5 h-5 text-white" />
                </motion.div>
                <span className="font-bold text-lg tracking-tight truncate">{systemConfig.siteName}</span>
                <button onClick={() => setIsSidebarOpen(false)} className="ml-auto p-2 md:hidden text-slate-400 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar">
                <div className="px-4 mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dashboards</span>
                </div>
                {[
                  { id: 'news', label: t('newsfeed'), icon: Bell },
                  { id: 'orders', label: t('services'), icon: LayoutDashboard },
                  { id: 'history', label: t('task_history'), icon: History },
                  { id: 'recharge', label: t('wallet_recharge'), icon: Wallet },
                  { id: 'transactions', label: t('transaction_info'), icon: List },
                  { id: 'profile', label: t('profile_settings'), icon: UserIcon },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 relative group ${
                      activeTab === item.id 
                        ? 'text-white' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-slate-900 rounded-xl shadow-xl shadow-slate-900/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={`w-4 h-4 relative z-10 ${activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="p-4 mt-auto border-t border-slate-100">
                <button 
                  onClick={onLogout} 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('sign_out')}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <h2 className="text-sm font-black text-slate-800 tracking-widest uppercase group-hover:text-indigo-600 transition-colors">
                {activeTab === 'transactions' ? t('transaction_history') : t(activeTab as any)}
              </h2>
            </div>
            {isImpersonating && (
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-tighter hidden sm:inline-block">Admin Access</span>
            )}
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 pl-3 pr-4 py-1.5 rounded-full shadow-inner cursor-default group">
              <Wallet className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-slate-700">৳{user.walletBalance.toLocaleString()}</span>
            </div>
            <div 
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 text-sm font-black shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all"
            >
              {user.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="Profile Thumb" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar space-y-10 max-w-7xl mx-auto w-full pb-24">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {user.isBlocked && activeTab !== 'profile' && (
                <div className="flex items-center gap-4 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 shadow-sm mb-10">
                  <ShieldAlert className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="text-sm font-black leading-tight uppercase tracking-tight">Account Restricted</p>
                    <p className="text-xs opacity-80 mt-0.5 font-medium">অ্যাডমিন কর্তৃক আপনার সার্ভিসগুলো বর্তমানে বন্ধ করা আছে।</p>
                  </div>
                </div>
              )}

              {activeTab === 'news' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2 mb-2">Latest Notifications</h3>
                  {news.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Bell className="w-24 h-24 text-slate-900" />
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</span>
                        <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 mb-3 leading-tight tracking-tight">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.content}</p>
                    </motion.div>
                  ))}
                  {news.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
                      <Bell className="w-16 h-16 mx-auto mb-6 opacity-10" />
                      <p className="text-sm font-black uppercase tracking-widest">No Alerts at the Moment</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && !user.isBlocked && (
                <div className="space-y-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2 mb-2">Explore Services</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {activeCategories.map((cat, idx) => (
                      <motion.div 
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
                      >
                        <div className="p-8 flex-1 space-y-6">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500 border border-slate-100 shadow-inner">
                            {cat.icon && cat.icon.includes('data:image') ? (
                              <img src={cat.icon} className="w-full h-full object-contain p-3" />
                            ) : (
                              <Package className="w-8 h-8" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">{cat.name}</h4>
                            <p className="text-slate-500 text-xs mt-2 font-medium leading-relaxed line-clamp-3">{cat.description}</p>
                          </div>
                        </div>
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cost</span>
                            <span className="text-xl font-black text-slate-900 tracking-tighter">৳{cat.price}</span>
                          </div>
                          <button 
                            onClick={() => setShowOrderModal(cat)}
                            className="inline-flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-[0.1em] h-11 px-6 bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                          >
                            Order Now
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

          {activeTab === 'history' && (
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Tasks History</h3>
                <div className="flex items-center gap-4">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                  >
                    <option value="ALL">All Status</option>
                    <option value={OrderStatus.PENDING}>Pending</option>
                    <option value={OrderStatus.APPROVED}>Success</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest">Reference</th>
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest">Service</th>
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-center">Amount</th>
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOrders.map(order => {
                      const expired = isFileExpired(order.approvalTimestamp);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <span className="font-mono text-xs font-black text-slate-400">#{order.id.split('-')[1]}</span>
                          </td>
                          <td className="px-8 py-5">
                            <p className="font-black text-slate-800 text-sm tracking-tight">{categories.find(c => c.id === order.categoryId)?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-sm font-black text-slate-900">৳{order.amount}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase border tracking-widest ring-1 ${getStatusStyles(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            {order.status === OrderStatus.APPROVED && (
                              <div className="flex flex-col items-end gap-1">
                                <button 
                                  onClick={() => !expired && setViewingFiles(order)}
                                  disabled={expired}
                                  className={`inline-flex items-center justify-center rounded-xl h-10 w-10 transition-all shadow-sm border ${
                                    expired 
                                    ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-white border-slate-200 hover:border-slate-900'
                                  }`}
                                  title={expired ? "ডাউনলোড সময় শেষ (৭ দিন পার হয়েছে)" : "ফাইল দেখুন"}
                                >
                                  {expired ? <FileWarning className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                {expired && <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Expired</span>}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-24 text-center">
                           <History className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                           <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No records found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Wallet Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest">Date & Time</th>
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest">Description</th>
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-center">Type</th>
                      <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sortedTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-slate-800 text-xs font-black tracking-tight">{new Date(tx.timestamp).toLocaleDateString()}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-700 text-sm">{tx.description}</p>
                          <p className="text-[9px] font-mono text-slate-400 uppercase">Ref: {tx.id}</p>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border ${
                            tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={`text-sm font-black ${
                            tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                          }`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {sortedTransactions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-24 text-center">
                           <Activity className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                           <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No transactions recorded</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'recharge' && (
            <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3 space-y-8">
                  <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-10">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                      <CreditCard className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Payment Channels</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {systemConfig.paymentMethods.filter(pm => pm.isActive).map(pm => (
                        <div key={pm.id} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col justify-between group relative overflow-hidden shadow-inner hover:border-indigo-500/30 transition-all">
                          <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pm.name}</span>
                              <span className="text-[9px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-tighter">{pm.instruction}</span>
                            </div>
                            <div>
                              <p className="text-2xl font-black text-slate-900 tracking-tighter font-mono">{pm.number}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(pm.number); toast.success("নাম্বার কপি হয়েছে!"); }}
                            className="absolute bottom-6 right-6 p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-indigo-600 shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-90"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                      <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-800 font-bold leading-relaxed italic">Note: পেমেন্ট করার পর ট্রানজেকশন আইডি (TrxID) অবশ্যই সঠিকভাবে ইনপুট দিবেন।</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl h-fit sticky top-10">
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-inner"><DollarSign className="w-8 h-8" /></div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Deposit Wallet</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Deposit Amount (৳)</label>
                      <input 
                        type="number" 
                        value={rechargeAmt}
                        onChange={(e) => setRechargeAmt(e.target.value)}
                        className="w-full flex h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-xl font-black focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-center"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Method</label>
                      <select 
                        value={rechargeMethod}
                        onChange={(e) => setRechargeMethod(e.target.value)}
                        className="w-full flex h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-black focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                      >
                        <option value="">Select Method</option>
                        {systemConfig.paymentMethods.filter(pm => pm.isActive).map(pm => <option key={pm.id} value={pm.name}>{pm.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Transaction ID</label>
                      <input 
                        type="text" 
                        value={rechargeTrxId}
                        onChange={(e) => setRechargeTrxId(e.target.value)}
                        className="w-full flex h-14 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-mono font-black focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all uppercase"
                        placeholder="TXN000XXX"
                      />
                    </div>
                    <button 
                      onClick={handleManualRecharge}
                      className="w-full inline-flex items-center justify-center rounded-2xl h-16 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/30 hover:bg-slate-800 transition-all active:scale-95 mt-4"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>

              {/* Recharge History List */}
              <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                    <History className="w-4 h-4 text-indigo-600" /> ওয়ালেট রিচার্জ এর ইতিহাস
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-400 border-b border-slate-100">
                        <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest">Transaction ID</th>
                        <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-center">Amount</th>
                        <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-center">Method</th>
                        <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-center">Status</th>
                        <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sortedRecharges.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <span className="font-mono text-xs font-black text-slate-900 uppercase tracking-tight">{req.transactionId}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex flex-col items-center">
                               <span className="text-sm font-black text-slate-900">৳{req.amount}</span>
                               {req.originalAmount && req.originalAmount !== req.amount && (
                                 <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded-md ring-1 ring-amber-200">
                                   <RotateCcw className="w-2 h-2" /> সংশোধিত
                                 </span>
                               )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{req.method}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase border tracking-widest ring-1 ${
                              req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-600/10' :
                              req.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-600/10' :
                              'bg-rose-50 text-rose-700 border-rose-100 ring-rose-600/10'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="text-[10px] text-slate-400 font-bold">{new Date(req.createdAt).toLocaleDateString()}</span>
                          </td>
                        </tr>
                      ))}
                      {sortedRecharges.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-24 text-center">
                             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4 border border-slate-100">
                               <CreditCard className="w-6 h-6" />
                             </div>
                             <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">No recharge history yet</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
              <div className="bg-white border border-slate-200 rounded-[3rem] p-10 flex flex-col sm:flex-row items-center gap-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700"><UserIcon className="w-40 h-40" /></div>
                
                <div className="relative group/avatar">
                  <div className="w-40 h-40 rounded-[3rem] bg-slate-100 flex items-center justify-center text-slate-900 text-6xl font-black shadow-2xl shadow-slate-900/10 ring-8 ring-slate-50 relative z-10 overflow-hidden group-hover/avatar:ring-indigo-500/20 transition-all duration-500">
                    {user.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      user.name.charAt(0)
                    )}
                    
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 z-20">
                      <label className="cursor-pointer p-3 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-md mb-2">
                        <Camera className="w-6 h-6 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      </label>
                      <p className="text-[8px] text-white font-black uppercase tracking-widest">Update Photo</p>
                    </div>
                  </div>
                  
                  {user.avatar && (
                    <button 
                      onClick={removeAvatar}
                      title="Remove Photo"
                      className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 text-white rounded-2xl shadow-xl z-30 flex items-center justify-center hover:bg-rose-600 transition-all hover:scale-110 active:scale-95 opacity-0 group-hover/avatar:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="text-center sm:text-left flex-1 relative z-10">
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">{user.name}</h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 uppercase tracking-[0.2em] shadow-inner">Public UID: {user.id}</span>
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 uppercase tracking-[0.2em] shadow-sm">Balance: ৳{user.walletBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                  <h4 className="font-black text-slate-800 flex items-center gap-3 border-b border-slate-50 pb-6 text-xs uppercase tracking-[0.2em]">
                    <Settings className="w-5 h-5 text-slate-400" /> Account Identity
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Display Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="text" 
                          value={profileData.name}
                          onChange={e => setProfileData({...profileData, name: e.target.value})}
                          className="w-full h-14 rounded-2xl border border-slate-200 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner"
                          placeholder="Your Name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('user_identity')}</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="text" 
                          value={profileData.username}
                          onChange={e => setProfileData({...profileData, username: e.target.value})}
                          className="w-full h-14 rounded-2xl border border-slate-200 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner"
                          placeholder="Username"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('mobile')}</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="text" 
                          value={profileData.mobile}
                          onChange={e => setProfileData({...profileData, mobile: e.target.value})}
                          className="w-full h-14 rounded-2xl border border-slate-200 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner"
                          placeholder="01XXXXXXXXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('nid')}</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="text" 
                          value={profileData.nid}
                          onChange={e => setProfileData({...profileData, nid: e.target.value})}
                          className="w-full h-14 rounded-2xl border border-slate-200 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner"
                          placeholder="NID Number"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('dob')}</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="date" 
                          value={profileData.dob}
                          onChange={e => setProfileData({...profileData, dob: e.target.value})}
                          className="w-full h-14 rounded-2xl border border-slate-200 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('email_address')}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="email" 
                          value={profileData.email} 
                          onChange={e => setProfileData({...profileData, email: e.target.value})}
                          className="w-full h-14 rounded-2xl border border-slate-200 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('password')}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                          type="password" 
                          value={profileData.password} 
                          onChange={e => setProfileData({...profileData, password: e.target.value})}
                          className="w-full h-14 rounded-2xl border border-slate-200 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('default_language')}</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <select 
                          value={profileData.language}
                          onChange={e => setProfileData({...profileData, language: e.target.value as 'bn' | 'en'})}
                          className="w-full h-14 rounded-2xl border border-slate-200 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner appearance-none bg-white"
                        >
                          <option value="bn">Bengali (বাংলা)</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={() => { onUpdateUserInfo(user.id, profileData); onLogActivity('Profile Details Updated'); }}
                      className="w-full inline-flex items-center justify-center rounded-2xl h-14 bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4 mr-2" /> {t('save_profile')}
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                  <h4 className="font-black text-slate-800 flex items-center gap-3 border-b border-slate-50 pb-6 text-xs uppercase tracking-[0.2em]">
                    <Activity className="w-5 h-5 text-slate-400" /> Interaction Log
                  </h4>
                  <div className="space-y-4 max-h-[380px] overflow-y-auto no-scrollbar">
                    {activityLogs.filter(log => log.userId === user.id).slice(0, 10).map(log => (
                      <div key={log.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group hover:bg-slate-100 transition-colors shadow-inner border border-slate-100">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-slate-700 truncate uppercase tracking-tight">{log.action}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-all translate-x-0 group-hover:translate-x-1" />
                      </div>
                    ))}
                    {activityLogs.filter(log => log.userId === user.id).length === 0 && (
                       <div className="py-24 text-center">
                          <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="opacity-40 italic text-[10px] uppercase tracking-widest font-black">No recent activities</p>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Support - SaaS Style */}
      <div className="fixed bottom-8 right-8 z-[2000] flex flex-col items-end gap-4">
        {showSupportMenu && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-300">
            <a 
              href={`https://wa.me/${systemConfig.whatsappNumber}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-200 text-slate-900 font-black text-xs hover:bg-slate-50 transition-all hover:-translate-x-2"
            >
              <MessageCircle className="w-5 h-5 text-emerald-500" /> 
              <span className="uppercase tracking-widest">Connect WhatsApp</span>
            </a>
            <a 
              href={`mailto:${systemConfig.supportEmail}`} 
              className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-200 text-slate-900 font-black text-xs hover:bg-slate-50 transition-all hover:-translate-x-2"
            >
              <Mail className="w-5 h-5 text-indigo-500" /> 
              <span className="uppercase tracking-widest">Direct Email</span>
            </a>
          </div>
        )}
        <button 
          onClick={() => setShowSupportMenu(!showSupportMenu)} 
          className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:bg-slate-800 transition-all transform active:scale-90 hover:rotate-6 border-4 border-white"
        >
          {showSupportMenu ? <X className="w-6 h-6" /> : <HelpCircle className="w-8 h-8" />}
        </button>
      </div>

      {/* Recharge Confirmation Modal */}
      {showRechargeConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 z-[5000] animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="p-10 text-center space-y-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto shadow-inner ring-4 ring-indigo-50/50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Confirm Deposit</h3>
                <p className="text-xs text-slate-500 font-medium mt-2">অনুগ্রহ করে আপনার তথ্যগুলো যাচাই করে নিন</p>
              </div>

              <div className="space-y-4 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                  <span className="text-xl font-black text-indigo-600">৳{showRechargeConfirm.amount}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</span>
                  <span className="text-sm font-black text-slate-800">{showRechargeConfirm.method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TrxID</span>
                  <span className="text-sm font-mono font-black text-slate-800 uppercase">{showRechargeConfirm.trxId}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={finalizeRecharge}
                  className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-900/30 hover:bg-slate-800 transition-all active:scale-95"
                >
                  Confirm & Submit
                </button>
                <button 
                  onClick={() => setShowRechargeConfirm(null)}
                  className="w-full h-14 bg-white text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[3000] animate-in fade-in duration-300">
          <div className="bg-white w-full max-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 ring-1 ring-white/10">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{showOrderModal.name}</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order Processing Portal</p>
              </div>
              <button onClick={() => setShowOrderModal(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                {showOrderModal.requiredFields.map(field => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input 
                      type="text" 
                      placeholder={field.placeholder}
                      value={userInputs[field.id] || ''}
                      onChange={(e) => setUserInputs(prev => ({ ...prev, [field.id]: e.target.value }))}
                      className="w-full flex h-14 rounded-2xl border border-slate-200 bg-slate-50 px-6 text-sm font-black focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-inner"
                    />
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-900 rounded-[1.5rem] flex items-center justify-between text-white shadow-xl shadow-slate-900/20 ring-4 ring-slate-50">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Settlement Amount</span>
                   <span className="text-2xl font-black tracking-tighter">৳{showOrderModal.price}</span>
                </div>
                <ShoppingBag className="w-8 h-8 opacity-20" />
              </div>

              <button 
                onClick={confirmOrder}
                className="w-full inline-flex items-center justify-center rounded-2xl h-16 bg-teal-600 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all active:scale-[0.98] mt-2"
              >
                Submit & Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Files Viewer Modal */}
      {viewingFiles && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[4000] animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 tracking-tight leading-none">
                   <ImageIcon className="w-8 h-8 text-indigo-600" /> Secure Delivery
                 </h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identifier: {viewingFiles.id}</p>
              </div>
              <button onClick={() => setViewingFiles(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-sm text-slate-700 italic leading-relaxed shadow-inner">
                "{viewingFiles.comment || "ডেলিভারি সফল হয়েছে।"}"
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {viewingFiles.files?.map((file, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      {file.type.startsWith('image/') ? (
                        <img src={file.data} className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="w-12 h-12 text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{file.type.split('/')[1]} Document</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center px-2">
                      <div className="min-w-0 flex-1">
                         <span className="text-[10px] font-black text-slate-400 truncate uppercase tracking-widest block mb-1">Asset Name</span>
                         <span className="text-xs font-black text-slate-800 truncate block">{file.name}</span>
                      </div>
                      <a 
                        href={file.data} 
                        download={file.name}
                        className="inline-flex items-center justify-center rounded-xl h-11 px-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 shrink-0"
                      >
                        <Download className="w-4 h-4 mr-2" /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
