# Editor architecture

## First milestone

The internal prototype implements one constrained wedding plaque measuring 120 × 70 mm, with a 2 mm base and 1 mm raised details.

The editor currently supports:

- Names and event date with required-field and character-count validation
- Two controlled lettering styles
- Approved base and raised-detail colour palettes
- Deterministic automatic text fitting
- A proportional SVG preview and visible safe area
- Local browser persistence
- Versioned JSON design export and import

It deliberately does not allow dragging, arbitrary resizing, uploads, checkout, customer accounts, or direct 3MF export.

## Shared design contract

The editor stores customer choices in a small versioned object:

```json
{
  "version": 1,
  "templateId": "wedding-classic-v1",
  "names": "Camille & Morgan",
  "date": "11 April 2026",
  "font": "elegant",
  "baseColour": "charcoal",
  "detailColour": "gold"
}
```

This is the contract between the customer interface and future production service. Bambu-specific settings must not be stored in customer designs.

## Boundaries

- `template.ts` owns physical size, field constraints, approved colours, and defaults.
- `layout.ts` owns normalization, deterministic fitting, validation, and imported-file checks.
- `PlaquePreview.tsx` renders the approved layout in physical SVG coordinates.
- `App.tsx` owns the interface, persistence, and design-file workflow.
- The future production service will accept the validated design contract and generate mesh/3MF output using the same template definition.

## Typography warning

The current elegant and modern choices use system font stacks and are suitable for interaction testing only. Production requires commercially licensed, bundled font files. Those exact files must be used both in the browser and by the geometry generator before preview-to-print matching can be claimed.

## Next technical milestone

1. Select and bundle production font files.
2. Convert text and decorations into deterministic vector paths.
3. Share those paths between SVG preview and 3D extrusion.
4. Connect the validated JSON design to the proven Bambu 3MF packaging pipeline.
5. Compare browser preview, generated mesh, Bambu slice, and physical print.
