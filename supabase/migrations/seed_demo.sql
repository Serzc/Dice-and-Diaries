-- =====================================================================
-- Dice and Diaries — Demo Seed Script
-- Wipes all existing data and inserts a showcase dataset.
-- Run in the Supabase SQL Editor.
--
-- Demo accounts (all share password: demo1234):
--   dungeon_master   — Game Master
--   arcane_rogue     — Player (Lyra)
--   iron_cleric      — Player (Tormund)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 1. Wipe all tables ───────────────────────────────────────────────
TRUNCATE TABLE
  "NoteFolderContent", "NotePermission", "CampaignNoteFolder",
  "CreatureNote", "CreatureFolderContent", "CreatureXCampaign",
  "SpellXCreature", "SpellXCharacter", "ItemXCharacter",
  "CharacterXCampaign", "UserXCampaign",
  "Message", "Chat", "Note",
  "Creature", "CreatureFolder",
  "Character", "Campaign",
  "Availability",
  "Spell", "Item",
  "User"
RESTART IDENTITY CASCADE;

-- ── 2. Users ──────────────────────────────────────────────────────────
INSERT INTO "User" (username, displayName, email, passwordHash, bio, joinedAt) VALUES
  ('dungeon_master', 'Aldric el Sabio',
   'aldric@demo.com',
   crypt('demo1234', gen_salt('bf', 10)),
   'Game Master con diez años de experiencia y una debilidad por los vampiros.',
   '2026-01-15'),
  ('arcane_rogue', 'Lyra Shadowstep',
   'lyra@demo.com',
   crypt('demo1234', gen_salt('bf', 10)),
   'Jugadora apasionada por personajes de sigilo y caos controlado.',
   '2026-01-20'),
  ('iron_cleric', 'Tormund Pedernal',
   'tormund@demo.com',
   crypt('demo1234', gen_salt('bf', 10)),
   'Clérigo de Pelor. Primero cura, luego pregunta.',
   '2026-01-20');
-- dungeon_master=1  arcane_rogue=2  iron_cleric=3

-- ── 3. Campaigns ──────────────────────────────────────────────────────
INSERT INTO "Campaign" (name, description, imageUrl, active, ownerId, inviteCode) VALUES
  ('La Maldición de Strahd',
   'El grupo se adentra en Barovia, una tierra atrapada en la niebla y gobernada por el vampiro Strahd von Zarovich. Solo la valentía y el ingenio pueden romper la maldición.',
   NULL, true,  1, 'STRAHD01'),
  ('El Templo Olvidado',
   'Una expedición arqueológica a un templo de dioses olvidados. Nadie sabe qué duerme en sus cámaras más profundas.',
   NULL, false, 1, 'TEMPLE02');
-- Strahd=1  Templo=2

-- ── 4. Campaign membership ────────────────────────────────────────────
INSERT INTO "UserXCampaign" (userId, campaignId, role) VALUES
  (1, 1, 'gm'), (2, 1, 'player'), (3, 1, 'player'),
  (1, 2, 'gm'), (2, 2, 'player');

-- ── 5. Characters ─────────────────────────────────────────────────────
-- abilityScores format: 2 digits each, order STR/DEX/CON/INT/WIS/CHA
-- saveProficiencies:    6 binary digits, same order
-- skillProficiencies:   18 chars (0/1/2) — acrobatics, animal_handling, arcana,
--   athletics, deception, history, insight, intimidation, investigation,
--   medicine, nature, perception, performance, persuasion, religion,
--   sleight_of_hand, stealth, survival
-- spellSlots:           18 chars — 2 per level (max, current), levels 1–9

