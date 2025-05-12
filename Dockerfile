# Utiliza una imagen oficial de Node.js como base
FROM node:24-slim AS base

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# --- Dependencias ---
FROM base AS dependencies

# Agregar variable de entorno para producción
ENV NODE_ENV=production

# Copia los archivos de package manager (package.json, yarn.lock, etc.)
COPY package.json yarn.lock* ./

# Instala las dependencias de producción
RUN yarn install --frozen-lockfile --production=false

# --- Builder ---
FROM base AS builder

# Copia el código de la aplicación
COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

# Generar Prisma
RUN yarn run prisma:generate
RUN npx prisma generate

# Ejecuta el script de build
RUN yarn build

# --- Producción ---
FROM node:24-slim AS runner

WORKDIR /app

# Instalar herramientas necesarias para crontab y PostgreSQL
RUN apt-get update && apt-get install -y cron tzdata curl procps postgresql-client && rm -rf /var/lib/apt/lists/*

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
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src

# Agregar el script de sincronización al crontab
RUN echo "0 6 * * * cd /app && yarn run sync >> /app/logs/cron.log 2>&1" > /etc/cron.d/app-cron
RUN chmod 0644 /etc/cron.d/app-cron
RUN crontab /etc/cron.d/app-cron

# Establece variables de entorno
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

# Expone el puerto en el que corre Next.js
EXPOSE 3000

# Script de inicio para cron y aplicación
COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
