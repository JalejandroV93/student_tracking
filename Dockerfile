FROM node:20-alpine

WORKDIR /app

# Instalar herramientas necesarias (busybox-suid en lugar de cron)
RUN apk add --no-cache tzdata curl postgresql-client busybox-suid

# Configurar zona horaria para Colombia (America/Bogota)
ENV TZ=America/Bogota

# Copiar archivos de dependencias
COPY package.json bun.lock ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Agregar el script de sincronización al crontab
RUN echo "0 6 * * * cd /app && npm run sync >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Exponer puerto
EXPOSE 3000

# Script de inicio que inicia tanto la aplicación como el cron
COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
