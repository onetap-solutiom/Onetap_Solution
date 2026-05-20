import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { 
    Users, Briefcase, Eye, Mail, ArrowUpRight, 
    MoreHorizontal, Download, BarChart2, Calendar, X, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminDashboard = () => {
    const { data, user } = useAdmin();
    const navigate = useNavigate();

    const ds = data.dashboardStats?.stats;

    const stats = [
        { label: 'Total Users', value: ds?.users?.value ?? data.users.length, icon: <Users size={20} />, color: 'bg-blue-500', trend: ds?.users?.trend ?? '+12%' },
        { label: 'Active Projects', value: ds?.projects?.value ?? data.projects.filter(p => p.status === 'Live').length, icon: <Briefcase size={20} />, color: 'bg-[#04C244]', trend: ds?.projects?.trend ?? '+5%' },
        { label: 'Total Visitors', value: (ds?.visitors?.value ?? data.visitorCount).toLocaleString(), icon: <Eye size={20} />, color: 'bg-amber-500', trend: ds?.visitors?.trend ?? '+28%' },
        { label: 'Unread Messages', value: ds?.messages?.value ?? data.messages.filter(m => !m.is_read).length, icon: <Mail size={20} />, color: 'bg-red-500', trend: ds?.messages?.trend ?? '-2%' },
    ];

    const [activeTab, setActiveTab] = useState('Week');

    // Export Report dropdown state
    const [exportOpen, setExportOpen] = useState(false);
    const [exportMode, setExportMode] = useState(null);
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [csvLoading, setCsvLoading] = useState(false);
    const exportRef  = useRef(null);
    const compareRef = useRef(null);

    const downloadPNG = async () => {
        if (!compareRef.current) return;
        try {
            const canvas = await html2canvas(compareRef.current, {
                backgroundColor: '#0A0C10',
                scale: 2,
                useCORS: true,
            });
            const link = document.createElement('a');
            link.download = `dashboard-comparison-${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('PNG export failed:', err);
        }
    };

    const downloadCSV = async (from, to) => {
        setCsvLoading(true);
        try {
            const params = new URLSearchParams();
            if (from) params.set('from', from);
            if (to)   params.set('to', to);
            const res = await fetch(`http://localhost:5000/api/stats/export/csv?${params}`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `visits_${from || 'all'}_to_${to || 'all'}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('CSV export failed:', err);
            alert('Export failed. Make sure the backend is running.');
        } finally {
            setCsvLoading(false);
        }
    };

    const downloadPDF = async (from, to) => {
        setCsvLoading(true);
        try {
            const params = new URLSearchParams();
            if (from) params.set('from', from);
            if (to)   params.set('to', to);
            const res  = await fetch(`http://localhost:5000/api/stats/export/csv?${params}`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            
            const text = await res.text();
            // Handle CSV parsing considering potential commas inside quotes (User Agents)
            const parseCSVRow = (str) => {
                const result = [];
                let curr = '', inQuotes = false;
                for(let i=0; i<str.length; i++){
                    if(str[i] === '"') inQuotes = !inQuotes;
                    else if(str[i] === ',' && !inQuotes) { result.push(curr); curr = ''; }
                    else curr += str[i];
                }
                result.push(curr);
                return result;
            };
            
            const rawLines = text.trim().split('\n').slice(1);
            const rows = rawLines.map(parseCSVRow);

            // ----- DATA ANALYSIS -----
            const ipSet = new Set();
            let mobile = 0, desktop = 0, tablet = 0;
            const browsers = {};
            const osCount = {};

            rows.forEach(r => {
                const ip = r[1] || '';
                const ua = (r[2] || '').toLowerCase();
                if (ip) ipSet.add(ip);

                // Device Analysis
                if (ua.includes('mobi') || ua.includes('android') || ua.includes('iphone')) mobile++;
                else if (ua.includes('tablet') || ua.includes('ipad')) tablet++;
                else desktop++;

                // Browser Analysis
                if (ua.includes('edg')) browsers['Edge'] = (browsers['Edge'] || 0) + 1;
                else if (ua.includes('chrome')) browsers['Chrome'] = (browsers['Chrome'] || 0) + 1;
                else if (ua.includes('safari') && !ua.includes('chrome')) browsers['Safari'] = (browsers['Safari'] || 0) + 1;
                else if (ua.includes('firefox')) browsers['Firefox'] = (browsers['Firefox'] || 0) + 1;
                else browsers['Other'] = (browsers['Other'] || 0) + 1;

                // OS Analysis
                if (ua.includes('win')) osCount['Windows'] = (osCount['Windows'] || 0) + 1;
                else if (ua.includes('mac')) osCount['MacOS'] = (osCount['MacOS'] || 0) + 1;
                else if (ua.includes('linux') && !ua.includes('android')) osCount['Linux'] = (osCount['Linux'] || 0) + 1;
                else if (ua.includes('android')) osCount['Android'] = (osCount['Android'] || 0) + 1;
                else if (ua.includes('iphone') || ua.includes('ipad')) osCount['iOS'] = (osCount['iOS'] || 0) + 1;
                else osCount['Other'] = (osCount['Other'] || 0) + 1;
            });

            const totalVisits = rows.length;
            const uniqueVisitors = ipSet.size;

            // ----- PDF GENERATION -----
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            // Helper for sorting dicts
            const sortDict = (dict) => Object.entries(dict).sort((a,b) => b[1] - a[1]);

            // HEADER
            doc.setFillColor(4, 194, 68);
            doc.rect(0, 0, 210, 20, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(255, 255, 255);
            doc.text('OTS — Data Analytics Report', 15, 14);

            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 30);
            doc.text(`Reporting Period: ${from || 'Beginning'}  ->  ${to || 'Present'}`, 15, 35);

            // 1. BUSINESS & OPERATIONS OVERVIEW
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('1. Business & Operations Overview', 15, 48);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Customers (Users): ${data.users?.length || 0}`, 20, 56);
            doc.text(`Total Projects (Completed/Live): ${data.projects?.length || 0}`, 20, 62);
            doc.text(`Messages/Leads Received: ${data.messages?.length || 0}`, 20, 68);
            doc.text(`Active Services: ${data.services?.length || 0}`, 20, 74);

            // 1.1 PROJECT DETAILS TABLE
            if (data.projects && data.projects.length > 0) {
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('Recent Projects & Clients', 15, 84);

                autoTable(doc, {
                    startY: 88,
                    margin: { left: 15 },
                    head: [['Project Name', 'Client/For', 'Category', 'Status']],
                    body: data.projects.map(p => [
                        p.title || 'N/A', 
                        p.client || 'Internal', 
                        p.category || 'N/A', 
                        p.status || 'N/A'
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [4, 194, 68], textColor: [255, 255, 255] },
                    styles: { fontSize: 8, cellPadding: 2 }
                });
            }

            let nextY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 84;

            // 2. TRAFFIC EXECUTIVE SUMMARY
            // If the first page is getting too full, we might need to check Y or just let autoTable flow.
            // For safety, let's just add a new page if nextY > 250
            if (nextY > 250) { doc.addPage(); nextY = 20; }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('2. Traffic Analytics Summary', 15, nextY);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Page Views: ${totalVisits}`, 20, nextY + 8);
            doc.text(`Unique Visitors (IPs): ${uniqueVisitors}`, 20, nextY + 14);
            doc.text(`Avg. Pages per Visitor: ${uniqueVisitors ? (totalVisits / uniqueVisitors).toFixed(2) : 0}`, 20, nextY + 20);

            nextY = nextY + 30;
            if (nextY > 250) { doc.addPage(); nextY = 20; }

            // 3. DEVICE DISTRIBUTION
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Device Distribution', 15, nextY);
            
            autoTable(doc, {
                startY: nextY + 4,
                margin: { left: 15 },
                tableWidth: 80,
                head: [['Device', 'Count', 'Percentage']],
                body: [
                    ['Desktop', desktop, totalVisits ? ((desktop/totalVisits)*100).toFixed(1) + '%' : '0%'],
                    ['Mobile', mobile, totalVisits ? ((mobile/totalVisits)*100).toFixed(1) + '%' : '0%'],
                    ['Tablet', tablet, totalVisits ? ((tablet/totalVisits)*100).toFixed(1) + '%' : '0%'],
                ],
                theme: 'grid',
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
                styles: { fontSize: 9, cellPadding: 2 }
            });

            // 4. PLATFORM & OS ANALYTICS
            nextY = doc.lastAutoTable.finalY + 15;
            if (nextY > 250) { doc.addPage(); nextY = 20; }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('OS & Platform Analytics', 15, nextY);

            const osBody = sortDict(osCount).map(([k,v]) => [k, v, totalVisits ? ((v/totalVisits)*100).toFixed(1) + '%' : '0%']);
            autoTable(doc, {
                startY: nextY + 4,
                margin: { left: 15 },
                tableWidth: 80,
                head: [['Operating System', 'Visits', 'Share']],
                body: osBody,
                theme: 'grid',
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
                styles: { fontSize: 9, cellPadding: 2 }
            });

            // 5. BROWSER PREFERENCES
            nextY = doc.lastAutoTable.finalY + 15;
            if (nextY > 250) { doc.addPage(); nextY = 20; }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Browser Preferences', 15, nextY);

            const browserBody = sortDict(browsers).map(([k,v]) => [k, v, totalVisits ? ((v/totalVisits)*100).toFixed(1) + '%' : '0%']);
            autoTable(doc, {
                startY: nextY + 4,
                margin: { left: 15 },
                tableWidth: 80,
                head: [['Browser', 'Visits', 'Share']],
                body: browserBody,
                theme: 'grid',
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
                styles: { fontSize: 9, cellPadding: 2 }
            });



            doc.save(`OTS_Analytics_Report_${from || 'All'}_to_${to || 'All'}.pdf`);
        } catch (err) {
            console.error('PDF export failed:', err);
            alert('PDF export failed. Make sure the backend is running.');
        } finally {
            setCsvLoading(false);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) {
                setExportOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const exportOptions = [
        { key: 'compare', icon: <BarChart2 size={16} />, label: 'Bar Comparison', desc: 'Compare your stats side by side' },
        { key: 'year',    icon: <Calendar  size={16} />, label: 'Full Year',       desc: 'View the entire year data' },
        { key: 'custom',  icon: <Download  size={16} />, label: 'Custom Range',    desc: 'Pick a date range to export' },
    ];

    const chartDataMap = data.dashboardStats?.chartData || {
        'Day': [
            { day: '08:00', value: 20 },
            { day: '10:00', value: 35 },
            { day: '12:00', value: 60 },
            { day: '14:00', value: 85 },
            { day: '16:00', value: 45 },
            { day: '18:00', value: 55 },
            { day: '20:00', value: 30 },
        ],
        'Week': [
            { day: 'Mon', value: 40 },
            { day: 'Tue', value: 65 },
            { day: 'Wed', value: 45 },
            { day: 'Thu', value: 90 },
            { day: 'Fri', value: 55 },
            { day: 'Sat', value: 80 },
            { day: 'Sun', value: 70 },
        ],
        'Month': [
            { day: 'Jan', value: 30 },
            { day: 'Feb', value: 45 },
            { day: 'Mar', value: 55 },
            { day: 'Apr', value: 85 },
            { day: 'May', value: 95 },
            { day: 'Jun', value: 70 },
            { day: 'Jul', value: 80 },
        ]
    };

    const currentChartData = chartDataMap[activeTab];

    // Dynamically highlight the bar that represents right now
    const now = new Date();
    const activeHighlightIndex = (() => {
        if (activeTab === 'Day') {
            const h = now.getHours();
            if (h < 9)  return 0;
            if (h < 11) return 1;
            if (h < 13) return 2;
            if (h < 15) return 3;
            if (h < 17) return 4;
            if (h < 19) return 5;
            return 6;
        }
        if (activeTab === 'Week') {
            // getDay(): 0=Sun,1=Mon,...,6=Sat => Mon=0,Tue=1,...
            return (now.getDay() + 6) % 7;
        }
        // Month: highlight current month (0-indexed)
        return now.getMonth();
    })();

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 w-full md:w-auto" ref={exportRef}>
                    {/* Export Report Button */}
                    <div className="relative w-full sm:w-auto">
                        <button
                            onClick={() => { setExportOpen(o => !o); setExportMode(null); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                        >
                            <Download size={15} />
                            Export Report
                            <ChevronDown size={14} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                        {exportOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                transition={{ duration: 0.18 }}
                                className="absolute left-0 sm:left-auto sm:right-0 top-[calc(100%+8px)] w-[calc(200%+12px)] sm:w-72 bg-white dark:bg-[#0f1117] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 z-50 overflow-hidden"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 dark:border-white/5">
                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Export Options</span>
                                    <button onClick={() => setExportOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>

                                {/* Options */}
                                {!exportMode && (
                                    <div className="p-3 space-y-1">
                                        {exportOptions.map(opt => (
                                            <button
                                                key={opt.key}
                                                onClick={() => setExportMode(opt.key)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-all text-left group"
                                            >
                                                <span className="p-2 rounded-lg bg-[#04C244]/10 text-[#04C244] group-hover:bg-[#04C244]/20 transition-colors">{opt.icon}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{opt.label}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium">{opt.desc}</p>
                                                </div>
                                                <ChevronDown size={14} className="ml-auto -rotate-90 text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Bar Comparison */}
                                {exportMode === 'compare' && (
                                    <div className="p-5 space-y-4">
                                        <button onClick={() => setExportMode(null)} className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"><ChevronDown size={12} className="rotate-90" /> Back</button>
                                        <p className="text-xs text-slate-400 font-medium">Compare your current stats side by side. Visit the Analytics page for the full chart.</p>
                                        <div ref={compareRef} className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#0A0C10] p-2 rounded-xl">
                                            {stats.map((s, i) => (
                                                <div key={i} className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center">
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{s.label.replace('Total ','').replace('Unread ','')}</p>
                                                    <p className="text-lg font-black text-white">{s.value}</p>
                                                    <span className={`text-[10px] font-bold ${s.trend?.startsWith('+') ? 'text-emerald-500' : 'text-red-400'}`}>{s.trend}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={downloadPNG} className="w-full py-2.5 bg-[#04C244] text-black text-xs font-black rounded-xl hover:bg-[#03a837] transition-all flex items-center justify-center gap-2">
                                            <Download size={13} /> Download PNG
                                        </button>
                                        <button
                                            onClick={() => downloadPDF(
                                                new Date().toISOString().slice(0,10),
                                                new Date().toISOString().slice(0,10)
                                            )}
                                            disabled={csvLoading}
                                            className="w-full py-2.5 bg-red-500/90 disabled:opacity-50 text-white text-xs font-black rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download size={13} /> {csvLoading ? 'Exporting…' : 'Download PDF'}
                                        </button>
                                    </div>
                                )}

                                {/* Full Year */}
                                {exportMode === 'year' && (() => {
                                    const year = new Date().getFullYear();
                                    const monthChart = data.dashboardStats?.chartData?.Month || [];
                                    return (
                                        <div className="p-5 space-y-4">
                                            <button onClick={() => setExportMode(null)} className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"><ChevronDown size={12} className="rotate-90" /> Back</button>
                                            <p className="text-xs font-black text-slate-900 dark:text-white">{year} — Full Year Visits</p>
                                            <div className="flex items-end gap-1 h-20">
                                                {monthChart.map((m, i) => {
                                                    const maxV = Math.max(...monthChart.map(x => x.value), 1);
                                                    return (
                                                        <div key={i} title={`${m.day}: ${m.value}`} className="flex-1 flex flex-col items-center justify-end gap-1">
                                                            <div
                                                                style={{ height: `${(m.value / maxV) * 100}%` }}
                                                                className={`w-full rounded-t-sm transition-all ${ i === new Date().getMonth() ? 'bg-[#04C244]' : 'bg-white/15'}`}
                                                            />
                                                            <span className="text-[8px] text-slate-600 font-bold">{m.day}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => downloadCSV(
                                                        `${new Date().getFullYear()}-01-01`,
                                                        `${new Date().getFullYear()}-12-31`
                                                    )}
                                                    disabled={csvLoading}
                                                    className="py-2.5 bg-[#04C244] disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-black rounded-xl hover:bg-[#03a837] transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Download size={12} />
                                                    {csvLoading ? '…' : 'CSV'}
                                                </button>
                                                <button
                                                    onClick={() => downloadPDF(
                                                        `${new Date().getFullYear()}-01-01`,
                                                        `${new Date().getFullYear()}-12-31`
                                                    )}
                                                    disabled={csvLoading}
                                                    className="py-2.5 bg-red-500/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Download size={12} />
                                                    {csvLoading ? '…' : 'PDF'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Custom Date Range */}
                                {exportMode === 'custom' && (
                                    <div className="p-5 space-y-4">
                                        <button onClick={() => setExportMode(null)} className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"><ChevronDown size={12} className="rotate-90" /> Back</button>
                                        <p className="text-xs font-black text-slate-900 dark:text-white">Select a date range to export</p>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">From</label>
                                                <input
                                                    type="date"
                                                    value={customFrom}
                                                    onChange={e => setCustomFrom(e.target.value)}
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#04C244]/50 transition-colors scheme-dark"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">To</label>
                                                <input
                                                    type="date"
                                                    value={customTo}
                                                    onChange={e => setCustomTo(e.target.value)}
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-[#04C244]/50 transition-colors scheme-dark"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => downloadCSV(customFrom, customTo)}
                                                disabled={!customFrom || !customTo || csvLoading}
                                                className="py-2.5 bg-[#04C244] disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-black rounded-xl hover:bg-[#03a837] transition-all flex items-center justify-center gap-1"
                                            >
                                                <Download size={12} />
                                                {csvLoading ? '…' : 'CSV'}
                                            </button>
                                            <button
                                                onClick={() => downloadPDF(customFrom, customTo)}
                                                disabled={!customFrom || !customTo || csvLoading}
                                                className="py-2.5 bg-red-500/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-1"
                                            >
                                                <Download size={12} />
                                                {csvLoading ? '…' : 'PDF'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>

                    <button 
                        onClick={() => navigate('/admin/projects')}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#04C244] text-black rounded-xl text-sm font-bold hover:bg-[#03a837] transition-all shadow-lg shadow-[#04C244]/10 text-center flex items-center justify-center"
                    >
                        + New Project
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[24px] p-4 sm:p-6 hover:border-[#04C244]/20 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${stat.color}/10 text-${stat.color.split('-')[1]}-500`}>
                                {stat.icon}
                            </div>
                            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                
                {/* Revenue Chart (Upgraded) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[32px] p-4 sm:p-8 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#04C244]/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Visits Overview</h3>
                            <p className="text-slate-500 text-xs font-medium">{activeTab}ly performance analytics & growth</p>
                        </div>
                        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5 self-start sm:self-auto">
                            {['Day', 'Week', 'Month'].map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab ? 'bg-[#04C244] text-black shadow-lg shadow-[#04C244]/20' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative h-56 sm:h-72 w-full mt-4">
                        {/* Y-Axis Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[100, 75, 50, 25, 0].map((val) => (
                                <div key={val} className="flex items-center gap-4 w-full">
                                    <span className="text-[10px] font-bold text-slate-600 w-6 text-right">{val}%</span>
                                    <div className="flex-1 border-t border-black/10 dark:border-white/5"></div>
                                </div>
                            ))}
                        </div>

                        {/* Bars Container */}
                        <div className="absolute inset-0 left-10 flex items-end justify-between gap-1.5 sm:gap-3 px-1 sm:px-2 h-[calc(100%-12px)]">
                            {currentChartData.map((item, i) => (
                                <div key={`${activeTab}-${i}`} className="flex-1 flex flex-col justify-end h-full group relative">
                                    {/* Bar with Gradient */}
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${item.value}%` }}
                                        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: i * 0.05 }}
                                        className={`w-full max-w-[32px] mx-auto rounded-t-xl relative group-hover:brightness-125 transition-all cursor-pointer ${
                                            i === activeHighlightIndex
                                            ? 'bg-linear-to-t from-[#04C244] to-emerald-400 shadow-[0_0_20px_rgba(4,194,68,0.2)]' 
                                            : 'bg-linear-to-t from-black/5 to-black/15 dark:from-white/10 dark:to-white/20 group-hover:from-black/15 group-hover:to-black/25 dark:group-hover:from-white/20 dark:group-hover:to-white/30'
                                        }`}
                                    >
                                        {/* Hover Tooltip */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 text-black dark:text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl border border-black/5 dark:border-white/5 z-20">
                                            {item.value} Visits
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-zinc-800 rotate-45"></div>
                                        </div>
                                    </motion.div>
                                    
                                    {/* X-Axis Label */}
                                    <div className="absolute -bottom-8 left-0 right-0 text-center">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${i === activeHighlightIndex ? 'text-[#04C244]' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-300'}`}>
                                            {item.day}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Projects */}
                <div className="bg-white dark:bg-[#0A0C10] border border-black/10 dark:border-white/5 rounded-2xl sm:rounded-[32px] p-4 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Projects</h3>
                        <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 text-slate-500">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {data.projects.slice(0, 4).map((p, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-[#04C244] group-hover:bg-[#04C244]/10 transition-colors shrink-0">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#04C244] transition-colors truncate">{p.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider truncate">{p.client}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${p.status === 'Live' ? 'bg-[#04C244]/10 text-[#04C244]' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {p.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 sm:mt-10 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 group">
                        <span>View All Projects</span>
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
