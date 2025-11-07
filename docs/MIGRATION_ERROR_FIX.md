# Solución al Error de Migración en Producción

## Error Encontrado

```text
ERROR: column "gradeId" of relation "Estudiantes" already exists
```

La migración `20251105195520_add_log_system` falló porque intenta agregar una columna que ya existe en la base de datos.

## Causa

- La base de datos de producción tiene la columna `gradeId` en la tabla `Estudiantes`
- La migración intenta crearla nuevamente
- Prisma marca la migración como fallida y bloquea futuras migraciones

## Soluciones

### Opción 1: Marcar la migración como resuelta (RECOMENDADO)

Si la columna ya existe y el esquema está correcto, simplemente marca la migración como aplicada:

```bash
# Conectarse al contenedor
docker exec -it <nombre-contenedor> sh

# Marcar la migración como resuelta
npx prisma migrate resolve --applied 20251105195520_add_log_system

# Intentar aplicar migraciones pendientes
npx prisma migrate deploy
```

### Opción 2: Aplicar SQL idempotente manualmente

Si necesitas asegurar que todos los objetos estén creados correctamente:

```bash
# 1. Conectarse a la base de datos PostgreSQL
docker exec -it <nombre-contenedor-db> psql -U <usuario> -d student_tracking

# 2. Ejecutar el SQL corregido desde migration_fixed.sql
\i /path/to/migration_fixed.sql

# 3. Salir de psql
\q

# 4. Marcar la migración como resuelta
docker exec -it <nombre-contenedor-app> npx prisma migrate resolve --applied 20251105195520_add_log_system

# 5. Continuar con migraciones
docker exec -it <nombre-contenedor-app> npx prisma migrate deploy
```

### Opción 3: Reset completo (SOLO para desarrollo/staging)

⚠️ **ADVERTENCIA: Esto eliminará todos los datos**

```bash
# Eliminar la base de datos y recrearla
docker exec -it <nombre-contenedor> npx prisma migrate reset --force
```

## Verificación Post-Solución

```bash
# Verificar estado de migraciones
npx prisma migrate status

# Generar cliente de Prisma
npx prisma generate

# Verificar que la aplicación inicia correctamente
npm start
```

## Prevención Futura

Para evitar este problema en el futuro:

1. **Usar migraciones idempotentes**: Modificar las migraciones para que verifiquen la existencia antes de crear objetos
2. **Mantener sincronización**: Asegurar que desarrollo, staging y producción usen el mismo historial de migraciones
3. **No modificar migraciones aplicadas**: Una vez aplicada en producción, nunca modificar una migración
4. **Usar prisma migrate deploy en producción**: No usar `prisma migrate dev` en ambientes productivos

## Comandos de Diagnóstico

```bash
# Ver estado de migraciones
npx prisma migrate status

# Ver migraciones fallidas en la base de datos
docker exec -it <db-container> psql -U <user> -d student_tracking -c \
  "SELECT * FROM _prisma_migrations WHERE finished_at IS NULL OR logs LIKE '%ERROR%';"

# Verificar si la columna existe
docker exec -it <db-container> psql -U <user> -d student_tracking -c \
  "SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'Estudiantes' AND column_name = 'gradeId';"
```

## Archivos Relevantes

- **Migración fallida**: `prisma/migrations/20251105195520_add_log_system/migration.sql`
- **Migración corregida**: `prisma/migrations/20251105195520_add_log_system/migration_fixed.sql`
- **Schema actual**: `prisma/schema.prisma`
