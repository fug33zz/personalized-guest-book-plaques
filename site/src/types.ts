export type FontId = 'elegant'|'modern'|'cormorant'|'playfair'|'baskerville'|'cinzel'|'bodoni'|'alex-brush'|'allura'|'parisienne';
export type ColourId = 'charcoal' | 'ivory' | 'navy' | 'sage' | 'gold' | 'silver';
export type TemplateId = 'wedding-heritage-v1'|'wedding-botanical-v1'|'wedding-arch-v1'|'wedding-formal-frame-v1'|'wedding-minimal-script-v1'|'wedding-vintage-v1'|'wedding-garden-wreath-v1'|'wedding-art-deco-v1'|'wedding-scalloped-v1'|'wedding-oval-cameo-v1';
export type LayoutId = 'heritage'|'botanical'|'arch'|'formal'|'minimal'|'vintage'|'wreath'|'deco'|'scalloped'|'cameo';
export type OrnamentId = 'heart' | 'none';
export type BorderId = 'none' | 'single' | 'double';
export interface PlaqueDesign { version: 1; templateId: TemplateId; names: string; date: string; font: FontId; ornament: OrnamentId; border: BorderId; baseColour: ColourId; detailColour: ColourId; }
export interface FieldConstraint { maxCharacters: number; minFontSizeMm: number; maxFontSizeMm: number; maxWidthMm: number; }
export interface TextPlacement extends FieldConstraint { x: number; baselineY: number; align: 'center'|'left'; }
export interface PlaqueTemplate { id: TemplateId; title: string; subtitle: string; description: string; widthMm: number; heightMm: number; baseThicknessMm: number; detailHeightMm: number; safeMarginMm: number; layout: LayoutId; heart: {x:number;y:number}; fields: { names: TextPlacement; date: TextPlacement }; eligibility: { fonts: FontId[]; ornaments: OrnamentId[]; borders: BorderId[] }; defaults: { font: FontId; ornament: OrnamentId; border: BorderId }; }
export interface ValidationResult { valid: boolean; errors: Partial<Record<'names'|'date'|'colours'|'elements'|'file',string>>; }
