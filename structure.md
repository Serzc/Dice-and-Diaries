# Arquitectura de Software - Dice and Diaries

## Introducción

Dice and Diaries es una aplicación web orientada a la administración de campañas de Dungeons and Dragons. La arquitectura del sistema busca priorizar:

- Accesibilidad
- Simplicidad
- Bajo costo
- Facilidad de implementación
- Rendimiento suficiente para múltiples usuarios

Debido a que el proyecto corresponde a un entorno universitario, se utilizarán tecnologías modernas gratuitas o con planes gratuitos amplios, evitando infraestructura compleja o herramientas empresariales innecesarias.

---

# Tecnologías principales

| Capa | Tecnología |
|---|---|
| Frontend | React |
| Hosting Frontend | Vercel |
| Backend as a Service | Supabase |
| Base de Datos | PostgreSQL (Supabase) |
| Autenticación | Supabase Auth |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| Control de versiones | Git + GitHub |

---

# Arquitectura general

La aplicación sigue una arquitectura web moderna basada en frontend desacoplado y Backend as a Service (BaaS).

## Flujo general

1. El usuario accede a la aplicación web desde el navegador.
2. React renderiza la interfaz y maneja la navegación.
3. El frontend se comunica directamente con Supabase.
4. Supabase gestiona:
   - autenticación
   - base de datos
   - tiempo real
   - almacenamiento
5. Los cambios importantes (mensajes, sesiones, notas) se sincronizan en tiempo real.

---

# Capas del sistema

# 1. Capa de Presentación (Frontend)

## Tecnología
- React
- React Router
- CSS/Tailwind (opcional)

## Responsabilidades
- Mostrar información al usuario
- Manejar navegación
- Formularios
- Validaciones básicas
- Comunicación con Supabase
- Actualización visual en tiempo real

## Componentes importantes
- Login/Register
- Dashboard
- Campañas
- Chat
- Hojas de personaje
- Notas
- Planificador

## Ventajas
- Desarrollo rápido
- Gran comunidad
- Fácil despliegue
- Compatible con PWA

---

# 2. Capa de Servicios / Backend

## Tecnología
- Supabase

En lugar de crear un backend completo con Express o NestJS, se utilizará Supabase para simplificar la arquitectura.

## Responsabilidades
- Autenticación
- Acceso a base de datos
- Reglas de seguridad
- Sincronización realtime
- Storage de archivos

## Servicios utilizados

### Supabase Auth
Permite:
- Login
- Registro
- Manejo de sesiones
- Tokens JWT

### Supabase Database
Base de datos PostgreSQL donde se almacenan:
- usuarios
- campañas
- personajes
- criaturas
- mensajes
- notas

### Supabase Realtime
Utilizado principalmente para:
- chat de sesiones
- actualización de notas
- coordinación entre jugadores

### Supabase Storage
Utilizado para:
- imágenes
- retratos de personajes
- archivos pequeños

---

# 3. Capa de Persistencia

## Tecnología
- PostgreSQL

## Características
- Relacional
- Escalable
- Compatible con Supabase
- Soporte para relaciones complejas

## Responsabilidades
- Guardar información persistente
- Mantener integridad de datos
- Gestionar relaciones entre entidades

## Tablas importantes
- User
- Campaign
- Character
- Creature
- Message
- Note
- Chat
- CharacterXCampaign
- UserXCampaign

---

# Hosting y Despliegue

# Frontend - Vercel

## Razones de uso
- Gratis para proyectos pequeños
- Integración sencilla con GitHub
- Despliegue automático
- CDN incluido
- Muy usado con React

## Flujo
1. Push al repositorio GitHub
2. Vercel detecta cambios
3. Se genera automáticamente una nueva versión

---

# Base de Datos - Supabase

## Razones de uso
- PostgreSQL administrado
- Auth integrado
- Realtime integrado
- Plan gratuito suficiente
- Fácil integración con React

---

# Pasos de Implementación

# 1. Crear repositorio

## Herramientas
- Git
- GitHub

## Pasos
1. Crear repositorio
2. Configurar ramas
3. Definir estructura del proyecto

---

# 2. Configurar Frontend

## Pasos
1. Crear proyecto React
2. Instalar dependencias
3. Configurar rutas
4. Crear componentes base
5. Conectar con Supabase

## Dependencias sugeridas
```bash
npm install react-router-dom @supabase/supabase-js
```
# 3. Configurar Supabase
Pasos
Crear proyecto en Supabase
Configurar PostgreSQL
Crear tablas
Configurar relaciones
Activar autenticación
Configurar Realtime
# 4. Implementar autenticación
Funcionalidades
Login
Registro
Logout
Protección de rutas
Objetivo

Garantizar acceso controlado a campañas y personajes.

# 5. Implementar módulos principales
Orden sugerido
Usuarios
Campañas
Personajes
Notas
Chat
Sesiones
Realtime
# 6. Despliegue
Frontend
Desplegar en Vercel
Backend
Supabase ya se encuentra hosteado
# Seguridad

Aunque el proyecto es académico, se consideran prácticas básicas de seguridad.

Medidas
Uso de JWT
Contraseñas manejadas por Supabase
Validaciones frontend
Restricción de acceso mediante Row Level Security
# Escalabilidad

La arquitectura está diseñada para crecer moderadamente sin requerir cambios grandes.

Posibles mejoras futuras
Backend propio con Node.js
Caché
Microservicios
Notificaciones
Aplicación móvil
# Ventajas de la arquitectura
## Simplicidad

Reduce la cantidad de componentes necesarios.

## Bajo costo

Todas las herramientas poseen planes gratuitos suficientes.

## Desarrollo rápido

Permite enfocarse en funcionalidades en lugar de infraestructura.

## Escalabilidad moderada

Suficiente para el alcance del proyecto.

## Accesibilidad

Compatible con navegador moderno sin requerimientos especiales.

# Limitaciones
Dependencia de Supabase

Gran parte de la lógica depende de la plataforma.

Menor control del backend

Comparado con una API personalizada.

Realtime limitado al plan gratuito

Aunque suficiente para pruebas y proyectos académicos.