INSERT INTO "Character" (
  name, classes, species, background, level, appearance,
  abilityScores, saveProficiencies, skillProficiencies,
  speed, hpMax, currentHp, tempHp,
  hitDiceType, hitDiceTotal, hitDiceRemaining,
  spellcastingAbility, spellSlots,
  actions, bonusActions, features, otherProficiencies,
  inventory, spells, characterNote, proficiencyList,
  active, ownerId
) VALUES
-- ── Lyra Shadowstep — Rogue 5 ────────────────────────────────────────
(
  'Lyra Shadowstep', 'Rogue', 'Elfa', 'Criminal', 5,
  'Elfa de cabello negro azabache y ojos plateados. Complexión delgada, siempre viste de negro con una capa de capucha.',
  '101814121014',       -- STR=10 DEX=18 CON=14 INT=12 WIS=10 CHA=14
  '010100',             -- DEX + INT saves
  '100010001001000120', -- acrobatics, deception, investigation, perception, sleight_of_hand, stealth(expert)
  30, 38, 38, 0, 'd8', 5, 5,
  NULL, '000000000000000000',
  '[{"id":"a1","name":"Daga","description":"Ataque cuerpo a cuerpo o a distancia.","attackBonus":6,"damage":"1d4+4","damageType":"perforante"},{"id":"a2","name":"Ballesta de mano","description":"Ataque a distancia.","attackBonus":6,"damage":"1d6+4","damageType":"perforante"}]',
  '[{"id":"b1","name":"Ataque astuto","description":"Usa Esconderse o Desengancharse como acción adicional."}]',
  '[{"id":"f1","name":"Ataque furtivo","description":"Inflige 3d6 de daño extra cuando tiene ventaja o un aliado adyacente al objetivo.","effect":""},{"id":"f2","name":"Evasión","description":"Si falla una tirada de DES contra un efecto en área, no sufre daño.","effect":""},{"id":"f3","name":"Mente escurridiza","description":"Gana competencia en tiradas de salvación de INT.","effect":""}]',
  '["Armas simples","Espadas largas","Espadas cortas","Ballestas de mano","Herramientas de ladrón","Herramientas de falsificación"]',
  '[{"id":"i1","name":"Daga","quantity":3,"weight":0.5,"description":"Arma ligera arrojadiza.","effect":"{}","equipped":true},{"id":"i2","name":"Armadura de cuero tachonado","quantity":1,"weight":13.5,"description":"CA 12 + MOD DES.","effect":"{\"ac_bonus\":12}","equipped":true},{"id":"i3","name":"Herramientas de ladrón","quantity":1,"weight":1,"description":"Para abrir cerraduras y desactivar trampas.","effect":"{}","equipped":false},{"id":"i4","name":"Cuerda de seda (15 m)","quantity":1,"weight":2.5,"description":"Ligera y resistente.","effect":"{}","equipped":false}]',
  NULL,
  '{"id":"cn1","title":"Mi historia","content":"Crecí en las calles de Waterdeep. Aprendí a robar antes que a leer. Ahora uso mis habilidades al servicio de quienes lo necesitan, siempre que paguen bien."}',
  '["Élfico","Común","Enano"]',
  true, 2
),
-- ── Tormund Pedernal — Cleric 5 (Life Domain) ────────────────────────
(
  'Tormund Pedernal', 'Cleric', 'Enano', 'Acolito', 5,
  'Enano de barba rojiza trenzada con anillos dorados, armadura de placas reluciente y maza de guerra en el cinturón.',
  '161014101812',       -- STR=16 DEX=10 CON=14 INT=10 WIS=18 CHA=12
  '000011',             -- WIS + CHA saves
  '000001100100011000', -- history, insight, medicine, persuasion, religion
  25, 44, 44, 0, 'd8', 5, 5,
  'wis', '443322000000000000', -- L1 max=4/cur=4  L2 max=3/cur=3  L3 max=2/cur=2
  '[{"id":"a1","name":"Maza de guerra","description":"Ataque cuerpo a cuerpo.","attackBonus":5,"damage":"1d8+3","damageType":"contundente"},{"id":"a2","name":"Palabra de radical","description":"Un objetivo visible a 18 m recibe daño radiante.","attackBonus":5,"damage":"2d6+4","damageType":"radiante"}]',
  '[{"id":"b1","name":"Curación bendita","description":"Al lanzar un conjuro de curación de nivel 1+, restaura al menos 2 + nivel del conjuro PG."}]',
  '[{"id":"f1","name":"Canal de divinidad: Expulsar no-muertos","description":"Los no-muertos que fallen una tirada de SAB (CD 13) quedan expulsados durante 1 minuto.","effect":""},{"id":"f2","name":"Destrucción sagrada","description":"Al golpear a un no-muerto, inflige 5 de daño radiante adicional.","effect":""},{"id":"f3","name":"Canal de divinidad (2/descanso)","description":"Puede usar el canal de divinidad dos veces por descanso largo.","effect":""}]',
  '["Armaduras ligeras","Armaduras medias","Armaduras pesadas","Escudos","Armas simples","Herramientas de herrero"]',
  '[{"id":"i1","name":"Maza de guerra","quantity":1,"weight":4.5,"description":"Arma marcial cuerpo a cuerpo.","effect":"{}","equipped":true},{"id":"i2","name":"Armadura de placas","quantity":1,"weight":32.5,"description":"CA 18.","effect":"{\"ac_bonus\":18}","equipped":true},{"id":"i3","name":"Escudo sagrado","quantity":1,"weight":3,"description":"CA +2.","effect":"{\"ac_bonus\":2}","equipped":true},{"id":"i4","name":"Símbolo sagrado","quantity":1,"weight":0.5,"description":"Foco divino de Pelor.","effect":"{}","equipped":true},{"id":"i5","name":"Poción de curación","quantity":3,"weight":0.5,"description":"Recupera 2d4+2 PG.","effect":"{}","equipped":false}]',
  '[{"id":"s1","name":"Curar heridas","level":1,"school":"Evocación","castingTime":"1 acción","range":"Toque","duration":"Instantáneo","components":"V, S","description":"Recupera 1d8 + MOD SAB PG al tocar una criatura."},{"id":"s2","name":"Palabra de sanación","level":1,"school":"Evocación","castingTime":"1 acción adicional","range":"18 m","duration":"Instantáneo","components":"V","description":"Una criatura a 18 m recupera 1d4 + MOD SAB PG."},{"id":"s3","name":"Curación de masa","level":3,"school":"Evocación","castingTime":"1 acción","range":"18 m","duration":"Instantáneo","components":"V, S","description":"Hasta 6 criaturas recuperan 3d8 + MOD SAB PG cada una."},{"id":"s4","name":"Luz","level":0,"school":"Evocación","castingTime":"1 acción","range":"Toque","duration":"1 hora","components":"V, M","description":"Un objeto emite luz brillante en 6 m."},{"id":"s5","name":"Orientación","level":0,"school":"Adivinación","castingTime":"1 acción","range":"Toque","duration":"Concentración (1 min)","components":"V, S","description":"Añade 1d4 a una prueba de característica."}]',
  '{"id":"cn2","title":"Crónica de Pelor","content":"El dios del sol me encomendó proteger a los inocentes de las sombras. En Barovia, la oscuridad es total. Pero mientras Pelor brille, habrá esperanza."}',
  '["Enano","Común"]',
  true, 3
),
-- ── Kaelor el Gris — Wizard 3 (Campaign 2) ───────────────────────────
(
  'Kaelor el Gris', 'Wizard', 'Humano', 'Sabio', 3,
  'Humano delgado de mediana edad, cabello blanco prematuro y gafas redondas. Siempre carga con su libro de hechizos bajo el brazo.',
  '081212181410',       -- STR=8 DEX=12 CON=12 INT=18 WIS=14 CHA=10
  '000110',             -- INT + WIS saves
  '002001001000000000', -- arcana(expert), history, investigation
  30, 18, 18, 0, 'd6', 3, 3,
  'int', '442200000000000000', -- L1 max=4/cur=4  L2 max=2/cur=2
  '[{"id":"a1","name":"Bastón","description":"Ataque cuerpo a cuerpo.","attackBonus":2,"damage":"1d6-1","damageType":"contundente"}]',
  NULL,
  '[{"id":"f1","name":"Recuperación arcana","description":"Una vez por descanso corto, recupera ranuras de conjuro con un nivel combinado máximo igual a la mitad del nivel de mago.","effect":""},{"id":"f2","name":"Escuela de Evocación","description":"Puede dar forma a sus hechizos para evitar dañar a aliados con efectos en área.","effect":""}]',
  '["Dagas","Dardos","Hondas","Bastones","Ballestas ligeras"]',
  '[{"id":"i1","name":"Libro de hechizos","quantity":1,"weight":3,"description":"Contiene todos los hechizos conocidos de Kaelor.","effect":"{}","equipped":true},{"id":"i2","name":"Componentes de hechizos","quantity":1,"weight":1,"description":"Bolsa con componentes materiales variados.","effect":"{}","equipped":true},{"id":"i3","name":"Báculo arcano","quantity":1,"weight":2,"description":"Foco arcano.","effect":"{}","equipped":true}]',
  '[{"id":"s1","name":"Bola de fuego","level":3,"school":"Evocación","castingTime":"1 acción","range":"45 m","duration":"Instantáneo","components":"V, S, M","description":"Explosión de 8d6 de daño de fuego en esfera de 6 m de radio."},{"id":"s2","name":"Proyectil mágico","level":1,"school":"Evocación","castingTime":"1 acción","range":"36 m","duration":"Instantáneo","components":"V, S","description":"Tres dardos de energía que impactan automáticamente, 1d4+1 cada uno."},{"id":"s3","name":"Rayo de escarcha","level":0,"school":"Evocación","castingTime":"1 acción","range":"18 m","duration":"Instantáneo","components":"V, S","description":"+6 a golpear, 1d8 frío, reduce velocidad a 0 hasta el siguiente turno."}]',
  '{"id":"cn3","title":"Notas de investigación","content":"El templo data del tercer milenio. Los glifos de la entrada mencionan un nombre impronunciable. Debo traducirlos antes de que el grupo avance más."}',
  '["Dracónico","Élfico","Enano","Común"]',
  true, 2
);
-- Lyra=1  Tormund=2  Kaelor=3

