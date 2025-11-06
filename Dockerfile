# Etapa base
FROM node:24-alpine AS base
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- Dependencias ---
FROM base AS dependencies

# Copiar archivos de configuración del package manager
COPY package.json pnpm-lock.yaml ./

# Copiar el schema de Prisma ANTES de instalar dependencias
COPY prisma ./prisma

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN pnpm install --frozen-lockfile

# --- Builder ---
FROM base AS builder

# Copiar node_modules desde la etapa de dependencias
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/prisma ./prisma

# Copiar todo el código fuente
# Copiar todo el código fuente
COPY . .

# Deshabilitar la telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Ejecutar el build
RUN pnpm build

# --- Producción ---
FROM base AS runner

WORKDIR /app

# Configurar usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma


# Cambiar al usuario no-root
USER nextjs

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]


