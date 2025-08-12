# Sistema de Precios Escalonados por Número de Paneles

## 📋 Resumen de Cambios

Se ha implementado un nuevo sistema de precios escalonados para las simulaciones por número de paneles, reemplazando el precio fijo anterior con una estructura de descuentos por volumen que beneficia a los compradores de mayor cantidad.

## 💰 Estructura de Precios

### Tiers de Precios
- **Tier 1 (1-9 paneles)**: $700 USD por panel
- **Tier 2 (10-99 paneles)**: $500 USD por panel  
- **Tier 3 (100+ paneles)**: $400 USD por panel

### Lógica de Cálculo
El costo total se calcula aplicando cada tier de forma acumulativa:

```python
def _calculate_total_investment_tiered(self, number_of_panels: int) -> Decimal:
    total_cost = Decimal('0')
    remaining_panels = number_of_panels
    
    # Tier 1: Primeros 9 paneles a $700 c/u
    if remaining_panels > 0:
        tier1_panels = min(remaining_panels, 9)
        total_cost += tier1_panels * Decimal('700')
        remaining_panels -= tier1_panels
    
    # Tier 2: Siguientes 90 paneles (10-99) a $500 c/u
    if remaining_panels > 0:
        tier2_panels = min(remaining_panels, 90)
        total_cost += tier2_panels * Decimal('500')
        remaining_panels -= tier2_panels
    
    # Tier 3: Paneles restantes (100+) a $400 c/u
    if remaining_panels > 0:
        total_cost += remaining_panels * Decimal('400')
    
    return total_cost
```

## 📊 Ejemplos de Cálculo

### Ejemplo 1: 5 Paneles (Tier 1)
- 5 paneles × $700 = $3,500 USD
- Precio promedio: $700/panel

### Ejemplo 2: 50 Paneles (Tier 1 + Tier 2)
- 9 paneles × $700 = $6,300 USD
- 41 paneles × $500 = $20,500 USD
- **Total**: $26,800 USD
- Precio promedio: $536/panel

### Ejemplo 3: 150 Paneles (Todos los Tiers)
- 9 paneles × $700 = $6,300 USD
- 90 paneles × $500 = $45,000 USD
- 51 paneles × $400 = $20,400 USD
- **Total**: $71,700 USD
- Precio promedio: $478/panel

## 🔄 Flujo de Cálculo Completo

### 1. Cálculo de Inversión
```python
# Usar precios escalonados
total_investment_usd = self._calculate_total_investment_tiered(number_of_panels)
total_investment_ars = total_investment_usd * self.exchange_rate
```

### 2. Especificaciones del Sistema
```python
panel_power_kw = self.project.panel_power_wp / 1000
actual_power_kw = number_of_panels * panel_power_kw
```

### 3. Generación de Energía
```python
actual_annual_generation = actual_power_kw * self.annual_generation_factor * self.performance_ratio
actual_monthly_generation = actual_annual_generation / 12
```

### 4. Cálculo de Ahorros
```python
monthly_savings_ars = self._calculate_monthly_savings(actual_monthly_generation)
annual_savings_ars = monthly_savings_ars * 12
```

### 5. Métricas Financieras
```python
# Período de retorno
payback_period = total_investment_ars / annual_savings_ars

# ROI anual
roi_annual = (annual_savings_ars / total_investment_ars) * 100

# Cobertura de factura
bill_coverage_achieved = (monthly_savings_ars / monthly_bill_ars) * 100
```

## 📈 Impacto en Resultados

### Comparación con Tiers Anteriores (1-9: $700, 10-49: $500, 50+: $400)

| Paneles | Tiers Antiguos | Tiers Nuevos | Diferencia | % Cambio |
|---------|---------------|--------------|------------|----------|
| 9       | $6,300        | $6,300       | $0         | 0.0%     |
| 10      | $6,800        | $6,800       | $0         | 0.0%     |
| 49      | $26,300       | $26,300      | $0         | 0.0%     |
| 50      | $26,700       | $26,800      | +$100      | +0.4%    |
| 75      | $36,700       | $39,300      | +$2,600    | +7.1%    |
| 99      | $46,300       | $51,300      | +$5,000    | +10.8%   |
| 100     | $46,700       | $51,700      | +$5,000    | +10.7%   |
| 150     | $66,700       | $71,700      | +$5,000    | +7.5%    |
| 200     | $86,700       | $91,700      | +$5,000    | +5.8%    |

### Observaciones:
- **Proyectos pequeños (1-49 paneles)**: Sin cambios
- **Proyectos medianos (50-99 paneles)**: Incremento moderado en costo
- **Proyectos grandes (100+ paneles)**: Incremento fijo de $5,000 USD
- **Nuevo punto de equilibrio**: Aproximadamente 99-100 paneles

## 🔧 Archivos Modificados

### `backend/simulations/simulation_engine.py`
- ✅ Agregado método `_calculate_tiered_panel_price()`
- ✅ Agregado método `_calculate_total_investment_tiered()`
- ✅ Modificado método `simulate_by_panels()` para usar precios escalonados
- ✅ Actualizada documentación del método

## 🧪 Testing

### Script de Prueba: `test_tiered_pricing.py`
El script incluye:
- Creación de datos de prueba
- Pruebas con diferentes cantidades de paneles
- Desglose detallado de precios por tier
- Simulaciones completas con métricas financieras
- Comparación con sistema anterior

### Ejecutar Pruebas
```bash
cd backend
python test_tiered_pricing.py
```

## 💡 Beneficios del Sistema

### Para Compradores Pequeños
- Transparencia en precios premium
- Estructura clara y comprensible

### Para Compradores Grandes
- Descuentos automáticos por volumen
- Mejor ROI en proyectos grandes
- Incentivo para aumentar la inversión

### Para el Negocio
- Optimización de márgenes por volumen
- Incentivo a ventas de mayor escala
- Flexibilidad para ajustar tiers según mercado

## 🔮 Futuras Mejoras

1. **Tiers Configurables**: Hacer los rangos y precios configurables desde admin
2. **Precios Dinámicos**: Integrar con costos de mercado actuales
3. **Descuentos Temporales**: Sistema de promociones por tiempo limitado
4. **Personalización**: Precios especiales para clientes corporativos

## 📞 Soporte

Para consultas sobre la implementación o ajustes al sistema de precios, contactar al equipo de desarrollo.
