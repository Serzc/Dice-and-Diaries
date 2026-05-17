-- =====================================================================
-- Migration 002 – Add columns and tables missing from the initial schema
-- Run after 001_create_tables.sql
-- =====================================================================

-- ── Campaign: invite code ────────────────────────────────────────────
ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS inviteCode varchar(8);

-- ── Character: extra JSON columns not in v1 schema ──────────────────
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS inventory      varchar(4096);
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS spells         varchar(4096);
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS characterNote  varchar(2048);
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS proficiencyList varchar(512);

-- ── Creature: direct folder reference + image ────────────────────────
ALTER TABLE "Creature" ADD COLUMN IF NOT EXISTS folderId  integer REFERENCES "CreatureFolder"(id);
ALTER TABLE "Creature" ADD COLUMN IF NOT EXISTS imageUrl  varchar(128);

-- ── Message: denormalized sender/character display fields ─────────────
-- Remove the FK so creature IDs can also be stored in characterId
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_characterId_fkey";
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS senderUsername  varchar(64);
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS characterName   varchar(64);
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS characterAvatar varchar(128);

-- ── CreatureXCampaign ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CreatureXCampaign" (
    id         serial  PRIMARY KEY,
    creatureId integer NOT NULL REFERENCES "Creature"(id),
    campaignId integer NOT NULL REFERENCES "Campaign"(id),
    UNIQUE (creatureId, campaignId)
);

-- ── CreatureNote ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CreatureNote" (
    id         serial       PRIMARY KEY,
    creatureId integer      NOT NULL REFERENCES "Creature"(id),
    title      varchar(64)  NOT NULL,
    content    varchar(4096),
    visibility varchar(16)  NOT NULL DEFAULT 'gm',
    authorId   integer      NOT NULL REFERENCES "User"(id),
    createdAt  date         NOT NULL DEFAULT CURRENT_DATE,
    active     boolean      NOT NULL DEFAULT true
);

-- ── Availability (planner) ───────────────────────────────────────────
-- slots: comma-separated slot IDs, e.g. 'tarde,tarde_noche,noche'
CREATE TABLE IF NOT EXISTS "Availability" (
    id     serial      PRIMARY KEY,
    userId integer     NOT NULL REFERENCES "User"(id),
    date   date        NOT NULL,
    slots  varchar(256) NOT NULL DEFAULT '',
    UNIQUE (userId, date)
);

CREATE INDEX IF NOT EXISTS idx_availability_user ON "Availability"(userId);
CREATE INDEX IF NOT EXISTS idx_creature_xcampaign ON "CreatureXCampaign"(campaignId);
CREATE INDEX IF NOT EXISTS idx_creature_note ON "CreatureNote"(creatureId);
