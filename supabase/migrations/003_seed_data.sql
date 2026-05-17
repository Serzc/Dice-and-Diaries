-- =====================================================================
-- Migration 003 – Seed data matching src/mock/db.js
-- Run after 001 and 002.  Uses ON CONFLICT DO NOTHING so it is safe
-- to re-run on a partially-seeded database.
-- =====================================================================

-- ── Users ────────────────────────────────────────────────────────────
INSERT INTO "User" (id, username, "displayName", email, "passwordHash", bio, "avatarUrl", "joinedAt", active) VALUES
(1,  'GM_Dave',       'David García',    'david@example.com',  'gm123',     'Game Master apasionado por la narrativa y los mundos de fantasía. Llevo 5 años dirigiendo campañas.', NULL, '2024-08-01', true),
(2,  'Player_Anna',   'Ana Martínez',    'anna@example.com',   'anna123',   'Jugadora entusiasta de D&D desde hace 3 años.', NULL, '2024-09-15', true),
(3,  'Player_Ben',    'Benjamín Torres', 'ben@example.com',    'ben123',    '', NULL, '2025-01-03', true),
(4,  'Player_Cris',   'Cristina López',  'cris@example.com',   'cris123',   '', NULL, '2025-02-11', true),
(5,  'Player_Dan',    'Daniel Rojas',    'dan@example.com',    'dan123',    '', NULL, '2025-03-20', true),
(6,  'Player_Elena',  'Elena Vega',      'elena@example.com',  'elena123',  '', NULL, '2025-04-05', true),
(7,  'Player_Felipe', 'Felipe Mora',     'felipe@example.com', 'felipe123', '', NULL, '2025-05-01', true),
(8,  'Player_Gabi',   'Gabriela Ruiz',   'gabi@example.com',   'gabi123',   '', NULL, '2025-05-15', true),
(9,  'Player_Hugo',   'Hugo Sánchez',    'hugo@example.com',   'hugo123',   '', NULL, '2025-06-01', true),
(10, 'Player_Iris',   'Iris Delgado',    'iris@example.com',   'iris123',   '', NULL, '2025-06-10', true)
ON CONFLICT (id) DO NOTHING;
SELECT setval('"User_id_seq"', 10, true);

-- ── Campaigns ────────────────────────────────────────────────────────
INSERT INTO "Campaign" (id, name, description, "imageUrl", active, "ownerId", "inviteCode") VALUES
(1, 'Campaña 1: Las Minas Perdidas',          '', NULL, true,  1, 'MINE01'),
(2, 'Campaña 2: La Maldición de Strahd',      '', NULL, false, 1, 'VAMP01'),
(3, 'Campaña 3: La Tumba de la Aniquilación', '', NULL, true,  2, 'JNGL01')
ON CONFLICT (id) DO NOTHING;
SELECT setval('"Campaign_id_seq"', 3, true);

-- ── Chats (one per campaign) ──────────────────────────────────────────
INSERT INTO "Chat" (id, "campaignId", active) VALUES
(1, 1, true),
(2, 2, true),
(3, 3, true)
ON CONFLICT (id) DO NOTHING;
SELECT setval('"Chat_id_seq"', 3, true);

-- ── UserXCampaign ─────────────────────────────────────────────────────
-- Campaign 1: owner=1, players=[1,2,3,4]
INSERT INTO "UserXCampaign" ("userId", "campaignId", role) VALUES
(1, 1, 'gm'), (2, 1, 'player'), (3, 1, 'player'), (4, 1, 'player'),
-- Campaign 2: owner=1, players=[1,5,6,7,8]
(1, 2, 'gm'), (5, 2, 'player'), (6, 2, 'player'), (7, 2, 'player'), (8, 2, 'player'),
-- Campaign 3: owner=2, players=[1,2,9,10]
(2, 3, 'gm'), (1, 3, 'player'), (9, 3, 'player'), (10, 3, 'player')
ON CONFLICT ("userId", "campaignId") DO NOTHING;

-- ── Creature Folders ──────────────────────────────────────────────────
INSERT INTO "CreatureFolder" (id, name, "parentFolderId", "ownerId", active) VALUES
(1, 'Humanoides', NULL, 1, true),
(2, 'Bestias',    NULL, 1, true),
(3, 'Jefes',      1,    1, true)
ON CONFLICT (id) DO NOTHING;
SELECT setval('"CreatureFolder_id_seq"', 3, true);

