# WeSolar - Plataforma de Inversión en Energía Solar Comunitaria

Una aplicación web completa desarrollada con Django (backend) y React (frontend) que permite a los usuarios invertir en proyectos de energía solar comunitaria y simular el rendimiento de sus inversiones.

## 🌟 Características Principales

### Frontend (React)
- **Diseño Moderno**: Interfaz tipo startup financiera con Tailwind CSS
- **Responsive**: Optimizado para dispositivos móviles y escritorio
- **Simulador de Inversiones**: Motor avanzado de cálculo de retornos
- **Gestión de Estado**: Context API + React Query para manejo eficiente de datos
- **Animaciones**: Framer Motion para transiciones suaves
- **Formularios**: React Hook Form con validación completa

### Backend (Django)
- **API REST**: Django REST Framework con documentación automática
- **Motor de Simulación**: Cálculos precisos de inversión y retornos
- **Base de Datos**: SQLite para desarrollo (fácil escalabilidad a PostgreSQL)
- **Administración**: Panel de admin de Django personalizado
- **CORS**: Configurado para desarrollo frontend

### Funcionalidades
- **Catálogo de Proyectos**: Listado y detalle de proyectos solares
- **Simulador Avanzado**: Tres modalidades de simulación (cobertura, paneles, inversión)
- **Gestión de Usuarios**: Sistema básico sin login (por email)
- **Contacto y Newsletter**: Formularios funcionales con notificaciones
- **Datos Dinámicos**: Manejo de tipos de cambio y tarifas eléctricas

## 🏗️ Arquitectura del Proyecto

```
WeSolar/
├── backend/                 # Django API Backend
│   ├── wesolar/            # Configuración principal
│   ├── projects/           # Aplicación de proyectos solares
│   ├── simulations/        # Motor de simulación de inversiones
│   ├── core/              # Funcionalidades centrales
│   └── manage.py          # CLI de Django
├── frontend/               # React Frontend
│   ├── public/            # Archivos estáticos
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── context/       # Context API
│   │   ├── services/      # APIs y utilidades
│   │   └── index.js       # Punto de entrada
│   └── package.json       # Dependencias de Node
└── requirements.txt       # Dependencias de Python
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.8+
- Node.js 16+
- pip
- npm o yarn

### Backend (Django)

1. **Crear entorno virtual**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. **Instalar dependencias**:
```bash
pip install -r ../requirements.txt
```

3. **Configurar base de datos**:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. **Crear superusuario** (opcional):
```bash
python manage.py createsuperuser
```

5. **Cargar datos de ejemplo** (opcional):
```bash
python manage.py loaddata fixtures/initial_data.json
```

6. **Ejecutar servidor**:
```bash
python manage.py runserver
```

El backend estará disponible en `http://localhost:8000`

### Frontend (React)

1. **Instalar dependencias**:
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno** (crear archivo `.env.local`):
```
REACT_APP_API_URL=http://localhost:8000/api/v1
```

3. **Ejecutar aplicación**:
```bash
npm start
```

El frontend estará disponible en `http://localhost:3000`

## 📊 Modelo de Datos

### Proyectos Solares
- Información básica (nombre, ubicación, descripción)
- Especificaciones técnicas (potencia, generación esperada)
- Datos financieros (precios, financiamiento)
- Multimedia (imágenes, videos)
- Estados (desarrollo, financiamiento, construcción, operativo)

### Simulaciones de Inversión
- Parámetros de entrada (consumo, categoría tarifaria)
- Tres tipos de simulación:
  - **Por cobertura**: Especifica el % de consumo a cubrir
  - **Por paneles**: Especifica la cantidad de paneles
  - **Por inversión**: Especifica el monto a invertir
- Resultados calculados (ROI, periodo de retorno, ahorros)

### Categorías Tarifarias
- Estructura de precios eléctricos
- Cargos por energía (pico/valle)
- Cargos fijos mensuales
- Distribución horaria de consumo

## 🔧 API Endpoints

### Proyectos
- `GET /api/v1/projects/` - Listar proyectos
- `GET /api/v1/projects/{id}/` - Detalle de proyecto
- `GET /api/v1/projects/stats/` - Estadísticas generales

### Simulaciones
- `POST /api/v1/simulations/create/` - Crear simulación
- `POST /api/v1/simulations/compare/` - Comparar escenarios
- `GET /api/v1/simulations/{id}/` - Detalle de simulación
- `GET /api/v1/simulations/user/?email=` - Simulaciones de usuario

### Tarifas y Tipos de Cambio
- `GET /api/v1/tariff-categories/` - Categorías tarifarias
- `GET /api/v1/exchange-rate/current/` - Tipo de cambio actual

### Core
- `POST /api/v1/contact/` - Enviar mensaje de contacto
- `POST /api/v1/newsletter/subscribe/` - Suscribirse al newsletter
- `GET /api/v1/settings/` - Configuración del sitio

## 🎨 Diseño y UI/UX

