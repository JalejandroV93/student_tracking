# Panel de Monitoreo de Sincronización con Phidias

## Descripción

Este panel permite monitorear el estado de sincronización entre el sistema local y Phidias comparando la cantidad de registros de cada seguimiento configurado.

## Funcionalidades

### 1. Panel de Estado de Seguimientos

El componente `SeguimientosStatusPanel` muestra:

- **Estado de cada seguimiento**: Sincronizado, Desincronizado, o Error
- **Conteo de registros**: Local vs Phidias
- **Indicadores visuales**: Iconos y badges para identificar rápidamente el estado
- **Última verificación**: Timestamp de cuándo se realizó la última consulta

### 2. API de Consolidación

**Endpoint**: `/api/v1/phidias/consolidate`

Este endpoint consulta la API de Phidias usando el endpoint:
```
https://liceotaller.phidias.co/rest/1/poll/consolidate?pollId={id_seguimiento}
```

#### Filtrado de Registros Fantasma

La API de Phidias retorna registros "fantasma" cuando un seguimiento no tiene datos reales:

```json
[
  {
    "poll_id": 653,
    "poll_name": "Seguimiento Faltas Tipo 2 Preschool",
    "person_id": null,
    "person": null,
    "section": null,
    "timestamp": "1969-12-31 19:00:00",
    "last_edit": "1969-12-31 19:00:00",
    "author_id": null,
    "author": null,
    "last_editor_id": null,
    "last_editor": null
  }
]
```

Nuestro sistema filtra automáticamente estos registros basándose en:
- `person_id` es null
- `timestamp` contiene "1969-12-31" (época Unix)
- `person` es null o vacío

### 3. Estados de Sincronización

- **🟢 Sincronizado**: Número de registros locales = Número de registros en Phidias
- **🟡 Desincronizado**: Números diferentes entre local y Phidias
- **🔴 Error**: No se pudo obtener datos de Phidias

### 4. Integración en la Página de Sincronización

El panel se integra en `/dashboard/settings/phidias/sync` y se actualiza en tiempo real con:
- Botón de actualización manual
- Timestamp de última verificación
- Resumen de estadísticas

## Variables de Entorno Requeridas

```env
PHIDIAS_BASE_URL=https://liceotaller.phidias.co
PHIDIAS_API_TOKEN=your_phidias_api_token_here
```

## Uso

1. Navegar a la página de sincronización de Phidias
2. El panel se carga automáticamente al abrir la página
3. Usar el botón "Actualizar" para obtener datos más recientes
4. Revisar los conteos para determinar si es necesario sincronizar

## Configuración de Seguimientos

Los seguimientos deben estar configurados en la tabla `PhidiasSeguimiento` con:
- `phidias_id`: ID del seguimiento en Phidias
- `tipo_falta`: Tipo I, II, o III
- `nivel_academico`: Preschool, Elementary, Middle School, High School
- `isActive`: true para incluir en el monitoreo

## Arquitectura

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   React Component   │───▶│   API Endpoint       │───▶│   Phidias API       │
│ SeguimientosStatus  │    │ /api/v1/phidias/     │    │ /rest/1/poll/       │
│ Panel               │    │ consolidate          │    │ consolidate         │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
                                     │
                                     ▼
                           ┌──────────────────────┐
                           │   Local Database     │
                           │   (Prisma/          │
                           │   PostgreSQL)        │
                           └──────────────────────┘
```