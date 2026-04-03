import React from 'react';
import { 
  Users, 
  Activity, 
  Shield, 
  TrendingUp,
  Globe,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  Monitor,
  Zap,
  Instagram
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '../lib/utils';
import { globalStatsData } from '../data/mockData';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const [stats, setStats] = React.useState({ users: '0', reviews: '0' });
  const [growthData, setGrowthData] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersCount = await getCountFromServer(collection(db, 'users'));
        const reviewsCount = await getCountFromServer(collection(db, 'reviews'));
        setStats({
          users: usersCount.data().count.toString(),
          reviews: reviewsCount.data().count.toString()
        });

        // Fetch real growth data
        const usersSnap = await getDocs(collection(db, 'users'));
        const daysExport = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            name: daysExport[d.getDay()],
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

        let cumulative = 0;
        const finalData = last7Days.map(d => {
          cumulative += d.count;
          return { name: d.name, registrations: cumulative };
        });

        setGrowthData(finalData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass p-8 md:p-12 border border-white/10 group">

        <div className="absolute inset-0 w-full h-full opacity-10 group-hover:opacity-15 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] z-10" />
          <img 
            src="/Seifinity.jpg" 
            alt="Seifinity Logo" 
            className="w-full h-full object-cover mix-blend-luminosity grayscale" 
          />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 md:mb-6">
              <Monitor className="w-3 h-3" /> Central Command
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-4 md:mb-6">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Seifinity</span> Control Center.
            </h2>
            <p className="text-white/60 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
              Manage, monitor, and scale all your teacher platforms from a single, high-performance interface. Designed for the next generation of education startups.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button 
                onClick={() => setActiveTab('teachers')}
                className="px-6 md:px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 group active:scale-95"
              >
                Meet Our Educators <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => window.open('https://www.instagram.com/seifinity?igsh=MXI2aTI3dHdoYmpwNw%3D%3D&utm_source=qr', '_blank')}
                className="px-6 md:px-8 py-3 glass hover:bg-white/5 text-white font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 group active:scale-95"
              >
                <Instagram className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" /> Follow on Instagram
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {[
          { label: 'Total Learners', value: stats.users, trend: '+ Live', icon: Users, color: 'text-cyan-400' },
          { label: 'Community Reviews', value: stats.reviews, trend: '+ Real', icon: Activity, color: 'text-blue-400' },
          { label: 'System Uptime', value: '99.9%', trend: 'Stable', icon: Shield, color: 'text-emerald-400' },
          { label: 'Project Phase', value: 'BETA v1', trend: 'Growing', icon: TrendingUp, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-4 md:p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={cn("p-1.5 md:p-2 rounded-lg bg-white/5", stat.color)}>
                <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className={cn("text-[10px] md:text-xs font-bold", stat.trend.includes('+') ? "text-emerald-400" : "text-white/40")}>
                {stat.trend}
              </span>
            </div>
            <p className="text-white/40 text-[10px] md:text-xs font-medium mb-1">{stat.label}</p>
            <h3 className="text-xl md:text-2xl font-display font-bold">{stat.value}</h3>
          </motion.div>
        ))}
      </div>


      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 glass p-5 md:p-8 rounded-3xl border border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-display font-bold">Learner Growth</h3>
              <p className="text-xs md:text-sm text-white/40">Weekly registration momentum</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] md:text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
              <option className="bg-[#050505]">Last 7 Days</option>
              <option className="bg-[#050505]">Last 30 Days</option>
            </select>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => Math.floor(value).toString()}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(5, 5, 5, 0.8)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(12px)',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorActive)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>

    </div>
  );
}
