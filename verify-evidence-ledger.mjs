// verify-evidence-ledger.mjs — check a copy of our EDINET observation log against the published daily heads.
// No dependencies (Node 18+). Usage:
//   node verify-evidence-ledger.mjs <ledger.jsonl> <evidence-heads.jsonl>
// What it checks:
//   1. Every entry: seq is 1,2,3,…; previous_hash is the entry_hash of the entry before (the first one is 64 zeros);
//      entry_hash = SHA-256 of the entry without entry_hash, as JSON with its top-level keys in sorted order.
//   2. evidence-heads.jsonl: each line's prev_sha256 is the SHA-256 of the line before (the first one is null).
//   3. For every published head, the entry at seq = entries in the copy has entry_hash = head.
// Exit code 0 = all checks passed, 1 = a check failed.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const canonical = (o) => JSON.stringify(Object.keys(o).sort().reduce((a, k) => ((a[k] = o[k]), a), {}));
const lines = (p) => readFileSync(p, "utf8").split(/\r?\n/).filter(Boolean);
const [ledgerPath, headsPath] = process.argv.slice(2);
if (!ledgerPath || !headsPath) {
  console.error("usage: node verify-evidence-ledger.mjs <ledger.jsonl> <evidence-heads.jsonl>");
  process.exit(2);
}
const fail = (msg) => {
  console.log(`FAIL ${msg}`);
  process.exit(1);
};

const ledger = lines(ledgerPath).map((l) => JSON.parse(l));
let prev = "0".repeat(64);
ledger.forEach((e, i) => {
  const { entry_hash, ...rest } = e;
  if (e.seq !== i + 1) fail(`seq ${e.seq} at line ${i + 1}`);
  if (e.previous_hash !== prev) fail(`previous_hash does not match at seq ${e.seq}`);
  if (sha256(canonical(rest)) !== entry_hash) fail(`entry_hash does not match at seq ${e.seq}`);
  prev = entry_hash;
});
console.log(`ledger: ${ledger.length} entries, chain OK, last entry_hash ${prev}`);

const heads = lines(headsPath);
let checked = 0;
heads.forEach((raw, i) => {
  const h = JSON.parse(raw);
  const expectPrev = i === 0 ? null : sha256(heads[i - 1]);
  if (h.prev_sha256 !== expectPrev) fail(`evidence-heads line ${i + 1}: prev_sha256 does not match`);
  if (h.entries > ledger.length) return; // the copy is older than this head
  if (ledger[h.entries - 1].entry_hash !== h.head) fail(`head of ${h.date_jst} (entries ${h.entries}) does not match the copy`);
  checked++;
});
console.log(`evidence-heads: ${heads.length} lines, chain OK, ${checked} heads match the copy`);
console.log("PASS");
