import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
    Plus, Search, Edit2, Trash2, Newspaper, 
    Calendar, CheckCircle, Clock, X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNews = () => {
    const { data, deleteFromCollection, updateCollection } = useAdmin();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        content: '', 
        status: 'Draft' 
    });

    const filteredNews = data.news.filter(n => 
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenModal = (news = null) => {
        if (news) {
            setEditingNews(news);
            setFormData({ title: news.title, content: news.content, status: news.status });
        } else {
            setEditingNews(null);
            setFormData({ title: '', content: '', status: 'Draft' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newsData = {
            ...formData,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        };

        if (editingNews) {
            updateCollection('news', newsData, editingNews.id);
        } else {
            updateCollection('news', newsData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">News & Blog</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage company updates and industry articles</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#04C244] text-black rounded-xl text-sm font-bold hover:bg-[#03a837] transition-all shadow-lg shadow-[#04C244]/10"
                >
                    <Plus size={18} />
                    <span>Create Article</span>
                </button>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[32px] overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-black/10 dark:border-white/5 bg-white/1">
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search articles..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-black/10 dark:divide-white/5">
                    {filteredNews.map((n, i) => (
                        <motion.div 
                            key={n.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 sm:p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 group"
                        >
                            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 items-center justify-center text-[#04C244] group-hover:bg-[#04C244]/10 transition-all shrink-0">
                                    <Newspaper size={24} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#04C244] transition-colors mb-1 truncate">{n.title}</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                            <Calendar size={12} />
                                            <span>{n.date}</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${n.status === 'Published' ? 'text-[#04C244]' : 'text-amber-500'}`}>
                                            {n.status === 'Published' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                            <span>{n.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shrink-0">
                                <button 
                                    onClick={() => handleOpenModal(n)}
                                    className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-[#04C244] hover:bg-[#04C244]/10 transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => { if(confirm('Delete article?')) deleteFromCollection('news', n.id) }}
                                    className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {filteredNews.length === 0 && (
                        <div className="p-12 text-center text-slate-500 font-medium">No articles found.</div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-6 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-[32px] w-full max-w-2xl overflow-hidden relative z-10 shadow-2xl my-auto"
                        >
                            <div className="p-4 sm:p-8 border-b border-black/10 dark:border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingNews ? 'Edit Article' : 'New Article'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Article Title</label>
                                    <input 
                                        type="text" 
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3.5 px-5 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all font-bold text-lg"
                                        placeholder="Enter catchy title..."
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Publication Status</label>
                                        <select 
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all appearance-none"
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Published">Published</option>
                                            <option value="Scheduled">Scheduled</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tags (Optional)</label>
                                        <input type="text" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all" placeholder="Tech, Updates..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Article Content</label>
                                    <textarea 
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all min-h-[200px] resize-none text-sm leading-relaxed"
                                        placeholder="Write your article content here..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-[#04C244] text-black rounded-2xl text-xs font-bold hover:bg-[#03a837] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#04C244]/10"
                                    >
                                        <Save size={18} />
                                        <span>Save & Publish</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminNews;
