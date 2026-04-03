import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquarePlus, User, Loader2, Trash2 } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../auth/AuthContext';
import { cn } from '../lib/utils';

export interface Review {
  id?: string;
  userName: string;
  rating: number;
  comment: string;
  date: any;
  userId?: string;
  userAvatar?: {
    style: string;
    seed: string;
  };
}

export default function Reviews() {
  const { user, userData, isAdmin } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData: Review[] = [];
      snapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() } as Review);
      });
      setReviews(reviewsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userName: userData?.displayName || user.displayName || 'Anonymous',
        userId: user.uid,
        rating: newReview.rating,
        comment: newReview.comment,
        date: serverTimestamp(),
        userAvatar: userData?.avatar || { style: 'avataaars', seed: userData?.displayName || user.displayName || 'User' }
      });

      setNewReview({ rating: 5, comment: '' });
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString('en-GB');
    return new Date(date).toLocaleDateString('en-GB');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">User Reviews</h2>
          <p className="text-white/60 text-sm">Real-time feedback from our community of learners and educators.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <MessageSquarePlus className="w-4 h-4" /> 
          {isFormOpen ? 'Close Form' : 'Write a Review'}
        </button>
      </div>

      {isFormOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass p-5 md:p-6 rounded-2xl border border-cyan-500/30 overflow-hidden"
        >
          <h3 className="text-lg md:text-xl font-bold mb-4">Share Your Thoughts</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
             <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/${userData?.avatar?.style || 'avataaars'}/svg?seed=${userData?.avatar?.seed || userData?.displayName || user?.displayName || 'User'}`} alt="User" />
                </div>
                <div>
                   <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Posting as</p>
                   <p className="text-sm font-bold">{userData?.displayName || user?.displayName || 'User'}</p>
                </div>
             </div>

            <div className="space-y-2">
              <label className="text-xs md:text-sm text-white/60 font-medium">How would you rate Seifinity?</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({...newReview, rating: star})}
                    className="p-1 focus:outline-none focus:scale-110 transition-transform"
                  >
                    <Star 
                      className={cn(
                        "w-6 h-6 md:w-7 md:h-7", 
                        star <= newReview.rating ? "text-yellow-400 fill-yellow-400" : "text-white/10"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs md:text-sm text-white/60 font-medium">Your Review</label>
              <textarea 
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-[120px] focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Tell us about your experience..."
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
            </button>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Syncing with review database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 rounded-2xl border border-white/5 flex flex-col h-full hover:border-cyan-500/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 p-[1px]">
                    <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/${review.userAvatar?.style || 'avataaars'}/svg?seed=${review.userAvatar?.seed || review.userName}`} alt="User Avatar" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-[100px] md:max-w-none">{review.userName}</h4>
                    <p className="text-[10px] text-white/40">{formatDate(review.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-400/5 px-2 py-1 rounded-lg border border-yellow-400/10">
                  <span className="text-xs font-bold text-yellow-400">{review.rating}.0</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed italic line-clamp-4 group-hover:line-clamp-none transition-all">
                "{review.comment}"
              </p>
              
              {isAdmin && (
                <div className="mt-auto pt-4 flex justify-end">
                   <button 
                     onClick={() => handleDeleteReview(review.id!)}
                     className="p-2 bg-rose-500/5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                     title="Delete Review"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="text-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/10">
          <MessageSquarePlus className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-medium">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}
