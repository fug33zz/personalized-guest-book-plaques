import { describe, expect, it } from 'vitest';
import { fitText, normalizedText, parseDesign, validateDesign } from './layout';
import { defaultDesign, designForTemplate, getTemplate, templateList, weddingTemplate } from './template';

describe('layout and validation', () => {
  it('normalizes whitespace without changing customer characters', () => {
    expect(normalizedText('  Ana   &   Zoë  ')).toBe('Ana & Zoë');
  });

  it('reduces long names but never passes the tested minimum', () => {
    expect(fitText('Ana & Leo', 'names', 'elegant')).toBe(weddingTemplate.fields.names.maxFontSizeMm);
    expect(fitText('Alexandria & Maximilian-William', 'names', 'modern')).toBeGreaterThanOrEqual(weddingTemplate.fields.names.minFontSizeMm);
    expect(fitText('Alexandria & Maximilian-William', 'names', 'modern')).toBeLessThan(weddingTemplate.fields.names.maxFontSizeMm);
  });

  it('adapts type size to each template text zone', () => {
    for (const template of templateList) {
      const short = fitText('Ana & Leo', 'names', template.defaults.font, template.id);
      const long = fitText('Alexandria & Maximilian', 'names', template.defaults.font, template.id);
      expect(long).toBeLessThanOrEqual(short);
      expect(long).toBeGreaterThanOrEqual(template.fields.names.minFontSizeMm);
    }
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

  it('defines ten wedding templates with explicit eligibility', () => {
    expect(templateList).toHaveLength(10);
    for (const template of templateList) {
      expect(template.eligibility.fonts.length).toBeGreaterThan(0);
      expect(template.eligibility.ornaments).toContain(template.defaults.ornament);
      expect(template.eligibility.borders).toContain(template.defaults.border);
    }
  });

  it('replaces ineligible elements when changing templates', () => {
    const formal=designForTemplate(defaultDesign,'wedding-formal-frame-v1');
    expect(formal.font).toBe('playfair');
    expect(getTemplate(formal.templateId).eligibility.ornaments).toContain(formal.ornament);
    expect(getTemplate(formal.templateId).eligibility.borders).toContain(formal.border);
  });

  it('migrates legacy template ids and retired ornaments', () => {
    const migrated=parseDesign({...defaultDesign,templateId:'wedding-classic-v1',ornament:'rings'});
    expect(migrated.templateId).toBe('wedding-heritage-v1');
    expect(migrated.ornament).toBe('heart');
    expect(migrated.border).toBe('none');
  });
});