-- ── Characters ───────────────────────────────────────────────────────
-- abilityScores compact: STR DEX CON INT WIS CHA, 2 digits each
-- saveProficiencies: binary string per ability (STR DEX CON INT WIS CHA)
-- skillProficiencies: 18 chars, 0=none 1=prof 2=expert
--   order: acrobatics animal_handling arcana athletics deception history
--          insight intimidation investigation medicine nature perception
--          performance persuasion religion sleight_of_hand stealth survival
-- spellSlots: 2 chars per level 1-9 (max,current)

INSERT INTO "Character" (
    id, name, classes, species, background, level, "imageUrl",
    "abilityScores", "saveProficiencies", "skillProficiencies",
    speed, "hpMax", "currentHp", "tempHp",
    "hitDiceType", "hitDiceTotal", "hitDiceRemaining",
    "spellcastingAbility", "spellSlots",
    actions, "bonusActions", "otherProficiencies", features,
    inventory, spells, "characterNote", "proficiencyList",
    active, "ownerId"
) VALUES
(
  1, 'Thorn Ironwood', 'Ranger,Rogue', 'Half-Elf', 'Outlander', 5,
  '/images/characters/thorn.png',
  '141813101508', '010100', '100100001011000221',
  35, 38, 38, 0,
  'd10', 5, 5,
  'wis', '433222000000000000',
  $$[{"id":1,"name":"Ataque con arco largo","description":"Ataque a distancia con arco largo.","recharge":"PerTurn","uses":{"current":1,"max":1}},{"id":2,"name":"Golpe en la rodilla","description":"El enemigo supera CD 14 de CON o cae derribado.","recharge":"SR","uses":{"current":1,"max":1}},{"id":3,"name":"Ráfaga de puñales","description":"Lanzas tres dagas a objetivos cercanos.","recharge":"LR","uses":{"current":1,"max":2}}]$$,
  $$[{"id":4,"name":"Paso sombrío","description":"Te teletransportas 15 pies a un lugar visible.","recharge":"PerTurn","uses":{"current":1,"max":1}},{"id":5,"name":"Segundo viento","description":"Recuperas 1d10 + nivel puntos de vida.","recharge":"SR","uses":{"current":1,"max":1}}]$$,
  $$["Herramientas de ladrón","Juego de cartas","Monturas (tierra)"]$$,
  $$[{"id":1,"name":"Ataque Furtivo","description":"Una vez por turno, +2d6 de daño si tienes ventaja o un aliado está a 5 pies.","effect":{"action":{"attack":{"damage":"2d6","type":"piercing"},"recharge":"PerTurn","uses":{"current":1,"max":1}}}},{"id":2,"name":"Furia","description":"Ventaja en pruebas de FUE. +2 daño en ataques c·a·c.","effect":{"modifiers":{"ability_proficiencies":[{"ability":"str","level":"advantage"}]},"recharge":"LR","uses":{"current":3,"max":3}}},{"id":3,"name":"Defensa Duelista","description":"Mientras sostienes un arma en una mano y ninguna otra, +1 CA.","effect":{"modifiers":{"ac_bonus":1}}},{"id":4,"name":"Segundo Viento","description":"Recuperas 1d10 + nivel puntos de vida.","effect":{"action":{"heal":"1d10 + @level","recharge":"SR","uses":{"current":1,"max":1}}}}]$$,
  $$[{"id":201,"name":"Espada larga","weight":3,"quantity":1,"description":"Una hoja bien equilibrada.","equipable":true,"equipped":true,"effect":{"damage":"1d8","type":"cortante","properties":"versátil (1d10)"}},{"id":202,"name":"Armadura de cuero tachonado","weight":13,"quantity":1,"description":"Tachones de metal cosidos al cuero.","equipable":true,"equipped":true,"effect":{"ac_bonus":2,"stealth_disadvantage":false}},{"id":203,"name":"Poción de curación","weight":0.5,"quantity":2,"description":"Recuperas 2d4+2 puntos de vida.","equipable":false,"equipped":false,"effect":{"heal":"2d4+2"}},{"id":204,"name":"Kit de ladrón","weight":2,"quantity":1,"description":"Herramientas para abrir cerraduras.","equipable":false,"equipped":false,"effect":null}]$$,
  $$[{"id":101,"name":"Curar heridas","description":"Una criatura recupera 1d8 + mod puntos de golpe.","ritual":false,"concentration":false,"prepared":true,"level":1,"effect":{"damage":"1d8+mod","type":"curación","range":"Toque","components":"V, S","duration":"Instantáneo"}},{"id":102,"name":"Detectar magia","description":"Percibes magia en un radio de 30 pies.","ritual":true,"concentration":true,"prepared":false,"level":1,"effect":{"range":"Personal (30 pies)","components":"V, S","duration":"Concentración, hasta 10 min"}},{"id":103,"name":"Rayo abrasador","description":"Tres rayos de fuego a objetivos distintos.","ritual":false,"concentration":false,"prepared":true,"level":2,"effect":{"damage":"2d6","type":"fuego","range":"120 pies","components":"V, S","duration":"Instantáneo"}},{"id":104,"name":"Forma gaseosa","description":"Te transformas en una nube de gas voladora.","ritual":false,"concentration":true,"prepared":false,"level":3,"effect":{"range":"Toque","components":"V, S, M","duration":"Concentración, hasta 1 hora"}}]$$,
  $${"id":1,"title":"Historia de Thorn Ironwood","content":"Thorn creció en los bosques del norte, entrenado desde niño tanto como guardabosques como ladrón. Una vieja cicatriz en la mejilla izquierda de la que nunca habla."}$$,
  $$[{"ability":"str","level":"proficient"},{"ability":"dex","level":"expert"}]$$,
  true, 1
),
(
  2, 'Lirael Moonshadow', 'Wizard', 'Elfo del Bosque', 'Sage', 7,
  '/images/characters/lirael.png',
  '081412191011', '000110', '001001102000000000',
  35, 35, 28, 0,
  'd6', 7, 5,
  'int', '443133100000000000',
  $$[{"id":11,"name":"Ataque con bastón","description":"Ataque cuerpo a cuerpo con el bastón arcano.","recharge":"PerTurn","uses":{"current":1,"max":1}}]$$,
  $$[]$$,
  $$["Laúd","Ajedrez de dragón"]$$,
  $$[{"id":11,"name":"Recuperación Arcana","description":"Una vez al día recuperas espacios de hechizo que no superen la mitad de tu nivel.","effect":{"action":{"heal":"slots","recharge":"LR","uses":{"current":1,"max":1}}}},{"id":12,"name":"Escuela de Evocación","description":"Tus hechizos de evocación son más potentes y no afectan a aliados.","effect":{"modifiers":{"spell_damage_bonus":1}}}]$$,
  $$[{"id":301,"name":"Bastón arcano","weight":4,"quantity":1,"description":"Foco arcano de madera de fresno.","equipable":true,"equipped":true,"effect":{"damage":"1d6","type":"contundente"}},{"id":302,"name":"Libro de hechizos","weight":3,"quantity":1,"description":"Contiene todos tus hechizos.","equipable":false,"equipped":false,"effect":null},{"id":303,"name":"Poción de curación mayor","weight":0.5,"quantity":1,"description":"Recuperas 4d4+4 puntos de vida.","equipable":false,"equipped":false,"effect":{"heal":"4d4+4"}}]$$,
  $$[{"id":201,"name":"Bola de fuego","description":"Explosión de fuego en un punto elegido.","ritual":false,"concentration":false,"prepared":true,"level":3,"effect":{"damage":"8d6","type":"fuego","range":"150 pies","components":"V, S, M","duration":"Instantáneo"}},{"id":202,"name":"Proyectil mágico","description":"Tres dardos de energía mágica.","ritual":false,"concentration":false,"prepared":true,"level":1,"effect":{"damage":"1d4+1","type":"mágico","range":"120 pies","components":"V, S","duration":"Instantáneo"}},{"id":203,"name":"Escudo","description":"+5 CA hasta el inicio de tu siguiente turno.","ritual":false,"concentration":false,"prepared":true,"level":1,"effect":{"ac_bonus":5,"range":"Personal","components":"V, S","duration":"1 turno"}},{"id":204,"name":"Invisibilidad","description":"Una criatura que toques se vuelve invisible.","ritual":false,"concentration":true,"prepared":false,"level":2,"effect":{"range":"Toque","components":"V, S, M","duration":"Concentración, hasta 1 hora"}}]$$,
  $${"id":2,"title":"Historia de Lirael Moonshadow","content":"Lirael abandonó su hogar élfico en búsqueda de un tomo arcano robado por un nigromante. Sus ojos brillan con luz propia al lanzar hechizos."}$$,
  $$[]$$,
  true, 2
),
(
  3, 'Borin Battlehammer', 'Cleric,Fighter', 'Enano de las Montañas', 'Soldier', 6,
  '/images/characters/borin.png',
  '161016091712', '000011', '000100000101001000',
  25, 52, 52, 0,
  'd8', 6, 6,
  'wis', '443322000000000000',
  $$[{"id":21,"name":"Ataque con mazo","description":"Ataque cuerpo a cuerpo con mazo de guerra.","recharge":"PerTurn","uses":{"current":1,"max":1}},{"id":22,"name":"Destrozar","description":"Ataque que puede usar el retroceso de impacto.","recharge":"SR","uses":{"current":1,"max":1}}]$$,
  $$[{"id":23,"name":"Curación divina","description":"Gastas un espacio para curar 1d8 + SAB a un ser tocado.","recharge":"LR","uses":{"current":3,"max":3}}]$$,
  $$["Armaduras pesadas","Herramientas de herrero","Juego de dados"]$$,
  $$[{"id":21,"name":"Repeler No-muertos","description":"Los no-muertos deben superar SAB CD 14 o huyen de ti.","effect":{"action":{"recharge":"SR","uses":{"current":1,"max":1}}}},{"id":22,"name":"Segundo Aliento","description":"Recuperas 1d10 + nivel de guerrero puntos de vida.","effect":{"action":{"heal":"1d10 + @level","recharge":"SR","uses":{"current":1,"max":1}}}}]$$,
  $$[{"id":401,"name":"Mazo de guerra","weight":4,"quantity":1,"description":"Símbolo sagrado de Moradin.","equipable":true,"equipped":true,"effect":{"damage":"1d8","type":"contundente"}},{"id":402,"name":"Escudo","weight":6,"quantity":1,"description":"Escudo de hierro enano.","equipable":true,"equipped":true,"effect":{"ac_bonus":2}},{"id":403,"name":"Cota de malla","weight":55,"quantity":1,"description":"Armadura pesada enana.","equipable":true,"equipped":true,"effect":{"ac_bonus":6}}]$$,
  $$[{"id":301,"name":"Curar heridas","description":"Una criatura recupera 1d8 + SAB puntos de golpe.","ritual":false,"concentration":false,"prepared":true,"level":1,"effect":{"damage":"1d8+mod","type":"curación","range":"Toque","components":"V, S","duration":"Instantáneo"}},{"id":302,"name":"Escudo de la fe","description":"+2 CA a una criatura visible.","ritual":false,"concentration":true,"prepared":true,"level":1,"effect":{"ac_bonus":2,"range":"60 pies","components":"V, S, M","duration":"Concentración, hasta 10 min"}},{"id":303,"name":"Arma espiritual","description":"Arma espectral que ataca a tus enemigos.","ritual":false,"concentration":false,"prepared":true,"level":2,"effect":{"damage":"1d8+mod","type":"de fuerza","range":"60 pies","components":"V, S","duration":"1 minuto"}}]$$,
  $${"id":3,"title":"Historia de Borin Battlehammer","content":"Borin sirvió como capellán en el ejército enano. Perdió a su comandante en el paso de hierro y ahora busca redención en nombre de Moradin."}$$,
  $$[]$$,
  true, 3
)
ON CONFLICT (id) DO NOTHING;
SELECT setval('"Character_id_seq"', 3, true);

