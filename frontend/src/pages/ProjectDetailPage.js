import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineCalculator,
  HiOutlineChartBar,
  HiOutlineArrowLeft,
  HiOutlineInformationCircle
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { api, apiUtils } from '../services/api';
import { useAuth } from '../context/AppContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { userEmail, setUserEmail } = useAuth();
  const [simulationResult, setSimulationResult] = useState(null);
  const [showSimulator] = useState(false);
  const [isFinancialUnlocked, setIsFinancialUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
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
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      simulation_type: 'bill_coverage',
      monthly_bill_ars: '',
      tariff_category_id: '',
      bill_coverage_percentage: '50',
      number_of_panels: '',
      investment_amount_usd: '',
      user_email: userEmail,
      user_phone: '',
    }
  });
  
  const simulationType = watch('simulation_type');

  // Check if financial access is unlocked on component mount
  React.useEffect(() => {
    if (project) {
      const unlocked = localStorage.getItem(`financialAccessUnlocked_${project.id}`);
      if (unlocked === 'true') {
        setIsFinancialUnlocked(true);
      }
    }
  }, [project]);

  // Clear other fields when simulation type changes
  React.useEffect(() => {
    if (simulationType === 'bill_coverage') {
      setValue('number_of_panels', '');
      setValue('investment_amount_usd', '');
    } else if (simulationType === 'panels') {
      setValue('bill_coverage_percentage', '50');
      setValue('investment_amount_usd', '');
    } else if (simulationType === 'investment') {
      setValue('bill_coverage_percentage', '50');
      setValue('number_of_panels', '');
    }
  }, [simulationType, setValue]);

  // Calculate suggested maximum panels based on project availability
  const maxAvailablePanels = React.useMemo(() => {
    if (!project) return null;
    
    const panelPowerKw = project.panel_power_wp / 1000; // Convert Wp to kW
    const maxPanels = Math.floor(project.available_power / panelPowerKw);
    
    return Math.max(1, maxPanels); // At least 1 panel
  }, [project]);

  const maxPanels = maxAvailablePanels;
  
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
  
  // Handle password submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const correctPassword = project.financial_access_password; // Contraseña específica del proyecto
    
    if (passwordInput === correctPassword) {
      setIsFinancialUnlocked(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      localStorage.setItem(`financialAccessUnlocked_${project.id}`, 'true');
      toast.success('¡Acceso concedido! Ahora puedes ver la información financiera.');
    } else {
      toast.error('Contraseña incorrecta. Intenta nuevamente.');
      setPasswordInput('');
    }
  };

  const onSubmit = (data) => {
    const payload = {
      project_id: parseInt(id),
      monthly_bill_ars: parseFloat(data.monthly_bill_ars),
      tariff_category_id: parseInt(data.tariff_category_id),
      user_email: data.user_email,
      user_phone: data.user_phone,
    };
    
    // Add the specific simulation parameter
    if (simulationType === 'bill_coverage') {
      payload.bill_coverage_percentage = parseFloat(data.bill_coverage_percentage);
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
          <Link to="/comunidades-solares" className="btn btn-primary">
            Volver a Comunidades Solares
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
          to="/comunidades-solares" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <HiOutlineArrowLeft className="w-5 h-5 mr-2" />
          Volver a Comunidades Solares
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
            <div className="card p-6 relative">
              <h2 className="text-xl font-semibold mb-4">Información Financiera</h2>
              
              {isFinancialUnlocked ? (
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
              ) : (
                <div className="relative">
                  {/* Blurred Content */}
                  <div className="filter blur-sm pointer-events-none select-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Precio por Wp</label>
                        <p className="text-lg font-semibold text-gray-900">
                          $XX.XX USD
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Precio por Panel</label>
                        <p className="text-lg font-semibold text-gray-900">
                          $XXX USD
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Meta de Financiamiento</label>
                        <p className="text-lg font-semibold text-gray-900">
                          $XXX,XXX USD
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Financiamiento Recaudado</label>
                        <p className="text-lg font-semibold text-primary-600">
                          XX.X%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Unlock Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                    <div className="text-center">
                      <HiOutlineCurrencyDollar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                      <p className="text-gray-700 mb-4 max-w-xs">
                        La información financiera está protegida. Ingresa la contraseña brindada por tu Cooperativa para acceder.
                      </p>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="btn btn-primary"
                      >
                        Acceder a Información Financiera
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
            <div className="card p-6 sticky top-8 relative">
              <div className="flex items-center space-x-2 mb-4">
                <HiOutlineCalculator className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Simulador de Inversión</h2>
              </div>
              
              {isFinancialUnlocked ? (
                <>
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
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      {...register('user_email', { 
                        required: 'Email es requerido',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Email no válido'
                        }
                      })}
                      placeholder="tu@email.com"
                      className={`input ${errors.user_email ? 'input-error' : ''}`}
                    />
                    {errors.user_email && (
                      <p className="form-error">{errors.user_email.message}</p>
                    )}
                  </div>
                  
                  {/* User Phone */}
                  <div>
                    <label className="form-label">Teléfono *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        +54
                      </span>
                      <input
                        type="tel"
                        {...register('user_phone', { 
                          required: 'Teléfono es requerido',
                          minLength: { value: 8, message: 'Mínimo 8 dígitos' }
                        })}
                        placeholder="11 1234-5678"
                        className={`input rounded-l-none ${errors.user_phone ? 'input-error' : ''}`}
                      />
                    </div>
                    {errors.user_phone && (
                      <p className="form-error">{errors.user_phone.message}</p>
                    )}
                    <p className="form-help">Número sin el código de país</p>
                  </div>
                  
                  {/* Monthly Bill */}
                  <div>
                    <label className="form-label">Factura Mensual (Impuestos incluidos) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        {...register('monthly_bill_ars', { 
                          required: 'Este campo es requerido',
                          min: { value: 1, message: 'Debe ser mayor a $0' }
                        })}
                        placeholder="50000"
                        className={`input pl-8 ${errors.monthly_bill_ars ? 'input-error' : ''}`}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">ARS</span>
                    </div>
                    {errors.monthly_bill_ars && (
                      <p className="form-error">{errors.monthly_bill_ars.message}</p>
                    )}
                    <p className="form-help">Monto total de tu factura de luz mensual</p>
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
                      <option value="bill_coverage">Cobertura de Factura</option>
                      <option value="panels">Número de Paneles</option>
                      <option value="investment">Monto de Inversión</option>
                    </select>
                  </div>
                  
                  {/* Dynamic Input Based on Simulation Type */}
                  {simulationType === 'bill_coverage' && (
                    <div>
                      <label className="form-label">Porcentaje de Cobertura de Factura (%)</label>
                      <input
                        type="number"
                        {...register('bill_coverage_percentage', {
                          min: { value: 1, message: 'Mínimo 1%' },
                          max: { value: 100, message: 'Máximo 100%' }
                        })}
                        min="1"
                        max="100"
                        className="input"
                      />
                      {errors.bill_coverage_percentage && (
                        <p className="form-error">{errors.bill_coverage_percentage.message}</p>
                      )}
                      <p className="form-help">¿Qué porcentaje de tu factura quieres cubrir con energía solar?</p>
                    </div>
                  )}
                  
                  {simulationType === 'panels' && (
                    <div>
                      <label className="form-label">
                        Cantidad de Paneles
                        {maxPanels && (
                          <span className="text-sm text-gray-500 font-normal">
                            {' '}(máximo {maxPanels} disponibles)
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        {...register('number_of_panels', {
                          required: 'Número de paneles es requerido',
                          min: { value: 1, message: 'Mínimo 1 panel' },
                          max: maxPanels ? { 
                            value: maxPanels, 
                            message: `Máximo ${maxPanels} paneles disponibles en este proyecto` 
                          } : undefined
                        })}
                        min="1"
                        max={maxPanels || undefined}
                        className="input"
                      />
                      {errors.number_of_panels && (
                        <p className="form-error">{errors.number_of_panels.message}</p>
                      )}
                      {maxPanels && (
                        <p className="text-xs text-gray-600 mt-1">
                          💡 Este proyecto tiene {maxPanels} paneles disponibles para inversión
                        </p>
                      )}
                    </div>
                  )}
                  
                  {simulationType === 'investment' && (
                    <div>
                      <label className="form-label">Monto de Inversión (USD)</label>
                      <input
                        type="number"
                        {...register('investment_amount_usd', {
                          required: 'Monto de inversión es requerido',
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
                  project={project}
                />
              )}
                </>
              ) : (
                <div className="relative">
                  {/* Blurred Content */}
                  <div className="filter blur-sm pointer-events-none select-none">
                    <div className="text-center mb-6">
                      <p className="text-gray-600 mb-4">
                        Calcula el retorno de tu inversión en este proyecto
                      </p>
                      <div className="btn btn-primary w-full">
                        Simular Inversión
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="form-label">Email *</label>
                        <div className="input bg-gray-100">usuario@email.com</div>
                      </div>
                      <div>
                        <label className="form-label">Teléfono *</label>
                        <div className="input bg-gray-100">+54 11 XXXX-XXXX</div>
                      </div>
                      <div>
                        <label className="form-label">Factura Mensual *</label>
                        <div className="input bg-gray-100">$XX,XXX ARS</div>
                      </div>
                      <div>
                        <label className="form-label">Categoría Tarifaria *</label>
                        <div className="input bg-gray-100">Seleccionar...</div>
                      </div>
                      <div className="btn btn-primary w-full bg-gray-300">
                        Calcular Simulación
                      </div>
                    </div>
                  </div>
                  
                  {/* Unlock Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                    <div className="text-center">
                      <HiOutlineCalculator className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                      <p className="text-gray-700 mb-4 max-w-xs">
                        El simulador de inversión está protegido. Ingresa la contraseña brindada por tu Cooperativa para acceder.
                      </p>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="btn btn-primary"
                      >
                        Habilitar Simulador
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Acceso a Información Financiera</h3>
              <p className="text-gray-600 mb-4">
                Ingresa la contraseña brindada por tu Cooperativa para acceder a la información financiera y el simulador de inversión.
              </p>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="input w-full"
                    placeholder="Ingresa la contraseña"
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordInput('');
                    }}
                    className="btn btn-outline flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Acceder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Function to create WhatsApp message
const createWhatsAppMessage = (project, simulation, userEmail, userPhone) => {
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

  return `🌞 *CONSULTA SIMULACIÓN SOLAR* 🌞

📋 *PARÁMETROS DE SIMULACIÓN*
• Proyecto: ${project.name}
• Ubicación: ${project.location}
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
🎯 Cobertura Lograda: ${formatNumber(simulation.bill_coverage_achieved, 1)}%

👤 *DATOS DE CONTACTO*
📧 Email: ${userEmail}
📱 Teléfono: +54${userPhone}

Quisiera recibir asesoramiento comercial sobre esta simulación. ¡Gracias! 🙌`;
};

// Simulation Results Component
const SimulationResults = ({ result, onReset, project }) => {
  const { simulation, capacity_check } = result;
  
  // Debug: Check if WhatsApp number is available
  console.log('🔍 DEBUG - SimulationResults rendered');
  console.log('🔍 Project data:', project);
  console.log('🔍 Project WhatsApp:', project.commercial_whatsapp);
  console.log('🔍 Should show button:', !!project.commercial_whatsapp);
  console.log('🔍 Project keys:', Object.keys(project));
  
  const handleWhatsAppContact = () => {
    if (!project.commercial_whatsapp) {
      toast.error('No hay número de WhatsApp configurado para este proyecto');
      return;
    }
    
    const message = createWhatsAppMessage(project, simulation, simulation.user_email, simulation.user_phone);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${project.commercial_whatsapp}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };
  
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
          <span className="text-gray-600">Ahorro Mensual (ARS):</span>
          <span className="font-semibold text-green-600">
            {apiUtils.formatCurrency(simulation.monthly_savings_ars)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Ahorro Anual (USD):</span>
          <span className="font-semibold text-purple-600">
            ${apiUtils.formatNumber(simulation.annual_savings_usd, 0)}
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
          <span className="text-gray-600">Cobertura de Factura Lograda:</span>
          <span className="font-semibold text-primary-600">
            {apiUtils.formatNumber(simulation.bill_coverage_achieved, 1)}%
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-primary-200 space-y-3">
        <div className="flex space-x-2">
          <Link
            to="/mis-simulaciones"
            className="btn btn-outline flex-1 text-sm"
          >
            <HiOutlineChartBar className="w-4 h-4 mr-2" />
            Ver Todas mis Simulaciones
          </Link>
          <button
            onClick={onReset}
            className="btn btn-outline flex-1 text-sm"
          >
            Nueva Simulación
          </button>
        </div>
        
        {project.commercial_whatsapp && (
          <button
            onClick={handleWhatsAppContact}
            className="btn w-full text-sm text-white bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600 transition-colors flex items-center justify-center"
          >
            <FaWhatsapp className="w-5 h-5 mr-2" />
            Asesor Comercial
          </button>
        )}
        
        {/* Debug: Always show this button for testing */}
        <button
          onClick={() => {
            console.log('🔧 Debug button clicked');
            console.log('🔧 project.commercial_whatsapp:', project.commercial_whatsapp);
            console.log('🔧 Boolean check:', !!project.commercial_whatsapp);
          }}
          className="btn w-full text-sm bg-red-500 text-white"
        >
          🔧 DEBUG: WhatsApp = {project.commercial_whatsapp || 'undefined'}
        </button>
        
        {/* Debug: Show conditional result */}
        <div className="text-xs bg-yellow-100 p-2 rounded">
          <strong>DEBUG INFO:</strong><br/>
          WhatsApp: {project.commercial_whatsapp || 'NO VALUE'}<br/>
          Show button: {project.commercial_whatsapp ? 'YES' : 'NO'}<br/>
          Type: {typeof project.commercial_whatsapp}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectDetailPage;