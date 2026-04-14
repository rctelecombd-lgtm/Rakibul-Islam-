
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole, Category, Order, OrderStatus, ActivityLog, Transaction, NewsItem, RechargeRequest, CustomFieldRequirement, OrderFile, SystemConfig, PaymentMethodConfig } from '../types';
import { LayoutDashboard, Users, ShoppingBag, CreditCard, Settings, Activity, Search, ShieldAlert, Check, X, Edit2, Plus, LogOut, Package, Bell, ArrowUpRight, ArrowDownLeft, Trash2, FileUp, AlertCircle, FileText, Image as ImageIcon, ExternalLink, ShieldCheck, History, Send, Smartphone, Globe, Signal, MapPin, Eye, Key, TrendingUp, DollarSign, ListPlus, Upload, RefreshCw, Download, Timer, Radar, Cpu, Network, Terminal, Ghost, Save, ToggleLeft, ToggleRight, PlusCircle, Ban, MessageSquare, CheckCircle2, Clock, Power, BarChart3, PieChart as PieIcon, UserPlus, UserCog, ToggleRight as ToggleIcon, Fingerprint, Lock, ShieldX, Database, HardDrive, ShieldEllipsis, FileArchive, Laptop, Camera, Shield, Megaphone, Newspaper, Filter, Calendar, RotateCcw, Menu } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { toast } from 'react-hot-toast';
import { useTranslation } from '../translations';

interface AdminDashboardProps {
  user: User;
  users: User[];
  orders: Order[];
  recharges: RechargeRequest[];
  categories: Category[];
  logs: ActivityLog[];
  transactions: Transaction[];
  news: NewsItem[];
  systemConfig: SystemConfig;
  onUpdateSystemConfig: (config: SystemConfig) => void;
  botConfig: { token: string, chatId: string };
  onLogout: () => void;
  onUpdateOrder: (id: string, status: OrderStatus, comment: string, files?: OrderFile[]) => void;
  onApproveRecharge: (id: string) => void;
  onCorrectRecharge: (id: string, amount: number) => void;
  onRejectRecharge: (id: string) => void;
  onBlockUser: (id: string) => void;
  onManageCategory: (cat: Category) => void;
  onManageNews: (item: NewsItem) => void;
  onDeleteNews: (id: string) => void;
  onUpdateBotConfig: (config: { token: string, chatId: string }) => void;
  onTakeAccess: (userId: string) => void;
  onCreateUser: (newUser: User) => void;
  onUpdateUserInfo: (userId: string, updates: Partial<User>) => void;
}

