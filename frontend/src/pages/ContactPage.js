import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { 
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineChat,
  HiOutlineQuestionMarkCircle,
  HiOutlineCurrencyDollar
} from 'react-icons/hi';
import { api, apiUtils } from '../services/api';
import { useSettings } from '../context/AppContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const settings = useSettings();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const sendMessageMutation = useMutation(api.sendContactMessage, {
    onSuccess: () => {
      toast.success('Mensaje enviado exitosamente. Te contactaremos pronto.');
      reset();
    },
    onError: (error) => {
      const errorMessage = apiUtils.extractErrorMessage(error);
      toast.error(errorMessage);
    },
  });
  
  const onSubmit = (data) => {
    sendMessageMutation.mutate(data);
  };
  
  const contactInfo = [
    {
      icon: HiOutlineMail,
      title: 'Email',
      content: settings?.contact_email || 'info@wesolar.com',
      action: `mailto:${settings?.contact_email || 'info@wesolar.com'}`,
    },
    {
      icon: HiOutlinePhone,
      title: 'Teléfono',
      content: settings?.contact_phone || '+54 11 1234-5678',
      action: `tel:${settings?.contact_phone || '+541112345678'}`,
    },
    {
      icon: HiOutlineLocationMarker,
      title: 'Ubicación',
      content: settings?.address || 'Buenos Aires, Argentina',
      action: null,
    },
  ].filter(item => item.content);
  
  const reasons = [
    {
      icon: HiOutlineQuestionMarkCircle,
      title: 'Consultas Generales',
      description: 'Información sobre la plataforma, cómo funciona, términos y condiciones.',
    },
    {
      icon: HiOutlineCurrencyDollar,
      title: 'Asesoramiento de Inversión',
      description: 'Ayuda para elegir los mejores proyectos según tu perfil de inversión.',
    },
    {
      icon: HiOutlineChat,
      title: 'Soporte Técnico',
      description: 'Problemas con simulaciones, acceso a tu cuenta o funcionalidades.',
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-xl section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-section gradient-text mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ¿Tienes preguntas sobre inversión en energía solar? Nuestro equipo de 
            expertos está aquí para ayudarte a tomar las mejores decisiones.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Envíanos un mensaje
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      {...register('name', { 
                        required: 'El nombre es requerido',
                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                      })}
                      className={`input ${errors.name ? 'input-error' : ''}`}
                      placeholder="Tu nombre completo"
                    />
                    {errors.name && (
                      <p className="form-error">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'El email es requerido',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Email inválido'
                        }
                      })}
                      className={`input ${errors.email ? 'input-error' : ''}`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="form-error">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="input"
                    placeholder="+54 11 1234-5678"
                  />
                </div>
                
                <div>
                  <label className="form-label">Asunto *</label>
                  <input
                    type="text"
                    {...register('subject', { 
                      required: 'El asunto es requerido',
                      minLength: { value: 5, message: 'Mínimo 5 caracteres' }
                    })}
                    className={`input ${errors.subject ? 'input-error' : ''}`}
                    placeholder="¿En qué podemos ayudarte?"
                  />
                  {errors.subject && (
                    <p className="form-error">{errors.subject.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label">Mensaje *</label>
                  <textarea
                    {...register('message', { 
                      required: 'El mensaje es requerido',
                      minLength: { value: 10, message: 'Mínimo 10 caracteres' }
                    })}
                    rows={5}
                    className={`input resize-none ${errors.message ? 'input-error' : ''}`}
                    placeholder="Cuéntanos más detalles sobre tu consulta..."
                  />
                  {errors.message && (
                    <p className="form-error">{errors.message.message}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={sendMessageMutation.isLoading}
                  className="btn btn-primary w-full text-lg py-3"
                >
                  {sendMessageMutation.isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="small" color="white" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    'Enviar Mensaje'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
          
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Contact Details */}
            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Información de contacto
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  const content = info.action ? (
                    <a
                      href={info.action}
                      className="text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <span className="text-gray-700">{info.content}</span>
                  );
                  
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {info.title}
                        </h3>
                        {content}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Reasons to Contact */}
            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                ¿En qué podemos ayudarte?
              </h2>
              
              <div className="space-y-6">
                {reasons.map((reason, index) => {
                  const Icon = reason.icon;
                  
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-accent-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {reason.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Response Time */}
            <div className="card p-6 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-primary-900 mb-2">
                  Tiempo de respuesta
                </h3>
                <p className="text-primary-700">
                  Respondemos todos los mensajes en menos de 24 horas durante días hábiles.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-section gradient-text mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra respuestas rápidas a las consultas más comunes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: '¿Cómo funciona la inversión en energía solar?',
                answer: 'Inviertes en proyectos de energía solar comunitaria y recibes retornos basados en la generación de energía y ahorros en costos eléctricos.',
              },
              {
                question: '¿Cuál es la inversión mínima?',
                answer: 'Puedes comenzar con inversiones pequeñas. El monto mínimo depende de cada proyecto, pero típicamente desde $100 USD.',
              },
              {
                question: '¿Cómo se calculan los retornos?',
                answer: 'Los retornos se basan en la generación solar real, tarifas eléctricas actuales y contratos de venta de energía a largo plazo.',
              },
              {
                question: '¿Los proyectos están asegurados?',
                answer: 'Sí, todos nuestros proyectos cuentan con seguros comprensivos que cubren equipos, instalaciones y generación de energía.',
              },
            ].map((faq, index) => (
              <div key={index} className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;