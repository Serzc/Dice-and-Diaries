# Dice and Diaries

> Aplicación web para gestionar campañas de D&D 5e.

**Estudiantes:** Sergio Andrés Zúñiga Castillo · José Ignacio Madriz Ortiz

---

## Tabla de contenidos

1. [Contexto](#contexto)
2. [Tecnologías](#tecnologías)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Base de datos](#base-de-datos)
5. [Formatos compactos](#formatos-compactos-de-almacenamiento)
6. [Flujo de datos](#flujo-de-datos)
7. [Convenciones de código](#convenciones-de-código)
8. [Accesibilidad](#accesibilidad)
9. [Instalación local](#instalación-local)
10. [Despliegue](#despliegue)

---

## Contexto

Dice and Diaries permite a un grupo de rol llevar todo desde un solo lugar: fichas de personaje, chat en tiempo real con dados, notas compartidas, bestiario y calendario de disponibilidad.

| Rol | Permisos |
|-----|----------|
| Game Master (GM) | Crea y administra la campaña, gestiona criaturas, ve todas las notas, controla el estado de sesión |
| Jugador | Gestiona sus personajes, crea notas, participa en el chat |

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite |
| Rutas | React Router v7 |
| Estilos | CSS global (`body:has(.page-class)` para scoping) |
| Backend / BD | Supabase (PostgreSQL) |
| Tiempo real | Supabase Realtime |
| Archivos | Supabase Storage |
| Despliegue | Vercel |
| Componentes | Sin librería, todo hecho a mano |

---

## Estructura del proyecto

```
Dice-and-Diaries/
├── dice-and-diaries/               # Frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── Campaigns/          # Tarjeta y popup de notas de campaña
│       │   ├── Characters/         # Tarjeta de personaje
│       │   ├── CharacterSheet/     # Secciones de la ficha (General, Stats, Combat, …)
│       │   ├── Chat/               # ChatMessage, ChatInput, ChatSidebar, NotesPopup
│       │   ├── Creatures/          # Lista, vista rápida, popup de creación
│       │   └── common/             # Button, Card, estilos base de popups
│       ├── context/AuthContext.jsx
│       ├── hooks/useFocusTrap.js
│       ├── lib/supabase.js         # Cliente Supabase (singleton)
│       ├── mock/db.js              # Todas las consultas a Supabase
│       ├── pages/                  # Una página por ruta
│       └── utils/characterDataAdapter.js
├── supabase/migrations/
│   ├── 001_create_tables.sql
│   ├── 002_add_missing_columns.sql
│   └── 003_appearance_player_notes.sql
└── documentation&prompting/
```

---

## Base de datos

### `User`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | serial PK | |
| `username` | varchar(64) UNIQUE | Usado para iniciar sesión |
| `displayName` | varchar(64) | |
| `email` | varchar(128) UNIQUE | |
| `passwordHash` | varchar(128) | |
| `bio` | varchar(512) | |
| `avatarUrl` | varchar(128) | |
| `joinedAt` | date | |
| `active` | boolean | Borrado suave |

### `Campaign`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | serial PK | |
| `name` | varchar(64) | |
| `description` | varchar(512) | |
| `imageUrl` | varchar(128) | |
| `inviteCode` | varchar(8) | Código para unirse |
| `active` | boolean | Sesión activa |
| `ownerId` | FK → User | El GM |

### `Character`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | serial PK | |
| `name` | varchar(64) | |
| `classes` | varchar(128) | Separadas por coma |
| `species / background` | varchar(64) | |
| `level` | smallint | 1–20 |
| `imageUrl` | varchar(128) | |
| `appearance` | varchar(512) | Alt text de la imagen |
| `abilityScores` | varchar(12) | Formato compacto |
| `saveProficiencies` | varchar(6) | Cadena binaria |
| `skillProficiencies` | varchar(18) | Un char por habilidad |
| `hpMax / currentHp / tempHp` | smallint | |
| `hitDiceType / hitDiceTotal / hitDiceRemaining` | mixto | |
| `spellcastingAbility` | varchar(4) | |
| `spellSlots` | varchar(18) | Formato compacto |
| `actions / bonusActions` | varchar(4096) | JSON |
| `features / inventory / spells` | varchar(4096) | JSON |
| `characterNote` | varchar(2048) | JSON `{id, title, content}` |
| `active` | boolean | Borrado suave |
| `ownerId` | FK → User | |

### `Creature`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | serial PK | |
| `name` | varchar(64) | |
| `size / creatureType / alignment` | varchar | |
| `cr` | varchar(8) | Ej: `"1/2"` |
| `ac / hpMax / speed` | mixto | |
| `abilityScores` | varchar(12) | Mismo formato que Character |
| `savingThrows / skills` | varchar(512) | JSON |
| `specialTraits / actions / bonusActions / reactions` | varchar(4096) | JSON |
| `gmNotes / playerVisibleNotes` | varchar(4096) | |
| `folderId` | FK → CreatureFolder | |
| `active` | boolean | |
| `ownerId` | FK → User | |

### `Note`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | serial PK | |
| `campaignId` | FK → Campaign | |
| `authorId` | FK → User | |
| `title` | varchar(64) | |
| `content` | varchar(4096) | |
| `isPublic` | boolean | Visible para todos los miembros |
| `active` | boolean | Borrado suave |

### `Message`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | serial PK | |
| `chatId` | FK → Chat | |
| `senderId` | FK → User | |
| `characterId` | integer | Sin FK (puede ser criatura) |
| `type` | varchar(16) | `text / dice_roll / whisper / ability_append / note_append` |
| `content` | varchar(4096) | Texto o JSON según tipo |
| `isWhisper / whisperTo` | bool / FK | |
| `senderUsername / characterName / characterAvatar / characterAppearance` | varchar | Desnormalizados |
| `timestamp` | timestamp | |

### `Availability`

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | serial PK | |
| `userId` | FK → User | |
| `date` | date | |
| `slots` | varchar(256) | IDs de franjas separados por coma |

### Tablas de relación

| Tabla | Conecta |
|-------|---------|
| `UserXCampaign` | Usuario ↔ Campaña (rol: `gm` / `player`) |
| `CharacterXCampaign` | Personaje ↔ Campaña |
| `CreatureXCampaign` | Criatura ↔ Campaña |
| `CreatureFolder` | Carpetas anidadas |
| `CreatureNote` | Notas por criatura |

---

## Formatos compactos de almacenamiento

### `abilityScores`: varchar(12)

Dos dígitos por característica: **FUE · DES · CON · INT · SAB · CAR**

```
"141813101508"  →  FUE=14  DES=18  CON=13  INT=10  SAB=15  CAR=08
```

### `saveProficiencies`: varchar(6)

Un bit por característica (mismo orden). `1` = competente.

```
"010100"  →  DES=competente  INT=competente
```

### `skillProficiencies`: varchar(18)

Un carácter por habilidad (18, orden de `SKILLS` en `characterDataAdapter.js`). Valores: `0` = ninguna, `1` = competente, `2` = maestría.

### `spellSlots`: varchar(18)

Dos caracteres por nivel (1–9): `max` + `restantes`.

```
"433200000000000000"  →  N1: max=4 rest=3 · N2: max=3 rest=3 · N3: max=2 rest=2
```

### Funciones de conversión (`db.js`)

| Función | Descripción |
|---------|-------------|
| `_parseAbil(str)` | cadena → `{str,dex,con,int,wis,cha}` |
| `_serializeAbil(obj)` | objeto → cadena |
| `_parseSlots(str)` | cadena → `{1:{max,current}, 2:…}` |
| `serializeSpellSlots(obj)` | objeto → cadena |

---

## Flujo de datos

### Guardar un personaje

```
Componente (ej. GeneralInfo)
  └─ onSave({ name, classes, appearance, … })
       └─ updateCharacter(partialData)          [CharacterSheetPage]
            ├─ setCharacter(prev → updated)
            └─ saveCharacterSection(id, section, data)  [db.js]
                 ├─ "core"          → toDatabase() → UPDATE Supabase
                 ├─ "inventory"     → JSON.stringify → UPDATE
                 └─ …
```

### Chat en tiempo real

```
ChatInput → handleSendText [ChatPage]
  └─ sendMessageApi(campaignId, msg) [db.js]
       └─ INSERT en Message
            └─ Supabase Realtime → subscribeToChatMessages
                 └─ setMessages(prev → [...prev, nuevoMensaje])
```

---

## Convenciones de código

### Componentes

- Edición por secciones: modo lectura por defecto; `✎` activa inputs, `✓` guarda.
- Sin librería de UI; HTML semántico + CSS propio.
- Scoping de CSS con `body:has(.page-class)`.
- Popups: `useFocusTrap` + `role="dialog" aria-modal="true"`.

### Estado

- Sin Redux ni Zustand; `useState` local + prop drilling.
- `AuthContext` provee el usuario actual.
- `CURRENT_USER_ID` es una variable mutable en `db.js`, actualizada al iniciar/cerrar sesión.

### Capa de datos (`db.js`)

- Archivo único con todas las consultas.
- Helpers privados con prefijo `_`.
- Todas las funciones exportadas son `async` y retornan objetos en camelCase.
- Borrado suave: `active = false` en lugar de `DELETE`.
- Postgres devuelve columnas en minúsculas; los helpers `_norm*` las convierten a camelCase.

### Nomenclatura

| Contexto | Convención |
|----------|-----------|
| Componentes React | PascalCase |
| Funciones y variables | camelCase |
| Clases CSS | kebab-case |
| Helpers privados | `_camelCase` |

---

## Accesibilidad

El proyecto apunta a WCAG 2.1 AA.

- **HTML semántico:** `<main>`, `<nav>`, `<header>` con `aria-labelledby`; `role="list"` en tarjetas y mensajes.
- **Formularios:** cada campo tiene `<label>` asociado con `htmlFor`.
- **Foco en modales:** `useFocusTrap` atrapa el foco dentro de popups; se libera al cerrar.
- **Chat:** `role="list"` + `aria-live="polite"`; navegación con ↑ ↓ / Inicio / Fin; roving tabindex.
- **Imágenes:** `alt` tomado del campo `appearance` del personaje; si está vacío, `alt=""` + `role="presentation"`.
- **Anuncios:** `aria-live="polite"` en mensajes nuevos; `role="status"` en banners; `<abbr>` en abreviaturas.

---

## Instalación local

```bash
git clone <url-del-repo>
cd Dice-and-Diaries/dice-and-diaries
npm install

# Configurar variables de entorno
cp .env.example .env.local
# VITE_SUPABASE_URL=https://<ref>.supabase.co
# VITE_SUPABASE_KEY=<anon-key>

# Ejecutar migraciones en el SQL Editor de Supabase (en orden):
# 001_create_tables.sql
# 002_add_missing_columns.sql
# 003_appearance_player_notes.sql

npm run dev
```

---

## Despliegue

Vercel con builds automáticos al hacer push a `main`.

```bash
cd dice-and-diaries
npx vercel --prod --yes
```

Variables de entorno en Vercel: `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`.

Buckets requeridos en Supabase Storage: `character-images`, `campaign-images`.

---

*Dice and Diaries - I Semestre 2026, TEC Costa Rica*
