import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

// Layout components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Page components
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SimulationPage from './pages/SimulationPage';
import SimulationsPage from './pages/SimulationsPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Context providers
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <main className="flex-grow">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/proyectos" element={<ProjectsPage />} />
              <Route path="/proyectos/:id" element={<ProjectDetailPage />} />
              <Route path="/simular/:id" element={<SimulationPage />} />
              <Route path="/mis-simulaciones" element={<SimulationsPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;