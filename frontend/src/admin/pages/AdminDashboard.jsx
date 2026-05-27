import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { 
    Users, Briefcase, Mail, ArrowUpRight, 
    MoreHorizontal, Zap, Settings, UserPlus,
    MessageCircle, Newspaper, Clock, Activity,
    TrendingUp, Shield, Plus, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const { data } = useAdmin();
    const navigate = useNavigate();

    const ds = data.dashboardStats?.stats;

    const stats = [
        { label: 'Total Users', value: ds?.users?.value ?? (data.users?.length || 0), icon: <Users size={22} />, color: 'blue', trend: ds?.users?.trend ?? '+12%', path: '/admin/users' },
        { label: 'Total Projects', value: data.projects?.length || 0, icon: <Briefcase size={22} />, color: 'indigo', trend: '+5%', path: '/admin/projects' },
        { label: 'Live Status', value: ds?.projects?.value ?? (data.projects?.filter(p => p.status === 'Live').length || 0), icon: <Zap size={22} />, color: 'green', trend: 'Optimal', path: '/admin/projects' },
        { label: 'Team Velocity', value: data.team?.length || 0, icon: <Activity size={22} />, color: 'purple', trend: '+2.4%', path: '/admin/team' },
        { label: 'Active Services', value: data.services?.length || 0, icon: <Settings size={22} />, color: 'orange', trend: 'Stable', path: '/admin/services' },
        { label: 'Inquiries', value: ds?.messages?.value ?? (data.messages?.filter(m => !m.is_read).length || 0), icon: <Mail size={22} />, color: 'red', trend: 'Action Needed', path: '/admin/messages' },
    ];

    const quickActions = [
        { label: 'Add Member', icon: <UserPlus size={18} />, path: '/admin/team', color: 'bg-blue-500' },
        { label: 'Compose News', icon: <Newspaper size={18} />, path: '/admin/news', color: 'bg-emerald-500' },
        { label: 'System Check', icon: <Shield size={18} />, path: '/admin/settings', color: 'bg-[#04C244]' },
    ];

    const recentActivity = [
        ...(data.projects || []).map(p => ({
            id: `p-${p.id}`,
            type: 'Project',
            title: `Project Deployed: ${p.title || p.name}`,
            subtitle: p.client || 'Enterprise Client',
            time: p.created_at || new Date().toISOString(),
            icon: <Briefcase size={16} />,
            color: 'text-indigo-400',
            bgColor: 'bg-indigo-500/10',
            status: 'success'
        })),
        ...(data.messages || []).map(m => ({
            id: `m-${m.id}`,
            type: 'Message',
            title: `Inquiry: ${m.name}`,
            subtitle: m.subject || 'Service Request',
            time: m.created_at || new Date().toISOString(),
            icon: <MessageCircle size={16} />,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
            status: 'warning'
        })),
        ...(data.team || []).map(t => ({
            id: `t-${t.id}`,
            type: 'Team',
            title: `Member Joined: ${t.name}`,
            subtitle: t.role || 'New Talent',
            time: t.created_at || new Date().toISOString(),
            icon: <UserPlus size={16} />,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            status: 'info'
        }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

    const formatTime = (isoString) => {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            if (diffInSeconds < 60) return 'Just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
            if (diffInSeconds < 84600) return `${Math.floor(diffInSeconds / 3600)}h`;
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch { return 'Recent'; }
    };

    return (
        <div className="space-y-8 pb-12">
            
            {/* Executive Welcome Hero */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 sm:p-12 border border-white/5 shadow-2xl"
            >
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-[#04C244]/10 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#04C244]/10 border border-[#04C244]/20 text-[#04C244] text-[10px] font-bold uppercase tracking-widest mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#04C244] animate-pulse" />
                            System Online
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none mb-4">
                            Welcome back, <span className="text-gradient">Admin</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium max-w-md">
                            Your ecosystem is performing at <span className="text-white font-bold">98% efficiency</span>. 4 new messages require attention.
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mt-10">
                            <button 
                                onClick={() => navigate('/admin/projects')}
                                className="px-8 py-4 bg-[#04C244] text-black rounded-2xl text-sm font-extrabold hover:scale-105 transition-all shadow-xl shadow-[#04C244]/20 flex items-center gap-3"
                            >
                                <Plus size={20} />
                                Launch New Project
                            </button>
                            <div className="relative flex-1 max-w-xs group hidden sm:block">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#04C244] transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search command center..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#04C244]/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Analytics Visual */}
                    <div className="hidden lg:grid grid-cols-2 gap-4">
                        {quickActions.map((action, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(action.path)}
                                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-6 hover:bg-white/10 transition-all group"
                            >
                                <div className={`w-16 h-16 rounded-3xl ${action.color} flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110`}>
                                    {action.icon}
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {stats.map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -8 }}
                            onClick={() => stat.path && navigate(stat.path)}
                            className={`glass-card-premium p-8 rounded-[2.5rem] cursor-pointer group glow-${stat.color}`}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 text-${stat.color}-500 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-black text-sm mb-1 justify-end">
                                        <TrendingUp size={14} />
                                        {stat.trend}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Growth rate</div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 px-1">{stat.label}</h3>
                                <div className="flex items-end gap-3 px-1">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic">
                                        {stat.value}
                                    </span>
                                    <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-1.5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "65%" }}
                                            className={`h-full bg-${stat.color}-500 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]`} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Content Core */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Advanced Timeline Feed */}
                <div className="xl:col-span-8 glass-card-premium rounded-[3rem] p-8 sm:p-10 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <Clock className="text-[#04C244]" size={24} />
                                System Chronology
                            </h3>
                            <p className="text-slate-500 font-medium text-sm mt-1">Real-time interaction matrix across all modules</p>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all">
                            Export Log
                        </button>
                    </div>

                    <div className="space-y-8 relative">
                        {/* Timeline Connector Line */}
                        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-linear-to-b from-[#04C244] via-indigo-500 to-transparent opacity-20 hidden sm:block" />

                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, i) => (
                                <motion.div 
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-6 group relative"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${activity.bgColor} ${activity.color} flex items-center justify-center shrink-0 z-10 shadow-lg border border-white/5 group-hover:scale-110 transition-transform`}>
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1 pt-1.5 border-b border-black/5 dark:border-white/5 pb-6">
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#04C244] transition-colors">{activity.title}</h4>
                                            <span className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-[10px] font-black text-slate-500">{formatTime(activity.time)}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm text-slate-500 font-medium">#{activity.type} • {activity.subtitle}</p>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] uppercase font-black text-emerald-500 tracking-widest">Verified</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <Activity size={60} className="text-slate-700 mb-6 opacity-20" />
                                <p className="text-lg font-bold text-slate-500 uppercase tracking-[0.2em]">Matrix Clear</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Insight Sidebar */}
                <div className="xl:col-span-4 space-y-8">
                    
                    {/* Performance Widget */}
                    <div className="glass-card-premium rounded-[3rem] p-8 border-l-4 border-l-[#04C244] glow-green overflow-hidden relative">
                         <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#04C244]/10 rounded-full blur-2xl" />
                         <h4 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                            <Zap size={18} className="text-[#04C244]" />
                            Performance
                         </h4>
                         <div className="space-y-6">
                            {[
                                { l: 'Server CPU', v: '24%', c: 'bg-[#04C244]' },
                                { l: 'Bandwidth', v: '82%', c: 'bg-blue-500' },
                                { l: 'Security Score', v: '99%', c: 'bg-indigo-500' }
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                                        <span>{item.l}</span>
                                        <span className="text-white">{item.v}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: item.v }}
                                            className={`h-full ${item.c} rounded-full`} 
                                        />
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* Top Projects Card */}
                    <div className="glass-card-premium rounded-[3rem] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Active Nodes</h3>
                            <button className="p-2 rounded-xl hover:bg-white/5 text-slate-500">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {(data.projects || []).slice(0, 4).map((p, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5 flex items-center justify-center text-[#04C244] group-hover:bg-[#04C244] group-hover:text-black transition-all">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.title}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{p.client}</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => navigate('/admin/projects')}
                            className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                        >
                            Explore All Projects
                            <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
