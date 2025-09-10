# Director de Grupo - Implementación Completa

## Resumen

Se ha implementado exitosamente el rol **Director de Grupo** que permite permisos flexibles por área y filtrado de alertas basado en permisos. Esta implementación asegura que los usuarios solo vean alertas de estudiantes en las áreas educativas para las que tienen autorización.

## 🎯 Problema Resuelto

- **Antes**: Todos los usuarios veían todas las alertas sin importar sus permisos de área
- **Antes**: Los coordinadores estaban hardcodeados a áreas específicas
- **Antes**: No existía un rol flexible para directores que gestionan múltiples áreas

## ✅ Solución Implementada

### 1. Nuevo Rol GROUP_DIRECTOR
- ✅ Agregado `GROUP_DIRECTOR` al enum Role de Prisma
- ✅ Permisos flexibles mediante la tabla `AreaPermissions`
- ✅ Permite gestionar cualquier combinación de áreas educativas

### 2. Filtrado de Alertas por Permisos
- ✅ API de alertas modificada (`/api/v1/alerts/route.ts`) para autenticar usuarios
- ✅ Filtrado basado en permisos de área:
  - **ADMIN/PSYCHOLOGY**: Todas las áreas
  - **Coordinadores específicos**: Su área designada únicamente
  - **GROUP_DIRECTOR**: Áreas asignadas vía AreaPermissions

### 3. Integración UI Completa
- ✅ Opción GROUP_DIRECTOR en selector de roles
- ✅ Nombres de visualización y colores de badge actualizados
- ✅ Interfaz de permisos por área funciona automáticamente

## 🚀 Configuración Rápida

### Paso 1: Preparar Base de Datos
```bash
# Crear y poblar la base de datos
npm run seed

# Configurar usuarios GROUP_DIRECTOR de ejemplo
npm run setup:group-directors
```

### Paso 2: Iniciar Aplicación
```bash
npm run dev
```

### Paso 3: Probar Funcionalidad
1. Login como admin (usuario: `admin`, contraseña: `admin123`)
2. Ir a Settings > Users para ver los usuarios GROUP_DIRECTOR creados
3. Login como cualquier GROUP_DIRECTOR para probar el filtrado
4. Navegar a Alerts para verificar que solo se muestran alertas de las áreas asignadas

## 👥 Usuarios de Prueba Creados

El script `setup:group-directors` crea automáticamente estos usuarios:

| Usuario | Nombre | Áreas | Descripción |
|---------|---------|--------|-------------|
| `director.middle.high` | Director Secundaria y Bachillerato | MIDDLE + HIGH | Ve alertas de grados 6-11 |
| `director.primary` | Director Educación Primaria | PRESCHOOL + ELEMENTARY | Ve alertas de PK-5 |
| `director.elem.middle` | Director Primaria y Secundaria | ELEMENTARY + MIDDLE | Ve alertas de grados 1-9 |

**Contraseña para todos**: `director123`

## 🔧 Uso Programático

### Crear Usuario GROUP_DIRECTOR
```typescript
// Vía API REST
POST /api/v1/users
{
  "username": "nuevo.director",
  "fullName": "Nuevo Director",
  "email": "director@colegio.edu",
  "password": "password123",
  "role": "GROUP_DIRECTOR",
  "areaPermissions": [
    { "areaId": 3, "canView": true },  // MIDDLE
    { "areaId": 4, "canView": true }   // HIGH
  ]
}
```

### Asignar Permisos con Función Utilitaria
```typescript
import { assignAreaPermissionsToGroupDirector } from '@/lib/group-director-utils';

// Asignar áreas a un director
await assignAreaPermissionsToGroupDirector({
  userId: "user-id-aqui",
  areaCodes: ["MIDDLE", "HIGH"]
});
```

### Verificar Permisos Actuales
```typescript
import { getGroupDirectorPermissions } from '@/lib/group-director-utils';

const permissions = await getGroupDirectorPermissions();
console.log(permissions);
```

## 📊 Mapeo de Áreas y Grados

| Área | Código | Grados Incluidos |
|------|---------|------------------|
| Preescolar | `PRESCHOOL` | PK, K, NURSERY |
| Primaria | `ELEMENTARY` | 1, 2, 3, 4, 5 |
| Secundaria | `MIDDLE` | 6, 7, 8, 9 |
| Bachillerato | `HIGH` | 10, 11 |

## 🧪 Casos de Prueba

