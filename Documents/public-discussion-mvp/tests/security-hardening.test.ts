import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildContentSecurityPolicy, securityHeaders } from "../lib/security-headers.ts";
import { isProtectedPagePath } from "../lib/protected-routes.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readProjectFile(...segments: string[]) {
  return readFileSync(path.join(projectRoot, ...segments), "utf8");
}

function extractBlock(source: string, startMarker: string, endMarker: string) {
  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker, startIndex + startMarker.length);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Unable to extract block: ${startMarker}`);
  }

  return source.slice(startIndex, endIndex);
}

function extractSelectList(viewBlock: string) {
  const selectIndex = viewBlock.indexOf("select");
  const fromIndex = viewBlock.indexOf("from", selectIndex);

  if (selectIndex === -1 || fromIndex === -1) {
    throw new Error("Unable to extract select list.");
  }

  return viewBlock.slice(selectIndex, fromIndex);
}

test("security migration revokes anon access to sensitive base tables", () => {
  const sql = readProjectFile("supabase", "security-hardening.sql");

  assert.match(sql, /revoke all on public\.profiles from anon;/);
  assert.match(sql, /revoke all on public\.cases from anon;/);
  assert.match(sql, /revoke all on public\.proposals from anon;/);
  assert.match(sql, /revoke all on public\.submissions from anon;/);
  assert.match(sql, /revoke all on public\.revisions from anon;/);
});

test("profiles select policy only allows reading your own row", () => {
  const sql = readProjectFile("supabase", "security-hardening.sql");
  const hotfixSql = readProjectFile("supabase", "fix-profiles-policy-recursion.sql");

  assert.ok(!sql.includes('create policy "Management roles can read profiles"'));
  assert.match(sql, /create policy "Users can read own profile"[\s\S]*using \(auth\.uid\(\) = id\);/);
  assert.ok(!hotfixSql.includes('create policy "Management roles can read profiles"'));
});

test("public views expose safe columns only", () => {
  const sql = readProjectFile("supabase", "security-hardening.sql");
  const publicCasesBlock = extractBlock(
    sql,
    "create or replace view public.public_cases",
    "create or replace view public.public_proposals",
  );
  const publicProposalsBlock = extractBlock(
    sql,
    "create or replace view public.public_proposals",
    "create or replace view public.public_accepted_submissions",
  );
  const publicProposalSelectList = extractSelectList(publicProposalsBlock);

  assert.match(publicCasesBlock, /created_by_display_name/);
  assert.match(publicCasesBlock, /promoted_by_display_name/);
  assert.ok(!/\bemail\b/.test(publicCasesBlock));
  assert.ok(!/\brole\b/.test(publicCasesBlock));
  assert.ok(!/\buser_id\b/.test(publicProposalSelectList));
  assert.ok(!/\breviewed_by\b/.test(publicProposalSelectList));
  assert.ok(!/\bemail\b/.test(publicProposalsBlock));
  assert.ok(!/\brole\b/.test(publicProposalsBlock));
});

test("storage hardening removes public listing policy", () => {
  const sql = readProjectFile("supabase", "security-hardening.sql");

  assert.match(sql, /drop policy if exists "Anyone can view case assets" on storage\.objects;/);
  assert.ok(!/create policy "Anyone can view case assets"[\s\S]*for select[\s\S]*to public/.test(sql));
  assert.match(sql, /create policy "Level 4 can upload case assets"/);
});

test("protected route matcher covers admin and case edit pages", () => {
  assert.equal(isProtectedPagePath("/admin/submissions"), true);
  assert.equal(isProtectedPagePath("/admin"), true);
  assert.equal(isProtectedPagePath("/cases/123/edit"), true);
  assert.equal(isProtectedPagePath("/cases/123"), false);
  assert.equal(isProtectedPagePath("/proposals"), false);
});

test("protected pages enforce role checks before loading sensitive data", () => {
  const adminPage = readProjectFile("app", "admin", "submissions", "page.tsx");
  const caseEditPage = readProjectFile("app", "cases", "[id]", "edit", "page.tsx");

  assert.ok(adminPage.indexOf('requirePageRole("level_3")') < adminPage.indexOf("getAdminSubmissions("));
  assert.ok(caseEditPage.indexOf('requirePageRole("level_4")') < caseEditPage.indexOf("getCaseByIdForEditor("));
});

test("proposal board no longer depends on public author UUIDs for edit controls", () => {
  const board = readProjectFile("components", "proposals-board.tsx");

  assert.match(board, /fetch\("\/api\/proposals\/mine"/);
  assert.ok(!board.includes("proposal.user_id === currentUserId"));
});

test("security headers include strict browser protections", () => {
  const csp = buildContentSecurityPolicy();
  const headerMap = new Map(securityHeaders.map((header) => [header.key, header.value]));

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /connect-src 'self'/);
  assert.equal(headerMap.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headerMap.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.equal(headerMap.get("X-Frame-Options"), "DENY");
  assert.equal(headerMap.get("Cross-Origin-Opener-Policy"), "same-origin");
  assert.equal(headerMap.get("Cross-Origin-Resource-Policy"), "same-origin");
});
