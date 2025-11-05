# Sistema de Auditoría y Trazabilidad

## 📋 Descripción General

Se ha implementado un sistema completo de auditoría y trazabilidad para el sistema de seguimiento de estudiantes. Este sistema registra todas las acciones importantes realizadas por los usuarios, proporcionando visibilidad total sobre quién hizo qué, cuándo y desde dónde.

## 🎯 Funcionalidades Implementadas

### 1. **Modelo de Datos (AuditLog)**

Se agregó el modelo `AuditLog` al schema de Prisma con los siguientes campos:

- `id`: Identificador único autoincrementado
- `action`: Tipo de acción (login, logout, sync, create, update, delete, etc.)
- `userId`: ID del usuario que realizó la acción
- `username`: Nombre de usuario (para búsquedas rápidas)
- `entityType`: Tipo de entidad afectada (falta, estudiante, caso, etc.)
- `entityId`: ID de la entidad afectada
- `description`: Descripción legible de la acción
- `metadata`: Datos adicionales en formato JSON
- `ipAddress`: Dirección IP del usuario
- `userAgent`: User agent del navegador
- `status`: Estado de la operación (success, error, warning)
- `errorMessage`: Mensaje de error si aplica
- `duration`: Duración de la operación en ms
- `createdAt`: Timestamp de la acción

### 2. **Servicio Centralizado de Auditoría**

**Ubicación**: `/src/services/audit.service.ts`

Servicio singleton que proporciona métodos para registrar diferentes tipos de acciones:

#### Métodos de Autenticación:
- `logLogin()` - Registra login exitoso
- `logLoginFailed()` - Registra intento de login fallido
- `logLogout()` - Registra cierre de sesión
- `logPasswordChange()` - Registra cambio de contraseña

#### Métodos de Sincronización:
- `logPhidiasSyncManual()` - Registra sincronización manual con Phidias
- `logPhidiasSyncAuto()` - Registra sincronización automática
- `logPhidiasSyncFailed()` - Registra sincronización fallida

#### Métodos de Operaciones CRUD:
- `logFaltaCreated()` - Registra creación de falta
- `logFaltaUpdated()` - Registra actualización de falta
- `logFaltaDeleted()` - Registra eliminación de falta
- `logCasoCreated()` - Registra creación de caso
- `logSeguimientoCreated()` - Registra creación de seguimiento

#### Métodos de Consultas y Exportaciones:
- `logQuery()` - Registra consultas importantes
- `logExport()` - Registra exportaciones de datos
- `logImport()` - Registra importaciones de datos

#### Métodos de Seguridad:
- `logUserBlocked()` - Registra bloqueo de usuario
- `logAccessDenied()` - Registra acceso denegado

#### Métodos de Consulta:
- `getLogs()` - Obtiene logs con filtros avanzados
- `getStats()` - Obtiene estadísticas de auditoría

### 3. **Integración en Puntos Clave**

#### Autenticación (`/src/lib/auth.ts`, `/src/app/api/v1/auth/`)
- ✅ Login exitoso
- ✅ Login fallido (con razón del fallo)
- ✅ Logout
- ✅ Actualización de lastLogin en BD

#### Sincronización con Phidias (`/src/services/phidias-sync.service.ts`, `/src/app/api/v1/phidias/sync/route.ts`)
- ✅ Inicio de sincronización manual
- ✅ Finalización de sincronización automática
- ✅ Sincronizaciones fallidas

### 4. **Endpoints de Consulta**

#### GET `/api/v1/audit/logs`
Obtiene logs de auditoría con filtros.

**Parámetros de consulta**:
- `userId` - Filtrar por ID de usuario
- `username` - Filtrar por nombre de usuario (búsqueda parcial)
- `action` - Filtrar por tipo de acción
- `entityType` - Filtrar por tipo de entidad
- `status` - Filtrar por estado (success, error, warning)
- `startDate` - Fecha de inicio (ISO 8601)
- `endDate` - Fecha de fin (ISO 8601)
- `limit` - Límite de resultados (default: 50)
- `offset` - Offset para paginación (default: 0)

**Respuesta**:
```json
{
  "logs": [...],
  "total": 250,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

**Restricción**: Solo accesible para usuarios con rol `ADMIN`

#### GET `/api/v1/audit/stats`
Obtiene estadísticas de auditoría.

**Parámetros de consulta**:
- `startDate` - Fecha de inicio (ISO 8601)
- `endDate` - Fecha de fin (ISO 8601)
- `userId` - Filtrar por usuario específico

**Respuesta**:
```json
{
  "totalLogs": 5000,
  "loginCount": 1200,
  "syncCount": 45,
  "failedActions": 23,
  "actionBreakdown": [
    { "action": "login", "count": 1200 },
    { "action": "query", "count": 2000 },
    ...
  ],
  "topUsers": [
    { "username": "admin", "count": 800 },
    { "username": "coordinador1", "count": 500 },
    ...
  ]
}
```

**Restricción**: Solo accesible para usuarios con rol `ADMIN`

## 🚀 Instalación y Configuración

### 1. Ejecutar Migración de Base de Datos

```bash
# Generar cliente de Prisma con el nuevo modelo
npx prisma generate

# Crear y aplicar migración
npx prisma migrate dev --name add_audit_log

