import { useState, useEffect } from 'react';
import { 
    LineChart, 
    ArrowUpRight, ArrowDownRight, 
    Smartphone, Monitor, Tablet, Users, Globe, Loader
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';

const AdminAnalytics = () => {
    const { user } = useAdmin();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user?.token) return;
            try {
                const res = await fetch('http://localhost:5000/api/stats/analytics', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const result = await res.json();
                if (result.success) {
                    setAnalytics(result.data);
                }
            } catch (err) {
                console.error('Failed to load analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [user?.token]);

    // Chart max for scaling bars
    const maxPageViews   = analytics ? Math.max(...analytics.monthlyChart.map(m => m.pageViews),   1) : 1;
    const maxUniqueViews = analytics ? Math.max(...analytics.monthlyChart.map(m => m.uniqueVisitors), 1) : 1;
    const chartMax = Math.max(maxPageViews, maxUniqueViews);

    const deviceIcons = { Mobile: <Smartphone size={16} />, Desktop: <Monitor size={16} />, Tablet: <Tablet size={16} /> };

    const mainStats = analytics ? [
        {
            label: 'Total Visitors',
            value: analytics.totalVisitors.toLocaleString(),
            change: analytics.newVisitors.trend,
            isPositive: analytics.newVisitors.isPositive
        },
        {
            label: 'New Visitors (30d)',
            value: analytics.newVisitors.value.toLocaleString(),
            change: analytics.newVisitors.trend,
            isPositive: analytics.newVisitors.isPositive
        },
        {
            label: 'Avg. Session Duration',
            value: 'N/A',
            change: '—',
            isPositive: true,
            note: 'Requires session tracking'
        },
        {
            label: 'Bounce Rate',
            value: 'N/A',
            change: '—',
            isPositive: true,
            note: 'Requires session tracking'
        },
    ] : [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Traffic Analytics</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Deep dive into your website performance and audience</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 text-slate-500 gap-3">
                    <Loader size={20} className="animate-spin text-[#04C244]" />
                    <span className="text-sm font-medium">Loading analytics from database…</span>
                </div>
            ) : (
                <>
                    {/* Visitor Traffic Chart */}
                    <div className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[32px] p-5 sm:p-10 relative overflow-hidden group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-12">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#04C244]/10 text-[#04C244] rounded-2xl"><LineChart size={24} /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Visitor Traffic</h3>
                                    <p className="text-xs text-slate-500 font-medium">Monthly unique visitors and page views</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#04C244]"></span>
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mr-2 sm:mr-4">Unique Visitors</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Page Views</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 flex items-end justify-between gap-2 px-4 relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="border-t border-black/10 dark:border-white/10 w-full h-0"></div>)}
                            </div>

                            {/* Real Chart Bars */}
                            {(analytics?.monthlyChart || []).map((bar, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end gap-1.5 group/bar relative h-full max-w-[36px] z-10">
                                    {/* Page Views bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(bar.pageViews / chartMax) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.04 }}
                                        className="w-full bg-linear-to-t from-blue-500/20 to-blue-500 rounded-t-md hover:brightness-110 transition-all cursor-pointer"
                                        title={`${bar.month} Page Views: ${bar.pageViews}`}
                                    ></motion.div>
                                    {/* Unique Visitors bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(bar.uniqueVisitors / chartMax) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.2 + i * 0.04 }}
                                        className="w-full bg-linear-to-t from-[#04C244]/20 to-[#04C244] rounded-t-md hover:brightness-110 transition-all cursor-pointer"
                                        title={`${bar.month} Unique: ${bar.uniqueVisitors}`}
                                    ></motion.div>
                                </div>
                            ))}
                        </div>

                        {/* X-axis labels */}
                        <div className="flex justify-between mt-6 px-4">
                            {(analytics?.monthlyChart || []).map(m => (
                                <span key={m.month} className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.month}</span>
                            ))}
                        </div>
                    </div>

                    {/* Stats and Device Split */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Stats Metrics (2/3 width) */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {mainStats.map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 hover:border-[#04C244]/20 transition-all group flex flex-col justify-between relative overflow-hidden">
                                    {/* Glow effect on hover */}
                                    <div className="absolute -inset-px bg-linear-to-br from-[#04C244]/0 via-[#04C244]/0 to-[#04C244]/10 rounded-2xl sm:rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    
                                    <div>
                                        <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">{stat.label}</h4>
                                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white group-hover:text-[#04C244] transition-colors">{stat.value}</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
                                        {stat.change === '—' ? (
                                            <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{stat.note || '—'}</span>
                                        ) : (
                                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                <span>{stat.change}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Device Distribution (1/3 width) */}
                        <div className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute -inset-px bg-linear-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 rounded-2xl sm:rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Device Distribution</h3>
                                <p className="text-xs text-slate-500 font-medium mb-6 sm:mb-8">Where your traffic is coming from</p>
 
                                <div className="space-y-6">
                                    {(analytics?.devices || []).map((p, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <div className={`p-1.5 rounded-lg bg-black/5 dark:bg-white/5 ${p.name === 'Desktop' ? 'text-blue-500' : p.name === 'Mobile' ? 'text-[#04C244]' : 'text-amber-500'}`}>
                                                        {deviceIcons[p.name] || <Globe size={14} />}
                                                    </div>
                                                    <span>{p.name}</span>
                                                </div>
                                                <span className="text-slate-900 dark:text-white">{p.value}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${p.value}%` }}
                                                    transition={{ duration: 1.5, delay: 0.5 }}
                                                    className={`h-full rounded-full bg-linear-to-r ${
                                                        p.name === 'Desktop' ? 'from-blue-500 to-indigo-500' :
                                                        p.name === 'Mobile' ? 'from-[#04C244] to-emerald-400' :
                                                        'from-amber-500 to-orange-400'
                                                    }`}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-black/10 dark:border-white/5 text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                                    <Users size={14} className="text-[#04C244]" />
                                    <span className="font-bold">{analytics?.totalVisitors?.toLocaleString() || 0} total visits tracked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminAnalytics;
