@echo off
echo.
echo 🌟 WeSolar - Inicio Rapido para Windows
echo =====================================
echo.

echo [INFO] Configurando backend Django...
cd backend

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo [INFO] Creando entorno virtual...
    python -m venv venv
)

REM Activar entorno virtual
echo [INFO] Activando entorno virtual...
call venv\Scripts\activate.bat

REM Instalar dependencias
echo [INFO] Instalando dependencias de Python...
pip install -r ..\requirements.txt

REM Ejecutar migraciones
echo [INFO] Ejecutando migraciones...
python manage.py makemigrations
python manage.py migrate

REM Cargar datos iniciales
echo [INFO] Cargando datos iniciales...
python initial_setup.py

echo [OK] Backend configurado correctamente
echo.

REM Preguntar si quiere iniciar Django
set /p start_django="¿Deseas iniciar el servidor de Django? (y/n): "
if /i "%start_django%"=="y" (
    echo [INFO] Iniciando servidor Django en puerto 8000...
    start "Django Server" cmd /k "cd /d %cd% && venv\Scripts\activate.bat && python manage.py runserver"
    echo [OK] Django ejecutandose en http://localhost:8000
    echo [INFO] API documentacion disponible en http://localhost:8000/api/docs/
    echo.
)

REM Configurar frontend
echo [INFO] Configurando frontend...
cd ..\frontend

REM Instalar dependencias de Node.js
if not exist "node_modules" (
    echo [INFO] Instalando dependencias de Node.js...
    npm install
)

REM Crear archivo .env.local si no existe
if not exist ".env.local" (
    echo [INFO] Creando archivo de configuracion...
    echo REACT_APP_API_URL=http://localhost:8000/api/v1 > .env.local
    echo REACT_APP_ENV=development >> .env.local
)

echo [OK] Frontend configurado correctamente
echo.

REM Preguntar si quiere iniciar React
set /p start_react="¿Deseas iniciar el servidor de React? (y/n): "
if /i "%start_react%"=="y" (
    echo [INFO] Iniciando servidor React en puerto 3000...
    start "React Server" cmd /k "cd /d %cd% && npm start"
    echo [OK] React ejecutandose en http://localhost:3000
    echo.
)

echo.
echo 🎉 ¡WeSolar esta listo!
echo ======================
echo [OK] Backend: http://localhost:8000
echo [OK] Frontend: http://localhost:3000
echo [OK] Admin: http://localhost:8000/admin/
echo [OK] API Docs: http://localhost:8000/api/docs/
echo.
echo [INFO] Para crear un superusuario de Django:
echo    cd backend && venv\Scripts\activate.bat && python manage.py createsuperuser
echo.
echo [INFO] Para detener los servidores:
echo    Cierra las ventanas de terminal que se abrieron
echo.

pause