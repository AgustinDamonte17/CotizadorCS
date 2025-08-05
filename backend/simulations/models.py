from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from projects.models import SolarProject
import uuid


class TariffCategory(models.Model):
    """Model for electricity tariff categories"""
    
    name = models.CharField('Nombre de la Categoría', max_length=100)
    code = models.CharField('Código', max_length=20, unique=True)
    description = models.TextField('Descripción', blank=True)
    
    # Tariff structure (in ARS per kWh)
    energy_charge_peak = models.DecimalField(
        'Cargo Energía Pico (ARS/kWh)', 
        max_digits=8, 
        decimal_places=4,
        validators=[MinValueValidator(0)]
    )
    energy_charge_valley = models.DecimalField(
        'Cargo Energía Valle (ARS/kWh)', 
        max_digits=8, 
        decimal_places=4,
        validators=[MinValueValidator(0)]
    )
    fixed_charge_monthly = models.DecimalField(
        'Cargo Fijo Mensual (ARS)', 
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Time distribution (percentage of consumption in peak hours)
    peak_percentage = models.DecimalField(
        'Porcentaje Consumo Pico (%)', 
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=30
    )
    
    created_at = models.DateTimeField('Fecha de Creación', auto_now_add=True)
    updated_at = models.DateTimeField('Última Actualización', auto_now=True)
    
    class Meta:
        verbose_name = 'Categoría Tarifaria'
        verbose_name_plural = 'Categorías Tarifarias'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def calculate_monthly_cost(self, monthly_kwh):
        """Calculate monthly electricity cost for given consumption"""
        peak_kwh = monthly_kwh * (self.peak_percentage / 100)
        valley_kwh = monthly_kwh * ((100 - self.peak_percentage) / 100)
        
        energy_cost = (peak_kwh * self.energy_charge_peak + 
                      valley_kwh * self.energy_charge_valley)
        
        return energy_cost + self.fixed_charge_monthly


class ExchangeRate(models.Model):
    """Model to store USD/ARS exchange rates"""
    
    rate = models.DecimalField(
        'Tipo de Cambio (ARS por USD)', 
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    source = models.CharField('Fuente', max_length=100, default='Manual')
    date = models.DateField('Fecha')
    created_at = models.DateTimeField('Fecha de Creación', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Tipo de Cambio'
        verbose_name_plural = 'Tipos de Cambio'
        ordering = ['-date']
        unique_together = ['date', 'source']
    
    def __str__(self):
        return f"USD/ARS {self.rate} - {self.date}"
    
    @classmethod
    def get_latest_rate(cls):
        """Get the most recent exchange rate"""
        latest = cls.objects.first()
        return latest.rate if latest else 1000  # Default fallback rate


class InvestmentSimulation(models.Model):
    """Model to store investment simulations"""
    
    SIMULATION_TYPE_CHOICES = [
        ('coverage', 'Por Porcentaje de Cobertura'),
        ('panels', 'Por Cantidad de Paneles'),
        ('investment', 'Por Monto de Inversión'),
    ]
    
    # Unique identifier for the simulation
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Project and user information
    project = models.ForeignKey(SolarProject, on_delete=models.CASCADE, related_name='simulations')
    user_email = models.EmailField('Email del Usuario', blank=True)  # Optional for tracking
    
    # Input parameters
    monthly_consumption_kwh = models.DecimalField(
        'Consumo Mensual (kWh)', 
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    tariff_category = models.ForeignKey(TariffCategory, on_delete=models.CASCADE)
    
    simulation_type = models.CharField('Tipo de Simulación', max_length=20, choices=SIMULATION_TYPE_CHOICES)
    
    # Variable input (depends on simulation type)
    coverage_percentage = models.DecimalField(
        'Porcentaje de Cobertura (%)', 
        max_digits=5, 
        decimal_places=2,
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    number_of_panels = models.PositiveIntegerField('Cantidad de Paneles', null=True, blank=True)
    investment_amount_usd = models.DecimalField(
        'Monto de Inversión (USD)', 
        max_digits=10, 
        decimal_places=2,
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    
    # Calculated results
    total_investment_usd = models.DecimalField(
        'Inversión Total (USD)', 
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    total_investment_ars = models.DecimalField(
        'Inversión Total (ARS)', 
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    installed_power_kw = models.DecimalField(
        'Potencia Instalada (kW)', 
        max_digits=8, 
        decimal_places=3,
        validators=[MinValueValidator(0)]
    )
    annual_generation_kwh = models.DecimalField(
        'Generación Anual (kWh)', 
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    monthly_generation_kwh = models.DecimalField(
        'Generación Mensual (kWh)', 
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    monthly_savings_ars = models.DecimalField(
        'Ahorro Mensual (ARS)', 
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    annual_savings_ars = models.DecimalField(
        'Ahorro Anual (ARS)', 
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    payback_period_years = models.DecimalField(
        'Período de Retorno (años)', 
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Additional metrics
    coverage_achieved = models.DecimalField(
        'Cobertura Lograda (%)', 
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    roi_annual = models.DecimalField(
        'ROI Anual (%)', 
        max_digits=6, 
        decimal_places=2
    )
    
    # Exchange rate used for calculation
    exchange_rate_used = models.DecimalField(
        'Tipo de Cambio Utilizado', 
        max_digits=8, 
        decimal_places=2
    )
    
    # Timestamps
    created_at = models.DateTimeField('Fecha de Creación', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Simulación de Inversión'
        verbose_name_plural = 'Simulaciones de Inversión'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Simulación {self.id} - {self.project.name}"
    
    @property
    def monthly_savings_usd(self):
        """Calculate monthly savings in USD"""
        return self.monthly_savings_ars / self.exchange_rate_used
    
    @property
    def annual_savings_usd(self):
        """Calculate annual savings in USD"""
        return self.annual_savings_ars / self.exchange_rate_used