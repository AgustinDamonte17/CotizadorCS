from rest_framework import serializers
from .models import InvestmentSimulation, TariffCategory, ExchangeRate


class TariffCategorySerializer(serializers.ModelSerializer):
    """Serializer for tariff categories"""
    
    class Meta:
        model = TariffCategory
        fields = [
            'id', 'name', 'code', 'description',
            'energy_charge_peak', 'energy_charge_valley', 
            'fixed_charge_monthly', 'peak_percentage'
        ]


class ExchangeRateSerializer(serializers.ModelSerializer):
    """Serializer for exchange rates"""
    
    class Meta:
        model = ExchangeRate
        fields = ['id', 'rate', 'source', 'date', 'created_at']


class SimulationInputSerializer(serializers.Serializer):
    """Serializer for simulation input parameters"""
    
    project_id = serializers.IntegerField()
    monthly_consumption_kwh = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0)
    tariff_category_id = serializers.IntegerField()
    user_email = serializers.EmailField(required=False, allow_blank=True)
    
    # One of these three must be provided
    coverage_percentage = serializers.DecimalField(
        max_digits=5, decimal_places=2, min_value=0, max_value=100, 
        required=False, allow_null=True
    )
    number_of_panels = serializers.IntegerField(min_value=1, required=False, allow_null=True)
    investment_amount_usd = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=0, 
        required=False, allow_null=True
    )
    
    def validate(self, data):
        """Validate that exactly one simulation parameter is provided"""
        simulation_params = [
            data.get('coverage_percentage'),
            data.get('number_of_panels'),
            data.get('investment_amount_usd')
        ]
        
        # Count non-null parameters
        provided_params = [param for param in simulation_params if param is not None]
        
        if len(provided_params) != 1:
            raise serializers.ValidationError(
                "Debe proporcionar exactamente uno de los siguientes parámetros: "
                "coverage_percentage, number_of_panels, o investment_amount_usd"
            )
        
        return data


class InvestmentSimulationSerializer(serializers.ModelSerializer):
    """Serializer for investment simulation results"""
    
    project_name = serializers.CharField(source='project.name', read_only=True)
    project_location = serializers.CharField(source='project.location', read_only=True)
    tariff_category_name = serializers.CharField(source='tariff_category.name', read_only=True)
    
    # Additional calculated fields
    monthly_savings_usd = serializers.ReadOnlyField()
    annual_savings_usd = serializers.ReadOnlyField()
    
    class Meta:
        model = InvestmentSimulation
        fields = [
            'id', 'project_name', 'project_location', 'tariff_category_name',
            'monthly_consumption_kwh', 'simulation_type',
            'coverage_percentage', 'number_of_panels', 'investment_amount_usd',
            'total_investment_usd', 'total_investment_ars',
            'installed_power_kw', 'annual_generation_kwh', 'monthly_generation_kwh',
            'monthly_savings_ars', 'annual_savings_ars',
            'monthly_savings_usd', 'annual_savings_usd',
            'payback_period_years', 'coverage_achieved', 'roi_annual',
            'exchange_rate_used', 'created_at'
        ]


class SimulationSummarySerializer(serializers.ModelSerializer):
    """Serializer for simulation summary (minimal fields)"""
    
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = InvestmentSimulation
        fields = [
            'id', 'project_name', 'simulation_type',
            'total_investment_usd', 'monthly_savings_ars',
            'payback_period_years', 'roi_annual', 'created_at'
        ]


class SimulationComparisonSerializer(serializers.Serializer):
    """Serializer for comparing multiple simulation scenarios"""
    
    project_id = serializers.IntegerField()
    monthly_consumption_kwh = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0)
    tariff_category_id = serializers.IntegerField()
    
    # Multiple scenarios to compare
    coverage_percentages = serializers.ListField(
        child=serializers.DecimalField(max_digits=5, decimal_places=2, min_value=0, max_value=100),
        required=False,
        allow_empty=False
    )
    panel_quantities = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        allow_empty=False
    )
    investment_amounts = serializers.ListField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0),
        required=False,
        allow_empty=False
    )
    
    def validate(self, data):
        """Validate that at least one scenario list is provided"""
        scenario_lists = [
            data.get('coverage_percentages'),
            data.get('panel_quantities'),
            data.get('investment_amounts')
        ]
        
        if not any(scenario_lists):
            raise serializers.ValidationError(
                "Debe proporcionar al menos una lista de escenarios para comparar."
            )
        
        return data