### Escenario 1: Director Middle + High
- **Usuario**: `director.middle.high`
- **Áreas**: MIDDLE + HIGH
- **Debe ver**: Estudiantes en grados 6, 7, 8, 9, 10, 11
- **No debe ver**: Estudiantes en grados PK, K, 1, 2, 3, 4, 5

### Escenario 2: Director Preschool + Elementary  
- **Usuario**: `director.primary`
- **Áreas**: PRESCHOOL + ELEMENTARY
- **Debe ver**: Estudiantes en grados PK, K, 1, 2, 3, 4, 5
- **No debe ver**: Estudiantes en grados 6, 7, 8, 9, 10, 11

### Escenario 3: Director Elementary + Middle
- **Usuario**: `director.elem.middle`
- **Áreas**: ELEMENTARY + MIDDLE
- **Debe ver**: Estudiantes en grados 1, 2, 3, 4, 5, 6, 7, 8, 9
- **No debe ver**: Estudiantes en grados PK, K, 10, 11

## 🔍 Verificación y Debugging

### Verificar Áreas en BD
```sql
SELECT * FROM "Area";
```

### Verificar Usuarios GROUP_DIRECTOR
```sql
SELECT id, username, "fullName", role 
FROM "User" 
WHERE role = 'GROUP_DIRECTOR';
```

### Verificar Permisos por Área
```sql
SELECT u.username, u."fullName", a.name as area_name, ap."canView"
FROM "User" u
JOIN "AreaPermissions" ap ON u.id = ap."userId"
JOIN "Area" a ON ap."areaId" = a.id
WHERE u.role = 'GROUP_DIRECTOR';
```

### Probar API de Alertas
```bash
curl -X GET "http://localhost:3000/api/v1/alerts" \
  -H "Cookie: auth_token=your_token_here"
```

## 🐛 Solución de Problemas

### GROUP_DIRECTOR no ve alertas
- ✅ Verificar que existen registros en AreaPermissions para el usuario
- ✅ Confirmar que `canView` está en `true`
- ✅ Verificar que existen infracciones para estudiantes en esas áreas

### GROUP_DIRECTOR ve todas las alertas
- ✅ Revisar la lógica de filtrado en `/api/v1/alerts/route.ts`
- ✅ Verificar que `getUserAreaPermissions()` retorna las áreas correctas
- ✅ Confirmar el mapeo de categorización de secciones

### UI de permisos no aparece
- ✅ Verificar que las áreas están sembradas en la base de datos
- ✅ Confirmar que `/api/v1/areas` retorna datos
- ✅ Verificar que el rol es GROUP_DIRECTOR en UserModal

## 📁 Archivos Modificados

### Base de Datos
- `prisma/schema.prisma` - Agregado rol GROUP_DIRECTOR

### API
- `src/app/api/v1/alerts/route.ts` - Filtrado por permisos implementado
- `src/app/api/v1/users/route.ts` - CRUD completo para usuarios
- `src/app/api/v1/areas/route.ts` - Gestión de áreas

### Middleware y Autenticación
- `src/middleware.ts` - Soporte para GROUP_DIRECTOR
- `src/lib/session.ts` - Funciones de permisos por área

### Componentes UI
- `src/app/dashboard/settings/users/page.tsx` - Gestión de usuarios
- `src/components/settings/UserModal.tsx` - Modal con permisos por área

### Utilidades
- `src/lib/group-director-utils.ts` - Funciones de gestión
- `src/scripts/setup-group-directors.ts` - Script de configuración

### Documentación
- `docs/director-de-grupo.md` - Guía completa de uso

## 🎉 Características Clave

- **✅ Permisos Flexibles**: GROUP_DIRECTOR puede gestionar cualquier combinación de áreas
- **✅ Filtrado Automático**: Las alertas se filtran en tiempo real según permisos
- **✅ Compatibilidad Hacia Atrás**: Sin impacto en roles o funcionalidad existente
- **✅ Interfaz Admin**: Sistema completo para crear y gestionar usuarios GROUP_DIRECTOR
- **✅ Cambios Mínimos**: Modificaciones quirúrgicas que aprovechan infraestructura existente

## 📞 Soporte

Para preguntas o problemas relacionados con la implementación del Director de Grupo:

1. Revisar la documentación completa en `docs/director-de-grupo.md`
2. Ejecutar los scripts de prueba en `/tmp/test-group-director-implementation.ts`
3. Verificar la configuración con `npm run setup:group-directors`

---

**Estado**: ✅ **IMPLEMENTACIÓN COMPLETA Y FUNCIONAL**

La implementación ha sido probada y validada. El sistema ahora soporta completamente el rol de Director de Grupo con filtrado automático de alertas según permisos de área.