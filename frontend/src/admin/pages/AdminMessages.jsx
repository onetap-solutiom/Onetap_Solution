import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
    MailOpen, Trash2, Search, 
    User, Reply, X, Mail, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMessages = () => {
    const { data, deleteFromCollection, setData, user } = useAdmin();
    const API_URL = import.meta.env.VITE_API_URL || 'https://onetap-solution-gjw9.onrender.com';
    const [search, setSearch] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    
    // Newsletter states
    const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'subscribers'
    const [subscribers, setSubscribers] = useState([]);
    const [copiedAll, setCopiedAll] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const filteredMessages = data.messages.filter(m => 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const fetchSubscribers = async () => {
            if (!user?.token) return;
            try {
                const res = await fetch(`${API_URL}/api/newsletter/`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const result = await res.json();
                if (result.success && result.data) {
                    setSubscribers(result.data);
                }
            } catch (err) {
                console.error("Failed to fetch subscribers:", err);
            }
        };

        if (activeTab === 'subscribers') {
            fetchSubscribers();
        }
    }, [activeTab, user?.token, API_URL]);

    const handleDeleteSubscriber = async (id) => {
        if (!confirm('Are you sure you want to delete this subscriber?')) return;
        try {
            const res = await fetch(`${API_URL}/api/newsletter/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const result = await res.json();
            if (result.success) {
                setSubscribers(prev => prev.filter(s => s.id !== id));
            } else {
                alert(result.message || "Failed to delete subscriber");
            }
        } catch (err) {
            console.error("Failed to delete subscriber:", err);
        }
    };

    const handleCopyAll = () => {
        if (subscribers.length === 0) return;
        const emailsStr = subscribers.map(s => s.email).join(', ');
        navigator.clipboard.writeText(emailsStr);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    const handleCopySingle = (email, id) => {
        navigator.clipboard.writeText(email);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const markAsRead = async (id) => {
        setData(prev => ({
            ...prev,
            messages: prev.messages.map(m => m.id === id ? { ...m, unread: false } : m)
        }));

        if (!user?.token) return;
        try {
            await fetch(`${API_URL}/api/contact/${id}/read`, {
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
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage inquiries, newsletters and client communications</p>
                </div>
                {activeTab === 'messages' && (
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#04C244]"></div>
                            <span>{data.messages.filter(m => m.unread).length} Unread</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-black/10 dark:border-white/5">
                <button
                    onClick={() => { setActiveTab('messages'); setSearch(''); }}
                    className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 ${activeTab === 'messages' ? 'border-[#04C244] text-[#04C244]' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Contact Messages ({data.messages.length})
                </button>
                <button
                    onClick={() => { setActiveTab('subscribers'); setSearch(''); }}
                    className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 ${activeTab === 'subscribers' ? 'border-[#04C244] text-[#04C244]' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Newsletter Subscribers ({subscribers.length})
                </button>
            </div>

            {activeTab === 'messages' ? (
                /* List and View Grid */
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
            ) : (
                <div className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-3xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="relative flex-1 max-w-md">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Search subscribers..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all"
                            />
                        </div>
                        <button
                            onClick={handleCopyAll}
                            disabled={subscribers.length === 0}
                            className="px-5 py-3 bg-[#04C244]/10 border border-[#04C244]/20 hover:border-[#04C244]/40 text-[#04C244] rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            {copiedAll ? <Check size={16} /> : <Copy size={16} />}
                            <span>{copiedAll ? 'Copied List!' : 'Copy All Emails'}</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/5">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-black/20 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-black/5 dark:border-white/5">
                                    <th className="py-4 px-6">Email Address</th>
                                    <th className="py-4 px-6">Subscribed Date</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm text-slate-700 dark:text-slate-300">
                                {subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase())).map((sub, i) => (
                                    <motion.tr 
                                        key={sub.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-slate-50/50 dark:hover:bg-white/1 transition-all"
                                    >
                                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-[#04C244]/10 text-[#04C244] flex items-center justify-center shrink-0">
                                                <Mail size={14} />
                                            </div>
                                            <span>{sub.email}</span>
                                        </td>
                                        <td className="py-4 px-6 font-medium text-slate-500">
                                            {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            <button
                                                onClick={() => handleCopySingle(sub.email, sub.id)}
                                                className="p-2 bg-black/5 dark:bg-white/5 text-slate-400 hover:text-[#04C244] dark:hover:text-[#04C244] rounded-xl transition-all"
                                                title="Copy email"
                                            >
                                                {copiedId === sub.id ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSubscriber(sub.id)}
                                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all"
                                                title="Delete subscriber"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                                {subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="py-12 text-center text-slate-500 font-medium">
                                            No subscribers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
