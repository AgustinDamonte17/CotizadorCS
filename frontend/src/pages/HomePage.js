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
  HiOutlineTrendingUp
} from 'react-icons/hi';
import { useQuery } from 'react-query';
import { api, apiUtils } from '../services/api';

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
      <section ref={heroRef} className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/images/backgrounds/FondoGranjaSolar.jpg"
            alt="Granja Solar - Paneles solares en funcionamiento"
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-600/70"></div>
        </div>
        
        <div className="container-xl section-padding relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-hero text-white mb-6 font-bold">
              Invierte en el Futuro de la Energía Solar
            </h1>
            
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Te conectamos con tu Comunidad Solar. 
              Obtén retornos competitivos mientras contribuyes a un planeta más sostenible.
            </p>
            
            <div className="flex justify-center">
              <Link to="/comunidades-solares" className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white hover:bg-primary-600 hover:border-primary-600 transition-all duration-300 text-lg px-8 py-4 font-medium">
                Explorar Comunidades Solares
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
      <section ref={featuresRef} className="relative py-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/images/backgrounds/texturapaneles.jpg"
            alt="Textura de paneles solares"
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-600/70"></div>
        </div>

        <div className="container-xl section-padding relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-section text-white mb-4">
              ¿Por qué elegir Simulador CS?
            </h2>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Nuestra plataforma combina tecnología avanzada, transparencia total y 
              conocimiento especializado para simular escenarios comparativos que te permitan tomar la mejor decisión.
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
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-lg hover:bg-white hover:border-white transition-all duration-300 group p-8 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white group-hover:text-gray-900 mb-4 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-200 group-hover:text-gray-600 leading-relaxed transition-colors duration-300">
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
              Sigue estos pasos para comenzar tu camino hacia la energía limpia.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Encuentra tu CS',
                description: 'Navega por nuestra sección de Comunidades Solares y encuentra tu Comunidad Solar local.',
              },
              {
                step: '02',
                title: 'Simula tu Inversión',
                description: 'Usa nuestro simulador avanzado para calcular retornos potenciales basados en tu factura eléctrica y presupuesto.',
              },
              {
                step: '03',
                title: 'Invierte',
                description: 'Invierte en tu Comunidad Solar y percibe los retornos en tu factura eléctrica!',
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
                to="/comunidades-solares" 
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white hover:bg-primary-600 hover:border-primary-600 transition-all duration-300 text-lg px-8 py-4 font-medium"
              >
                Ver Comunidades Solares Disponibles
              </Link>
              
              <Link 
                to="/contacto" 
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white hover:bg-white hover:text-primary-600 transition-all duration-300 text-lg px-8 py-4 font-medium"
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