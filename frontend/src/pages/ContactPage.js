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
      content: settings?.contact_email || 'info@simuladorcs.com',
      action: `mailto:${settings?.contact_email || 'info@simuladorcs.com'}`,
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
    <div className="min-h-screen">
      {/* Contact Section with Background Image */}
      <section className="relative py-12 lg:py-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/images/backgrounds/ContactBackground.jpg"
            alt="Técnico instalando paneles solares - Contacto"
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: '50% 30%' }}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-600/70"></div>
        </div>

        <div className="container-xl section-padding relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-section text-white mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
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
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-lg hover:bg-white hover:border-white transition-all duration-300 group p-8">
              <h2 className="text-2xl font-semibold text-white group-hover:text-gray-900 mb-6 transition-colors duration-300">
                Envíanos un mensaje
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 group-hover:text-gray-700 mb-2 transition-colors duration-300">Nombre *</label>
                    <input
                      type="text"
                      {...register('name', { 
                        required: 'El nombre es requerido',
                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                      })}
                      className={`w-full px-4 py-3 bg-white/10 border-2 border-white/30 group-hover:border-gray-400 rounded-lg text-white placeholder-gray-300 focus:bg-white focus:text-gray-900 focus:border-primary-500 focus:outline-none transition-all duration-300 ${errors.name ? 'border-red-400' : ''}`}
                      placeholder="Tu nombre completo"
                    />
                    {errors.name && (
                      <p className="form-error">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 group-hover:text-gray-700 mb-2 transition-colors duration-300">Email *</label>
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'El email es requerido',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Email inválido'
                        }
                      })}
                      className={`w-full px-4 py-3 bg-white/10 border-2 border-white/30 group-hover:border-gray-400 rounded-lg text-white placeholder-gray-300 focus:bg-white focus:text-gray-900 focus:border-primary-500 focus:outline-none transition-all duration-300 ${errors.email ? 'border-red-400' : ''}`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="form-error">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 group-hover:text-gray-700 mb-2 transition-colors duration-300">Teléfono</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 group-hover:border-gray-400 rounded-lg text-white placeholder-gray-300 focus:bg-white focus:text-gray-900 focus:border-primary-500 focus:outline-none transition-all duration-300"
                    placeholder="54 11 4000-5000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 group-hover:text-gray-700 mb-2 transition-colors duration-300">Asunto *</label>
                  <input
                    type="text"
                    {...register('subject', { 
                      required: 'El asunto es requerido',
                      minLength: { value: 5, message: 'Mínimo 5 caracteres' }
                    })}
                    className={`w-full px-4 py-3 bg-white/10 border-2 border-white/30 group-hover:border-gray-400 rounded-lg text-white placeholder-gray-300 focus:bg-white focus:text-gray-900 focus:border-primary-500 focus:outline-none transition-all duration-300 ${errors.subject ? 'border-red-400' : ''}`}
                    placeholder="¿En qué podemos ayudarte?"
                  />
                  {errors.subject && (
                    <p className="form-error">{errors.subject.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 group-hover:text-gray-700 mb-2 transition-colors duration-300">Mensaje *</label>
                  <textarea
                    {...register('message', { 
                      required: 'El mensaje es requerido',
                      minLength: { value: 10, message: 'Mínimo 10 caracteres' }
                    })}
                    rows={5}
                    className={`w-full px-4 py-3 bg-white/10 border-2 border-white/30 group-hover:border-gray-400 rounded-lg text-white placeholder-gray-300 focus:bg-white focus:text-gray-900 focus:border-primary-500 focus:outline-none transition-all duration-300 resize-none ${errors.message ? 'border-red-400' : ''}`}
                    placeholder="Cuéntanos más detalles sobre tu consulta..."
                  />
                  {errors.message && (
                    <p className="form-error">{errors.message.message}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={sendMessageMutation.isLoading}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 text-white rounded-lg group-hover:bg-primary-600 group-hover:border-primary-600 hover:bg-primary-600 hover:border-primary-600 transition-all duration-300 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-lg hover:bg-white hover:border-white transition-all duration-300 group p-8">
              <h2 className="text-2xl font-semibold text-white group-hover:text-gray-900 mb-6 transition-colors duration-300">
                Información de contacto
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  const content = info.action ? (
                    <a
                      href={info.action}
                      className="text-primary-200 group-hover:text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <span className="text-gray-200 group-hover:text-gray-700 transition-colors duration-300">{info.content}</span>
                  );
                  
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-200/20 group-hover:bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                        <Icon className="w-6 h-6 text-primary-200 group-hover:text-primary-600 transition-colors duration-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white group-hover:text-gray-900 mb-1 transition-colors duration-300">
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
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl shadow-lg hover:bg-white hover:border-white transition-all duration-300 group p-8">
              <h2 className="text-2xl font-semibold text-white group-hover:text-gray-900 mb-6 transition-colors duration-300">
                ¿En qué podemos ayudarte?
              </h2>
              
              <div className="space-y-6">
                {reasons.map((reason, index) => {
                  const Icon = reason.icon;
                  
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-accent-200/20 group-hover:bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                        <Icon className="w-5 h-5 text-accent-200 group-hover:text-accent-600 transition-colors duration-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white group-hover:text-gray-900 mb-1 transition-colors duration-300">
                          {reason.title}
                        </h3>
                        <p className="text-sm text-gray-200 group-hover:text-gray-600 transition-colors duration-300">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </motion.div>
        </div>
        </div>
      </section>

      {/* FAQ Section with White Background */}
      <section className="bg-gray-50 py-12 lg:py-16">
        <div className="container-xl section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
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
      </section>
    </div>
  );
};

export default ContactPage;