-- ── 6. Character ↔ Campaign ───────────────────────────────────────────
INSERT INTO "CharacterXCampaign" (characterId, campaignId) VALUES
  (1, 1), (2, 1),   -- Lyra y Tormund en Strahd
  (3, 2);            -- Kaelor en El Templo

-- ── 7. Creature folders ───────────────────────────────────────────────
INSERT INTO "CreatureFolder" (name, parentFolderId, ownerId) VALUES
  ('No-muertos', NULL, 1),   -- id=1
  ('Bestias',    NULL, 1);   -- id=2

-- ── 8. Creatures ──────────────────────────────────────────────────────
INSERT INTO "Creature" (
  name, size, creatureType, alignment, cr,
  ac, acNote, hpMax, currentHp, hpFormula, speed,
  abilityScores, savingThrows, skills,
  damageResistances, conditionImmunities,
  senses, languages,
  specialTraits, actions, bonusActions, reactions,
  gmNotes, playerVisibleNotes,
  folderId, active, ownerId
) VALUES
-- ── Vampiro Mestizo (ND 5) ────────────────────────────────────────────
(
  'Vampiro Mestizo', 'Mediano', 'No-muerto', 'Legal maligno', '5',
  15, 'Armadura natural', 82, 82, '11d8+33', '9 m, trepar 9 m',
  '161616111012',  -- STR=16 DEX=16 CON=16 INT=11 WIS=10 CHA=12
  '[{"ability":"DES","mod":4},{"ability":"SAB","mod":2}]',
  '[{"skill":"Percepción","mod":4},{"skill":"Sigilo","mod":4}]',
  'Contundente, perforante y cortante de ataques no mágicos', NULL,
  'Oscuridad hasta 18 m', 'Lenguas que conocía en vida',
  '[{"name":"Regeneración","description":"Recupera 10 PG al inicio de su turno si tiene al menos 1 PG y no está bajo luz solar o agua corriente."},{"name":"Sensibilidad a la luz solar","description":"Desventaja en tiradas de ataque y pruebas de Percepción bajo luz solar directa."}]',
  '[{"name":"Agarre","description":"Ataque cuerpo a cuerpo: +5 a golpear, alcance 1.5 m. Impacto: 6 (1d6+3) contundente. El objetivo queda agarrado (CD 13)."},{"name":"Drenaje de vida","description":"Ataque contra objetivo agarrado: +5 a golpear. Impacto: 10 (2d6+3) necrótico. Reduce el máximo de PG del objetivo."}]',
  NULL, NULL,
  'Strahd tiene varios en el castillo. Son más peligrosos de noche. No les des la espalda si llegan a 0 PG: pueden regenerar.',
  'Una figura pálida de ojos enrojecidos que se mueve con gracia antinatural.',
  1, true, 1
),
-- ── Zombie (ND 1/4) ───────────────────────────────────────────────────
(
  'Zombie', 'Mediano', 'No-muerto', 'Sin alineamiento', '1/4',
  8, NULL, 22, 22, '3d8+9', '6 m',
  '130616030605',  -- STR=13 DEX=6 CON=16 INT=3 WIS=6 CHA=5
  NULL, NULL,
  NULL, 'Veneno',
  'Oscuridad hasta 18 m', 'Entiende idiomas que conocía en vida pero no puede hablar',
  '[{"name":"Resistencia a la destrucción","description":"Si el daño lo reduciría a 0 PG, hace una tirada de CON (CD 5 + daño recibido). Con éxito, queda con 1 PG."}]',
  '[{"name":"Golpe","description":"Ataque cuerpo a cuerpo: +3 a golpear, alcance 1.5 m. Impacto: 4 (1d6+1) contundente."}]',
  NULL, NULL,
  'Relleno fácil. Úsalos en primera fila para gastar recursos del grupo.',
  'Un cadáver animado que camina torpemente, con ojos sin vida.',
  1, true, 1
),
-- ── Lobo Terrible (ND 1) ──────────────────────────────────────────────
(
  'Lobo Terrible', 'Grande', 'Bestia', 'Sin alineamiento', '1',
  13, 'Pellejo natural', 37, 37, '5d10+10', '15 m',
  '171515031207',  -- STR=17 DEX=15 CON=15 INT=3 WIS=12 CHA=7
  NULL,
  '[{"skill":"Percepción","mod":3},{"skill":"Sigilo","mod":4}]',
  NULL, NULL, 'Oscuridad hasta 18 m', '--',
  '[{"name":"Olfato agudo","description":"Ventaja en pruebas de Percepción basadas en el olfato."},{"name":"Táctica de manada","description":"Ventaja en tiradas de ataque si al menos un aliado no incapacitado está adyacente al objetivo."}]',
  '[{"name":"Mordisco","description":"Ataque cuerpo a cuerpo: +5 a golpear, alcance 1.5 m. Impacto: 10 (2d6+3) perforante. El objetivo hace una tirada de STR (CD 13) o queda derribado."}]',
  NULL, NULL,
  'Los lobos del bosque de Svalich van en manadas de 3 a 6. Son más grandes y agresivos que los lobos normales.',
  'Un lobo enorme con pelaje gris oscuro y colmillos afilados como cuchillos.',
  2, true, 1
),
-- ── Goblin (ND 1/4) ───────────────────────────────────────────────────
(
  'Goblin', 'Pequeño', 'Humanoide', 'Neutral maligno', '1/4',
  15, 'Armadura de cuero y escudo', 7, 7, '2d6', '9 m',
  '081410100808',  -- STR=8 DEX=14 CON=10 INT=10 WIS=8 CHA=8
  NULL,
  '[{"skill":"Sigilo","mod":6}]',
  NULL, NULL, 'Oscuridad hasta 18 m', 'Común, Goblin',
  '[{"name":"Evasión astuta","description":"El goblin puede Desengancharse, Esconderse o Correr como acción adicional."}]',
  '[{"name":"Cimitarra","description":"Ataque cuerpo a cuerpo: +4 a golpear, alcance 1.5 m. Impacto: 5 (1d6+2) cortante."},{"name":"Arco corto","description":"Ataque a distancia: +4 a golpear, alcance 24/96 m. Impacto: 5 (1d6+2) perforante."}]',
  '[{"name":"Evasión astuta","description":"Esconderse o Desengancharse como acción adicional."}]',
  NULL,
  'Cobardes: si pierden más del 50% de sus aliados, huyen.',
  'Una criatura diminuta de piel verdosa con grandes orejas puntiagudas y ojos amarillos.',
  NULL, true, 1
);
-- Vampiro=1  Zombie=2  Lobo=3  Goblin=4

