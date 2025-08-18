import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineLocationMarker,
  HiOutlineLightningBolt,
  HiOutlineCurrencyDollar,
  HiOutlineEye,
  HiOutlineAdjustments
} from 'react-icons/hi';
import { api, apiUtils } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    location: '',
    min_power: '',
    max_power: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('-created_at');
  
  // Fetch projects with filters
  const { data: projects, isLoading, error } = useQuery(
    ['projects', { search: searchTerm, ...filters, ordering: sortBy }],
    () => api.getProjects({ search: searchTerm, ...filters, ordering: sortBy }),
    {
      keepPreviousData: true,
    }
  );
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      status: '',
      location: '',
      min_power: '',
      max_power: '',
    });
    setSearchTerm('');
  };
  
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'development', label: 'En Desarrollo' },
    { value: 'funding', label: 'En Financiamiento' },
    { value: 'construction', label: 'En Construcción' },
    { value: 'operational', label: 'Operativo' },
  ];
  
  const sortOptions = [
    { value: '-created_at', label: 'Más recientes' },
    { value: 'name', label: 'Nombre A-Z' },
    { value: '-available_power', label: 'Mayor potencia disponible' },

  ];
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar los proyectos</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/images/backgrounds/parquesolarnubes.jpg"
          alt="Parque Solar con nubes - Comunidades Solares"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-600/70"></div>
      </div>

      <div className="container-xl section-padding relative z-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-section text-white mb-4">
            Comunidades Solares
          </h1>
          <p className="text-lg text-gray-100">
            Encuentra tu Comunidad Solar: invertí, generá energía y ahorrá.
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-lg hover:bg-white hover:border-white transition-all duration-300 group p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200 group-hover:text-gray-600 w-5 h-5 transition-colors duration-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar comunidades solares por nombre, ubicación..."
                className="w-full pl-10 pr-4 py-3 bg-transparent border-2 border-white/30 group-hover:border-gray-400 rounded-lg text-white group-hover:text-gray-900 placeholder-gray-300 group-hover:placeholder-gray-500 focus:bg-white focus:text-gray-900 focus:border-primary-500 focus:outline-none transition-all duration-300"
              />
            </div>
            
            {/* Sort */}
            <div className="w-full lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border-2 border-white/30 group-hover:border-gray-400 rounded-lg text-white group-hover:text-gray-900 focus:bg-white focus:text-gray-900 focus:border-primary-500 focus:outline-none transition-all duration-300"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'btn btn-primary' : 'px-4 py-2 border-2 border-white/50 text-white bg-transparent rounded-lg group-hover:bg-primary-600 group-hover:border-primary-600 group-hover:text-white'} flex items-center space-x-2 transition-all duration-300 font-medium`}
            >
              <HiOutlineFilter className="w-5 h-5" />
              <span>Filtros</span>
            </button>
          </div>
          
          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-white/30 group-hover:border-gray-300 pt-4 transition-colors duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 group-hover:text-gray-700 mb-2 transition-colors duration-300">Estado</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border-2 border-white/30 group-hover:border-gray-400 rounded-lg text-white group-hover:text-gray-900 focus:bg-white focus:text-gray-900 focus:border-primary-500 focus:outline-none transition-all duration-300"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Power Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 group-hover:text-gray-700 mb-2 transition-colors duration-300">Potencia Mínima (kW)</label>
                    <input
                      type="number"
                      value={filters.min_power}
                      onChange={(e) => handleFilterChange('min_power', e.target.value)}
                      placeholder="Ej: 100"
                      className="w-full px-4 py-3 bg-transparent border-2 border-white/30 group-hover:border-gray-400 rounded-lg text-white group-hover:text-gray-900 placeholder-gray-300 group-hover:placeholder-gray-500 focus:bg-white focus:text-gray-900 focus:border-primary-500 focus:outline-none transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 group-hover:text-gray-700 mb-2 transition-colors duration-300">Potencia Máxima (kW)</label>
                    <input
                      type="number"
                      value={filters.max_power}
                      onChange={(e) => handleFilterChange('max_power', e.target.value)}
                      placeholder="Ej: 1000"
                      className="w-full px-4 py-3 bg-transparent border-2 border-white/30 group-hover:border-gray-400 rounded-lg text-white group-hover:text-gray-900 placeholder-gray-300 group-hover:placeholder-gray-500 focus:bg-white focus:text-gray-900 focus:border-primary-500 focus:outline-none transition-all duration-300"
                    />
                  </div>
                  

                  
                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="btn btn-ghost w-full"
                    >
                      <HiOutlineAdjustments className="w-4 h-4 mr-2" />
                      Limpiar Filtros
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-100">
            {projects?.results?.length || 0} comunidad{(projects?.results?.length || 0) !== 1 ? 'es solares' : ' solar'} encontrada{(projects?.results?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Projects Grid */}
        {projects?.results?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.results.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HiOutlineLightningBolt}
            title="No se encontraron comunidades solares"
            description="Intenta ajustar tus filtros de búsqueda o explora todas las comunidades solares disponibles."
            action={
              <button onClick={clearFilters} className="btn btn-primary">
                Ver Todas las Comunidades Solares
              </button>
            }
          />
        )}
        
        {/* Pagination would go here if needed */}
      </div>
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project, index }) => {
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-lg hover:bg-white hover:border-white transition-all duration-300 group"
    >
      {/* Project Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-accent-100 rounded-t-xl overflow-hidden">
        {project.featured_image ? (
          <img
            src={project.featured_image}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiOutlineLightningBolt className="w-16 h-16 text-primary-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusLabel(project.status)}
          </span>
        </div>
      </div>
      
      {/* Project Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white group-hover:text-gray-900 mb-2 transition-colors duration-300">
          {project.name}
        </h3>
        
        <div className="flex items-center text-gray-200 group-hover:text-gray-600 mb-4 transition-colors duration-300">
          <HiOutlineLocationMarker className="w-4 h-4 mr-1" />
          <span className="text-sm">{project.location}</span>
        </div>
        
        {/* Key Metrics */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-200 group-hover:text-gray-600 transition-colors duration-300">Potencia Disponible</span>
            <span className="font-medium text-primary-200 group-hover:text-primary-600 transition-colors duration-300">
              {apiUtils.formatPower(project.available_power)}
            </span>
          </div>
          

          
          {project.available_power_percentage && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-200 group-hover:text-gray-600 transition-colors duration-300">Disponibilidad</span>
              <span className="font-medium text-accent-200 group-hover:text-accent-600 transition-colors duration-300">
                {apiUtils.formatNumber(project.available_power_percentage, 1)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <Link
          to={`/comunidades-solares/${project.id}`}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-white/50 text-white bg-transparent rounded-lg group-hover:bg-primary-600 group-hover:border-primary-600 transition-all duration-300 font-medium"
        >
          <HiOutlineEye className="w-4 h-4" />
          <span>Ver Detalles</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProjectsPage;