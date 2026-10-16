# Splunk SDK reference documentation — GitHub Pages preview

A preview of the six Splunk SDK and logging-library API references rendered as
standalone GitHub Pages sites with consistent Splunk branding.

**Live:** https://pking70.github.io/sdk-docs-preview/

## Why this exists

The SDK reference docs are currently published to docs.splunk.com, served
inside an iframe under that site's wrapper. docs.splunk.com is being
decommissioned. The proposal is to publish each kit as a standalone site at
`splunk.github.io/<repo>/`, with dev.splunk.com acting as the reader-facing hub
that links out to them.

This repo demonstrates what that looks like, and proves the mechanics of
serving these generators from GitHub Pages. It is a hand-built static snapshot
on a personal account — not connected to the real SDK repos, and not
automated.

## Contents

| Kit | Live preview | Generator | Pages |
|---|---|---|---|
| Splunk SDK for Python | [splunk-sdk-python/](https://pking70.github.io/sdk-docs-preview/splunk-sdk-python/) | Sphinx + Furo | 12 |
| Splunk SDK for Java | [splunk-sdk-java/](https://pking70.github.io/sdk-docs-preview/splunk-sdk-java/) | JavaDoc 21 | 187 |
| Splunk Logging for Java | [splunk-library-javalogging/](https://pking70.github.io/sdk-docs-preview/splunk-library-javalogging/) | JavaDoc 21 | 42 |
| Splunk SDK for JavaScript | [splunk-sdk-javascript/](https://pking70.github.io/sdk-docs-preview/splunk-sdk-javascript/) | JSDoc 4 | 49 |
| Splunk Logging for JavaScript | [splunk-javascript-logging/](https://pking70.github.io/sdk-docs-preview/splunk-javascript-logging/) | JSDoc 4 | 6 |
| Splunk Bunyan Logger | [splunk-bunyan-logger/](https://pking70.github.io/sdk-docs-preview/splunk-bunyan-logger/) | JSDoc 4 | 5 |

301 HTML pages total.

Some representative deep links, to confirm nested paths resolve:

- [`splunk-sdk-java/com/splunk/Service.html`](https://pking70.github.io/sdk-docs-preview/splunk-sdk-java/com/splunk/Service.html)
- [`splunk-sdk-javascript/splunkjs.Service.html`](https://pking70.github.io/sdk-docs-preview/splunk-sdk-javascript/splunkjs.Service.html)
- [`splunk-library-javalogging/com/splunk/logging/HttpEventCollectorSender.html`](https://pking70.github.io/sdk-docs-preview/splunk-library-javalogging/com/splunk/logging/HttpEventCollectorSender.html)
- [`splunk-sdk-java/search.html`](https://pking70.github.io/sdk-docs-preview/splunk-sdk-java/search.html) — JavaDoc's built-in client-side search
- [`splunk-sdk-python/search.html`](https://pking70.github.io/sdk-docs-preview/splunk-sdk-python/search.html) — Sphinx's built-in client-side search

## How these URLs map to production

This preview nests everything one level deeper than production will, because a
project repo on a personal account serves at
`<user>.github.io/<repo>/`. In production each kit gets its own repo under the
`splunk` org, so it serves one level higher:

| Preview (here) | Production (proposed) |
|---|---|
| `pking70.github.io/sdk-docs-preview/splunk-sdk-python/` | `splunk.github.io/splunk-sdk-python/` |
| `pking70.github.io/sdk-docs-preview/splunk-sdk-java/` | `splunk.github.io/splunk-sdk-java/` |
| `pking70.github.io/sdk-docs-preview/splunk-library-javalogging/` | `splunk.github.io/splunk-library-javalogging/` |
| `pking70.github.io/sdk-docs-preview/splunk-sdk-javascript/` | `splunk.github.io/splunk-sdk-javascript/` |
| `pking70.github.io/sdk-docs-preview/splunk-javascript-logging/` | `splunk.github.io/splunk-javascript-logging/` |
| `pking70.github.io/sdk-docs-preview/splunk-bunyan-logger/` | `splunk.github.io/splunk-bunyan-logger/` |

Because every kit emits only relative asset paths, the extra depth here
changes nothing — which is itself the useful result. If it renders correctly at
this depth it will render correctly at the shallower production depth.

Versioning would add one more segment, e.g.
`splunk.github.io/splunk-sdk-python/latest/` and
`splunk.github.io/splunk-sdk-python/2.1.0/`, with `latest/` as the canonical
path and older versions carrying `rel=canonical` plus `noindex`.

## What it demonstrates

**Consistent branding across three different generators.** All six kits share
one masthead definition and one set of design tokens, taken from
`@splunk/themes` at `family="prisma"`, `density="comfortable"` — the same
configuration dev.splunk.com uses. Sphinx and JavaDoc were themed by remapping
the generator's own CSS custom properties; JSDoc exposes none, so that overlay
declares the token layer itself and overrides concrete selectors.

**In-page search with no backend.** Sphinx ships `searchindex.js` and JavaDoc
ships its own client-side search index, so search works on those kits with
nothing server-side. This decouples the migration from any search-backend work.

**Version selection.** Each masthead carries a version selector. In this
preview the options point at the future production URLs and therefore dead-end;
see the note on the landing page.

## Verified live

Checked 2026-10-16 against the published site — all 200, all serving real
content rather than a fallback shell:

- landing page and all six kit entry points
- `_static/splunk-theme.css` (11 KB) and `_static/styles/furo.css` (51 KB) —
  this is the `.nojekyll` check; if Jekyll were stripping `_static/` these
  would 404 and the Python kit would render unstyled
- `searchindex.js` (44 KB) for Sphinx and `search.html` for JavaDoc, so
  in-page search works with no backend
- nested deep links three levels down, e.g. `com/splunk/Service.html` (184 KB)

## Notes

`.nojekyll` at the root is required. GitHub Pages runs Jekyll, which ignores
underscore-prefixed directories — Sphinx keeps its assets in `_static/`, so
without that file the Python kit publishes unstyled and silently.

All six kits emit only relative asset paths, so this tree works unchanged at
any URL depth. Moving it to `splunk.github.io/<repo>/` is a copy, not a
rebuild.

See `DEPLOY.md` for the full deployment notes, verification checklist, and one
pre-existing SDK content bug worth fixing.
