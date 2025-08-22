import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  HiOutlineChartBar,
  HiOutlineMail,
  HiOutlineCalculator,
  HiOutlineCurrencyDollar,
  HiOutlineLightningBolt,
  HiOutlineCalendar,
  HiOutlineStar
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { api, apiUtils } from '../services/api';
import { useAuth } from '../context/AppContext';
import EmptyState from '../components/UI/EmptyState';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const SimulationsPage = () => {
  const { userEmail, setUserEmail } = useAuth();
  const [inputEmail, setInputEmail] = useState(userEmail);
  
  // Fetch user simulations
  const { data: simulations, isLoading, error, refetch } = useQuery(
    ['userSimulations', userEmail],
    () => api.getUserSimulations(userEmail),
    {
      enabled: !!userEmail,
    }
  );
  
  // Sort simulations by ROI (highest first) and separate best ROI
  const { bestSimulation, otherSimulations } = useMemo(() => {
    if (!simulations?.results?.length) {
      return { bestSimulation: null, otherSimulations: [] };
    }
    
    const sortedSimulations = [...simulations.results].sort((a, b) => 
      parseFloat(b.roi_annual) - parseFloat(a.roi_annual)
    );
    
    return {
      bestSimulation: sortedSimulations[0],
      otherSimulations: sortedSimulations.slice(1)
    };
  }, [simulations]);
  

  
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (inputEmail) {
      setUserEmail(inputEmail);
    }
  };
  
  const getSimulationTypeLabel = (type) => {
    const labels = {
      coverage: 'Por Cobertura',
      panels: 'Por Paneles',
      investment: 'Por Inversión',
    };
    return labels[type] || type;
  };
  
  const getSimulationTypeIcon = (type) => {
    const icons = {
      coverage: HiOutlineChartBar,
      panels: HiOutlineLightningBolt,
      investment: HiOutlineCurrencyDollar,
    };
    return icons[type] || HiOutlineCalculator;
  };
  
  return (
    <div className="min-h-screen relative py-8">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/images/backgrounds/aereaparquesolar.jpg"
          alt="Vista aérea de parque solar"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-600/70"></div>
      </div>

      <div className="container-xl section-padding relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-section text-white mb-4">
            Mis Simulaciones de Inversión
          </h1>
          <p className="text-lg text-gray-100">
            Revisa y compara todas tus simulaciones de inversión en proyectos solares
          </p>
        </div>
        
        {/* Email Input Section */}
        {!userEmail && (
          <div className="card p-6 mb-8">
            <div className="max-w-md mx-auto text-center">
              <HiOutlineMail className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4">
                Ingresa tu email para ver tus simulaciones
              </h2>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input"
                  required
                />
                <button type="submit" className="btn btn-primary w-full">
                  Ver Mis Simulaciones
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* Change Email */}
        {userEmail && (
          <div className="bg-white border-2 border-white rounded-xl shadow-lg transition-all duration-300 group p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <HiOutlineMail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">
                  Mostrando simulaciones para: <span className="font-medium">{userEmail}</span>
                </span>
              </div>
              <form onSubmit={handleEmailSubmit} className="flex space-x-2">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="Cambiar email"
                  className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-all duration-300 text-sm"
                />
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 border-2 border-primary-600 hover:border-primary-700 text-white rounded-lg transition-all duration-300 font-medium text-sm">
                  Cambiar
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* Simulations Content */}
        {userEmail && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Error al cargar las simulaciones</p>
                <button onClick={refetch} className="btn btn-primary">
                  Reintentar
                </button>
              </div>
            ) : simulations?.results?.length > 0 ? (
              <div className="space-y-6">
                {/* Simulations List - Best ROI first, then others */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Best ROI Simulation */}
                  {bestSimulation && (
                    <BestSimulationCard key={bestSimulation.id} simulation={bestSimulation} index={0} />
                  )}
                  {/* Other Simulations */}
                  {otherSimulations.map((simulation, index) => (
                    <SimulationCard key={simulation.id} simulation={simulation} index={index + 1} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={HiOutlineChartBar}
                title="No tienes simulaciones aún"
                description="Explora nuestros proyectos y crea tu primera simulación de inversión."
                action={
                  <Link to="/comunidades-solares" className="btn btn-primary">
                    Explorar Proyectos
                  </Link>
                }
              />
            )}
          </>
        )}
        
        {/* Help Section */}
        <div className="mt-12 card p-6 bg-gradient-to-r from-primary-50 to-accent-50">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ¿Necesitas ayuda con tus simulaciones?
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo está aquí para ayudarte a entender tus simulaciones y 
              tomar las mejores decisiones de inversión.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contacto" className="btn btn-outline">
                Contactar Asesor
              </Link>
              <Link to="/comunidades-solares" className="btn btn-outline">
                Crear Nueva Simulación
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Function to create WhatsApp message
const createWhatsAppMessage = (simulation) => {
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('es-AR', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    }).format(num);
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0';
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSimulationTypeLabel = (type) => {
    const labels = {
      'bill_coverage': 'Cobertura de Factura',
      'panels': 'Número de Paneles',
      'investment': 'Monto de Inversión'
    };
    return labels[type] || type;
  };

  return `🌞 *CONSULTA SOBRE SIMULACIÓN SOLAR*

📋 *PARÁMETROS DE SIMULACIÓN*
• Proyecto: ${simulation.project_name}
• Ubicación: ${simulation.project_location}
• Tipo de simulación: ${getSimulationTypeLabel(simulation.simulation_type)}
• Factura mensual: ${formatCurrency(simulation.monthly_bill_ars)}
${simulation.bill_coverage_percentage ? `• Cobertura deseada: ${formatNumber(simulation.bill_coverage_percentage, 1)}%` : ''}
${simulation.number_of_panels ? `• Cantidad de paneles: ${simulation.number_of_panels}` : ''}
${simulation.investment_amount_usd ? `• Monto de inversión: $${formatNumber(simulation.investment_amount_usd)} USD` : ''}

📊 *RESULTADOS DE LA SIMULACIÓN*
💰 Inversión Total: $${formatNumber(simulation.total_investment_usd)} USD
⚡ Potencia Instalada: ${formatNumber(simulation.installed_power_kw, 2)} kW
📈 Generación Mensual: ${formatNumber(simulation.monthly_generation_kwh)} kWh
💵 Ahorro Mensual: ${formatCurrency(simulation.monthly_savings_ars)}
💎 Ahorro Anual (USD): $${formatNumber(simulation.annual_savings_usd, 0)}
📊 ROI Anual: ${formatNumber(simulation.roi_annual, 1)}%
⏰ Período de Retorno: ${formatNumber(simulation.payback_period_years, 1)} años
🎯 Cobertura Lograda: ${formatNumber(simulation.coverage_achieved, 1)}%

👤 *DATOS DE CONTACTO*
📧 Email: ${simulation.user_email}
📱 Teléfono: ${simulation.user_phone}

Quisiera recibir asesoramiento comercial sobre esta simulación. ¡Gracias! 🙌`;
};

// Best Simulation Card Component - Same size as regular cards but with special border and badge
const BestSimulationCard = ({ simulation, index }) => {
  const TypeIcon = getSimulationTypeIcon(simulation.simulation_type);
  
  const handleWhatsAppContact = () => {
    if (!simulation.project_commercial_whatsapp) {
      toast.error('No hay número de WhatsApp configurado para este proyecto');
      return;
    }
    
    const message = createWhatsAppMessage(simulation);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${simulation.project_commercial_whatsapp}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative bg-white border-4 border-yellow-400 rounded-xl shadow-lg transition-all duration-300 group p-6"
    >
      {/* Best ROI Badge */}
      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-1 rounded-full font-bold text-xs flex items-center space-x-1 shadow-lg z-10">
        <HiOutlineStar className="w-4 h-4" />
        <span>MEJOR RETORNO</span>
      </div>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {simulation.project_name}
          </h3>
          <p className="text-sm text-gray-600">{simulation.project_location}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <TypeIcon className="w-4 h-4" />
          <span>{getSimulationTypeLabel(simulation.simulation_type)}</span>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Inversión Total
          </label>
          <p className="text-lg font-semibold text-gray-900">
            ${apiUtils.formatNumber(simulation.total_investment_usd)} USD
          </p>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            ROI Anual
          </label>
          <p className="text-lg font-semibold text-yellow-600">
            {apiUtils.formatNumber(simulation.roi_annual, 1)}%
          </p>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Ahorro Mensual
          </label>
          <p className="text-lg font-semibold text-primary-600">
            {apiUtils.formatCurrency(simulation.monthly_savings_ars)}
          </p>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Retorno
          </label>
          <p className="text-lg font-semibold text-gray-900">
            {apiUtils.formatNumber(simulation.payback_period_years, 1)} años
          </p>
        </div>
      </div>
      
      {/* Additional Details */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ahorro Mensual:</span>
          <span className="font-medium text-green-600">{apiUtils.formatCurrency(simulation.monthly_savings_ars)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ahorro Anual USD:</span>
          <span className="font-medium text-green-600">${apiUtils.formatNumber(simulation.annual_savings_usd, 0)} USD</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cobertura Lograda:</span>
          <span className="font-medium text-accent-600">
            {apiUtils.formatNumber(simulation.bill_coverage_achieved, 1)}%
          </span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center text-xs text-gray-500">
          <HiOutlineCalendar className="w-4 h-4 mr-1" />
          <span>Creada {apiUtils.formatRelativeTime(simulation.created_at)}</span>
        </div>
        
        {/* WhatsApp Contact Button */}
        {simulation.project_commercial_whatsapp && (
          <button
            onClick={handleWhatsAppContact}
            className="w-full text-sm text-white bg-green-500 hover:bg-green-600 border-2 border-green-500 hover:border-green-600 transition-colors flex items-center justify-center px-3 py-2 rounded-lg font-medium"
          >
            <FaWhatsapp className="w-4 h-4 mr-2" />
            Asesor Comercial
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Simulation Card Component
const SimulationCard = ({ simulation, index }) => {
  const TypeIcon = getSimulationTypeIcon(simulation.simulation_type);
  
  const handleWhatsAppContact = () => {
    if (!simulation.project_commercial_whatsapp) {
      toast.error('No hay número de WhatsApp configurado para este proyecto');
      return;
    }
    
    const message = createWhatsAppMessage(simulation);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${simulation.project_commercial_whatsapp}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white border-2 border-white rounded-xl shadow-lg transition-all duration-300 group p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {simulation.project_name}
          </h3>
          <p className="text-sm text-gray-600">{simulation.project_location}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <TypeIcon className="w-4 h-4" />
          <span>{getSimulationTypeLabel(simulation.simulation_type)}</span>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Inversión Total
          </label>
          <p className="text-lg font-semibold text-gray-900">
            ${apiUtils.formatNumber(simulation.total_investment_usd)} USD
          </p>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            ROI Anual
          </label>
          <p className="text-lg font-semibold text-green-600">
            {apiUtils.formatNumber(simulation.roi_annual, 1)}%
          </p>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Ahorro Mensual
          </label>
          <p className="text-lg font-semibold text-primary-600">
            {apiUtils.formatCurrency(simulation.monthly_savings_ars)}
          </p>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Retorno
          </label>
          <p className="text-lg font-semibold text-gray-900">
            {apiUtils.formatNumber(simulation.payback_period_years, 1)} años
          </p>
        </div>
      </div>
      
      {/* Additional Details */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ahorro Mensual:</span>
          <span className="font-medium text-green-600">{apiUtils.formatCurrency(simulation.monthly_savings_ars)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Ahorro Anual USD:</span>
          <span className="font-medium text-green-600">${apiUtils.formatNumber(simulation.annual_savings_usd, 0)} USD</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cobertura Lograda:</span>
          <span className="font-medium text-accent-600">
            {apiUtils.formatNumber(simulation.bill_coverage_achieved, 1)}%
          </span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center text-xs text-gray-500">
          <HiOutlineCalendar className="w-4 h-4 mr-1" />
          <span>Creada {apiUtils.formatRelativeTime(simulation.created_at)}</span>
        </div>
        
        {/* WhatsApp Contact Button */}
        {simulation.project_commercial_whatsapp && (
          <button
            onClick={handleWhatsAppContact}
            className="w-full text-sm text-white bg-green-500 hover:bg-green-600 border-2 border-green-500 hover:border-green-600 transition-colors flex items-center justify-center px-3 py-2 rounded-lg font-medium"
          >
            <FaWhatsapp className="w-4 h-4 mr-2" />
            Asesor Comercial
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Helper function moved inside component
function getSimulationTypeLabel(type) {
  const labels = {
    coverage: 'Por Cobertura',
    panels: 'Por Paneles', 
    investment: 'Por Inversión',
  };
  return labels[type] || type;
}

function getSimulationTypeIcon(type) {
  const icons = {
    coverage: HiOutlineChartBar,
    panels: HiOutlineLightningBolt,
    investment: HiOutlineCurrencyDollar,
  };
  return icons[type] || HiOutlineCalculator;
}

export default SimulationsPage;