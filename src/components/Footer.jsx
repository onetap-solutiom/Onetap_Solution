import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Send, ArrowRight } from 'lucide-react';
import { subscribeNewsletter, getSettings } from '../services/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [settings, setSettings] = useState({
    company_email: 'hello@onetapsolution.com',
    contact_phone: '+252 61 9586339',
    office_location: 'Mogadishu, Somalia'
  });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    let mounted = true;
    getSettings().then(data => {
      if (mounted && data) {
        setSettings(data);
      }
    });
    return () => { mounted = false; };
  }, []);

  return (
    <footer className="relative bg-black overflow-hidden">
      {/* Top green glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-linear-to-r from-transparent via-[#04C244] to-transparent"></div>

      {/* CTA Banner */}
      <div className="border-b border-white/5">
        <div className="container mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Ready to build something <span className="text-[#04C244]">amazing?</span>
            </h3>
            <p className="text-slate-400 text-sm">Let's turn your idea into a powerful digital product.</p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 flex items-center gap-2 px-7 py-3 rounded-full bg-[#04C244] text-black font-semibold hover:bg-[#03a837] hover:shadow-lg hover:shadow-[#04C244]/30 transition-all group"
          >
            Get In Touch
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <img src="/assets/images/logo.png" alt="OneTap Solution Logo" className="h-16 w-auto" />
              <span className="text-xl font-bold text-white tracking-wide">
                OneTap <span className="text-[#04C244]">Solution</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Delivering modern, world-class digital solutions for the next generation of Somali businesses.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-1">
              {[
                { href: 'https://www.facebook.com/profile.php?id=61589772293579', icon: 'fab fa-facebook-f' },
                { href: 'https://www.instagram.com/onetap.so?igsh=MW5qaDk3M3N0NnRneQ%3D%3D&utm_source=qr', icon: 'fab fa-instagram' },
                { href: 'https://linkedin.com/company/onetapsolution', icon: 'fab fa-linkedin-in' },
                { href: 'https://www.tiktok.com/@onetap.solution?_r=1&_t=ZS-96PoNmViUc5', icon: 'fab fa-tiktok' },
                { href: 'https://wa.me/252619586339', icon: 'fab fa-whatsapp' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#04C244] hover:border-[#04C244] transition-all"
                >
                  <i className={`${s.icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Services', to: '/services' },
                { label: 'News', to: '/news' },
                { label: 'Projects', to: '/portfolio' },
                { label: 'Contact', to: '/contact' },
              ].map((link, idx) => (
                <li key={idx}>
                  <NavLink
                    to={link.to}
                    className="text-slate-400 hover:text-[#04C244] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#04C244]/40 group-hover:bg-[#04C244] transition-colors"></span>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Services</h4>
            <ul className="space-y-3">
              {['Web Development', 'Mobile Apps', 'Multimedia', 'UI/UX Design', 'Digital Marketing'].map((service, idx) => (
                <li key={idx}>
                  <Link
                    to="/services"
                    className="text-slate-400 hover:text-[#04C244] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#04C244]/40 group-hover:bg-[#04C244] transition-colors"></span>
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Contact Us</h4>
            <div className="space-y-4">
              <a href={`tel:${settings.contact_phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 text-sm text-slate-400 hover:text-[#04C244] transition-colors group">
                <span className="w-9 h-9 rounded-full border border-white/10 group-hover:border-[#04C244] flex items-center justify-center transition-colors shrink-0">
                  <Phone size={15} className="text-[#04C244]" />
                </span>
                {settings.contact_phone}
              </a>
              <a href={`mailto:${settings.company_email}`} className="flex items-center gap-3 text-sm text-slate-400 hover:text-[#04C244] transition-colors group">
                <span className="w-9 h-9 rounded-full border border-white/10 group-hover:border-[#04C244] flex items-center justify-center transition-colors shrink-0">
                  <Mail size={15} className="text-[#04C244]" />
                </span>
                {settings.company_email}
              </a>
              <p className="flex items-center gap-3 text-sm text-slate-400">
                <span className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin size={15} className="text-[#04C244]" />
                </span>
                {settings.office_location}
              </p>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest">Newsletter</p>
              {status === 'success' ? (
                <p className="text-xs text-[#04C244] font-medium">Successfully subscribed!</p>
              ) : (
                <form 
                  className="flex gap-2" 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setStatus('loading');
                    const res = await subscribeNewsletter(email);
                    if (res.success) {
                      setStatus('success');
                      setEmail('');
                      setTimeout(() => setStatus('idle'), 5000);
                    } else {
                      setStatus('error');
                      alert(res.message || "Failed to subscribe");
                      setStatus('idle');
                    }
                  }}
                >
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#04C244] transition-colors"
                    required
                    disabled={status === 'loading'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="p-2.5 rounded-lg bg-[#04C244] text-black hover:bg-[#03a837] hover:shadow-lg hover:shadow-[#04C244]/30 transition-all disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-slate-600 text-xs">
              © {currentYear} <span className="text-slate-500">OneTap Solution</span>. All Rights Reserved.
            </p>
            <Link 
              to="/admin/login" 
              className="admin-link text-xs select-none font-medium transition-colors"
            >
              login
            </Link>
          </div>
          <p className="text-slate-700 text-xs">
            Built with 💚 in Somalia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
