#!/usr/bin/env python
"""
Script para configuración inicial de WeSolar
Crea datos de ejemplo para desarrollo y testing
"""

import os
import django
import sys
from decimal import Decimal
from datetime import date, timedelta

# Configure Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wesolar.settings')
django.setup()

from projects.models import SolarProject, ProjectImage
from simulations.models import TariffCategory, ExchangeRate
from core.models import SiteSettings


def create_tariff_categories():
    """Create sample tariff categories"""
    print("Creating tariff categories...")
    
    categories = [
        {
            'name': 'Residencial Básico',
            'code': 'R1',
            'description': 'Tarifa residencial para consumos bajos',
            'energy_charge_peak': Decimal('15.50'),
            'energy_charge_valley': Decimal('12.30'),
            'fixed_charge_monthly': Decimal('850.00'),
            'peak_percentage': Decimal('35.0'),
        },
        {
            'name': 'Residencial Medio',
            'code': 'R2',
            'description': 'Tarifa residencial para consumos medios',
            'energy_charge_peak': Decimal('18.75'),
            'energy_charge_valley': Decimal('14.80'),
            'fixed_charge_monthly': Decimal('1200.00'),
            'peak_percentage': Decimal('40.0'),
        },
        {
            'name': 'Residencial Alto',
            'code': 'R3',
            'description': 'Tarifa residencial para consumos altos',
            'energy_charge_peak': Decimal('22.40'),
            'energy_charge_valley': Decimal('17.60'),
            'fixed_charge_monthly': Decimal('1500.00'),
            'peak_percentage': Decimal('45.0'),
        },
        {
            'name': 'Pequeño Comercio',
            'code': 'C1',
            'description': 'Tarifa para pequeños comercios',
            'energy_charge_peak': Decimal('25.80'),
            'energy_charge_valley': Decimal('19.20'),
            'fixed_charge_monthly': Decimal('2000.00'),
            'peak_percentage': Decimal('55.0'),
        },
    ]
    
    for cat_data in categories:
        category, created = TariffCategory.objects.get_or_create(
            code=cat_data['code'],
            defaults=cat_data
        )
        if created:
            print(f"  ✓ Created: {category.name}")
        else:
            print(f"  - Exists: {category.name}")


def create_exchange_rates():
    """Create sample exchange rates"""
    print("Creating exchange rates...")
    
    # Create rates for the last 30 days
    base_rate = Decimal('350.00')
    today = date.today()
    
    for i in range(30):
        rate_date = today - timedelta(days=i)
        # Add some variation to the rate
        variation = (i % 7) - 3  # -3 to +3
        rate = base_rate + Decimal(str(variation * 2))
        
        exchange_rate, created = ExchangeRate.objects.get_or_create(
            date=rate_date,
            source='Manual',
            defaults={'rate': rate}
        )
        
        if created and i < 5:  # Only print first 5
            print(f"  ✓ Created rate for {rate_date}: {rate}")


