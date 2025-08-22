import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  HiOutlineChartBar,
  HiOutlineMail,
  HiOutlineEye,
  HiOutlineCalculator,
  HiOutlineCurrencyDollar,
  HiOutlineLightningBolt,
  HiOutlineCalendar,
  HiOutlineUser
} from 'react-icons/hi';
import { api, apiUtils } from '../services/api';
import { useAuth } from '../context/AppContext';
import EmptyState from '../components/UI/EmptyState';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const SimulationsPage = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Fetch user simulations
  const { data: simulations, isLoading, error, refetch } = useQuery(
    ['userSimulations', user?.id],
    () => api.getUserSimulations(),
    {
      enabled: isAuthenticated && !!user,
    }
  );
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative py-8">
        <div className="absolute inset-0">
          <img 
            src="/images/backgrounds/aereaparquesolar.jpg"
            alt="Vista aérea de parque solar"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-600/70"></div>
        </div>

        <div className="container-xl section-padding relative z-10">
          <div className="max-w-md mx-auto text-center">
            <div className="card p-6">
              <HiOutlineUser className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4">
                Inicia sesión para ver tus simulaciones
              </h2>
              <p className="text-gray-600 mb-6">
                Necesitas una cuenta para acceder a tus simulaciones guardadas
              </p>
              <div className="space-y-3">
                <Link to="/login" className="btn btn-primary w-full">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-outline w-full">
                  Crear Cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
          {user && (
            <div className="mt-4 flex items-center space-x-2 text-gray-100">
              <HiOutlineUser className="w-5 h-5" />
              <span>Bienvenido, {user.first_name || user.username}</span>
            </div>
          )}
        </div>
        
        {/* Simulations Content */}
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
            {/* Simulations List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {simulations.results.map((simulation, index) => (
                <SimulationCard key={simulation.id} simulation={simulation} index={index} />
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

// Simulation Card Component
const SimulationCard = ({ simulation, index }) => {
  const TypeIcon = getSimulationTypeIcon(simulation.simulation_type);
  
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
          <span className="text-gray-600">Potencia Instalada:</span>
          <span className="font-medium text-gray-900">{apiUtils.formatPower(simulation.installed_power_kw)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Generación Mensual:</span>
          <span className="font-medium text-gray-900">{apiUtils.formatNumber(simulation.monthly_generation_kwh)} kWh</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cobertura Lograda:</span>
          <span className="font-medium text-accent-600">
            {apiUtils.formatNumber(simulation.coverage_achieved, 1)}%
          </span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <HiOutlineCalendar className="w-4 h-4 mr-1" />
          <span>{apiUtils.formatRelativeTime(simulation.created_at)}</span>
        </div>
        
        <Link
          to={`/simulations/${simulation.id}`}
          className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 border-2 border-primary-600 hover:border-primary-700 text-white rounded-lg transition-all duration-300 font-medium flex items-center"
        >
          <HiOutlineEye className="w-4 h-4 mr-2" />
          Ver Detalles
        </Link>
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