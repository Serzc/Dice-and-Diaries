# Playwright requirements tests

Run the end-to-end suite with:

```sh
npx playwright install chromium
npx playwright test
```

The tests use an in-memory PostgREST stub and test-only Supabase settings. They do
not send requests to the Supabase project configured in `.env`.

The supplied PDF, *Diseño de Base de Datos: Dice and Diaries*, documents a data
model and design decisions rather than numbered functional requirements or
acceptance criteria. These test IDs trace the browser-verifiable behaviors to
the entities and relationships named in that document:

| Test ID | Coverage |
| --- | --- |
| AUTH-01, AUTH-02, AUTH-03, AUTH-04 | User access control, required registration fields, invalid login/duplicate username handling, active user records, and persisted sessions |
| CAMPAIGN-01, CAMPAIGN-02, CAMPAIGN-03 | Campaign records, GM membership, chat association, unknown invite-code handling, and logical deletion through `active` |
| CHARACTER-01 | Character ownership, compact ability-score representation, and character data initialization |
| CREATURE-01, FOLDER-01 | Creature records, ability scores, and self-referencing folder hierarchy |
| NOTE-01 | Campaign note ownership, campaign association, visibility, and logical-delete state |
| CHAT-01 | Message association to a chat and sender |
| PLANNER-01 | Availability association to a user, date, and time slot |
| PROFILE-01 | Updating user profile data |
| ENTITY-01 | Route-level access to the primary application areas |

Database-only constraints such as SQL column types, maximum field lengths,
physical table naming, and query performance cannot be verified through browser
tests; they require database schema or integration tests. Likewise, the PDF
does not define expected UI behavior for every listed table.

The test run writes a JSON report and an Excel-compatible CSV results sheet to
`test-results/`.