-- ── 9. Folder contents ────────────────────────────────────────────────
INSERT INTO "CreatureFolderContent" (folderId, creatureId) VALUES
  (1, 1), (1, 2),  -- No-muertos: Vampiro, Zombie
  (2, 3);          -- Bestias: Lobo Terrible

-- ── 10. Creatures ↔ Campaign 1 ───────────────────────────────────────
INSERT INTO "CreatureXCampaign" (creatureId, campaignId) VALUES
  (1, 1), (2, 1), (4, 1);  -- Vampiro, Zombie, Goblin en Strahd

-- ── 11. Creature notes ────────────────────────────────────────────────
INSERT INTO "CreatureNote" (creatureId, title, content, visibility, authorId) VALUES
  (1, 'Debilidades confirmadas',
   'Luz solar directa (desventaja + 20 daño radiante/turno), agua bendita (2d6), estaca de madera (paraliza). No pueden entrar a hogares sin invitación. Strahd los llama "hijos".',
   'gm', 1),
  (1, 'Descripción para jugadores',
   'Una figura pálida de movimientos elegantes y ojos que brillan como brasas rojas en la oscuridad.',
   'players', 1),
  (4, 'Táctica de los goblins',
   'Siempre tienen un vigía escondido. El primero que cae grita para avisar al resto. Si pierden más del 50% del grupo, huyen.',
   'gm', 1);

