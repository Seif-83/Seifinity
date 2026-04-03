import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        // Document creation is handled by AuthContext onAuthStateChanged
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in the Firebase Console. Please enable it in the Authentication > Sign-in method tab.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      // Document creation is handled by AuthContext onAuthStateChanged
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-cyan-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] mb-4">
            <div className="w-full h-full rounded-2xl bg-[#050505] flex items-center justify-center overflow-hidden">
              <img src="/Seifinity.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join Seifinity'}
          </h1>
          <p className="text-white/50 text-sm text-center">
            {isLogin ? 'Login to access your dashboard' : 'Create an account to get started'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
                    placeholder="........................"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
                placeholder=".....@gmail.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-4 bg-transparent text-[10px] text-white/20 uppercase tracking-widest font-bold">
              Or continue with
            </span>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all flex items-center justify-center gap-3 text-sm font-medium disabled:opacity-50"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            Google Workspace
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-white/30">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors underline decoration-cyan-400/30 underline-offset-4"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-2 text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
        Secure Encrypted Connection
      </div>
    </div>
  );
}
