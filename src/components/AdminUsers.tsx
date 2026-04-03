import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, updateDoc, doc, deleteDoc, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Mail, Calendar, Shield, Search, Loader2, Send, Zap, X, Ban, CheckCircle2, Info, Activity, UserPlus, UserMinus, Trash2, Clock, Megaphone, AlertCircle, ChevronRight, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  restricted?: boolean;
  avatar?: {
    style: string;
    seed: string;
  };
}

const SUPER_ADMIN_EMAIL = 'seifamrmohsen2005@gmail.com';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('update');
  const [sending, setSending] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        text: noteText,
        type: noteType,
        createdAt: serverTimestamp()
      });
      setNoteText('');
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    // Users Listener
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(qUsers, (querySnapshot) => {
      const usersList: UserData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({ ...data, uid: doc.id } as UserData);
      });
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    // Notifications (Broadcasts) Listener
    const qNotes = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(15));
    const unsubscribeNotes = onSnapshot(qNotes, (snapshot) => {
      setBroadcasts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeUsers();
      unsubscribeNotes();
    };
  }, []);

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleRestrict = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        restricted: !currentStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error toggling restriction:", error);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (userId === auth.currentUser?.uid) return; // Prevent self-demotion
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: currentRole === 'admin' ? 'user' : 'admin',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error toggling role:", error);
    }
  };

  const handleRemoveFromPlatform = async (userId: string) => {
    if (userId === auth.currentUser?.uid) return; // Prevent self-removal
    if (!window.confirm("Are you sure you want to remove this user from the platform? This will delete their profile and data, but their login account must be deleted from the Firebase Console for safety.")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      if (selectedUser?.uid === userId) setSelectedUser(null);
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Decrypting User Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Broadcast Section */}
      <section className="glass p-8 rounded-3xl border border-cyan-500/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-24 h-24 text-cyan-500" />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <Megaphone className="w-5 h-5 text-cyan-400" /> Broadcast System Alert
            </h3>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Type a global notification message..." 
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-cyan-500/50 transition-all font-medium placeholder:text-white/20"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 relative group">
                  <select 
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white/80 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer font-bold uppercase tracking-wider"
                  >
                    <option value="update" className="bg-[#0b0c10]">Update Alert</option>
                    <option value="review" className="bg-[#0b0c10]">Review Posted</option>
                    <option value="system" className="bg-[#0b0c10]">System Maintenance</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={sending || !noteText.trim()}
                  className="px-10 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-tighter text-xs rounded-2xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Push</>}
                </button>
              </div>
            </form>
          </div>

          <div className="border-l border-white/5 pl-0 lg:pl-12">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 mb-6 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Recent Sent Alerts
            </h4>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {broadcasts.length === 0 ? (
                <div className="py-8 text-center bg-white/2 rounded-2xl border border-dashed border-white/5">
                   <AlertCircle className="w-5 h-5 text-white/10 mx-auto mb-2" />
                   <p className="text-[10px] text-white/20 uppercase font-bold">No broadcast history</p>
                </div>
              ) : (
                broadcasts.map((b) => (
                  <motion.div 
                    layout
                    key={b.id} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      b.type === 'system' ? 'bg-rose-500/10 text-rose-500' : 'bg-cyan-500/10 text-cyan-500'
                    )}>
                      {b.type === 'update' ? <Zap className="w-4 h-4" /> : b.type === 'review' ? <MessageSquare className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs text-white/80 font-medium truncate">{b.text}</p>
                      <p className="text-[9px] text-white/20 font-bold uppercase mt-0.5">
                        {b.type} • {new Date(b.createdAt?.toDate?.() || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteNotification(b.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-rose-500/40 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">Platform Users</h2>
          <p className="text-white/60 text-sm">Manage and view all registered accounts on Seifinity.</p>
        </div>
        <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-white/5 focus-within:border-cyan-500/50 transition-colors">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent py-2.5 pl-12 pr-6 text-sm focus:outline-none w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user, i) => (
          <motion.div 
            key={user.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={cn(
                "w-12 h-12 rounded-xl p-[1px] relative",
                user.restricted ? "bg-rose-500/50" : "bg-gradient-to-br from-cyan-500 to-blue-500"
              )}>
                <div className="w-full h-full rounded-xl bg-[#050505] flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/${user.avatar?.style || 'avataaars'}/svg?seed=${user.avatar?.seed || user.displayName}`} 
                    alt="Avatar" 
                    className={cn(user.restricted && "grayscale opacity-50")}
                  />
                </div>
                {user.restricted && (
                  <div className="absolute -top-1 -right-1 bg-rose-500 rounded-full p-0.5 border-2 border-[#050505]">
                    <Ban className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white truncate">{user.displayName}</h4>
                  {user.restricted && (
                    <span className="bg-rose-500/20 text-rose-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-rose-500/20">
                      Restricted
                    </span>
                  )}
                </div>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1",
                  user.email === SUPER_ADMIN_EMAIL ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                  user.role === 'admin' ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-white/5 text-white/40 border border-white/10"
                )}>
                  {user.email === SUPER_ADMIN_EMAIL ? <Shield className="w-2.5 h-2.5" /> : 
                   user.role === 'admin' ? <Shield className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
                  {user.email === SUPER_ADMIN_EMAIL ? 'Super Admin' : user.role}
                </div>
                {user.uid !== auth.currentUser?.uid && user.email !== SUPER_ADMIN_EMAIL && (
                  <button 
                    onClick={() => handleToggleRole(user.uid, user.role)}
                    className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-all border border-cyan-500/10"
                    title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                  >
                    {user.role === 'admin' ? <UserMinus className="w-2.5 h-2.5" /> : <UserPlus className="w-2.5 h-2.5" />}
                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-white/50">
                <Mail className="w-3.5 h-3.5 text-white/20" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/50">
                <Calendar className="w-3.5 h-3.5 text-white/20" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
              <button 
                onClick={() => setSelectedUser(user)}
                className="flex-1 py-3 text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 rounded-xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Info className="w-3 h-3" /> View Profile
              </button>
              <button 
                onClick={() => handleRestrict(user.uid, !!user.restricted)}
                disabled={user.email === SUPER_ADMIN_EMAIL}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all flex items-center justify-center gap-2",
                  user.restricted 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20",
                  user.email === SUPER_ADMIN_EMAIL && "opacity-20 cursor-not-allowed"
                )}
              >
                {user.restricted ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                {user.restricted ? 'Unrestrict' : 'Restrict'}
              </button>
              <button 
                onClick={() => handleRemoveFromPlatform(user.uid)}
                disabled={user.email === SUPER_ADMIN_EMAIL}
                className={cn(
                  "p-3 bg-rose-500/5 text-rose-500/40 rounded-xl border border-transparent hover:border-rose-500/20 hover:text-rose-500 transition-all flex items-center justify-center",
                  user.email === SUPER_ADMIN_EMAIL && "opacity-20 cursor-not-allowed"
                )}
                title={user.email === SUPER_ADMIN_EMAIL ? "Super Admin cannot be removed" : "Remove from Platform"}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass border border-white/10 rounded-3xl overflow-hidden overflow-y-auto max-h-[90vh]"
            >
              <div className="h-24 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-white/5 relative">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-white/60 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="px-8 pb-8 -mt-12">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl bg-[#050505] border-4 border-[#050505] shadow-2xl overflow-hidden mb-4">
                    <img src={`https://api.dicebear.com/7.x/${selectedUser.avatar?.style || 'avataaars'}/svg?seed=${selectedUser.avatar?.seed || selectedUser.displayName}`} alt="Avatar" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedUser.displayName}</h3>
                  <p className={cn(
                    "text-sm font-mono uppercase tracking-widest",
                    selectedUser.email === SUPER_ADMIN_EMAIL ? "text-amber-500" : "text-white/40"
                  )}>
                    {selectedUser.email === SUPER_ADMIN_EMAIL ? 'Super Admin' : selectedUser.role}
                  </p>
                  
                  {selectedUser.restricted && (
                    <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 text-[10px] font-black uppercase tracking-tighter">
                      <Ban className="w-3 h-3" /> Account Restricted
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/20 mb-1">Email Address</p>
                    <p className="text-sm font-medium text-white/80 flex items-center gap-2">
                       <Mail className="w-4 h-4 text-cyan-500/40" /> {selectedUser.email}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase font-bold text-white/20 mb-1">Account Created</p>
                    <p className="text-sm font-medium text-white/80 flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-cyan-500/40" /> {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/5">
                   <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                      <Activity className="w-3 h-3 text-cyan-400" /> Platform Statistics
                   </h4>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <p className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">0</p>
                         <p className="text-[10px] uppercase font-bold text-white/20">Reviews Posted</p>
                      </div>
                      <div>
                         <p className="text-2xl font-bold text-white">0%</p>
                         <p className="text-[10px] uppercase font-bold text-white/20">Activity Score</p>
                      </div>
                   </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleRestrict(selectedUser.uid, !!selectedUser.restricted)}
                      disabled={selectedUser.email === SUPER_ADMIN_EMAIL}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                        selectedUser.restricted 
                          ? "bg-emerald-500 text-black hover:bg-emerald-400" 
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20",
                        selectedUser.email === SUPER_ADMIN_EMAIL && "opacity-20 cursor-not-allowed"
                      )}
                    >
                      {selectedUser.restricted ? 'Lift Restriction' : 'Restrict Account'}
                    </button>
                    {selectedUser.uid !== auth.currentUser?.uid && selectedUser.email !== SUPER_ADMIN_EMAIL && (
                      <button 
                        onClick={() => handleToggleRole(selectedUser.uid, selectedUser.role)}
                        className="flex-1 py-4 bg-cyan-500/10 text-cyan-500 font-bold rounded-2xl hover:bg-cyan-500/20 transition-all text-sm border border-cyan-500/20 flex items-center justify-center gap-2"
                      >
                        {selectedUser.role === 'admin' ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {selectedUser.role === 'admin' ? 'Demote User' : 'Promote User'}
                      </button>
                    )}
                  </div>
                  
                  {selectedUser.uid !== auth.currentUser?.uid && selectedUser.email !== SUPER_ADMIN_EMAIL && (
                    <button 
                      onClick={() => handleRemoveFromPlatform(selectedUser.uid)}
                      className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Remove from Platform
                    </button>
                  )}
                  <p className="text-[10px] text-center text-white/20 px-4">
                    Note: Removing a user deletes their platform data only. To fully delete their login, use the Firebase Console.
                  </p>
                  
                  <button 
                    className="w-full py-4 bg-white/5 text-white/40 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-all text-sm border border-white/5"
                  >
                    Contact User via Support Line
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
