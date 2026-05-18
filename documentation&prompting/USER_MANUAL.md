# Manual de Usuario — Dice and Diaries

> Guía rápida para usar la aplicación: cuenta, campañas, personajes, notas, criaturas y calendario.

---

## Tabla de contenidos

1. [Cuenta y perfil](#crud-1-cuenta-y-perfil)
2. [Campañas](#crud-2-campañas)
3. [Personajes](#crud-3-personajes)
4. [Notas](#crud-4-notas)
5. [Criaturas y monstruos](#crud-5-criaturas-y-monstruos)
6. [Calendario de disponibilidad](#crud-6-calendario-de-disponibilidad)
7. [Chat de sesión](#chat-de-sesión)
8. [Accesibilidad](#accesibilidad)

---

## CRUD 1: Cuenta y perfil

### Registrarse

1. Ir a la pantalla de inicio y hacer clic en **Registrarse**.
2. Ingresar nombre de usuario, correo y contraseña.
3. Hacer clic en **Crear cuenta**.

### Iniciar sesión

Ingresar nombre de usuario y contraseña, luego hacer clic en **Iniciar sesión**.

### Editar perfil

1. Ir a **Perfil** en la barra de navegación.
2. Hacer clic en **Editar perfil**.
3. Modificar nombre visible, correo o biografía.
4. Hacer clic en **Guardar**.

> Las cuentas se desactivan de forma suave. Para eliminar la cuenta, contactar soporte.

---

## CRUD 2: Campañas

### Crear una campaña *(solo GM)*

1. Ir a **Campañas** y hacer clic en el botón **+**.
2. Completar nombre, descripción (opcional) y miniatura (opcional).
3. Hacer clic en **Crear campaña**. Se genera un **código de invitación** para compartir con los jugadores.

### Unirse a una campaña *(jugadores)*

1. Ir a **Campañas** y hacer clic en **Unirse a campaña**.
2. Ingresar el código de invitación del GM y hacer clic en **Unirse**.

### Editar una campaña *(solo GM)*

Desde la tarjeta de la campaña, hacer clic en la imagen o en el botón de edición para cambiar nombre, descripción o imagen.

### Iniciar o terminar sesión *(solo GM)*

Usar los botones **Iniciar sesión** / **Finalizar sesión** en la tarjeta de campaña.

### Ver jugadores

Hacer clic en **Jugadores** en la tarjeta. El GM puede eliminar miembros desde esa pantalla.

### Eliminar una campaña *(solo GM)*

Hacer clic en el ícono de papelera y confirmar el diálogo.

---

## CRUD 3: Personajes

### Crear un personaje

1. Ir a **Personajes** y hacer clic en **+**.
2. Se crea con valores por defecto. La app lleva directo a la ficha para completar los datos.

### Vincular a una campaña

Desde la tarjeta del personaje, hacer clic en **Campaña** y seleccionar la campaña deseada.

### La ficha de personaje

En cada sección, hacer clic en **✎** para editar y en **✓** para guardar.

| Sección | Qué contiene |
|---------|-------------|
| **Información general** | Nombre, clase(s), especie, background, nivel, apariencia, retrato |
| **Características** | FUE/DES/CON/INT/SAB/CAR (1–30) y competencias de salvación |
| **Combate** | CA, iniciativa, velocidad, PG, dados de golpe |
| **Habilidades** | 18 habilidades con modificador y nivel de competencia |
| **Historia** | Texto libre: trasfondo, personalidad, notas |
| **Rasgos** | Rasgos de clase, raciales y dotes (agregar/editar/eliminar) |
| **Inventario** | Objetos con nombre, cantidad, peso y efecto (equipar afecta la CA) |
| **Conjuros** | Habilidad de lanzamiento, ranuras por nivel y lista de hechizos |
| **Acciones** | Acciones y acciones adicionales de combate |

**Apariencia:** este campo se usa como texto alternativo del retrato en toda la app. Es especialmente útil para usuarios con lectores de pantalla.

**Descansos:** los botones **Descanso corto** y **Descanso largo** en la sección de combate restauran PG y dados de golpe.

### Eliminar un personaje

Los personajes se desactivan de forma suave desde la ficha.

---

## CRUD 4: Notas

Todos los miembros pueden crear notas. El GM ve todas; los jugadores ven las públicas y las propias.

### Desde la página de Campañas

1. Hacer clic en **Notas** en la tarjeta de la campaña.
2. Hacer clic en **+ Nueva nota**, completar título y contenido.
3. Marcar **Visible para todos** si se quiere que todos los miembros la lean.
4. Hacer clic en **Crear nota**.

Para editar o eliminar: expandir la nota haciendo clic en el título y usar los botones correspondientes (disponibles para el autor o el GM).

### Vista completa de notas

Navegar a `/campaigns/:id/notes` o usar el ícono de página completa en la tarjeta. El botón flotante **+** crea una nota nueva.

### Desde el chat

1. Abrir el sidebar del chat.
2. Ir a la pestaña **Notas**.
3. Hacer clic en **+ Nueva nota** para crear, o en **Adjuntar** para compartir una nota existente como mensaje.

### Historia del personaje

La sección **Historia** en la ficha del personaje funciona como nota personal. También se puede acceder desde **Mis Notas** en la tarjeta del personaje.

---

## CRUD 5: Criaturas y monstruos

### Ver criaturas

Ir a **Criaturas**. La vista muestra carpetas y criaturas. Hacer clic en una criatura para ver su vista rápida.

### Crear una criatura *(solo GM)*

1. Hacer clic en **+** y completar el formulario: nombre, tamaño, tipo, alineamiento, ND, CA, PG, velocidad y características.
2. Hacer clic en **Crear criatura**.

### Editar una criatura

Abrir la ficha de la criatura. En cada sección, usar **✎** para editar y **✓** para guardar.

Secciones disponibles: General, Características, Rasgos y acciones, Notas del GM, Notas visibles para jugadores.

### Vincular a una campaña

Desde la vista rápida de la criatura, hacer clic en **Añadir a campaña** y seleccionar la campaña.

### Poseer una criatura en el chat *(GM)*

1. En el sidebar del chat, ir a la pestaña **Criaturas**.
2. Hacer clic en la criatura para hablar como ella.
3. Hacer clic en **Soltar** para volver a hablar como uno mismo.

### Carpetas

Hacer clic en **Nueva carpeta** para organizar criaturas. Las carpetas se pueden anidar.

### Eliminar una criatura

Usar el botón **Eliminar** en la vista rápida o ficha. La criatura se desactiva.

---

## CRUD 6: Calendario de disponibilidad

### Ver el planificador

1. Ir a **Planificador** y seleccionar una campaña.
2. Se muestra una grilla semanal con franjas horarias (Mañana, Tarde, Tarde-noche, Noche).

### Marcar disponibilidad

Hacer clic en una celda para alternar la disponibilidad. Los cambios se guardan de inmediato.

### Mapa de calor

Las celdas se colorean según cuántos miembros están disponibles (gris = nadie, verde oscuro = todos). Pasar el cursor sobre una celda muestra el número exacto.

### Navegar entre semanas

Usar los botones **←** y **→**. La fecha actual aparece resaltada.

---

## Chat de sesión

### Enviar mensajes

Escribir en el cuadro de texto y presionar **Enter** o hacer clic en **Enviar**.

### Tirar dados

Hacer clic en el ícono de dados, ingresar la notación (ej: `2d6`, `1d20+5`), elegir ventaja o desventaja y hacer clic en **Tirar**.

### Hablar como un personaje

1. Abrir el sidebar y hacer clic en el personaje en la sección **Personajes**.
2. Aparece el banner *"Hablando como [nombre]"*. Los mensajes se envían con el nombre y avatar del personaje.
3. Hacer clic en **Soltar** para volver a hablar como uno mismo.

### Susurros

En el sidebar, pestaña **Jugadores**, hacer clic en el ícono de susurro junto al jugador deseado. Solo ese jugador verá el mensaje.

### Compartir notas y habilidades

Desde el sidebar, pestaña **Notas**: hacer clic en **Adjuntar** para compartir una nota como mensaje.

Desde **Personajes**, expandir el personaje y hacer clic en **Compartir** en un rasgo o habilidad.

---

## Accesibilidad

### Navegación con teclado

| Tecla | Acción |
|-------|--------|
| `Tab` | Moverse entre elementos interactivos |
| `Enter` / `Espacio` | Activar botones y casillas |
| `Escape` | Cerrar cualquier popup o modal |
| `↑` / `↓` | Navegar entre mensajes del chat |
| `Inicio` / `Fin` | Ir al mensaje más antiguo o más reciente |

### Lectores de pantalla

- **Chat:** al hacer Tab, el foco va al mensaje más reciente. El lector anuncia remitente, hora y contenido.
- **Imágenes:** si el personaje tiene una **Apariencia** configurada, esa descripción se usa como `alt`. Si no, la imagen es decorativa.
- **Modales:** el foco queda atrapado dentro mientras están abiertos.
- **Mensajes nuevos:** se anuncian automáticamente sin interrumpir la lectura actual.

### Configurar la apariencia del personaje

1. Abrir la ficha del personaje y hacer clic en **✎** en **Información General**.
2. Completar el campo **Apariencia** con una descripción visual (ej: *"Elfa de cabello plateado con cicatriz en la mejilla izquierda"*).
3. Hacer clic en **✓** para guardar.

Esta descripción se aplica como texto alternativo en la lista de personajes, la ficha y todos los mensajes del chat enviados en personaje.

---

*Dice and Diaries - I Semestre 2026, TEC Costa Rica*
