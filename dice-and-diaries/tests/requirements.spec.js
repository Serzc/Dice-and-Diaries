import { test, expect, signInAsGm } from "./fixtures.js";

test("[AUTH-01] protects private routes and validates login input", async ({ page, backend }) => {
  await page.goto("/campaigns");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Dice and Diaries" })).toBeVisible();

  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText("El nombre de usuario es obligatorio")).toBeVisible();
  await expect(page.getByText("La contraseña es obligatoria")).toBeVisible();
  expect(backend.writes).toHaveLength(0);
});

test("[AUTH-02] creates an active user and starts a persisted session", async ({ page, backend }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Regístrate" }).click();
  await page.getByLabel("Nombre de usuario").fill("New_Player");
  await page.getByLabel("Correo electrónico").fill("new-player@example.test");
  await page.getByLabel("Contraseña", { exact: true }).fill("secure-pass");
  await page.getByLabel("Confirmar contraseña").fill("secure-pass");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText("@New_Player")).toBeVisible();
  const userInsert = backend.writes.find((write) => write.table === "User");
  expect(userInsert?.rows[0]).toMatchObject({
    username: "New_Player",
    email: "new-player@example.test",
    active: true,
  });
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("dnd_session") || "null")?.username))
    .toBe("New_Player");
});

test("[AUTH-03] rejects login with unknown credentials", async ({ page, backend }) => {
  await page.goto("/login");
  await page.getByLabel("Nombre de usuario").fill("Unknown_Player");
  await page.getByLabel("Contraseña", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page.getByRole("alert")).toHaveText("Usuario o contraseña incorrectos");
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem("dnd_session"))).toBeNull();
  expect(backend.writes).toHaveLength(0);
});

test("[AUTH-04] rejects registration when the username already exists", async ({ page, backend }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Regístrate" }).click();
  await page.getByLabel("Nombre de usuario").fill("Player_Anna");
  await page.getByLabel("Correo electrónico").fill("another-account@example.test");
  await page.getByLabel("Contraseña", { exact: true }).fill("secure-pass");
  await page.getByLabel("Confirmar contraseña").fill("secure-pass");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page.getByRole("alert")).toHaveText("El nombre de usuario ya está en uso");
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem("dnd_session"))).toBeNull();
  expect(backend.writes).toHaveLength(0);
});

test("[CAMPAIGN-01] creates a campaign, GM membership, and chat", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/campaigns");
  await page.getByRole("button", { name: "Crear nueva campaña" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("Nombre de la campaña...").fill("The Test Depths");
  await dialog.getByPlaceholder("Breve descripción...").fill("Created by the E2E suite");
  await dialog.getByRole("button", { name: "Crear campaña" }).click();
  await expect(dialog.getByRole("heading", { name: "¡Campaña creada!" })).toBeVisible();

  const campaign = backend.writes.find((write) => write.table === "Campaign")?.rows[0];
  expect(campaign).toMatchObject({ name: "The Test Depths", ownerid: 1, active: false });
  expect(campaign.invitecode).toMatch(/^[A-Z0-9]{6}$/);
  const createdCampaign = backend.tables.Campaign.find((row) => row.name === "The Test Depths");
  expect(backend.writes.find((write) => write.table === "UserXCampaign")?.rows[0])
    .toMatchObject({ userid: 1, campaignid: createdCampaign.id, role: "gm" });
  expect(backend.writes.find((write) => write.table === "Chat")?.rows[0])
    .toMatchObject({ campaignid: createdCampaign.id });
});

test("[CAMPAIGN-02] uses the active flag when a GM removes a campaign", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/campaigns");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Eliminar The Lost Mines" }).click();

  await expect(page.getByRole("heading", { name: "The Lost Mines" })).toHaveCount(0);
  expect(backend.writes.find((write) => write.table === "Campaign" && write.method === "PATCH")?.rows[0])
    .toEqual({ active: false });
  expect(backend.tables.Campaign[0].active).toBe(false);
});

test("[CAMPAIGN-03] rejects an unknown campaign invitation code", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/");
  await page.getByRole("tab", { name: "Unirse a una Campaña" }).click();
  await page.getByLabel("Código de invitación").fill("BADCODE");
  await page.getByRole("button", { name: "Unirse" }).click();

  await expect(page.getByRole("alert")).toHaveText('Código "BADCODE" no encontrado.');
  expect(backend.writes).toHaveLength(0);
});

