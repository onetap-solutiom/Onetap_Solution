import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
    MailOpen, Trash2, Search, 
    User, Reply, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMessages = () => {
    const { data, deleteFromCollection, setData, user } = useAdmin();
    const [search, setSearch] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);

    const filteredMessages = data.messages.filter(m => 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    const markAsRead = async (id) => {
        setData(prev => ({
            ...prev,
            messages: prev.messages.map(m => m.id === id ? { ...m, unread: false } : m)
        }));

        if (!user?.token) return;
        try {
            await fetch(`http://localhost:5000/api/contact/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
        } catch (err) {
            console.error("Failed to sync message read status to server:", err);
        }
    };

    const handleOpenMessage = (msg) => {
        setSelectedMessage(msg);
        if (msg.unread) markAsRead(msg.id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Messages</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage inquiries and client communications</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#04C244]"></div>
                        <span>{data.messages.filter(m => m.unread).length} Unread</span>
                    </div>
                </div>
            </div>

            {/* List and View Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Message List */}
                <div className={`lg:col-span-5 space-y-4 ${selectedMessage ? 'hidden lg:block' : ''}`}>
                    <div className="relative mb-6">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all"
                        />
                    </div>

                    <div className="space-y-3 custom-scrollbar max-h-[70vh] overflow-y-auto pr-2">
                        {filteredMessages.map((msg, i) => (
                            <motion.div 
                                key={msg.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handleOpenMessage(msg)}
                                className={`
                                    p-5 rounded-[24px] border transition-all cursor-pointer group
                                    ${selectedMessage?.id === msg.id 
                                        ? 'bg-[#04C244]/10 border-[#04C244]/30' 
                                        : msg.unread 
                                            ? 'bg-slate-50 dark:bg-[#0A0C10] border-[#04C244]/20 hover:border-[#04C244]/40' 
                                            : 'bg-slate-50 dark:bg-[#0A0C10] border-black/10 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className={`text-sm font-bold ${msg.unread ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {msg.name}
                                    </h4>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{msg.date}</span>
                                </div>
                                <p className={`text-xs font-medium truncate mb-2 ${msg.unread ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500'}`}>
                                    {msg.subject}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-600 font-bold uppercase">{msg.email}</span>
                                    {msg.unread && (
                                        <div className="w-2 h-2 rounded-full bg-[#04C244] shadow-[0_0_8px_#04C244]"></div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Message View */}
                <div className={`lg:col-span-7 bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[40px] p-4 sm:p-8 min-h-[500px] flex flex-col ${!selectedMessage ? 'hidden lg:flex items-center justify-center' : ''}`}>
                    <AnimatePresence mode="wait">
                        {selectedMessage ? (
                            <motion.div 
                                key={selectedMessage.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex-1 flex flex-col h-full"
                            >
                                <div className="flex items-center justify-between mb-10 pb-8 border-b border-black/10 dark:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setSelectedMessage(null)}
                                            className="p-2 bg-black/5 dark:bg-white/5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white lg:hidden"
                                        >
                                            <X size={20} />
                                        </button>
                                        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#04C244]/20 to-emerald-500/5 flex items-center justify-center text-[#04C244]">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedMessage.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{selectedMessage.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { if(confirm('Delete message?')) { deleteFromCollection('messages', selectedMessage.id); setSelectedMessage(null); } }}
                                            className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 block">Subject</span>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                        {selectedMessage.subject}
                                    </h2>
                                </div>

                                <div className="flex-1 bg-black/2 dark:bg-white/2 border border-black/10 dark:border-white/5 rounded-3xl p-4 sm:p-8 mb-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
 
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                                    <a 
                                        href={`mailto:${selectedMessage.email}`}
                                        className="flex-1 py-4 bg-[#04C244] text-black rounded-2xl text-sm font-bold hover:bg-[#03a837] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Reply size={18} />
                                        <span>Reply to Client</span>
                                    </a>
                                    <button className="px-6 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                                        Archive
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-center space-y-4 max-w-xs mx-auto">
                                <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700">
                                    <MailOpen size={40} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Select a Message</h3>
                                <p className="text-sm text-slate-600 font-medium">Click on a message from the list to view its contents and reply.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default AdminMessages;
