import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTestimonials } from '../services/api';

const Testimonials = () => {
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchTestimonials = async () => {
      const data = await getTestimonials();
      if (mounted) {
        setTestimonialsList(data);
      }
    };
    fetchTestimonials();
    return () => { mounted = false; };
  }, []);

  const nextSlide = useCallback(() => {
    if (testimonialsList.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonialsList.length);
  }, [testimonialsList.length]);

  const prevSlide = () => {
    if (testimonialsList.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + testimonialsList.length) % testimonialsList.length);
  };

  useEffect(() => {
    if (isPaused || testimonialsList.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, testimonialsList.length]);

  if (!testimonialsList.length) return null;

  return (
    <section className="py-12 md:py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-[#04C244]/10 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-4"
          >
            What <span className="text-gradient">People Say</span>
          </motion.h2>
          <p className="text-slate-400">Hear what our leaders, team, clients, and guests have to say about us.</p>
        </div>

        <div className="max-w-4xl mx-auto relative group">
          <div 
            className="relative min-h-[260px] sm:min-h-[220px] flex flex-col"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="glass-card p-6 sm:p-12 h-full flex flex-col justify-center relative"
              >
                <Quote size={60} className="absolute top-8 right-8 text-[#04C244]/10" />
                
                <div className="flex gap-1 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={20} 
                      className={star <= (testimonialsList[currentIndex].rating || 5) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'} 
                    />
                  ))}
                </div>

                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 italic mb-8 leading-relaxed">
                  "{testimonialsList[currentIndex].review || testimonialsList[currentIndex].text}"
                </p>

                <div className="flex items-center gap-5">
                  <div className="relative w-16 h-16 rounded-full border-2 border-[#04C244]/30 overflow-hidden flex items-center justify-center bg-black/40 shrink-0">
                    <div className="absolute inset-0 bg-[#04C244] blur-lg opacity-20 rounded-full"></div>
                    {(testimonialsList[currentIndex].img || testimonialsList[currentIndex].image) ? (
                      <img 
                        src={testimonialsList[currentIndex].img || testimonialsList[currentIndex].image} 
                        alt={testimonialsList[currentIndex].name} 
                        className="w-full h-full object-cover relative z-10" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#0A0C10] via-slate-900 to-black select-none relative z-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,194,68,0.15)_0%,transparent_70%)]"></div>
                        <span className="text-xl font-black text-[#04C244] tracking-widest font-mono drop-shadow-[0_0_8px_rgba(4,194,68,0.4)]">
                          {testimonialsList[currentIndex].name ? testimonialsList[currentIndex].name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{testimonialsList[currentIndex].name}</h4>
                    <p className="text-slate-400">{testimonialsList[currentIndex].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-6 mt-12">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:border-[#04C244] transition-all text-slate-400 hover:text-white"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex gap-3">
              {testimonialsList.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'w-10 bg-[#04C244]' : 'w-2.5 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button 
              onClick={nextSlide}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:border-[#04C244] transition-all text-slate-400 hover:text-white"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