def create_solar_projects():
    """Create sample solar projects"""
    print("Creating solar projects...")
    
    projects = [
        {
            'name': 'Parque Solar Mendoza Norte',
            'description': 'Proyecto de energía solar comunitaria ubicado en Mendoza, diseñado para abastecer a más de 500 familias. El proyecto utiliza tecnología de paneles de última generación con seguimiento solar para maximizar la eficiencia. Ubicado en una zona con excelente irradiación solar, garantiza una generación óptima durante todo el año.',
            'location': 'Mendoza, Argentina',
            'status': 'funding',
            'total_power_installed': Decimal('800.00'),
            'total_power_projected': Decimal('1200.00'),
            'available_power': Decimal('400.00'),
            'price_per_wp_usd': Decimal('1.25'),
            'price_per_panel_usd': Decimal('687.50'),
            'panel_power_wp': Decimal('550'),
            'owners': 'Energía Sustentable SA, Green Capital Fund',
            'expected_annual_generation': Decimal('1800000'),
            'funding_goal': Decimal('500000'),
            'funding_raised': Decimal('180000'),
            'funding_deadline': date.today() + timedelta(days=90),
        },
        {
            'name': 'Solar Córdoba Comunitario',
            'description': 'Iniciativa de energía renovable que conecta a la comunidad de Córdoba con inversiones sostenibles. El proyecto incorpora sistemas de almacenamiento de energía para garantizar suministro durante las horas de menor irradiación. Cuenta con un programa de educación ambiental para la comunidad local.',
            'location': 'Córdoba, Argentina',
            'status': 'construction',
            'total_power_installed': Decimal('500.00'),
            'total_power_projected': Decimal('750.00'),
            'available_power': Decimal('250.00'),
            'price_per_wp_usd': Decimal('1.35'),
            'price_per_panel_usd': Decimal('742.50'),
            'panel_power_wp': Decimal('550'),
            'owners': 'Cooperativa Solar Córdoba, Instituto de Energía',
            'expected_annual_generation': Decimal('1125000'),
            'funding_goal': Decimal('320000'),
            'funding_raised': Decimal('320000'),
            'funding_deadline': date.today() - timedelta(days=30),
        },
        {
            'name': 'Granja Solar Buenos Aires',
            'description': 'Proyecto agroindustrial que combina la producción agrícola con la generación de energía solar. Los paneles están elevados permitiendo el cultivo debajo de ellos, creando un ecosistema sustentable. Genera energía limpia mientras mantiene la productividad agrícola de la tierra.',
            'location': 'Buenos Aires, Argentina',
            'status': 'operational',
            'total_power_installed': Decimal('1500.00'),
            'total_power_projected': Decimal('1500.00'),
            'available_power': Decimal('300.00'),
            'price_per_wp_usd': Decimal('1.15'),
            'price_per_panel_usd': Decimal('632.50'),
            'panel_power_wp': Decimal('550'),
            'owners': 'AgroSolar SA, Banco de Inversión Verde',
            'expected_annual_generation': Decimal('2250000'),
            'funding_goal': Decimal('750000'),
            'funding_raised': Decimal('750000'),
            'funding_deadline': date.today() - timedelta(days=180),
        },
        {
            'name': 'Solar Patagonia Wind & Sun',
            'description': 'Proyecto híbrido que combina energía solar y eólica en la Patagonia. Aprovecha los excelentes recursos renovables de la región para crear un sistema de generación limpia altamente eficiente. Incluye sistemas de predicción meteorológica avanzados para optimizar la generación.',
            'location': 'Neuquén, Argentina',
            'status': 'development',
            'total_power_installed': Decimal('0.00'),
            'total_power_projected': Decimal('2000.00'),
            'available_power': Decimal('2000.00'),
            'price_per_wp_usd': Decimal('1.45'),
            'price_per_panel_usd': Decimal('797.50'),
            'panel_power_wp': Decimal('550'),
            'owners': 'Patagonia Renewables, WindSun Investments',
            'expected_annual_generation': Decimal('3500000'),
            'funding_goal': Decimal('1200000'),
            'funding_raised': Decimal('50000'),
            'funding_deadline': date.today() + timedelta(days=150),
        },
        {
            'name': 'Techo Solar Urbano',
            'description': 'Red de instalaciones solares en techos urbanos de la Ciudad de Buenos Aires. Utiliza espacios subutilizados en edificios residenciales y comerciales para generar energía limpia. Incluye un programa de participación ciudadana donde los propietarios de techos reciben beneficios por ceder el espacio.',
            'location': 'CABA, Argentina',
            'status': 'funding',
            'total_power_installed': Decimal('200.00'),
            'total_power_projected': Decimal('600.00'),
            'available_power': Decimal('400.00'),
            'price_per_wp_usd': Decimal('1.55'),
            'price_per_panel_usd': Decimal('852.50'),
            'panel_power_wp': Decimal('550'),
            'owners': 'Ciudad Solar SA, Cooperativa Urbana',
            'expected_annual_generation': Decimal('900000'),
            'funding_goal': Decimal('380000'),
            'funding_raised': Decimal('120000'),
            'funding_deadline': date.today() + timedelta(days=60),
        },
    ]
    
    for proj_data in projects:
        project, created = SolarProject.objects.get_or_create(
            name=proj_data['name'],
            defaults=proj_data
        )
        if created:
            print(f"  ✓ Created: {project.name}")
        else:
            print(f"  - Exists: {project.name}")


def create_site_settings():
    """Create site settings"""
    print("Creating site settings...")
    
    settings_data = {
        'site_name': 'WeSolar',
        'site_description': 'Plataforma líder en inversión en energía solar comunitaria. Conectamos inversores con proyectos sostenibles para un futuro más verde y rentable.',
        'contact_email': 'info@wesolar.com',
        'contact_phone': '+54 11 4000-5000',
        'address': 'Av. Corrientes 1234, CABA, Argentina',
        'facebook_url': 'https://facebook.com/wesolar',
        'twitter_url': 'https://twitter.com/wesolar',
        'linkedin_url': 'https://linkedin.com/company/wesolar',
        'instagram_url': 'https://instagram.com/wesolar',
        'meta_keywords': 'energía solar, inversión, renovables, sustentabilidad, paneles solares, argentina',
        'default_annual_generation_factor': Decimal('1500.00'),
        'default_performance_ratio': Decimal('0.850'),
    }
    
    settings, created = SiteSettings.objects.get_or_create(
        pk=1,
        defaults=settings_data
    )
    
    if created:
        print(f"  ✓ Created site settings")
    else:
        print(f"  - Updated site settings")
        for key, value in settings_data.items():
            setattr(settings, key, value)
        settings.save()


def main():
    """Run the initial setup"""
    print("🚀 Iniciando configuración inicial de WeSolar...\n")
    
    try:
        create_site_settings()
        print()
        
        create_tariff_categories()
        print()
        
        create_exchange_rates()
        print()
        
        create_solar_projects()
        print()
        
        print("✅ Configuración inicial completada exitosamente!")
        print("\n📋 Resumen:")
        print(f"   • Proyectos solares: {SolarProject.objects.count()}")
        print(f"   • Categorías tarifarias: {TariffCategory.objects.count()}")
        print(f"   • Tipos de cambio: {ExchangeRate.objects.count()}")
        print(f"   • Configuración del sitio: ✓")
        
        print("\n🔧 Próximos pasos:")
        print("   1. Ejecutar el servidor: python manage.py runserver")
        print("   2. Crear superusuario: python manage.py createsuperuser")
        print("   3. Acceder al admin: http://localhost:8000/admin/")
        print("   4. Ver la API: http://localhost:8000/api/docs/")
        
    except Exception as e:
        print(f"❌ Error durante la configuración: {e}")
        return 1
    
    return 0


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)