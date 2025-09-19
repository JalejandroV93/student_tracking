# Configuración de Sincronización Automática con Phidias

Este documento describe cómo configurar la sincronización automática diaria con el sistema Phidias para ambos entornos: desarrollo (Vercel) y producción (Docker en Ubuntu VPS).

## 🎯 Resumen de la Solución

La sincronización automática se ejecuta diariamente a las **6:00 AM UTC** (2:00 AM Colombia) utilizando:

- **Desarrollo (Vercel)**: Vercel Cron Jobs
- **Producción (Docker)**: Cron jobs nativos de Linux
- **Respaldo**: GitHub Actions (6:30 AM UTC)

## 📋 Requisitos Previos

### Variables de Entorno Necesarias

Asegúrate de tener configuradas las siguientes variables en tu archivo `.env`:

```bash
# Configuración de Phidias API
PHIDIAS_BASE_URL=https://liceotaller.phidias.co
PHIDIAS_API_TOKEN=your-phidias-api-token-here

# Seguridad para Cron Jobs
CRON_SECRET=your-secure-cron-secret-token-here
```

## 🚀 Configuración para Desarrollo (Vercel)

### 1. Configuración Automática

El proyecto ya incluye el archivo `vercel.json` configurado:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/v1/cron/sync-phidias",
      "schedule": "0 6 * * *"
    }
  ],
  "functions": {
    "src/app/api/v1/cron/sync-phidias/route.ts": {
      "maxDuration": 300
    }
  }
}
```

### 2. Despliegue

Los cron jobs de Vercel solo funcionan en **producción**. Para activarlos:

```bash
# Desplegar a producción
vercel deploy --prod
```

### 3. Variables de Entorno en Vercel

Configura las variables de entorno en el dashboard de Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Accede a Settings → Environment Variables
3. Añade las variables necesarias:
   - `PHIDIAS_BASE_URL`
   - `PHIDIAS_API_TOKEN`
   - `CRON_SECRET`
   - `DATABASE_URL`

## 🐳 Configuración para Producción (Docker)

### 1. Dockerfile Actualizado

El `Dockerfile` ya está configurado para soportar cron jobs:

- Instala cron en el contenedor
- Configura un cron job que se ejecuta a las 6:00 AM
- Incluye logging automático

### 2. Variables de Entorno

Asegúrate de pasar las variables de entorno al contenedor:

```bash
# Docker Compose (docker-compose.yml)
services:
  app:
    build: .
    environment:
      - PHIDIAS_BASE_URL=${PHIDIAS_BASE_URL}
      - PHIDIAS_API_TOKEN=${PHIDIAS_API_TOKEN}
      - CRON_SECRET=${CRON_SECRET}
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
```

### 3. Construcción y Despliegue

```bash
# Construir la imagen
docker build -t student-tracking .

# Ejecutar con variables de entorno
docker run -d \
  --name student-tracking \
  --env-file .env \
  -p 3000:3000 \
  -v ./logs:/app/logs \
  student-tracking
```

### 4. Verificación en Ubuntu VPS

```bash
# Verificar que cron está ejecutándose
docker exec student-tracking service cron status

# Ver logs de cron
docker exec student-tracking cat /app/logs/cron.log

