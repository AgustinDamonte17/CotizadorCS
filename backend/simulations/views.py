from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import InvestmentSimulation, TariffCategory, ExchangeRate
from .serializers import (
    InvestmentSimulationSerializer,
    SimulationInputSerializer,
    TariffCategorySerializer,
    ExchangeRateSerializer,
    SimulationSummarySerializer,
    SimulationComparisonSerializer
)
from .simulation_engine import SolarInvestmentCalculator
from projects.models import SolarProject


class TariffCategoryListView(generics.ListAPIView):
    """
    API view to list all available tariff categories
    """
    queryset = TariffCategory.objects.all()
    serializer_class = TariffCategorySerializer


class ExchangeRateListView(generics.ListAPIView):
    """
    API view to list exchange rates
    """
    queryset = ExchangeRate.objects.all()[:10]  # Latest 10 rates
    serializer_class = ExchangeRateSerializer


@api_view(['GET'])
def current_exchange_rate_view(request):
    """
    API view to get the current exchange rate
    """
    try:
        rate = ExchangeRate.get_latest_rate()
        return Response({
            'current_rate': float(rate),
            'currency_pair': 'USD/ARS'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': 'Error al obtener el tipo de cambio'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def create_simulation_view(request):
    """
    API view to create a new investment simulation
    """
    serializer = SimulationInputSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                # Get required objects
                project = get_object_or_404(SolarProject, id=serializer.validated_data['project_id'])
                tariff_category = get_object_or_404(
                    TariffCategory, 
                    id=serializer.validated_data['tariff_category_id']
                )
                
                # Initialize calculator
                calculator = SolarInvestmentCalculator(project, tariff_category)
                
                # Determine simulation type and run calculation
                if serializer.validated_data.get('coverage_percentage') is not None:
                    simulation = calculator.simulate_by_coverage(
                        monthly_consumption_kwh=serializer.validated_data['monthly_consumption_kwh'],
                        coverage_percentage=serializer.validated_data['coverage_percentage'],
                        user_email=serializer.validated_data.get('user_email', '')
                    )
                elif serializer.validated_data.get('number_of_panels') is not None:
                    simulation = calculator.simulate_by_panels(
                        monthly_consumption_kwh=serializer.validated_data['monthly_consumption_kwh'],
                        number_of_panels=serializer.validated_data['number_of_panels'],
                        user_email=serializer.validated_data.get('user_email', '')
                    )
                elif serializer.validated_data.get('investment_amount_usd') is not None:
                    simulation = calculator.simulate_by_investment(
                        monthly_consumption_kwh=serializer.validated_data['monthly_consumption_kwh'],
                        investment_amount_usd=serializer.validated_data['investment_amount_usd'],
                        user_email=serializer.validated_data.get('user_email', '')
                    )
                
                # Save simulation
                simulation.save()
                
                # Check project capacity
                capacity_check = calculator.get_project_capacity_check(simulation.installed_power_kw)
                
                # Serialize response
                response_serializer = InvestmentSimulationSerializer(simulation)
                
                return Response({
                    'simulation': response_serializer.data,
                    'capacity_check': capacity_check,
                    'success': True
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'error': f'Error al crear la simulación: {str(e)}',
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'errors': serializer.errors,
        'success': False
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def compare_simulations_view(request):
    """
    API view to compare multiple simulation scenarios
    """
    serializer = SimulationComparisonSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Get required objects
            project = get_object_or_404(SolarProject, id=serializer.validated_data['project_id'])
            tariff_category = get_object_or_404(
                TariffCategory, 
                id=serializer.validated_data['tariff_category_id']
            )
            
            # Initialize calculator
            calculator = SolarInvestmentCalculator(project, tariff_category)
            monthly_consumption = serializer.validated_data['monthly_consumption_kwh']
            
            comparison_results = []
            
            # Coverage percentage scenarios
            if serializer.validated_data.get('coverage_percentages'):
                for coverage in serializer.validated_data['coverage_percentages']:
                    simulation = calculator.simulate_by_coverage(monthly_consumption, coverage)
                    simulation_data = InvestmentSimulationSerializer(simulation).data
                    comparison_results.append({
                        'type': 'coverage',
                        'parameter': float(coverage),
                        'simulation': simulation_data
                    })
            
            # Panel quantity scenarios
            if serializer.validated_data.get('panel_quantities'):
                for panels in serializer.validated_data['panel_quantities']:
                    simulation = calculator.simulate_by_panels(monthly_consumption, panels)
                    simulation_data = InvestmentSimulationSerializer(simulation).data
                    comparison_results.append({
                        'type': 'panels',
                        'parameter': panels,
                        'simulation': simulation_data
                    })
            
            # Investment amount scenarios
            if serializer.validated_data.get('investment_amounts'):
                for amount in serializer.validated_data['investment_amounts']:
                    simulation = calculator.simulate_by_investment(monthly_consumption, amount)
                    simulation_data = InvestmentSimulationSerializer(simulation).data
                    comparison_results.append({
                        'type': 'investment',
                        'parameter': float(amount),
                        'simulation': simulation_data
                    })
            
            return Response({
                'project_info': {
                    'id': project.id,
                    'name': project.name,
                    'available_power_kw': float(project.available_power)
                },
                'comparison_results': comparison_results,
                'success': True
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error al comparar simulaciones: {str(e)}',
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'errors': serializer.errors,
        'success': False
    }, status=status.HTTP_400_BAD_REQUEST)


class SimulationDetailView(generics.RetrieveAPIView):
    """
    API view to retrieve a specific simulation by ID
    """
    queryset = InvestmentSimulation.objects.all()
    serializer_class = InvestmentSimulationSerializer
    lookup_field = 'id'


class UserSimulationsView(generics.ListAPIView):
    """
    API view to list simulations for a specific user email
    """
    serializer_class = SimulationSummarySerializer
    
    def get_queryset(self):
        user_email = self.request.query_params.get('email')
        if user_email:
            return InvestmentSimulation.objects.filter(user_email=user_email)
        return InvestmentSimulation.objects.none()


@api_view(['GET'])
def simulation_stats_view(request):
    """
    API view to get general simulation statistics
    """
    try:
        total_simulations = InvestmentSimulation.objects.count()
        
        # Average metrics
        if total_simulations > 0:
            from django.db.models import Avg
            avg_investment = InvestmentSimulation.objects.aggregate(
                avg=Avg('total_investment_usd')
            )['avg'] or 0
            
            avg_payback = InvestmentSimulation.objects.aggregate(
                avg=Avg('payback_period_years')
            )['avg'] or 0
            
            avg_roi = InvestmentSimulation.objects.aggregate(
                avg=Avg('roi_annual')
            )['avg'] or 0
        else:
            avg_investment = avg_payback = avg_roi = 0
        
        stats = {
            'total_simulations': total_simulations,
            'average_investment_usd': float(avg_investment),
            'average_payback_years': float(avg_payback),
            'average_roi_annual': float(avg_roi),
        }
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Error al obtener estadísticas'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )