import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  HiOutlineArrowLeft,
  HiOutlineCalculator,
  HiOutlineLightningBolt,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineTrendingUp,
  HiOutlineClock
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import { api, apiUtils } from '../services/api';
import { useAuth } from '../context/AppContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const SimulationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userEmail, setUserEmail } = useAuth();
  const [simulationResult, setSimulationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [limits, setLimits] = useState(null);
  const [limitsLoading, setLimitsLoading] = useState(false);

  // Fetch project details
  const { data: project, isLoading: projectLoading, error } = useQuery(
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
      bill_coverage_percentage: 50,
      number_of_panels: '',
      investment_amount_usd: '',
      user_email: userEmail || '',
      user_phone: '',
    }
  });

  const simulationType = watch('simulation_type');
  const billCoveragePercentage = watch('bill_coverage_percentage');
  const monthlyBill = watch('monthly_bill_ars');
  const investmentAmount = watch('investment_amount_usd');
  const tariffCategoryId = watch('tariff_category_id');

  // Clear other fields when simulation type changes
  React.useEffect(() => {
    if (simulationType === 'bill_coverage') {
      setValue('number_of_panels', '');
      setValue('investment_amount_usd', '');
    } else if (simulationType === 'panels') {
      setValue('bill_coverage_percentage', 50);
      setValue('investment_amount_usd', '');
    } else if (simulationType === 'investment') {
      setValue('bill_coverage_percentage', 50);
      setValue('number_of_panels', '');
    }
  }, [simulationType, setValue]);

  // Calculate limits based on monthly bill
  useEffect(() => {
    const calculateLimits = async () => {
      if (!monthlyBill || !project || !tariffCategoryId) {
        setLimits(null);
        return;
      }

      if (monthlyBill <= 0) {
        setLimits(null);
        return;
      }

      setLimitsLoading(true);
      try {
        const requestData = {
          monthly_bill_ars: monthlyBill,
          project_id: project.id,
          tariff_category_id: tariffCategoryId
        };
        console.log('🔍 DEBUG - Request data:', requestData);
        const response = await api.calculateLimits(requestData);
        console.log('🔍 DEBUG - Full response:', response);
        console.log('🔍 DEBUG - Response data:', response.data);
        console.log('🔍 DEBUG - max_panels_allowed:', response.data?.max_panels_allowed);
        
        // Los datos están en response directamente, no en response.data
        const limitsData = response.data || response;
        console.log('🔍 DEBUG - Using limits data:', limitsData);
        setLimits(limitsData);
      } catch (error) {
        console.error('🔍 DEBUG - API Error:', error);
        console.error('🔍 DEBUG - Error response:', error.response);
        console.error('🔍 DEBUG - Error message:', error.message);
        setLimits(null);
      } finally {
        setLimitsLoading(false);
      }
    };

    calculateLimits();
  }, [monthlyBill, project, tariffCategoryId]);

  // Calculate maximum panels based on bill coverage limits (100% max)
  const maxPanelsBasedOnBill = React.useMemo(() => {
    console.log('🔍 DEBUG - limits object:', limits);
    console.log('🔍 DEBUG - max_panels_allowed value:', limits?.max_panels_allowed);
    if (!limits?.max_panels_allowed) return null;
    return limits.max_panels_allowed;
  }, [limits]);

  // Calculate suggested maximum panels based on project availability
  const maxAvailablePanels = React.useMemo(() => {
    if (!project) return null;
    
    const panelPowerKw = project.panel_power_wp / 1000; // Convert Wp to kW
    const maxPanels = Math.floor(project.available_power / panelPowerKw);
    
    return Math.max(1, maxPanels); // At least 1 panel
  }, [project]);

  // Use the most restrictive limit: either bill-based or project capacity
  const maxPanels = React.useMemo(() => {
    console.log('🔍 DEBUG - maxPanelsBasedOnBill:', maxPanelsBasedOnBill);
    console.log('🔍 DEBUG - maxAvailablePanels:', maxAvailablePanels);
    
    if (!maxPanelsBasedOnBill && !maxAvailablePanels) return null;
    if (!maxPanelsBasedOnBill) {
      console.log('🔍 DEBUG - Using maxAvailablePanels:', maxAvailablePanels);
      return maxAvailablePanels;
    }
    if (!maxAvailablePanels) {
      console.log('🔍 DEBUG - Using maxPanelsBasedOnBill:', maxPanelsBasedOnBill);
      return maxPanelsBasedOnBill;
    }
    const result = Math.min(maxPanelsBasedOnBill, maxAvailablePanels);
    console.log('🔍 DEBUG - Using minimum of both:', result);
    return result;
  }, [maxPanelsBasedOnBill, maxAvailablePanels]);

  // Create simulation mutation
  const createSimulationMutation = useMutation(
    (data) => api.createSimulation({ ...data, project_id: id }),
    {
      onSuccess: (result) => {
        setSimulationResult(result);
        setIsCalculating(false);
        if (result.simulation?.user_email && result.simulation.user_email !== userEmail) {
          setUserEmail(result.simulation.user_email);
        }
        toast.success('¡Simulación calculada exitosamente!');
      },
      onError: (error) => {
        setIsCalculating(false);
        toast.error(apiUtils.extractErrorMessage(error, 'Error al calcular la simulación'));
      }
    }
  );

  const onSubmit = async (data) => {
    setIsCalculating(true);
    setSimulationResult(null);
    
    // Base data common to all simulation types
    const processedData = {
      project_id: parseInt(id),
      user_email: data.user_email,
      user_phone: data.user_phone,
      monthly_bill_ars: parseFloat(data.monthly_bill_ars) || 0,
      tariff_category_id: parseInt(data.tariff_category_id) || null,
      simulation_type: data.simulation_type,
    };

    // Add only the relevant parameter based on simulation type
    if (data.simulation_type === 'bill_coverage') {
      processedData.bill_coverage_percentage = parseFloat(data.bill_coverage_percentage) || 50;
    } else if (data.simulation_type === 'panels') {
      processedData.number_of_panels = parseInt(data.number_of_panels) || null;
    } else if (data.simulation_type === 'investment') {
      processedData.investment_amount_usd = parseFloat(data.investment_amount_usd) || null;
    }
    
    console.log('Processed data:', processedData); // Para debugging
    createSimulationMutation.mutate(processedData);
  };

  if (projectLoading) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comunidad Solar no encontrada</h2>
          <Link to="/comunidades-solares" className="btn btn-primary">
            Volver a Comunidades Solares
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative py-8">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/images/backgrounds/tecnicosenparquesolar.jpg"
          alt="Técnicos trabajando en parque solar"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-600/70"></div>
      </div>

      <div className="container-xl section-padding relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={`/comunidades-solares/${id}`}
            className="inline-flex items-center text-white hover:text-primary-200 mb-4 transition-colors duration-300"
          >
            <HiOutlineArrowLeft className="w-4 h-4 mr-2" />
            Volver a la Comunidad Solar
          </Link>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Simulador de Inversión
                </h1>
                <h2 className="text-xl text-gray-600 mb-4">
                  {project.name}
                </h2>
                <div className="flex items-center text-gray-500">
                  <HiOutlineLightningBolt className="w-4 h-4 mr-1" />
                  <span>{project.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Disponible</div>
                <div className="text-2xl font-bold text-primary-600">
                  {apiUtils.formatPower(project.available_power)}
                </div>
                <div className="text-sm text-gray-600">
                  ${apiUtils.formatNumber(project.price_per_wp_usd, 2)} USD/Wp
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <HiOutlineCalculator className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-semibold">Parámetros de Simulación</h3>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    {...register('user_email', {
                      required: 'Email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    className="input"
                    placeholder="tu@email.com"
                  />
                  {errors.user_email && (
                    <p className="form-error">{errors.user_email.message}</p>
                  )}
                </div>

                {/* Phone */}
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
                      className={`input rounded-l-none ${errors.user_phone ? 'input-error' : ''}`}
                      placeholder="11 1234-5678"
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
                        required: 'Factura mensual es requerida',
                        min: { value: 1, message: 'Debe ser mayor a $0' }
                      })}
                      className={`input pl-8 ${errors.monthly_bill_ars ? 'input-error' : ''}`}
                      placeholder="50000"
                      min="1"
                      step="1"
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
                  <label className="form-label">Categoría Tarifaria</label>
                  <select
                    {...register('tariff_category_id', { 
                      required: 'Selecciona una categoría'
                    })}
                    className="input"
                  >
                    <option value="">Seleccionar categoría</option>
                    {tariffCategories && Array.isArray(tariffCategories) ? (
                      tariffCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.code})
                        </option>
                      ))
                    ) : tariffCategories?.results && Array.isArray(tariffCategories.results) ? (
                      tariffCategories.results.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.code})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Cargando categorías...</option>
                    )}
                  </select>
                  {errors.tariff_category_id && (
                    <p className="form-error">{errors.tariff_category_id.message}</p>
                  )}
                </div>

                {/* Simulation Type */}
                <div>
                  <label className="form-label">Tipo de Simulación</label>
                  <select
                    {...register('simulation_type', { required: 'Selecciona un tipo' })}
                    className="input"
                  >
                    <option value="bill_coverage">Cobertura de Factura</option>
                    <option value="panels">Número de Paneles</option>
                    <option value="investment">Monto de Inversión</option>
                  </select>
                </div>

                {/* Dynamic Fields Based on Simulation Type */}
                {simulationType === 'bill_coverage' && (
                  <div>
                    <label className="form-label">
                      Porcentaje de Cobertura de Factura: {billCoveragePercentage}%
                    </label>
                    <div className="relative py-2">
                      {/* Barra de fondo */}
                      <div className="w-full h-2 bg-gray-200 rounded-lg">
                        {/* Barra de progreso verde */}
                        <div 
                          className="h-2 bg-primary-500 rounded-lg transition-all duration-75"
                          style={{ 
                            width: `${((billCoveragePercentage - 10) / (100 - 10)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      {/* Slider funcional encima */}
                      <input
                        type="range"
                        {...register('bill_coverage_percentage')}
                        min="10"
                        max="100"
                        step="1"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        style={{ margin: 0 }}
                      />
                      {/* Círculo del slider */}
                      <div 
                        className="absolute top-1/2 w-4 h-4 bg-primary-600 border-2 border-white rounded-full shadow-md transform -translate-y-1/2 -translate-x-1/2 transition-all duration-75 pointer-events-none"
                        style={{ 
                          left: `${((billCoveragePercentage - 10) / (100 - 10)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>10%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}

                {simulationType === 'panels' && (
                  <div>
                    <label className="form-label">
                      Número de Paneles
                      {maxPanels && (
                        <span className="text-sm text-gray-500 font-normal">
                          {' '}(máximo {maxPanels} paneles)
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
                          message: `Máximo ${maxPanels} paneles (el ahorro no puede superar el 100% de tu factura mensual)` 
                        } : undefined
                      })}
                      min="1"
                      max={maxPanels || undefined}
                      step="1"
                      className="input"
                      placeholder="ej. 10"
                    />
                    {errors.number_of_panels && (
                      <p className="form-error">{errors.number_of_panels.message}</p>
                    )}
                    {maxPanels && (
                      <p className="text-xs text-gray-600 mt-1">
                        💡 Máximo {maxPanels} paneles para no superar el 100% de cobertura de tu factura
                        {maxPanelsBasedOnBill && maxAvailablePanels && maxPanelsBasedOnBill < maxAvailablePanels && (
                          <span className="block text-orange-600">
                            ⚠️ Limitado por tu factura mensual (proyecto permite hasta {maxAvailablePanels} paneles)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {simulationType === 'investment' && (
                  <div>
                    <label className="form-label">
                      Monto de Inversión (USD)
                      {limits?.max_investment_usd && (
                        <span className="text-sm text-gray-500 font-normal">
                          {' '}(máximo ${apiUtils.formatNumber(limits.max_investment_usd, 0)} USD)
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      {...register('investment_amount_usd', {
                        required: 'Monto de inversión es requerido',
                        min: { value: 1, message: 'Mínimo $1 USD' },
                        max: limits?.max_investment_usd ? { 
                          value: limits.max_investment_usd, 
                          message: `Máximo $${apiUtils.formatNumber(limits.max_investment_usd, 0)} USD (no puede superar el 100% de cobertura de tu factura)` 
                        } : undefined
                      })}
                      min="1"
                      max={limits?.max_investment_usd || undefined}
                      step="0.01"
                      className="input"
                      placeholder="ej. 5000"
                    />
                    {errors.investment_amount_usd && (
                      <p className="form-error">{errors.investment_amount_usd.message}</p>
                    )}
                    {limits?.max_investment_usd && (
                      <p className="text-xs text-gray-600 mt-1">
                        💡 Máximo ${apiUtils.formatNumber(limits.max_investment_usd, 0)} USD para no superar el 100% de cobertura de tu factura
                      </p>
                    )}
                  </div>
                )}

                {/* Investment and Panel Limits */}
                {limits && (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <HiOutlineInformationCircle className="w-5 h-5 mr-2 text-blue-500" />
                      Límites Máximos (100% Cobertura)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inversión máxima:</span>
                          <span className="font-medium text-green-700">
                            ${apiUtils.formatNumber(limits.max_investment_usd, 0)} USD
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">En pesos:</span>
                          <span className="font-medium text-gray-700">
                            ${apiUtils.formatNumber(limits.max_investment_ars, 0)} ARS
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paneles máximos:</span>
                          <span className="font-medium text-green-700">
                            {limits.max_panels_allowed} paneles
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cobertura:</span>
                          <span className="font-medium text-gray-700">
                            100% de la factura
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Período máximo de retorno: {limits.max_payback_years} años</span>
                        <span>Ahorro por panel: ${apiUtils.formatNumber(limits.savings_per_panel_ars, 0)} ARS/mes</span>
                      </div>
                    </div>
                  </div>
                )}

                {limitsLoading && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <LoadingSpinner size="small" />
                      <span>Calculando límites...</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCalculating}
                  className="btn btn-primary w-full text-lg py-3"
                >
                  {isCalculating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="small" color="white" />
                      <span>Calculando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <HiOutlineCalculator className="w-5 h-5" />
                      <span>Calcular Simulación</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {simulationResult ? (
              <SimulationResults result={simulationResult} project={project} />
            ) : (
                          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-lg p-6">
              <div className="text-center py-12">
                <HiOutlineChartBar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Resultados de la Simulación
                </h3>
                <p className="text-gray-200">
                  Completa el formulario y haz click en "Calcular Simulación" para ver los resultados.
                </p>
              </div>
            </div>
            )}
          </div>
        </div>
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
const SimulationResults = ({ result, project }) => {
  const { simulation, capacity_check } = result;
  const navigate = useNavigate();

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
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="bg-primary-600 text-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Resultados de la Simulación</h3>
          <HiOutlineCheckCircle className="w-8 h-8" />
        </div>
      </div>

      <div className="p-6">
        {/* Capacity Warning */}
        {!capacity_check.has_capacity && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <HiOutlineInformationCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Capacidad Limitada</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  La potencia requerida ({apiUtils.formatPower(capacity_check.required_power_kw)}) 
                  excede la disponibilidad del proyecto ({apiUtils.formatPower(capacity_check.available_power_kw)}).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Results Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <HiOutlineCurrencyDollar className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Inversión Total</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${apiUtils.formatNumber(simulation.total_investment_usd)} USD
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HiOutlineLightningBolt className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Potencia Instalada</div>
                  <div className="text-xl font-bold text-gray-900">
                    {apiUtils.formatPower(simulation.installed_power_kw)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <HiOutlineTrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">ROI Anual</div>
                  <div className="text-xl font-bold text-green-600">
                    {apiUtils.formatNumber(simulation.roi_annual, 1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <HiOutlineClock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Periodo de Retorno</div>
                  <div className="text-xl font-bold text-orange-600">
                    {apiUtils.formatNumber(simulation.payback_period_years, 1)} años
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Detalles Financieros</h4>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {apiUtils.formatNumber(simulation.monthly_generation_kwh)}
              </div>
              <div className="text-sm text-gray-600">kWh/mes generados</div>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {apiUtils.formatCurrency(simulation.monthly_savings_ars)}
              </div>
              <div className="text-sm text-gray-600">Ahorro mensual (ARS)</div>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                ${apiUtils.formatNumber(simulation.annual_savings_usd, 0)}
              </div>
              <div className="text-sm text-gray-600">Ahorro anual (USD)</div>
            </div>
          </div>
        </div>

        {/* Solar Park Visualization */}
        <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HiOutlineLightningBolt className="w-5 h-5 text-green-600 mr-2" />
            Tu Participación en el Parque Solar
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tu potencia: {apiUtils.formatPower(simulation.installed_power_kw)}</span>
              <span>Capacidad total: {apiUtils.formatPower(project.available_power)}</span>
            </div>
            
            {/* Solar Park Grid */}
            <div className="relative">
              <div 
                className="grid gap-1 bg-gray-100 p-4 rounded-lg"
                style={{ gridTemplateColumns: 'repeat(20, 1fr)' }}
              >
                {Array.from({ length: 100 }, (_, i) => {
                  const userPercentage = Math.min((simulation.installed_power_kw / project.available_power) * 100, 100);
                  const isUserPanel = i < Math.floor(userPercentage);
                  
                  return (
                    <div
                      key={i}
                      className={`
                        aspect-square rounded-sm transition-all duration-300 transform hover:scale-110
                        ${isUserPanel 
                          ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-sm' 
                          : 'bg-gray-300'
                        }
                      `}
                      style={{
                        animationDelay: `${i * 20}ms`
                      }}
                    />
                  );
                })}
              </div>
              
              {/* Percentage Label */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
                  <div className="text-2xl font-bold text-gray-900">
                    {apiUtils.formatNumber((simulation.installed_power_kw / project.available_power) * 100, 1)}%
                  </div>
                  <div className="text-xs text-gray-600 text-center">de participación</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-sm"></div>
                <span className="text-gray-600">Tu inversión</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                <span className="text-gray-600">Disponible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mt-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/mis-simulaciones"
              className="btn btn-outline flex-1"
            >
              Ver Mis Simulaciones
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary flex-1"
            >
              Nueva Simulación
            </button>
          </div>
          
          {project.commercial_whatsapp && (
            <button
              onClick={handleWhatsAppContact}
              className="btn w-full text-white bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600 transition-colors flex items-center justify-center"
            >
              <FaWhatsapp className="w-6 h-6 mr-2" />
              Asesor Comercial
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SimulationPage;