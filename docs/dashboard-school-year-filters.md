# Filtros por Año Académico en el Dashboard

## Problema Resuelto

El dashboard estaba mostrando estadísticas y alertas de todos los años académicos en lugar de filtrar solo por el año académico activo o seleccionado. Esto causaba que se mostraran alertas de años pasados y estadísticas incorrectas.

## Solución Implementada

### 1. Utilidades de Año Académico (`src/lib/school-year-utils.ts`)

Se crearon funciones utilitarias para manejar años académicos:
- `getActiveSchoolYear()`: Obtiene el año académico activo
- `getAllSchoolYears()`: Obtiene todos los años académicos
- `isSchoolYearActive()`: Verifica si un año específico está activo
- `getSchoolYearById()`: Obtiene un año académico por ID

### 2. Hook de Filtros del Dashboard (`src/hooks/use-dashboard-filters.ts`)

Se creó un hook para manejar los filtros del dashboard:
- Maneja el estado del año académico seleccionado
- Proporciona funciones para cambiar filtros
- Integra con el hook de configuraciones de años escolares

### 3. Actualización del Hook de Datos del Dashboard (`src/hooks/useDashboardDataSWR.ts`)

Se modificó para aceptar opciones de filtro:
- Acepta `schoolYearId` como parámetro
- Construye URLs de API con parámetros de consulta apropiados
- Mantiene compatibilidad hacia atrás con valor por defecto "active"

### 4. Actualización de APIs

#### API de Alertas (`src/app/api/v1/alerts/route.ts`)
- Acepta parámetro `schoolYearId` en query string
- Filtra faltas por `school_year_id` en la base de datos
- Por defecto usa el año académico activo

#### API de Infracciones (`src/app/api/v1/infractions/route.ts`)
- Acepta parámetro `schoolYearId` en query string
- Filtra infracciones por `school_year_id`
- Por defecto usa el año académico activo

### 5. Actualización del Componente Principal (`src/app/dashboard/page.tsx`)

- Integra el hook de filtros del dashboard
- Pasa el `schoolYearId` al hook de datos
- Mantiene toda la funcionalidad existente

## Uso

### Para Desarrolladores

```typescript
// Usar el hook con filtros específicos
const { students, infractions } = useDashboardDataSWR({
  schoolYearId: "active" // o un ID específico como "1"
});

// Usar los filtros del dashboard
const { filters, setSchoolYear } = useDashboardFilters();
```

### Para Usuarios

1. El dashboard ahora muestra solo datos del año académico activo por defecto
2. Los selectores de trimestre funcionan dentro del contexto del año académico
3. Las alertas solo se calculan con faltas del año académico seleccionado
4. Las estadísticas reflejan únicamente el período seleccionado

## Estructura de la Base de Datos

Las tablas `Faltas` ya tenían los campos necesarios:
- `school_year_id`: ID del año académico
- `trimestre_id`: ID del trimestre

## Beneficios

1. **Datos Precisos**: Las estadísticas reflejan solo el año académico seleccionado
2. **Alertas Relevantes**: Solo se muestran alertas del período activo
3. **Rendimiento Mejorado**: Menos datos a procesar y transferir
4. **Experiencia de Usuario**: Información más relevante y actualizada
5. **Compatibilidad**: Los cambios son compatibles hacia atrás

## Pruebas

Se incluye un script de prueba en `test/test-dashboard-filters.ts` para verificar que las APIs funcionen correctamente con los nuevos filtros.

## Próximos Pasos

1. Considerar agregar un selector de año académico en la interfaz de usuario
2. Implementar cache inteligente por año académico
3. Agregar métricas de rendimiento para el filtrado
4. Considerar filtros adicionales (por trimestre, sección, etc.)
