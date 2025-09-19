# Sistema de Seguimiento de Estudiantes

## 📚 Descripción del Proyecto

El **Sistema de Seguimiento de Estudiantes** es una aplicación web integral diseñada para instituciones educativas que necesitan gestionar y monitorear de manera efectiva el comportamiento disciplinario y el rendimiento académico de sus estudiantes.

### 🎯 Propósito

Esta aplicación surge para resolver la necesidad de las instituciones educativas de:

- **Centralizar el registro de faltas disciplinarias** de manera sistemática y organizada
- **Automatizar el seguimiento de casos** que requieren intervención psicológica o administrativa
- **Generar alertas tempranas** para identificar estudiantes que necesitan atención especial
- **Facilitar la comunicación** entre coordinadores, profesores, psicólogos y directivos
- **Mantener un historial completo** del comportamiento estudiantil a lo largo de los años académicos
- **Cumplir con protocolos disciplinarios** de manera consistente y documentada

### 🏫 Casos de Uso

#### Para Coordinadores Académicos

- Visualizar el estado disciplinario de todas las secciones bajo su responsabilidad
- Identificar patrones de comportamiento problemático en grupos específicos
- Generar reportes para toma de decisiones administrativas

#### Para Profesores y Directores de Grupo

- Registrar faltas disciplinarias de manera rápida y estructurada
- Consultar el historial completo de un estudiante antes de aplicar medidas
- Hacer seguimiento a acuerdos y compromisos establecidos con estudiantes

#### Para el Departamento de Psicología

- Acceder a casos que requieren seguimiento psicológico (Faltas Tipo II)
- Documentar intervenciones y seguimientos realizados
- Identificar estudiantes que necesitan apoyo continuo

#### Para Directivos

- Obtener métricas y estadísticas del comportamiento estudiantil
- Monitorear la efectividad de las medidas disciplinarias aplicadas
- Acceder a dashboards ejecutivos con indicadores clave

### 🔄 Flujo de Trabajo Típico

1. **Registro de Incidentes**: Los profesores registran faltas disciplinarias clasificándolas por tipo y gravedad
2. **Evaluación Automática**: El sistema evalúa automáticamente si se superan umbrales de alerta
3. **Asignación de Casos**: Las faltas Tipo II se convierten automáticamente en casos para seguimiento
4. **Seguimiento Programado**: El sistema programa y rastrea los seguimientos requeridos
5. **Alertas y Notificaciones**: Se generan alertas cuando se acumulan faltas o se atrasan seguimientos
6. **Reportes y Analytics**: Los coordinadores acceden a dashboards con métricas y tendencias

## ⚙️ Ejecución con Docker

Este proyecto está configurado para ser ejecutado en un entorno Docker, lo que facilita su implementación y consistencia en diferentes ambientes.

### Requisitos Previos

- Docker y Docker Compose instalados
- Variables de entorno configuradas

### Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
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

- <http://localhost:3002>

### Sincronización Automática con Phidias

La aplicación está configurada para sincronizarse automáticamente con el sistema Phidias todos los días:

- **Horario**: 6:00 AM UTC (1:00 AM Colombia)
- **Sistemas de respaldo**: Vercel Cron Jobs, GitHub Actions, y Docker cron
- **Endpoint**: `/api/v1/cron/sync-phidias`

#### Configuración Requerida

```env
# Variables adicionales necesarias para Phidias
PHIDIAS_BASE_URL=https://liceotaller.phidias.co
PHIDIAS_API_TOKEN=tu-token-de-phidias
CRON_SECRET=tu-secreto-para-cron-jobs
```

#### Ejecución Manual de Sincronización

```bash
# Probar sincronización en desarrollo
npm run test:cron local

# Ejecutar sincronización manual desde la UI
# Ve a Dashboard → Configuración → Sincronización con Phidias
```

Para más detalles, consulta la [documentación completa de sincronización automática](docs/automated-sync-setup.md).

### Verificar Logs de Sincronización

Los logs de sincronización se almacenan en la carpeta `logs/`:

```bash
# Ver los logs de sincronización del día
docker-compose exec app cat /app/logs/sync-$(date +%Y-%m-%d).log

# Ver los logs del cron
docker-compose exec app cat /app/logs/cron.log
```

### Solución de problemas

Si necesitas verificar que el cron está configurado correctamente:

```bash
# Ver tareas de cron configuradas
docker-compose exec app cat /etc/crontabs/root

# Verificar procesos en ejecución (incluido crond)
docker-compose exec app ps -ef
```

## Estructura del Proyecto

