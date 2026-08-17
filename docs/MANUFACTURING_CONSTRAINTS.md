# Manufacturing constraints

These values are initial hypotheses, not final specifications. Each must be confirmed with physical test prints and the actual guest-book covers.

## Geometry

| Property | Initial working value | Validation needed |
| --- | --- | --- |
| Plaque thickness | 1.8–2.5 mm | Rigidity, weight, print time |
| Raised detail height | 0.8–1.2 mm | Legibility and filament changes |
| Minimum text stroke | 1.2 mm | Test every approved font |
| Minimum isolated detail | 1.5 mm | Handling and nozzle limitations |
| Corner radius | 3–6 mm | Match book and visual style |
| Rear face | Completely flat | Adhesive coverage |
| Edge treatment | Small chamfer or radius | Comfort and finish |

## Layout safeguards

- All content must remain within a fixed safe area.
- Text length must be limited per field and template.
- Font size may scale only within a tested range.
- Script fonts require special checks for thin strokes and disconnected marks.
- Decorative elements must come from an approved library.
- The editor must prevent overlaps and content outside the plaque.
- Preview and production output must use the exact same font files and layout logic.

## Material and colour

- Start by testing matte PLA for the base and standard or silk PLA for raised details.
- Record real filament names and supplier codes rather than relying on screen colour names.
- Treat the on-screen colour as an approximation and disclose that clearly.
- Test metallic-looking filaments for brittleness and small-feature quality.

## Attachment

The adhesive is not selected. Testing must cover the actual cover materials, initial tack, cure time, flexing, temperature and humidity, staining, and removal risk.

## Required test record

For every approved template/font/material combination, record the printer and slicer profile, nozzle and layer height, dimensions, mass, print duration, material use, photographs, minimum successful text size, adhesive result, pass/fail notes, and revision number.

