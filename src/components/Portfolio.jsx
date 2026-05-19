import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { getProjects } from '../services/api';

const Portfolio = () => {
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      const projects = await getProjects();
      if (mounted) {
        setProjectsList(projects.slice(0, 3));
      }
    };

    fetchProjects();

    const handleUpdate = () => fetchProjects();
    window.addEventListener('app-data-updated', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('app-data-updated', handleUpdate);
    };
  }, []);
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
            Our <span className="text-gradient">Projects</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            A collection of our latest innovative digital projects, crafted with creativity and precision.
          </motion.p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {projectsList.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-2 border-[#04C244] shadow-lg shadow-[#04C244]/20 dark:shadow-2xl hover:shadow-[#04C244]/40 w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-sm transition-all"
            >
              <div className="aspect-video overflow-hidden bg-zinc-900">
                <img 
                  src={project.image || 'https://placehold.co/600x400/1e1e1e/04C244?text=Project+Preview'} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1e1e1e/04C244?text=Project+Preview'; }}
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/75 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 sm:p-6 project-overlay">
                <span className="text-[#04C244] text-sm font-medium mb-1 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300 text-shadow-sm">
                  {project.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300 delay-75 text-shadow-md">
                  {project.title}
                </h3>
                <div className="flex gap-3 lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300 delay-100">
                  <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors keep-white">
                    <ExternalLink size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors keep-white">
                    <i className="fab fa-github text-lg"></i>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link to="/portfolio" className="inline-block px-8 py-3 rounded-full border border-black/15 dark:border-white/10 hover:border-[#04C244] dark:hover:border-[#04C244] text-black dark:text-white font-medium transition-colors">
            See All Projects
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
