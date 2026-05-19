import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
    Plus, Search, Edit2, Trash2, ExternalLink, 
    Calendar, Briefcase, Building2, 
    X, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProjects = () => {
    const { data, deleteFromCollection, updateCollection } = useAdmin();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        client: '', 
        status: 'Development', 
        deadline: '',
        url: '',
        category: 'Web Development',
        image: ''
    });

    const filteredProjects = data.projects.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.client.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            // Convert "May 25, 2026" back to "2026-05-25" for input[type=date]
            let dateVal = '';
            try {
                const d = new Date(project.deadline);
                if(!isNaN(d.getTime())) dateVal = d.toISOString().split('T')[0];
            } catch {
                // Ignore parsing errors for invalid dates
            }

            setFormData({ 
                name: project.name, 
                client: project.client, 
                status: project.status, 
                deadline: dateVal,
                url: project.url || '',
                category: project.category || 'Web Development',
                image: project.image || ''
            });
        } else {
            setEditingProject(null);
            setFormData({ 
                name: '', 
                client: '', 
                status: 'Development', 
                deadline: '',
                url: '',
                category: 'Web Development',
                image: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Format date for display
        const dateObj = new Date(formData.deadline);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

        const submissionData = {
            ...formData,
            deadline: formattedDate,
            progress: formData.status === 'Live' ? 100 : (editingProject?.progress || 0),
            icon: formData.category === 'Mobile App' ? 'fas fa-mobile-alt' : 'fas fa-code'
        };

        if (editingProject) {
            updateCollection('projects', submissionData, editingProject.id);
        } else {
            updateCollection('projects', submissionData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Project Portfolio</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage client projects and case studies</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#04C244] text-black rounded-xl text-sm font-bold hover:bg-[#03a837] transition-all shadow-lg shadow-[#04C244]/10"
                >
                    <Plus size={18} />
                    <span>Create Project</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl p-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search projects or clients..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                    <Filter size={18} />
                    <span>Status</span>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((p, i) => (
                    <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[32px] p-5 sm:p-6 hover:border-[#04C244]/20 transition-all group relative overflow-hidden"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                p.status === 'Live' ? 'bg-[#04C244]/10 text-[#04C244]' : 
                                p.status === 'Development' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-amber-500/10 text-amber-500'
                            }`}>
                                {p.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-[#04C244] group-hover:scale-110 transition-transform duration-500">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#04C244] transition-colors">{p.name}</h3>
                                <p className="text-xs text-slate-500 font-medium">{p.category || 'Technology'}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Building2 size={16} className="text-slate-600" />
                                <span className="text-xs font-medium">{p.client}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Calendar size={16} className="text-slate-600" />
                                <span className="text-xs font-medium">Deadline: {p.deadline}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2 mb-8">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <span>Progress</span>
                                <span>{p.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${p.progress}%` }}
                                    className={`h-full rounded-full ${p.status === 'Live' ? 'bg-[#04C244]' : 'bg-blue-500'}`}
                                ></motion.div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-black/10 dark:border-white/5">
                            <button 
                                onClick={() => handleOpenModal(p)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all"
                            >
                                <Edit2 size={14} />
                                <span>Edit</span>
                            </button>
                            <button 
                                onClick={() => { if(confirm('Delete project?')) deleteFromCollection('projects', p.id) }}
                                className="px-3 py-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl text-red-500 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                            {p.url && (
                                <a 
                                    href={p.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-3 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            )}
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
                            className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-[32px] w-full max-w-xl overflow-hidden relative z-10 shadow-2xl my-auto"
                        >
                            <div className="p-4 sm:p-8 border-b border-black/10 dark:border-white/5 flex items-center justify-between bg-black/2 dark:bg-white/2">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Project Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                            placeholder="e.g. OneTap Solution"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.client}
                                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                            placeholder="e.g. TechCorp Inc."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                        <select 
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all appearance-none"
                                        >
                                            <option value="Web Development" className="bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-white">Web Development</option>
                                            <option value="Mobile App" className="bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-white">Mobile App</option>
                                            <option value="Business Automation" className="bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-white">Business Automation</option>
                                            <option value="Multimedia" className="bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-white">Multimedia</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
                                        <select 
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all appearance-none"
                                        >
                                            <option value="Development" className="bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-white">In Development</option>
                                            <option value="Pending" className="bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-white">Pending Review</option>
                                            <option value="Live" className="bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-white">Live / Completed</option>
                                            <option value="Hold" className="bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-white">On Hold</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Deadline</label>
                                        <input 
                                            type="date" 
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Project URL</label>
                                        <input 
                                            type="url" 
                                            value={formData.url}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Project Thumbnail</label>
                                    <div className="relative group/upload">
                                        <div className={`w-full aspect-video rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${formData.image ? 'border-[#04C244]/50 bg-[#04C244]/5' : 'border-black/10 dark:border-white/10 bg-black/2 dark:bg-white/2 hover:border-[#04C244]/30 hover:bg-[#04C244]/2'}`}>
                                            {formData.image ? (
                                                <div className="relative w-full h-full group/image">
                                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, image: '' })}
                                                            className="p-3 bg-red-500 text-white rounded-2xl hover:scale-110 transition-transform"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover/upload:text-[#04C244] group-hover/upload:scale-110 transition-all">
                                                        <Plus size={24} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Upload Project Image</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">PNG, JPG or WebP (Recommended: 1200x800)</p>
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setFormData({ ...formData, image: reader.result });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-[#04C244] text-black rounded-2xl text-sm font-bold hover:bg-[#03a837] transition-all shadow-xl shadow-[#04C244]/10"
                                    >
                                        {editingProject ? 'Save Changes' : 'Launch Project'}
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

export default AdminProjects;
