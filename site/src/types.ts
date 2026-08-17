export type FontId = 'elegant' | 'modern';
export type ColourId = 'charcoal' | 'ivory' | 'navy' | 'sage' | 'gold' | 'silver';
export type TemplateId = 'wedding-classic-v1' | 'wedding-botanical-v1' | 'wedding-modern-v1' | 'wedding-monogram-v1';
export type OrnamentId = 'heart' | 'rings' | 'stars' | 'botanical' | 'none';
export type BorderId = 'none' | 'single' | 'double';
export interface PlaqueDesign { version: 1; templateId: TemplateId; names: string; date: string; font: FontId; ornament: OrnamentId; border: BorderId; baseColour: ColourId; detailColour: ColourId; }
export interface FieldConstraint { maxCharacters: number; minFontSizeMm: number; maxFontSizeMm: number; maxWidthMm: number; }
export interface TextPlacement extends FieldConstraint { x: number; baselineY: number; align: 'center'|'left'; }
export interface PlaqueTemplate { id: TemplateId; title: string; subtitle: string; description: string; widthMm: number; heightMm: number; baseThicknessMm: number; detailHeightMm: number; safeMarginMm: number; layout: 'classic'|'botanical'|'modern'|'monogram'; fields: { names: TextPlacement; date: TextPlacement }; eligibility: { fonts: FontId[]; ornaments: OrnamentId[]; borders: BorderId[] }; defaults: { font: FontId; ornament: OrnamentId; border: BorderId }; }
export interface ValidationResult { valid: boolean; errors: Partial<Record<'names'|'date'|'colours'|'elements'|'file',string>>; }
