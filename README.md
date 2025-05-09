# Sistema de Seguimiento de Estudiantes

## Ejecución con Docker

Este proyecto está configurado para ser ejecutado en un entorno Docker, lo que facilita su implementación y consistencia en diferentes ambientes.

### Requisitos Previos

- Docker y Docker Compose instalados
- Variables de entorno configuradas

### Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@db:5432/student_tracking

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-de-api

# Seguridad
AUTH_SECRET=tu-secreto-para-auth
```

### Iniciar la Aplicación

```bash
# Construir e iniciar los contenedores
docker-compose up -d

# Ver logs de la aplicación
docker-compose logs -f app
```

La aplicación estará disponible en:
- http://localhost:3002

### Sincronización con Supabase

La aplicación está configurada para sincronizar automáticamente los datos desde Supabase a la base de datos local PostgreSQL todos los días a las 6:00 AM (hora de Colombia).

Si necesitas ejecutar la sincronización manualmente:

```bash
docker-compose exec app npm run sync
```

### Verificar Logs de Sincronización

Los logs de sincronización se almacenan en la carpeta `logs/`:

```bash
# Ver los logs más recientes
docker-compose exec app cat /app/logs/sync-$(date +%Y-%m-%d).log
```

## Estructura del Proyecto

- `/src` - Código fuente de la aplicación
- `/prisma` - Esquema de base de datos y migraciones
- `/scripts` - Scripts utilitarios como la sincronización
- `/logs` - Logs de la aplicación y sincronización

## Información Adicional

La aplicación utiliza:
- Next.js para el frontend y backend
- Prisma como ORM para la base de datos
- PostgreSQL como base de datos local
- Supabase como fuente de datos remota

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
components.json, eslint.config.mjs, next.config.ts, postcss.config.mjs, tsconfig.json, prisma/migrations/, src/components/ui/
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
