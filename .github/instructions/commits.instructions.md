---
applyTo: '**'
---
# Guía de Conventional Commits para Student Tracking

## Estructura del mensaje de commit

Todos los commits en este proyecto deben seguir la especificación de Conventional Commits 1.0.0:

```
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[pie(s) opcional(es)]
```

## Elementos estructurales

- **tipo**: Define la naturaleza del cambio (obligatorio)
- **ámbito**: Indica la sección del proyecto que se modifica (opcional)
- **descripción**: Resumen corto del cambio (obligatorio)
- **cuerpo**: Explicación detallada del cambio (opcional)
- **pie**: Metadatos adicionales como referencias a issues (opcional)

## Tipos de commit principales

- **fix**: Corrección de un error (corresponde a PATCH en versionado semántico)
- **feat**: Nueva funcionalidad (corresponde a MINOR en versionado semántico)
- **BREAKING CHANGE**: Cambio que rompe compatibilidad (corresponde a MAJOR)

## Tipos adicionales recomendados

- **docs**: Cambios en la documentación
- **style**: Cambios que no afectan el significado del código (formato, espacios en blanco)
- **refactor**: Cambios en el código que no corrigen errores ni añaden funcionalidades
- **perf**: Cambios que mejoran el rendimiento
- **test**: Adición o corrección de pruebas
- **build**: Cambios en el sistema de build o dependencias externas
- **ci**: Cambios en archivos de configuración de CI/CD
- **chore**: Tareas rutinarias que no modifican código productivo

## Ámbitos sugeridos para este proyecto

Algunos ámbitos recomendados para Student Tracking:
- **api**: Cambios en endpoints de API
- **auth**: Autenticación y autorización
- **ui**: Componentes de interfaz de usuario
- **db**: Esquema de base de datos y migraciones
- **students**: Funcionalidad relacionada a estudiantes
- **dashboard**: Funcionalidad del panel de control
- **reports**: Sistema de reportes
- **csv**: Importación/exportación de archivos CSV

## Ejemplos específicos para Student Tracking

### Commit con corrección de error
```
fix(auth): corregir problema de validación en inicio de sesión
```

### Commit con nueva funcionalidad y ámbito
```
feat(dashboard): añadir filtro por año académico
```

### Commit con cambio importante
```
feat(db)!: cambiar estructura de la tabla de estudiantes

BREAKING CHANGE: La tabla students ahora requiere el campo schoolYear
```

## Recomendaciones adicionales

1. **Mensajes en español**: Escribe mensajes de commit en español para mantener consistencia
2. **Descripción imperativa**: Usa el modo imperativo en la descripción ("añadir" en lugar de "añadido")
3. **Longitud**: Mantén la primera línea (tipo+ámbito+descripción) por debajo de 72 caracteres
4. **Referencias**: Incluye siempre referencias a issues o tickets cuando sea aplicable
5. **Explicación**: Para cambios complejos, usa el cuerpo del commit para explicar el "por qué" del cambio
