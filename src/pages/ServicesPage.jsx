import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MonitorPlay, Smartphone, GitPullRequest, Megaphone, Palette, ArrowRight, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getServices } from '../services/api';

const iconMap = {
  'fas fa-laptop-code': <MonitorPlay size={32} />,
  'fas fa-mobile-alt': <Smartphone size={32} />,
  'fas fa-cogs': <GitPullRequest size={32} />,
  'fas fa-palette': <Palette size={32} />,
  'fas fa-film': <MonitorPlay size={32} />,
  'fas fa-bullhorn': <Megaphone size={32} />,
};

const renderIcon = (icon) => {
  if (typeof icon === 'string' && icon.startsWith('fas ')) {
    return <i className={`${icon} text-3xl`}></i>;
  }
  return iconMap[icon] || <Code size={32} />;
};

const ServicesPage = () => {
  const [servicesList, setServicesList] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchServices = async () => {
      const services = await getServices();
      if (mounted) {
        setServicesList(services);
      }
    };
    fetchServices();
    return () => { mounted = false; };
  }, []);
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className="min-h-screen">

      {/* ── Hero Banner ── */}
      <section className="page-hero relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: '360px' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0d4a1f_0%,#000000_70%)] hero-bg-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#04C24415_0%,transparent_60%)] hero-bg-overlay"></div>
        <div className="relative z-10 px-6 py-28">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Our <span className="text-[#04C244]">Services</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Comprehensive digital solutions designed to elevate your business in the modern digital landscape.
          </motion.p>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesList.map((service, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 group hover:border-[#04C244]/40 transition-colors border border-white/10"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#04C244]/10 flex items-center justify-center text-[#04C244] mb-6 group-hover:scale-110 transition-transform">
                  {renderIcon(service.icon)}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#04C244] transition-colors">
                  {service.name || service.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{service.desc}</p>
                <ul className="space-y-2">
                  {(service.features || []).map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#04C244]"></span>
                      {f}
                    </li>
                  ))}
                  {(!service.features || service.features.length === 0) && (
                    <li className="flex items-center gap-2 text-sm text-slate-400 italic">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#04C244]"></span>
                      Professional {service.name} services.
                    </li>
                  )}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-24 border-t border-white/5 bg-white/2">
        <div className="container mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How We <span className="text-[#04C244]">Work</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">Our proven process ensures every project is delivered on time, on budget, and beyond expectations.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', desc: 'We learn about your business, goals, and requirements.' },
              { step: '02', title: 'Design', desc: 'We create wireframes and prototypes for your approval.' },
              { step: '03', title: 'Build', desc: 'Our team develops the solution with clean, robust code.' },
              { step: '04', title: 'Launch', desc: 'We deploy, test, and support your product after launch.' },
            ].map((step, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#04C244]/40 flex items-center justify-center text-[#04C244] font-bold text-xl mx-auto mb-4 hover:border-[#04C244] hover:bg-[#04C244]/10 transition-all">
                  {step.step}
                </div>
                <h4 className="text-white font-semibold mb-2">{step.title}</h4>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="dark-cta py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0d4a1f_0%,#000000_70%)] hero-bg-overlay"></div>
        <div className="relative z-10 text-center container mx-auto px-6">
          <motion.h2 {...fadeUp} className="text-4xl font-bold text-white mb-4">
            Have a project in <span className="text-[#04C244]">mind?</span>
          </motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-slate-400 mb-8 max-w-xl mx-auto">
            Let's talk about your idea and how we can help bring it to life.
          </motion.p>
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }}>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#04C244] text-black font-semibold hover:bg-[#03a837] hover:shadow-lg hover:shadow-[#04C244]/30 transition-all group"
            >
              Start a Project
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default ServicesPage;
