# Shenming Divination

A Taiwanese temple-inspired divination app built with Expo Router and React Native.

The app guides users through a ritual-style flow: choose a deity, write a question, prepare with incense, cast jiaobei or enter a Zhuge number, draw an oracle poem, then save, reflect, verify, and follow up with AI-assisted interpretation.

## Current Feature Set

- 38 deity profiles with generated card, soft, and close-up portrait assets.
- Multiple oracle systems, including Leiyu Shi, Jiazi 60, Guanyin Lingqian, Zhuge Shenshu, Ershibaxiu, Tianhou, Luzu, Baosheng, Zhusheng, Jinqian, and other app-curated systems.
- Ritual flow with incense, jiaobei, drawing animation, sound, and result presentation.
- AI interpretation and follow-up chat context.
- Favorites, history, notes, due-first verification follow-ups, wishes, daily fortune, and usage stats.
- Web/PWA-oriented Expo app structure with local API routes for AI interpretation.

## Project Structure

```text
src/app/                 Expo Router screens
src/components/          Ritual, cards, selectors, and shared UI
src/data/                Deity data, image maps, poem catalogs
src/services/            Storage, AI, divination, sharing, stats, notifications
assets/images/gods/      Source and generated deity portraits
assets/sounds/           Ritual sound effects
api/                     Vercel-style serverless AI endpoints
backend/                 Optional local backend server
scripts/                 Asset and maintenance scripts
```

## Setup

```powershell
npm install
npx expo start
```

For web:

```powershell
npm run web
```

For a static web export:

```powershell
npm run export:web
```

## Checks

```powershell
npx tsc --noEmit
npm run lint
```

If `npm run lint` reports missing ESLint packages, install the Expo lint dependencies:

```powershell
npm install --save-dev eslint eslint-config-expo
```

## Oracle Source Notes

Oracle catalog metadata lives in `src/data/oracleCatalog.ts`, and the `/source-audit` screen summarizes the current source type, version tag, completeness note, and next collation needs for each deity-facing oracle system. Each entry includes:

- `sourceType`: whether the system is traditional, app-curated, or a deity-specific adaptation.
- `editionNote`: how the current text was organized or revised.
- `versionTag`: a stable internal version for future source audits.
- `completenessNote`: what is complete today and what still needs source collation.

The result card and library view surface this metadata so users can distinguish traditional structure, app white-language commentary, and future exact-source editions.

## Discovery And Follow-Up

The deity selector supports keyword search and question-category filters. The oracle library can search across all deities, filter by deity, question category, and fortune level, and expand each poem to show source/version notes.

Verification follow-up data is normalized in `src/services/storage.ts`. New records receive 7-day and 30-day review windows, and the home screen prioritizes due follow-ups before upcoming pending records.
## Generated Deity Assets

Each deity has three generated PNG variants:

```text
assets/images/gods/generated/cards/<slug>-card.png
assets/images/gods/generated/soft/<slug>-soft.png
assets/images/gods/generated/closeups/<slug>-closeup.png
```

Regenerate derived `soft` and `closeups` images after changing a card:

```powershell
.\scripts\generate-god-derived-assets.ps1
```

The script only rebuilds derived images when they are missing, stale, or have invalid dimensions.

## PWA And Offline Behavior

The web export injects manifest and service-worker tags through `scripts/patch-pwa.js`. The service worker caches the app shell, manifest, icons, and recently visited static routes. Navigation falls back to the cached app shell when offline, so saved local data, the oracle library, settings, and previously loaded screens remain usable without network access.

Update `public/sw.js`, `public/manifest.json`, and `scripts/patch-pwa.js` together when changing the app name, description, icon paths, or offline route set.
## Legal And Safety Screens

The app includes `/privacy` for privacy policy and terms, plus `/disclaimer` for AI, medical, legal, financial, and divination boundary notices. Keep these screens aligned with any future paid subscription, cloud sync, AI provider, or source-text licensing changes.
## AI Configuration

The app can run with fallback interpretation, but AI features need provider credentials configured in the environment or deployment platform. See `src/services/ai.ts`, `api/interpret.js`, and `backend/src/server.ts` for provider-specific behavior.


