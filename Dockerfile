# =============================================
# Multi-stage Dockerfile optimizado con pnpm
# =============================================

# ==================== Base ====================
FROM node:24-alpine AS base
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache openssl curl

# ==================== Dependencies ====================
FROM base AS dependencies

# Copiar archivos de configuración del package manager
COPY package.json pnpm-lock.yaml ./

# Copiar el schema de Prisma ANTES de instalar dependencias
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
# pnpm install ejecutará automáticamente el postinstall (prisma generate)
RUN pnpm install --frozen-lockfile

# ==================== Builder ====================
FROM base AS builder

# Copiar node_modules desde la etapa de dependencias
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/prisma ./prisma

# Copiar todo el código fuente
COPY . .

# Variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"

# Construir la aplicación Next.js
RUN pnpm run build

# ==================== Production Runner ====================
FROM node:24-alpine AS runner

WORKDIR /app

# Instalar dependencias del sistema para producción
RUN apk add --no-cache \
    openssl \
    curl \
    bash \
    dcron

# Configurar zona horaria para Colombia
ENV TZ=America/Bogota
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Crear usuario no-root para mayor seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar archivos necesarios desde builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Crear directorio de logs con permisos correctos
RUN mkdir -p /app/logs && chown -R nextjs:nodejs /app/logs

# Configurar cron job para sincronización diaria (6 AM)
RUN echo "0 6 * * * cd /app && curl -X GET -H \"Authorization: Bearer \$CRON_SECRET\" http://localhost:3000/api/v1/cron/sync-phidias >> /app/logs/cron.log 2>&1" > /etc/crontabs/nextjs

# Crear script de inicio optimizado
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
echo "=== Starting Student Tracking Application ==="\n\
\n\
# Iniciar cron en background\n\
crond -b -l 2\n\
echo "✓ Cron service started"\n\
\n\
# Crear archivos de logs\n\
touch /app/logs/cron.log /app/logs/app.log\n\
echo "✓ Log files created"\n\
\n\
# Ejecutar migraciones de Prisma\n\
echo "Running database migrations..."\n\
pnpm run prisma:migrate || echo "⚠ Migration failed or no migrations needed"\n\
echo "✓ Migrations completed"\n\
\n\
# Ejecutar la aplicación\n\
echo "Starting Next.js application..."\n\
exec pnpm run start' > /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

# Cambiar ownership de archivos
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto de Next.js
EXPOSE 3000

# Healthcheck para Docker
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Ejecutar aplicación
CMD ["/app/start.sh"]
