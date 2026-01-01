# Glue Router Testing Checklist (v0.1.0)

Use this checklist while running your Vite dev server (`npm run test:open`) and navigating through the test pages
(`index.html` → `about.html` → `dashboard.html` → `settings.html`).

**Open DevTools (Console + Network tab) on every test** — this is essential for confirmation.

### Core Navigation

-   [ ] Clicking a link calls `glue.push()` and updates the URL in the address bar **without** full page reload
-   [ ] Page content inside `<main data-glue-page>` changes to the new page
-   [ ] Browser **back** button returns to previous page (content restores instantly)
-   [ ] Browser **forward** button works after going back (content restores instantly)
-   [ ] Navigating 3–4 pages forward, then back multiple times → **no new network requests** (all from cache)
-   [ ] Direct URL entry or refresh on a non-home page → full reload occurs (expected safety fallback)

### Layout Nesting & Preservation

-   [ ] Persistent `<div data-glue-layout="app">` content (e.g. header, nav) stays unchanged when navigating between all pages
-   [ ] On `dashboard.html`: `<div data-glue-layout="dashboard">` sidebar appears and stays when navigating away and back to dashboard
-   [ ] Navigating from dashboard → another page → back to dashboard → sidebar content is restored (not re-fetched)

### Head Management

-   [ ] `<title>` in browser tab updates correctly on every navigation (Home → About → Dashboard → Settings)
-   [ ] `<meta name="description">` changes per page (inspect `<head>` in Elements tab)
-   [ ] Dynamic tags in `<template data-glue-head>` are added (e.g. favicon link on about page)
-   [ ] Old dynamic head tags are removed when navigating away (no duplicates in `<head>`)
-   [ ] Tags marked `[data-glue-dynamic]` are cleaned up properly between navigations

### Script Execution & Deduplication

-   [ ] Inline `<script data-glue-script>` on home and settings pages logs to console on first visit
-   [ ] Inline script on settings page runs again when navigating away and back (e.g. color change on `<h1>`)
-   [ ] External `app.js` loads **only once** (check Network tab: one request total)
-   [ ] Navigating to settings → away → back to settings → **no second request** for `app.js` (deduped correctly)
-   [ ] Console shows “app.js loaded and executed!” only once, but alert appears every time you land on settings (current expected behavior)

### Prefetching

-   [ ] Hover over a link (e.g. Dashboard on home page) → Network tab shows a fetch for that HTML file (status 200)
-   [ ] After hover prefetch, clicking the link → content swaps **instantly** (no new network request, served from cache)
-   [ ] Multiple hovers on different links → all corresponding pages appear in Network tab as prefetched

### Edge Cases

-   [ ] Clicking a link to the current page → no navigation, no network request, no content flicker
-   [ ] Clicking a same-page hash link (e.g. `/index.html#anchor`) → URL updates with hash but **no fetch** or content swap
-   [ ] Manually edit URL to a non-existent page and press Enter → full reload occurs
-   [ ] After several navigations, check Network tab → only initial page load + prefetched pages have requests; back/forward use cache only

### Console & Events

-   [ ] **No errors or warnings** in Console during any navigation
-   [ ] Optional: add `window.addEventListener('glue:navigated', () => console.log('navigated'))` → fires on every successful navigation

**All checks passed?** → Your Glue Router v0.1.0 core is working perfectly!

Feel free to add more checks as you implement new features (run-once scripts, scroll restoration, etc.).
