import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section className="py-12 md:py-24 bg-white dark:bg-black/50 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-r from-[#04C244] to-[#04C244] rounded-2xl opacity-20 blur-xl"></div>
              <img 
                src="/assets/images/about.png" 
                alt="OneTap Solution Team" 
                className="relative rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-full object-cover transition-colors"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 space-y-6"
          >
            <div className="inline-block px-4 py-1.5 rounded-full border border-[#04C244]/30 bg-[#04C244]/10 text-[#04C244] text-sm font-medium">
              Who We Are
            </div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white transition-colors">
              About <span className="text-gradient">Us</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg transition-colors">
              OneTap Solution is a modern technology company dedicated to delivering world-class digital innovation to our country.
              We focus on bridging the technology gap by creating smart, modern, and impactful digital experiences that empower businesses and communities.
            </p>
            <div className="pt-4">
              <Link 
                to="/about" 
                className="px-8 py-3 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-medium transition-colors"
              >
                Learn More About Us
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
