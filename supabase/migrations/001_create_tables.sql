-- =====================================================================
-- Dice and Diaries – Supabase / PostgreSQL schema  v1.0
-- Run this in the Supabase SQL editor or via the Supabase CLI.
-- =====================================================================
--
-- Compact string formats used in this schema
-- ────────────────────────────────────────────────────────────────────
-- abilityScores  varchar(12)
--   2 digits × 6 abilities in fixed order STR/DEX/CON/INT/WIS/CHA,
--   each ability zero-padded to 2 digits.
--   Example: "141813101508" → STR=14 DEX=18 CON=13 INT=10 WIS=15 CHA=8
--
-- saveProficiencies  varchar(6)
--   1 binary digit per ability in the same STR/DEX/CON/INT/WIS/CHA order.
--   '1' = proficient, '0' = not proficient.
--   Example: "010100" → DEX and INT proficient
--
-- skillProficiencies  varchar(18)
--   1 char per skill in fixed order (matches characterDataAdapter.js SKILLS array):
--   acrobatics, animal_handling, arcana, athletics, deception, history,
--   insight, intimidation, investigation, medicine, nature, perception,
--   performance, persuasion, religion, sleight_of_hand, stealth, survival.
--   '0' = none, '1' = proficient, '2' = expert.
--   Example: "100001010010100200" → acrobatics proficient, athletics expert…
--
-- spellSlots  varchar(18)
--   2 chars per spell level (levels 1–9) in sequence: first char = max slots,
--   second char = current remaining slots (both single-digit, 0–9).
--   Example: "433200000000000000" → L1 max=4 cur=3, L2 max=3 cur=2, rest=0
--
-- effects (actions, features, items, spells)  varchar(512)
--   JSON-encoded string describing mechanical effects, e.g.
--   {"ac_bonus":2} or {"action":{"attack":{"damage":"1d8","type":"slashing"}}}
-- =====================================================================

-- ── User ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "User" (
    id            serial       PRIMARY KEY,
    username      varchar(64)  NOT NULL UNIQUE,
    displayName   varchar(64)  NOT NULL,
    email         varchar(128) NOT NULL UNIQUE,
    passwordHash  varchar(128) NOT NULL,
    bio           varchar(512),
    avatarUrl     varchar(128),
    joinedAt      date         NOT NULL DEFAULT CURRENT_DATE,
    active        boolean      NOT NULL DEFAULT true
);

-- ── Campaign ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Campaign" (
    id          serial       PRIMARY KEY,
    name        varchar(64)  NOT NULL,
    description varchar(512),
    imageUrl    varchar(128),
    active      boolean      NOT NULL DEFAULT true,
    ownerId     integer      NOT NULL REFERENCES "User"(id)
);

-- ── Character ─────────────────────────────────────────────────────────
-- actions / bonusActions / features / otherProficiencies are stored as
-- JSON-encoded arrays (varchar(4096)) to avoid excessive joins on
-- character-specific, non-reusable data.
CREATE TABLE IF NOT EXISTS "Character" (
    id                  serial       PRIMARY KEY,
    name                varchar(64)  NOT NULL,
    classes             varchar(128) NOT NULL,
    species             varchar(64)  NOT NULL,
    background          varchar(64)  NOT NULL,
    level               smallint     NOT NULL DEFAULT 1,
    imageUrl            varchar(128),

    -- Compact ability scores (see format above)
    abilityScores       varchar(12)  NOT NULL DEFAULT '101010101010',
    -- Saving throw proficiencies binary string
    saveProficiencies   varchar(6)   NOT NULL DEFAULT '000000',
    -- Skill proficiencies string (18 skills × 1 char)
    skillProficiencies  varchar(18)  NOT NULL DEFAULT '000000000000000000',

    speed               smallint     NOT NULL DEFAULT 30,
    hpMax               smallint     NOT NULL DEFAULT 1,
    currentHp           smallint     NOT NULL DEFAULT 1,
    tempHp              smallint     NOT NULL DEFAULT 0,
    hitDiceType         varchar(4)   NOT NULL DEFAULT 'd8',
    hitDiceTotal        smallint     NOT NULL DEFAULT 1,
    hitDiceRemaining    smallint     NOT NULL DEFAULT 1,

    -- Spellcasting
    spellcastingAbility varchar(4),
    spellSlots          varchar(18)  NOT NULL DEFAULT '000000000000000000',

    -- Character-specific data stored as JSON strings
    actions             varchar(4096),
    bonusActions        varchar(4096),
    otherProficiencies  varchar(1024),
    features            varchar(4096),

    active              boolean      NOT NULL DEFAULT true,
    ownerId             integer      NOT NULL REFERENCES "User"(id)
);

