# Utiliza una imagen oficial de Node.js como base
FROM node:24-slim AS base

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalar OpenSSL para Prisma y cron para trabajos programados
RUN apt-get update -y && apt-get install -y openssl cron curl

# --- Dependencias ---
FROM base AS dependencies

# Agregar variable de entorno para producción
ENV NODE_ENV=production

# Copia los archivos de package manager (package.json, yarn.lock, etc.)
COPY package.json yarn.lock* ./
COPY prisma ./prisma/

# Instala las dependencias de producción
RUN yarn install --frozen-lockfile --production=false

# --- Builder ---
FROM base AS builder

# Copia el código de la aplicación
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/prisma ./prisma

COPY . .

# Generar Prisma
RUN npx prisma generate

# Ejecuta el script de build
RUN yarn build

# --- Producción ---
FROM node:24-slim AS runner

WORKDIR /app

# Instalar OpenSSL para Prisma y cron para trabajos programados en la etapa de producción
RUN apt-get update -y && apt-get install -y openssl cron curl

# Configurar zona horaria para Colombia (America/Bogota)
ENV TZ=America/Bogota

# Crear directorio de logs
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Reduce el scope a node_modules de producción
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Crear archivo de cron job para sincronización diaria
RUN echo "0 6 * * * root curl -X GET -H \"Authorization: Bearer \$CRON_SECRET\" http://localhost:3000/api/v1/cron/sync-phidias >> /app/logs/cron.log 2>&1" > /etc/cron.d/phidias-sync

# Configurar permisos del cron job
RUN chmod 0644 /etc/cron.d/phidias-sync
RUN crontab /etc/cron.d/phidias-sync

# Crear archivo de inicio que lance tanto cron como la aplicación
RUN echo '#!/bin/bash\n\
    # Iniciar el servicio cron\n\
    service cron start\n\
    \n\
    # Crear logs iniciales\n\
    touch /app/logs/cron.log\n\
    touch /app/logs/app.log\n\
    \n\
    # Ejecutar migraciones y seed\n\
    yarn run prisma:migrate\n\
    yarn run seed\n\
    \n\
    # Iniciar la aplicación Next.js\n\
    yarn run start' > /app/start.sh

RUN chmod +x /app/start.sh

# Establece variables de entorno
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

# Expone el puerto en el que corre Next.js
EXPOSE 3000

# Script de inicio para cron y aplicación
CMD ["/app/start.sh"]

