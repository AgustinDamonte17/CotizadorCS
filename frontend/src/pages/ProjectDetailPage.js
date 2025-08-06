import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  HiOutlineLocationMarker,
  HiOutlineLightningBolt,
  HiOutlineCurrencyDollar,
  HiOutlineCalculator,
  HiOutlineChartBar,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle
} from 'react-icons/hi';
import { api, apiUtils } from '../services/api';
import { useAuth } from '../context/AppContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { userEmail, setUserEmail } = useAuth();
  const [simulationResult, setSimulationResult] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  
  // Fetch project details
  const { data: project, isLoading, error } = useQuery(
    ['project', id],
    () => api.getProject(id)
  );
  
  // Fetch tariff categories
  const { data: tariffCategories } = useQuery(
    'tariffCategories',
    api.getTariffCategories
  );
  
  // Simulation form
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      simulation_type: 'coverage',
      monthly_consumption_kwh: '',
      tariff_category_id: '',
      coverage_percentage: '50',
      number_of_panels: '',
      investment_amount_usd: '',
      user_email: userEmail,
    }
  });
  
  const simulationType = watch('simulation_type');
  
  // Create simulation mutation
  const createSimulationMutation = useMutation(api.createSimulation, {
    onSuccess: (data) => {
      setSimulationResult(data);
      if (data.simulation.user_email && data.simulation.user_email !== userEmail) {
        setUserEmail(data.simulation.user_email);
      }
      toast.success('Simulación creada exitosamente');
    },
    onError: (error) => {
      const errorMessage = apiUtils.extractErrorMessage(error);
      toast.error(errorMessage);
    },
  });
  
  const onSubmit = (data) => {
    const payload = {
      project_id: parseInt(id),
      monthly_consumption_kwh: parseFloat(data.monthly_consumption_kwh),
      tariff_category_id: parseInt(data.tariff_category_id),
      user_email: data.user_email || '',
    };
    
    // Add the specific simulation parameter
    if (simulationType === 'coverage') {
      payload.coverage_percentage = parseFloat(data.coverage_percentage);
    } else if (simulationType === 'panels') {
      payload.number_of_panels = parseInt(data.number_of_panels);
    } else if (simulationType === 'investment') {
      payload.investment_amount_usd = parseFloat(data.investment_amount_usd);
    }
    
    createSimulationMutation.mutate(payload);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Proyecto no encontrado</p>
          <Link to="/proyectos" className="btn btn-primary">
            Volver a Proyectos
          </Link>
        </div>
      </div>
    );
  }
  
  const getStatusColor = (status) => {
    const colors = {
      development: 'bg-blue-100 text-blue-800',
      funding: 'bg-green-100 text-green-800',
      construction: 'bg-yellow-100 text-yellow-800',
      operational: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  const getStatusLabel = (status) => {
    const labels = {
      development: 'En Desarrollo',
      funding: 'En Financiamiento',
      construction: 'En Construcción',
      operational: 'Operativo',
      completed: 'Completado',
    };
    return labels[status] || status;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-xl section-padding">
        {/* Back Button */}
        <Link 
          to="/proyectos" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <HiOutlineArrowLeft className="w-5 h-5 mr-2" />
          Volver a Proyectos
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {project.name}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <HiOutlineLocationMarker className="w-5 h-5 mr-2" />
                    <span>{project.location}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                {project.description}
              </p>
            </div>
            
            {/* Project Images */}
            {project.images && project.images.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Galería del Proyecto</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.images.map((image) => (
                    <div key={image.id} className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={image.image}
                        alt={image.caption || project.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                          <p className="text-sm">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Technical Specifications */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Especificaciones Técnicas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Potencia Total Proyectada</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {apiUtils.formatPower(project.total_power_projected)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Potencia Instalada</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {apiUtils.formatPower(project.total_power_installed)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Potencia Disponible</label>
                  <p className="text-lg font-semibold text-primary-600">
                    {apiUtils.formatPower(project.available_power)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Disponibilidad</label>
                  <p className="text-lg font-semibold text-accent-600">
                    {apiUtils.formatNumber(project.available_power_percentage, 1)}%
                  </p>
                </div>
                
                {project.expected_annual_generation && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Generación Anual Esperada</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {apiUtils.formatEnergy(project.expected_annual_generation)}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Potencia por Panel</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {apiUtils.formatNumber(project.panel_power_wp)} Wp
                  </p>
                </div>
              </div>
            </div>
            
            {/* Financial Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Información Financiera</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Precio por Wp</label>
                  <p className="text-lg font-semibold text-gray-900">
                    ${apiUtils.formatNumber(project.price_per_wp_usd, 2)} USD
                  </p>
                </div>
                
                {project.price_per_panel_usd && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Precio por Panel</label>
                    <p className="text-lg font-semibold text-gray-900">
                      ${apiUtils.formatNumber(project.price_per_panel_usd)} USD
                    </p>
                  </div>
                )}
                
                {project.funding_goal && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Meta de Financiamiento</label>
                      <p className="text-lg font-semibold text-gray-900">
                        ${apiUtils.formatNumber(project.funding_goal)} USD
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Financiamiento Recaudado</label>
                      <p className="text-lg font-semibold text-primary-600">
                        {apiUtils.formatNumber(project.funding_percentage, 1)}%
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Project Owners */}
            {project.owners && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Propietarios del Proyecto</h2>
                <p className="text-gray-700">{project.owners}</p>
              </div>
            )}
          </div>
          
          {/* Investment Simulator */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <div className="flex items-center space-x-2 mb-4">
                <HiOutlineCalculator className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Simulador de Inversión</h2>
              </div>
              
              {!showSimulator ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Calcula el retorno de tu inversión en este proyecto
                  </p>
                  <Link
                    to={`/simular/${project.id}`}
                    className="btn btn-primary w-full text-center"
                  >
                    Simular Inversión
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* User Email */}
                  <div>
                    <label className="form-label">Email (opcional)</label>
                    <input
                      type="email"
                      {...register('user_email')}
                      placeholder="tu@email.com"
                      className="input"
                    />
                    <p className="form-help">Para guardar tu simulación</p>
                  </div>
                  
                  {/* Monthly Consumption */}
                  <div>
                    <label className="form-label">Consumo Mensual (kWh) *</label>
                    <input
                      type="number"
                      {...register('monthly_consumption_kwh', { 
                        required: 'Este campo es requerido',
                        min: { value: 1, message: 'Debe ser mayor a 0' }
                      })}
                      placeholder="Ej: 300"
                      className={`input ${errors.monthly_consumption_kwh ? 'input-error' : ''}`}
                    />
                    {errors.monthly_consumption_kwh && (
                      <p className="form-error">{errors.monthly_consumption_kwh.message}</p>
                    )}
                  </div>
                  
                  {/* Tariff Category */}
                  <div>
                    <label className="form-label">Categoría Tarifaria *</label>
                    <select
                      {...register('tariff_category_id', { 
                        required: 'Selecciona una categoría' 
                      })}
                      className={`input ${errors.tariff_category_id ? 'input-error' : ''}`}
                    >
                      <option value="">Seleccionar...</option>
                      {tariffCategories?.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.code})
                        </option>
                      ))}
                    </select>
                    {errors.tariff_category_id && (
                      <p className="form-error">{errors.tariff_category_id.message}</p>
                    )}
                  </div>
                  
                  {/* Simulation Type */}
                  <div>
                    <label className="form-label">Tipo de Simulación</label>
                    <select
                      {...register('simulation_type')}
                      className="input"
                    >
                      <option value="coverage">Por Porcentaje de Cobertura</option>
                      <option value="panels">Por Cantidad de Paneles</option>
                      <option value="investment">Por Monto de Inversión</option>
                    </select>
                  </div>
                  
                  {/* Dynamic Input Based on Simulation Type */}
                  {simulationType === 'coverage' && (
                    <div>
                      <label className="form-label">Porcentaje de Cobertura (%)</label>
                      <input
                        type="number"
                        {...register('coverage_percentage', {
                          min: { value: 1, message: 'Mínimo 1%' },
                          max: { value: 100, message: 'Máximo 100%' }
                        })}
                        min="1"
                        max="100"
                        className="input"
                      />
                      {errors.coverage_percentage && (
                        <p className="form-error">{errors.coverage_percentage.message}</p>
                      )}
                    </div>
                  )}
                  
                  {simulationType === 'panels' && (
                    <div>
                      <label className="form-label">Cantidad de Paneles</label>
                      <input
                        type="number"
                        {...register('number_of_panels', {
                          min: { value: 1, message: 'Mínimo 1 panel' }
                        })}
                        min="1"
                        className="input"
                      />
                      {errors.number_of_panels && (
                        <p className="form-error">{errors.number_of_panels.message}</p>
                      )}
                    </div>
                  )}
                  
                  {simulationType === 'investment' && (
                    <div>
                      <label className="form-label">Monto de Inversión (USD)</label>
                      <input
                        type="number"
                        {...register('investment_amount_usd', {
                          min: { value: 1, message: 'Mínimo $1 USD' }
                        })}
                        min="1"
                        step="0.01"
                        className="input"
                      />
                      {errors.investment_amount_usd && (
                        <p className="form-error">{errors.investment_amount_usd.message}</p>
                      )}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={createSimulationMutation.isLoading}
                    className="btn btn-primary w-full"
                  >
                    {createSimulationMutation.isLoading ? (
                      <LoadingSpinner size="small" color="white" />
                    ) : (
                      'Calcular Simulación'
                    )}
                  </button>
                </form>
              )}
              
              {/* Simulation Results */}
              {simulationResult && (
                <SimulationResults 
                  result={simulationResult} 
                  onReset={() => setSimulationResult(null)} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simulation Results Component
const SimulationResults = ({ result, onReset }) => {
  const { simulation, capacity_check } = result;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary-900">
          Resultados de la Simulación
        </h3>
        <button
          onClick={onReset}
          className="text-primary-600 hover:text-primary-700 text-sm"
        >
          Nueva Simulación
        </button>
      </div>
      
      {/* Capacity Warning */}
      {!capacity_check.has_capacity && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <div className="flex items-center space-x-2">
            <HiOutlineInformationCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              La potencia requerida excede la disponibilidad del proyecto
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Inversión Total:</span>
          <span className="font-semibold">
            ${apiUtils.formatNumber(simulation.total_investment_usd)} USD
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Potencia Instalada:</span>
          <span className="font-semibold">
            {apiUtils.formatPower(simulation.installed_power_kw)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Generación Mensual:</span>
          <span className="font-semibold">
            {apiUtils.formatNumber(simulation.monthly_generation_kwh)} kWh
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Ahorro Mensual:</span>
          <span className="font-semibold text-green-600">
            {apiUtils.formatCurrency(simulation.monthly_savings_ars)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">ROI Anual:</span>
          <span className="font-semibold text-green-600">
            {apiUtils.formatNumber(simulation.roi_annual, 1)}%
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Periodo de Retorno:</span>
          <span className="font-semibold">
            {apiUtils.formatNumber(simulation.payback_period_years, 1)} años
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Cobertura Lograda:</span>
          <span className="font-semibold text-primary-600">
            {apiUtils.formatNumber(simulation.coverage_achieved, 1)}%
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-primary-200">
        <Link
          to="/mis-simulaciones"
          className="btn btn-outline w-full text-sm"
        >
          <HiOutlineChartBar className="w-4 h-4 mr-2" />
          Ver Todas mis Simulaciones
        </Link>
      </div>
    </motion.div>
  );
};

export default ProjectDetailPage;