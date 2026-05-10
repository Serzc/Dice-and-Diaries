# Configuración de Ambiente React con Node.js y npm

## Introducción

Este documento resume el proceso básico para crear y ejecutar un proyecto React utilizando Node.js, npm y Vite. La configuración propuesta es moderna, ligera y apropiada para proyectos universitarios.

---

# Requisitos previos

Antes de iniciar, es necesario tener instalado:

- Node.js
- npm

Para verificar la instalación, abrir una terminal y ejecutar:

```bash
node -v
npm -v
```

Si ambos comandos muestran una versión, el entorno está listo.

# Crear un proyecto React
## 1. Navegar a la carpeta deseada

Ejemplo:

cd Desktop
## 2. Crear el proyecto con Vite

Ejecutar:

npm create vite@latest
## 3. Configuración inicial

Durante el proceso se solicitará:

**Nombre del proyecto**

Ejemplo:

dice-and-diaries
**Framework**

Seleccionar:

React
**Variante**

Seleccionar:

JavaScript
### Instalar dependencias

Entrar a la carpeta del proyecto:

cd dice-and-diaries

Instalar dependencias:

npm install

Esto descargará todas las librerías necesarias y creará la carpeta:

node_modules
### Ejecutar el entorno de desarrollo

Para iniciar el servidor local:

npm run dev

La terminal mostrará una dirección similar a:

http://localhost:5173/

Abrir esa dirección en el navegador.

### Estructura básica del proyecto

Después de la creación, el proyecto tendrá una estructura similar a:
```
dice-and-diaries/
│
├── node_modules/
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│
├── package.json
├── vite.config.js
```
### Instalar librerías adicionales
React Router

Permite navegación entre páginas.
```bash
npm install react-router-dom
```
Supabase

Permite conectar la aplicación con Supabase.
```bash
npm install @supabase/supabase-js
```
### Generar versión de producción

Para generar una versión optimizada:
```bash
npm run build
```
Esto crea la carpeta:
```
dist/
```
La cual puede desplegarse en servicios como Vercel.

### Despliegue con Vercel

Pasos generales:

1. Subir el proyecto a GitHub
2. Crear cuenta en Vercel
3. Importar el repositorio
4. Realizar despliegue automático

Vercel detecta automáticamente proyectos React con Vite.

### Comandos npm importantes
Comando	Función
npm install	Instalar dependencias
npm run dev	Ejecutar entorno de desarrollo
npm run build	Generar versión producción
npm install paquete	Instalar librería
npm uninstall paquete	Eliminar librería
Estructura recomendada para el proyecto

Se recomienda organizar el proyecto de la siguiente manera:
```
src/
│
├── components/
├── pages/
├── services/
├── routes/
├── styles/
├── assets/
```
Recomendación adicional

Crear un archivo:
```
services/supabase.js
```
Este archivo centraliza la conexión con Supabase y facilita el mantenimiento del proyecto.

## Conclusión

La combinación de React, Vite y npm permite crear aplicaciones web modernas de manera rápida y sencilla. Esta configuración es adecuada para proyectos universitarios debido a su facilidad de uso, rapidez de desarrollo y compatibilidad con herramientas gratuitas como Supabase y Vercel.