### Paleta de Colores
- **Primario**: Verde (energía renovable)
- **Secundario**: Amarillo/Naranja (solar)
- **Acento**: Azul (confianza, tecnología)

### Componentes Principales
- **Cards de Proyecto**: Información resumida con call-to-action
- **Simulador Interactivo**: Formulario con resultados en tiempo real
- **Dashboard de Simulaciones**: Vista consolidada de inversiones
- **Navegación Responsive**: Menú adaptativo con estados activos

### Animaciones
- Fade-in y slide-up para contenido
- Hover effects en cards y botones
- Loading spinners personalizados
- Transiciones suaves entre páginas

## 🧮 Motor de Simulación

### Algoritmo de Cálculo
1. **Determinación del tamaño del sistema** según el tipo de simulación
2. **Cálculo de generación anual** basado en factores locales
3. **Análisis de consumo** con estructura tarifaria específica
4. **Cálculo de ahorros** considerando generación vs. consumo
5. **Métricas financieras** (ROI, payback, VAN)

### Factores Considerados
- Factor de generación solar (kWh/kWp/año)
- Ratio de performance del sistema (85%)
- Degradación anual de paneles (0.5%)
- Estructura tarifaria por horarios
- Tipo de cambio USD/ARS dinámico

## 🔮 Funcionalidades Futuras

### Dashboard de Administración
- **Gestión de Proyectos**: CRUD completo con workflow de aprobación
- **Analytics Avanzados**: Métricas de conversión, proyectos más populares
- **Gestión de Usuarios**: Perfiles de inversores, historial de simulaciones
- **Reportes Financieros**: Seguimiento de inversiones y retornos

### Crowdfunding
- **Campañas de Financiamiento**: Meta de recaudación, progreso visual
- **Sistema de Inversión**: Procesamiento de pagos, confirmaciones
- **Gestión de Inversores**: Dashboard personal, documentos, retornos
- **Comunicación**: Actualizaciones de proyecto, newsletters

### Mejoras Técnicas
- **Autenticación**: Login/registro completo con JWT
- **Notificaciones**: Sistema de alertas y emails automáticos
- **API Mejorada**: Paginación, filtros avanzados, rate limiting
- **Monitoreo**: Logging, métricas de performance, error tracking

## 🛠️ Tecnologías Utilizadas

### Backend
- **Django 4.2**: Framework web principal
- **Django REST Framework**: API REST
- **SQLite**: Base de datos (desarrollo)
- **Pillow**: Procesamiento de imágenes
- **python-decouple**: Gestión de configuración

### Frontend
- **React 18**: Biblioteca de UI
- **React Router**: Navegación SPA
- **React Query**: Estado del servidor y cache
- **React Hook Form**: Manejo de formularios
- **Tailwind CSS**: Framework de estilos
- **Framer Motion**: Animaciones
- **Chart.js**: Gráficos y visualizaciones
- **Axios**: Cliente HTTP

### Herramientas
- **ESLint**: Linting de JavaScript
- **Prettier**: Formateo de código
- **PostCSS**: Procesamiento de CSS
- **React Hot Toast**: Notificaciones

## 📝 Configuración de Desarrollo

### Variables de Entorno

**Backend (.env)**:
```
SECRET_KEY=your-secret-key
DEBUG=True
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-password
```

**Frontend (.env.local)**:
```
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
```

### Scripts Útiles

**Backend**:
```bash
# Ejecutar migraciones
python manage.py migrate

# Crear migraciones
python manage.py makemigrations

# Cargar fixtures
python manage.py loaddata fixtures/initial_data.json

# Ejecutar tests
python manage.py test

# Acceder al shell
python manage.py shell
```

**Frontend**:
```bash
# Desarrollo
npm start

# Build de producción
npm run build

# Tests
npm test

# Análisis del bundle
npm run build && npm run analyze
```

## 🔒 Consideraciones de Seguridad

### Implementadas
- CORS configurado para desarrollo
- Validación de entrada en formularios
- Sanitización de datos en serializers
- CSP headers básicos

### Recomendadas para Producción
- Autenticación JWT
- Rate limiting en API
- Validación de archivos subidos
- Logs de seguridad
- HTTPS obligatorio
- Variables de entorno seguras

## 📊 Métricas y Monitoreo

### KPIs Sugeridos
- Número de simulaciones por proyecto
- Tasa de conversión de simulaciones
- Tiempo promedio en el simulador
- Proyectos más consultados
- Retorno promedio simulado

### Herramientas Recomendadas
- Google Analytics para frontend
- Django Debug Toolbar para desarrollo
- Sentry para error tracking
- New Relic para performance monitoring

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo Full Stack**: Implementación completa Django + React
- **Diseño UI/UX**: Interfaz moderna y responsive
- **Motor de Simulación**: Algoritmos financieros precisos
- **DevOps**: Configuración y despliegue

## 📞 Contacto

- **Email**: info@wesolar.com
- **Sitio Web**: https://wesolar.com
- **LinkedIn**: /company/wesolar

---

**WeSolar** - Conectando inversores con el futuro de la energía solar ☀️