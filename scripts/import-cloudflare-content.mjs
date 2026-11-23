import fs from "node:fs";

const file = process.argv[2];
const api = process.env.CLOUDFLARE_CMS_API_URL?.replace(/\/$/, "");
const email = process.env.CMS_ADMIN_EMAIL;
const password = process.env.CMS_ADMIN_PASSWORD;
if (!file || !api || !email || !password) {
  console.error("Usage: CLOUDFLARE_CMS_API_URL=... CMS_ADMIN_EMAIL=... CMS_ADMIN_PASSWORD=... node scripts/import-cloudflare-content.mjs ./supabase-content-export.json");
  process.exit(1);
}
const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
const rows = Array.isArray(parsed) ? parsed : [
  { kind: "draft", ...(parsed.draft || {}) },
  { kind: "published", ...(parsed.published || {}) },
];
const login = await fetch(`${api}/auth/login`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});
if (!login.ok) throw new Error(`Login failed: ${await login.text()}`);
const { token } = await login.json();
for (const row of rows) {
  if (!row || !["draft", "published"].includes(row.kind) || !row.data) continue;
  const response = await fetch(`${api}/content/${row.kind}`, {
    method: "PUT",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ data: row.data, updated_at: row.updated_at || new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(`Import of ${row.kind} failed: ${await response.text()}`);
  console.log(`Imported ${row.kind} snapshot.`);
}
console.log("Content snapshots imported. Check media URLs separately before disabling Supabase Storage.");