test("[CHARACTER-01] creates a character with compact stats and owner association", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/characters");
  await page.getByRole("button", { name: "Crear nuevo personaje" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Crear", exact: true }).click();

  await expect(page).toHaveURL(/\/characters\/\d+$/);
  const character = backend.writes.find((write) => write.table === "Character")?.rows[0];
  expect(character).toMatchObject({
    name: "Nuevo Personaje",
    ownerid: 1,
    abilityscores: "101010101010",
    inventory: "[]",
    spells: "[]",
  });
});

test("[CREATURE-01] creates a creature with its ability scores and hit points", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/creatures");
  await page.getByRole("button", { name: "Crear nueva criatura o carpeta" }).click();
  await page.getByRole("button", { name: "Nueva Criatura", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("Nombre de la criatura").fill("Test Drake");
  await dialog.getByPlaceholder("Bestia, Humanoide...").fill("Dragon");
  await dialog.getByRole("button", { name: "Crear Criatura" }).click();

  await expect(page).toHaveURL(/\/creatures\/\d+$/);
  await expect(page.getByRole("heading", { name: "Test Drake", level: 1 })).toBeVisible();
  const creature = backend.writes.find((write) => write.table === "Creature")?.rows[0];
  expect(creature).toMatchObject({
    name: "Test Drake",
    ownerid: 1,
    creaturetype: "Dragon",
    hpmax: 10,
    currenthp: 10,
    abilityscores: "101010101010",
  });
});

test("[FOLDER-01] stores nested creature folders with a parent relationship", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/creatures/folder/4");
  await page.getByRole("button", { name: "Crear nueva criatura o carpeta" }).click();
  await page.getByRole("button", { name: "Nueva Carpeta" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("Ej: Humanoides, Jefes...").fill("Undead");
  await dialog.getByRole("button", { name: "Crear Carpeta" }).click();

  await expect(page.getByText("Undead", { exact: true })).toBeVisible();
  expect(backend.tables.CreatureFolder.find((folder) => folder.name === "Undead"))
    .toMatchObject({ name: "Undead", parentfolderid: 4, ownerid: 1 });
});

test("[NOTE-01] creates a public note linked to its campaign and author", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/campaigns/10/notes");
  await page.getByRole("button", { name: "Crear nueva nota" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("Título de la nota...").fill("Test recap");
  await dialog.getByPlaceholder("Escribe el contenido de la nota...").fill("A new campaign note.");
  await dialog.getByRole("button", { name: "Crear nota" }).click();

  await expect(page.getByText("Test recap", { exact: true })).toBeVisible();
  expect(backend.writes.find((write) => write.table === "Note")?.rows[0])
    .toMatchObject({
      campaignid: 10,
      authorid: 1,
      title: "Test recap",
      content: "A new campaign note.",
      ispublic: true,
      active: true,
    });
});

test("[CHAT-01] saves a chat message with chat and sender relationships", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/campaigns/10/chat");
  await expect(page.getByText("Welcome to the campaign.")).toBeVisible();

  await page.getByLabel("Mensaje de chat").fill("A message from the test suite.");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  await expect(page.getByText("A message from the test suite.")).toBeVisible();
  expect(backend.writes.find((write) => write.table === "Message")?.rows[0])
    .toMatchObject({
      chatid: 20,
      senderid: 1,
      senderusername: "GM_Dave",
      type: "text",
      content: "A message from the test suite.",
      iswhisper: false,
    });
});

test("[PLANNER-01] records availability for a user, date, and time slot", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/calendar?campaignId=10");
  await expect(page.getByRole("heading", { name: "Planificador" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Participantes (2)" })).toBeVisible();
  await page.getByRole("button", { name: /Amanecer: 0 de 2 disponibles/ }).first().click();

  await expect.poll(() => backend.writes.some((write) => write.table === "Availability")).toBe(true);
  const availability = backend.writes.find((write) => write.table === "Availability")?.rows[0];
  expect(availability).toMatchObject({ userid: 1, slots: "amanecer" });
  expect(availability.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test("[PROFILE-01] updates profile data on the user record", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Dave the DM" })).toBeVisible();
  await page.getByRole("button", { name: "Editar perfil" }).click();
  await page.getByLabel("Nombre para mostrar").fill("Dave Updated");
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(page.getByRole("heading", { name: "Dave Updated" })).toBeVisible();
  expect(backend.writes.find((write) => write.table === "User" && write.method === "PATCH")?.rows[0])
    .toMatchObject({ displayname: "Dave Updated" });
});

test("[ENTITY-01] exposes campaigns, characters, creatures, planner, and profile areas", async ({ page, backend }) => {
  await signInAsGm(page);
  await page.goto("/");

  const destinations = [
    { link: "Campañas", heading: "Mis Campañas" },
    { link: "Personajes", heading: "Mis Personajes" },
    { link: "Criaturas", heading: "Mis Criaturas" },
    { link: "Calendario", heading: "Planificador" },
    { link: "Perfil", heading: "Dave the DM" },
  ];

  for (const destination of destinations) {
    await page.getByRole("link", { name: destination.link }).click();
    await expect(page.getByRole("heading", { name: destination.heading })).toBeVisible();
  }
  expect(backend.writes).toHaveLength(0);
});
