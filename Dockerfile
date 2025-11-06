# =============================================
# Multi-stage Dockerfile optimizado con pnpm
# =============================================

# ==================== Base ====================
FROM node:24-slim AS base

# Habilitar Corepack para pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Instalar dependencias del sistema (OpenSSL para Prisma, cron para jobs)
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    openssl \
    cron \
    curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ==================== Dependencies ====================
FROM base AS dependencies

# Copiar solo archivos de configuración de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias usando pnpm con caché montada
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# ==================== Builder ====================
FROM base AS builder

# Copiar node_modules desde la etapa de dependencias
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar archivos de la aplicación
COPY . .

# Generar Prisma Client
RUN pnpm exec prisma generate

# Construir la aplicación Next.js
# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# ==================== Production Runner ====================
FROM node:24-slim AS runner

WORKDIR /app

# Instalar solo dependencias del sistema necesarias para producción
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    openssl \
    cron \
    curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configurar zona horaria para Colombia
ENV TZ=America/Bogota
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Crear usuario no-root para mayor seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Crear directorios necesarios
RUN mkdir -p /app/logs && \
    chown -R nextjs:nodejs /app

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

# Habilitar pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copiar package.json y pnpm-lock.yaml
COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml* ./

# Instalar SOLO dependencias de producción
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

# Copiar archivos compilados desde builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Configurar cron job para sincronización diaria (6 AM)
RUN echo "0 6 * * * nextjs curl -X GET -H \"Authorization: Bearer \$CRON_SECRET\" http://localhost:3000/api/v1/cron/sync-phidias >> /app/logs/cron.log 2>&1" > /etc/cron.d/phidias-sync && \
    chmod 0644 /etc/cron.d/phidias-sync && \
    crontab -u nextjs /etc/cron.d/phidias-sync

# Crear script de inicio optimizado
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "=== Starting Student Tracking Application ==="\n\
\n\
# Iniciar cron como root\n\
service cron start\n\
echo "✓ Cron service started"\n\
\n\
# Crear archivos de logs\n\
touch /app/logs/cron.log /app/logs/app.log\n\
chown nextjs:nodejs /app/logs/*.log\n\
echo "✓ Log files created"\n\
\n\
# Ejecutar migraciones de Prisma\n\
echo "Running database migrations..."\n\
pnpm run prisma:migrate || echo "⚠ Migration failed or no migrations needed"\n\
echo "✓ Migrations completed"\n\
\n\
# Cambiar a usuario nextjs y ejecutar la aplicación\n\
echo "Starting Next.js application..."\n\
exec su-exec nextjs node server.js' > /app/start.sh && \
    chmod +x /app/start.sh

# Instalar su-exec para cambiar de usuario de forma segura
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends su-exec && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Cambiar ownership de archivos
RUN chown -R nextjs:nodejs /app

# Exponer puerto de Next.js
EXPOSE 3000

# Healthcheck para Docker
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Ejecutar como root para iniciar cron, luego cambiar a nextjs
CMD ["/app/start.sh"]
