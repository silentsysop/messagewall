import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "./ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { SearchIcon, BellIcon, CalendarIcon, LogInIcon, UserPlusIcon, ShieldIcon, LogOutIcon, HeartIcon, Settings, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ui/ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const menuRef = useRef(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const showAuthLinks = process.env.REACT_APP_SHOW_AUTH_LINKS !== 'false';

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleLogout = () => {
    logout();
    setShowMobileMenu(false);
  };

  const handleAdminActions = () => {
    navigate('/admin-actions');
    setShowMobileMenu(false);
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  let basename = process.env.REACT_APP_BASENAME || '';
  if (basename === '/') basename = '';

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-muted px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <img src={`${basename}/vakslogo_kuvake.png`} alt="VAKS Logo" className="h-6 w-6" />
          <span className="hidden sm:inline">VAKS-Viestiseinä</span>
        </Link>

        <nav className="flex items-center gap-4">
          <DesktopNavItems user={user} showAuthLinks={showAuthLinks} t={t} />
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          <div className="relative sm:hidden" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex items-center gap-1"
            >
              <Menu className="h-5 w-5" />
              <ChevronDown className="h-4 w-4" />
            </Button>
            <AnimatePresence>
              {showMobileMenu && (
                <MobileMenu
                  user={user}
                  showAuthLinks={showAuthLinks}
                  t={t}
                  handleLogout={handleLogout}
                  handleAdminActions={handleAdminActions}
                  setShowMobileMenu={setShowMobileMenu}
                />
              )}
            </AnimatePresence>
          </div>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <motion.div
          className="h-full flex-shrink-0 hidden md:block"
          initial={false}
          animate={{
            width: isSidebarExpanded ? 240 : 64,
            transition: { duration: 0.3, ease: "easeInOut" }
          }}
        >
          <nav className="h-full flex flex-col border-r border-muted bg-muted-foreground/5">
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center m-2"
              onClick={toggleSidebar}
            >
              <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${isSidebarExpanded ? 'rotate-180' : ''}`} />
            </Button>
            <SidebarContent t={t} isExpanded={isSidebarExpanded} currentPath={location.pathname} />
          </nav>
        </motion.div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function DesktopNavItems({ user, showAuthLinks, t }) {
  return (
    <div className="hidden sm:flex items-center gap-4">
      <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
        <CalendarIcon className="h-5 w-5"  />
        <span>{t('common.events')}</span>
      </Link>
      {user ? (
        <>
          {user.role === 'organizer' && (
            <Link to="/moderate" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
              <ShieldIcon className="h-5 w-5" />
              <span>{t('common.moderate')}</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" aria-label={t('common.search')}>
            <SearchIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('common.notifications')}>
            <BellIcon className="h-5 w-5" />
          </Button>
          <UserMenu user={user} t={t} />
        </>
      ) : (
        showAuthLinks && (
          <>
            <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
              <LogInIcon className="h-5 w-5" />
              <span>{t('common.login')}</span>
            </Link>
            <Link to="/register" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
              <UserPlusIcon className="h-5 w-5" />
              <span>{t('common.register')}</span>
            </Link>
          </>
        )
      )}
    </div>
  );
}

function MobileMenu({ user, showAuthLinks, t, handleLogout, handleAdminActions, setShowMobileMenu }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-full mt-2 w-56 bg-background border border-muted rounded-md shadow-lg py-1 z-50"
    >
      <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setShowMobileMenu(false)}>
        <CalendarIcon className="h-5 w-5" />
        <span>{t('common.events')}</span>
      </Link>
      {user ? (
        <>
          {user.role === 'organizer' && (
            <Link to="/moderate" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setShowMobileMenu(false)}>
              <ShieldIcon className="h-5 w-5" />
              <span>{t('common.moderate')}</span>
            </Link>
          )}
          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setShowMobileMenu(false)}>
            <SearchIcon className="h-5 w-5" />
            <span>{t('common.search')}</span>
          </button>
          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setShowMobileMenu(false)}>
            <BellIcon className="h-5 w-5" />
            <span>{t('common.notifications')}</span>
          </button>
          {user.role === 'organizer' && (
            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => { handleAdminActions(); setShowMobileMenu(false); }}>
              <Settings className="h-5 w-5" />
              <span>{t('common.adminActions')}</span>
            </button>
          )}
          <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => { handleLogout(); setShowMobileMenu(false); }}>
            <LogOutIcon className="h-5 w-5" />
            <span>{t('common.logout')}</span>
          </button>
        </>
      ) : (
        showAuthLinks && (
          <>
            <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setShowMobileMenu(false)}>
              <LogInIcon className="h-5 w-5" />
              <span>{t('common.login')}</span>
            </Link>
            <Link to="/register" className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setShowMobileMenu(false)}>
              <UserPlusIcon className="h-5 w-5" />
              <span>{t('common.register')}</span>
            </Link>
          </>
        )
      )}
      <div className="px-4 py-2 flex items-center justify-between">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </motion.div>
  );
}

function UserMenu({ user, t }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleLogout = () => {
    // Implement logout logic
    setShowUserMenu(false);
  };

  const handleAdminActions = () => {
    navigate('/admin-actions');
    setShowUserMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Avatar
        className="h-8 w-8 border cursor-pointer"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
        <AvatarFallback>AC</AvatarFallback>
      </Avatar>
      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-background border border-muted rounded-md shadow-lg py-1 z-10"
          >
            {user && user.role === 'organizer' && (
              <button
                onClick={handleAdminActions}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('common.adminActions')}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <LogOutIcon className="h-4 w-4 mr-2" />
              {t('common.logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ t, isExpanded, currentPath }) {
  const sidebarItems = [
    { path: '/', icon: CalendarIcon, label: t('common.upcomingEvents') },
    { path: '/past-events', icon: CalendarIcon, label: t('common.pastEvents') },
    { path: '/saved-events', icon: HeartIcon, label: t('common.savedEvents') },
  ];

  return (
    <div className={`flex-1 overflow-hidden ${isExpanded ? 'px-4' : 'px-2'}`}>
      <div className={`mb-6 flex items-center gap-2 ${isExpanded ? '' : 'justify-center'}`}>
        <CalendarIcon className="h-5 w-5" style={{ color: '#93C01F' }}/>
        {isExpanded && <h2 className="text-lg font-semibold">{t('common.events')}</h2>}
      </div>
      {sidebarItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-primary transition-colors ${
            currentPath === item.path ? 'bg-muted text-primary' : ''
          } ${isExpanded ? '' : 'justify-center'}`}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {isExpanded && <span>{item.label}</span>}
        </Link>
      ))}
    </div>
  );
}