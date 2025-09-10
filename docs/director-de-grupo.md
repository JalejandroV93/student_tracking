# Rol de Director de Grupo

## Descripción

El nuevo rol de **Director de Grupo** permite asignar permisos específicos de área a usuarios que pueden gestionar múltiples secciones educativas. A diferencia de los coordinadores que tienen acceso a una sola área específica, los Directores de Grupo pueden tener acceso a combinaciones personalizadas de áreas.

## Características principales

- **Permisos flexibles**: Los Directores de Grupo pueden tener acceso a cualquier combinación de áreas educativas (Preescolar, Primaria, Secundaria, Bachillerato).
- **Filtrado de alertas**: Solo ven alertas de estudiantes en las áreas para las que tienen permisos.
- **Gestión granular**: Los permisos se manejan a través de la tabla `AreaPermissions` en la base de datos.

## Configuración

### 1. Crear un usuario Director de Grupo

```sql
-- Ejemplo: Crear un nuevo usuario con rol GROUP_DIRECTOR
INSERT INTO "User" (
  id, 
  username, 
  document, 
  "fullName", 
  email, 
  role, 
  password, 
  "createdAt", 
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'director.grupo',
  '12345678',
  'Director de Grupo Ejemplo',
  'director@colegio.edu',
  'GROUP_DIRECTOR',
  '$2a$10$hashedpasswordhere',
  NOW(),
  NOW()
);
```

### 2. Asignar permisos de área

Usar la función utilitaria `assignAreaPermissionsToGroupDirector` para asignar áreas:

```typescript
import { assignAreaPermissionsToGroupDirector } from '@/lib/group-director-utils';

// Asignar acceso a Secundaria y Bachillerato
await assignAreaPermissionsToGroupDirector({
  userId: 'user-id-del-director',
  areaCodes: ['MIDDLE', 'HIGH']
});
```

### 3. Verificar permisos actuales

```typescript
import { getGroupDirectorPermissions } from '@/lib/group-director-utils';

const permissions = await getGroupDirectorPermissions();
console.log(permissions);
```

## Áreas disponibles

- **PRESCHOOL**: Preescolar
- **ELEMENTARY**: Primaria  
- **MIDDLE**: Secundaria
- **HIGH**: Bachillerato

## Funcionamiento técnico

### Middleware
El middleware permite el acceso a rutas específicas de área para usuarios GROUP_DIRECTOR. La verificación de permisos específicos se realiza en el nivel de API.

### API de Alertas
La API `/api/v1/alerts` ahora:
1. Autentica al usuario actual
2. Determina los permisos de área según el rol:
   - **ADMIN/PSYCHOLOGY**: Acceso a todas las áreas
   - **Coordinadores específicos**: Acceso a su área asignada
   - **GROUP_DIRECTOR**: Acceso según permisos en AreaPermissions
3. Filtra las alertas para mostrar solo estudiantes de áreas permitidas

### Base de datos
Los permisos se almacenan en la tabla `AreaPermissions`:
```sql
-- Estructura de la tabla
AreaPermissions {
  id: Int (PK)
  userId: String (FK -> User.id)
  areaId: Int (FK -> Area.id)
  canView: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Ejemplos de uso

### Escenario 1: Director de Secundaria y Bachillerato
Un director responsable de la coordinación entre secundaria y bachillerato:
```typescript
await assignAreaPermissionsToGroupDirector({
  userId: 'director-sb-001',
  areaCodes: ['MIDDLE', 'HIGH']
});
```

### Escenario 2: Director de Primaria completa
Un director responsable de preescolar y primaria:
```typescript
await assignAreaPermissionsToGroupDirector({
  userId: 'director-pp-001', 
  areaCodes: ['PRESCHOOL', 'ELEMENTARY']
});
```

### Escenario 3: Director General de Área
Un director con responsabilidades específicas en múltiples áreas:
```typescript
await assignAreaPermissionsToGroupDirector({
  userId: 'director-general-001',
  areaCodes: ['ELEMENTARY', 'MIDDLE', 'HIGH']
});
```

## Diferencias con otros roles

| Rol | Áreas de acceso | Método de asignación |
|-----|----------------|---------------------|
| ADMIN | Todas | Hardcodeado |
| PSYCHOLOGY | Todas | Hardcodeado |
| PRESCHOOL_COORDINATOR | Solo Preescolar | Hardcodeado |
| ELEMENTARY_COORDINATOR | Solo Primaria | Hardcodeado |
| MIDDLE_SCHOOL_COORDINATOR | Solo Secundaria | Hardcodeado |
| HIGH_SCHOOL_COORDINATOR | Solo Bachillerato | Hardcodeado |
| **GROUP_DIRECTOR** | **Configurable** | **AreaPermissions** |

## Notas importantes

1. **Migración de datos**: Los usuarios existentes no se ven afectados.
2. **Compatibilidad**: El sistema mantiene compatibilidad total con roles existentes.
3. **Seguridad**: Los permisos se verifican tanto en middleware como en API.
4. **Flexibilidad**: Los permisos pueden modificarse dinámicamente sin cambios de código.

## Mantenimiento

Para cambiar los permisos de un Director de Grupo, simplemente vuelva a llamar a `assignAreaPermissionsToGroupDirector` con las nuevas áreas. La función eliminará automáticamente los permisos anteriores y creará los nuevos.