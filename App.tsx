

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
      comment-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, userId: req.userId, amount: Math.abs(delta), type: delta >= 0 ? 'CREDIT' : 'DEBIT', description: `রিচার্জ সংশোধন`, timestamp: Date.now() };
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