-- ── CharacterXCampaign ────────────────────────────────────────────────
INSERT INTO "CharacterXCampaign" ("characterId", "campaignId") VALUES
(1, 1), (1, 3),
(2, 1),
(3, 2)
ON CONFLICT ("characterId", "campaignId") DO NOTHING;

-- ── Creatures ─────────────────────────────────────────────────────────
INSERT INTO "Creature" (
    id, name, size, "creatureType", alignment, cr,
    ac, "acNote", "hpMax", "currentHp", "hpFormula", speed,
    "abilityScores", "savingThrows", skills,
    "damageImmunities", "damageResistances", "conditionImmunities",
    senses, languages,
    "specialTraits", actions, "bonusActions", reactions,
    "gmNotes", "playerVisibleNotes",
    "folderId", "imageUrl", active, "ownerId"
) VALUES
(
  1, 'Goblin', 'Pequeño', 'Humanoide (goblinoide)', 'Neutral Malvado', '1/4',
  15, 'armadura de cuero tachonada, escudo', 7, 7, '2d6', '9 m',
  '081410100808',
  '[]',
  $$[{"name":"Sigilo","mod":6}]$$,
  '', '', '',
  'Visión en la oscuridad 18 m, Percepción pasiva 9', 'Común, Goblin',
  $$[{"name":"Escape Nimble","description":"Puede Desvincularse o Esconderse como acción adicional en cada turno."}]$$,
  $$[{"name":"Cimitarra","description":"Ataque cuerpo a cuerpo: +4 al ataque, 1d6+2 de daño cortante."},{"name":"Arco corto","description":"Ataque a distancia: +4 al ataque, 1d6+2 de daño perforante."}]$$,
  '[]', '[]',
  'Patrullan las ruinas del este. Aliados de Klarg.',
  'Criaturas pequeñas y furtivas que hablan goblin.',
  1, NULL, true, 1
),
(
  2, 'Hobgoblin Capitán', 'Mediano', 'Humanoide (goblinoide)', 'Legal Malvado', '3',
  17, 'cota de malla, escudo', 52, 52, '8d8+16', '9 m',
  '151214121013',
  $$[{"ability":"INT","mod":3},{"ability":"SAB","mod":2}]$$,
  $$[{"name":"Historia","mod":3}]$$,
  '', '', '',
  'Visión en la oscuridad 18 m, Percepción pasiva 10', 'Común, Goblin',
  $$[{"name":"Disciplina Marcial","description":"Puede usar su reacción para que un hobgoblin aliado a 9 m relance una tirada de ataque fallida."}]$$,
  $$[{"name":"Ataque múltiple","description":"Realiza dos ataques cuerpo a cuerpo."},{"name":"Longsword","description":"Ataque c·a·c: +4 al ataque, 1d8+2 cortante (1d10+2 a dos manos)."},{"name":"Escudo de guerrero","description":"Hasta el siguiente turno, los ataques contra él tienen desventaja."}]$$,
  '[]', '[]',
  'Líder del puesto avanzado. Conoce el campamento principal.',
  'Un hobgoblin imponente con armadura brillante.',
  3, NULL, true, 1
),
(
  3, 'Lobo Gigante', 'Grande', 'Bestia', 'No alineado', '1',
  13, 'armadura natural', 26, 26, '4d10+4', '15 m',
  '171513031207',
  '[]',
  $$[{"name":"Percepción","mod":3},{"name":"Sigilo","mod":4}]$$,
  '', '', '',
  'Percepción pasiva 13', 'Goblin, Lobo gigante (no habla)',
  $$[{"name":"Olfato agudo","description":"Ventaja en pruebas de Percepción basadas en el olfato."},{"name":"Tácticas de jauría","description":"Ventaja en ataques si un aliado no incapacitado está a 1,5 m del objetivo."}]$$,
  $$[{"name":"Mordisco","description":"Ataque c·a·c: +5, 2d6+3 perforante. Si falla FUE CD 13, el objetivo cae derribado."}]$$,
  '[]', '[]',
  'Montura de los jinetes goblin. Tres en el perímetro norte.',
  'Un enorme lobo negro con ojos amarillos.',
  2, NULL, true, 1
),
(
  4, 'Esqueleto', 'Mediano', 'No-muerto', 'Legal Malvado', '1/4',
  13, 'restos de armadura', 13, 13, '2d8+4', '9 m',
  '101415060805',
  '[]', '[]',
  'veneno', '', 'agotamiento, envenenado',
  'Visión en la oscuridad 18 m, Percepción pasiva 9',
  'Entiende los idiomas que conocía en vida pero no puede hablar',
  '[]',
  $$[{"name":"Cimitarra","description":"Ataque c·a·c: +4, 1d6+2 cortante."},{"name":"Arco corto","description":"Ataque a distancia: +4, 1d6+2 perforante."}]$$,
  '[]', '[]',
  'Animados por el nigromante del castillo. Patrullan la cripta.',
  'Huesos reanimados que se mueven con una voluntad sobrenatural.',
  NULL, NULL, true, 1
)
ON CONFLICT (id) DO NOTHING;
SELECT setval('"Creature_id_seq"', 4, true);

