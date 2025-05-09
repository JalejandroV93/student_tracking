#!/bin/sh
set -e

# Iniciar el servicio de cron en segundo plano
echo "Iniciando servicio de cron..."
crond -b -l 8

# Iniciar la aplicación Next.js
echo "Iniciando la aplicación..."
npm run build
npm run start 