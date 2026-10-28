import { test as base, expect } from "@playwright/test";

const initialTables = () => ({
  User: [
    {
      id: 1,
      username: "GM_Dave",
      displayname: "Dave the DM",
      email: "dave@example.test",
      passwordhash: "test-password",
      bio: "Campaign organizer",
      active: true,
      joinedat: "2026-01-10",
    },
    {
      id: 2,
      username: "Player_Anna",
      displayname: "Anna",
      email: "anna@example.test",
      passwordhash: "test-password",
      bio: "",
      active: true,
      joinedat: "2026-02-10",
    },
  ],
  Campaign: [
    {
      id: 10,
      name: "The Lost Mines",
      description: "A test campaign",
      ownerid: 1,
      active: true,
      invitecode: "MINES10",
      imageurl: null,
    },
  ],
  UserXCampaign: [
    { id: 1, userid: 1, campaignid: 10, role: "gm" },
    { id: 2, userid: 2, campaignid: 10, role: "player" },
  ],
  Character: [
    {
      id: 7,
      name: "Thorn Ironwood",
      ownerid: 1,
      classes: "Ranger",
      species: "Elf",
      background: "Outlander",
      level: 3,
      imageurl: null,
      abilityscores: "121614101508",
      saveproficiencies: "000000",
      skillproficiencies: "000000000000000000",
      speed: 30,
      hpmax: 24,
      currenthp: 24,
      temphp: 0,
      hitdicetype: "d10",
      hitdicetotal: 3,
      hitdiceremaining: 3,
      spellcastingability: "wis",
      spellslots: "000000000000000000",
      actions: "[]",
      bonusactions: "[]",
      otherproficiencies: "[]",
      features: "[]",
      inventory: '[{"name":"Longbow","quantity":1,"equipped":true}]',
      spells: '[{"name":"Hunter’s Mark","prepared":true}]',
      characternote: '{"title":"Backstory","content":"A test story"}',
      proficiencylist: "[]",
      active: true,
    },
  ],
  CharacterXCampaign: [{ id: 1, characterid: 7, campaignid: 10 }],
  CreatureFolder: [
    { id: 4, name: "Monsters", parentfolderid: null, ownerid: 1, active: true },
  ],
  Creature: [
    {
      id: 12,
      name: "Goblin Scout",
      ownerid: 1,
      folderid: null,
      imageurl: null,
      cr: "1/4",
      size: "Pequeño",
      creaturetype: "Humanoide",
      alignment: "Neutral",
      ac: 13,
      acnote: "Leather armor",
      currenthp: 7,
      hpmax: 7,
      hpformula: "2d6",
      speed: "9 m",
      abilityscores: "081410100808",
      savingthrows: "[]",
      skills: "[]",
      damageimmunities: "",
      damageresistances: "",
      conditionimmunities: "",
      senses: "Darkvision",
      languages: "Common",
      specialtraits: "[]",
      actions: "[]",
      bonusactions: "[]",
      reactions: "[]",
      gmnotes: "",
      playervisiblenotes: "",
      active: true,
    },
  ],
  CreatureXCampaign: [{ id: 1, creatureid: 12, campaignid: 10 }],
  Chat: [{ id: 20, campaignid: 10 }],
  Message: [
    {
      id: 30,
      chatid: 20,
      senderid: 1,
      senderusername: "GM_Dave",
      characterid: null,
      charactername: null,
      characteravatar: null,
      characterappearance: null,
      type: "text",
      content: "Welcome to the campaign.",
      iswhisper: false,
      whisperto: null,
      timestamp: "2026-05-09T10:00:00Z",
    },
  ],
  Note: [
    {
      id: 40,
      campaignid: 10,
      title: "Session 1 Recap",
      content: "The party arrived in Phandalin.",
      ispublic: true,
      authorid: 1,
      createdat: "2026-05-09",
      active: true,
    },
  ],
  Availability: [],
});

const parseValue = (value) => {
  if (value === "null") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
};

