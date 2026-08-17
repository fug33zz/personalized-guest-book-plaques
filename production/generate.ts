import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import opentype from 'opentype.js';
import { parseDesign } from '../site/src/layout';
import type { PlaqueDesign } from '../site/src/types';
import { buildBambuProject, inspectBambuProject } from './bambu-project';
import { buildWeddingMesh } from './geometry';

function argument(name: string, fallback: string) {
  const index = process.argv.indexOf(`--${name}`);
  return resolve(index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback);
}

const designPath = argument('design', 'production/examples/wedding-design.json');
const referencePath = argument('reference', 'models/calibration-plaque-V1.3mf');
const outputPath = argument('output', 'models/production-output/personalized-wedding-plaque.3mf');
const design = parseDesign(JSON.parse(readFileSync(designPath, 'utf8'))) as PlaqueDesign;
function loadFont(path: string) {
  const bytes = readFileSync(path);
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}
const fonts = {
  elegant: loadFont(resolve('node_modules/@fontsource/lobster/files/lobster-latin-400-normal.woff')),
  modern: loadFont(resolve('node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff')),
  cormorant:loadFont(resolve('node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff')),
  playfair:loadFont(resolve('node_modules/@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff')),
  baskerville:loadFont(resolve('node_modules/@fontsource/libre-baskerville/files/libre-baskerville-latin-400-normal.woff')),
  cinzel:loadFont(resolve('node_modules/@fontsource/cinzel/files/cinzel-latin-600-normal.woff')),
  bodoni:loadFont(resolve('node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-600-normal.woff')),
  'alex-brush':loadFont(resolve('node_modules/@fontsource/alex-brush/files/alex-brush-latin-400-normal.woff')),
  allura:loadFont(resolve('node_modules/@fontsource/allura/files/allura-latin-400-normal.woff')),
  parisienne:loadFont(resolve('node_modules/@fontsource/parisienne/files/parisienne-latin-400-normal.woff')),
};
const mesh = buildWeddingMesh(design, fonts);
mkdirSync(dirname(outputPath), { recursive: true });
const project = buildBambuProject(new Uint8Array(readFileSync(referencePath)), design, mesh);
writeFileSync(outputPath, project);
const report = inspectBambuProject(project);
if (report.paintedTriangles !== 0 || report.toolChangeTopZ !== 2.1 || !report.accountMetadataAbsent || String(report.nozzle) !== '0.2') throw new Error(`Generated project failed validation: ${JSON.stringify(report)}`);
console.log(JSON.stringify({ outputPath, design, ...report }, null, 2));
