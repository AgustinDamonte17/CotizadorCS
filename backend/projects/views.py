from rest_framework import generics, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum
from .models import SolarProject
from .serializers import (
    SolarProjectListSerializer, 
    SolarProjectDetailSerializer,
    SolarProjectCreateUpdateSerializer
)


class SolarProjectListView(generics.ListAPIView):
    """
    API view to list all solar projects with filtering and search capabilities
    """
    queryset = SolarProject.objects.all()
    serializer_class = SolarProjectListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'location']
    search_fields = ['name', 'description', 'location', 'owners']
    ordering_fields = ['created_at', 'name', 'available_power', 'price_per_wp_usd']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Optionally filter projects by available power range
        """
        queryset = SolarProject.objects.all()
        
        # Filter by minimum available power
        min_power = self.request.query_params.get('min_power')
        if min_power:
            try:
                queryset = queryset.filter(available_power__gte=float(min_power))
            except ValueError:
                pass
        
        # Filter by maximum available power
        max_power = self.request.query_params.get('max_power')
        if max_power:
            try:
                queryset = queryset.filter(available_power__lte=float(max_power))
            except ValueError:
                pass
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price_per_wp_usd__gte=float(min_price))
            except ValueError:
                pass
        
        max_price = self.request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price_per_wp_usd__lte=float(max_price))
            except ValueError:
                pass
        
        return queryset


class SolarProjectDetailView(generics.RetrieveAPIView):
    """
    API view to retrieve a single solar project with all details
    """
    queryset = SolarProject.objects.all()
    serializer_class = SolarProjectDetailSerializer


class SolarProjectCreateView(generics.CreateAPIView):
    """
    API view to create a new solar project (for admin use)
    """
    queryset = SolarProject.objects.all()
    serializer_class = SolarProjectCreateUpdateSerializer


class SolarProjectUpdateView(generics.RetrieveUpdateAPIView):
    """
    API view to update an existing solar project (for admin use)
    """
    queryset = SolarProject.objects.all()
    serializer_class = SolarProjectCreateUpdateSerializer


class SolarProjectDeleteView(generics.DestroyAPIView):
    """
    API view to delete a solar project (for admin use)
    """
    queryset = SolarProject.objects.all()


@api_view(['GET'])
def project_stats_view(request):
    """
    API view to get general statistics about solar projects
    """
    try:
        total_projects = SolarProject.objects.count()
        operational_projects = SolarProject.objects.filter(status='operational').count()
        funding_projects = SolarProject.objects.filter(status='funding').count()
        
        total_power_installed = SolarProject.objects.aggregate(
            total=Sum('total_power_installed')
        )['total'] or 0
        
        total_power_available = SolarProject.objects.aggregate(
            total=Sum('available_power')
        )['total'] or 0
        
        stats = {
            'total_projects': total_projects,
            'operational_projects': operational_projects,
            'funding_projects': funding_projects,
            'total_power_installed_kwp': float(total_power_installed),
            'total_power_available_kwp': float(total_power_available),
        }
        
        return Response(stats, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': 'Error al obtener estadísticas'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )