import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Users, Layers, Star } from 'lucide-react';

const Stats = () => {
  const [statsList, setStatsList] = useState([
    { number: 1, suffix: '+', label: 'Projects Done', icon: <CheckCircle2 className="w-8 h-8 text-[#04C244]" /> },
    { number: 20, suffix: '+', label: 'Trusted Partners', icon: <Users className="w-8 h-8 text-[#04C244]" /> },
    { number: 7, suffix: '+', label: 'Services Provided', icon: <Layers className="w-8 h-8 text-[#04C244]" /> },
    { number: 99, suffix: '%', label: 'Satisfaction', icon: <Star className="w-8 h-8 text-[#04C244]" /> }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stats/public');
        const result = await res.json();
        if (result.success && result.data) {
          setStatsList([
            { number: result.data.projects, suffix: '+', label: 'Projects Done', icon: <CheckCircle2 className="w-8 h-8 text-[#04C244]" /> },
            { number: result.data.clients, suffix: '+', label: 'Trusted Partners', icon: <Users className="w-8 h-8 text-[#04C244]" /> },
            { number: result.data.services, suffix: '+', label: 'Services Provided', icon: <Layers className="w-8 h-8 text-[#04C244]" /> },
            { number: result.data.satisfaction, suffix: '%', label: 'Satisfaction', icon: <Star className="w-8 h-8 text-[#04C244]" /> }
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch public stats:', err);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-[#0A0C10] border-y border-slate-200 dark:border-white/5 transition-colors duration-300">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#04C244]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#04C244]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsList.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative"
            >
              {/* Animated glowing border background on hover */}
              <div className="absolute -inset-0.5 bg-linear-to-r from-[#04C244]/0 via-[#04C244]/50 to-[#04C244]/0 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              {/* Card content */}
              <div className="relative h-full bg-slate-50 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 rounded-3xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-black/5 dark:shadow-2xl">
                
                {/* Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:border-[#04C244]/50 transition-all duration-300">
                  {stat.icon}
                </div>
                
                {/* Number */}
                <div className="text-4xl md:text-5xl font-extrabold mb-3 text-slate-900 dark:text-white transition-colors flex items-center">
                  {stat.number}<span className="text-gradient ml-1">{stat.suffix}</span>
                </div>
                
                {/* Label */}
                <p className="text-slate-600 dark:text-slate-400 font-semibold tracking-wide uppercase text-sm transition-colors">
                  {stat.label}
                </p>
                
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
