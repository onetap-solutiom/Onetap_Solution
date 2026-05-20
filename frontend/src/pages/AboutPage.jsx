import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Eye, Users, Award, Zap, Globe, ShieldCheck, TrendingUp } from 'lucide-react';
import { getTeam } from '../services/api';

const AboutPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      const teamData = await getTeam();
      if (mounted) {
        setTeamMembers(teamData);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const values = [
    { icon: <Zap size={22} />, title: 'Innovation', desc: 'We embrace the latest technologies to deliver cutting-edge digital solutions.' },
    { icon: <ShieldCheck size={22} />, title: 'Integrity', desc: 'We build trust through transparency, honesty, and responsible delivery.' },
    { icon: <Users size={22} />, title: 'Collaboration', desc: 'We work closely with our clients as true partners in their digital journey.' },
    { icon: <TrendingUp size={22} />, title: 'Excellence', desc: 'We hold ourselves to the highest standards in every project we undertake.' },
    { icon: <Globe size={22} />, title: 'Impact', desc: 'We build solutions that create measurable change for businesses and communities.' },
    { icon: <Award size={22} />, title: 'Quality', desc: 'Every line of code, every pixel, is crafted with precision and care.' },
  ];

  const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div className="min-h-screen">

      {/* ── Hero Banner ── */}
      <section className="page-hero relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: '380px' }}>
        {/* Dark green radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0d4a1f_0%,#000000_70%)] hero-bg-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#04C24415_0%,transparent_60%)] hero-bg-overlay"></div>

        <div className="relative z-10 px-6 py-32">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            About <span className="text-[#04C244]">Us</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            To drive digital transformation across the nation by delivering innovative
            technology solutions that empower businesses, organizations, and communities
            to grow smarter and faster.
          </motion.p>
        </div>
      </section>

      {/* ── Who We Are ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div {...fadeUp} className="w-full lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#04C244] rounded-2xl opacity-10 blur-2xl"></div>
                <img
                  src="/assets/images/about.png"
                  alt="OneTap Solution Team"
                  className="relative rounded-2xl border border-white/10 shadow-2xl w-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="w-full lg:w-1/2 space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full border border-[#04C244]/30 bg-[#04C244]/10 text-[#04C244] text-sm font-medium">
                Who We Are
              </span>
              <p className="text-slate-400 leading-relaxed text-lg">
                OneTap Solution is a modern technology company dedicated to delivering world-class digital innovation to Somalia and beyond. Founded with a vision to bridge the technology gap, we specialize in building smart, modern, and impactful digital experiences.
              </p>
              <p className="text-slate-400 leading-relaxed">
                From web and mobile applications to multimedia production and digital marketing, we offer end-to-end technology services that help businesses scale and communities thrive.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#04C244] text-black font-semibold hover:bg-[#03a837] hover:shadow-lg hover:shadow-[#04C244]/30 transition-all"
              >
                Work With Us
              </Link>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ── Mission & Vision ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div {...fadeUp} className="glass-card p-10 border border-[#04C244]/15 hover:border-[#04C244]/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#04C244]/10 flex items-center justify-center text-[#04C244] mb-6">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-slate-400 leading-relaxed">
                To empower businesses and communities across Somalia and East Africa with innovative, reliable, and affordable digital technology solutions — making the digital world accessible to all.
              </p>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.15 }} className="glass-card p-10 border border-[#04C244]/15 hover:border-[#04C244]/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#04C244]/10 flex items-center justify-center text-[#04C244] mb-6">
                <Eye size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed">
                To become the leading technology company in Somalia — recognized for driving digital transformation, fostering local talent, and creating a future where every Somali business thrives in the digital economy.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-24 bg-white/2 border-t border-white/5">
        <div className="container mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Core <span className="text-[#04C244]">Values</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">The principles that guide everything we build, every partnership we form, and every decision we make.</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {values.map((v, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }} className="glass-card p-5 sm:p-8 hover:border-[#04C244]/30 transition-colors group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#04C244]/10 flex items-center justify-center text-[#04C244] mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
                  {v.icon}
                </div>
                <h4 className="text-white font-semibold text-sm sm:text-lg mb-1.5 sm:mb-2">{v.title}</h4>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Meet the <span className="text-[#04C244]">Team</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">A passionate group of innovators, designers, and engineers working together to shape Somalia's digital future.</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.15 }} className="glass-card overflow-hidden text-center group flex flex-col items-center p-4 sm:p-0">
                <div className="relative overflow-hidden w-20 h-20 sm:w-full sm:h-56 rounded-full sm:rounded-none flex items-center justify-center bg-linear-to-br from-[#0A0C10] via-slate-900 to-black select-none sm:border-b border-white/5 shrink-0">
                  {(member.image || member.img) ? (
                    <img
                      src={member.image || member.img}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#0A0C10] via-slate-900 to-black select-none relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,194,68,0.15)_0%,transparent_70%)]"></div>
                      <span className="text-3xl sm:text-6xl font-black text-[#04C244]/80 tracking-widest font-mono transform group-hover:scale-110 group-hover:text-[#04C244] transition-all duration-500 drop-shadow-[0_0_15px_rgba(4,194,68,0.3)]">
                        {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent hidden sm:block"></div>
                </div>
                <div className="p-3 sm:p-6 text-center w-full">
                  <h4 className="text-white font-bold text-sm sm:text-lg truncate">{member.name}</h4>
                  <p className="text-[#04C244] text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">{member.role}</p>
                </div>
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
            Ready to start your <span className="text-[#04C244]">digital journey?</span>
          </motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-slate-400 mb-8 max-w-xl mx-auto">
            Let's work together to build something great for your business.
          </motion.p>
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="px-8 py-3 rounded-full bg-[#04C244] text-black font-semibold hover:bg-[#03a837] hover:shadow-lg hover:shadow-[#04C244]/30 transition-all">
              Get In Touch
            </Link>
            <Link to="/services" className="px-8 py-3 rounded-full border border-white/20 text-white font-medium hover:border-[#04C244] hover:text-[#04C244] transition-all">
              View Services
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
