"""
Investment Simulation Engine for Solar Projects

This module contains the core logic for calculating solar investment returns
based on user monthly bill, tariff category, and investment parameters.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional
from .models import InvestmentSimulation, TariffCategory, ExchangeRate, ENERGY_PRICE_USD_PER_KWH
from projects.models import SolarProject


class SolarInvestmentCalculator:
    """
    Calculator for solar investment simulations
    """
    
    def __init__(self, project: SolarProject, tariff_category: TariffCategory):
        self.project = project
        self.tariff_category = tariff_category
        self.exchange_rate = ExchangeRate.get_latest_rate()
        
        # Solar generation factors (typical for Argentina)
        self.annual_generation_factor = 1500  # kWh per kWp per year (average)
        self.system_degradation = Decimal('0.005')  # 0.5% annual degradation
        self.performance_ratio = Decimal('0.85')  # System efficiency
    
    def simulate_by_bill_coverage(
        self, 
        monthly_bill_ars: Decimal, 
        bill_coverage_percentage: Decimal,
        user_email: str = "",
        user_phone: str = ""
    ) -> InvestmentSimulation:
        """
        Simulate investment based on desired bill coverage percentage
        """
        # Calculate target monthly savings in ARS
        target_monthly_savings_ars = monthly_bill_ars * (bill_coverage_percentage / 100)
        
        # Calculate required monthly generation in kWh
        # Savings = Generation (kWh) * Energy Price (USD/kWh) * Exchange Rate (ARS/USD)
        required_monthly_generation_kwh = target_monthly_savings_ars / (
            Decimal(str(ENERGY_PRICE_USD_PER_KWH)) * self.exchange_rate
        )
        
        # Calculate required annual generation
        required_annual_generation = required_monthly_generation_kwh * 12
        
        # Calculate required system size
        required_power_kw = required_annual_generation / (
            self.annual_generation_factor * self.performance_ratio
        )
        
        # Calculate number of panels
        panel_power_kw = self.project.panel_power_wp / 1000
        number_of_panels = int((required_power_kw / panel_power_kw).to_integral_value(ROUND_HALF_UP))
        
        # Recalculate actual power and generation
        actual_power_kw = number_of_panels * panel_power_kw
        actual_annual_generation = actual_power_kw * self.annual_generation_factor * self.performance_ratio
        actual_monthly_generation = actual_annual_generation / 12
        
        # Calculate investment
        total_investment_usd = number_of_panels * self.project.price_per_panel_usd
        if not self.project.price_per_panel_usd:
            # Calculate from price per Wp
            total_investment_usd = actual_power_kw * 1000 * self.project.price_per_wp_usd
        
        total_investment_ars = total_investment_usd * self.exchange_rate
        
        # Calculate savings
        monthly_savings_ars = self._calculate_monthly_savings(actual_monthly_generation)
        annual_savings_ars = monthly_savings_ars * 12
        
        # Calculate metrics
        payback_period = total_investment_ars / annual_savings_ars if annual_savings_ars > 0 else Decimal('999')
        roi_annual = (annual_savings_ars / total_investment_ars) * 100 if total_investment_ars > 0 else Decimal('0')
        actual_bill_coverage = (monthly_savings_ars / monthly_bill_ars) * 100
        
        # Create simulation object
        simulation = InvestmentSimulation(
            project=self.project,
            user_email=user_email,
            user_phone=user_phone,
            monthly_bill_ars=monthly_bill_ars,
            tariff_category=self.tariff_category,
            simulation_type='bill_coverage',
            bill_coverage_percentage=bill_coverage_percentage,
            number_of_panels=number_of_panels,
            total_investment_usd=total_investment_usd,
            total_investment_ars=total_investment_ars,
            installed_power_kw=actual_power_kw,
            annual_generation_kwh=actual_annual_generation,
            monthly_generation_kwh=actual_monthly_generation,
            monthly_savings_ars=monthly_savings_ars,
            annual_savings_ars=annual_savings_ars,
            payback_period_years=payback_period,
            bill_coverage_achieved=actual_bill_coverage,
            roi_annual=roi_annual,
            exchange_rate_used=self.exchange_rate
        )
        
        return simulation
    
    def simulate_by_panels(
        self, 
        monthly_bill_ars: Decimal, 
        number_of_panels: int,
        user_email: str = "",
        user_phone: str = ""
    ) -> InvestmentSimulation:
        """
        Simulate investment based on number of panels
        """
        # Calculate system specifications
        panel_power_kw = self.project.panel_power_wp / 1000
        actual_power_kw = number_of_panels * panel_power_kw
        actual_annual_generation = actual_power_kw * self.annual_generation_factor * self.performance_ratio
        actual_monthly_generation = actual_annual_generation / 12
        
        # Calculate investment
        total_investment_usd = number_of_panels * self.project.price_per_panel_usd
        if not self.project.price_per_panel_usd:
            # Calculate from price per Wp
            total_investment_usd = actual_power_kw * 1000 * self.project.price_per_wp_usd
        
        total_investment_ars = total_investment_usd * self.exchange_rate
        
        # Calculate savings
        monthly_savings_ars = self._calculate_monthly_savings(actual_monthly_generation)
        annual_savings_ars = monthly_savings_ars * 12
        
        # Calculate metrics
        payback_period = total_investment_ars / annual_savings_ars if annual_savings_ars > 0 else Decimal('999')
        roi_annual = (annual_savings_ars / total_investment_ars) * 100 if total_investment_ars > 0 else Decimal('0')
        bill_coverage_achieved = (monthly_savings_ars / monthly_bill_ars) * 100
        
        # Create simulation object
        simulation = InvestmentSimulation(
            project=self.project,
            user_email=user_email,
            user_phone=user_phone,
            monthly_bill_ars=monthly_bill_ars,
            tariff_category=self.tariff_category,
            simulation_type='panels',
            number_of_panels=number_of_panels,
            total_investment_usd=total_investment_usd,
            total_investment_ars=total_investment_ars,
            installed_power_kw=actual_power_kw,
            annual_generation_kwh=actual_annual_generation,
            monthly_generation_kwh=actual_monthly_generation,
            monthly_savings_ars=monthly_savings_ars,
            annual_savings_ars=annual_savings_ars,
            payback_period_years=payback_period,
            bill_coverage_achieved=bill_coverage_achieved,
            roi_annual=roi_annual,
            exchange_rate_used=self.exchange_rate
        )
        
        return simulation
    
    def simulate_by_investment(
        self, 
        monthly_bill_ars: Decimal, 
        investment_amount_usd: Decimal,
        user_email: str = "",
        user_phone: str = ""
    ) -> InvestmentSimulation:
        """
        Simulate investment based on investment amount
        """
        # Calculate number of panels from investment
        if self.project.price_per_panel_usd:
            number_of_panels = int((investment_amount_usd / self.project.price_per_panel_usd).to_integral_value())
        else:
            # Calculate from price per Wp
            total_watts = investment_amount_usd / self.project.price_per_wp_usd
            number_of_panels = int((total_watts / self.project.panel_power_wp).to_integral_value())
        
        # Recalculate actual investment based on whole panels
        panel_power_kw = self.project.panel_power_wp / 1000
        actual_power_kw = number_of_panels * panel_power_kw
        
        if self.project.price_per_panel_usd:
            actual_investment_usd = number_of_panels * self.project.price_per_panel_usd
        else:
            actual_investment_usd = actual_power_kw * 1000 * self.project.price_per_wp_usd
        
        actual_investment_ars = actual_investment_usd * self.exchange_rate
        
        # Calculate generation
        actual_annual_generation = actual_power_kw * self.annual_generation_factor * self.performance_ratio
        actual_monthly_generation = actual_annual_generation / 12
        
        # Calculate savings
        monthly_savings_ars = self._calculate_monthly_savings(actual_monthly_generation)
        annual_savings_ars = monthly_savings_ars * 12
        
        # Calculate metrics
        payback_period = actual_investment_ars / annual_savings_ars if annual_savings_ars > 0 else Decimal('999')
        roi_annual = (annual_savings_ars / actual_investment_ars) * 100 if actual_investment_ars > 0 else Decimal('0')
        bill_coverage_achieved = (monthly_savings_ars / monthly_bill_ars) * 100
        
        # Create simulation object
        simulation = InvestmentSimulation(
            project=self.project,
            user_email=user_email,
            user_phone=user_phone,
            monthly_bill_ars=monthly_bill_ars,
            tariff_category=self.tariff_category,
            simulation_type='investment',
            investment_amount_usd=investment_amount_usd,
            number_of_panels=number_of_panels,
            total_investment_usd=actual_investment_usd,
            total_investment_ars=actual_investment_ars,
            installed_power_kw=actual_power_kw,
            annual_generation_kwh=actual_annual_generation,
            monthly_generation_kwh=actual_monthly_generation,
            monthly_savings_ars=monthly_savings_ars,
            annual_savings_ars=annual_savings_ars,
            payback_period_years=payback_period,
            bill_coverage_achieved=bill_coverage_achieved,
            roi_annual=roi_annual,
            exchange_rate_used=self.exchange_rate
        )
        
        return simulation
    
    def _calculate_monthly_savings(self, monthly_generation_kwh: Decimal) -> Decimal:
        """
        Calculate monthly savings based on generation using fixed energy price
        """
        # Calculate savings using fixed energy price
        # Savings = Generation (kWh) * Fixed Energy Price (USD/kWh) * Exchange Rate (ARS/USD)
        energy_price_usd = Decimal(str(ENERGY_PRICE_USD_PER_KWH))
        monthly_savings_ars = monthly_generation_kwh * energy_price_usd * self.exchange_rate
        
        return monthly_savings_ars
    
    def get_project_capacity_check(self, required_power_kw: Decimal) -> Dict[str, Any]:
        """
        Check if the project has enough available capacity
        """
        available_power_kw = self.project.available_power
        
        return {
            'has_capacity': required_power_kw <= available_power_kw,
            'required_power_kw': float(required_power_kw),
            'available_power_kw': float(available_power_kw),
            'utilization_percentage': float((required_power_kw / available_power_kw) * 100) if available_power_kw > 0 else 0
        }