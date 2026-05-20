import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
    Plus, Edit2, Trash2, Star, Quote, 
    X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminTestimonials = () => {
    const { data, deleteFromCollection, updateCollection } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        role: '', 
        review: '', 
        img: '',
        rating: 5
    });

    const handleOpenModal = (t = null) => {
        if (t) {
            setEditingTestimonial(t);
            setFormData({ ...t });
        } else {
            setEditingTestimonial(null);
            setFormData({ name: '', role: '', review: '', img: '', rating: 5 });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTestimonial) {
            updateCollection('testimonials', formData, editingTestimonial.id);
        } else {
            updateCollection('testimonials', formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Feedback & Reviews</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage all community reviews, feedback, and testimonials in one place</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#04C244] text-black rounded-xl text-sm font-bold hover:bg-[#03a837] transition-all shadow-lg shadow-[#04C244]/10"
                >
                    <Plus size={18} />
                    <span>Add Feedback</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.testimonials.map((t, i) => (
                    <motion.div 
                        key={t.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[40px] p-5 sm:p-8 group relative overflow-hidden"
                    >
                        {/* Quote Decor */}
                        <Quote className="absolute top-8 right-8 text-black/5 dark:text-white/5 w-20 h-20 -rotate-12 group-hover:text-[#04C244]/5 transition-colors" />

                        <div className="flex items-center gap-2 mb-6">
                            {[1,2,3,4,5].map(star => (
                                <Star 
                                    key={star} 
                                    size={14} 
                                    className={star <= (t.rating || 5) ? 'text-[#04C244]' : 'text-slate-700'} 
                                    fill={star <= (t.rating || 5) ? 'currentColor' : 'none'} 
                                />
                            ))}
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 relative z-10 italic">
                            "{t.review}"
                        </p>

                        <div className="flex items-center justify-between border-t border-black/10 dark:border-white/5 pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-black/10 dark:border-white/10 overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                                    {t.img ? (
                                        <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#0A0C10] via-slate-900 to-black select-none relative">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,194,68,0.15)_0%,transparent_70%)]"></div>
                                            <span className="text-base font-black text-[#04C244] tracking-widest font-mono drop-shadow-[0_0_6px_rgba(4,194,68,0.4)]">
                                                {t.name ? t.name.charAt(0).toUpperCase() : '?'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleOpenModal(t)}
                                    className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-[#04C244] hover:bg-[#04C244]/10 transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => { if(confirm('Delete testimonial?')) deleteFromCollection('testimonials', t.id) }}
                                    className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
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
                            className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-[32px] w-full max-w-lg overflow-hidden relative z-10 shadow-2xl my-auto"
                        >
                            <div className="p-4 sm:p-8 border-b border-black/10 dark:border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingTestimonial ? 'Edit Review & Feedback' : 'New Review & Feedback'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                            placeholder="e.g. John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Role / Title / Company</label>
                                        <input 
                                            type="text" 
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                            placeholder="e.g. CEO at GreenTech"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Feedback / Review Content</label>
                                    <textarea 
                                        value={formData.review}
                                        onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all min-h-[120px] resize-none"
                                        placeholder="Enter feedback or review content here..."
                                        required
                                    ></textarea>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rating</label>
                                    <div className="flex items-center gap-3 bg-black/2 dark:bg-white/2 border border-black/10 dark:border-white/5 p-4 rounded-2xl">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rating: star })}
                                                className="transition-all hover:scale-125"
                                            >
                                                <Star 
                                                    size={24} 
                                                    className={star <= (formData.rating || 5) ? 'text-[#04C244]' : 'text-slate-600'} 
                                                    fill={star <= (formData.rating || 5) ? 'currentColor' : 'none'} 
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-auto text-xs font-bold text-[#04C244]">{(formData.rating || 5)}.0 Rating</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Client Avatar</label>
                                    <div className="flex items-center gap-6 p-4 bg-black/2 dark:bg-white/2 border border-black/10 dark:border-white/5 rounded-2xl">
                                        <div className="relative w-20 h-20 rounded-full border-2 border-black/10 dark:border-white/10 overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                                            {formData.img ? (
                                                <img src={formData.img} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#0A0C10] via-slate-900 to-black select-none relative">
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,194,68,0.15)_0%,transparent_70%)]"></div>
                                                    <span className="text-3xl font-black text-[#04C244] tracking-widest font-mono drop-shadow-[0_0_8px_rgba(4,194,68,0.4)]">
                                                        {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                {formData.img ? 'Custom Avatar Uploaded' : 'Letter Avatar Placeholder'}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
                                                Upload a custom photo or use the automatically generated gorgeous letter avatar.
                                            </p>
                                            <div className="flex gap-2">
                                                <div className="relative">
                                                    <button 
                                                        type="button" 
                                                        className="px-3 py-1.5 bg-[#04C244] text-black text-xs font-bold rounded-lg hover:bg-[#03a837] transition-all"
                                                    >
                                                        Upload Photo
                                                    </button>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setFormData({ ...formData, img: reader.result });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                    />
                                                </div>
                                                {formData.img && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, img: '' })}
                                                        className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold rounded-lg transition-all"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-[#04C244] text-black rounded-2xl text-xs font-bold hover:bg-[#03a837] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#04C244]/10"
                                    >
                                        <Save size={16} />
                                        <span>Save Feedback</span>
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

export default AdminTestimonials;
