# marcelobayon.com

Personal site for **Marcelo Bayon**, plus an interactive resume — _The Midnight
Mountain Railway_ — at [`/resume`](https://marcelobayon.com/resume).

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **React Router** for routing (`/` and `/resume`)
- **three.js** + **@react-three/fiber** + **@react-three/drei** for the 3D scene
- **Vitest** (+ jsdom) for tests
- Deployed on **Netlify**

The 3D libraries are code-split and lazy-loaded, so the home page ships ~16 KB
of gzipped JS and three.js only downloads when a visitor enters `/resume`.

## Routes

| Route     | What it is                                                                 |
| --------- | -------------------------------------------------------------------------- |
| `/`       | Main landing page (no WebGL required)                                       |
| `/resume` | The railway experience, with an accessible text-résumé fallback            |

`/resume` automatically falls back to the text résumé when WebGL is
unavailable or the visitor has `prefers-reduced-motion` enabled. Anyone can
toggle between the two.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run test       # vitest
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Architecture

- `src/scene/scene-config.ts` — **single source of truth for geometry**: the
  railway spline, station progress values, upright orientation frames, and a
  track-clearance validator. Everything spatial derives from here.
- `src/data/resume-content.ts` — **single source of truth for content**. Drives
  both the 3D station cards and the text résumé. See `CONTENT_NOTES` at the
  bottom of that file for items to verify.
- `src/resume/` — the `/resume` feature: `RailwayExperience` (scroll + state),
  `scene/` (Mountain, Railway, Train, Stations, Environment, CameraRig),
  `overlay/` (navigation + live station content), and `TraditionalResume`.
- `src/pages/HomePage.tsx` — the landing page.

State model: scroll position is the single source of truth for journey
progress. Frame-loop values live in refs so scrolling never re-renders the 3D
tree; React state only updates when the active chapter changes.

## Deployment (Netlify)

`netlify.toml` sets the build command (`npm run build`), publish dir (`dist`),
the SPA fallback redirect (so `/resume` resolves on direct load), and cache +
security headers. Netlify is linked to this repo's default branch and deploys
on push.

## Content to confirm

A few resume facts were set conservatively and should be confirmed by Marcelo
(details in `src/data/resume-content.ts` → `CONTENT_NOTES`): the official Amazon
title, UDAF end date, the intentionally-omitted Colorado College entry,
approximate dates on older roles, contact details (LinkedIn URL, whether to show
the NMLS number), and book titles/links.

## Roadmap

- **Phase 2 — diorama art pass:** richer station buildings, bridges/tunnel
  portals, snow, GLB assets where they earn their weight.
- **Phase 4 — production polish:** prerender/SSG the text résumé for SEO,
  quality tiers for low-end GPUs, downloadable PDF once an approved one exists.

Built as a self-contained `/resume` feature; it does not alter unrelated site
configuration.