const AdminDashboard: React.FC<AdminDashboardPropsAdminDashboardProps> = ({ 
  user, users, orders, recharges, categories, logs, transactions, news, systemConfig, onUpdateSystemConfig, botConfig,
  onLogout, onUpdateOrder, onApproveRecharge, onCorrectRecharge, onRejectRecharge, onBlockUser, 
  onManageCategory, onManageNews, onDeleteNews, onUpdateBotConfig, onTakeAccess,
  onCreateUser, onUpdateUserInfo
}) => {
  const { t } = useTranslation(user.language || 'bn');
  const [activeTab, setActiveTab] = useState<'dash' | 'users' | 'orders' | 'recharges' | 'tab-control' | 'payment-setup' | 'service-control' | 'users-control' | 'secret-forensic' | 'system-security' | 'news-management' | 'activity-logs'>('dash');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orderAction, setOrderAction] = useState<{ id: string, type: 'APPROVE' | 'CANCEL' | 'EDIT_FILES' } | null>(null);
  const [pendingFiles, setPendingFiles] = useState<OrderFile[]>([]);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null);
  const [userModalTab, setUserModalTab] = useState<'info' | 'orders' | 'transactions'>('info');
  const [correctingRecharge, setCorrectingRecharge] = useState<{ id: string, amount: number } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [editingNews, setEditingNews] = useState<Partial<NewsItem> | null>(null);
  const [userOrdersFilter, setUserOrdersFilter] = useState<string | null>(null);

  // Activity Log Filters
  const [logUserFilter, setLogUserFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [viewingFiles, setViewingFiles] = useState<Order | null>(null);
  const [adminProfileData, setAdminProfileData] = useState({
    name: user.name,
    email: user.email,
    password: user.password || '',
    avatar: user.avatar || '',
    nid: user.nid || '',
    dob: user.dob || '',
    language: user.language || 'bn'
  });

  const pendingRecharges = useMemo(() => recharges.filter(r => r.status === 'PENDING'), [recharges]);

  // Security Audit Logic: Filter suspicious logs for hack protection view
  const suspiciousLogs = useMemo(() => {
    return logs.filter(log => 
      log.action.toLowerCase().includes('failed') || 
      log.action.toLowerCase().includes('block') || 
      log.action.toLowerCase().includes('fraud') ||
      log.action.toLowerCase().includes('security')
    ).slice(0, 20);
  }, [logs]);

  // Comprehensive filtering for the new Activity Logs tab
  const filteredActivityLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesUser = !logUserFilter || log.userId === logUserFilter;
      const logDate = new Date(log.timestamp).setHours(0, 0, 0, 0);
      const matchesStart = !startDateFilter || logDate >= new Date(startDateFilter).setHours(0, 0, 0, 0);
      const matchesEnd = !endDateFilter || logDate <= new Date(endDateFilter).setHours(0, 0, 0, 0);
      return matchesUser && matchesStart && matchesEnd;
    }).reverse();
  }, [logs, logUserFilter, startDateFilter, endDateFilter]);

  const statsMetrics = useMemo(() => {
    const approvedOrders = orders.filter(o => o.status === OrderStatus.APPROVED);
    const totalOrderRevenue = approvedOrders.reduce((sum, o) => sum + o.amount, 0);
    
    const approvedRecharges = recharges.filter(r => r.status === 'APPROVED');
    const totalRechargeAmt = approvedRecharges.reduce((sum, r) => sum + r.amount, 0);

    const counts = {
      total: orders.length,
      pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
      received: orders.filter(o => o.status === OrderStatus.RECEIVED).length,
      approved: orders.filter(o => o.status === OrderStatus.APPROVED).length,
      cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
    };

    // Generate Chart Data (12 Hour Trend)
    const hourData = Array.from({ length: 12 }, (_, i) => {
      const timestamp = Date.now() - (11 - i) * 60 * 60 * 1000;
      const hourStart = new Date(timestamp).setMinutes(0, 0, 0);
      const hourEnd = new Date(timestamp).setMinutes(59, 59, 999);
      
      const hourTxs = transactions.filter(t => t.timestamp >= hourStart && t.timestamp <= hourEnd);
      const hourOrders = orders.filter(o => o.createdAt >= hourStart && o.createdAt <= hourEnd);

      return {
        time: new Date(timestamp).getHours() + ':00',
        recharge: hourTxs.filter(t => t.type === 'CREDIT' && t.description.includes('রিচার্জ')).reduce((s, t) => s + t.amount, 0),
        orderVolume: hourOrders.reduce((s, o) => s + o.amount, 0),
        count: hourOrders.length
      };
    });

    const pieData = [
      { name: 'পেন্ডিং', value: counts.pending, color: '#f59e0b' },
      { name: 'গৃহীত', value: counts.received, color: '#6366f1' },
      { name: 'সফল', value: counts.approved, color: '#10b981' },
      { name: 'বাতিল', value: counts.cancelled, color: '#f43f5e' },
    ].filter(d => d.value > 0);

    return { totalOrderRevenue, totalRechargeAmt, counts, hourData, pieData };
  }, [orders, recharges, transactions]);

  // Handle Backup Exports
  const handleExportBackup = (type: 'DATABASE' | 'FILES') => {
    const backupData = {
      timestamp: Date.now(),
      version: '3.5',
      type,
      payload: type === 'DATABASE' ? {
        users,
        orders,
        categories,
        transactions,
        recharges,
        systemConfig,
        logs
      } : {
        orderFiles: orders.filter(o => o.files && o.files.length > 0).map(o => ({ orderId: o.id, files: o.files }))
      }
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omniwallet_${type.toLowerCase()}_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success(`${type === 'DATABASE' ? 'ডেটাবেস' : 'ফাইল'} ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে`);
  };

  const handleOrderFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: OrderFile[] = [];
    let processed = 0;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newFiles.push({ name: file.name, type: file.type, data: reader.result as string, uploadedAt: Date.now() });
        processed++;
        if (processed === files.length) setPendingFiles(prev => [...prev, ...newFiles]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleOrderSubmit = () => {
    if (!orderAction) return;
    if (orderAction.type === 'APPROVE' || orderAction.type === 'EDIT_FILES') {
      if (pendingFiles.length === 0) {
        toast.error("সফল করার জন্য কমপক্ষে একটি ফাইল আপলোড করা বাধ্যতামূলক।");
        return;
      }
      onUpdateOrder(orderAction.id, OrderStatus.APPROVED, 'আবেদন সফল ও ফাইল ডেলিভার করা হয়েছে', pendingFiles);
      toast.success(orderAction.type === 'EDIT_FILES' ? "ফাইল আপডেট করা হয়েছে" : "অর্ডার সফলভাবে এপ্রুভ হয়েছে");
    } else if (orderAction.type === 'CANCEL') {
      const reason = (document.getElementById('order-cancel-reason') as HTMLTextAreaElement).value;
      if (!reason.trim()) {
        toast.error("বাতিল করার কারণ লেখা বাধ্যতামূলক!");
        return;
      }
      onUpdateOrder(orderAction.id, OrderStatus.CANCELLED, reason);
    }
    setOrderAction(null);
    setPendingFiles([]);
  };

  const isWithinEditWindow = (approvalTimestamp?: number) => {
    if (!approvalTimestamp) return false;
    const thirtyMinutes = 30 * 60 * 1000;
    return Date.now() - approvalTimestamp < thirtyMinutes;
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'icon' | 'sampleUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingCategory(prev => prev ? { ...prev, [field]: reader.result as string } : null);
    };
    reader.readAsDataURL(file);
  };

  const handleRequirementAdd = () => {
    const newReq: CustomFieldRequirement = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      placeholder: '',
      required: true
    };
    setEditingCategory(prev => ({
      ...prev,
      requiredFields: [...(prev?.requiredFields || []), newReq]
    }));
  };

  const updateRequirement = (id: string, updates: Partial<CustomFieldRequirement>) => {
    setEditingCategory(prev => ({
      ...prev,
      requiredFields: prev?.requiredFields?.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  };

  const removeRequirement = (id: string) => {
    setEditingCategory(prev => ({
      ...prev,
      requiredFields: prev?.requiredFields?.filter(r => r.id !== id)
    }));
  };

  const saveCategory = () => {
    if (!editingCategory?.name || !editingCategory?.price) {
      toast.error("নাম এবং মূল্য আবশ্যক");
      return;
    }
    onManageCategory(editingCategory as Category);
    setEditingCategory(null);
  };

  const saveNews = () => {
    if (!editingNews?.title || !editingNews?.content) {
      toast.error("শিরোনাম এবং বিষয়বস্তু প্রদান করুন");
      return;
    }
    const newsToSave = {
      ...editingNews,
      id: editingNews.id || `news-${Date.now()}`,
      timestamp: editingNews.timestamp || Date.now(),
      isActive: editingNews.isActive ?? true
    } as NewsItem;
    
    onManageNews(newsToSave);
    setEditingNews(null);
    toast.success(editingNews.id ? "নিউজ আপডেট হয়েছে" : "নতুন নিউজ পাবলিশ হয়েছে");
  };

  const addPaymentMethod = () => {
    onUpdateSystemConfig({
      ...systemConfig,
      paymentMethods: [...systemConfig.paymentMethods, { id: Date.now().toString(), name: '', number: '', instruction: '', isActive: true }]
    });
    toast.success("নতুন পেমেন্ট মেথড যোগ করা হয়েছে");
  };

  const updatePaymentMethod = (index: number, updates: Partial<PaymentMethodConfig>) => {
    const newMethods = [...systemConfig.paymentMethods];
    newMethods[index] = { ...newMethods[index], ...updates };
    onUpdateSystemConfig({ ...systemConfig, paymentMethods: newMethods });
  };

  const handleSaveUser = () => {
    if (!editingUser?.name || !editingUser?.email) {
      toast.error("ইউজার নাম এবং ইমেইল প্রদান করুন");
      return;
    }

    if (editingUser.id) {
      onUpdateUserInfo(editingUser.id, editingUser);
    } else {
      const newUser: User = {
        id: `U-${Math.floor(1000 + Math.random() * 9000)}`,
        name: editingUser.name || '',
        email: editingUser.email || '',
        password: editingUser.password || 'password123',
        walletBalance: editingUser.walletBalance || 0,
        role: editingUser.role || UserRole.USER,
        isBlocked: false,
        twoFactorEnabled: false,
        emailVerified: true,
        createdAt: Date.now()
      };
      onCreateUser(newUser);
    }
    setEditingUser(null);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAdminProfileData(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserInfo(user.id, adminProfileData);
    setShowAdminProfile(false);
  };

  const displayedOrders = useMemo(() => {
    let filtered = [...orders].reverse();
    if (userOrdersFilter) {
      filtered = filtered.filter(o => o.userId === userOrdersFilter);
    }
    return filtered;
  }, [orders, userOrdersFilter]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300 font-inter">
      {/* Sidebar */}
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
              />
            )}
            <motion.aside 
              initial={window.innerWidth < 768 ? { x: -300 } : false}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed md:relative w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col h-full z-[110] md:z-0 ${isSidebarOpen ? 'flex' : 'hidden md:flex'}`}
            >
              <div className="flex items-center gap-3 mb-12 px-2">
                <motion.div 
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20"
                >
                  <ShieldAlert className="w-6 h-6 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white tracking-tight">OmniAdmin</h1>
                <button onClick={() => setIsSidebarOpen(false)} className="ml-auto p-2 md:hidden text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
                {[
                  { id: 'dash', label: t('dashboard'), icon: LayoutDashboard },
                  { id: 'activity-logs', label: t('activity_logs'), icon: History },
                  { id: 'payment-setup', label: t('payment_system'), icon: DollarSign },
                  { id: 'news-management', label: t('news_management'), icon: Megaphone },
                  { id: 'system-security', label: t('system_backup'), icon: ShieldCheck, color: 'emerald' },
                  { id: 'tab-control', label: t('tab_management'), icon: Settings },
                  { id: 'secret-forensic', label: t('system_forensic'), icon: Fingerprint, color: 'rose' },
                  { id: 'users-control', label: t('user_control'), icon: UserCog },
                  { id: 'users', label: t('user_management'), icon: Users },
                  { id: 'orders', label: t('order_management'), icon: ShoppingBag },
                  { id: 'recharges', label: t('recharge_request'), icon: CreditCard, badge: pendingRecharges.length },
                  { id: 'service-control', label: t('service_switch'), icon: Power },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      if (item.id === 'orders') setUserOrdersFilter(null);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                      activeTab === item.id 
                        ? 'text-white' 
                        : 'hover:bg-slate-800'
                    } ${item.color === 'emerald' && activeTab !== item.id ? 'text-emerald-500' : ''} ${item.color === 'rose' && activeTab !== item.id ? 'text-rose-500' : ''}`}
                  >
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="adminActiveTab"
                        className={`absolute inset-0 rounded-xl shadow-lg ${
                          item.color === 'emerald' ? 'bg-emerald-600 shadow-emerald-600/30' : 
                          item.color === 'rose' ? 'bg-rose-600 shadow-rose-600/30' : 
                          'bg-indigo-600 shadow-indigo-600/30'
                        }`}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={`w-5 h-5 relative z-10 ${activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="relative z-10">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse font-black relative z-10">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="pt-6 mt-auto border-t border-slate-800">
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-all"><LogOut className="w-5 h-5" /> {t('sign_out')}</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 relative z-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-xl font-bold text-white capitalize group-hover:text-indigo-400 transition-colors">
                {activeTab === 'dash' ? t('system_overview') : activeTab === 'activity-logs' ? t('activity_logs') : activeTab === 'news-management' ? t('news_management') : activeTab === 'tab-control' ? t('tab_management') : activeTab === 'system-security' ? t('system_backup') : activeTab === 'service-control' ? t('service_switch') : activeTab === 'users-control' ? t('user_control') : activeTab === 'secret-forensic' ? t('system_forensic') : activeTab === 'payment-setup' ? t('payment_system') : t(activeTab as any)}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all relative group">
                   <Bell className="w-5 h-5" />
                   {pendingRecharges.length > 0 && <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce font-black shadow-lg">{pendingRecharges.length}</span>}
                </button>
                {showNotifications && (
                   <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 ring-1 ring-white/10">
                      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
                         <h3 className="text-sm font-bold text-white uppercase tracking-widest">নোটিফিকেশন</h3>
                         <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-full">{pendingRecharges.length} পেন্ডিং</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto no-scrollbar">
                         {pendingRecharges.length > 0 ? pendingRecharges.map(req => {
                            const reqUser = users.find(u => u.id === req.userId);
                            return (
                               <div key={req.id} onClick={() => { setActiveTab('recharges'); setShowNotifications(false); }} className="p-5 border-b border-slate-800/50 hover:bg-indigo-600/10 cursor-pointer transition-all group">
                                  <div className="flex gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold shrink-0 shadow-inner">{reqUser?.name.charAt(0)}</div>
                                     <div className="flex-1 min-w-0">
                                        <p className="text-[11px] text-slate-300 font-medium"><span className="text-white font-bold">{reqUser?.name}</span> <span className="text-indigo-400 font-black">৳{req.amount}</span> রিচার্জ রিকোয়েস্ট পাঠিয়েছেন।</p>
                                     </div>
                                  </div>
                               </div>
                            );
                         }) : (
                            <div className="py-12 text-center">
                               <Bell className="w-10 h-10 text-slate-800 mx-auto mb-3" />
                               <p className="text-xs text-slate-500 font-medium">কোন নতুন রিচার্জ নোটিফিকেশন নেই</p>
                            </div>
                         )}
                      </div>
                   </div>
                )}
             </div>
             <button onClick={() => setShowAdminProfile(true)} className="flex items-center gap-3 pl-4 border-l border-slate-800 group hover:bg-white/5 p-2 rounded-2xl transition-all">
                <div className="text-right hidden sm:block">
                   <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{user.name}</p>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">System Manager</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all overflow-hidden">
                   {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                </div>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'activity-logs' && (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Activity Audit Logs</h3>
                     <p className="text-xs text-slate-500 font-medium">ইউজারদের সকল কার্যক্রম এবং সিস্টেম ইভেন্টস মনিটর করুন</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                     <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 flex-1 md:flex-none">
                        <Users className="w-4 h-4 text-slate-600" />
                        <select 
                          value={logUserFilter} 
                          onChange={(e) => setLogUserFilter(e.target.value)}
                          className="bg-transparent border-none outline-none text-xs text-white font-bold min-w-[140px]"
                        >
                           <option value="">All Users</option>
                           {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.id})</option>)}
                        </select>
                     </div>
                     <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        <input 
                           type="date" 
                           value={startDateFilter}
                           onChange={(e) => setStartDateFilter(e.target.value)}
                           className="bg-transparent border-none outline-none text-xs text-white font-bold"
                           title="Start Date"
                        />
                        <span className="text-slate-700 text-xs">-</span>
                        <input 
                           type="date" 
                           value={endDateFilter}
                           onChange={(e) => setEndDateFilter(e.target.value)}
                           className="bg-transparent border-none outline-none text-xs text-white font-bold"
                           title="End Date"
                        />
                     </div>
                     {(logUserFilter || startDateFilter || endDateFilter) && (
                        <button 
                           onClick={() => { setLogUserFilter(''); setStartDateFilter(''); setEndDateFilter(''); }}
                           className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-lg"
                           title="Clear Filters"
                        >
                           <RotateCcw className="w-4 h-4" />
                        </button>
                     )}
                  </div>
               </div>

               <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-950/50 border-b border-slate-800">
                              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">User Identity</th>
                              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action / Event</th>
                              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Description / Details</th>
                              <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Timestamp</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                           {filteredActivityLogs.length > 0 ? filteredActivityLogs.map(log => {
                              const logUser = users.find(u => u.id === log.userId);
                              return (
                                 <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 font-black text-sm shadow-inner group-hover:border-indigo-500/30 transition-all">
                                             {logUser?.avatar ? <img src={logUser.avatar} className="w-full h-full object-cover" /> : (logUser?.name.charAt(0) || '?')}
                                          </div>
                                          <div>
                                             <p className="text-xs font-black text-white">{logUser?.name || 'Unknown User'}</p>
                                             <p className="text-[10px] text-slate-500 font-mono mt-0.5">{log.userId}</p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-8 py-6">
                                       <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${log.action.toLowerCase().includes('failed') || log.action.toLowerCase().includes('cancelled') ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : log.action.toLowerCase().includes('approved') || log.action.toLowerCase().includes('success') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'}`}></div>
                                          <span className="text-[11px] font-black text-slate-200 uppercase tracking-tight">{log.action}</span>
                                       </div>
                                    </td>
                                    <td className="px-8 py-6">
                                       <p className="text-xs text-slate-400 font-medium italic truncate max-w-xs">{log.details || '—'}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                       <div className="flex flex-col items-end">
                                          <span className="text-xs font-black text-white tracking-tight">{new Date(log.timestamp).toLocaleDateString()}</span>
                                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                       </div>
                                    </td>
                                 </tr>
                              );
                           }) : (
                              <tr>
                                 <td colSpan={4} className="px-8 py-32 text-center">
                                    <Activity className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest">No activity matching filters</p>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
                  {filteredActivityLogs.length > 0 && (
                     <div className="p-6 bg-slate-950/50 border-t border-slate-800 text-center">
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Showing {filteredActivityLogs.length} activity entries</p>
                     </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'payment-setup' && (
            <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
               <div className="flex justify-between items-center bg-slate-900/40 p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5"><DollarSign className="w-40 h-40 text-indigo-500" /></div>
                  <div className="space-y-2 relative z-10">
                     <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Payment & System Setup</h3>
                     <p className="text-sm text-slate-500 font-medium">ডিপোজিট মেথড এবং সিস্টেমের গ্লোবাল লিমিট নিয়ন্ত্রণ করুন</p>
                  </div>
                  <button 
                    onClick={addPaymentMethod}
                    className="px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95 relative z-10"
                  >
                    <PlusCircle className="w-6 h-6" /> Add New Method
                  </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Financial Limits Section */}
                  <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 space-y-10 shadow-2xl">
                     <div className="flex items-center gap-5 border-b border-white/5 pb-6">
                        <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-400 shadow-inner"><Settings className="w-8 h-8" /></div>
                        <div>
                           <h4 className="text-2xl font-black text-white tracking-tight uppercase leading-none">System Financial Limits</h4>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Global Recharge Parameters</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Min Recharge (৳)</label>
                           <input 
                             type="number" 
                             value={systemConfig.minRecharge} 
                             onChange={e => onUpdateSystemConfig({...systemConfig, minRecharge: Number(e.target.value)})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-center text-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-all"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Max Recharge (৳)</label>
                           <input 
                             type="number" 
                             value={systemConfig.maxRecharge} 
                             onChange={e => onUpdateSystemConfig({...systemConfig, maxRecharge: Number(e.target.value)})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-center text-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-all"
                           />
                        </div>
                        <div className="space-y-3 col-span-2">
                           <div className="flex justify-between items-center px-3">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fraud Alert Threshold (৳)</label>
                              <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded uppercase">Security Sensitive</span>
                           </div>
                           <input 
                             type="number" 
                             value={systemConfig.fraudThreshold} 
                             onChange={e => onUpdateSystemConfig({...systemConfig, fraudThreshold: Number(e.target.value)})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-center text-2xl outline-none focus:ring-2 focus:ring-rose-500 shadow-inner transition-all"
                           />
                           <p className="text-[10px] text-slate-600 font-medium italic px-3 mt-2 text-center">এই পরিমাণের সমান বা বেশি রিচার্জ রিকোয়েস্ট আসলে তা 'High Risk' হিসেবে মার্ক হবে।</p>
                        </div>
                     </div>
                  </div>

                  {/* Support & Branding Section */}
                  <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 space-y-10 shadow-2xl">
                     <div className="flex items-center gap-5 border-b border-white/5 pb-6">
                        <div className="p-4 bg-emerald-600/10 rounded-2xl text-emerald-400 shadow-inner"><Globe className="w-8 h-8" /></div>
                        <div>
                           <h4 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Support & Branding</h4>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Public Identity & Contact</p>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Site Name</label>
                           <input 
                             type="text" 
                             value={systemConfig.siteName} 
                             onChange={e => onUpdateSystemConfig({...systemConfig, siteName: e.target.value})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner transition-all text-lg"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Support Email</label>
                           <input 
                             type="email" 
                             value={systemConfig.supportEmail} 
                             onChange={e => onUpdateSystemConfig({...systemConfig, supportEmail: e.target.value})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">WhatsApp Number (e.g., 8801700000000)</label>
                           <input 
                             type="text" 
                             value={systemConfig.whatsappNumber} 
                             onChange={e => onUpdateSystemConfig({...systemConfig, whatsappNumber: e.target.value})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-mono font-black outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner transition-all text-xl"
                             placeholder="8801XXXXXXXXX"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Payment Methods Managed List */}
               <div className="space-y-8">
                  <div className="flex items-center justify-between px-6 border-b border-white/5 pb-4">
                     <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-4">
                        <CreditCard className="w-6 h-6" /> Managed Deposit Channels
                     </h4>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full">{systemConfig.paymentMethods.length} Methods Configured</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     {systemConfig.paymentMethods.map((pm, index) => (
                        <div key={pm.id} className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 shadow-2xl space-y-8 relative group hover:border-indigo-500/40 transition-all overflow-hidden">
                           <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[60px] group-hover:bg-indigo-600/10 transition-colors"></div>
                           
                           <button 
                             onClick={() => {
                               const newMethods = systemConfig.paymentMethods.filter(item => item.id !== pm.id);
                               onUpdateSystemConfig({ ...systemConfig, paymentMethods: newMethods });
                               toast.success("পেমেন্ট মেথড ডিলিট করা হয়েছে");
                             }}
                             className="absolute top-10 right-10 p-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90 shadow-lg"
                             title="Delete Method"
                           >
                             <Trash2 className="w-6 h-6" />
                           </button>

                           <div className="grid grid-cols-1 gap-8 relative z-10">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3">Method Brand Name</label>
                                 <input 
                                   type="text" 
                                   value={pm.name} 
                                   onChange={e => updatePaymentMethod(index, { name: e.target.value })}
                                   className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner text-lg" 
                                   placeholder="e.g., Bkash (Personal)"
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3">Account / Wallet Number</label>
                                 <input 
                                   type="text" 
                                   value={pm.number} 
                                   onChange={e => updatePaymentMethod(index, { number: e.target.value })}
                                   className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-mono font-black outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner text-xl tracking-tighter"
                                   placeholder="01XXXXXXXXX"
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3">Short Instruction</label>
                                 <input 
                                   type="text" 
                                   value={pm.instruction} 
                                   onChange={e => updatePaymentMethod(index, { instruction: e.target.value })}
                                   className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                                   placeholder="e.g., Send Money করুন"
                                 />
                              </div>
                           </div>

                           <div className="flex items-center justify-between pt-10 border-t border-white/5 relative z-10">
                              <div className="flex items-center gap-4">
                                 <div className={`w-3 h-3 rounded-full shadow-[0_0_12px] ${pm.isActive ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'}`}></div>
                                 <div>
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest block">{pm.isActive ? 'Channel Online' : 'Channel Offline'}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{pm.isActive ? 'Visible to Users' : 'Hidden from Users'}</span>
                                 </div>
                              </div>
                              <button 
                                onClick={() => updatePaymentMethod(index, { isActive: !pm.isActive })}
                                className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-lg ${pm.isActive ? 'bg-emerald-600' : 'bg-slate-800'}`}
                              >
                                <span className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-xl ring-0 transition duration-200 ease-in-out ${pm.isActive ? 'translate-x-10' : 'translate-x-1'}`} />
                              </button>
                           </div>
                        </div>
                     ))}
                     {systemConfig.paymentMethods.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-slate-900 rounded-[4rem] border border-dashed border-slate-800 shadow-inner">
                           <CreditCard className="w-16 h-16 text-slate-800 mx-auto mb-8 opacity-20" />
                           <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">No Payment Methods Added</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'news-management' && (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
               <div className="flex justify-between items-center bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Newsfeed & Announcements</h3>
                     <p className="text-xs text-slate-500 font-medium">ইউজারদের ড্যাশবোর্ডে ঘোষণা পাবলিশ এবং ম্যানেজ করুন</p>
                  </div>
                  <button 
                    onClick={() => setEditingNews({ id: '', title: '', content: '', isActive: true, timestamp: Date.now() })}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-2xl shadow-indigo-600/30"
                  >
                    <Plus className="w-5 h-5" /> New Announcement
                  </button>
               </div>

               <div className="grid gap-6">
                  {news.length > 0 ? news.map(item => (
                    <div key={item.id} className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                       <div className="flex-1 space-y-4 min-w-0">
                          <div className="flex items-center gap-4">
                             <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-inner ${item.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                {item.isActive ? 'Active' : 'Hidden'}
                             </span>
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-xl font-black text-white tracking-tight truncate">{item.title}</h4>
                          <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2 italic">"{item.content}"</p>
                       </div>
                       <div className="flex items-center gap-3 shrink-0">
                          <button 
                            onClick={() => onManageNews({ ...item, isActive: !item.isActive })}
                            className={`p-4 rounded-2xl transition-all shadow-inner ${item.isActive ? 'bg-slate-950 text-emerald-400 hover:text-emerald-300' : 'bg-slate-950 text-slate-600 hover:text-emerald-400'}`}
                            title={item.isActive ? "Hide News" : "Activate News"}
                          >
                            {item.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                          </button>
                          <button onClick={() => setEditingNews(item)} className="p-4 bg-slate-950 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-2xl transition-all shadow-inner"><Edit2 className="w-5 h-5" /></button>
                          <button onClick={() => { if(confirm('আপনি কি এই নিউজটি ডিলিট করতে চান?')) onDeleteNews(item.id); }} className="p-4 bg-slate-950 text-rose-500 hover:text-white hover:bg-rose-600 rounded-2xl transition-all shadow-inner"><Trash2 className="w-5 h-5" /></button>
                       </div>
                    </div>
                  )) : (
                    <div className="py-24 text-center bg-slate-900 rounded-[3rem] border border-dashed border-slate-800">
                       <Megaphone className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                       <p className="text-xs text-slate-600 font-black uppercase tracking-widest">No News Items Published Yet</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'dash' && (
            <div className="space-y-10 animate-in fade-in duration-500">
               {/* Quick Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl group hover:border-emerald-500/50 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign className="w-20 h-20 text-emerald-500" /></div>
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-inner"><TrendingUp className="w-6 h-6" /></div>
                       <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Revenue</span>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">সফল অর্ডার আয়</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">৳{statsMetrics.totalOrderRevenue.toLocaleString()}</h4>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl group hover:border-indigo-500/50 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><CreditCard className="w-20 h-20 text-indigo-500" /></div>
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 shadow-inner"><ArrowUpRight className="w-6 h-6" /></div>
                       <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Recharge</span>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">মোট রিচার্জ জমা</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">৳{statsMetrics.totalRechargeAmt.toLocaleString()}</h4>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl group hover:border-amber-500/50 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShoppingBag className="w-20 h-20 text-amber-500" /></div>
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shadow-inner"><BarChart3 className="w-6 h-6" /></div>
                       <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Orders</span>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">মোট অর্ডার সংখ্যা</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">{statsMetrics.counts.total}</h4>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl group hover:border-indigo-500/50 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users className="w-20 h-20 text-indigo-500" /></div>
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 shadow-inner"><Users className="w-6 h-6" /></div>
                       <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Users</span>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">মোট রেজিস্টার্ড ইউজার</p>
                    <h4 className="text-3xl font-black text-white tracking-tighter">{users.filter(u => u.role === UserRole.USER).length}</h4>
                  </motion.div>
               </div>

               {/* Charts & Detailed Stats */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Financial Flow Chart */}
                  <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                       <div className="space-y-1">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3"><Activity className="w-5 h-5 text-indigo-500" /> Business Flow</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Recharges vs Order Volume (Last 12 Hours)</p>
                       </div>
                       <div className="flex gap-4">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-[9px] font-black uppercase text-slate-500">Recharge</span></div>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black uppercase text-slate-500">Orders</span></div>
                       </div>
                    </div>
                    <div className="h-[350px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={statsMetrics.hourData}>
                             <defs>
                                <linearGradient id="colorRecharge" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorOrder" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                             <XAxis dataKey="time" stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                             <YAxis stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v}`} />
                             <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                             <Area type="monotone" dataKey="recharge" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRecharge)" />
                             <Area type="monotone" dataKey="orderVolume" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrder)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Order Distribution Pie Chart */}
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col">
                    <div className="mb-8">
                       <h3 className="text-xl font-bold text-white flex items-center gap-3"><PieIcon className="w-5 h-5 text-amber-500" /> Order Analytics</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Status Distribution Proportion</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                       {statsMetrics.pieData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={260}>
                             <PieChart>
                                <Pie 
                                   data={statsMetrics.pieData} 
                                   innerRadius={60} 
                                   outerRadius={85} 
                                   paddingAngle={8} 
                                   dataKey="value"
                                   stroke="none"
                                >
                                   {statsMetrics.pieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                   ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px' }} />
                                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                             </PieChart>
                          </ResponsiveContainer>
                       ) : (
                          <div className="text-center py-20 opacity-20">
                             <Radar className="w-16 h-16 mx-auto mb-4" />
                             <p className="text-[10px] font-black uppercase">No Order Data</p>
                          </div>
                       )}
                       <div className="absolute flex flex-col items-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase">Total</span>
                          <span className="text-2xl font-black text-white leading-none">{statsMetrics.counts.total}</span>
                       </div>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-3 pt-6 border-t border-slate-800">
                       <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
                          <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Approved Ratio</p>
                          <p className="text-lg font-black text-emerald-500">{statsMetrics.counts.total > 0 ? Math.round((statsMetrics.counts.approved / statsMetrics.counts.total) * 100) : 0}%</p>
                       </div>
                       <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
                          <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Pending Ratio</p>
                          <p className="text-lg font-black text-amber-500">{statsMetrics.counts.total > 0 ? Math.round((statsMetrics.counts.pending / statsMetrics.counts.total) * 100) : 0}%</p>
                       </div>
                    </div>
                  </div>
               </div>

               {/* Status Breakdown Row */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-900/50 p-6 rounded-[1.5rem] border border-slate-800 flex items-center justify-between group hover:bg-amber-500/5 transition-all">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Pending Tasks</p>
                        <h5 className="text-2xl font-black text-white">{statsMetrics.counts.pending}</h5>
                     </div>
                     <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shadow-inner"><Timer className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-slate-900/50 p-6 rounded-[1.5rem] border border-slate-800 flex items-center justify-between group hover:bg-indigo-500/5 transition-all">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Received Tasks</p>
                        <h5 className="text-2xl font-black text-white">{statsMetrics.counts.received}</h5>
                     </div>
                     <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shadow-inner"><CheckCircle2 className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-slate-900/50 p-6 rounded-[1.5rem] border border-slate-800 flex items-center justify-between group hover:bg-emerald-500/5 transition-all">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Approved Tasks</p>
                        <h5 className="text-2xl font-black text-white">{statsMetrics.counts.approved}</h5>
                     </div>
                     <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shadow-inner"><Check className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-slate-900/50 p-6 rounded-[1.5rem] border border-slate-800 flex items-center justify-between group hover:bg-rose-500/5 transition-all">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Cancelled Tasks</p>
                        <h5 className="text-2xl font-black text-white">{statsMetrics.counts.cancelled}</h5>
                     </div>
                     <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 shadow-inner"><X className="w-5 h-5" /></div>
                  </div>
               </div>
            </div>
          )}

          {/* Tab: Tab Control (ট্যাপ নিয়ন্ত্রণ) */}
          {activeTab === 'tab-control' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">ট্যাপ নিয়ন্ত্রণ (সার্ভিস ও কাস্টম ট্যাপ)</h3>
                    <p className="text-sm text-slate-500 font-medium">এখান থেকে আপনি নতুন ট্যাপ বা সার্ভিস তৈরি করতে পারেন এবং সেগুলোর তথ্য ও ডকুমেন্টস রিকোয়ারমেন্ট নিয়ন্ত্রণ করতে পারেন।</p>
                  </div>
                  <button onClick={() => setEditingCategory({ id: `cat-${Date.now()}`, name: '', description: '', price: 0, isActive: true, icon: '', requiredFields: [] })} className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95"><PlusCircle className="w-6 h-6" /> নতুন ট্যাপ যোগ করুন</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 hover:border-indigo-500/50 transition-all group relative overflow-hidden shadow-2xl flex flex-col h-full">
                       <div className="flex justify-between items-start mb-8">
                          <div className="w-20 h-20 bg-slate-950 rounded-[1.5rem] border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner ring-1 ring-white/5">
                             {cat.icon && cat.icon.includes('data:image') ? <img src={cat.icon} className="w-full h-full object-cover" /> : <Package className="w-10 h-10 text-slate-700" />}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${cat.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                {cat.isActive ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                       </div>
                       <h4 className="text-2xl font-black text-white mb-3 tracking-tight">{cat.name}</h4>
                       <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3 font-medium">{cat.description}</p>
                       <div className="flex items-center justify-between pt-6 border-t border-slate-800/50 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">Price / Charge</span>
                            <span className="text-indigo-400 font-black text-2xl tracking-tighter">৳{cat.price}</span>
                          </div>
                          <button onClick={() => setEditingCategory(cat)} className="p-4 bg-slate-950 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-2xl transition-all shadow-inner active:scale-90"><Edit2 className="w-6 h-6" /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Tab: System Backup & Protection */}
          {activeTab === 'system-security' && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 space-y-10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5"><HardDrive className="w-32 h-32 text-indigo-500" /></div>
                     <div className="relative z-10 space-y-2">
                        <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4"><Database className="w-8 h-8 text-indigo-500" /> সিস্টেম ব্যাকআপ ও রিকভারি</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Database & User Files Management</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <button onClick={() => handleExportBackup('DATABASE')} className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:bg-indigo-600 hover:text-white transition-all group shadow-xl">
                           <FileArchive className="w-12 h-12 text-indigo-500 group-hover:text-white transition-colors" />
                           <div className="text-center"><span className="text-sm font-black uppercase tracking-widest block">Database Backup</span><span className="text-[10px] opacity-60 font-bold">Export app state as JSON</span></div>
                        </button>
                        <button onClick={() => handleExportBackup('FILES')} className="bg-emerald-600/10 border border-emerald-500/20 p-8 rounded-[2rem] flex flex-col items-center gap-4 hover:bg-emerald-600 hover:text-white transition-all group shadow-xl">
                           <ImageIcon className="w-12 h-12 text-emerald-500 group-hover:text-white transition-colors" />
                           <div className="text-center"><span className="text-sm font-black uppercase tracking-widest block">File Backup</span><span className="text-[10px] opacity-60 font-bold">Export all delivered files</span></div>
                        </button>
                     </div>
                     <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-4"><RefreshCw className="w-6 h-6 text-amber-500" /><h4 className="text-lg font-black text-white tracking-tight uppercase">সিস্টেম রিস্টোর (Restore)</h4></div>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 hover:bg-slate-900 cursor-pointer transition-all group">
                           <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 mb-3" />
                           <p className="text-[11px] text-slate-500 font-bold text-center">ব্যাকআপ ফাইল (.json) সিলেক্ট করুন রিস্টোর করতে</p>
                           <input type="file" className="hidden" accept=".json" onChange={() => toast.loading('Data integrity checking...')} />
                        </label>
                        <div className="flex items-center gap-3 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl"><ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" /><p className="text-[9px] text-rose-400 font-bold leading-relaxed italic">সতর্কতা: রিস্টোর করলে বর্তমান ডাটাবেস সম্পূর্ণ মুছে যাবে এবং ব্যাকআপ ডাটা লোড হবে।</p></div>
                     </div>
                  </div>
                  <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 space-y-8 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldEllipsis className="w-32 h-32 text-rose-500" /></div>
                     <div className="relative z-10 space-y-2"><h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4"><Radar className="w-8 h-8 text-rose-500" /> হ্যাক প্রোটেকশন ও সিকিউরিটি</h3><p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Real-time IP Logging & Threat Detection</p></div>
                     <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 shadow-inner"><p className="text-[9px] text-slate-500 font-black uppercase mb-1">Firewall Status</p><p className="text-xl font-black text-emerald-400">ENFORCED</p></div>
                        <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 shadow-inner"><p className="text-[9px] text-slate-500 font-black uppercase mb-1">Threat Level</p><p className="text-xl font-black text-slate-300">LOW</p></div>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2 px-2"><Activity className="w-4 h-4" /> Live Security Audit (Filtered)</h4>
                        <div className="bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-inner overflow-hidden max-h-[400px] overflow-y-auto no-scrollbar">
                           {suspiciousLogs.length > 0 ? suspiciousLogs.map(log => {
                              const logUser = users.find(u => u.id === log.userId);
                              return (
                                 <div key={log.id} className="p-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-start justify-between mb-2"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${log.action.toLowerCase().includes('failed') ? 'bg-rose-500' : 'bg-indigo-500'}`}></div><span className="text-[11px] font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{log.action}</span></div><span className="text-[9px] text-slate-600 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span></div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 pl-5">
                                       <p className="text-[10px] text-slate-500 font-medium">User: <span className="text-slate-300">{logUser?.name || 'GUEST'}</span></p>
                                       <p className="text-[10px] text-slate-500 font-medium">IP: <span className="text-emerald-400 font-mono">{logUser?.deviceDetails?.ip || 'Hidden'}</span></p>
                                    </div>
                                 </div>
                              );
                           }) : (
                              <div className="py-20 text-center"><ShieldCheck className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" /><p className="text-xs text-slate-600 font-medium italic">সিস্টেম সিকিউরিটি লগে কোন অস্বাভাবিকতা পাওয়া যায়নি</p></div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'secret-forensic' && (
             <div className="space-y-10 animate-in fade-in zoom-in duration-500 max-w-7xl mx-auto">
                <div className="bg-rose-600/10 p-10 rounded-[3rem] border border-rose-500/20 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldAlert className="w-40 h-40 text-rose-500 animate-pulse" /></div>
                   <div className="relative z-10">
                      <h3 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 flex items-center gap-4"><Terminal className="w-10 h-10 text-rose-500" /> সিক্রেট ফরেনসিক ভিউ</h3>
                      <p className="text-rose-400 font-bold uppercase tracking-[0.3em] text-xs">Sensitive User Credentials & Device Tracking</p>
                   </div>
                </div>
                <div className="grid gap-6">
                   {users.map((u, idx) => (
                      <motion.div 
                        key={u.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group hover:border-rose-500/30 transition-all"
                      >
                         <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity"><Terminal className="w-32 h-32 text-white" /></div>
                         <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                            <div className="w-full lg:w-1/3 space-y-8 border-r border-slate-800 pr-10">
                               <div className="flex items-center gap-6">
                                  <div className="w-20 h-20 rounded-[2rem] bg-slate-950 border border-white/10 flex items-center justify-center text-rose-500 text-3xl font-black shadow-inner overflow-hidden ring-4 ring-white/5">
                                     {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="text-2xl font-black text-white leading-none tracking-tight">{u.name}</h4>
                                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 px-2 py-0.5 bg-rose-500/10 rounded-md inline-block border border-rose-500/20">UID: {u.id}</p>
                                  </div>
                               </div>
                               <div className="space-y-4">
                                  <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 shadow-inner">
                                     <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-rose-500" /> ACCESS CREDENTIALS</p>
                                     <div className="space-y-4">
                                       <div className="flex justify-between items-center"><span className="text-[10px] text-slate-600 font-bold uppercase">Email</span><span className="text-white font-mono text-xs font-black lowercase truncate max-w-[150px]">{u.email}</span></div>
                                       <div className="flex justify-between items-center p-3 bg-rose-500/5 rounded-xl ring-1 ring-rose-500/20"><span className="text-[10px] text-rose-400 font-black uppercase">Password</span><span className="text-rose-500 font-mono text-xs font-black tracking-widest bg-rose-500/10 px-2 py-1 rounded select-all">{u.password || '********'}</span></div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                            <div className="flex-1 space-y-8">
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 shadow-inner">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Smartphone className="w-3.5 h-3.5 text-rose-500" /> Device Specs</p>
                                    <div className="space-y-3">
                                      <div className="flex justify-between"><span className="text-[9px] text-slate-600 font-bold uppercase">Model</span><span className="text-white text-[10px] font-black uppercase truncate max-w-[100px]">{u.deviceDetails?.deviceName || 'UNKNOWN'}</span></div>
                                      <div className="flex justify-between p-2 bg-slate-900 rounded-lg"><span className="text-[9px] text-rose-400 font-black uppercase">IP Addr</span><span className="text-rose-500 text-[10px] font-mono font-black">{u.deviceDetails?.ip || '0.0.0.0'}</span></div>
                                    </div>
                                  </div>
                                  <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 shadow-inner">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-emerald-500" /> Network Info</p>
                                    <div className="space-y-3">
                                      <div className="flex justify-between"><span className="text-[9px] text-slate-600 font-bold uppercase">Provider</span><span className="text-emerald-400 text-[10px] font-black uppercase truncate max-w-[100px]">{u.deviceDetails?.location?.address?.split(',').pop() || 'N/A'}</span></div>
                                    </div>
                                  </div>
                                  <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 shadow-inner">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> GPS Location</p>
                                    <div className="space-y-3">
                                      <div className="flex justify-between"><span className="text-[9px] text-slate-600 font-bold uppercase">Lat/Lng</span><span className="text-white text-[10px] font-mono">{u.deviceDetails?.location.lat.toFixed(4)}, {u.deviceDetails?.location.lng.toFixed(4)}</span></div>
                                    </div>
                                  </div>
                               </div>
                               <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-800">
                                  <button onClick={() => onTakeAccess(u.id)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-3 active:scale-95"><Ghost className="w-5 h-5" /> Remote Control</button>
                                  <button onClick={() => onBlockUser(u.id)} className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 border ${u.isBlocked ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white'}`}>
                                    {u.isBlocked ? <ShieldCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                                    {u.isBlocked ? 'Unblock Access' : 'Full Lockdown'}
                                  </button>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'recharges' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">লেনদেন ও রিচার্জ ম্যানেজমেন্ট</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium italic">ইউজারদের ডিপোজিট রিকোয়েস্টগুলো এখান থেকে কন্ট্রোল করুন</p>
                  </div>
                  <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 shadow-xl">
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 text-center">মোট রিচার্জ সংখ্যা</p>
                     <p className="text-xl font-black text-white text-center">{recharges.length}</p>
                  </div>
               </div>
               <div className="grid gap-6">
                  {recharges.length > 0 ? [...recharges].reverse().map(req => {
                     const reqUser = users.find(u => u.id === req.userId);
                     return (
                        <div key={req.id} className={`bg-slate-900 p-8 rounded-[2.5rem] border ${req.isFraudSuspected ? 'border-amber-500/50 bg-amber-500/5' : req.status === 'PENDING' ? 'border-indigo-500/30' : 'border-slate-800'} transition-all hover:shadow-2xl shadow-indigo-500/5`}>
                           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                              <div className="space-y-4 flex-1">
                                 <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-lg uppercase">REQ-ID: {req.id}</span>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-inner ${req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-500' : req.status === 'PENDING' ? 'bg-amber-500 text-white animate-pulse' : 'bg-rose-500/20 text-rose-500'}`}>{req.status}</span>
                                    {req.isFraudSuspected && <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase ring-1 ring-rose-500/50"><ShieldAlert className="w-3.5 h-3.5" /> High Risk</span>}
                                 </div>
                                 <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950 border border-slate-800 flex items-center justify-center text-white font-black text-3xl shadow-inner overflow-hidden">
                                       {reqUser?.avatar ? <img src={reqUser.avatar} className="w-full h-full object-cover" /> : reqUser?.name.charAt(0)}
                                    </div>
                                    <div>
                                       <h4 className="text-3xl font-black text-white tracking-tighter">৳{req.amount} <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded ml-2">{req.method}</span></h4>
                                       <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                          <p className="text-xs text-slate-400 font-medium">গ্রাহক: <span className="text-white font-bold">{reqUser?.name}</span></p>
                                          <p className="text-xs text-slate-400 font-medium">Transaction ID: <span className="font-mono text-emerald-400 font-bold">{req.transactionId}</span></p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-4 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-10">
                                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(req.createdAt).toLocaleString()}</p>
                                 <div className="flex gap-3 w-full">
                                    {req.status === 'PENDING' && (
                                       <>
                                          <button onClick={() => onApproveRecharge(req.id)} className="flex-1 lg:flex-none px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-2"><Check className="w-4 h-4" /> Approve</button>
                                          <button onClick={() => onRejectRecharge(req.id)} className="flex-1 lg:flex-none px-10 py-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-2xl text-[11px] font-black hover:bg-rose-600 hover:text-white transition-all active:scale-95 flex items-center gap-2"><X className="w-4 h-4" /> Reject</button>
                                       </>
                                    )}
                                    {req.status === 'APPROVED' && (
                                       <button onClick={() => setCorrectingRecharge({ id: req.id, amount: req.amount })} className="px-6 py-3.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-2xl text-[11px] font-black hover:bg-indigo-600 hover:text-white flex items-center gap-2 transition-all shadow-inner"><RefreshCw className="w-4 h-4" /> এমাউন্ট সংশোধন</button>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  }) : (
                     <div className="py-24 text-center bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-800 shadow-inner">
                        <CreditCard className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <p className="text-slate-500 font-medium italic">এখনও কোন ডিজিটাল লেনদেন বা রিচার্জ রিকোয়েস্ট আসেনি</p>
                     </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'users-control' && (
             <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">ইউজার নিয়ন্ত্রণ ও রেজিস্টার</h3>
                    <p className="text-sm text-slate-500 font-medium">সিস্টেমে নতুন ইউজার যোগ করুন অথবা বিদ্যমান তথ্য হালনাগাদ করুন।</p>
                  </div>
                  <button onClick={() => setEditingUser({ name: '', email: '', password: '', walletBalance: 0, role: UserRole.USER })} className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-2xl shadow-indigo-600/30 active:scale-95">
                    <UserPlus className="w-6 h-6" /> নতুন ইউজার যোগ করুন
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map(u => (
                    <div key={u.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 hover:border-indigo-500/50 transition-all group shadow-2xl flex flex-col justify-between h-auto min-h-[16rem]">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-2xl shadow-inner border border-white/5 overflow-hidden">
                               {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-white font-black leading-none text-xl truncate">{u.name}</h4>
                              <p className="text-[10px] text-slate-500 font-mono tracking-tighter mt-2 truncate">{u.email}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${u.role === UserRole.ADMIN ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'}`}>
                                  {u.role}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => onBlockUser(u.id)} 
                               className={`p-3 rounded-xl transition-all shadow-inner active:scale-90 ${u.isBlocked ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white'}`}
                               title={u.isBlocked ? 'Unblock User' : 'Block User'}
                             >
                               {u.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                             </button>
                             <button onClick={() => setEditingUser(u)} className="p-3 bg-slate-950 text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-xl transition-all shadow-inner active:scale-90">
                               <Edit2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                       <div className="pt-6 border-t border-slate-800/50 flex justify-between items-center mt-6">
                          <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Wallet Balance</p>
                            <p className="text-2xl font-black text-white tracking-tighter">৳{u.walletBalance}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Status</p>
                            <span className={`text-[10px] font-black ${u.isBlocked ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {u.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {activeTab === 'users' && (
             <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-white tracking-tight">ইউজার ম্যানেজমেন্ট</h3>
                 <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                   <Search className="w-4 h-4 text-slate-500" />
                   <input type="text" placeholder="ইউজার আইডি বা ইমেইল..." className="bg-transparent border-none outline-none text-xs text-white" />
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {users.filter(u => u.role === UserRole.USER).map(u => (
                   <div key={u.id} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 hover:border-indigo-500/50 transition-all group relative overflow-hidden shadow-2xl">
                     <div className="flex items-center gap-4 mb-4 relative z-10">
                       <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-2xl shadow-lg border border-white/5 overflow-hidden">
                         {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                       </div>
                       <div>
                         <h4 className="text-white font-bold leading-tight">{u.name}</h4>
                         <p className="text-[10px] text-slate-500 font-mono tracking-tighter mt-1">{u.email}</p>
                         <p className="text-[10px] text-indigo-400 font-black mt-0.5">BALANCE: ৳{u.walletBalance}</p>
                       </div>
                     </div>
                     <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">
                       <button onClick={() => { setActiveTab('orders'); setUserOrdersFilter(u.id); }} className="py-3 bg-indigo-600/20 text-indigo-400 rounded-xl text-[11px] font-black uppercase hover:bg-indigo-600 hover:text-white flex items-center justify-center gap-2 transition-all shadow-inner" title="সব অর্ডার">
                         <ShoppingBag className="w-4 h-4" />
                       </button>
                       <button onClick={() => onBlockUser(u.id)} className={`py-3 rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-inner ${u.isBlocked ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white'}`} title={u.isBlocked ? 'Unblock' : 'Block'}>
                         {u.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                       </button>
                       <button onClick={() => onTakeAccess(u.id)} className="py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20" title="এক্সেস নিন">
                         <Ghost className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'service-control' && (
            <div className="space-y-8 animate-in fade-in duration-500"><div className="flex flex-col gap-2 border-b border-slate-800 pb-6"><h3 className="text-2xl font-bold text-white tracking-tight">সেবা নিয়ন্ত্রণ (Quick Switch)</h3></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{categories.map(cat => (<div key={cat.id} className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between h-48 group shadow-2xl ${cat.isActive ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'}`}><div className="flex justify-between items-start"><div className={`p-4 rounded-2xl shadow-inner ${cat.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}><Power className="w-6 h-6" /></div><button onClick={() => onManageCategory({...cat, isActive: !cat.isActive})} className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cat.isActive ? 'bg-emerald-600' : 'bg-slate-700'}`}><span className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${cat.isActive ? 'translate-x-6' : 'translate-x-0'}`} /></button></div><div><h4 className={`text-lg font-black tracking-tight ${cat.isActive ? 'text-white' : 'text-slate-500'}`}>{cat.name}</h4></div></div>))}</div></div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {userOrdersFilter ? `${users.find(u => u.id === userOrdersFilter)?.name} এর অর্ডারসমূহ` : 'অর্ডার হিস্টোরি'}
                  </h3>
                  {userOrdersFilter && (
                    <button onClick={() => setUserOrdersFilter(null)} className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg uppercase tracking-widest flex items-center gap-2">
                       <X className="w-3 h-3" /> ক্লিয়ার ফিল্টার
                    </button>
                  )}
               </div>
               <div className="space-y-4">
                  {displayedOrders.length > 0 ? displayedOrders.map(order => (
                     <div key={order.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 hover:border-indigo-500/30 transition-all group shadow-2xl relative overflow-hidden">
                        <div className="flex flex-col lg:flex-row justify-between gap-10">
                           <div className="flex-1 space-y-5">
                              <div className="flex items-center gap-4">
                                 <span className="text-[10px] font-mono text-indigo-400 font-black bg-indigo-400/10 px-3 py-1 rounded-lg uppercase tracking-widest">ORDER-ID: {order.id}</span>
                                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-inner ${
                                   order.status === OrderStatus.PENDING ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 
                                   order.status === OrderStatus.RECEIVED ? 'bg-indigo-500/20 text-indigo-400' :
                                   order.status === OrderStatus.APPROVED ? 'bg-emerald-500/20 text-emerald-500' : 
                                   'bg-rose-500/20 text-rose-500'
                                 }`}>{order.status}</span>
                              </div>
                              
                              <h4 className="text-2xl font-black text-white flex items-center gap-4">
                                 {categories.find(c => c.id === order.categoryId)?.name}
                                 <span className="text-indigo-400 text-lg font-black bg-indigo-500/10 px-4 py-1.5 rounded-2xl shadow-inner border border-white/5">৳{order.amount}</span>
                              </h4>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                                 <div className="space-y-1">
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">User Name</p>
                                    <p className="text-white text-xs font-black truncate">{users.find(u => u.id === order.userId)?.name}</p>
                                 </div>
                                 {Object.entries(order.userInputData || {}).map(([label, val]) => (
                                    <div key={label} className="space-y-1">
                                       <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
                                       <p className="text-white text-xs font-black truncate">{val}</p>
                                    </div>
                                 ))}
                              </div>

                              {order.comment && (
                                 <div className={`p-5 rounded-2xl border flex items-start gap-3 ${order.status === OrderStatus.CANCELLED ? 'bg-rose-500/5 border-rose-500/10' : 'bg-slate-950/30 border-slate-800'}`}>
                                    <MessageSquare className={`w-5 h-5 shrink-0 ${order.status === OrderStatus.CANCELLED ? 'text-rose-500' : 'text-indigo-400'}`} />
                                    <div>
                                       <p className="text-white text-[11px] leading-relaxed font-medium italic">"{order.comment}"</p>
                                    </div>
                                 </div>
                              )}
                           </div>

                           <div className="w-full lg:w-64 space-y-3 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-8 lg:pt-0 lg:pl-8">
                              {order.files && order.files.length > 0 && (
                                 <button onClick={() => setViewingFiles(order)} className="w-full py-4 bg-slate-950 text-indigo-400 border border-slate-800 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                                    <Eye className="w-4 h-4" /> ফাইলগুলো দেখুন
                                 </button>
                              )}
                              {order.status === OrderStatus.PENDING && (
                                 <button onClick={() => onUpdateOrder(order.id, OrderStatus.RECEIVED, 'অর্ডার প্রসেসিং শুরু হয়েছে')} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Receive Order
                                 </button>
                              )}

                              {order.status === OrderStatus.RECEIVED && (
                                 <div className="space-y-3 animate-in fade-in duration-300">
                                    <button onClick={() => setOrderAction({ id: order.id, type: 'APPROVE' })} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2">
                                       <Upload className="w-4 h-4" /> Approve & Deliver
                                    </button>
                                    <button 
                                      onClick={() => {
                                         setPendingFiles(order.files || []);
                                         setOrderAction({ id: order.id, type: 'EDIT_FILES' });
                                      }} 
                                      className="w-full py-4 bg-slate-950 text-indigo-400 border border-slate-800 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                    >
                                      <FileText className="w-4 h-4" /> ফাইল ম্যানেজ করুন
                                    </button>
                                    <button onClick={() => setOrderAction({ id: order.id, type: 'CANCEL' })} className="w-full py-5 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                                       <X className="w-4 h-4" /> Cancel Order
                                    </button>
                                 </div>
                              )}

                              {order.status === OrderStatus.APPROVED && (
                                 <div className="space-y-3">
                                    {isWithinEditWindow(order.approvalTimestamp) ? (
                                       <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
                                          <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-[10px] uppercase mb-2">
                                             <Clock className="w-3.5 h-3.5" /> এডিট উইন্ডো চালু আছে
                                          </div>
                                          <button 
                                            onClick={() => {
                                               setPendingFiles(order.files || []);
                                               setOrderAction({ id: order.id, type: 'EDIT_FILES' });
                                            }} 
                                            className="w-full py-4 bg-slate-800 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                                          >
                                             <Edit2 className="w-4 h-4" /> আপডেট ফাইলস
                                          </button>
                                       </div>
                                    ) : (
                                       <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-center">
                                          <p className="text-slate-500 font-black text-[9px] uppercase tracking-widest">ফাইল এডিট সময় শেষ (৩০ মিনিট)</p>
                                       </div>
                                    )}
                                    <button onClick={() => setOrderAction({ id: order.id, type: 'CANCEL' })} className="w-full py-5 bg-rose-600/5 text-rose-400 border border-rose-500/10 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all active:scale-95">
                                       <ArrowUpRight className="w-4 h-4 inline mr-2" /> Cancel & Refund
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )) : (
                     <div className="py-32 text-center bg-slate-900/50 rounded-[4rem] border border-dashed border-slate-800 shadow-inner">
                        <ShoppingBag className="w-20 h-20 text-slate-800 mx-auto mb-8 opacity-20" />
                        <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-sm">কোন অর্ডার নেই</p>
                     </div>
                  )}
               </div>
            </div>
          )}
          </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Editing User Modal (User Control Tab) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 z-[5000] animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 ring-1 ring-white/10">
              <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/20"><UserCog className="w-8 h-8" /></div>
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{editingUser.id ? 'Edit User Identity' : 'Register New User'}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">System Access Management</p>
                    </div>
                 </div>
                 <button onClick={() => setEditingUser(null)} className="p-3 hover:bg-slate-800 rounded-3xl text-slate-500 transition-all"><X className="w-8 h-8" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Full Name</label>
                    <input type="text" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Email / UID</label>
                    <input type="email" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Wallet Balance (৳)</label>
                    <input type="number" value={editingUser.walletBalance || 0} onChange={e => setEditingUser({...editingUser, walletBalance: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Account Security Role</label>
                    <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner">
                       <button 
                         onClick={() => setEditingUser({...editingUser, role: UserRole.USER})}
                         className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingUser.role === UserRole.USER ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                       >
                         User (Standard)
                       </button>
                       <button 
                         onClick={() => setEditingUser({...editingUser, role: UserRole.ADMIN})}
                         className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingUser.role === UserRole.ADMIN ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                       >
                         Admin (Privileged)
                       </button>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-800">
                 <button onClick={() => setEditingUser(null)} className="flex-1 py-6 bg-slate-950 text-slate-500 font-black rounded-3xl hover:text-white transition-all uppercase tracking-widest text-xs">Discard</button>
                 <button onClick={handleSaveUser} className="flex-2 px-12 py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
                   <Save className="w-5 h-5" /> {editingUser.id ? 'Update User Identity' : 'Register Identity'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Admin Profile Modal */}
      {showAdminProfile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-[5000]">
           <div className="bg-slate-900 border border-slate-800 w-full max-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 ring-1 ring-white/10">
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg"><Edit2 className="w-6 h-6" /></div>
                    <div><h3 className="text-2xl font-black text-white tracking-tight">{t('admin_profile')}</h3></div>
                 </div>
                 <button onClick={() => setShowAdminProfile(false)} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-500 transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="flex flex-col items-center gap-6 mb-10">
                 <div className="w-32 h-32 rounded-[2.5rem] bg-slate-950 border-4 border-slate-800 flex items-center justify-center text-white text-5xl font-black overflow-hidden relative group">
                    {adminProfileData.avatar ? <img src={adminProfileData.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                       <Camera className="w-8 h-8 text-white" />
                       <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                 </div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('change_avatar_camera')}</p>
              </div>

              <form onSubmit={handleUpdateAdminProfile} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">{t('admin_name')}</label>
                       <input type="text" value={adminProfileData.name} onChange={e => setAdminProfileData({...adminProfileData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">{t('email_address')}</label>
                       <input type="email" value={adminProfileData.email} onChange={e => setAdminProfileData({...adminProfileData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">{t('nid_number')}</label>
                       <input type="text" value={adminProfileData.nid} onChange={e => setAdminProfileData({...adminProfileData, nid: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">{t('date_of_birth')}</label>
                       <input type="date" value={adminProfileData.dob} onChange={e => setAdminProfileData({...adminProfileData, dob: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">{t('default_language')}</label>
                       <select 
                          value={adminProfileData.language}
                          onChange={e => setAdminProfileData({...adminProfileData, language: e.target.value as 'bn' | 'en'})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                       >
                          <option value="bn">Bengali (বাংলা)</option>
                          <option value="en">English</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">{t('security_password')}</label>
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                          <input type="text" value={adminProfileData.password} onChange={e => setAdminProfileData({...adminProfileData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white font-mono outline-none focus:ring-2 focus:ring-indigo-500 transition-all" required />
                       </div>
                    </div>
                 </div>
                 <div className="pt-6">
                    <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                       <Save className="w-5 h-5" /> {t('save')}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Editing News Modal */}
      {editingNews && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 z-[6000] overflow-y-auto no-scrollbar">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-[4rem] p-12 shadow-2xl animate-in zoom-in duration-300 ring-1 ring-white/10 my-10">
             <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
                <div className="flex items-center gap-5">
                   <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-xl"><Newspaper className="w-8 h-8" /></div>
                   <div>
                      <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{editingNews.id ? 'Edit Announcement' : 'New Announcement'}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Configure Public Broadcast</p>
                   </div>
                </div>
                <button onClick={() => setEditingNews(null)} className="p-4 hover:bg-slate-800 rounded-3xl text-slate-500 transition-all"><X className="w-8 h-8" /></button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Editor Side */}
                <div className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Announcement Title</label>
                      <input 
                         type="text" 
                         value={editingNews.title || ''} 
                         onChange={e => setEditingNews({...editingNews, title: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" 
                         placeholder="e.g., পবিত্র ঈদ-উল-ফিতরের শুভেচ্ছা!"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">Content (Markdown Support)</label>
                      <textarea 
                         value={editingNews.content || ''} 
                         onChange={e => setEditingNews({...editingNews, content: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-8 text-white font-medium outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner min-h-[300px] leading-relaxed" 
                         placeholder="Write your announcement details here..."
                      />
                   </div>

                   <div className="flex items-center justify-between p-6 bg-slate-950 rounded-2xl border border-white/5 shadow-inner">
                      <div>
                         <p className="text-sm font-black text-white uppercase tracking-tight">Display Visibility</p>
                         <p className="text-[10px] text-slate-500 font-medium italic">Toggle to show/hide from user dashboard</p>
                      </div>
                      <button 
                         onClick={() => setEditingNews({...editingNews, isActive: !editingNews.isActive})}
                         className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${editingNews.isActive ? 'bg-indigo-600' : 'bg-slate-800'}`}
                      >
                         <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${editingNews.isActive ? 'translate-x-11' : 'translate-x-1'}`} />
                      </button>
                   </div>
                </div>

                {/* Preview Side */}
                <div className="space-y-6">
                   <p className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest flex items-center gap-2"><Eye className="w-4 h-4" /> User Live Preview</p>
                   <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group min-h-[500px]">
                      <div className="absolute top-0 right-0 p-10 opacity-5"><Bell className="w-32 h-32 text-slate-900" /></div>
                      <div className="flex items-center justify-between mb-8">
                         <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-[0.2em]">{new Date().toLocaleDateString()}</span>
                         <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                      </div>
                      <h4 className="text-3xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">{editingNews.title || 'Untitled Announcement'}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium whitespace-pre-wrap">{editingNews.content || 'Your message content will appear here exactly as formatted...'}</p>
                   </div>
                </div>
             </div>

             <div className="mt-12 pt-8 border-t border-slate-800 flex gap-4">
                <button onClick={() => setEditingNews(null)} className="flex-1 py-6 bg-slate-950 text-slate-500 font-black rounded-3xl hover:text-white transition-all uppercase tracking-widest text-xs">Discard</button>
                <button onClick={saveNews} className="flex-2 px-16 py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"><Save className="w-5 h-5" /> {editingNews.id ? 'Halt & Update' : 'Broadcast Now'}</button>
             </div>
          </div>
        </div>
      )}

      {/* Editing Category (Tab Editor) Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 z-[2000] overflow-y-auto no-scrollbar">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-[3rem] p-0 shadow-2xl animate-in zoom-in duration-300 overflow-hidden my-8 flex flex-col lg:flex-row ring-1 ring-white/10">
             <div className="w-full lg:w-96 bg-slate-950 p-10 border-r border-slate-800 flex flex-col shrink-0 shadow-2xl">
                <h3 className="text-3xl font-black text-white mb-12 tracking-tight">ট্যাপ এডিটর</h3>
                <div className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-2 block text-center tracking-[0.4em]">ট্যাপ আইকন (Custom)</label>
                      <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-12 flex flex-col items-center gap-4 transition-all group overflow-hidden relative min-h-[220px] shadow-inner ring-1 ring-white/5">
                         {editingCategory.icon && editingCategory.icon.includes('data:image') ? <img src={editingCategory.icon} className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 group-hover:scale-110 transition-transform duration-700" /> : null}
                         <Upload className="w-12 h-12 text-indigo-500 relative z-10 group-hover:scale-110 transition-transform shadow-2xl" />
                         <span className="text-[11px] font-black text-slate-400 relative z-10 uppercase tracking-widest bg-slate-950/50 px-3 py-1 rounded-full">ছবি আপলোড</span>
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAssetUpload(e, 'icon')} />
                      </label>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-2 block text-center tracking-[0.4em]">নমুনা ফাইল (Sample)</label>
                      <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center gap-3 transition-all relative overflow-hidden min-h-[160px] shadow-inner ring-1 ring-white/5 group">
                         {editingCategory.sampleUrl ? <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20"><Check className="w-10 h-10 text-emerald-500" /></div> : null}
                         <FileUp className="w-8 h-8 text-emerald-500 relative z-10 group-hover:translate-y-[-5px] transition-transform" />
                         <span className="text-[11px] font-black text-slate-400 relative z-10 uppercase tracking-widest">ফাইল আপলোড</span>
                         <input type="file" className="hidden" onChange={(e) => handleAssetUpload(e, 'sampleUrl')} />
                      </label>
                   </div>
                </div>
                <div className="mt-auto space-y-4 pt-12">
                   <button onClick={saveCategory} className="w-full py-6 bg-indigo-600 text-white font-black rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/40 text-xs uppercase tracking-[0.2em] active:scale-95"><Save className="w-5 h-5" /> SAVE CONFIG</button>
                   <button onClick={() => setEditingCategory(null)} className="w-full py-5 bg-slate-900 text-slate-500 font-bold rounded-[1.5rem] hover:text-white transition-all text-xs uppercase tracking-widest active:scale-95">CANCEL</button>
                </div>
             </div>

             <div className="flex-1 p-12 space-y-12 bg-slate-900/40 no-scrollbar overflow-y-auto max-h-[90vh] shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">ট্যাপের নাম (Display Name)</label>
                      <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-all" placeholder="যেমন: ন্যাশনাল আইডি কার্ড প্রিন্ট" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">চার্জ / মূল্য (৳)</label>
                      <input type="number" value={editingCategory.price} onChange={(e) => setEditingCategory({...editingCategory, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-all" />
                   </div>
                   <div className="col-span-1 md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-widest">ট্যাপের বিস্তারিত বর্ণনা</label>
                      <textarea value={editingCategory.description} onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 text-white text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 min-h-[140px] shadow-inner leading-relaxed transition-all" placeholder="এই ট্যাপটি সম্পর্কে বিস্তারিত লিখুন..." />
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="flex justify-between items-center border-b border-white/5 pb-6">
                      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3"><ListPlus className="w-5 h-5" /> আবশ্যক তথ্য কনফিগ (Required Info)</h4>
                      <button onClick={handleRequirementAdd} className="px-6 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95">+ ADD FIELD</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {editingCategory.requiredFields?.map((req) => (
                         <div key={req.id} className="bg-slate-950 p-8 rounded-[2rem] border border-slate-800 space-y-6 relative group hover:border-indigo-500/40 transition-all shadow-2xl ring-1 ring-white/5">
                            <button onClick={() => removeRequirement(req.id)} className="absolute top-6 right-6 text-rose-500 p-2 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Label Name</label>
                               <input type="text" value={req.label} onChange={(e) => updateRequirement(req.id, {label: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-xs font-bold shadow-inner focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="যেমন: পাসপোর্ট নম্বর" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Placeholder</label>
                                  <input type="text" value={req.placeholder} onChange={(e) => updateRequirement(req.id, {placeholder: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-[10px] shadow-inner" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Validation</label>
                                  <button onClick={() => updateRequirement(req.id, {required: !req.required})} className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-lg active:scale-95 ${req.required ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-600/30' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{req.required ? 'REQUIRED' : 'OPTIONAL'}</button>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Order Action Modal */}
      {orderAction && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 z-[3000]">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in duration-300 ring-1 ring-white/10">
             <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-5">
                   <div className={`p-4 rounded-2xl shadow-lg ${orderAction.type === 'CANCEL' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {orderAction.type === 'CANCEL' ? <ShieldAlert className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{orderAction.type === 'CANCEL' ? 'অর্ডার বাতিল করুন' : 'অর্ডার সফল করুন'}</h3>
                      <p className="text-xs text-slate-500 font-bold tracking-widest mt-1 uppercase">ORDER-ID: {orderAction.id}</p>
                   </div>
                </div>
                <button onClick={() => { setOrderAction(null); setPendingFiles([]); }} className="p-4 hover:bg-slate-800 rounded-3xl text-slate-500 transition-all active:scale-90"><X className="w-8 h-8" /></button>
             </div>
             <div className="space-y-8">
                {orderAction.type === 'CANCEL' ? (
                   <div className="space-y-4">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase px-3 tracking-[0.3em]">বাতিল করার কারণ: (বাধ্যতামূলক)</label>
                         <textarea id="order-cancel-reason" className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 text-white font-medium outline-none focus:ring-2 focus:ring-rose-500 min-h-[160px] shadow-inner leading-relaxed transition-all" placeholder="বাতিলের কারণ লিখুন..." />
                      </div>
                   </div>
                ) : (
                   <div className="space-y-6">
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl mb-4">
                         <p className="text-[10px] text-emerald-400 font-bold text-center uppercase tracking-widest flex items-center justify-center gap-2">
                            <AlertCircle className="w-3 h-3" /> সফল করতে ফাইল বা ডকুমেন্টস আপলোড বাধ্যতামূলক
                         </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <label className="cursor-pointer bg-slate-950 hover:bg-slate-800 border-2 border-dashed border-slate-800 rounded-[2rem] p-8 flex flex-col items-center gap-3 transition-all group shadow-inner ring-1 ring-white/5 active:scale-95">
                            <FileUp className="w-10 h-10 text-indigo-500 group-hover:scale-110 transition-all" />
                            <div className="text-center">
                               <span className="text-xs font-black text-white uppercase tracking-widest block mb-1">ডকুমেন্টস / ছবি</span>
                               <span className="text-[9px] text-slate-500 font-bold italic">ফাইল সিলেক্ট করুন</span>
                            </div>
                            <input type="file" multiple className="hidden" onChange={handleOrderFileSelect} />
                         </label>

                         <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-indigo-400 mb-1">
                               <FileText className="w-4 h-4" />
                               <span className="text-[10px] font-black uppercase tracking-widest">টেক্সট ফাইল তৈরি করুন</span>
                            </div>
                            <textarea 
                               id="admin-text-file-content"
                               className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-[11px] font-medium outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px] no-scrollbar"
                               placeholder="এখানে টেক্সট লিখুন..."
                            />
                            <button 
                               onClick={() => {
                                  const textarea = document.getElementById('admin-text-file-content') as HTMLTextAreaElement;
                                  const content = textarea?.value;
                                  if (!content) {
                                     toast.error("টেক্সট লিখুন");
                                     return;
                                  }
                                  const blob = new Blob([content], { type: 'text/plain' });
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                     const newFile: OrderFile = {
                                        name: `note_${Date.now()}.txt`,
                                        type: 'text/plain',
                                        data: reader.result as string,
                                        uploadedAt: Date.now()
                                     };
                                     setPendingFiles(prev => [...prev, newFile]);
                                     textarea.value = '';
                                     toast.success("টেক্সট ফাইল হিসেবে যুক্ত হয়েছে");
                                  };
                                  reader.readAsDataURL(blob);
                               }}
                               className="w-full py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                               ফাইল হিসেবে যুক্ত করুন
                            </button>
                         </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto no-scrollbar space-y-3 pr-2">
                        {pendingFiles.map((f, i) => (
                           <div key={i} className="flex justify-between items-center bg-slate-950/80 p-4 rounded-2xl border border-white/5 shadow-xl group">
                              <div className="flex items-center gap-3 min-w-0">
                                 <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                                 <span className="text-[11px] text-slate-300 truncate font-bold uppercase tracking-tighter">{f.name}</span>
                              </div>
                              <button onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all active:scale-90"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        ))}
                      </div>
                   </div>
                )}
                <button onClick={handleOrderSubmit} className={`w-full py-6 text-white font-black rounded-[2rem] shadow-2xl transition-all active:scale-95 text-xs uppercase tracking-[0.3em] ${orderAction.type === 'CANCEL' ? 'bg-rose-600 shadow-rose-600/30' : 'bg-emerald-600 shadow-emerald-600/30'}`}>
                   {orderAction.type === 'CANCEL' ? 'বাতিল ও রিফান্ড নিশ্চিত করুন' : 'সাবমিট ও ডেলিভার করুন'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Recharges Correcting Modal */}
      {correctingRecharge && (
         <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 z-[2000]">
            <div className="bg-slate-900 border border-slate-800 w-full max-md rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-300 ring-1 ring-white/10">
               <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4"><RefreshCw className="w-8 h-8 text-indigo-400" /> রিচার্জ সংশোধন</h3>
               <div className="space-y-8">
                  <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                     <p className="text-[11px] text-amber-200/80 leading-relaxed font-bold italic text-center">
                        রিচার্জ এমাউন্ট ভুল হলে এখানে সঠিক এমাউন্ট প্রদান করুন। গ্রাহকের ব্যালেন্স এবং লেজার স্বয়ংক্রিয়ভাবে এডজাস্ট হবে।
                     </p>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase px-2 tracking-widest">সঠিক ডিপোজিট এমাউন্ট (৳)</label>
                     <input type="number" value={correctingRecharge.amount} onChange={(e) => setCorrectingRecharge({...correctingRecharge, amount: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-black text-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-all text-center" />
                  </div>
                  <div className="pt-6 flex flex-col gap-3">
                     <button onClick={() => { onCorrectRecharge(correctingRecharge.id, correctingRecharge.amount); setCorrectingRecharge(null); }} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 text-xs uppercase tracking-widest active:scale-95">Update Balance</button>
                     <button onClick={() => setCorrectingRecharge(null)} className="w-full py-5 bg-slate-800 text-slate-400 font-bold rounded-2xl hover:text-white transition-all text-xs uppercase tracking-widest">বাতিল</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Viewing Files Modal */}
      {viewingFiles && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 z-[5000] animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-800 flex flex-col max-h-[90vh] ring-1 ring-white/10">
            <div className="px-10 py-8 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight leading-none uppercase">
                   <ImageIcon className="w-8 h-8 text-indigo-500" /> Delivered Assets
                 </h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Order ID: {viewingFiles.id}</p>
              </div>
              <button onClick={() => setViewingFiles(null)} className="p-4 hover:bg-slate-800 rounded-3xl text-slate-500 transition-all active:scale-90">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
              <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-white/5 text-sm text-slate-400 italic leading-relaxed shadow-inner">
                "{viewingFiles.comment || "ডেলিভারি সফল হয়েছে।"}"
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {viewingFiles.files?.map((file, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 hover:border-indigo-500/50 transition-all group overflow-hidden relative">
                    <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      {file.type.startsWith('image/') ? (
                        <img src={file.data} className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="w-12 h-12 text-slate-700" />
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{file.type.split('/')[1]} Document</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center px-2">
                      <div className="min-w-0 flex-1">
                         <span className="text-[10px] font-black text-slate-600 truncate uppercase tracking-widest block mb-1">Asset Name</span>
                         <span className="text-xs font-black text-white truncate block">{file.name}</span>
                      </div>
                      <a 
                        href={file.data} 
                        download={file.name}
                        className="inline-flex items-center justify-center rounded-xl h-11 px-5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 shrink-0"
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

export default AdminDashboard;
