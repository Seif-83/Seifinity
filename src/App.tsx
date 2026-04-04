import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Zap, 
  ChevronRight,
  MessageSquare,
  Wrench,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Ban,
  Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot, limit, Timestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import { cn } from './lib/utils';
import { useAuth } from './auth/AuthContext';
import Dashboard from './components/Dashboard';
import Reviews from './components/Reviews';
import AdminUsers from './components/AdminUsers';
import Login from './components/Login';
import Teachers from './components/Teachers';
import SettingsPage from './components/Settings';
import Analytics from './components/Analytics';

export default function App() {
  const { user, userData, loading, isAdmin, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scrolled, setScrolled] = useState(false);
  const [realNotifications, setRealNotifications] = useState<any[]>([]);
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealNotifications(notes);
      if (notes.length > 0) setHasUnseenNotifications(true);
    });

    return () => unsubscribe();
  }, []);

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString('en-GB');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 p-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Initializing Interface...</p>
      </div>
    );
  }

  if (userData?.restricted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="glass max-w-md w-full p-10 rounded-[2.5rem] border border-rose-500/20 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
           <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
              <Ban className="w-10 h-10 text-rose-500" />
           </div>
           <h1 className="text-3xl font-display font-bold mb-4">Access Restricted</h1>
           <p className="text-white/60 text-sm leading-relaxed mb-8">
              Your account has been restricted by the system administrator. 
              You can no longer access the Seifinity platform features.
           </p>
           <button 
              onClick={logout}
              className="w-full py-4 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
           >
              <LogOut className="w-4 h-4" /> Sign Out
           </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const notificationsData = realNotifications.length > 0 ? realNotifications : [
    { id: '1', text: 'Nafham updated their curriculum', type: 'update', createdAt: new Date(Date.now() - 120000) },
    { id: '2', text: 'New review received for Abwab', type: 'review', createdAt: new Date(Date.now() - 3600000) },
    { id: '3', text: 'System maintenance scheduled', type: 'system', createdAt: new Date(Date.now() - 18000000) },
  ];

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Control Center' },
    { id: 'teachers', icon: Users, label: 'Teachers' },
    { id: 'reviews', icon: MessageSquare, label: 'Reviews' },
    ...(isAdmin ? [{ id: 'analytics', icon: Zap, label: 'Analytics' }] : []),
    ...(isAdmin ? [{ id: 'users', icon: ShieldCheck, label: 'User Admin' }] : []),
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'reviews':
        return <Reviews />;
      case 'teachers':
        return <Teachers />;
      case 'settings':
        return <SettingsPage />;
      case 'analytics':
        return <Analytics />;
      case 'users':
        return isAdmin ? <AdminUsers /> : <Dashboard setActiveTab={setActiveTab} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-10 md:p-20 text-white/50 space-y-4 text-center">
            <Wrench className="w-12 h-12 md:w-16 md:h-16 text-cyan-500/50" />
            <h2 className="text-xl md:text-2xl font-display font-medium text-white">Coming Soon</h2>
            <p className="max-w-xs md:max-w-none text-sm md:text-base">The {activeTab} module is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 circuit-bg opacity-20" />
      </div>

      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full glass z-50 hidden lg:flex flex-col transition-all duration-500 ease-in-out border-r border-white/5",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/Seifinity.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display font-bold text-xl tracking-tight whitespace-nowrap"
            >
              Seifinity
            </motion.span>
          )}
        </div>

        <nav className="mt-8 px-4 space-y-2 flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-white/10 text-cyan-400 shadow-inner shadow-white/5" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", activeTab === item.id ? "text-cyan-400" : "group-hover:text-white")} />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-sm"
                >
                  {item.label}
                </motion.span>
              )}
              {activeTab === item.id && isSidebarOpen && (
                <motion.div 
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-2">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 transition-all group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
          <button 
            onClick={() => window.open('https://www.instagram.com/seifinity?igsh=MXI2aTI3dHdoYmpwNw%3D%3D&utm_source=qr', '_blank')}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-white/50 hover:text-pink-500 hover:bg-pink-500/5 transition-all group"
          >
            <Instagram className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="text-sm font-medium">Instagram</span>}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            {isSidebarOpen ? <ChevronRight className="w-5 h-5 rotate-180" /> : <ChevronRight className="w-5 h-5" />}
            {isSidebarOpen && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] glass z-[70] lg:hidden flex flex-col border-r border-white/10"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden">
                    <img src="/Seifinity.jpg" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-display font-bold text-xl tracking-tight">Seifinity</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <nav className="mt-6 px-4 space-y-2 flex-grow">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                      activeTab === item.id 
                        ? "bg-white/10 text-cyan-400" 
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-white/5">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-500 ease-in-out min-h-screen flex flex-col",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>

        {/* Header */}
        <header className={cn(
          "sticky top-0 z-40 px-4 md:px-8 py-4 flex items-center justify-between transition-all duration-300",
          scrolled ? "glass border-b border-white/5 py-3" : "bg-transparent"
        )}>
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-white/60"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-display font-medium text-white/90">
              {menuItems.find(m => m.id === activeTab)?.label || 'System'}
            </h1>
            <div className="hidden sm:block h-4 w-[1px] bg-white/10" />
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/40 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM OPERATIONAL
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all w-48 md:w-64"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setHasUnseenNotifications(false);
                }}
                className={cn(
                  "relative p-2 rounded-full transition-colors",
                  isNotificationsOpen ? "bg-white/10 text-cyan-400" : "hover:bg-white/5 text-white/60"
                )}
              >
                <Bell className="w-5 h-5" />
                {hasUnseenNotifications && notificationsData.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#050505]" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 glass border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        <span className="text-[10px] bg-cyan-500 text-black font-bold px-1.5 py-0.5 rounded">
                          {notificationsData.length} {notificationsData.length === 1 ? 'NEW' : 'NEW'}
                        </span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notificationsData.map((n) => (
                          <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                            <p className="text-xs text-white/80 mb-1 group-hover:text-white">{n.text}</p>
                            <p className="text-[10px] text-white/40">{formatRelativeTime(n.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center bg-white/2">
                        <button 
                          onClick={() => { setActiveTab('analytics'); setIsNotificationsOpen(false); }}
                          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
                        >
                          View All Systems
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium truncate max-w-[100px]">{userData?.displayName || user.displayName || 'User'}</p>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{isAdmin ? 'Administrator' : 'Platform User'}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/${userData?.avatar?.style || 'avataaars'}/svg?seed=${userData?.avatar?.seed || userData?.displayName || user.displayName || 'User'}`} alt="User" />
                </div>
              </div>
            </div>
          </div>
        </header>


        {/* Dynamic Content */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-grow">
          {renderContent()}
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/5 p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-md">
              <img src="/Seifinity.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-lg">Seifinity</span>
          </div>
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest">
            &copy; 2026 Seifinity Technologies. All Rights Reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