-- ── Item ──────────────────────────────────────────────────────────────
-- Reusable item templates. Character-specific quantities and equipped
-- state live in ItemXCharacter.
CREATE TABLE IF NOT EXISTS "Item" (
    id          serial       PRIMARY KEY,
    name        varchar(64)  NOT NULL,
    weight      real,
    description varchar(512),
    effect      varchar(512),   -- JSON effect string
    active      boolean      NOT NULL DEFAULT true
);

-- ── ItemXCharacter ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ItemXCharacter" (
    id          serial   PRIMARY KEY,
    itemId      integer  NOT NULL REFERENCES "Item"(id),
    characterId integer  NOT NULL REFERENCES "Character"(id),
    quantity    smallint NOT NULL DEFAULT 1,
    equipped    boolean  NOT NULL DEFAULT false,
    UNIQUE (itemId, characterId)
);

-- ── Spell ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Spell" (
    id            serial       PRIMARY KEY,
    name          varchar(64)  NOT NULL,
    level         smallint     NOT NULL DEFAULT 0,
    school        varchar(64),
    castingTime   varchar(64),
    range         varchar(64),
    duration      varchar(64),
    components    varchar(64),
    description   varchar(512),
    effect        varchar(512),   -- JSON effect string
    isRitual      boolean      NOT NULL DEFAULT false,
    concentration boolean      NOT NULL DEFAULT false,
    active        boolean      NOT NULL DEFAULT true
);

-- ── SpellXCharacter ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "SpellXCharacter" (
    id          serial   PRIMARY KEY,
    spellId     integer  NOT NULL REFERENCES "Spell"(id),
    characterId integer  NOT NULL REFERENCES "Character"(id),
    prepared    boolean  NOT NULL DEFAULT false,
    UNIQUE (spellId, characterId)
);

-- ── Creature ──────────────────────────────────────────────────────────
-- specialTraits / actions / bonusActions / reactions stored as JSON arrays.
-- damageImmunities, damageResistances, conditionImmunities as comma-separated text.
CREATE TABLE IF NOT EXISTS "Creature" (
    id                  serial       PRIMARY KEY,
    name                varchar(64)  NOT NULL,
    size                varchar(16)  NOT NULL DEFAULT 'Mediano',
    creatureType        varchar(64)  NOT NULL DEFAULT 'Bestia',
    alignment           varchar(64),
    cr                  varchar(8),
    ac                  smallint     NOT NULL DEFAULT 10,
    acNote              varchar(64),
    hpMax               smallint     NOT NULL DEFAULT 1,
    currentHp           smallint     NOT NULL DEFAULT 1,
    hpFormula           varchar(32),
    speed               varchar(64)  NOT NULL DEFAULT '9 m',

    -- Same 12-char compact format as Character.abilityScores
    abilityScores       varchar(12)  NOT NULL DEFAULT '101010101010',

    -- Saving throws and skills as JSON arrays
    -- e.g. [{"ability":"STR","mod":5}, ...]
    savingThrows        varchar(512),
    skills              varchar(512),

    -- Comma-separated lists
    damageImmunities    varchar(128),
    damageResistances   varchar(128),
    conditionImmunities varchar(128),
    senses              varchar(128),
    languages           varchar(128),

    -- JSON arrays of trait/action objects {name, description}
    specialTraits       varchar(4096),
    actions             varchar(4096),
    bonusActions        varchar(4096),
    reactions           varchar(4096),

    -- Notes
    gmNotes             varchar(4096),
    playerVisibleNotes  varchar(4096),

    active              boolean      NOT NULL DEFAULT true,
    ownerId             integer      NOT NULL REFERENCES "User"(id)
);

-- ── SpellXCreature ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "SpellXCreature" (
    id         serial  PRIMARY KEY,
    spellId    integer NOT NULL REFERENCES "Spell"(id),
    creatureId integer NOT NULL REFERENCES "Creature"(id),
    UNIQUE (spellId, creatureId)
);

-- ── CreatureFolder ────────────────────────────────────────────────────
-- Self-referencing hierarchy; parentFolderId NULL means root folder.
CREATE TABLE IF NOT EXISTS "CreatureFolder" (
    id             serial      PRIMARY KEY,
    name           varchar(64) NOT NULL,
    parentFolderId integer     REFERENCES "CreatureFolder"(id),
    ownerId        integer     NOT NULL REFERENCES "User"(id),
    active         boolean     NOT NULL DEFAULT true
);

-- ── CreatureFolderContent ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CreatureFolderContent" (
    id         serial  PRIMARY KEY,
    folderId   integer NOT NULL REFERENCES "CreatureFolder"(id),
    creatureId integer NOT NULL REFERENCES "Creature"(id),
    UNIQUE (folderId, creatureId)
);

