import { describe, expect, it } from 'vitest';
import { fitText, normalizedText, parseDesign, validateDesign } from './layout';
import { defaultDesign, weddingTemplate } from './template';

describe('layout and validation', () => {
  it('normalizes whitespace without changing customer characters', () => {
    expect(normalizedText('  Ana   &   Zoë  ')).toBe('Ana & Zoë');
  });

  it('reduces long names but never passes the tested minimum', () => {
    expect(fitText('Ana & Leo', 'names', 'elegant')).toBe(weddingTemplate.fields.names.maxFontSizeMm);
    expect(fitText('Alexandria & Maximilian-William', 'names', 'modern')).toBeGreaterThanOrEqual(weddingTemplate.fields.names.minFontSizeMm);
    expect(fitText('Alexandria & Maximilian-William', 'names', 'modern')).toBeLessThan(weddingTemplate.fields.names.maxFontSizeMm);
  });

  it('rejects empty required fields and matching colours', () => {
    const result = validateDesign({ ...defaultDesign, names: '  ', baseColour: 'sage', detailColour: 'sage' });
    expect(result.valid).toBe(false);
    expect(result.errors.names).toBeDefined();
    expect(result.errors.colours).toBeDefined();
  });

  it('round-trips a valid saved design', () => {
    expect(parseDesign(JSON.parse(JSON.stringify(defaultDesign)))).toEqual(defaultDesign);
  });

  it('rejects unknown template versions', () => {
    expect(() => parseDesign({ ...defaultDesign, version: 2 })).toThrow(/version or template/i);
  });
});