```txt
student_tracking/
├── src/
│   ├── app/                 # Rutas de Next.js
│   │   ├── api/            # Endpoints de API
│   │   ├── dashboard/      # Páginas del dashboard
│   │   └── access/         # Páginas de acceso
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes de UI (shadcn/ui)
│   │   ├── auth/          # Componentes de autenticación
│   │   ├── dashboard/     # Componentes del dashboard
│   │   └── students/      # Componentes de estudiantes
│   ├── lib/               # Utilidades y configuraciones
│   ├── hooks/             # Hooks personalizados
│   ├── stores/            # Estado global (Zustand)
│   ├── types/             # Definiciones de tipos TypeScript
│   └── providers/         # Context providers
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   ├── seed.ts           # Datos de semilla
│   └── migrations/       # Migraciones de base de datos
├── public/               # Archivos estáticos
├── scripts/              # Scripts utilitarios
├── docs/                 # Documentación adicional
└── docker-compose.yml    # Configuración de Docker
```

## Tecnologías Utilizadas

### Frontend

- **Next.js 15**: Framework React para aplicaciones web
- **React 19**: Biblioteca para construcción de interfaces de usuario
- **TypeScript**: Superset de JavaScript con tipado estático
- **Tailwind CSS**: Framework CSS utilitario
- **Radix UI**: Componentes primitivos para UI accesibles
- **Framer Motion**: Biblioteca para animaciones
- **Recharts**: Biblioteca para gráficos y visualizaciones

### Backend

- **Next.js API Routes**: API REST integrada
- **Prisma**: ORM para base de datos
- **PostgreSQL**: Base de datos relacional
- **bcrypt**: Encriptación de contraseñas
- **JOSE**: Manejo de tokens JWT

### Integraciones

- **Supabase**: Plataforma para sincronización de datos
- **Phidias**: Sistema externo para seguimiento académico
- **Google AI SDK**: Integración con IA para funcionalidades avanzadas

### DevOps

- **Docker**: Contenedorización de la aplicación
- **Docker Compose**: Orquestación de servicios
- **ESLint**: Linting de código
- **TypeScript**: Compilación y verificación de tipos

## 🗄️ Arquitectura de la Base de Datos

El sistema utiliza PostgreSQL con Prisma como ORM. La base de datos está optimizada para manejar grandes volúmenes de datos educativos con índices estratégicos y relaciones bien definidas.

### Modelos Principales

#### Estudiantes

- **Campos principales**: ID único, código institucional, nombre completo, grado, sección
- **Relaciones**: Conectado con faltas, años escolares
- **Índices**: Por código, grado, sección para búsquedas rápidas
- **Características especiales**: Soporte para fotos desde Phidias

#### Faltas (Sistema Disciplinario)

- **Identificación única**: Hash para evitar duplicados
- **Clasificación**: Tipo I, II, III con diferente tratamiento
- **Metadatos**: Fecha, autor, descripción detallada, acciones reparadoras
- **Estados**: Atendida/Pendiente con timestamps
- **Observaciones**: Sistema de comentarios y seguimiento
- **Índices optimizados**: Por estudiante, fecha, tipo, para reportes rápidos

#### Casos y Seguimientos

- **Generación automática**: Casos creados para faltas Tipo II
- **Seguimientos programados**: 3 seguimientos obligatorios por caso
- **Estados de caso**: Abierto, en proceso, cerrado
- **Historial completo**: Todas las intervenciones documentadas
- **Fechas calculadas**: Sistema automático de programación

#### Sistema de Usuarios y Permisos

- **Autenticación segura**: Hash de contraseñas con bcrypt
- **Roles granulares**: 9 tipos de usuario con permisos específicos
- **Áreas de acceso**: Control por secciones académicas
- **Auditoría**: Registro de logins y actividad
- **Bloqueo de seguridad**: Protección contra ataques de fuerza bruta

#### Configuración y Metadatos

- **Años Escolares**: Gestión de períodos académicos con trimestres
- **Configuración de Alertas**: Umbrales personalizables por sección
- **Sincronización**: Metadatos de sincronización con sistemas externos
- **Logs de auditoría**: Historial completo de operaciones críticas

### Optimizaciones de Rendimiento

- **Índices estratégicos** en campos de búsqueda frecuente
- **Paginación nativa** para listados grandes
- **Consultas optimizadas** con includes selectivos
- **Cacheo de consultas** frecuentes
- **Transacciones** para operaciones críticas

## Características Principales

### 👥 Gestión Integral de Estudiantes

- **Registro completo** con información personal, grado, sección y año académico
- **Importación masiva** desde archivos CSV
- **Sincronización automática** con sistemas externos (Phidias, Supabase)
- **Búsqueda avanzada** con filtros por múltiples criterios
- **Paginación optimizada** para manejar grandes volúmenes de datos

