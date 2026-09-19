# Gotham Unbound

A standalone strength, physique, and nutrition tracker, published with GitHub Pages.

**Live app:** https://mahmoudmaaly4r-max.github.io/GUG/

## Use the app

Open the live app in a modern browser. On your phone, use **Add to Home Screen**
or **Install app** when supported. The app shell is cached after the first visit.
Exercise demonstrations require an internet connection.

Choose **Choose a workout** or **Log rest day** on Home, or tap a date in
**Progress → Overview → Log workout / rest day**. Any session can be logged on
any day, including past dates. Start tracking sets, log a completed template,
or give a custom workout a name. Unlogged days remain unlogged.

Progress uses an indexed calendar and a lightweight weight chart. Phone controls
have larger touch targets, safe-area spacing, and keyboard-aware dialogs. Saved
workouts keep the date and program details used when they were started.

App data is stored in this browser on this device using IndexedDB. To transfer
existing history, use **More → Backup & Restore → Export Data**, then import the
backup in the new browser. Browser reminders depend on browser support and the
app being active; this web deployment does not add native scheduled alarms.

## Project structure

- `app/src/` — editable React application and IndexedDB storage adapter.
- `app/index.html` — Vite HTML entry point.
- `app/public/` — source icons and static assets.
- `vite.config.js` — build and installable PWA configuration.
- `package-lock.json` — pinned dependency tree for reproducible installs.
- `scripts/publish-static.mjs` — copies the production build to the repository root.
- Root `index.html`, `assets/`, icons, manifest, and service worker — generated files
  served by GitHub Pages. Change the source, then rebuild these files.

## Local development

Use Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Run `npm test` for date handling, saved-log preservation, tracked workout flows,
and Progress checks with a large history. Component tests use in-memory storage;
they do not change real app data.

## Publish an update

```sh
npm ci
npm test
npm run build
```

Commit the source and regenerated production files and push to `main`.
GitHub Pages is configured to deploy from **main / (root)**, so its existing
**pages build and deployment** workflow publishes the updated site. No custom
workflow, deployment token, backend server, or paid host is required.
The `.nojekyll` file makes Pages serve the built app directly.

For other static hosts, `npm run build:bundle` creates a deployable `dist/` folder.

## Deployment repair

The original upload flattened `src/` and `public/` into the repository root,
leaving the HTML pointing at a missing JSX entry. This version restores the
source directories, includes a lockfile, and publishes compiled JavaScript.
