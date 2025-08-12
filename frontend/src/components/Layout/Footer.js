import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineSun,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineHeart
} from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { useSettings } from '../../context/AppContext';
import { api, apiUtils } from '../../services/api';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const settings = useSettings();
  
  const footerLinks = {
    platform: [
      { name: 'Proyectos', href: '/proyectos' },
      { name: 'Mis Simulaciones', href: '/mis-simulaciones' },
      { name: 'Contacto', href: '/contacto' },
    ],
    company: [
      { name: 'Sobre Nosotros', href: '/sobre-nosotros' },
      { name: 'Blog', href: '/blog' },
      { name: 'Términos y Condiciones', href: '/terminos' },
      { name: 'Política de Privacidad', href: '/privacidad' },
    ],
    support: [
      { name: 'Centro de Ayuda', href: '/ayuda' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Soporte Técnico', href: '/soporte' },
    ],
  };
  
  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: FaFacebook, 
      url: settings?.facebook_url,
      color: 'hover:text-blue-600'
    },
    { 
      name: 'Twitter', 
      icon: FaTwitter, 
      url: settings?.twitter_url,
      color: 'hover:text-blue-400'
    },
    { 
      name: 'LinkedIn', 
      icon: FaLinkedin, 
      url: settings?.linkedin_url,
      color: 'hover:text-blue-700'
    },
    { 
      name: 'Instagram', 
      icon: FaInstagram, 
      url: settings?.instagram_url,
      color: 'hover:text-pink-600'
    },
  ].filter(link => link.url);
  
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      await api.subscribeNewsletter({ email });
      toast.success('¡Te has suscrito exitosamente al newsletter!');
      setEmail('');
    } catch (error) {
      const errorMessage = apiUtils.extractErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubscribing(false);
    }
  };
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="container-xl section-padding py-12">
          <div className="text-center">
            <h3 className="text-2xl font-heading font-bold text-white mb-4">
              Mantente informado sobre energía solar
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Recibe las últimas noticias sobre proyectos, oportunidades de inversión y 
              tendencias en energía renovable directamente en tu inbox.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                disabled={isSubscribing}
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? (
                  <div className="loading-spinner w-5 h-5" />
                ) : (
                  'Suscribirme'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Main Footer Content */}
      <div className="container-xl section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <HiOutlineSun className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold text-white">
                {settings?.site_name || 'Simulador CS'}
              </span>
            </div>
            
            <p className="text-gray-400 mb-6 max-w-md">
              {settings?.site_description || 
                'Plataforma líder en simulación y cotización de inversiones en Comunidades Solares. Simulamos tus escenarios de inversión en energía solar.'}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {settings?.contact_email && (
                <div className="flex items-center space-x-3">
                  <HiOutlineMail className="w-5 h-5 text-primary-400" />
                  <a 
                    href={`mailto:${settings.contact_email}`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              )}
              
              {settings?.contact_phone && (
                <div className="flex items-center space-x-3">
                  <HiOutlinePhone className="w-5 h-5 text-primary-400" />
                  <a 
                    href={`tel:${settings.contact_phone}`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              )}
              
              {settings?.address && (
                <div className="flex items-center space-x-3">
                  <HiOutlineLocationMarker className="w-5 h-5 text-primary-400" />
                  <span>{settings.address}</span>
                </div>
              )}
            </div>
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4 mt-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-400 ${social.color} transition-colors p-2 rounded-lg hover:bg-gray-800`}
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-xl section-padding py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {settings?.site_name || 'Simulador CS'}. 
              Todos los derechos reservados.
            </p>
            
            <p className="text-gray-400 text-sm flex items-center mt-2 md:mt-0">
              Hecho con <HiOutlineHeart className="w-4 h-4 text-red-500 mx-1" /> 
              para un futuro sostenible
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;