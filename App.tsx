
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, Order, RechargeRequest, Category, OrderStatus, ActivityLog, Transaction, NewsItem, DeviceDetails, OrderFile, SystemConfig } from './types';
import { INITIAL_CATEGORIES, MOCK_USER } from './constants';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { toast, Toaster } from 'react-hot-toast';
import { Hammer, Info } from 'lucide-react';

const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 Minutes in milliseconds

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonating, setImpersonating] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('omni_system_config');
    return saved ? JSON.parse(saved) : {
      siteName: 'OmniWallet',
      siteTagline: 'আপনার নিরাপদ ডিজিটাল পেমেন্ট পার্টনার',
      supportEmail: 'support@omniwallet.com',
      maintenanceMessage: 'আমাদের সিস্টেম বর্তমানে আপগ্রেড করা হচ্ছে। সাময়িক অসুবিধার জন্য আমরা দুঃখিত।',
      paymentMethods: [
        { id: '1', name: 'Bkash', number: '017XXXXXXXX', instruction: 'Send Money করুন', isActive: true },
        { id: '2', name: 'Nagad', number: '018XXXXXXXX', instruction: 'Cash Out করুন', isActive: true }
      ],
      minRecharge: 50,
      maxRecharge: 20000,
      fraudThreshold: 5000,
      isMaintenanceMode: false,
      isRegistrationEnabled: true,
      currencySymbol: '৳'
    };
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('omni_categories');
    const loaded = saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    return loaded.map((c: any) => ({
      ...c,
      requiredFields: c.requiredFields || [],
      icon: c.icon || 'Package'
    }));
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('omni_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>(() => {
    const saved = localStorage.getItem('omni_recharges');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('omni_users');
    const initialUsers = [
      { 
        ...MOCK_USER, 
        username: 'johndoe',
        password: 'password123',
        dob: '1995-01-01',
        mobile: '01700000000',
        failedLoginAttempts: 0,
        autoBlockedUntil: null,
        deviceDetails: {
          ip: '103.147.218.45',
          deviceName: 'iPhone 15 Pro Max',
          imei: '356821094857231',
          location: { lat: 23.8103, lng: 90.4125, address: 'Dhaka, Bangladesh' },
          network: { type: 'wifi', downlink: 45, effectiveType: '4g' },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
        }
      },
      {
        id: 'U-ADMIN-01',
        name: 'Admin Rakibul',
        username: 'rakibul02',
        email: 'rakibul02122003@gmail.com',
        password: '02122003@',
        walletBalance: 0,
        role: UserRole.ADMIN,
        isBlocked: false,
        twoFactorEnabled: true,
        emailVerified: true,
        createdAt: Date.now(),
      }
    ];
    return saved ? JSON.parse(saved) : initialUsers;
  });
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('omni_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('omni_txs');
    return saved ? JSON.parse(saved) : [];
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('omni_news');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Welcome to OmniWallet', content: 'Explore our digital services and order today!', timestamp: Date.now(), isActive: true }
    ];
  });

  const [botConfig, setBotConfig] = useState(() => {
    const saved = localStorage.getItem('omni_bot_config');
    return saved ? JSON.parse(saved) : { token: '', chatId: '' };
  });

  useEffect(() => {
    const savedSessionId = localStorage.getItem('omni_session_user_id');
    if (savedSessionId) {
      const foundUser = users.find(u => u.id === savedSessionId);
      if (foundUser) {
        setCurrentUser(foundUser);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('omni_session_user_id', currentUser.id);
    } else {
      localStorage.removeItem('omni_session_user_id');
    }
  }, [currentUser]);

  useEffect(() => {
    const resetTimer = () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (currentUser) {
        logoutTimerRef.current = setTimeout(() => {
          logout();
          toast.error("নিষ্ক্রিয়তার কারণে আপনাকে লগআউট করা হয়েছে।");
        }, INACTIVITY_LIMIT);
      }
    };

    if (currentUser) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('scroll', resetTimer);
      resetTimer();
    }

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('omni_system_config', JSON.stringify(systemConfig));
    localStorage.setItem('omni_categories', JSON.stringify(categories));
    localStorage.setItem('omni_orders', JSON.stringify(orders));
    localStorage.setItem('omni_recharges', JSON.stringify(rechargeRequests));
    localStorage.setItem('omni_users', JSON.stringify(users));
    localStorage.setItem('omni_logs', JSON.stringify(activityLogs));
    localStorage.setItem('omni_txs', JSON.stringify(transactions));
    localStorage.setItem('omni_news', JSON.stringify(news));
    localStorage.setItem('omni_bot_config', JSON.stringify(botConfig));
    document.title = `${systemConfig.siteName || 'OmniWallet'} | Digital Solutions`;
  }, [systemConfig, categories, orders, rechargeRequests, users, activityLogs, transactions, news, botConfig]);

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Sound blocked by browser', e));
    }
  };

  const logActivity = (userId: string, action: string, details?: string) => {
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      action,
      timestamp: Date.now(),
      details
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const getForensicDetails = async (): Promise<DeviceDetails> => {
    let ip = '103.x.x.x';
    try {
       const res = await fetch('https://api.ipify.org?format=json');
       const data = await res.json();
       ip = data.ip;
    } catch(e) {}
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return {
      ip,
      deviceName: navigator.platform + ' Device',
      imei: Math.floor(Math.random() * 1000000000000000).toString(), 
      location: { lat: 23.6850, lng: 90.3563, address: 'Approx. Bangladesh' },
      network: { type: connection?.type || 'unknown', downlink: connection?.downlink || 0, effectiveType: connection?.effectiveType || 'unknown' },
      userAgent: navigator.userAgent
    };
  };

  const handleLogin = async (identifier: string, password?: string) => {
    const userIdx = users.findIndex(u => (u.email.toLowerCase() === identifier.toLowerCase() || u.username?.toLowerCase() === identifier.toLowerCase()));
    if (userIdx === -1) { toast.error("সঠিক ইমেইল/ইউজারনেম দিন।"); return; }
    const foundUser = users[userIdx];
    
    if (foundUser.autoBlockedUntil && foundUser.autoBlockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((foundUser.autoBlockedUntil - Date.now()) / 60000);
      toast.error(`অতিরিক্ত ভুল পাসওয়ার্ডের কারণে আপনার অ্যাকাউন্টটি ${minutesLeft} মিনিটের জন্য ব্লক করা হয়েছে।`);
      return;
    }

    // Role-based Access Control: Admin bypass
    const isAdminBypass = !password && foundUser.role === UserRole.ADMIN;
    const isRegularMatch = password && foundUser.password === password;

    if (isAdminBypass || isRegularMatch) {
      const forensic = await getForensicDetails();
      const updatedUser = { ...foundUser, deviceDetails: forensic, failedLoginAttempts: 0, autoBlockedUntil: null };
      setUsers(prev => prev.map((u, i) => i === userIdx ? updatedUser : u));
      if (foundUser.isBlocked) { toast.error("আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে।"); }
      setCurrentUser(updatedUser);
      logActivity(foundUser.id, isAdminBypass ? 'Admin Authorized Access' : 'Logged in', `IP: ${forensic.ip}`);
      toast.success(isAdminBypass ? `Administrator Authorized: ${foundUser.name}` : `স্বাগতম, ${foundUser.name}!`);
    } else {
      const newAttempts = (foundUser.failedLoginAttempts || 0) + 1;
      let blockUntil = foundUser.autoBlockedUntil;
      if (newAttempts >= 5) {
        blockUntil = Date.now() + 30 * 60 * 1000;
        toast.error("৫ বার ভুল পাসওয়ার্ড দেওয়ায় অ্যাকাউন্ট ব্লক করা হয়েছে।");
        logActivity(foundUser.id, 'Security Auto-Block', '5 failed attempts');
      } else {
        toast.error(password ? `ভুল পাসওয়ার্ড! আপনার ${5 - newAttempts} বার সুযোগ আছে।` : "এই অ্যাকাউন্টের জন্য পাসওয়ার্ড প্রয়োজন।");
      }
      setUsers(prev => prev.map((u, i) => i === userIdx ? { ...u, failedLoginAttempts: newAttempts, autoBlockedUntil: blockUntil } : u));
    }
  };

  const handleSignUp = async (userData: Partial<User>): Promise<boolean | undefined> => {
    if (!systemConfig.isRegistrationEnabled) { toast.error("বর্তমানে নতুন রেজিস্ট্রেশন বন্ধ আছে।"); return; }
    const emailExists = users.some(u => u.email.toLowerCase() === userData.email?.toLowerCase());
    const userExists = users.some(u => u.username?.toLowerCase() === userData.username?.toLowerCase());
    if (emailExists) { toast.error("এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে।"); return; }
    if (userExists) { toast.error("এই ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হচ্ছে।"); return; }
    const forensic = await getForensicDetails();
    const newUser: User = {
      id: `U-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${userData.firstName} ${userData.lastName}`,
      firstName: userData.firstName, lastName: userData.lastName, mobile: userData.mobile, username: userData.username,
      email: userData.email || '', password: userData.password, dob: userData.dob, nid: userData.nid,
      walletBalance: 0, role: UserRole.USER, isBlocked: false, failedLoginAttempts: 0, autoBlockedUntil: null,
      twoFactorEnabled: false, emailVerified: false, createdAt: Date.now(), deviceDetails: forensic
    };
    setUsers(prev => [...prev, newUser]);
    logActivity(newUser.id, 'Account Registered', `Device: ${forensic.deviceName}`);
    toast.success("রেজিস্ট্রেশন সফল হয়েছে!");
    return true;
  };

  const handleResetPassword = (identifier: string, dob: string, mobile: string, newPassword: string) => {
    const foundIdx = users.findIndex(u => (u.email.toLowerCase() === identifier.toLowerCase() || u.username?.toLowerCase() === identifier.toLowerCase()) && u.dob === dob && u.mobile === mobile);
    if (foundIdx === -1) { toast.error("ভুল তথ্য প্রদান করেছেন।"); return false; }
    setUsers(prev => prev.map((u, i) => i === foundIdx ? { ...u, password: newPassword, failedLoginAttempts: 0, autoBlockedUntil: null } : u));
    logActivity(users[foundIdx].id, 'Password Reset Success');
    toast.success("পাসওয়ার্ড পরিবর্তন সফল!");
    return true;
  };

  const logout = () => {
    if (impersonating) {
      const admin = users.find(u => u.role === UserRole.ADMIN);
      setCurrentUser(admin || null);
      setImpersonating(false);
      toast.success("এডমিন মোডে ফিরে আসা হয়েছে");
      return;
    }
    setCurrentUser(null);
    localStorage.removeItem('omni_session_user_id');
  };

  const takeAccess = (userId: string) => {
    const userToAccess = users.find(u => u.id === userId);
    if (userToAccess) {
      setCurrentUser(userToAccess);
      setImpersonating(true);
      toast.success(`${userToAccess.name} একাউন্ট এক্সেস নেয়া হয়েছে`);
    }
  };

  const handleUpdateUserInfo = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) { setCurrentUser(prev => prev ? { ...prev, ...updates } : null); }
    toast.success("তথ্য আপডেট করা হয়েছে");
  };

  const placeOrder = (categoryId: string, userInputData: Record<string, string>, userFiles?: OrderFile[]) => {
    if (!currentUser) return;
    if (currentUser.isBlocked) { toast.error("আপনার অ্যাকাউন্ট ব্লক করা হয়েছে।"); return; }
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    if (currentUser.walletBalance < category.price) { toast.error("পর্যাপ্ত ব্যালেন্স নেই!"); return; }
    const newOrder: Order = { 
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, 
      userId: currentUser.id, 
      categoryId, 
      amount: category.price, 
      status: OrderStatus.PENDING, 
      comment: 'অর্ডার পেন্ডিং', 
      createdAt: Date.now(), 
      userInputData,
      userFiles
    };
    setOrders(prev => [newOrder, ...prev]);
    updateUserBalance(currentUser.id, -category.price);
    const newTx: Transaction = { id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, userId: currentUser.id, amount: category.price, type: 'DEBIT', description: `${category.name} পেমেন্ট`, timestamp: Date.now() };
    setTransactions(prev => [newTx, ...prev]);
    logActivity(currentUser.id, `Placed order ${newOrder.id}`);
    playNotificationSound();
    toast.success("অর্ডার সফল হয়েছে!");
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, comment: string, files?: OrderFile[]) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (status === OrderStatus.CANCELLED && o.status !== OrderStatus.CANCELLED) {
          updateUserBalance(o.userId, o.amount);
          const newTx: Transaction = { id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, userId: o.userId, amount: o.amount, type: 'CREDIT', description: `অর্ডার ${o.id} রিফান্ড`, timestamp: Date.now() };
          setTransactions(prev => [newTx, ...prev]);
        }
        return { ...o, status, comment: comment || o.comment, files: files || o.files, approvalTimestamp: status === OrderStatus.APPROVED ? Date.now() : o.approvalTimestamp };
      }
      return o;
    }));
    playNotificationSound();
  };

  const updateUserBalance = (userId: string, delta: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, walletBalance: Number((u.walletBalance + delta).toFixed(2)) };
        if (currentUser?.id === userId) setCurrentUser(updated);
        return updated;
      }
      return u;
    }));
  };

  const requestRecharge = (amount: number, method: string, transactionId: string) => {
    if (!currentUser) return;
    if (currentUser.isBlocked) { toast.error("আপনার অ্যাকাউন্ট ব্লক করা হয়েছে।"); return; }
    const request: RechargeRequest = { id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`, userId: currentUser.id, amount, method, transactionId: transactionId.trim(), status: 'PENDING', isFraudSuspected: amount >= systemConfig.fraudThreshold, createdAt: Date.now() };
    setRechargeRequests(prev => [request, ...prev]);
    logActivity(currentUser.id, `Requested Recharge: ${systemConfig.currencySymbol}${amount}`);
    playNotificationSound();
    toast.success("অনুরোধ পাঠানো হয়েছে!");
  };

  const approveRecharge = (requestId: string) => {
    const req = rechargeRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'PENDING') return;
    setRechargeRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED', processedAt: Date.now() } : r));
    updateUserBalance(req.userId, req.amount);
    const newTx: Transaction = { id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, userId: req.userId, amount: req.amount, type: 'CREDIT', description: `রিচার্জ অনুমোদন`, timestamp: Date.now() };
    setTransactions(prev => [newTx, ...prev]);
    logActivity(req.userId, `Recharge Approved`);
    playNotificationSound();
  };

  const correctRechargeAmount = (requestId: string, newAmount: number) => {
    const req = rechargeRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'APPROVED') return;
    const oldAmount = req.amount;
    const delta = newAmount - oldAmount;
    setRechargeRequests(prev => prev.map(r => r.id === requestId ? { ...r, amount: newAmount, originalAmount: oldAmount } : r));
    updateUserBalance(req.userId, delta);
    const newTx: Transaction = { id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, userId: req.userId, amount: Math.abs(delta), type: delta >= 0 ? 'CREDIT' : 'DEBIT', description: `রিচার্জ সংশোধন`, timestamp: Date.now() };
    setTransactions(prev => [newTx, ...prev]);
    toast.success("এমাউন্ট সংশোধন করা হয়েছে");
  };

  const handleUpdateSystemConfig = (newConfig: SystemConfig) => {
    setSystemConfig(newConfig);
    toast.success("সিস্টেম কনফিগারেশন আপডেট করা হয়েছে");
  };

  // RBAC GATING LOGIC
  const isMaintenanceActive = systemConfig.isMaintenanceMode && (!currentUser || currentUser.role !== UserRole.ADMIN);

  // STRICT ROUTING DEFINITION
  const renderPanel = () => {
    if (isMaintenanceActive) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-inner ring-4 ring-amber-500/5">
              <Hammer className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Under Maintenance</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">{systemConfig.maintenanceMessage}</p>
            <div className="flex flex-col gap-4">
               <button onClick={logout} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all">Log Out</button>
               <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                  <Info className="w-3.5 h-3.5" /> Administrator Access Required
               </div>
            </div>
          </div>
        </div>
      );
    }

    if (!currentUser) {
      return <Login onLogin={handleLogin} onSignUp={handleSignUp} onResetPassword={handleResetPassword} systemConfig={systemConfig} />;
    }

    // STRICT ROLE CHECK: Only Admin role can access AdminDashboard
    if (currentUser.role === UserRole.ADMIN && !impersonating) {
      return (
        <AdminDashboard 
          user={currentUser} users={users} orders={orders} recharges={rechargeRequests} categories={categories}
          logs={activityLogs} transactions={transactions} news={news} systemConfig={systemConfig}
          onUpdateSystemConfig={handleUpdateSystemConfig} onLogout={logout} onUpdateOrder={updateOrderStatus}
          onApproveRecharge={approveRecharge} onCorrectRecharge={correctRechargeAmount} 
          onRejectRecharge={(id) => setRechargeRequests(prev => prev.map(r => r.id === id ? {...r, status: 'REJECTED'} : r))}
          onBlockUser={(id) => setUsers(prev => prev.map(u => u.id === id ? {...u, isBlocked: !u.isBlocked, failedLoginAttempts: 0, autoBlockedUntil: null} : u))}
          onManageCategory={(cat) => setCategories(prev => prev.some(c => c.id === cat.id) ? prev.map(c => c.id === cat.id ? cat : c) : [...prev, cat])}
          onManageNews={(item) => setNews(prev => prev.some(n => n.id === item.id) ? prev.map(n => n.id === item.id ? item : n) : [item, ...prev])}
          onDeleteNews={(id) => setNews(prev => prev.filter(n => n.id !== id))}
          botConfig={botConfig} onUpdateBotConfig={setBotConfig} onTakeAccess={takeAccess}
          onCreateUser={(newUser) => setUsers(prev => [...prev, newUser])} onUpdateUserInfo={handleUpdateUserInfo}
        />
      );
    }

    // DEFAULT ROUTE: All other users (Role.USER or Impersonated Admin) go to UserDashboard
    return (
      <UserDashboard 
        user={currentUser} categories={categories} orders={orders.filter(o => o.userId === currentUser.id)}
        transactions={transactions.filter(t => t.userId === currentUser.id)} news={news.filter(n => n.isActive)}
        rechargeRequests={rechargeRequests.filter(r => r.userId === currentUser.id)}
        systemConfig={systemConfig} activityLogs={activityLogs} onLogout={logout} onPlaceOrder={placeOrder}
        onUpdateUserComment={() => {}} onRequestRecharge={requestRecharge} isImpersonating={impersonating}
        onUpdateUserInfo={handleUpdateUserInfo} onLogActivity={(action, details) => logActivity(currentUser.id, action, details)}
      />
    );
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      {renderPanel()}
    </div>
  );
};

export default App;
