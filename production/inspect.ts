import { resolve } from 'node:path';
import { inspectBambuProject } from './bambu-project';
const path = resolve(process.argv[2] ?? 'models/production-output/personalized-wedding-plaque.3mf');
console.log(JSON.stringify({ path, ...inspectBambuProject(path) }, null, 2));
