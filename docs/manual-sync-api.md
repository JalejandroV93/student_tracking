# API de Sincronización Manual con Phidias

Este documento describe los nuevos endpoints para la sincronización manual con el sistema Phidias, diseñados para integración con N8N y otros sistemas de automatización.

## Autenticación

Todos los endpoints requieren un token Bearer válido:

```
Authorization: Bearer {TU_TOKEN_GENERADO_AQUI}

## Endpoints Disponibles

### 1. Verificar Estado de Sincronización

#### `GET /api/v1/phidias/manual-sync/status`

Obtiene el estado actual de sincronización y muestra qué secciones necesitan sincronización.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "timestamp": "2025-10-16T11:01:45.123Z",
  "data": {
    "activeSchoolYear": {
      "id": 1,
      "name": "2024-2025",
      "isActive": true
    },
    "lastSuccessfulSync": {
      "id": 123,
      "completedAt": "2025-10-16T10:30:00.000Z",
      "studentsProcessed": 1250,
      "recordsCreated": 45,
      "recordsUpdated": 12
    },
    "sections": [
      {
        "nivel": "Elementary",
        "tipoFalta": "Tipo II",
        "pollId": 12345,
        "configName": "Faltas Tipo II - Elementary",
        "studentsCount": 350,
        "syncedInfractionsCount": 23,
        "lastInfractionDate": "2025-10-15T14:30:00.000Z",
        "needsSync": true
      }
    ],
    "summary": {
      "totalSections": 4,
      "sectionsNeedingSync": 2,
      "totalStudents": 1250
    }
  }
}
```

### 2. Iniciar Sincronización Manual

#### `POST /api/v1/phidias/manual-sync`

Inicia una sincronización manual con diferentes opciones de alcance.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Opciones del Body:**

#### Sincronización Completa (Asíncrona)
```json
{
  "syncAll": true,
  "async": true
}
```

#### Sincronización por Nivel/Sección
```json
{
  "specificLevel": "Elementary",
  "async": true
}
```

#### Sincronización de Estudiante Específico
```json
{
  "specificStudentId": 123,
  "async": true
}
```

#### Sincronización Síncrona (espera resultado)
```json
{
  "syncAll": true,
  "async": false
}
```

**Respuesta Asíncrona (202):**
```json
{
  "success": true,
  "message": "Sincronización manual iniciada completa",
  "syncId": "manual_1729081305123_abc123def",
  "status": "started",
  "mode": "async",
  "options": {
    "triggeredBy": "manual-api",
    "specificLevel": null,
    "specificStudentId": null
  },
  "checkStatusUrl": "/api/v1/phidias/manual-sync/status/manual_1729081305123_abc123def"
}
```

**Respuesta Síncrona (200/207):**
```json
{
  "success": true,
  "message": "Sincronización completada exitosamente",
  "syncId": "manual_1729081305123_xyz789ghi",
  "status": "completed",
  "mode": "sync",
  "result": {
    "studentsProcessed": 350,
    "recordsCreated": 15,
    "recordsUpdated": 8,
    "duration": 45,
    "errors": []
  }
}
```

### 3. Verificar Estado de Sincronización Específica

#### `GET /api/v1/phidias/manual-sync/status/{syncId}`

Verifica el estado de una sincronización específica usando su ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta - En Progreso:**
```json
{
  "success": true,
  "syncId": "manual_1729081305123_abc123def",
  "status": "running",
  "message": "Sincronización en progreso",
  "startedAt": "2025-10-16T11:01:45.123Z"
}
```

**Respuesta - Completada:**
```json
{
  "success": true,
  "syncId": "manual_1729081305123_abc123def",
  "status": "completed",
  "completedAt": "2025-10-16T11:05:30.456Z",
  "result": {
    "success": true,
    "studentsProcessed": 350,
    "recordsCreated": 15,
    "recordsUpdated": 8,
    "duration": 285,
    "errors": [],
    "logId": 456
  }
}
```

## Códigos de Respuesta

- **200**: Éxito
- **202**: Sincronización iniciada (asíncrona)
- **207**: Sincronización completada con algunos errores
- **400**: Parámetros inválidos
- **401**: Token de autorización inválido
- **404**: Sincronización no encontrada
- **500**: Error interno del servidor

## Flujo de Trabajo Recomendado para N8N

### 1. Verificación Periódica
```javascript
// Paso 1: Verificar estado
GET /api/v1/phidias/manual-sync/status

// Paso 2: Evaluar si necesita sincronización
if (response.data.summary.sectionsNeedingSync > 0) {
  // Continuar con sincronización
}
```

### 2. Sincronización Automática
```javascript
// Paso 3: Iniciar sincronización
POST /api/v1/phidias/manual-sync
{
  "syncAll": true,
  "async": true
}

// Paso 4: Obtener syncId de la respuesta
const syncId = response.syncId;

// Paso 5: Esperar y verificar estado (polling cada 30 segundos)
const checkStatus = async () => {
  const status = await GET(`/api/v1/phidias/manual-sync/status/${syncId}`);
  
  if (status.status === 'running') {
    // Esperar y reintentar
    setTimeout(checkStatus, 30000);
  } else if (status.status === 'completed') {
    // Procesar resultado exitoso
    console.log('Sync completed:', status.result);
  } else if (status.status === 'error') {
    // Manejar error
    console.error('Sync failed:', status.error);
  }
};
```

### 3. Sincronización por Secciones Específicas
```javascript
// Para sincronizar solo las secciones que lo necesiten
const sectionsNeedingSync = response.data.sections
  .filter(section => section.needsSync)
  .map(section => section.nivel);

for (const level of sectionsNeedingSync) {
  await POST('/api/v1/phidias/manual-sync', {
    "specificLevel": level,
    "async": true
  });
}
```

## Configuración del Token

1. **Agregar al archivo .env:**
```
MANUAL_SYNC_TOKEN=QgTxbAk2GoQQgT7gymDTPkd9GYcznFRDjsORDUNGePI
```

2. **Regenerar token si es necesario:**
```bash
node scripts/generate-token.js
```

## Seguridad

- El token tiene validez de 1 año
- Solo debe usarse para automatización autorizada
- No incluir en repositorios públicos
- Regenerar si es comprometido
- Usar HTTPS en producción

## Monitoreo

- Los logs de sincronización se almacenan en la tabla `phidiasSyncLog`
- Se mantiene historial de todas las sincronizaciones
- Los errores se registran con detalles específicos
- Timeout de sincronizaciones activas: 2 horas

## Limitaciones

- Máximo 1 sincronización concurrente por tipo
- Rate limiting: 5 estudiantes por lote
- Timeout de verificación de estado: 1 segundo
- Almacenamiento en memoria (considerar Redis para producción)