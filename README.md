# Shenming Divination

A Taiwanese temple-inspired divination app built with Expo Router and React Native.

The app guides users through a ritual-style flow: choose a deity, write a question, prepare with incense, cast jiaobei or enter a Zhuge number, draw an oracle poem, then save, reflect, verify, and follow up with AI-assisted interpretation.

## Current Feature Set

- 15 deity profiles with generated card, soft, and close-up portrait assets.
- Multiple oracle systems, including Leiyu Shi, Jiazi 60, Guanyin Lingqian, Zhuge Shenshu, and Ershibaxiu.
- Ritual flow with incense, jiaobei, drawing animation, sound, and result presentation.
- AI interpretation and follow-up chat context.
- Favorites, history, notes, verification status, wishes, daily fortune, and usage stats.
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

## AI Configuration

The app can run with fallback interpretation, but AI features need provider credentials configured in the environment or deployment platform. See `src/services/ai.ts`, `api/interpret.js`, and `backend/src/server.ts` for provider-specific behavior.
