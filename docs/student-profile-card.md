# StudentProfileCard - Perfil de Estudiante

## 📋 Descripción

El componente `StudentProfileCard` es una tarjeta informativa visualmente atractiva que muestra un perfil completo del estudiante con estadísticas de faltas, estado académico, e indicadores de progreso.

## ✨ Características

### 🎨 Elementos Visuales
- **Avatar personalizado**: Generado automáticamente con las iniciales del estudiante
- **Gradiente de fondo**: Diseño moderno con gradiente azul suave
- **Iconografía intuitiva**: Icons de Lucide para cada sección
- **Estados dinámicos**: Badges de color según el comportamiento del estudiante

### 📊 Información Mostrada

#### Información Básica
- Nombre completo del estudiante
- ID único del estudiante
- Grado académico (obtenido de las faltas registradas)
- Nivel educativo
- Estado general del comportamiento

#### Estadísticas de Faltas
- **Total de faltas** registradas
- **Faltas atendidas** vs pendientes
- **Desglose por tipo**:
  - Tipo I (Leves)
  - Tipo II (Moderadas) 
  - Tipo III (Graves)

#### Indicadores de Progreso
- **Barra de progreso** para faltas atendidas (porcentaje visual)
- **Progreso de seguimientos** para faltas Tipo II
- **Alertas de seguimientos pendientes** cuando aplique

### 🚨 Sistema de Alertas
- **Excelente comportamiento**: Sin faltas registradas (verde)
- **Buen comportamiento**: Pocas faltas, seguimientos al día (azul)
- **Requiere seguimiento**: Faltas pendientes o seguimientos atrasados (naranja)
- **Requiere intervención**: Múltiples faltas o casos críticos (rojo)

## 🛠️ Implementación

### Props del Componente
```typescript
interface StudentProfileCardProps {
  student: Student;       // Información básica del estudiante
  infractions: Infraction[];  // Lista de faltas registradas
  followUps: FollowUp[];      // Lista de seguimientos
}
```

### Funciones de Utilidad
- `calculateStudentProfileStats()`: Calcula todas las estadísticas
- `getStudentStatus()`: Determina el estado general del estudiante
- `getAttendanceRate()`: Calcula porcentaje de faltas atendidas
- `getFollowUpProgress()`: Calcula progreso de seguimientos

## 📱 Responsive Design
- Diseñado para verse bien en dispositivos móviles
- Ancho máximo de 400px (max-w-md)
- Layout adaptable con grid CSS

## 🎯 Casos de Uso

### Para Estudiantes Sin Faltas
- Muestra mensaje de "Sin faltas registradas"
- Estado verde de "Excelente comportamiento"
- Motivación positiva para mantener el comportamiento

### Para Estudiantes con Faltas
- Vista clara del total y desglose por tipo
- Indicadores visuales de progreso
- Alertas para seguimientos pendientes

### Para Faltas Tipo II
- Contador específico de seguimientos requeridos (3 por falta)
- Barra de progreso visual
- Alertas cuando faltan seguimientos

## 💡 Beneficios

### Para Educadores
- **Vista rápida** del estado del estudiante
- **Identificación inmediata** de casos que requieren atención
- **Seguimiento visual** del progreso en disciplina

### Para Administradores
- **Datos consolidados** en formato fácil de entender
- **Indicadores de alerta** para intervención temprana
- **Métricas de seguimiento** para reportes

### Para el Sistema
- **Componente reutilizable** en diferentes vistas
- **Cálculos automáticos** de estadísticas
- **Integración perfecta** con el diseño existente

## 🔧 Integración

### En la Página de Detalles del Estudiante
```tsx
<StudentProfileCard
  student={student}
  infractions={sortedInfractions}
  followUps={followUps}
/>
```

### Layout Responsive
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-1">
    <StudentProfileCard {...props} />
  </div>
  <div className="lg:col-span-2">
    <StudentDetailCard {...props} />
  </div>
</div>
```

## 🎨 Personalización

### Colores por Tipo de Falta
- **Tipo I**: Verde (leves)
- **Tipo II**: Amarillo (moderadas)  
- **Tipo III**: Rojo (graves)

### Estados del Estudiante
- **Excellent**: Verde - Sin faltas
- **Good**: Azul - Comportamiento controlado
- **Attention**: Naranja - Requiere seguimiento
- **Critical**: Rojo - Intervención inmediata

## 📈 Métricas Calculadas

### Automáticamente Calculadas
- Total de faltas por tipo
- Porcentaje de faltas atendidas
- Seguimientos completados vs requeridos
- Estado general del comportamiento
- Progreso visual en barras

### Datos Derivados
- Grado académico más reciente (de las faltas)
- Alertas de seguimiento pendiente
- Clasificación de riesgo comportamental
