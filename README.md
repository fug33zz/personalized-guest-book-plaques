# Personalized Guest Book Plaques

An online product configurator for personalized, single-piece 3D-printed plaques that are glued to event guest books.

The project is currently in its foundation phase. The first goal is to document the product clearly, validate manufacturing constraints, and create a small set of safe editable templates before committing to a fully flexible editor.

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

## Local development

```powershell
npm install
npm run dev
```

The terminal prints the local editor URL. Run `npm test` for the constraint and interface tests, and `npm run build` for the production bundle.

## Status

The first internal editor prototype is in development using a constrained 120 × 70 mm wedding template. Physical dimensions, materials, production fonts, pricing, fulfilment, and automated 3MF output still need validation.

