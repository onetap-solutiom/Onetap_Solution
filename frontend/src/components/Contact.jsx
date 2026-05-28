import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { submitContactMessage, getSettings } from '../services/api';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [settings, setSettings] = useState({
    company_email: 'onetapsolution6@gmail.com',
    contact_phone: '+252 61 9586339',
    office_location: 'Mogadishu, Somalia'
  });

  useEffect(() => {
    let mounted = true;
    getSettings().then(data => {
      if (mounted && data) {
        setSettings(data);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const res = await submitContactMessage(form);
    if (res.success) {
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } else {
      setStatus('error');
    }
  };

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4"
          >
            Get In <span className="text-gradient">Touch</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Have a project in mind? Let's talk about how we can help you achieve your goals.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/3 space-y-8"
          >
            <div className="glass-card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#04C244]/10 flex items-center justify-center text-[#04C244] shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Phone</h4>
                <p className="text-slate-400">{settings.contact_phone}</p>
                {settings.contact_phone === '+252 61 9586339' && (
                  <p className="text-slate-400">+252 61 3377606</p>
                )}
              </div>
            </div>
            
            <div className="glass-card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#04C244]/10 flex items-center justify-center text-[#04C244] shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Email</h4>
                <p className="text-slate-400">{settings.company_email}</p>
              </div>
            </div>

            <div className="glass-card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#04C244]/10 flex items-center justify-center text-[#04C244] shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Location</h4>
                <p className="text-slate-400">{settings.office_location}</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-2/3 glass-card p-8"
          >
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-[#04C244]/10 flex items-center justify-center text-[#04C244] mb-6">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-400">Thank you for reaching out. We will get back to you shortly.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-8 text-[#04C244] font-medium hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#04C244] transition-colors"
                      placeholder="Enter Your Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#04C244] transition-colors"
                      placeholder="Enter Your Email Address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#04C244] transition-colors"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                  <textarea 
                    rows="4"
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#04C244] transition-colors resize-none"
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <button 
                  disabled={status === 'sending'}
                  className="w-full py-4 rounded-xl bg-gradient-brand text-white font-semibold hover:shadow-lg hover:shadow-[#04C244]/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {status === 'sending' ? 'Sending...' : (
                    <>
                      Send Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
                {status === 'error' && (
                  <p className="text-red-500 text-sm text-center mt-2">Something went wrong. Please try again.</p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
