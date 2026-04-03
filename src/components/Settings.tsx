import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Save, Loader2, Camera, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { updateProfile, deleteUser } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Settings() {
  const { user, userData, isAdmin } = useAuth();
  const [displayName, setDisplayName] = useState(userData?.displayName || user?.displayName || '');
  const [avatarStyle, setAvatarStyle] = useState(userData?.avatar?.style || 'avataaars');
  const [avatarSeed, setAvatarSeed] = useState(userData?.avatar?.seed || user?.displayName || 'User');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Synchronize local state with Firestore/Auth data when it loads
  React.useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || user?.displayName || '');
      if (userData.avatar) {
        setAvatarStyle(userData.avatar.style || 'avataaars');
        setAvatarSeed(userData.avatar.seed || userData.displayName || 'User');
      }
    }
  }, [userData, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccess(false);

    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName });
      
      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        avatar: { style: avatarStyle, seed: avatarSeed },
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !window.confirm("Are you ABSOLUTELY sure? This will delete your account and all associated data permanently.")) return;
    
    setLoading(true);
    try {
      // 1. Delete Auth user FIRST (requires recent login check)
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteUser(currentUser);
      }

      // 2. Delete Firestore data ONLY if Auth deletion succeeded
      await deleteDoc(doc(db, 'users', user.uid));
      
      alert("Your account and data have been successfully deleted.");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security reasons, you must have logged in recently to delete your account. Please sign out and sign back in, then try again.");
      } else {
        alert("Failed to delete account. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2">Account Settings</h2>
        <p className="text-white/60 text-sm">Manage your public profile and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2 lg:col-span-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
          ].map((item) => (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all text-left",
                item.id === 'profile' ? "bg-white/10 text-cyan-400" : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-3xl border border-white/5"
          >
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-500" /> Public Profile
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-8 mb-8">
                <div className="relative group cursor-pointer" onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}>
                   <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px]">
                      <div className="w-full h-full rounded-full bg-[#050505] overflow-hidden">
                         <img src={`https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}`} alt="Avatar" />
                      </div>
                   </div>
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity">
                      <RefreshCw className="w-6 h-6 text-white animate-spin-slow" />
                   </div>
                </div>
                <div>
                   <p className="text-sm font-bold mb-1">Profile Avatar</p>
                   <p className="text-xs text-white/40 mb-3">Click onto the avatar to shuffle, or choose a style below.</p>
                   <div className="flex flex-wrap gap-2">
                      {[
                        'adventurer', 'adventurer-neutral', 'avataaars', 'bottts', 
                        'pixel-art', 'lorelei', 'big-smile', 'micah', 'miniavs', 
                        'open-peeps', 'personas', 'thumbs',
                        'croodles', 'fun-emoji'
                      ].map(style => (
                         <button 
                            key={style}
                            type="button"
                            onClick={() => setAvatarStyle(style)}
                            className={cn(
                               "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border",
                               avatarStyle === style ? "bg-cyan-500 text-black border-cyan-500" : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                            )}
                         >
                            {style.replace('-', ' ')}
                         </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase font-bold tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase font-bold tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase font-bold tracking-wider">Account ID</label>
                <div className="font-mono text-[10px] text-white/20 p-3 bg-white/5 rounded-xl break-all">
                   {user?.uid}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                {success && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400 text-sm font-bold"
                  >
                    Profile updated successfully!
                  </motion.p>
                )}
                <div className="flex-grow" />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-8 rounded-3xl border border-white/5 border-rose-500/10"
          >
            <h3 className="text-xl font-bold mb-4 text-rose-500 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-sm text-white/50 mb-6 italic">Deleting your account is permanent and cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAdmin && (
                <button 
                  disabled
                  className="px-6 py-2 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-bold rounded-xl transition-all text-xs cursor-default"
                >
                  Administrator Account
                </button>
              )}
              <button 
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-6 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold rounded-xl transition-all text-xs disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete My Account'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