### 📝 Sistema de Faltas Disciplinarias

- **Clasificación por tipos**:
  - **Tipo I (Leves)**: Llamados de atención menores
  - **Tipo II (Moderadas)**: Requieren seguimiento psicológico (3 seguimientos obligatorios)
  - **Tipo III (Graves)**: Faltas severas que requieren intervención inmediata
- **Registro detallado** con descripción, fecha, autor y acciones reparadoras
- **Estados de atención** (pendiente/atendida) con timestamps
- **Observaciones** y comentarios de seguimiento

### 📊 Dashboard Interactivo y Analytics

- **Métricas en tiempo real**: contadores de estudiantes, faltas por tipo, casos activos
- **Gráficos de tendencias**: evolución mensual de faltas disciplinarias
- **Vista por secciones**: estadísticas específicas por nivel académico (preescolar, primaria, secundaria, bachillerato)
- **Indicadores de rendimiento**: tasas de atención, progreso de seguimientos
- **Filtros dinámicos**: por trimestre, año académico, sección

### 🚨 Sistema de Alertas Inteligentes

- **Configuración de umbrales** personalizables por sección
- **Alertas automáticas** cuando se superan límites de faltas Tipo I
- **Niveles de alerta**: primaria (amarillo) y secundaria (rojo)
- **Notificaciones visuales** en dashboard y listados
- **Identificación temprana** de estudiantes en riesgo

### 🗂️ Gestión de Casos y Seguimientos

- **Casos automáticos** para faltas Tipo II
- **Seguimientos programados**: 3 seguimientos obligatorios por caso
- **Estados de caso**: abierto, en proceso, cerrado
- **Fechas esperadas** calculadas automáticamente
- **Historial completo** de intervenciones y observaciones
- **Asignación por roles** (coordinadores, psicólogos)

### 🔐 Control de Acceso y Roles

- **Sistema de autenticación** con JWT tokens
- **Roles granulares**:
  - **ADMIN**: Acceso completo
  - **Coordinadores por nivel**: PRESCHOOL_COORDINATOR, ELEMENTARY_COORDINATOR, etc.
  - **PSYCHOLOGY**: Acceso a casos y seguimientos
  - **TEACHER**: Gestión de grupos específicos
  - **USER/STUDENT**: Acceso limitado
- **Permisos por áreas**: control de acceso a secciones específicas
- **Middleware de autorización** en todas las rutas

### 🤖 Asistente Virtual con IA

- **Chatbot educativo** integrado con Google AI
- **Análisis de perfil** del estudiante
- **Recomendaciones personalizadas** basadas en historial
- **Estrategias de intervención** sugeridas
- **Protocolo disciplinario** automatizado

### 📱 Interfaz Moderna y Responsive

- **Diseño adaptativo** para dispositivos móviles y desktop
- **Componentes accesibles** con Radix UI
- **Tema oscuro/claro** configurable
- **Animaciones fluidas** con Framer Motion
- **Búsqueda instantánea** con filtros en tiempo real
- **Skeleton loaders** para mejor UX

### 📈 Reportes y Exportación

- **Exportación a CSV** de datos filtrados
- **Reportes por período** (trimestre, año académico)
- **Estadísticas por docente** y coordinador
- **Métricas de seguimiento** y efectividad
- **Dashboards ejecutivos** para directivos

### 🔄 Sincronización y API

- **API REST completa** con endpoints documentados
- **Sincronización bidireccional** con Phidias
- **Backup automático** a Supabase
- **Programación de tareas** con cron jobs
- **Logs detallados** de sincronización
- **Recuperación de errores** automática

## 📋 Prerrequisitos

- Node.js 18+ y npm/yarn
- Docker y Docker Compose (para ejecución con contenedores)
- Git (para clonar el repositorio)
- PostgreSQL (opcional, si no se usa Docker)

## 🚀 Instalación y Configuración

### Instalación Local (Desarrollo)

1. **Clona el repositorio:**

```bash
git clone <url-del-repositorio>
cd student_tracking
```

1. **Instala dependencias:**

```bash
npm install
# o
yarn install
```

1. **Configura variables de entorno:**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos local
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/student_tracking

# Autenticación
AUTH_SECRET=tu-secreto-muy-seguro-aqui

# Supabase (para sincronización)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-de-api-supabase

# Phidias (opcional)
PHIDIAS_API_URL=https://api.phidias.com
PHIDIAS_API_KEY=tu-clave-phidias

# Google AI (para chatbot)
GOOGLE_GENERATIVE_AI_API_KEY=tu-clave-google-ai