const matchesFilter = (row, key, filter) => {
  const [operator, rawValue] = filter.split(".", 2);
  const value = parseValue(rawValue ?? "");

  if (operator === "eq") return row[key] === value || String(row[key]) === rawValue;
  if (operator === "neq") return row[key] !== value && String(row[key]) !== rawValue;
  if (operator === "is") return row[key] === value;
  if (operator === "in") {
    const values = rawValue.slice(1, -1).split(",").map((item) => parseValue(item.trim()));
    return values.some((item) => row[key] === item || String(row[key]) === String(item));
  }
  if (operator === "gte") return String(row[key]) >= rawValue;
  if (operator === "lte") return String(row[key]) <= rawValue;
  if (operator === "ilike") {
    const pattern = rawValue.replaceAll("%", "").toLowerCase();
    return String(row[key]).toLowerCase() === pattern;
  }
  return true;
};

const createDatabase = () => {
  const tables = initialTables();
  const writes = [];

  const nextId = (rows) => Math.max(0, ...rows.map((row) => Number(row.id) || 0)) + 1;

  const fulfillJson = (route, body, status = 200) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });

  const handleRequest = async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const tableName = decodeURIComponent(url.pathname.split("/").at(-1));
    const rows = tables[tableName] ?? (tables[tableName] = []);
    const filters = [...url.searchParams.entries()].filter(([key]) =>
      !["select", "order", "limit", "offset", "on_conflict"].includes(key),
    );
    const matchingRows = () =>
      rows.filter((row) => filters.every(([key, value]) => matchesFilter(row, key, value)));
    const wantsObject = request.headers().accept?.includes("vnd.pgrst.object+json");

    if (method === "OPTIONS") {
      return route.fulfill({ status: 204, body: "" });
    }

    if (method === "GET" || method === "HEAD") {
      const selected = matchingRows();
      if (wantsObject) {
        return selected.length
          ? fulfillJson(route, selected[0])
          : fulfillJson(route, { message: "No rows found" }, 406);
      }
      return fulfillJson(route, selected);
    }

    const parsedBody = request.postDataJSON?.() ?? {};
    const inputRows = Array.isArray(parsedBody) ? parsedBody : [parsedBody];
    writes.push({ table: tableName, method, rows: structuredClone(inputRows) });

    if (method === "POST") {
      const insertedRows = inputRows.map((input) => {
        const conflictKeys = url.searchParams.get("on_conflict")?.split(",") ?? [];
        const existing = conflictKeys.length
          ? rows.find((row) => conflictKeys.every((key) => row[key] === input[key]))
          : null;
        if (existing) {
          Object.assign(existing, input);
          return existing;
        }
        const defaults = tableName === "CreatureFolder" ? { active: true } : {};
        const normalizedInput = { ...input };
        for (const key of ["ownerid", "userid", "campaignid", "characterid", "creatureid", "parentfolderid", "chatid", "senderid", "authorid"]) {
          if (normalizedInput[key] != null && /^\d+$/.test(String(normalizedInput[key]))) {
            normalizedInput[key] = Number(normalizedInput[key]);
          }
        }
        const inserted = { id: input.id ?? nextId(rows), ...defaults, ...normalizedInput };
        rows.push(inserted);
        return inserted;
      });
      return request.headers().prefer?.includes("return=representation")
        ? fulfillJson(route, wantsObject ? insertedRows[0] : insertedRows)
        : route.fulfill({ status: 201, body: "" });
    }

    if (method === "PATCH") {
      const updatedRows = matchingRows();
      updatedRows.forEach((row) => Object.assign(row, parsedBody));
      return request.headers().prefer?.includes("return=representation")
        ? fulfillJson(route, updatedRows)
        : route.fulfill({ status: 204, body: "" });
    }

    if (method === "DELETE") {
      const removed = new Set(matchingRows());
      tables[tableName] = rows.filter((row) => !removed.has(row));
      return route.fulfill({ status: 204, body: "" });
    }

    return fulfillJson(route, { message: `Unsupported method ${method}` }, 405);
  };

  return { tables, writes, handleRequest };
};

const authenticatedSession = {
  id: 1,
  username: "GM_Dave",
  isGM: true,
  displayName: "Dave the DM",
  email: "dave@example.test",
};

export const test = base.extend({
  backend: async ({ page }, use) => {
    const backend = createDatabase();
    await page.route("**/rest/v1/**", backend.handleRequest);
    await page.routeWebSocket("**/realtime/v1/websocket**", (socket) => socket.close());
    // Playwright's fixture lifecycle callback is named `use`, not a React hook.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(backend);
  },
});

export const signInAsGm = async (page) => {
  await page.addInitScript((session) => {
    localStorage.setItem("dnd_session", JSON.stringify(session));
  }, authenticatedSession);
};

export { expect };
