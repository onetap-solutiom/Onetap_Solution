import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MonitorPlay, Smartphone, GitPullRequest, Palette, Megaphone, ArrowRight, Code } from 'lucide-react';
import { getServices } from '../services/api';

const iconMap = {
  'fas fa-laptop-code': <MonitorPlay size={32} className="text-[#04C244]" />,
  'fas fa-mobile-alt': <Smartphone size={32} className="text-[#04C244]" />,
  'fas fa-cogs': <GitPullRequest size={32} className="text-[#04C244]" />,
  'fas fa-palette': <Palette size={32} className="text-[#04C244]" />,
  'fas fa-film': <MonitorPlay size={32} className="text-[#04C244]" />,
  'fas fa-bullhorn': <Megaphone size={32} className="text-[#04C244]" />,
};

const renderIcon = (icon) => {
  if (typeof icon === 'string' && icon.startsWith('fas ')) {
    return <i className={`${icon} text-3xl text-[#04C244]`}></i>;
  }
  return iconMap[icon] || <Code size={32} className="text-[#04C244]" />;
};

const Services = () => {
  const [servicesList, setServicesList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchServices = async () => {
      const services = await getServices();
      if (mounted) {
        setServicesList(services.slice(0, 3));
      }
    };
    fetchServices();
    return () => { mounted = false; };
  }, []);

  const handleScroll = (e) => {
    const container = e.target;
    const scrollPosition = container.scrollLeft;
    const cardWidth = container.scrollWidth / servicesList.length;
    const index = Math.round(scrollPosition / cardWidth);
    if (index >= 0 && index < servicesList.length) {
      setActiveIndex(index);
    }
  };
  
  return (
    <section className="py-12 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4"
          >
            Our <span className="text-gradient">Services</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            We provide high-end digital solutions tailored to your business needs.
          </motion.p>
        </div>

        {/* Desktop Container */}
        <div className="hidden md:flex flex-wrap justify-center gap-8">
          {servicesList.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="glass-card p-8 group hover:border-[#04C244]/50 transition-colors w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {renderIcon(service.icon)}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-[#04C244] transition-colors">
                {service.name || service.title}
              </h3>
              <p className="text-slate-400 mb-6 line-clamp-3">
                {service.desc || service.description}
              </p>
              <Link 
                to="/services" 
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 group-hover:text-white transition-colors"
              >
                Learn More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile Swipeable Slider with Card Peeking */}
        <div className="md:hidden relative w-full overflow-hidden">
          <div 
            id="services-slider"
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-[10vw] scrollbar-none py-4 w-full"
            style={{ scrollBehavior: 'smooth' }}
          >
            {servicesList.map((service, index) => (
              <div
                key={index}
                className="snap-center shrink-0 w-[80vw] max-w-[320px] glass-card p-7 group border border-white/10 hover:border-[#04C244]/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {renderIcon(service.icon)}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-[#04C244] transition-colors">
                    {service.name || service.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-5 line-clamp-3 leading-relaxed">
                    {service.desc || service.description}
                  </p>
                </div>
                <Link 
                  to="/services" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 group-hover:text-white transition-colors mt-auto"
                >
                  Learn More <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {servicesList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const container = document.getElementById('services-slider');
                  if (container) {
                    const cardWidth = container.scrollWidth / servicesList.length;
                    container.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'w-6 bg-[#04C244]' : 'w-1.5 bg-slate-600/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link to="/services" className="inline-block px-8 py-3 rounded-full border border-black/15 dark:border-white/10 hover:border-[#04C244] dark:hover:border-[#04C244] text-black dark:text-white font-medium transition-colors">
            View All Services
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
