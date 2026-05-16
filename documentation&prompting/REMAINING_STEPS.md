# Dice and Diaries — Remaining Implementation Steps

> Code review against `appDescription.md`, `structure.md`, `characterSheetDesc.txt`, and `disenoBD.md`.
> Current state: frontend UI complete, all data served from `src/mock/db.js`. Supabase not yet connected.

---

## 1. Authentication & Session Context

| # | Task | Notes |
|---|------|-------|
| 1.1 | Implement Supabase Auth (login + register) | Replace `LoginForm` mock validation with `supabase.auth.signInWithPassword` |
| 1.2 | Add a Register / Sign-up page | Not in scope yet; `LoginForm` only handles login |
| ~~1.3~~ | ~~Implement `supabase.auth.signOut()`~~ | **Done** — `AuthContext.logout()` + Header logout button |
| ~~1.4~~ | ~~Protect all routes with an auth guard~~ | **Done** — `<PrivateRoute>` in `App.jsx`, redirects to `/login` |
| ~~1.5~~ | ~~Replace all hardcoded `CURRENT_USER_ID = 1`~~ | **Done** — `CampaignNotesPage`, `CampaignPlayersPage` use `useAuth()` |
| ~~1.6~~ | ~~Replace hardcoded `IS_GM = true` in `CampaignNotesPage`~~ | **Done** — derived from `campaign.ownerId === user.id` |
| 1.7 | Replace `currentUser` mock export in `db.js` | Used by `CreaturesPage` and `CreatureSheetPage` — replace with `useAuth()` once Supabase connected |
| ~~1.8~~ | ~~Persist auth session across page refreshes~~ | **Done** — `localStorage` via `AuthContext`, survives browser restart |

---

## 2. Database Integration (Supabase)

| # | Task | Notes |
|---|------|-------|
| 2.1 | Create Supabase project & run migration | Use `supabase/migrations/001_create_tables.sql` |
| 2.2 | Create `src/lib/supabase.js` client | `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)` |
| 2.3 | Create a `src/services/` layer | One file per entity (characterService.js, campaignService.js, etc.) replacing `mock/db.js` functions |
| 2.4 | Enable Row Level Security on all tables | Users can only read/write their own data; campaign members can access campaign data |
| 2.5 | Configure Supabase Storage bucket | For character portraits, campaign images, creature avatars |
| 2.6 | Update mock character data to compact string format | `abilityScores`, `saveProficiencies`, `skillProficiencies`, `spellSlots` fields in `_characters` must use the compact string format before connecting to real DB |
| ~~2.7~~ | ~~Delete superseded mock files~~ | **Done** — all 12 files were already merged into `src/mock/db.js` |

---

## 3. Real-time (Supabase Realtime)

| # | Task | Notes |
|---|------|-------|
| 3.1 | Subscribe to new messages in `ChatPage` | `supabase.channel('chat:campaignId').on('postgres_changes', ...)` |
| 3.2 | Unsubscribe on component unmount | Return cleanup from `useEffect` |
| 3.3 | Real-time note updates (optional) | Low priority — useful for shared DM notes during session |
| 3.4 | Real-time planner availability updates (optional) | Low priority |

---

## 4. Character Sheet — Known Issues & Missing Features

| # | Task | Notes |
|---|------|-------|
| ~~4.1~~ | ~~**Bug**: `FeaturesList` doesn't destructure `onSave` prop~~ | **Done** |
| ~~4.2~~ | ~~`FeaturesList` rest buttons don't call `onSave`~~ | **Done** |
| ~~4.3~~ | ~~`FeaturesList` use button doesn't call `onSave`~~ | **Done** |
| ~~4.4~~ | ~~`SpellsList`: add/delete spell not saved~~ | **Done** |
| ~~4.5~~ | ~~`SpellsList`: toggle prepared not saved~~ | **Done** |
| ~~4.6~~ | ~~`SpellsList`: spellcasting ability change not saved~~ | **Done** |
| ~~4.7~~ | ~~AC and initiative not recalculated when inventory/features change~~ | **Done** — reactive recomputation in `CharacterSheetPage.updateCharacter` |
| ~~4.8~~ | ~~Hit dice "use" button — not implemented~~ | **Done** — "Usar" button in `CombatInfoSection` |
| ~~4.9~~ | ~~Death saves tracking — not implemented~~ | **Done** — death saves section in `CombatInfoSection` |
| 4.10 | Character portrait upload in `GeneralInfo` edit mode | Image URL is editable as text but no file upload |
| 4.11 | `StoryPanel` should link to an actual `Note` entity | Currently loads generic story text; should map to a real `Note` row tied to the character |
| ~~4.12~~ | ~~`ImpersonatePopup` query param: `ChatPage` must read `?characterId=` on load~~ | **Done** — `ChatPage` reads `?characterId=&characterName=` via `useSearchParams` |

---

## 5. Chat — Missing Features

