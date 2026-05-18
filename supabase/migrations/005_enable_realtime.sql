-- =====================================================================
-- Migration 005 – Enable Realtime on the Message table
-- Run in the Supabase SQL editor.
-- =====================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
