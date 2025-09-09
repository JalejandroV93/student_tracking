# Utiliza una imagen oficial de Node.js como base
FROM node:24-slim AS base

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalar OpenSSL para Prisma
RUN apt-get update -y && apt-get install -y openssl

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

# Instalar OpenSSL para Prisma en la etapa de producción
RUN apt-get update -y && apt-get install -y openssl


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



# Establece variables de entorno
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

# Expone el puerto en el que corre Next.js
EXPOSE 3000

# Script de inicio para cron y aplicación
CMD ["sh", "-c", "yarn run prisma:migrate && yarn run seed && yarn run start"]