-- ── CreatureXCampaign ─────────────────────────────────────────────────
INSERT INTO "CreatureXCampaign" ("creatureId", "campaignId") VALUES
(1, 1), (2, 1), (2, 2), (3, 1), (4, 2)
ON CONFLICT ("creatureId", "campaignId") DO NOTHING;

-- ── Notes ─────────────────────────────────────────────────────────────
INSERT INTO "Note" (id, "campaignId", "authorId", title, content, "isPublic", active, "createdAt") VALUES
(1, 1, 1, 'Sesión 1: El Inicio',                'Los aventureros se reunieron en la Posada del Dragón Rojo en Leilon. El alcalde Harbin Wester los contrató para investigar unas minas al noreste. El grupo estaba formado por Thorn Ironwood (explorador) y Lirael Moonshadow (maga).', true,  true, '2026-01-10'),
(2, 1, 1, 'Klarg el Hobgoblin — Notas privadas','Klarg sabe la ubicación del campamento de bugbears al norte. No revelarlo hasta que los jugadores lo capturen. Tiene un medallón robado que pertenece a la familia Rockseeker.',                true,  false,'2026-01-10'),
(3, 1, 1, 'Mapa de las Minas',                   'La entrada norte está bloqueada por un derrumbe. La sala central tiene una fuente mágica que restaura un PV al beber (una vez por descanso largo). El nivel inferior contiene el tesoro principal.',                       true,  true, '2026-01-17'),
(4, 1, 1, 'Sesión 3: La Traición',               'Sildar fue capturado por los Puños de Hierro. El grupo negoció su liberación a cambio de escoltar un cargamento. Thorn descubrió que el comerciante local es un informante.',                                           true,  true, '2026-01-31'),
(5, 2, 1, 'Llegada a Barovia',                   'El grupo despertó envuelto en niebla. Las puertas de Barovia se cerraron detrás de ellos. Los aldeanos los miraron con miedo.',                                                                                          true,  true, '2026-02-07'),
(6, 2, 1, 'El Castillo Ravenloft — Secretos',    'Strahd tiene tres aliados en el castillo. El corazón de la oscuridad está en la cripta del sótano. La reliquia del sol puede debilitarlo combinada con agua sagrada.',                                                   false, true, '2026-02-14'),
(7, 3, 2, 'La Jungla',                           'El calor y la humedad son sofocantes. El grupo encontró rastros de una expedición anterior abandonada hace 3 meses.',                                                                                                   true,  true, '2026-03-01')
ON CONFLICT (id) DO NOTHING;
SELECT setval('"Note_id_seq"', 7, true);

