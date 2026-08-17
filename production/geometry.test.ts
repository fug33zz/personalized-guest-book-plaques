import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import opentype from 'opentype.js';
import { describe, expect, it } from 'vitest';
import { defaultDesign } from '../site/src/template';
import { buildWeddingMesh } from './geometry';
import { inspectBambuProject } from './bambu-project';

function loadFont(path: string) {
  const bytes = readFileSync(resolve(path));
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

const fonts = {
  elegant: loadFont('node_modules/@fontsource/lobster/files/lobster-latin-400-normal.woff'),
  modern: loadFont('node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff'),
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

  it.each(['elegant', 'modern'] as const)('creates bounded, painted geometry for %s', (font) => {
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
});