# Configuración adicional
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

1. **Configura la base de datos:**

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar base de datos con datos iniciales
npm run seed
```

1. **Ejecuta el servidor de desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en <http://localhost:3000>.

## Comandos Útiles

### Desarrollo

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir aplicación para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint
```

### Base de Datos

```bash
npx prisma studio           # Abrir Prisma Studio
npx prisma generate         # Generar cliente Prisma
npx prisma migrate dev      # Ejecutar migraciones en desarrollo
npx prisma migrate deploy   # Ejecutar migraciones en producción
npm run seed               # Ejecutar seed de datos
```

### Docker

```bash
docker-compose up -d        # Iniciar contenedores
docker-compose down         # Detener contenedores
docker-compose logs -f app  # Ver logs de la aplicación
docker-compose exec app sh  # Acceder al shell del contenedor
```

### Sincronización

```bash
npm run sync               # Sincronización manual
```

## API Endpoints

La aplicación expone una API REST en `/api/v1/` con los siguientes endpoints principales:

- `/api/v1/auth/*` - Autenticación
- `/api/v1/students/*` - Gestión de estudiantes
- `/api/v1/faltas/*` - Gestión de faltas
- `/api/v1/case-management/*` - Gestión de casos
- `/api/v1/dashboard/*` - Datos del dashboard
- `/api/v1/phidias/*` - Integración con Phidias
- `/api/v1/users/*` - Gestión de usuarios
- `/api/v1/alerts/*` - Sistema de alertas

## Roles y Permisos

El sistema incluye los siguientes roles con permisos específicos:

- **ADMIN**: Acceso completo a todas las funcionalidades
- **PRESCHOOL_COORDINATOR**: Gestión de preescolar
- **ELEMENTARY_COORDINATOR**: Gestión de primaria
- **MIDDLE_SCHOOL_COORDINATOR**: Gestión de secundaria
- **HIGH_SCHOOL_COORDINATOR**: Gestión de bachillerato
- **PSYCHOLOGY**: Acceso a casos y seguimientos
- **TEACHER**: Gestión de estudiantes en grupos asignados
- **STUDENT**: Acceso limitado a información personal
- **USER**: Acceso básico de solo lectura

## Solución de Problemas

### Problemas Comunes

1. **Error de conexión a la base de datos**
   - Verifica que PostgreSQL esté ejecutándose
   - Revisa las variables de entorno en `.env`
   - Ejecuta `npx prisma migrate deploy`

2. **Error de sincronización con Supabase**
   - Verifica las credenciales de Supabase
   - Revisa los logs en `/logs/sync-*.log`
   - Ejecuta sincronización manual: `npm run sync`

3. **Problemas con Docker**
   - Limpia contenedores: `docker-compose down -v`
   - Reconstruye: `docker-compose up --build`
   - Verifica logs: `docker-compose logs`

4. **Errores de permisos**
   - Verifica que el usuario tenga el rol correcto
   - Revisa las configuraciones de áreas en la base de datos

### Logs y Debugging

Los logs se almacenan en la carpeta `logs/`:

- `sync-YYYY-MM-DD.log`: Logs de sincronización
- `cron.log`: Logs del programador de tareas

Para debugging adicional:

```bash
# Ver logs de la aplicación
docker-compose logs -f app

# Acceder al contenedor
docker-compose exec app sh

# Ver procesos en ejecución
docker-compose exec app ps aux
```

## Desarrollo y Contribución

### Configuración del Entorno de Desarrollo

1. Instala dependencias: `npm install`
2. Configura pre-commit hooks: `npm run prepare`
3. Ejecuta migraciones: `npx prisma migrate dev`
4. Ejecuta seed: `npm run seed`

### Guías de Desarrollo

- Sigue las convenciones de commits: [Conventional Commits](https://conventionalcommits.org/)
- Usa TypeScript para todo el código nuevo
- Mantén la cobertura de tests
- Documenta nuevas funcionalidades

### Testing

```bash
npm run test        # Ejecutar tests
npm run test:watch  # Tests en modo watch
npm run test:cov    # Tests con cobertura
```

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas:

- Crea un issue en el repositorio
- Contacta al equipo de desarrollo
- Revisa la documentación en `/docs/`

## 🙏 Agradecimientos

- Equipo de desarrollo del colegio
- Comunidad de Next.js y Prisma
- Contribuidores de código abierto

---

### Desarrollado con ❤️ para transformar la gestión educativa

> Este sistema está diseñado para ayudar a las instituciones educativas a mantener un ambiente de aprendizaje positivo y seguro, facilitando el seguimiento del comportamiento estudiantil de manera justa, transparente y efectiva.