-- ── Messages ──────────────────────────────────────────────────────────
INSERT INTO "Message" (id, "chatId", "senderId", "characterId", type, content, "isWhisper", "whisperTo", timestamp, "senderUsername", "characterName", "characterAvatar") VALUES
( 1, 1, 2, 1, 'text',           '¡Vamos a explorar la cueva!',                                                                                                                       false, NULL, '2026-05-10T10:00:00Z', 'Player_Anna', 'Thorn Ironwood', '/avatars/thorn.png'),
( 2, 1, 1, NULL, 'text',        'La entrada está oscura y húmeda.',                                                                                                                  false, NULL, '2026-05-10T10:01:00Z', 'GM_Dave',     NULL,            NULL),
( 3, 1, 2, 1, 'dice_roll',      '{"dice":"3d6","results":[3,5,2],"total":10,"advantage":false,"disadvantage":false}',                                                               false, NULL, '2026-05-10T10:02:00Z', 'Player_Anna', 'Thorn Ironwood', '/avatars/thorn.png'),
( 4, 1, 1, NULL, 'whisper',     'Te noto muy callado, ¿todo bien?',                                                                                                                  true,  3,    '2026-05-10T10:03:00Z', 'GM_Dave',     NULL,            NULL),
( 5, 1, 2, 1, 'ability_append','{"abilityName":"Furia Salvaje","description":"Ventaja en ataques c·a·c durante 1 min."}',                                                           false, NULL, '2026-05-10T10:04:00Z', 'Player_Anna', 'Thorn Ironwood', '/avatars/thorn.png'),
( 6, 1, 1, NULL, 'note_append', '{"noteTitle":"Pistas encontradas","snippet":"Hallisteis un diario con coordenadas y el símbolo de una serpiente alada."}',                          false, NULL, '2026-05-10T10:05:00Z', 'GM_Dave',     NULL,            NULL),
( 7, 1, 2, 1, 'text',           '¿Qué hay escrito en el diario?',                                                                                                                    false, NULL, '2026-05-10T10:06:00Z', 'Player_Anna', 'Thorn Ironwood', '/avatars/thorn.png'),
( 8, 1, 1, NULL, 'text',        'Las páginas están deterioradas pero distingues coordenadas y el símbolo de una serpiente alada.',                                                   false, NULL, '2026-05-10T10:07:00Z', 'GM_Dave',     NULL,            NULL),
( 9, 1, 2, 1, 'dice_roll',      '{"dice":"1d20","results":[17],"total":17,"advantage":false,"disadvantage":false}',                                                                 false, NULL, '2026-05-10T10:08:00Z', 'Player_Anna', 'Thorn Ironwood', '/avatars/thorn.png'),
(10, 1, 1, NULL, 'text',        'Con ese resultado en Arcanos, reconoces el símbolo: es la marca de la Cofradía de la Sombra Escarlata.',                                           false, NULL, '2026-05-10T10:08:30Z', 'GM_Dave',     NULL,            NULL),
(11, 1, 2, 1, 'text',           'Thorn aprieta el diario contra su pecho. «Esos bastardos», murmura.',                                                                               false, NULL, '2026-05-10T10:09:00Z', 'Player_Anna', 'Thorn Ironwood', '/avatars/thorn.png'),
(12, 1, 1, NULL, 'text',        'De repente escucháis pasos al fondo del pasillo. Lentos, pesados... y se acercan.',                                                                 false, NULL, '2026-05-10T10:10:00Z', 'GM_Dave',     NULL,            NULL),
(13, 1, 2, 1, 'ability_append','{"abilityName":"Sigilo Experto","description":"Thorn se funde con las sombras, ventaja en Sigilo."}',                                               false, NULL, '2026-05-10T10:10:30Z', 'Player_Anna', 'Thorn Ironwood', '/avatars/thorn.png'),
(14, 1, 2, 1, 'dice_roll',      '{"dice":"2d20","results":[12,19],"total":19,"advantage":true,"disadvantage":false}',                                                               false, NULL, '2026-05-10T10:10:45Z', 'Player_Anna', 'Thorn Ironwood', '/avatars/thorn.png'),
(15, 1, 1, NULL, 'text',        'La guardia pasa de largo sin verte. Espera un turno antes de actuar.',                                                                              false, NULL, '2026-05-10T10:11:00Z', 'GM_Dave',     NULL,            NULL),
(16, 1, 1, NULL, 'whisper',     'El guardia lleva un medallón que reconoces: es de tu antiguo mentor.',                                                                              true,  2,    '2026-05-10T10:11:30Z', 'GM_Dave',     NULL,            NULL),
(17, 1, 2, 1, 'text',           'Salgo de las sombras y le pongo la hoja en el cuello. «¿Dónde está Gareth?»',                                                                       false, NULL, '2026-05-10T10:12:00Z', 'Player_Anna', 'Thorn Ironwood', '/avatars/thorn.png'),
(18, 1, 1, NULL, 'text',        'El guardia tiembla. «¡No lo sé, juro que no lo sé! Solo... solo seguí órdenes.»',                                                                  false, NULL, '2026-05-10T10:12:45Z', 'GM_Dave',     NULL,            NULL),
(19, 2, 1, NULL, 'text',        'La niebla os envuelve mientras las puertas de Barovia se cierran de golpe.',                                                                        false, NULL, '2026-02-07T20:00:00Z', 'GM_Dave',     NULL,            NULL),
(20, 2, 5, NULL, 'text',        '¿Podemos volver por donde vinimos?',                                                                                                                false, NULL, '2026-02-07T20:01:00Z', 'Player_Dan',  NULL,            NULL),
(21, 2, 1, NULL, 'text',        'Las puertas están selladas. Solo hay un camino: hacia delante.',                                                                                    false, NULL, '2026-02-07T20:01:30Z', 'GM_Dave',     NULL,            NULL),
(22, 3, 2, NULL, 'text',        'La jungla es sofocante. Hay rastros de una expedición anterior.',                                                                                   false, NULL, '2026-03-01T18:00:00Z', 'Player_Anna', NULL,            NULL),
(23, 3, 9, NULL, 'dice_roll',   '{"dice":"1d20","results":[14],"total":14,"advantage":false,"disadvantage":false}',                                                                 false, NULL, '2026-03-01T18:01:00Z', 'Player_Hugo', NULL,            NULL)
ON CONFLICT (id) DO NOTHING;
SELECT setval('"Message_id_seq"', 23, true);