-- ── 12. Chats ─────────────────────────────────────────────────────────
INSERT INTO "Chat" (campaignId, active) VALUES
  (1, true),   -- Chat de Strahd, id=1
  (2, false);  -- Chat del Templo, id=2

-- ── 13. Messages (Chat 1 — sesión activa de Strahd) ──────────────────
-- Types: text | dice_roll | whisper | ability_append | note_append
INSERT INTO "Message" (
  chatId, senderId, characterId, type, content,
  isWhisper, whisperTo,
  senderUsername, characterName, characterAvatar, characterAppearance,
  timestamp
) VALUES
-- Narración del GM
(1, 1, NULL, 'text',
 'Bienvenidos a la sesión de hoy. El grupo emerge de la niebla y ve por primera vez las torres del Castillo Ravenloft. Una tormenta eléctrica azota las murallas. El portón de hierro cruje al viento.',
 false, NULL, 'dungeon_master', NULL, NULL, NULL,
 NOW() - INTERVAL '90 minutes'),

-- Lyra actúa en personaje
(1, 2, 1, 'text',
 'Lyra examina el portón buscando trampas o mecanismos ocultos antes de acercarse.',
 false, NULL, 'arcane_rogue', 'Lyra Shadowstep', NULL,
 'Elfa de cabello negro azabache y ojos plateados. Complexión delgada, siempre viste de negro con una capa de capucha.',
 NOW() - INTERVAL '88 minutes'),

