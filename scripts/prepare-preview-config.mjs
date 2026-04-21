import { readFile, writeFile } from 'node:fs/promises';

const configPath = new URL('../dist/server/wrangler.json', import.meta.url);
const rawConfig = await readFile(configPath, 'utf8');
const config = JSON.parse(rawConfig);

delete config.pages_build_output_dir;

await writeFile(configPath, `${JSON.stringify(config)}\n`);