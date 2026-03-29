import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDna, FaHome, FaChartBar, FaPen, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const navItems = [
  { to: '/', label: 'Home', icon: FaHome },
  { to: '/dashboard', label: 'Dashboard', icon: FaChartBar },
  { to: '/generator', label: 'Generator', icon: FaPen },
  { to: '/checker', label: 'Checker', icon: FaShieldAlt },
  { to: '/about', label: 'About', icon: FaInfoCircle },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <FaDna className="text-primary-foreground text-sm" />
          </div>
          <span className="gradient-text">Content DNA Engine</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 gradient-bg rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="text-xs" />
                  <span className="hidden sm:inline">{label}</span>
                </span>
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="ml-2 w-9 h-9 rounded-full flex items-center justify-center bg-muted text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