-- ── UserXCampaign ─────────────────────────────────────────────────────
-- role: 'gm' | 'player'
CREATE TABLE IF NOT EXISTS "UserXCampaign" (
    id         serial      PRIMARY KEY,
    userId     integer     NOT NULL REFERENCES "User"(id),
    campaignId integer     NOT NULL REFERENCES "Campaign"(id),
    role       varchar(16) NOT NULL DEFAULT 'player',
    UNIQUE (userId, campaignId)
);

-- ── CharacterXCampaign ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CharacterXCampaign" (
    id          serial  PRIMARY KEY,
    characterId integer NOT NULL REFERENCES "Character"(id),
    campaignId  integer NOT NULL REFERENCES "Campaign"(id),
    UNIQUE (characterId, campaignId)
);

-- ── Chat ──────────────────────────────────────────────────────────────
-- One chat per campaign.
CREATE TABLE IF NOT EXISTS "Chat" (
    id         serial  PRIMARY KEY,
    campaignId integer NOT NULL UNIQUE REFERENCES "Campaign"(id),
    active     boolean NOT NULL DEFAULT true
);

-- ── Message ───────────────────────────────────────────────────────────
-- type: 'text' | 'dice_roll' | 'whisper' | 'ability_append' | 'note_append'
-- content is a serialized string per type:
--   text          → plain string
--   dice_roll     → JSON {"dice":"2d6","results":[3,4],"total":7,"advantage":false,"disadvantage":false}
--   whisper       → plain string (private)
--   ability_append → JSON {"abilityName":"Ataque furtivo","description":"..."}
--   note_append   → JSON {"noteTitle":"Sesión 3","snippet":"..."}
CREATE TABLE IF NOT EXISTS "Message" (
    id          serial        PRIMARY KEY,
    chatId      integer       NOT NULL REFERENCES "Chat"(id),
    senderId    integer       NOT NULL REFERENCES "User"(id),
    characterId integer       REFERENCES "Character"(id),
    type        varchar(16)   NOT NULL DEFAULT 'text',
    content     varchar(4096) NOT NULL,
    isWhisper   boolean       NOT NULL DEFAULT false,
    whisperTo   integer       REFERENCES "User"(id),
    timestamp   timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Note ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Note" (
    id         serial        PRIMARY KEY,
    campaignId integer       NOT NULL REFERENCES "Campaign"(id),
    authorId   integer       NOT NULL REFERENCES "User"(id),
    title      varchar(64)   NOT NULL,
    content    varchar(4096),
    isPublic   boolean       NOT NULL DEFAULT false,
    active     boolean       NOT NULL DEFAULT true,
    createdAt  date          NOT NULL DEFAULT CURRENT_DATE
);

-- ── NotePermission ────────────────────────────────────────────────────
-- permissionLevel: 'read' | 'write'
CREATE TABLE IF NOT EXISTS "NotePermission" (
    id              serial      PRIMARY KEY,
    noteId          integer     NOT NULL REFERENCES "Note"(id),
    userId          integer     NOT NULL REFERENCES "User"(id),
    permissionLevel varchar(16) NOT NULL DEFAULT 'read',
    UNIQUE (noteId, userId)
);

-- ── CampaignNoteFolder ────────────────────────────────────────────────
-- parentFolderId NULL = root folder for this campaign.
CREATE TABLE IF NOT EXISTS "CampaignNoteFolder" (
    id             serial      PRIMARY KEY,
    name           varchar(64) NOT NULL,
    campaignId     integer     NOT NULL REFERENCES "Campaign"(id),
    parentFolderId integer     REFERENCES "CampaignNoteFolder"(id)
);

-- ── NoteFolderContent ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "NoteFolderContent" (
    id       serial  PRIMARY KEY,
    folderId integer NOT NULL REFERENCES "CampaignNoteFolder"(id),
    noteId   integer NOT NULL REFERENCES "Note"(id),
    UNIQUE (folderId, noteId)
);

-- =====================================================================
-- Suggested indexes for frequent queries
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_character_owner ON "Character"(ownerId);
CREATE INDEX IF NOT EXISTS idx_creature_owner  ON "Creature"(ownerId);
CREATE INDEX IF NOT EXISTS idx_message_chat    ON "Message"(chatId, timestamp);
CREATE INDEX IF NOT EXISTS idx_note_campaign   ON "Note"(campaignId);
CREATE INDEX IF NOT EXISTS idx_uxc_user        ON "UserXCampaign"(userId);
CREATE INDEX IF NOT EXISTS idx_uxc_campaign    ON "UserXCampaign"(campaignId);
CREATE INDEX IF NOT EXISTS idx_cxc_character   ON "CharacterXCampaign"(characterId);
CREATE INDEX IF NOT EXISTS idx_cxc_campaign    ON "CharacterXCampaign"(campaignId);
