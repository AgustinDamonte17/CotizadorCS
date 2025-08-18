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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-xl section-padding">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-section gradient-text mb-4">
            Comunidades Solares
          </h1>
          <p className="text-lg text-gray-600">
            Encuentra tu Comunidad Solar: invertí, generá energía y ahorrá.
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar comunidades solares por nombre, ubicación..."
                className="input pl-10"
              />
            </div>
            
            {/* Sort */}
            <div className="w-full lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
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
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} flex items-center space-x-2`}
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
                className="border-t border-gray-200 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="form-label">Estado</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="input"
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
                    <label className="form-label">Potencia Mínima (kW)</label>
                    <input
                      type="number"
                      value={filters.min_power}
                      onChange={(e) => handleFilterChange('min_power', e.target.value)}
                      placeholder="Ej: 100"
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Potencia Máxima (kW)</label>
                    <input
                      type="number"
                      value={filters.max_power}
                      onChange={(e) => handleFilterChange('max_power', e.target.value)}
                      placeholder="Ej: 1000"
                      className="input"
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
          <p className="text-gray-600">
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
      className="card card-hover"
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {project.name}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <HiOutlineLocationMarker className="w-4 h-4 mr-1" />
          <span className="text-sm">{project.location}</span>
        </div>
        
        {/* Key Metrics */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Potencia Disponible</span>
            <span className="font-medium text-primary-600">
              {apiUtils.formatPower(project.available_power)}
            </span>
          </div>
          

          
          {project.available_power_percentage && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disponibilidad</span>
              <span className="font-medium text-accent-600">
                {apiUtils.formatNumber(project.available_power_percentage, 1)}%
              </span>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <Link
          to={`/comunidades-solares/${project.id}`}
          className="btn btn-primary w-full flex items-center justify-center space-x-2"
        >
          <HiOutlineEye className="w-4 h-4" />
          <span>Ver Detalles</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProjectsPage;