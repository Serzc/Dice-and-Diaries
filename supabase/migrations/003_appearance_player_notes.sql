-- =====================================================================
-- Migration 003 – Character appearance description + player note access
-- Run after 002_add_missing_columns.sql
-- =====================================================================

-- ── Character: visual appearance description for alt text ────────────
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS appearance varchar(512);

-- ── Message: denormalized character appearance for accessibility ──────
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS characterAppearance varchar(512);
