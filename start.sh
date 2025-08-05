#!
/bin/bash

# WeSolar - Script de inicio rápido
# Este script configura y ejecuta tanto el backend como el frontend

echo "🌟 WeSolar - Inicio Rápido"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 no está instalado"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi

print_info "Iniciando configuración del backend..."

# Backend setup
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_info "Creando entorno virtual..."
    python3 -m venv venv
fi

# Activate virtual environment
print_info "Activando entorno virtual..."
source venv/bin/activate

# Install Python dependencies
print_info "Instalando dependencias de Python..."
pip install -r ../requirements.txt

# Run migrations
print_info "Ejecutando migraciones..."
python manage.py makemigrations
python manage.py migrate

# Load initial data
print_info "Cargando datos iniciales..."
python initial_setup.py

print_status "Backend configurado correctamente"

# Check if we should start the backend server
echo ""
read -p "¿Deseas iniciar el servidor de Django? (y/n): " start_backend

if [[ $start_backend =~ ^[Yy]$ ]]; then
    print_info "Iniciando servidor Django en puerto 8000..."
    python manage.py runserver &
    DJANGO_PID=$!
    print_status "Django ejecutándose en http://localhost:8000"
    print_info "API documentación disponible en http://localhost:8000/api/docs/"
    echo ""
fi

# Frontend setup
print_info "Configurando frontend..."
cd ../frontend

# Install Node.js dependencies
if [ ! -d "node_modules" ]; then
    print_info "Instalando dependencias de Node.js..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_info "Creando archivo de configuración..."
    cat > .env.local << EOF
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
EOF
fi

print_status "Frontend configurado correctamente"

# Check if we should start the frontend server
echo ""
read -p "¿Deseas iniciar el servidor de React? (y/n): " start_frontend

if [[ $start_frontend =~ ^[Yy]$ ]]; then
    print_info "Iniciando servidor React en puerto 3000..."
    npm start &
    REACT_PID=$!
    print_status "React ejecutándose en http://localhost:3000"
    echo ""
fi

# Summary
echo ""
echo "🎉 ¡WeSolar está listo!"
echo "======================"
print_status "Backend: http://localhost:8000"
print_status "Frontend: http://localhost:3000"
print_status "Admin: http://localhost:8000/admin/"
print_status "API Docs: http://localhost:8000/api/docs/"
echo ""

# Instructions
print_info "Para crear un superusuario de Django:"
echo "   cd backend && source venv/bin/activate && python manage.py createsuperuser"
echo ""

print_info "Para detener los servidores:"
echo "   Presiona Ctrl+C en cada terminal"
echo ""

# Keep script running if servers were started
if [[ $start_backend =~ ^[Yy]$ ]] || [[ $start_frontend =~ ^[Yy]$ ]]; then
    print_warning "Presiona Ctrl+C para detener todos los servidores"
    
    # Function to handle script termination
    cleanup() {
        print_info "Deteniendo servidores..."
        if [ ! -z "$DJANGO_PID" ]; then
            kill $DJANGO_PID 2>/dev/null
        fi
        if [ ! -z "$REACT_PID" ]; then
            kill $REACT_PID 2>/dev/null
        fi
        print_status "Servidores detenidos"
        exit 0
    }
    
    # Set up signal handlers
    trap cleanup SIGINT SIGTERM
    
    # Wait for servers
    wait
fi