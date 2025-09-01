# Filtro de Año Académico - Detalles de Estudiante

## Funcionalidad Implementada

Se agregó un filtro de año académico a la página de detalles del estudiante que permite:

### Características

1. **Filtro por defecto**: Al abrir los detalles de un estudiante, solo se muestran las faltas del año académico activo.

2. **Opciones de filtro**:
   - **Activo**: Muestra solo las faltas del año académico activo actual
   - **Todos los años**: Muestra todas las faltas del estudiante, sin importar el año
   - **Años específicos**: Permite seleccionar un año académico específico para ver solo las faltas de ese año

### Componentes Modificados/Creados

#### Nuevos Archivos:
- `src/components/students/StudentSchoolYearFilter.tsx`: Componente de filtro específico para la página de detalles

#### Archivos Modificados:
- `src/app/dashboard/students/[id]/page.tsx`: 
  - Agregado estado para el filtro de año académico
  - Lógica de filtrado de infracciones
  - Integración del componente de filtro en la UI
- `src/types/dashboard.ts`: Agregado campo `schoolYearId` al tipo `Infraction`
- `src/lib/utils.ts`: Actualizada función `transformInfraction` para incluir `schoolYearId`

### Implementación Técnica

1. **Estado Local**: Se utiliza `useState` para mantener el año académico seleccionado
2. **Hook de Dashboard**: Se reutiliza `useDashboardFilters` para obtener información de años académicos
3. **Filtrado en Cliente**: Las infracciones se filtran en el cliente según el año seleccionado
4. **UI Responsiva**: El filtro se posiciona de manera responsiva junto al botón de volver

### Flujo de Usuario

1. Usuario navega a los detalles de un estudiante
2. Por defecto, ve solo las faltas del año académico activo
3. Puede usar el selector para cambiar a "Todos los años" o un año específico
4. Las faltas se actualizan inmediatamente según la selección

### Beneficios

- **Rendimiento**: Reduce la carga visual al mostrar solo las faltas relevantes por defecto
- **Usabilidad**: Permite análisis específico por año académico
- **Flexibilidad**: Mantiene la opción de ver todos los datos históricos cuando sea necesario
