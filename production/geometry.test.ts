import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import opentype from 'opentype.js';
import { describe, expect, it } from 'vitest';
import { defaultDesign, designForTemplate, templateList } from '../site/src/template';
import { fontIds } from '../site/src/fonts';
import { buildWeddingMesh } from './geometry';
import { buildBambuProject, inspectBambuProject } from './bambu-project';

function loadFont(path: string) {
  const bytes = readFileSync(resolve(path));
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

const fonts = {
  elegant: loadFont('node_modules/@fontsource/lobster/files/lobster-latin-400-normal.woff'),
  modern: loadFont('node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff'),
  cormorant:loadFont('node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff'),
  playfair:loadFont('node_modules/@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff'),
  baskerville:loadFont('node_modules/@fontsource/libre-baskerville/files/libre-baskerville-latin-400-normal.woff'),
  cinzel:loadFont('node_modules/@fontsource/cinzel/files/cinzel-latin-600-normal.woff'),
  bodoni:loadFont('node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-600-normal.woff'),
  'alex-brush':loadFont('node_modules/@fontsource/alex-brush/files/alex-brush-latin-400-normal.woff'),
  allura:loadFont('node_modules/@fontsource/allura/files/allura-latin-400-normal.woff'),
  parisienne:loadFont('node_modules/@fontsource/parisienne/files/parisienne-latin-400-normal.woff'),
};

describe('production wedding geometry', () => {
  it('publishes a sanitized and correctly configured browser template', () => {
    const report=inspectBambuProject(new Uint8Array(readFileSync(resolve('site/public/templates/bambu-h2s-02mm-template.3mf'))));
    expect(report.accountMetadataAbsent).toBe(true);
    expect(report.printer).toBe('Bambu Lab H2S');
    expect(String(report.nozzle)).toBe('0.2');
    expect(String(report.penetration)).toBe('3');
    expect(report.ironing).toBe('top');
  });

  it('exports an automatic filament change at the first raised-detail layer', () => {
    const templateBytes=new Uint8Array(readFileSync(resolve('site/public/templates/bambu-h2s-02mm-template.3mf')));
    const mesh=buildWeddingMesh(defaultDesign,fonts);
    const report=inspectBambuProject(buildBambuProject(templateBytes,defaultDesign,mesh));
    expect(report.paintedTriangles).toBe(0);
    expect(report.layerHeight).toBe(.1);
    expect(report.toolChangeTopZ).toBe(2.1);
  });

  it.each(fontIds)('creates bounded, painted geometry for %s', (font) => {
    const mesh = buildWeddingMesh({ ...defaultDesign, font }, fonts);
    const bounds = mesh.bounds();
    expect(bounds.minimum).toEqual([0, 0, 0]);
    expect(bounds.maximum).toEqual([120, 70, 3]);
    expect(mesh.triangles.length).toBeGreaterThan(1000);
    const top = mesh.triangles.filter((triangle) => triangle.painted);
    expect(top.length).toBeGreaterThan(100);
    expect(top.every((triangle) => [triangle.a, triangle.b, triangle.c].every((index) => mesh.vertices[index][2] === 3))).toBe(true);
  });

  it('generates different outlines for different customer text', () => {
    const first = buildWeddingMesh(defaultDesign, fonts);
    const second = buildWeddingMesh({ ...defaultDesign, names: 'Élodie & João' }, fonts);
    expect(second.vertices).not.toEqual(first.vertices);
    expect(second.triangles.length).not.toBe(first.triangles.length);
  });

  it.each(templateList)('builds the $title template within the shared physical envelope', (template) => {
    const design=designForTemplate(defaultDesign,template.id);
    const mesh=buildWeddingMesh(design,fonts);
    expect(mesh.bounds()).toEqual({minimum:[0,0,0],maximum:[120,70,3]});
    expect(mesh.triangles.some((triangle)=>triangle.painted)).toBe(true);
  });
});
