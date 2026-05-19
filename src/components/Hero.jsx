import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const bgImages = [
  '/assets/images/bg1.jpg',
  '/assets/images/bg2.jpg',
  '/assets/images/bg3.jpg'
];

const Hero = () => {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden transition-colors duration-300">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0 bg-white dark:bg-black transition-colors">
        <AnimatePresence>
          <motion.img
            key={currentBg}
            src={bgImages[currentBg]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Hero Background"
          />
        </AnimatePresence>
        {/* Overlay changes based on theme */}
        <div className="absolute inset-0 bg-white/80 dark:bg-black/50 transition-colors duration-300"></div>
      </div>
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#04C244]/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#04C244]/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Sparkles size={16} className="text-[#04C244]" />
            <span>Innovating Somalia's Digital Future</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white transition-colors"
          >
            Smart Digital <br className="hidden md:block" />
            <span className="text-gradient">Solutions</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed transition-colors"
          >
            We create smart digital solutions built for speed, innovation, and business growth. 
            Everything you need is connected in one seamless experience — simple, modern, and always just one tap away.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/services" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-brand text-white font-medium hover:shadow-lg hover:shadow-[#04C244]/25 transition-all flex items-center justify-center gap-2 group"
            >
              Explore Services
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/portfolio" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-slate-900 dark:text-white font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center justify-center"
            >
              View Projects
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
