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
  HiOutlineCalendar
} from 'react-icons/hi';
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-xl section-padding">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-section gradient-text mb-4">
            Mis Simulaciones de Inversión
          </h1>
          <p className="text-lg text-gray-600">
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
          <div className="card p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <HiOutlineMail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  Mostrando simulaciones para: <span className="font-medium">{userEmail}</span>
                </span>
              </div>
              <form onSubmit={handleEmailSubmit} className="flex space-x-2">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="Cambiar email"
                  className="input text-sm py-2"
                />
                <button type="submit" className="btn btn-outline text-sm py-2">
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
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">
                      {simulations.results.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Simulaciones</div>
                  </div>
                  
                  <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ${apiUtils.formatNumber(
                        simulations.results.reduce((sum, sim) => sum + parseFloat(sim.total_investment_usd), 0)
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Inversión Total (USD)</div>
                  </div>
                  
                  <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-accent-600 mb-1">
                      {apiUtils.formatNumber(
                        simulations.results.reduce((sum, sim) => sum + parseFloat(sim.roi_annual), 0) / simulations.results.length,
                        1
                      )}%
                    </div>
                    <div className="text-sm text-gray-600">ROI Promedio</div>
                  </div>
                  
                  <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-secondary-600 mb-1">
                      {apiUtils.formatNumber(
                        simulations.results.reduce((sum, sim) => sum + parseFloat(sim.payback_period_years), 0) / simulations.results.length,
                        1
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Retorno Prom. (años)</div>
                  </div>
                </div>
                
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
              <Link to="/contacto" className="btn btn-primary">
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
      className="card p-6 card-hover"
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
          <span className="font-medium">{apiUtils.formatPower(simulation.installed_power_kw)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Generación Mensual:</span>
          <span className="font-medium">{apiUtils.formatNumber(simulation.monthly_generation_kwh)} kWh</span>
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
          className="btn btn-ghost text-sm py-1 px-3"
        >
          <HiOutlineEye className="w-4 h-4 mr-1" />
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