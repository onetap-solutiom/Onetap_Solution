import { motion } from 'framer-motion';
import Contact from '../components/Contact';

const ContactPage = () => {
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
            Contact <span className="text-[#04C244]">Us</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Have a project in mind or just want to say hello? We'd love to hear from you.
            Reach out and we'll get back to you as soon as possible.
          </motion.p>
        </div>
      </section>

      {/* ── Contact Component ── */}
      <Contact />

    </div>
  );
};

export default ContactPage;
