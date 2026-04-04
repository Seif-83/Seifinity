import React from 'react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { collection, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TrendingUp, Activity, Users, Globe, Zap, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../auth/AuthContext';

export default function Analytics() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = React.useState({ users: '0', reviews: '0' });
  const [growthData, setGrowthData] = React.useState<any[]>([]);

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 glass rounded-[2.5rem] border border-rose-500/10">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Access Restricted</h2>
        <p className="text-white/40 max-w-md">Analytics data is only visible to platform administrators. If you believe this is an error, please contact the system owner.</p>
      </div>
    );
  }

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCount = await getCountFromServer(collection(db, 'users'));
        const reviewsCount = await getCountFromServer(collection(db, 'reviews'));
        setStats({
          users: usersCount.data().count.toString(),
          reviews: reviewsCount.data().count.toString()
        });

        // Fetch real growth data
        const usersSnap = await getDocs(collection(db, 'users'));
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            name: days[d.getDay()],
            fullDate: d.toISOString().split('T')[0],
            count: 0
          };
        });

        usersSnap.docs.forEach(doc => {
          const createdAt = doc.data().createdAt;
          if (createdAt) {
            const dateStr = createdAt.split('T')[0];
            const dayEntry = last7Days.find(d => d.fullDate === dateStr);
            if (dayEntry) dayEntry.count++;
          }
        });

        // Cumulative growth for the chart
        let cumulative = 0;
        const finalData = last7Days.map(d => {
          cumulative += d.count;
          return { name: d.name, registrations: cumulative };
        });

        setGrowthData(finalData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">Global Analytics</h2>
          <p className="text-white/60 text-sm">Real-time performance monitoring across the entire Seifinity network.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Live Feed active</span>
        </div>
      </div>

      {/* Main Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/5"
      >
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Learner Growth <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded ml-2 uppercase tracking-tighter">Real-Time</span></h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-xs text-white/40">Total Registrations</span>
               </div>
            </div>
         </div>
         <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={growthData}>
                  <defs>
                     <linearGradient id="colorActiveMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => Math.floor(v).toString()} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'rgba(5, 5, 5, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }}
                     itemStyle={{ color: '#22d3ee' }}
                  />
                  <Area type="monotone" dataKey="registrations" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorActiveMain)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Traffic Sources */}
         <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 glass p-8 rounded-3xl border border-white/5"
         >
            <h3 className="text-lg font-bold mb-6">Traffic Sources <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded ml-2 uppercase tracking-tighter">System Average</span></h3>
            <div className="space-y-6">
               {[
                  { label: 'Mobile App', value: '84%', color: 'bg-cyan-500', trend: '+12%' },
                  { label: 'Desktop Web', value: '88%', color: 'bg-blue-500', trend: '+8%' },
                  { label: 'Tablet', value: '80%', color: 'bg-indigo-500', trend: '-2%' },
                  { label: 'Other', value: '70%', color: 'bg-white/20', trend: '+1%' },
               ].map((source, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-white/60">{source.label}</span>
                        <div className="text-right">
                           <span className="text-sm font-bold mr-2">{source.value}</span>
                           <span className={cn("text-[10px] font-bold", source.trend.includes('+') ? "text-emerald-400" : "text-rose-400")}>{source.trend}</span>
                        </div>
                     </div>
                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: source.value }}
                           transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                           className={cn("h-full rounded-full", source.color)}
                        />
                     </div>
                  </div>
               ))}
            </div>
         </motion.div>

         {/* Quick Stats */}
         <div className="space-y-6">
            {[
               { label: 'Total Learners', value: stats.users, icon: Users, color: 'text-cyan-400' },
               { label: 'Official Reviews', value: stats.reviews, icon: Zap, color: 'text-emerald-400' },
               { label: 'System Load', value: 'Minimal', icon: Activity, color: 'text-orange-400' },
            ].map((stat, i) => (
               <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all"
               >
                  <div className="flex items-center gap-4">
                     <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                        <stat.icon className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className="text-xl font-bold">{stat.value}</p>
                     </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors" />
               </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
