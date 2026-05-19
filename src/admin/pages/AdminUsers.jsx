import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Search, Plus, Edit2, Trash2, Shield, Circle, Filter, X, Lock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RolePicker from '../components/RolePicker';

const AdminUsers = () => {
    const { data, deleteFromCollection, updateCollection } = useAdmin();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        role: 'Admin', 
        status: 'Active',
        password: '',
        permissions: ['manage_content', 'manage_team']
    });

    const filteredUsers = data.users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                status: user.status || 'Active',
                password: '', // Don't show password on edit
                permissions: user.permissions || []
            });
        } else {
            setEditingUser(null);
            setFormData({ 
                name: '', 
                email: '', 
                role: 'Admin', 
                status: 'Active',
                password: '',
                permissions: ['manage_content', 'manage_team']
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = { ...formData };
        if (editingUser && !submissionData.password) {
            delete submissionData.password;
        }

        if (editingUser) {
            updateCollection('users', submissionData, editingUser.id);
        } else {
            updateCollection('users', { 
                ...submissionData, 
                joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) 
            });
        }
        setIsModalOpen(false);
    };

    const handleRoleChange = (roleId, permissions) => {
        setFormData({ ...formData, role: roleId, permissions });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage administrative access and system permissions</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#04C244] text-black rounded-xl text-sm font-bold hover:bg-[#03a837] transition-all shadow-lg shadow-[#04C244]/10"
                >
                    <Plus size={18} />
                    <span>Add New User</span>
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-[32px] overflow-hidden">
                <div className="p-6 border-b border-black/10 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/1">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search users by name or email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                            <Filter size={18} />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left border-b border-black/10 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Access Role</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Joined Date</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/10 dark:divide-white/5">
                            {filteredUsers.map((u, i) => (
                                <motion.tr 
                                    key={u.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#04C244]/20 to-emerald-500/5 flex items-center justify-center text-[#04C244] font-bold text-sm">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#04C244] transition-colors">{u.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className={u.role === 'Super Admin' ? 'text-amber-500' : 'text-slate-500'} />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{u.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${u.status === 'Active' ? 'bg-[#04C244]/10 text-[#04C244]' : 'bg-slate-500/10 text-slate-500'}`}>
                                            <Circle size={8} fill="currentColor" />
                                            <span>{u.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-medium text-slate-500">{u.joined}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(u)}
                                                className="p-2 bg-black/5 dark:bg-white/5 rounded-lg text-slate-400 hover:text-[#04C244] hover:bg-[#04C244]/10 transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => { if(confirm('Are you sure you want to delete this user?')) deleteFromCollection('users', u.id) }}
                                                className="p-2 bg-black/5 dark:bg-white/5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-slate-500 font-medium">No users found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-[32px] w-full max-w-lg max-h-[90vh] overflow-hidden relative z-10 shadow-2xl flex flex-col"
                        >
                            <div className="p-4 sm:p-8 border-b border-black/10 dark:border-white/5 flex items-center justify-between shrink-0">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingUser ? 'Edit System User' : 'Create New User'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-4 sm:p-8 overflow-y-auto space-y-8 custom-scrollbar">
                                {/* Basic Info Section */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold text-[#04C244] uppercase tracking-[0.2em]">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                            <input 
                                                type="text" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                                placeholder="e.g. Faisal Hassan"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                            <input 
                                                type="email" 
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                                placeholder="email@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Lock size={12} />
                                                {editingUser ? 'New Password (Optional)' : 'Password'}
                                            </label>
                                            <input 
                                                type="password" 
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                                placeholder="••••••••"
                                                required={!editingUser}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Activity size={12} />
                                                Account Status
                                            </label>
                                            <div className="flex items-center gap-2 p-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl">
                                                {['Active', 'Offline'].map((status) => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, status })}
                                                        className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${formData.status === status ? 'bg-[#04C244] text-black' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Role Section */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-[#04C244] uppercase tracking-[0.2em]">Access Role & Permissions</h3>
                                    <RolePicker 
                                        value={formData.role} 
                                        onChange={handleRoleChange} 
                                    />
                                </div>

                                <div className="pt-6 flex gap-4 shrink-0">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-[#04C244] text-black rounded-2xl text-sm font-bold hover:bg-[#03a837] transition-all shadow-xl shadow-[#04C244]/20"
                                    >
                                        {editingUser ? 'Save Changes' : 'Create Account'}
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

export default AdminUsers;
