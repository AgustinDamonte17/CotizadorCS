import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineMenu, 
  HiOutlineX, 
  HiOutlineSun,
  HiOutlineChartBar,
  HiOutlineHome,
  HiOutlineMail,
  HiOutlineLogin,
  HiOutlineLogout,
  HiOutlineUserCircle
} from 'react-icons/hi';
import { useSettings, useAuth } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const settings = useSettings();
  const { isAuthenticated, user, logout } = useAuth();
  
  const publicNavigation = [
    { name: 'Inicio', href: '/', icon: HiOutlineHome },
    { name: 'Comunidades Solares', href: '/comunidades-solares', icon: HiOutlineSun },
    { name: 'Contacto', href: '/contacto', icon: HiOutlineMail },
  ];
  
  const authenticatedNavigation = [
    ...publicNavigation,
    { name: 'Mis Simulaciones', href: '/mis-simulaciones', icon: HiOutlineChartBar },
  ];
  
  const navigation = isAuthenticated ? authenticatedNavigation : publicNavigation;
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  const toggleMobile = () => setIsOpen(!isOpen);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      setIsOpen(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  return (
    <nav className="bg-white shadow-soft sticky top-0 z-50">
      <div className="container-xl section-padding">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <HiOutlineSun className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold gradient-text">
              {settings?.site_name || 'Simulador CS'}
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <HiOutlineUserCircle className="w-4 h-4" />
                  <span>Hola, {user?.first_name || user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <HiOutlineLogin className="w-4 h-4" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMobile}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? (
              <HiOutlineX className="w-6 h-6" />
            ) : (
              <HiOutlineMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="section-padding py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      active
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600">
                      <HiOutlineUserCircle className="w-5 h-5" />
                      <span>Hola, {user?.first_name || user?.username}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 w-full text-left transition-all duration-200"
                    >
                      <HiOutlineLogout className="w-5 h-5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-all duration-200"
                    >
                      <HiOutlineLogin className="w-5 h-5" />
                      <span>Ingresar</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="btn btn-primary w-full justify-center"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;