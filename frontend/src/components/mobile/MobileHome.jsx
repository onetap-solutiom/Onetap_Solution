import { useState, useEffect } from 'react';
import { 
  MapPin, Bell, Search, SlidersHorizontal, 
  ChevronRight, Bookmark, Settings, Palette, Film, Megaphone, Smartphone, Code, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getServices, getProjects, getNews } from '../../services/api';

// Icon mapping for services
const getIcon = (iconName) => {
  if (!iconName) return Globe;
  const icon = iconName.toLowerCase();
  if (icon.includes('laptop') || icon.includes('code')) return Code;
  if (icon.includes('mobile') || icon.includes('smartphone')) return Smartphone;
  if (icon.includes('cog') || icon.includes('setting')) return Settings;
  if (icon.includes('palette') || icon.includes('design')) return Palette;
  if (icon.includes('film') || icon.includes('video')) return Film;
  if (icon.includes('bullhorn') || icon.includes('marketing')) return Megaphone;
  return Globe;
};

const getServiceColor = (index) => {
  const colors = [
    { color: 'text-rose-500', bg: 'bg-rose-50' },
    { color: 'text-blue-500', bg: 'bg-blue-50' },
    { color: 'text-orange-500', bg: 'bg-orange-50' },
    { color: 'text-purple-500', bg: 'bg-purple-50' },
    { color: 'text-green-500', bg: 'bg-green-50' },
    { color: 'text-amber-500', bg: 'bg-amber-50' },
    { color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];
  return colors[index % colors.length];
};

const MobileHome = () => {
  const [activeBanner, setActiveBanner] = useState(0);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      const [servicesData, projectsData, newsData] = await Promise.all([
        getServices(),
        getProjects(),
        getNews()
      ]);
      if (mounted) {
        setServices(servicesData);
        setProjects(projectsData);
        setNews(newsData);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // Use news or projects for banners
  const bannerData = news.length > 0 ? news.slice(0, 3) : projects.slice(0, 3);

  return (
    <div className="bg-white dark:bg-[#0A0C10] min-h-screen pb-24 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 dark:border-white/10">
            <img src="https://i.pravatar.cc/150?u=ahmed" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full cursor-pointer">
              <MapPin size={14} className="text-[#04C244]" />
              <span className="text-xs font-semibold">Mogadishu</span>
              <ChevronRight size={14} className="text-slate-400 rotate-90" />
            </div>
          </div>
        </div>
        <button className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 relative">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#04C244] border-2 border-white dark:border-[#0A0C10] rounded-full"></span>
        </button>
      </header>

      {/* Welcome Text */}
      <section className="px-6 py-4">
        <h1 className="text-3xl font-bold tracking-tight">OneTap Solution</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Innovation at your fingertips</p>
      </section>

      {/* Search Bar */}
      <section className="px-6 py-4">
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search projects, services..." 
              className="w-full h-14 pl-12 pr-4 bg-slate-100 dark:bg-white/5 rounded-2xl border-none focus:ring-2 focus:ring-[#04C244] transition-all outline-none text-sm"
            />
          </div>
          <button className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 text-[#04C244]">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </section>

      {/* Banners (News/Featured) */}
      <section className="px-6 py-4">
        <div className="overflow-hidden rounded-3xl relative aspect-16/8">
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${activeBanner * 100}%)` }}>
            {bannerData.map((item, i) => (
              <div key={item.id || i} className="min-w-full relative h-full bg-[#0A0C10]">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-[#04C244] to-[#028a31] opacity-80" />
                )}
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                  <h3 className="text-white text-2xl font-bold leading-tight max-w-[200px] line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-200 text-sm mt-1 line-clamp-1">{item.date || item.category}</p>
                  <button className="mt-4 w-fit bg-white text-slate-900 px-6 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {bannerData.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveBanner(i)}
                className={`h-1.5 rounded-full transition-all ${activeBanner === i ? 'w-8 bg-[#04C244]' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid (Services) */}
      <section className="px-6 py-6">
        <div className="grid grid-cols-4 gap-y-6">
          {services.map((service, i) => {
            const Icon = getIcon(service.icon);
            const style = getServiceColor(i);
            return (
              <motion.div 
                key={service.id}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 rounded-2xl ${style.bg} dark:bg-white/5 flex items-center justify-center transition-colors`}>
                  <Icon className={style.color} size={24} />
                </div>
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center px-1 line-clamp-1">
                  {service.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Trending Section (Projects) */}
      <section className="py-4">
        <div className="px-6 flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Latest Projects</h2>
          <button className="text-[#04C244] text-sm font-semibold">See all</button>
        </div>
        <div className="flex gap-6 overflow-x-auto px-6 pb-4 scrollbar-hide">
          {projects.map((project) => (
            <div key={project.id} className="min-w-[280px] rounded-3xl overflow-hidden bg-slate-50 dark:bg-white/5 group border border-slate-100 dark:border-white/5">
              <div className="relative aspect-4/3">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                  <Bookmark size={18} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#04C244] font-bold">{project.category}</span>
                    <h4 className="font-bold text-lg">{project.title}</h4>
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MobileHome;
