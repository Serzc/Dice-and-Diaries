# Diseño General de la Aplicación
## 1. Descripción breve de la aplicación
La aplicación propuesta consiste en un Administrador de Campañas de Dungeons and Dragons diseñado para facilitar la organización, coordinación y ejecución de partidas tanto presenciales como virtuales. El sistema busca centralizar en una sola plataforma herramientas que normalmente se encuentran dispersas entre distintas aplicaciones, como manejo de campañas, hojas de personaje, chat, notas, coordinación de sesiones y administración de criaturas.
El enfoque principal del proyecto es mejorar la experiencia tanto del Game Master como de los jugadores mediante una herramienta accesible, ligera y sencilla de utilizar. A diferencia de otras plataformas existentes, la propuesta busca mantener un equilibrio entre funcionalidad y simplicidad, evitando interfaces excesivamente complejas o dependencias técnicas elevadas.
La aplicación permitirá trabajar con múltiples campañas, personajes y sesiones, además de proporcionar mecanismos para mantener información organizada mediante notas, carpetas y sistemas de visibilidad pública o privada. También incluye herramientas sociales y de coordinación para facilitar la comunicación y la planificación entre participantes.

## 2. Estructura de la base de datos
La base de datos fue diseñada con un enfoque orientado al rendimiento, flexibilidad y facilidad de mantenimiento. El sistema se compone de entidades principales relacionadas entre sí mediante tablas intermedias que permiten representar relaciones de muchos a muchos.
Las **entidades principales** del sistema son:

- Usuarios
- Campañas
- Personajes
- Criaturas/NPCs
- Objetos
- Hechizos
- Chats y mensajes
- Notas
- Carpetas organizacionales


El modelo utiliza tablas relacionales como CharacterXCampaign, ItemXCharacter y SpellXCreature para manejar asociaciones complejas entre entidades. Esto permite reutilizar personajes, criaturas y objetos entre distintas campañas o contextos.
Una decisión importante del diseño es el uso de ciertos campos tipo varchar para almacenar estructuras compactas relacionadas con estadísticas o configuraciones del sistema de juego. Aunque estos elementos podrían separarse en múltiples tablas, se decidió mantener una representación simplificada para reducir complejidad y optimizar consultas frecuentes.
La base de datos también implementa borrado lógico mediante el atributo active, permitiendo conservar información histórica sin eliminar registros físicamente.

## 3. Diseño de UI
El diseño de interfaz de usuario se centra en tres principios:

- Accesibilidad
- Simplicidad
- Rapidez de acceso a la información


La aplicación utilizará una estructura visual consistente en todas las pantallas para reducir la curva de aprendizaje y facilitar la navegación.
### Convenciones de accesibilidad
Todas las pantallas contarán con un header persistente que permitirá acceso rápido a las principales secciones de la aplicación:

- Home
- Campañas
- Personajes
- Criaturas
- Calendario
- Perfil


Las interfaces estarán organizadas mediante secciones claramente separadas y rotuladas para evitar sobrecarga visual. Se buscará mantener:


- Alto contraste visual
- Botones claramente identificables
- Distribución consistente de elementos
- Accesos rápidos a funciones frecuentes
- Compatibilidad con distintos tamaños de pantalla
- Los elementos interactivos importantes tendrán íconos y etiquetas visibles para mejorar comprensión y accesibilidad.
- capacidad de lectura con lectores de pantalla.

### 3.1. Pantallas principales
#### Home
Pantalla principal de acceso rápido al sistema.
Contiene:

- Vista rápida de campañas recientes
- Acceso directo a campañas activas
- Botón para unirse a una campaña
- Botón para planificar una sesión
- Resumen de próximas sesiones
- Actividad reciente


El objetivo de esta pantalla es servir como centro principal de navegación y resumen general del estado de juego del usuario.

#### Login
Pantalla simple de autenticación.
Incluye:

- Campo de usuario
- Campo de contraseña
- Botón de ingreso
- Creación de cuenta

El diseño prioriza simplicidad y claridad visual.

#### Vista de campañas
Pantalla que muestra las campañas del usuario en formato tipo historial.
Las campañas más recientes aparecen primero.
Cada `campaign_card` incluye:


- Nombre de la campaña
- Indicador de si el usuario es GM
- Estado de sesión activa o inactiva
- Acceso rápido a notas
- Acceso al chat
- Acceso a NPCs (solo GM)
- Gestión de jugadores (solo GM)
- Botón para iniciar sesión (solo GM)


El objetivo es permitir acceso rápido a todas las herramientas relacionadas con una campaña específica.

#### Chat
Sistema principal de interacción durante las sesiones.
Funciones principales:


- Chat de texto en tiempo real
- Hablar dentro o fuera de personaje
- Imagen/avatar del personaje al hablar en personaje
- Mensajes privados (susurros)
- Historial persistente de mensajes
- Incluye una barra lateral o tray desplegable con:
    - Tirada de dados
    - Acceso rápido a hoja de personaje
    - Acceso a notas
    - Calculadora básica
    - Susurros privados
    - Popup de criaturas/NPCs (solo GM)


El chat funciona como el centro operativo durante una sesión.

#### Personajes
Pantalla que muestra todos los personajes controlados por el usuario.
Se utiliza una vista tipo historial mediante character_cards.
Cada tarjeta muestra:

- Nombre
- Clase(s)
- Nivel
- Estadísticas principales
- Acceso rápido a notas
Cada tarjeta funciona además como botón para ingresar a la hoja completa del personaje.

#### Character Sheet
Pantalla completa de hoja de personaje inspirada en las hojas tradicionales de Dungeons and Dragons.
Incluye:
- Ability Scores
- Saving Throws
- Skills
- Inventario
- Hechizos
- Ataques
- Feats
- Estadísticas generales
- Vida y recursos


Todas las secciones deben ser editables y expandibles.
El usuario podrá:


- Modificar estadísticas
- Agregar ataques
- Crear habilidades personalizadas
- Configurar hechizos
- Editar equipamiento


La intención es mantener la flexibilidad característica del juego físico mientras se automatizan cálculos repetitivos.

#### Planificar sesión
Vista tipo calendario enfocada en coordinación grupal.
Características:

- Disponibilidad por día y hora
- Marcado individual de horarios disponibles
- Visualización grupal de coincidencias
- Diferentes niveles de opacidad según disponibilidad total
- Creación de nuevas sesiones o eventos


El objetivo es simplificar uno de los problemas más frecuentes en campañas de rol: coordinar horarios.

#### Mis criaturas
Vista orientada principalmente al Game Master.
La organización se realiza mediante carpetas y entradas de criaturas.
Cada criatura incluye:

- Vista rápida resumida
- Acceso a Monster Block completo
- Notas relacionadas
- Etiquetas o categorías


Las criaturas funcionan además como botones que generan popups con información detallada.
Cada criatura posee un botón de “poseer/utilizar”, permitiendo que el Game Master pueda hablar en el chat utilizando la identidad de dicha criatura o NPC. Esto facilita la interpretación narrativa durante las sesiones.