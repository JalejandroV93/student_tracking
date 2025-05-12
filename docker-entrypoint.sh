#!/bin/sh
set -e

# Crear directorio de logs si no existe
mkdir -p /app/logs
touch /app/logs/cron.log

# Iniciar el servicio de cron en segundo plano
echo "Iniciando servicio de cron..."
service cron start

# Verificar que cron esté funcionando
echo "Verificando servicio de cron:"
ps aux | grep cron

# Esperar a que la base de datos esté disponible
echo "Esperando a que la base de datos esté disponible..."
while ! pg_isready -h db -U postgres; do
  echo "PostgreSQL no está disponible aún - esperando..."
  sleep 1
done
echo "Base de datos lista"

# Ejecutar migraciones de Prisma
echo "Ejecutando migraciones de Prisma..."
yarn run prisma:migrate

# Iniciar la aplicación Next.js
echo "Iniciando la aplicación..."
yarn run start 