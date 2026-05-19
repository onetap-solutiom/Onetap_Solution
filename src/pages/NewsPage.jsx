import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, Newspaper, X } from 'lucide-react';
import { getNews } from '../services/api';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchNews = async () => {
      const newsData = await getNews();
      if (mounted) {
        setNews(newsData);
      }
    };
    fetchNews();

    const handleUpdate = () => fetchNews();
    window.addEventListener('app-data-updated', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('app-data-updated', handleUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="page-hero relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: '360px' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0d4a1f_0%,#000000_70%)] hero-bg-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#04C24415_0%,transparent_60%)] hero-bg-overlay"></div>
        <div className="relative z-10 px-6 py-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-[#04C244]/10 border border-[#04C244]/20 rounded-2xl flex items-center justify-center text-[#04C244] mx-auto mb-6"
          >
            <Newspaper size={32} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Latest <span className="text-[#04C244]">News</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Stay updated with the latest trends, company news, and insights from OneTap Solution.
          </motion.p>
        </div>
      </section>

      {/* News Feed */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {news.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group keep-dark-context bg-[#0A0C10] border border-white/5 rounded-[32px] p-8 hover:border-[#04C244]/30 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Newspaper size={120} className="text-[#04C244]" />
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                    <Calendar size={14} className="text-[#04C244]" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                    <User size={14} className="text-[#04C244]" />
                    <span>{item.author || 'OneTap Team'}</span>
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#04C244] transition-colors leading-tight">
                  {item.title}
                </h2>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3">
                  {item.content}
                </p>

                <button 
                  onClick={() => setSelectedArticle(item)}
                  className="flex items-center gap-2 text-sm font-bold text-[#04C244] group/btn"
                >
                  Read Full Article 
                  <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </motion.article>
            ))}
          </div>

          {news.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">No news articles found. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0A0C10] keep-dark-context border border-white/10 rounded-[32px] w-full max-w-3xl overflow-hidden relative z-10 shadow-2xl my-auto"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0A0C10] z-20">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                   <div className="flex items-center gap-2"><Calendar size={14} className="text-[#04C244]" /> {selectedArticle.date}</div>
                   <div className="flex items-center gap-2"><User size={14} className="text-[#04C244]" /> {selectedArticle.author}</div>
                </div>
                <button onClick={() => setSelectedArticle(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 md:p-12 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="prose prose-invert max-w-none">
                   <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                      {selectedArticle.content}
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Newsletter Section */}
      <section className="py-24 bg-white/2 border-y border-white/5 keep-dark-context">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Never miss an update</h3>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">Subscribe to our newsletter and get the latest news delivered directly to your inbox.</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-[#04C244]/50 transition-all"
            />
            <button className="px-8 py-4 bg-[#04C244] text-black font-bold rounded-2xl hover:bg-[#03a837] transition-all shadow-lg shadow-[#04C244]/10">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
