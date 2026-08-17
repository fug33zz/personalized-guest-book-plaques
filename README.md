# Personalized Guest Book Plaques

An online product configurator for personalized, single-piece 3D-printed plaques that are glued to event guest books.

The project currently has a working constrained editor and browser-side Bambu 3MF export. The wedding collection is the first multi-template catalogue; its production dimensions remain provisional until the physical books arrive.

## Product idea

Clients select a plaque template, personalize approved fields such as names, event type, age, date, colours, and decorative elements, and preview the result online. Every permitted configuration must remain printable as a flat, one-piece plaque.

Initial use cases include weddings, birthdays, retirements, anniversaries, baby celebrations, and corporate events.

## Repository structure

- `docs/PROJECT_BRIEF.md` — product definition and known requirements
- `docs/MANUFACTURING_CONSTRAINTS.md` — initial print and assembly rules to validate
- `docs/DECISIONS.md` — decision log
- `docs/OPEN_QUESTIONS.md` — information needed before roadmap and implementation
- `site/` — initial public project page and future editor shell
- `.github/workflows/pages.yml` — GitHub Pages deployment
- `references/` — source imagery supplied for design direction

See `docs/WEDDING_TEMPLATE_CATALOGUE.md` for the wedding layouts and interchangeable-element rules.

## Local development

```powershell
npm install
npm run dev
```

The terminal prints the local editor URL. Run `npm test` for the constraint and interface tests, and `npm run build` for the production bundle.

## Generate a production test

The public editor now generates and downloads a sanitized Bambu-compatible 3MF directly in the browser. Customer text stays on the device.

For local or batch generation, the command-line generator requires the original private Bambu reference project at `models/calibration-plaque-V1.3mf`:

```powershell
npm.cmd run generate:3mf -- --design production/examples/wedding-design.json
```

Generated projects are written under `models/production-output/` and intentionally excluded from Git. See `docs/PRODUCTION_PIPELINE.md` for the architecture, validation, and Bambu Studio acceptance checklist.

## Status

The wedding editor now contains ten constrained templates, ten curated production fonts, integrated decoration, and direct browser-side 3MF output. Physical dimensions, material pairings, pricing, and fulfilment still need validation against the books and physical prints.

