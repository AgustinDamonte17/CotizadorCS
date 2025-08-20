import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineLightningBolt,
  HiOutlineEye
} from 'react-icons/hi';
import { api, apiUtils } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch projects with search
  const { data: projects, isLoading, error } = useQuery(
    ['projects', { search: searchQuery }],
    () => api.getProjects({ search: searchQuery }),
    {
      keepPreviousData: true,
    }
  );
  
  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchQuery('');
  };
  
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
            Encuentra tu Comunidad Solar: invierta, genere energía y ahorre!
          </p>
        </div>
        
        {/* Search */}
        <div className="bg-white border-2 border-white rounded-xl shadow-lg transition-all duration-300 group p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Buscar comunidades solares por nombre, ubicación..."
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-all duration-300"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 border-2 border-primary-600 hover:border-primary-700 text-white rounded-lg transition-all duration-300 font-medium whitespace-nowrap"
            >
              Buscar
            </button>
          </div>
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
                Limpiar Búsqueda
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