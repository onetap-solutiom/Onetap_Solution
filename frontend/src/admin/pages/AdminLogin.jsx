import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/admin/dashboard";

    // Parse email verification query parameters
    const queryParams = new URLSearchParams(location.search);
    const verifiedParam = queryParams.get('verified');
    const verifyErrorParam = queryParams.get('verify_error');

    let notification = null;
    if (verifiedParam === 'success') {
        notification = {
            type: 'success',
            message: 'Email verified successfully! You can now log in.'
        };
    } else if (verifiedParam === 'already') {
        notification = {
            type: 'info',
            message: 'Email is already verified. Please log in.'
        };
    } else if (verifyErrorParam) {
        let msg = 'Failed to verify email.';
        if (verifyErrorParam === 'missing_token') msg = 'Verification token is missing.';
        if (verifyErrorParam === 'invalid_or_expired') msg = 'Verification link has expired or is invalid.';
        if (verifyErrorParam === 'user_not_found') msg = 'User account was not found.';
        
        notification = {
            type: 'error',
            message: msg
        };
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.message || 'Invalid email or password.');
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#050608] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#04C244]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#04C244]/10 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block mb-6 group">
                        <img src="/assets/images/logo.png" alt="Logo" className="h-16 w-auto mx-auto group-hover:scale-110 transition-transform duration-500" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-slate-500 text-sm font-medium">OneTap Solution </p>
                </div>

                <div className="bg-[#0A0C10]/80 backdrop-blur-2xl border border-white/5 rounded-[32px] p-10 shadow-2xl shadow-black">
                    {notification && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border rounded-2xl p-4 flex items-center gap-3 mb-6 text-sm font-medium ${
                                notification.type === 'success' 
                                    ? 'bg-[#04C244]/10 border-[#04C244]/20 text-[#04C244]' 
                                    : notification.type === 'info'
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle2 size={18} />
                            ) : (
                                <AlertCircle size={18} />
                            )}
                            <span>{notification.message}</span>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 flex items-center gap-3 mb-6 text-sm font-medium"
                        >
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#04C244] transition-colors" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-[#04C244]/50 focus:ring-4 focus:ring-[#04C244]/5 transition-all text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#04C244] transition-colors" />
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white focus:outline-none focus:border-[#04C244]/50 focus:ring-4 focus:ring-[#04C244]/5 transition-all text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#04C244] transition-colors focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-[#04C244] hover:bg-[#03a837] disabled:bg-[#04C244]/50 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#04C244]/10 mt-8 group"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Login</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-8 border-t border-white/5">
                        <Link to="/" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                            Return to Website
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