-- Lyra tira dado (Investigación)
(1, 2, 1, 'dice_roll',
 '{"dice":"1d20+5","results":[14],"total":19,"advantage":false,"disadvantage":false}',
 false, NULL, 'arcane_rogue', 'Lyra Shadowstep', NULL,
 'Elfa de cabello negro azabache y ojos plateados.',
 NOW() - INTERVAL '87 minutes'),

-- GM responde al check
(1, 1, NULL, 'text',
 'Con un 19 en Investigación, Lyra detecta que las cadenas del portón están recién lubricadas. Alguien las usó en las últimas horas.',
 false, NULL, 'dungeon_master', NULL, NULL, NULL,
 NOW() - INTERVAL '85 minutes'),

-- Tormund actúa en personaje
(1, 3, 2, 'text',
 'Tormund empuña su maza y murmura una plegaria a Pelor. La cabeza de la maza emite un suave resplandor dorado.',
 false, NULL, 'iron_cleric', 'Tormund Pedernal', NULL,
 'Enano de barba rojiza trenzada con anillos dorados, armadura de placas reluciente.',
 NOW() - INTERVAL '83 minutes'),

-- Tormund comparte habilidad
(1, 3, 2, 'ability_append',
 '{"abilityName":"Destrucción sagrada","description":"Al golpear a un no-muerto, inflige 5 de daño radiante adicional."}',
 false, NULL, 'iron_cleric', 'Tormund Pedernal', NULL,
 'Enano de barba rojiza trenzada con anillos dorados, armadura de placas reluciente.',
 NOW() - INTERVAL '82 minutes'),

