import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  HiOutlineSun,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiOutlineTrendingUp,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { useQuery } from 'react-query';
import { api, apiUtils } from '../services/api';

//ESTE COMENTARIO ES UNA PRUEBA PARA VER SI SE PUEDE HACER UN COMMIT DESDE EL FRONTEND

const HomePage = () => {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  // Fetch project stats
  const { data: projectStats } = useQuery('projectStats', api.getProjectStats);
  const { data: simulationStats } = useQuery('simulationStats', api.getSimulationStats);
  
  const features = [
    {
      icon: HiOutlineSun,
      title: 'Proyectos Verificados',
      description: 'Todos nuestros proyectos solares pasan por un riguroso proceso de verificación técnica y financiera.',
    },
    {
      icon: HiOutlineChartBar,
      title: 'Simulaciones Precisas',
      description: 'Motor de cálculo avanzado que considera tu consumo real y categoría tarifaria para proyecciones exactas.',
    },
    {
      icon: HiOutlineCurrencyDollar,
      title: 'Inversión Accesible',
      description: 'Invierte desde montos pequeños y diversifica tu cartera con múltiples proyectos de energía limpia.',
    },
    {
      icon: HiOutlineShieldCheck,
      title: 'Transparencia Total',
      description: 'Acceso completo a información técnica, financiera y de rendimiento de cada proyecto.',
    },
    {
      icon: HiOutlineTrendingUp,
      title: 'Retornos Competitivos',
      description: 'Obtén retornos atractivos mientras contribuyes a la transición energética sostenible.',
    },
    {
      icon: HiOutlineGlobe,
      title: 'Impacto Positivo',
      description: 'Cada inversión contribuye a reducir las emisiones de CO₂ y crear un futuro más sostenible.',
    },
  ];
  
  const stats = [
    {
      number: projectStats?.total_projects || 0,
      label: 'Proyectos Activos',
      suffix: '+',
    },
    {
      number: projectStats?.total_power_installed_kwp ? Math.round(projectStats.total_power_installed_kwp / 1000) : 0,
      label: 'MW Instalados',
      suffix: '+',
    },
    {
      number: simulationStats?.total_simulations || 0,
      label: 'Simulaciones Realizadas',
      suffix: '+',
    },
    {
      number: simulationStats?.average_roi_annual ? Math.round(simulationStats.average_roi_annual) : 0,
      label: 'ROI Promedio Anual',
      suffix: '%',
    },
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="gradient-bg py-20 lg:py-32">
        <div className="container-xl section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-hero gradient-text mb-6">
              Invierte en el Futuro de la Energía Solar
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Conectamos inversores con proyectos de energía solar comunitaria. 
              Obtén retornos competitivos mientras contribuyes a un planeta más sostenible.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/proyectos" className="btn btn-primary text-lg px-8 py-4">
                Explorar Proyectos
                <HiOutlineArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link to="/contacto" className="btn btn-outline text-lg px-8 py-4">
                Conocer Más
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-white">
        <div className="container-xl section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">
                  {apiUtils.formatNumber(stat.number)}{stat.suffix}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-gray-50">
        <div className="container-xl section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-section gradient-text mb-4">
              ¿Por qué elegir WeSolar?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma combina tecnología avanzada, transparencia total y 
              un enfoque sostenible para hacer que la inversión en energía solar sea 
              accesible para todos.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card p-8 text-center card-hover"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="container-xl section-padding">
          <div className="text-center mb-16">
            <h2 className="text-section gradient-text mb-4">
              Cómo Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Invertir en energía solar nunca fue tan simple. 
              Sigue estos pasos para comenzar tu journey hacia la sostenibilidad.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Explora Proyectos',
                description: 'Navega por nuestra selección de proyectos solares verificados y elige los que mejor se adapten a tus objetivos de inversión.',
              },
              {
                step: '02',
                title: 'Simula tu Inversión',
                description: 'Usa nuestro simulador avanzado para calcular retornos potenciales basados en tu consumo energético y presupuesto.',
              },
              {
                step: '03',
                title: 'Invierte y Monitorea',
                description: 'Realiza tu inversión de forma segura y sigue el rendimiento de tus proyectos en tiempo real desde tu dashboard.',
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Connection line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-primary-200 to-accent-200 transform -translate-x-8" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="container-xl section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-section text-white mb-6">
              ¿Listo para comenzar tu inversión solar?
            </h2>
            
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Únete a miles de inversores que ya están generando retornos 
              sostenibles con energía solar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/proyectos" 
                className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4"
              >
                Ver Proyectos Disponibles
              </Link>
              
              <Link 
                to="/contacto" 
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4"
              >
                Contactar Asesor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;