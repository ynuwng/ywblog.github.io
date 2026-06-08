import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { gzip as gzipBuffer } from 'node:zlib';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const gzip = promisify(gzipBuffer);
const distAssets = fileURLToPath(new URL('../dist/assets/', import.meta.url));

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

async function main() {
  let entries;
  try {
    entries = await readdir(distAssets);
  } catch {
    console.error('dist/assets not found. Run `npm run build` first.');
    process.exitCode = 1;
    return;
  }

  const rows = [];
  for (const name of entries) {
    const ext = extname(name);
    if (ext !== '.js' && ext !== '.css') continue;

    const file = join(distAssets, name);
    const size = await stat(file);
    const gz = await gzip(await readFile(file));
    rows.push({ name, raw: size.size, gzip: gz.length });
  }

  rows.sort((a, b) => b.raw - a.raw);

  console.log('Bundle report');
  console.log('-------------');
  for (const row of rows) {
    console.log(`${row.name.padEnd(42)} raw ${formatKb(row.raw).padStart(10)}   gzip ${formatKb(row.gzip).padStart(10)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
