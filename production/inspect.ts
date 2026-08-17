import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { inspectBambuProject } from './bambu-project';
const path = resolve(process.argv[2] ?? 'models/production-output/personalized-wedding-plaque.3mf');
console.log(JSON.stringify({ path, ...inspectBambuProject(new Uint8Array(readFileSync(path))) }, null, 2));
