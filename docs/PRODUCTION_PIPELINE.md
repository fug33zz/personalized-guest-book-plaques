# Editor-to-3MF production bridge

## Outcome

The editor and local production generator now share:

- The 120 × 70 × 2 mm plaque definition
- One-millimetre raised details
- Lobster 400 and Montserrat 600 font binaries
- Text normalization, font sizing, field width, and safe-area constraints
- Heart and divider geometry
- The versioned customer design JSON contract

The browser remains a static public application. It never receives private Bambu machine profiles or account metadata.

## Fonts and licensing

- **Lobster 400** is used for the script option.
- **Montserrat 600** is used for the modern option.
- Both packages declare the SIL Open Font License 1.1.
- The website self-hosts the exact font binaries used by the generator.
- The deployed font notice is available at `fonts-license.txt`.

The production suitability of thin glyphs still requires physical print tests. Licensing approval does not imply manufacturing approval.

## Generate a project

Save or copy a valid editor JSON file into the workspace, then run:

```powershell
npm.cmd run generate:3mf -- --design wedding-plaque-design.json
```

Defaults:

- Reference: `models/calibration-plaque-V1.3mf`
- Output: `models/production-output/personalized-wedding-plaque.3mf`

Override either path when needed:

```powershell
npm.cmd run generate:3mf -- `
  --design production/examples/wedding-design-modern.json `
  --reference models/calibration-plaque-V1.3mf `
  --output models/production-output/modern-test.3mf
```

Inspect an output without opening Bambu Studio:

```powershell
npm.cmd run inspect:3mf -- models/production-output/modern-test.3mf
```

## Generation stages

1. Validate and normalize the versioned design JSON.
2. Load the same WOFF font binaries used by the browser.
3. Calculate text size using actual font advance widths.
4. Flatten glyph Bézier curves into printable contours.
5. Classify outer contours and counters such as `O`, `A`, and `é`.
6. Triangulate and extrude the plaque, text, heart, and dividers.
7. Mark only raised top triangles as Bambu paint colour 2.
8. Clone the private reference archive and replace geometry, placement, bounds, colours, and metadata.
9. Remove preview images and account-bearing project metadata.
10. Validate the resulting archive before reporting success.

## Preserved Bambu configuration

The generator retains the reference project's H2S printer, 0.2 mm nozzle, two PLA profiles, plate, layer height, three walls, three top/bottom shells, infill, ironing, colour penetration, purge matrix, temperatures, speeds, and machine G-code.

Only the two displayed filament colours are updated from the editor design. Purge volumes remain those of the reference fixture and must be reviewed for each real filament pair.

## Security boundary

The reference project and generated production outputs are Git-ignored. This prevents the Bambu account identifier and private production configuration from entering the public repository.

The generated outer model omits `DesignerUserId`, and automated inspection rejects generated projects when account metadata is found.

## Required manual acceptance

Every new geometry/font combination must still be opened and sliced in Bambu Studio. Before printing, confirm:

- No project repair or corruption warning
- Correct dimensions and placement
- Correct printer, nozzle, plate, and material profiles
- Correct filament assignment on every raised top surface
- Three-layer colour penetration
- Legible counters and accents
- No detached islands or strokes below the validated minimum
- Appropriate purge volumes for the actual colours
- Successful save/reopen round trip

The generator is an internal prototype, not yet an unattended production service.
