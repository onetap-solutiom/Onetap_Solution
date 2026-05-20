import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
    Plus, Edit2, Trash2, User, X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminTeam = () => {
    const { data, deleteFromCollection, updateCollection } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        role: '', 
        image: '' 
    });

    const handleOpenModal = (member = null) => {
        if (member) {
            setEditingMember(member);
            setFormData({ ...member });
        } else {
            setEditingMember(null);
            setFormData({ name: '', role: '', image: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingMember) {
            updateCollection('team', formData, editingMember.id);
        } else {
            updateCollection('team', formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Team Management</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage core team members displayed on the about page</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#04C244] text-black rounded-xl text-sm font-bold hover:bg-[#03a837] transition-all shadow-lg shadow-[#04C244]/10"
                >
                    <Plus size={18} />
                    <span>Add Member</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.team.map((m, i) => (
                    <motion.div 
                        key={m.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[32px] overflow-hidden group"
                    >
                        <div className="relative h-64 overflow-hidden flex items-center justify-center bg-linear-to-br from-[#0A0C10] via-slate-900 to-black select-none border-b border-black/10 dark:border-white/5">
                            {m.image ? (
                                <img 
                                    src={m.image} 
                                    alt={m.name} 
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#0A0C10] via-slate-900 to-black select-none relative">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,194,68,0.15)_0%,transparent_70%)]"></div>
                                    <span className="text-7xl font-black text-[#04C244]/80 tracking-widest font-mono transform group-hover:scale-110 group-hover:text-[#04C244] transition-all duration-500 drop-shadow-[0_0_15px_rgba(4,194,68,0.3)]">
                                        {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-[#0A0C10] via-transparent to-transparent"></div>
                            
                            {/* Action Overlay */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleOpenModal(m)}
                                    className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-[#04C244] hover:bg-[#04C244] hover:text-black transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => { if(confirm('Remove team member?')) deleteFromCollection('team', m.id) }}
                                    className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl text-red-500 hover:bg-red-500 hover:text-slate-900 dark:hover:text-white transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 text-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#04C244] transition-colors mb-1">{m.name}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{m.role}</p>
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
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingMember ? 'Edit Member' : 'Add Team Member'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5">
                                <div className="space-y-2 text-center pb-4">
                                    <div className="relative w-24 h-24 mx-auto group">
                                        <div className="w-full h-full rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-hidden flex items-center justify-center">
                                            {formData.name ? (
                                                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#0A0C10] via-slate-900 to-black select-none relative">
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,194,68,0.15)_0%,transparent_70%)]"></div>
                                                    <span className="text-4xl font-black text-[#04C244] tracking-widest font-mono drop-shadow-[0_0_8px_rgba(4,194,68,0.4)]">
                                                        {formData.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <User size={36} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-[#04C244] font-bold uppercase tracking-widest">Avatar Preview</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                            placeholder="Member Name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Job Role</label>
                                        <input 
                                            type="text" 
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                            placeholder="e.g. Lead Designer"
                                            required
                                        />
                                    </div>
                                </div>


                                <div className="pt-6 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-3.5 bg-[#04C244] text-black rounded-2xl text-xs font-bold hover:bg-[#03a837] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} />
                                        <span>Save Member</span>
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

export default AdminTeam;
