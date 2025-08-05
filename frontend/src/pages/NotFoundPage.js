import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineHome,
  HiOutlineLightningBolt,
  HiOutlineArrowLeft
} from 'react-icons/hi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12">
      <div className="container-xl section-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* 404 Illustration */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative">
              <h1 className="text-9xl font-bold gradient-text opacity-20 select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center"
                >
                  <HiOutlineLightningBolt className="w-12 h-12 text-white" />
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Oops! Página no encontrada
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              La página que estás buscando no existe o ha sido movida. 
              Pero no te preocupes, puedes explorar nuestros proyectos de energía solar.
            </p>
          </motion.div>
          
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/"
              className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center"
            >
              <HiOutlineHome className="w-5 h-5 mr-2" />
              Ir al Inicio
            </Link>
            
            <Link
              to="/proyectos"
              className="btn btn-outline text-lg px-8 py-3 flex items-center justify-center"
            >
              <HiOutlineLightningBolt className="w-5 h-5 mr-2" />
              Ver Proyectos
            </Link>
          </motion.div>
          
          {/* Additional Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <p className="text-gray-500 mb-4">
              ¿Llegaste aquí por error?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-gray-600">
              <button
                onClick={() => window.history.back()}
                className="flex items-center hover:text-primary-600 transition-colors"
              >
                <HiOutlineArrowLeft className="w-4 h-4 mr-1" />
                Volver atrás
              </button>
              
              <span className="hidden sm:block text-gray-300">•</span>
              
              <Link
                to="/contacto"
                className="hover:text-primary-600 transition-colors"
              >
                Reportar problema
              </Link>
              
              <span className="hidden sm:block text-gray-300">•</span>
              
              <Link
                to="/mis-simulaciones"
                className="hover:text-primary-600 transition-colors"
              >
                Mis simulaciones
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;