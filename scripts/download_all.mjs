import fs from 'fs';
import path from 'path';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.status === 429) {
      console.log(`Rate limited, waiting 1.5s (attempt ${i + 1})...`);
      await sleep(1500);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }
  throw new Error('Exceeded retries on 429');
}

async function main() {
  const filePath = process.argv[2];
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  const downloads = data.downloads || [];

  const outPath = path.join(process.cwd(), 'scripts', 'mingcute_downloaded.json');
  let existing = {};
  if (fs.existsSync(outPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    } catch {}
  }

  for (const item of downloads) {
    if (existing[item.fileName]) {
      console.log(`Already have ${item.fileName}, skipping.`);
      continue;
    }
    try {
      const text = await fetchWithRetry(item.downloadUrl);
      existing[item.fileName] = {
        hash: item.iconHash,
        svg: text
      };
      console.log(`✓ Downloaded ${item.fileName}`);
      fs.writeFileSync(outPath, JSON.stringify(existing, null, 2));
      await sleep(250); // Be respectful of rate limits
    } catch (e) {
      console.error(`✗ ${item.fileName}:`, e.message);
    }
  }

  console.log(`Total saved icons: ${Object.keys(existing).length}`);
}

main();