-- GM introduce enemigos
(1, 1, NULL, 'text',
 'El portón se abre lentamente. Desde las sombras emergen tres goblins con antorchas. Uno de ellos grita algo en goblin y apunta hacia el grupo.',
 false, NULL, 'dungeon_master', NULL, NULL, NULL,
 NOW() - INTERVAL '80 minutes'),

-- Tormund tira ataque
(1, 3, 2, 'dice_roll',
 '{"dice":"1d20+5","results":[18],"total":23,"advantage":false,"disadvantage":false}',
 false, NULL, 'iron_cleric', 'Tormund Pedernal', NULL,
 'Enano de barba rojiza trenzada con anillos dorados.',
 NOW() - INTERVAL '78 minutes'),

-- Tormund tira daño
(1, 3, 2, 'dice_roll',
 '{"dice":"1d8+3","results":[6],"total":9,"advantage":false,"disadvantage":false}',
 false, NULL, 'iron_cleric', 'Tormund Pedernal', NULL,
 'Enano de barba rojiza trenzada con anillos dorados.',
 NOW() - INTERVAL '77 minutes'),

-- GM narra resultado
(1, 1, NULL, 'text',
 'El goblin recibe el golpe de la maza y cae. Los otros dos retroceden con expresión de terror.',
 false, NULL, 'dungeon_master', NULL, NULL, NULL,
 NOW() - INTERVAL '75 minutes'),

-- Lyra susurra al GM
(1, 2, NULL, 'whisper',
 '¿Hay pistas sobre la ubicación de la llave del sótano? Vi un símbolo grabado en el portón.',
 true, 1, 'arcane_rogue', NULL, NULL, NULL,
 NOW() - INTERVAL '73 minutes'),

-- GM responde susurro a Lyra
(1, 1, NULL, 'whisper',
 'Buen ojo. El símbolo coincide con el escudo Von Zarovich. La llave probablemente esté en la cripta familiar, nivel -2.',
 true, 2, 'dungeon_master', NULL, NULL, NULL,
 NOW() - INTERVAL '72 minutes'),

-- GM comparte nota
(1, 1, NULL, 'note_append',
 '{"noteTitle":"El Castillo de Ravenloft","snippet":"El castillo tiene cinco torres y tres niveles subterráneos. La cripta familiar está en el nivel -2..."}',
 false, NULL, 'dungeon_master', NULL, NULL, NULL,
 NOW() - INTERVAL '70 minutes'),

-- Lyra actúa
(1, 2, 1, 'text',
 'Lyra aprovecha la confusión para escabullirse hacia las sombras del patio interior.',
 false, NULL, 'arcane_rogue', 'Lyra Shadowstep', NULL,
 'Elfa de cabello negro azabache y ojos plateados. Complexión delgada, siempre viste de negro con una capa de capucha.',
 NOW() - INTERVAL '68 minutes'),

