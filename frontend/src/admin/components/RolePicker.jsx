import { Shield, ShieldAlert, PenTool, MessageSquare, Eye, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = [
    {
        id: 'Super Admin',
        title: 'Super Admin',
        desc: 'Full system access & user management',
        icon: ShieldAlert,
        color: '#F59E0B',
        permissions: ['all']
    },
    {
        id: 'Admin',
        title: 'Administrator',
        desc: 'Manage projects, services & team',
        icon: Shield,
        color: '#04C244',
        permissions: ['manage_content', 'manage_team']
    },
    {
        id: 'Editor',
        title: 'Editor',
        desc: 'Edit existing projects & team members',
        icon: PenTool,
        color: '#3B82F6',
        permissions: ['edit_content']
    },
    {
        id: 'Support',
        title: 'Support',
        desc: 'View and respond to client messages',
        icon: MessageSquare,
        color: '#8B5CF6',
        permissions: ['view_messages', 'reply_messages']
    },
    {
        id: 'Viewer',
        title: 'Viewer',
        desc: 'Read-only access to all departments',
        icon: Eye,
        color: '#64748B',
        permissions: ['view_only']
    }
];

const RolePicker = ({ value, onChange, disabled }) => {
    return (
        <div className="grid grid-cols-1 gap-3">
            {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = value === role.id;
                
                return (
                    <motion.div
                        key={role.id}
                        whileHover={disabled ? {} : { scale: 1.01 }}
                        whileTap={disabled ? {} : { scale: 0.99 }}
                        onClick={() => !disabled && onChange(role.id, role.permissions)}
                        className={`
                            relative flex items-start gap-4 p-4 rounded-2xl border transition-all
                            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                            ${isSelected 
                                ? 'bg-white/5 border-[#04C244]/50 shadow-lg shadow-[#04C244]/5' 
                                : 'bg-white/2 border-white/5 hover:border-white/20'
                            }
                        `}
                    >
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${role.color}15`, color: role.color }}
                        >
                            <Icon size={20} />
                        </div>
                        
                        <div className="flex-1 pr-6">
                            <h4 className={`text-sm font-bold mb-0.5 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                {role.title}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                {role.desc}
                            </p>
                        </div>

                        {isSelected && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#04C244] rounded-full flex items-center justify-center text-black"
                            >
                                <Check size={14} strokeWidth={3} />
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

export default RolePicker;
