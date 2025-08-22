import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlineLockClosed, 
  HiOutlineEye, 
  HiOutlineEyeOff,
  HiOutlineUserCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AppContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  
  const password = watch('password');
  
  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('¡Cuenta creada exitosamente! Bienvenido a WeSolar');
      navigate('/mis-simulaciones');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.username?.[0] ||
                          error.response?.data?.email?.[0] ||
                          'Error en el registro';
      toast.error(errorMessage);
    }
  };
  
  return (
    <div className="min-h-screen relative py-8">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/images/backgrounds/detallepanelsolar.jpg"
          alt="Detalle de panel solar"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-600/70"></div>
      </div>

      <div className="container-xl section-padding relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-4">
              Crear Cuenta
            </h1>
            <p className="text-gray-100">
              Únete a WeSolar para simular y gestionar tus inversiones en energía solar
            </p>
          </motion.div>

          {/* Register Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card p-6"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('username', {
                      required: 'El usuario es requerido',
                      minLength: {
                        value: 3,
                        message: 'El usuario debe tener al menos 3 caracteres'
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'Solo se permiten letras, números y guiones bajos'
                      }
                    })}
                    type="text"
                    id="username"
                    className={`input pl-10 ${errors.username ? 'border-red-500' : ''}`}
                    placeholder="Elige un nombre de usuario"
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'El correo electrónico es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Ingresa un correo electrónico válido'
                      }
                    })}
                    type="email"
                    id="email"
                    className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="tu@correo.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiOutlineUserCircle className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('first_name')}
                      type="text"
                      id="first_name"
                      className="input pl-10"
                      placeholder="Tu nombre"
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <input
                    {...register('last_name')}
                    type="text"
                    id="last_name"
                    className="input"
                    placeholder="Tu apellido"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'La contraseña debe tener al menos 6 caracteres'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Crea una contraseña segura"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Terms */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600">
                  Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad.
                  Tu información será utilizada para gestionar tus simulaciones y proyectos de inversión.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Creando cuenta...</span>
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </p>
              
              <div className="border-t border-gray-200 pt-4">
                <Link
                  to="/comunidades-solares"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Volver a explorar proyectos
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
