import { Home, Search, Bookmark, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const MobileNavbar = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Bookmark, label: 'Favorites', path: '/favorites' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-lg border-t border-slate-100 dark:border-white/5" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex justify-around items-center h-20 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-[#04C244]' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-xl ${isActive ? 'bg-[#04C244]/10' : 'bg-transparent'}`}
                >
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#04C244]' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileNavbar;