-- ── Creature notes ────────────────────────────────────────────────────
INSERT INTO "CreatureNote" (id, "creatureId", title, content, visibility, "authorId", "createdAt", active) VALUES
(1, 1, 'Tácticas de combate',       'Usa Escape Nimble para retirarse cuando tiene desventaja. Prefiere atacar en grupo desde la oscuridad.', 'gm',           1, '2024-10-01', true),
(2, 1, 'Descripción para jugadores','Una criatura pequeña y escurridiza con ojos que brillan en la oscuridad y dientes muy afilados.',        'players_view', 1, '2024-10-01', true),
(3, 4, 'Origen del esqueleto',      'Animado por el nigromante que habita la cripta norte. Obedece su voluntad ciegamente.',                  'gm',           1, '2024-11-01', true),
(4, 4, 'Lo que los aventureros saben','Se mueven sin descanso y no sienten dolor. Atacar el cráneo parece la forma más efectiva.',           'players_edit', 1, '2024-11-01', true)
ON CONFLICT (id) DO NOTHING;
SELECT setval('"CreatureNote_id_seq"', 4, true);

-- ── Availability (current week, ISO Monday = DATE_TRUNC('week')) ───────
WITH w AS (SELECT DATE_TRUNC('week', CURRENT_DATE)::date AS mon)
INSERT INTO "Availability" ("userId", date, slots)
SELECT * FROM (
  SELECT 1,  mon,     'tarde,tarde_noche,noche'           FROM w UNION ALL
  SELECT 1,  mon + 2, 'noche,madrugada'                   FROM w UNION ALL
  SELECT 1,  mon + 4, 'tarde,tarde_noche'                 FROM w UNION ALL
  SELECT 1,  mon + 5, 'manana,mediodia,tarde,tarde_noche' FROM w UNION ALL
  SELECT 2,  mon + 1, 'tarde,tarde_noche'                 FROM w UNION ALL
  SELECT 2,  mon + 2, 'tarde,noche'                       FROM w UNION ALL
  SELECT 2,  mon + 4, 'tarde_noche,noche'                 FROM w UNION ALL
  SELECT 2,  mon + 5, 'mediodia,tarde,tarde_noche'        FROM w UNION ALL
  SELECT 3,  mon,     'noche,madrugada'                   FROM w UNION ALL
  SELECT 3,  mon + 2, 'tarde_noche,noche'                 FROM w UNION ALL
  SELECT 3,  mon + 3, 'tarde,tarde_noche'                 FROM w UNION ALL
  SELECT 3,  mon + 5, 'amanecer,manana,mediodia'          FROM w UNION ALL
  SELECT 4,  mon,     'tarde,tarde_noche'                 FROM w UNION ALL
  SELECT 4,  mon + 2, 'noche'                             FROM w UNION ALL
  SELECT 4,  mon + 4, 'tarde'                             FROM w UNION ALL
  SELECT 4,  mon + 5, 'tarde,tarde_noche,noche'           FROM w UNION ALL
  SELECT 5,  mon + 1, 'amanecer,manana'                   FROM w UNION ALL
  SELECT 5,  mon + 3, 'tarde,tarde_noche'                 FROM w UNION ALL
  SELECT 5,  mon + 6, 'mediodia,tarde'                    FROM w UNION ALL
  SELECT 6,  mon,     'mediodia,tarde'                    FROM w UNION ALL
  SELECT 6,  mon + 2, 'tarde,tarde_noche'                 FROM w UNION ALL
  SELECT 6,  mon + 5, 'noche,madrugada'                   FROM w UNION ALL
  SELECT 7,  mon + 2, 'manana,mediodia'                   FROM w UNION ALL
  SELECT 7,  mon + 4, 'tarde_noche,noche'                 FROM w UNION ALL
  SELECT 7,  mon + 6, 'tarde,noche'                       FROM w UNION ALL
  SELECT 8,  mon + 1, 'noche,madrugada'                   FROM w UNION ALL
  SELECT 8,  mon + 3, 'tarde_noche'                       FROM w UNION ALL
  SELECT 8,  mon + 5, 'tarde,tarde_noche'                 FROM w UNION ALL
  SELECT 9,  mon,     'manana'                            FROM w UNION ALL
  SELECT 9,  mon + 2, 'mediodia,tarde'                    FROM w UNION ALL
  SELECT 9,  mon + 4, 'noche'                             FROM w UNION ALL
  SELECT 10, mon + 1, 'tarde,tarde_noche'                 FROM w UNION ALL
  SELECT 10, mon + 3, 'manana,mediodia'                   FROM w UNION ALL
  SELECT 10, mon + 5, 'amanecer,manana'                   FROM w
) AS t("userId", date, slots)
ON CONFLICT ("userId", date) DO NOTHING;
