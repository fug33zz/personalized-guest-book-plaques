# Wedding template catalogue

The first catalogue contains four distinct compositions built from controlled, interchangeable parts. A customer chooses a template first; the editor then exposes only elements approved for that composition.

| Template | Layout character | Eligible fonts | Eligible ornaments | Eligible borders |
| --- | --- | --- | --- | --- |
| Classic heart | Centered, romantic divider | Elegant, Modern | Heart, rings, stars | None, fine |
| Botanical | Soft central type with leafy framing | Elegant, Modern | Leaf sprigs, heart, none | None, fine |
| Modern frame | Structured type and generous spacing | Modern | None, rings, stars | Fine, double |
| Monogram | Derived initials above names and date | Elegant, Modern | None, heart, stars | None, fine, double |

## Eligibility behaviour

- Template selection controls which font, ornament, and border options appear.
- When a customer changes template, compatible selections are preserved.
- An incompatible selection is replaced by the new template's approved default.
- Imported legacy version-1 designs without ornament or border values receive template defaults.
- Imported designs containing an invalid combination are rejected by validation.
- The same validated design object drives the SVG preview and generated 3MF geometry.

This makes elements interchangeable without allowing combinations that collide visually or undermine the intended template. The rules are data-driven in `site/src/template.ts`; adding an approved part normally requires defining its identifier, preview geometry, production geometry, label, and eligibility entries.

## Template-specific behaviour

- Classic heart adds its own divider lines around the selected central ornament.
- Botanical uses paired stems and leaves as true raised geometry.
- Modern frame requires a border and restricts typography to the modern face.
- Monogram derives initials from the names automatically; customers do not need another input field.

## Production status

The four templates generate sanitized two-colour Bambu 3MF projects with the current provisional production profile. Automated inspection confirms top-surface painting, three-layer colour penetration, top ironing, a 0.2 mm nozzle profile, and removal of account metadata.

Final plaque dimensions, safe margins, minimum strokes, ornament clearances, and material combinations remain intentionally provisional until the physical books arrive and print testing resumes.
