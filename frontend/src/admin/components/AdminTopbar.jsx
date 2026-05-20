import { useState } from 'react';
import { Menu, Bell, Search, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminTopbar = ({ toggleSidebar }) => {
    const { user, logout } = useAdmin();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/60 backdrop-blur-md border-b border-black/10 dark:border-white/5 h-16 flex items-center justify-between px-6 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 md:hidden"
                >
                    <Menu size={20} />
                </button>
                <div className="relative hidden sm:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search dashboard..." 
                        className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 w-64 transition-all placeholder-slate-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#04C244] rounded-full border-2 border-white dark:border-black"></span>
                </button>

                {/* Profile */}
                <div className="relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#04C244] to-emerald-800 flex items-center justify-center text-black font-bold text-xs uppercase shadow-lg shadow-[#04C244]/10">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-1">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{user?.role}</p>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 dark:text-slate-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)}></div>
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111318] border border-black/10 dark:border-white/5 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden"
                                >
                                    <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all">
                                        <User size={16} />
                                        <span>My Profile</span>
                                    </button>
                                    <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all">
                                        <Settings size={16} />
                                        <span>Settings</span>
                                    </button>
                                    <div className="border-t border-black/10 dark:border-white/5 my-1"></div>
                                    <button 
                                        onClick={logout}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-400/10 transition-all"
                                    >
                                        <LogOut size={16} />
                                        <span>Log Out</span>
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;
