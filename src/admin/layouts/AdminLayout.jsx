import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminTopbar from '../components/AdminTopbar';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-white dark:bg-[#050608] text-slate-900 dark:text-slate-200 transition-colors duration-300 selection:bg-[#04C244]/30 selection:text-white">
            {/* Sidebar */}
            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Content Area */}
            <div className="md:ml-64 flex flex-col min-h-screen transition-all duration-300">
                <AdminTopbar toggleSidebar={toggleSidebar} />
                
                <main className="flex-1 p-4 md:p-8">
                    <Outlet />
                </main>

                <footer className="px-8 py-6 border-t border-black/10 dark:border-white/5 text-center md:text-left">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">
                        © {new Date().getFullYear()} <span className="text-[#04C244]">OneTap Solution</span> Admin Dashboard. All Rights Reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