-- Lyra tira sigilo con ventaja
(1, 2, 1, 'dice_roll',
 '{"dice":"1d20+8","results":[15,8],"total":23,"advantage":true,"disadvantage":false}',
 false, NULL, 'arcane_rogue', 'Lyra Shadowstep', NULL,
 'Elfa de cabello negro azabache y ojos plateados.',
 NOW() - INTERVAL '67 minutes'),

-- Tormund cierra el combate
(1, 3, 2, 'text',
 'Bien hecho. Voy detrás de ti. Pelor, ilumina nuestro camino.',
 false, NULL, 'iron_cleric', 'Tormund Pedernal', NULL,
 'Enano de barba rojiza trenzada con anillos dorados, armadura de placas reluciente.',
 NOW() - INTERVAL '65 minutes');

-- ── 14. Campaign notes ────────────────────────────────────────────────
INSERT INTO "Note" (campaignId, authorId, title, content, isPublic) VALUES
(1, 1,
 'El Castillo de Ravenloft',
 'El castillo tiene cinco torres y tres niveles subterráneos. La torre principal alberga los aposentos de Strahd en el nivel más alto. La cripta familiar está en el nivel -2 y requiere una llave especial. El nivel -3 es desconocido incluso para los sirvientes más antiguos.',
 true),
(1, 1,
 'Debilidades de Strahd',
 'Strahd es vulnerable a: luz solar directa (desventaja y 20 daño radiante/turno), agua bendita (2d6 daño), símbolo sagrado sostenido por un clérigo devoto. No puede entrar a un hogar sin invitación. La estaca de madera lo paraliza pero no lo mata.',
 true),
(1, 2,
 'Mi diario — Sesión 3',
 'Finalmente llegamos al castillo. Algo en ese lugar me eriza la piel, y eso que he vaciado muchos bolsillos en lugares peores. El símbolo en el portón... lo he visto antes en un libro en Waterdeep. Debo recordar dónde.',
 false),  -- privada, solo Lyra y el GM la ven
(1, 3,
 'Pistas sobre el ritual',
 'Según los aldeanos, Strahd celebra un ritual de renovación cada 100 años en la luna llena. La próxima luna llena es en tres días. Si el ritual falla, su poder mengua durante una semana entera. Esa es nuestra ventana.',
 true);

-- ── 15. Availability (semana del 18 al 24 de mayo 2026) ──────────────
-- slots: manana | tarde | tarde_noche | noche
INSERT INTO "Availability" (userId, date, slots) VALUES
  (1, '2026-05-19', 'tarde,tarde_noche,noche'),
  (1, '2026-05-20', 'tarde_noche,noche'),
  (1, '2026-05-22', 'tarde,tarde_noche'),
  (1, '2026-05-23', 'manana,tarde,tarde_noche,noche'),
  (2, '2026-05-19', 'tarde_noche,noche'),
  (2, '2026-05-20', 'noche'),
  (2, '2026-05-22', 'tarde,tarde_noche,noche'),
  (2, '2026-05-23', 'tarde_noche,noche'),
  (3, '2026-05-19', 'tarde,tarde_noche,noche'),
  (3, '2026-05-20', 'tarde_noche'),
  (3, '2026-05-21', 'noche'),
  (3, '2026-05-22', 'tarde,tarde_noche,noche'),
  (3, '2026-05-23', 'manana,tarde,tarde_noche');

-- ── Done ──────────────────────────────────────────────────────────────
-- Summary of inserted data:
--   Users:     3 (1 GM, 2 players)
--   Campaigns: 2 (1 active, 1 inactive)
--   Characters: 3 (Lyra Rogue 5, Tormund Cleric 5, Kaelor Wizard 3)
--   Creatures:  4 across 2 folders (Vampiro, Zombie, Lobo Terrible, Goblin)
--   Messages:  16 (text, dice_roll, whisper, ability_append, note_append)
--   Notes:      4 (2 public GM, 1 private player, 1 public player)
--   Availability: 13 entries for week 2026-05-18/24