# Verificar crontab
docker exec student-tracking crontab -l
```

## 🔄 Respaldo con GitHub Actions

### 1. Configuración de Secrets

En tu repositorio de GitHub, configura los siguientes secrets:

1. Ve a Settings → Secrets and variables → Actions
2. Añade los siguientes secrets:
   - `CRON_SECRET`: El mismo token usado en tu aplicación
   - `VERCEL_PROD_URL`: URL de tu deployment de producción
   - `VERCEL_DEV_URL`: URL de tu deployment de desarrollo (opcional)

### 2. Workflow Automático

El archivo `.github/workflows/daily-sync.yml` está configurado para:

- Ejecutarse automáticamente a las 6:30 AM UTC (30 minutos después del cron principal)
- Permitir ejecución manual
- Funcionar como respaldo si fallan los otros métodos

### 3. Ejecución Manual

```bash
# Activar workflow manualmente desde GitHub
# Ve a Actions → Daily Phidias Sync → Run workflow
```

## 🛠️ Endpoints de la API

### Cron Job Endpoint

- **URL**: `/api/v1/cron/sync-phidias`
- **Método**: `GET` o `POST`
- **Autenticación**: Header `Authorization: Bearer {CRON_SECRET}`
- **Función**: Ejecuta sincronización completa

### Sincronización Manual

- **URL**: `/api/v1/phidias/sync`
- **Método**: `POST`
- **Autenticación**: Usuario autenticado
- **Función**: Permite sincronización manual desde la UI

## 🧪 Pruebas y Validación

### 1. Script de Prueba

Usa el script incluido para probar la configuración:

```bash
# Hacer ejecutable
chmod +x scripts/test-cron-sync.sh

# Probar en local
./scripts/test-cron-sync.sh local

# Probar en desarrollo
./scripts/test-cron-sync.sh dev

# Probar en producción
./scripts/test-cron-sync.sh prod
```

### 2. Prueba Manual del Endpoint

```bash
# Prueba directa con curl
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  "https://your-app.vercel.app/api/v1/cron/sync-phidias"
```

### 3. Verificar Logs

```bash
# En Vercel
# Revisa los logs en el dashboard de Vercel

# En Docker
docker logs student-tracking
docker exec student-tracking cat /app/logs/cron.log
```

## 📊 Monitoreo y Logging

### 1. Logs de Sincronización

Todos los procesos de sincronización se registran en:

- **Vercel**: Logs del dashboard
- **Docker**: `/app/logs/cron.log`
- **Base de datos**: Tabla `phidias_sync_log`

### 2. Información Registrada

- Timestamp de inicio y fin
- Número de estudiantes procesados
- Registros creados/actualizados
- Errores encontrados
- Duración total

### 3. Notificaciones de Error

En caso de fallo:

- Los logs incluyen detalles del error
- GitHub Actions envía notificaciones
- La aplicación mantiene el último estado conocido

## 🔧 Resolución de Problemas

### Problemas Comunes

1. **Cron job no se ejecuta**
   - Verificar que `CRON_SECRET` esté configurado
   - Confirmar que el deployment es de producción (en Vercel)
   - Revisar logs del contenedor (en Docker)

2. **Error de autenticación con Phidias**
   - Verificar `PHIDIAS_API_TOKEN`
   - Confirmar conectividad con la API

3. **Timeout en sincronización**
   - Revisar configuración de `maxDuration` en Vercel
   - Considerar sincronización por lotes más pequeños

### Comandos de Diagnóstico

```bash
# Verificar estado del contenedor
docker ps

# Revisar logs en tiempo real
docker logs -f student-tracking

# Verificar cron jobs activos
docker exec student-tracking crontab -l

# Probar endpoint manualmente
curl -H "Authorization: Bearer $CRON_SECRET" \
     "http://localhost:3000/api/v1/cron/sync-phidias"
```

## 📈 Optimizaciones Futuras

1. **Notificaciones por Email/Slack**
2. **Dashboard de monitoreo en tiempo real**
3. **Sincronización incremental basada en cambios**
4. **Múltiples horarios de sincronización**
5. **Integración con sistemas de monitoreo (DataDog, New Relic)**

## 🔒 Consideraciones de Seguridad

1. **CRON_SECRET** debe ser único y seguro
2. Usar HTTPS en todos los endpoints
3. Validar origen de las solicitudes
4. Mantener logs de auditoría
5. Rotar tokens periódicamente

---

## 📞 Soporte

Para problemas o dudas sobre la configuración:

1. Revisar logs detallados
2. Verificar configuración de variables de entorno
3. Ejecutar script de prueba
4. Consultar documentación de Vercel/Docker según el entorno