# O en producción
npx prisma migrate deploy
```

### 2. Reiniciar Servicios

Si estás usando Docker:

```bash
docker-compose down
docker-compose up -d
```

## 📊 Acciones Registradas

El sistema registra las siguientes acciones:

### Autenticación
- `login` - Login exitoso
- `login_failed` - Intento de login fallido
- `logout` - Cierre de sesión
- `password_change` - Cambio de contraseña
- `password_change_failed` - Intento fallido de cambio de contraseña

### Operaciones CRUD
- `create` - Creación de registros (faltas, casos, seguimientos, etc.)
- `update` - Actualización de registros
- `delete` - Eliminación de registros

### Sincronización con Phidias
- `sync_phidias_manual` - Sincronización manual iniciada por usuario
- `sync_phidias_auto` - Sincronización automática (cron)
- `sync_phidias_failed` - Sincronización fallida

### Consultas y Reportes
- `query` - Consultas importantes
- `export` - Exportación de datos
- `import` - Importación de datos (CSV, etc.)

### Seguridad
- `user_blocked` - Usuario bloqueado
- `user_unblocked` - Usuario desbloqueado
- `access_denied` - Acceso denegado a un recurso

## 🔍 Casos de Uso

### 1. Investigar Problema de Sincronización

Para rastrear todas las sincronizaciones de un período específico:

```bash
GET /api/v1/audit/logs?action=sync_phidias_auto&startDate=2025-01-01&endDate=2025-01-31
```

### 2. Auditar Acciones de un Usuario

Para ver todas las acciones de un usuario específico:

```bash
GET /api/v1/audit/logs?username=coordinador1&limit=100
```

### 3. Detectar Intentos de Acceso No Autorizados

Para ver intentos de login fallidos:

```bash
GET /api/v1/audit/logs?action=login_failed&status=error
```

### 4. Rastrear Cambios en una Falta Específica

Para ver el historial de cambios en una falta:

```bash
GET /api/v1/audit/logs?entityType=falta&entityId=phidias_12345
```

### 5. Obtener Estadísticas del Mes

```bash
GET /api/v1/audit/stats?startDate=2025-11-01&endDate=2025-11-30
```

## 📈 Índices de Base de Datos

Se crearon índices en las siguientes columnas para optimizar consultas:

- `action` - Para filtrar por tipo de acción
- `userId` - Para filtrar por usuario
- `username` - Para búsquedas por nombre
- `entityType` - Para filtrar por tipo de entidad
- `createdAt` - Para filtros temporales
- `status` - Para filtrar por estado

## 🛡️ Consideraciones de Seguridad

1. **Acceso Restringido**: Solo usuarios con rol `ADMIN` pueden consultar logs de auditoría
2. **Registro de Accesos Denegados**: Se registra cada intento de acceso denegado
3. **Captura de IP y User Agent**: Para trazabilidad de sesiones
4. **Logs Inmutables**: Los logs no pueden ser editados, solo creados
5. **Retención de Datos**: Considerar política de retención de logs (ej: 1 año)

## 🔧 Mantenimiento

### Limpieza de Logs Antiguos

Se recomienda implementar un cron job para limpiar logs antiguos:

```sql
-- Eliminar logs de más de 1 año
DELETE FROM "AuditLog" WHERE "createdAt" < NOW() - INTERVAL '1 year';
```

### Monitoreo de Espacio

Verificar periódicamente el tamaño de la tabla:

```sql
SELECT pg_size_pretty(pg_total_relation_size('"AuditLog"'));
```

## 📝 Notas Adicionales

- **Performance**: Los índices garantizan consultas rápidas incluso con millones de registros
- **Metadata JSON**: Permite almacenar datos adicionales sin modificar el schema
- **Timestamps Automáticos**: `createdAt` se establece automáticamente
- **Manejo de Errores**: Si el logging falla, no afecta la operación principal

## 🎯 Próximos Pasos Recomendados

1. **Dashboard de Auditoría**: Crear interfaz visual para consultar logs
2. **Alertas**: Configurar alertas para acciones sospechosas
3. **Exportación de Logs**: Permitir exportar logs a CSV/Excel
4. **Integración con SIEM**: Enviar logs a sistema de análisis de seguridad
5. **Retención Automática**: Implementar política de retención configurable

## 🐛 Debugging del Sistema de Sincronización

Con el nuevo sistema de auditoría, ahora puedes:

1. **Rastrear cada sincronización** con timestamps precisos
2. **Ver qué usuario inició sincronizaciones manuales**
3. **Identificar patrones** en sincronizaciones automáticas
4. **Detectar errores recurrentes** en sincronizaciones
5. **Correlacionar problemas** con acciones específicas de usuarios

### Ejemplo: Detectar Duplicación de Faltas

```bash
# 1. Ver todas las sincronizaciones del día
GET /api/v1/audit/logs?action=sync_phidias_auto&startDate=2025-11-05

# 2. Ver creaciones de faltas en el mismo período
GET /api/v1/audit/logs?action=create&entityType=falta&startDate=2025-11-05

# 3. Comparar con datos de Phidias para detectar discrepancias
```

---

**Desarrollado con ❤️ para mejorar la trazabilidad del sistema**
