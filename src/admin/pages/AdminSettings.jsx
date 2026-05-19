import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
    Globe, Shield, Bell, 
    Smartphone, Database, Save, CheckCircle2, 
    Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSettings = () => {
    const { user, updateCollection } = useAdmin();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    // Persisted General Settings States (Website Name is read-only from code)
    const [siteName] = useState('OneTap Solution');
    const [companyEmail, setCompanyEmail] = useState('info@onetapsolution.com');
    const [contactPhone, setContactPhone] = useState('+252 61 9586339');
    const [officeLocation, setOfficeLocation] = useState('Mogadishu, Somalia');

    // Fetch site settings from MySQL database on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/settings/');
                const result = await res.json();
                if (result.success && result.data) {
                    setCompanyEmail(result.data.company_email);
                    setContactPhone(result.data.contact_phone);
                    setOfficeLocation(result.data.office_location);
                }
            } catch (err) {
                console.error("Failed to fetch settings from database:", err);
            }
        };
        fetchSettings();
    }, []);

    // Security / Password Update States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/settings/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    company_email: companyEmail,
                    contact_phone: contactPhone,
                    office_location: officeLocation
                })
            });
            const result = await res.json();
            if (res.ok && result.success) {
                // Settings saved successfully
                window.dispatchEvent(new Event('app-settings-updated'));
            } else {
                alert(result.message || 'Failed to save settings.');
            }
        } catch (err) {
            console.error('Failed to save settings:', err);
            alert('Cannot connect to database. Make sure backend is running.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!newPassword || !confirmPassword) {
            setPasswordError('Please fill out all password fields.');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await updateCollection('users', { password: newPassword }, user.id);
            if (res.success) {
                setPasswordSuccess('Password updated successfully in database!');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordError(res.message || 'Failed to update password.');
            }
        } catch (err) {
            console.error('Password update failed:', err);
            setPasswordError('Cannot connect to database. Make sure backend is running.');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage global configurations and security</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#04C244] text-black rounded-xl text-sm font-bold hover:bg-[#03a837] transition-all shadow-lg shadow-[#04C244]/10 disabled:opacity-50"
                >
                    {isSaving ? <span className="flex items-center gap-2 italic"><div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Saving...</span> : <><Save size={18} /><span>Save Configuration</span></>}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Tabs */}
                <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 lg:w-64 shrink-0 no-scrollbar">
                    {[
                        { id: 'general', label: 'General', icon: <Globe size={18} /> },
                        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
                        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
                        { id: 'appearance', label: 'Appearance', icon: <Smartphone size={18} /> },
                        { id: 'backup', label: 'Backup & Data', icon: <Database size={18} /> },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all shrink-0
                                ${activeTab === tab.id 
                                    ? 'bg-[#04C244]/10 text-[#04C244] border border-[#04C244]/20' 
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                                }
                            `}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 space-y-8">
                    {activeTab === 'general' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[40px] p-4 sm:p-10 space-y-8"
                        >
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Globe className="text-[#04C244]" size={20} />
                                    Company Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mr-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Website Name</label>
                                            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-500/20">Code Only</span>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={siteName} 
                                            readOnly
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-400 dark:text-slate-500 focus:outline-none cursor-not-allowed text-sm" 
                                            title="Website name can only be changed via the source code."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Company Email</label>
                                        <input 
                                            type="email" 
                                            value={companyEmail} 
                                            onChange={(e) => setCompanyEmail(e.target.value)} 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contact Phone</label>
                                        <input 
                                            type="text" 
                                            value={contactPhone} 
                                            onChange={(e) => setContactPhone(e.target.value)} 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Office Location</label>
                                        <input 
                                            type="text" 
                                            value={officeLocation} 
                                            onChange={(e) => setOfficeLocation(e.target.value)} 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="pt-8 border-t border-black/10 dark:border-white/5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Contact Channels</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/1 border border-black/10 dark:border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle2 size={18} /></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp Integration</p>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Active · Connected to {contactPhone}</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-red-500 hover:underline">Disconnect</button>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[40px] p-4 sm:p-10 space-y-8"
                        >
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Lock className="text-[#04C244]" size={20} />
                                    Password Management
                                </h3>
                                <form onSubmit={handleUpdatePassword} className="max-w-md space-y-6">
                                    {passwordError && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-2xl">
                                            {passwordError}
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-2xl">
                                            {passwordSuccess}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                        <input 
                                            type="password" 
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min. 8 characters" 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm password" 
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#04C244]/30 transition-all text-sm" 
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="px-6 py-3 bg-[#04C244] text-black disabled:opacity-50 rounded-2xl text-xs font-bold hover:bg-[#03a837] transition-all shadow-md shadow-[#04C244]/10"
                                    >
                                        {passwordLoading ? 'Updating…' : 'Update Password'}
                                    </button>
                                </form>
                            </section>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
