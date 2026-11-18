// npm audit with an allowlist for advisories that have no patched release.
// Fails on every other advisory at moderate severity or above.
import { spawnSync } from 'node:child_process';

const allowed = {
  // picomatch ReDoS. No patched version exists and every Vite release depends on it.
  // It only runs at build time on the project's own globs. Remove once patched.
  'GHSA-fc5q-39xc-vjpf': 'picomatch ReDoS, no patch available',
};
const levels = ['moderate', 'high', 'critical'];

const run = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8' });
const report = JSON.parse(run.stdout);
if (report.error) throw new Error(`npm audit failed: ${report.error.summary}`);

const advisories = new Map();
for (const vuln of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vuln.via) {
    if (typeof via === 'object' && levels.includes(via.severity)) advisories.set(via.url, via);
  }
}

const seen = new Set();
let failed = false;
for (const [url, via] of advisories) {
  const id = url.split('/').pop();
  if (allowed[id]) {
    seen.add(id);
    console.warn(`Ignored ${id} (${via.name}, ${via.severity}): ${allowed[id]}`);
  } else {
    failed = true;
    console.error(`${via.severity}: ${via.name} ${via.range} - ${via.title} ${url}`);
  }
}
for (const id of Object.keys(allowed)) {
  if (!seen.has(id)) console.warn(`${id} no longer reported; remove it from scripts/audit.mjs.`);
}

if (failed) process.exit(1);
console.log('No unallowed advisories at moderate severity or above.');
