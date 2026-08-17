export type FontId = 'elegant' | 'modern';
export type ColourId = 'charcoal' | 'ivory' | 'navy' | 'sage' | 'gold' | 'silver';
export interface PlaqueDesign { version: 1; templateId: 'wedding-classic-v1'; names: string; date: string; font: FontId; baseColour: ColourId; detailColour: ColourId; }
export interface FieldConstraint { maxCharacters: number; minFontSizeMm: number; maxFontSizeMm: number; maxWidthMm: number; }
export interface PlaqueTemplate { id: PlaqueDesign['templateId']; title: string; widthMm: number; heightMm: number; baseThicknessMm: number; detailHeightMm: number; safeMarginMm: number; fields: { names: FieldConstraint; date: FieldConstraint; }; }
export interface ValidationResult { valid: boolean; errors: Partial<Record<'names' | 'date' | 'colours' | 'file', string>>; }