| # | Task | Notes |
|---|------|-------|
| ~~5.1~~ | ~~Sidebar notes list always passes `[]`~~ | **Done** — `ChatPage` fetches `fetchCampaignNotes` and passes to sidebar |
| 5.2 | Dice roll history isn't displayed differently in the transcript | `DiceRollDisplay` component exists but confirm it renders for all roll types |
| 5.3 | Whisper recipient selector | `ChatSidebar` whisper section needs an online-users dropdown; verify this is wired |
| ~~5.4~~ | ~~"Poseer" in `CreatureSheetPage` calls `console.log`~~ | **Done** — navigates to campaign chat; shows picker if creature has multiple campaigns |
| 5.5 | Chat doesn't persist across sessions (no real DB) | Fixed once Supabase is connected (task 2.x) |

---

## 6. Campaigns — Missing Features

| # | Task | Notes |
|---|------|-------|
| ~~6.1~~ | ~~Create campaign — FAB does `alert("Crear campaña")`~~ | **Done** — create modal with name, description, shows invite code on success |
| ~~6.2~~ | ~~Join campaign — "Unirse" button does `alert("Unirse")`~~ | **Done** — `HomePage` join tab calls `joinCampaignByCode`, shows error/success |
| ~~6.3~~ | ~~"Inicio de sesión" GM button~~ | **Done** — `CampaignCard` calls `toggleCampaignActive` then navigates to chat |
| 6.4 | Campaign image upload | Image URL field exists but no file picker |
| ~~6.5~~ | ~~Campaign deletion / archival~~ | **Done** — `CampaignCard` has "Eliminar" button (GM only) with confirmation |

---

## 7. Notes — Missing Features

| # | Task | Notes |
|---|------|-------|
| 7.1 | Note folder structure not implemented | `CampaignNoteFolder` / `NoteFolderContent` tables exist in SQL but no UI |
| 7.2 | Per-note permissions not implemented | `NotePermission` table exists; UI always uses `IS_GM` flag |
| ~~7.3~~ | ~~Plan tab on `HomePage` should pre-select campaign~~ | **Done** — navigates to `/calendar?campaignId=X`; `PlannerPage` reads URL param on mount |

---

## 8. Creatures — Missing Features

| # | Task | Notes |
|---|------|-------|
| ~~8.1~~ | ~~Creature "Poseer" button → `console.log`~~ | **Done** — see 5.4 |
| 8.2 | Spell management for creatures | `SpellXCreature` junction table defined but no UI in `CreatureSheetPage` |
| 8.3 | Creature folder CRUD | `CreateCreaturePopup` handles folder creation but no rename/delete |

---

## 9. Planner

| # | Task | Notes |
|---|------|-------|
| 9.1 | Campaign list should filter to current user's campaigns | `fetchCampaigns()` currently returns all 3 mock campaigns |
| ~~9.2~~ | ~~Week navigation doesn't load new availability data~~ | **Done** — `fetchPlanner` is now a dependency of `weekStart` effect; re-fetches on week change |

---

## 10. Profile

| # | Task | Notes |
|---|------|-------|
| 10.1 | Avatar "Cambiar foto" button does nothing | Needs Supabase Storage upload |
| 10.2 | Password change not implemented | Needs `supabase.auth.updateUser({ password })` |

---

## 11. General / Polish

| # | Task | Notes |
|---|------|-------|
| ~~11.1~~ | ~~No 404 / Not Found page~~ | **Done** — `NotFoundPage.jsx` + catch-all route in `App.jsx` |
| ~~11.2~~ | ~~No global error boundary~~ | **Done** — `ErrorBoundary` wraps routes, resets on navigation |
| 11.3 | No loading skeleton / spinner standard | Each page reimplements loading states differently |
| ~~11.4~~ | ~~`src/utils/spellUtils.js` referenced in `SpellsList`~~ | **Done** — file exists and exports correctly |
| ~~11.5~~ | ~~`CharacterSheetPage` proficiencyBonus is not recomputed from level~~ | **Done** — `updateCharacter` recomputes via `computeProficiencyBonus(level)` |

---

## 12. Adapter & Data Format (`characterDataAdapter.js`)

| # | Task | Notes |
|---|------|-------|
| 12.1 | ~~Adapter handles only snake_case object-format mock data~~ | **Fixed in this batch**: adapter now supports both compact DB strings and legacy object format |
| 12.2 | Update mock `_characters` to compact string format | `abilityScores: "141813101508"`, `saveProficiencies: "010100"`, `skillProficiencies: "100001010010100200"`, `spellSlots: "430000000000000000"` before connecting to Supabase |
| 12.3 | `toDatabase` must emit camelCase columns | Already done — align with SQL column names |

---

## Priority Order (suggested)

1. **Phase 1 – Data layer**: Tasks 2.1–2.5 (Supabase setup, tables, RLS)
2. **Phase 2 – Auth**: Tasks 1.1–1.8
3. **Phase 3 – Bug fixes**: Tasks 4.1–4.12, 5.1–5.5
4. **Phase 4 – Core features**: Tasks 6.1–6.5, 7.1–7.3, 8.1–8.3
5. **Phase 5 – Realtime**: Tasks 3.1–3.4
6. **Phase 6 – Polish**: Tasks 9–11
